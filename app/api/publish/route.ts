import { NextRequest, NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";

const TAG_RULES: { tag: string; pattern: RegExp }[] = [
  { tag: "official",     pattern: /\b(rockstar|official|announcement|confirmed|take-two)\b/i },
  { tag: "leak",         pattern: /\b(leak|leaked|insider|datamine)\b/i },
  { tag: "gameplay",     pattern: /\b(gameplay|trailer|footage|screenshot|demo)\b/i },
  { tag: "rumor",        pattern: /\b(rumou?r|allegedly|reportedly|unconfirmed)\b/i },
  { tag: "release date", pattern: /\b(release date|launch date|launch window)\b/i },
  { tag: "online",       pattern: /\b(online|multiplayer|gta online)\b/i },
];

function extractTitle(md: string, dateStr: string): string {
  const match = md.match(/^#\s+(.+)/m);
  if (match) return match[1].trim();
  const d = new Date(dateStr + "T12:00:00");
  return `GTA VI Daily Report — ${d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
}

function extractExcerpt(md: string): string {
  const lines = md.split("\n");
  let afterHeading = false;
  for (const line of lines) {
    if (!afterHeading && /^#/.test(line)) { afterHeading = true; continue; }
    const clean = line.replace(/^#+\s+/, "").replace(/\*\*/g, "").replace(/\*/g, "").trim();
    if (afterHeading && clean.length > 30 && !clean.startsWith("#") && !clean.startsWith("-")) {
      return clean.slice(0, 220) + (clean.length > 220 ? "..." : "");
    }
  }
  return "Daily GTA VI news report.";
}

function detectTags(content: string): string[] {
  return TAG_RULES.filter((r) => r.pattern.test(content)).map((r) => r.tag);
}

function buildMarkdownPost(title: string, date: string, excerpt: string, tags: string[], content: string): string {
  const tagsYaml = tags.length ? `\ntags: [${tags.map((t) => `"${t}"`).join(", ")}]` : "";
  return `---\ntitle: "${title}"\ndate: "${date}"\nexcerpt: "${excerpt.replace(/"/g, "'")}"\n${tagsYaml}\n---\n\n${content.trim()}\n`;
}

async function githubGetFile(owner: string, repo: string, filePath: string, token: string) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
    headers: { Authorization: `token ${token}`, Accept: "application/vnd.github.v3+json" },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${res.status}`);
  return res.json() as Promise<{ content: string; sha: string }>;
}

async function githubPutFile(
  owner: string, repo: string, filePath: string,
  content: string, sha: string | undefined,
  message: string, token: string,
) {
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function POST(request: NextRequest) {
  // Auth
  const secret = request.headers.get("x-publish-secret") ?? request.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.PUBLISH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse payload — Claude routine webhooks can send different shapes
  let markdownContent = "";
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json() as Record<string, unknown>;
    markdownContent =
      (body.output as string) ??
      (body.content as string) ??
      (body.message as string) ??
      (body.text as string) ??
      "";
  } else {
    markdownContent = await request.text();
  }

  if (!markdownContent.trim()) {
    return NextResponse.json({ error: "No content in payload" }, { status: 400 });
  }

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return NextResponse.json({ error: "GitHub env vars not configured" }, { status: 500 });
  }

  const today = new Date().toISOString().split("T")[0];
  const title = extractTitle(markdownContent, today);
  const excerpt = extractExcerpt(markdownContent);
  const tags = detectTags(markdownContent);
  const filePath = `posts/${today}.md`;
  const fileContent = buildMarkdownPost(title, today, excerpt, tags, markdownContent);

  try {
    const existing = await githubGetFile(GITHUB_OWNER, GITHUB_REPO, filePath, GITHUB_TOKEN);
    await githubPutFile(
      GITHUB_OWNER, GITHUB_REPO,
      filePath, fileContent,
      existing?.sha,
      `report: ${today} (via Claude routine)`,
      GITHUB_TOKEN,
    );

    return NextResponse.json({ ok: true, slug: today, title, tags });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[publish]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
