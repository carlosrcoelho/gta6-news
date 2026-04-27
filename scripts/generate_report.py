import os
from datetime import date, datetime, timezone
import anthropic
from tavily import TavilyClient

TODAY = date.today()
TODAY_SLUG = TODAY.strftime("%Y-%m-%d")
TODAY_LONG = TODAY.strftime("%B %d, %Y")

SEARCH_QUERIES = [
    f"GTA VI news {TODAY_SLUG} official Rockstar",
    f"GTA VI leak rumor {TODAY.strftime('%B %Y')}",
    "GTA VI reddit community latest discussion",
    "Grand Theft Auto VI release date trailer announcement",
    "GTA VI Take-Two Interactive update",
]

SYSTEM_PROMPT = """You are a GTA VI news reporter. Compile a structured daily report in English based on web search results.

RULES:
- Only report on GTA VI / Grand Theft Auto VI. Ignore all other games.
- Clearly distinguish confirmed official news from unverified leaks/rumors.
- Include publication date and source URL for every item.
- Be factual and concise.
- If a section has no news, write "No updates today."

OUTPUT FORMAT (strict Markdown, no extra commentary before or after):

## Official News
[Official announcements from Rockstar Games or Take-Two Interactive]

## Leaks & Rumors
> Items in this section are **unverified**. Treat with appropriate skepticism.

[Leaks and credible rumors with source links]

## Community Highlights
[Notable Reddit/Twitter/YouTube discussions or fan discoveries]

## Sources
[Numbered list with full URLs]

---
*Disclaimer: Leaks and rumors are unverified by Rockstar Games or Take-Two Interactive.*"""


def search_news() -> list[dict]:
    client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
    seen_urls: set[str] = set()
    results = []

    for query in SEARCH_QUERIES:
        response = client.search(
            query,
            max_results=5,
            search_depth="advanced",
            include_answer=False,
        )
        for r in response.get("results", []):
            if r["url"] not in seen_urls:
                seen_urls.add(r["url"])
                results.append(r)

    return results


def generate_report(search_results: list[dict]) -> str:
    client = anthropic.Anthropic()

    search_text = "\n\n---\n\n".join(
        f"Title: {r['title']}\n"
        f"URL: {r['url']}\n"
        f"Published: {r.get('published_date', 'unknown')}\n"
        f"Content: {r['content'][:800]}"
        for r in search_results
    )

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=3000,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[
            {
                "role": "user",
                "content": (
                    f"Today is {TODAY_LONG}.\n\n"
                    f"Search results:\n\n{search_text}\n\n"
                    "Generate the daily GTA VI report."
                ),
            }
        ],
    )

    return message.content[0].text


def save_report(content: str) -> None:
    posts_dir = os.path.join(os.path.dirname(__file__), "..", "posts")
    os.makedirs(posts_dir, exist_ok=True)

    filepath = os.path.join(posts_dir, f"{TODAY_SLUG}.md")

    if os.path.exists(filepath):
        print(f"Report for {TODAY_SLUG} already exists, skipping.")
        return

    frontmatter = (
        f"---\n"
        f'title: "GTA VI Daily Report — {TODAY_LONG}"\n'
        f'date: "{TODAY_SLUG}"\n'
        f'excerpt: "Daily coverage of the latest GTA VI news, leaks, and community highlights."\n'
        f"---\n\n"
        f"# GTA VI Daily Report — {TODAY_LONG}\n\n"
    )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(frontmatter + content)

    print(f"Report saved: {filepath}")


if __name__ == "__main__":
    ts = datetime.now(timezone.utc).isoformat()
    print(f"[{ts}] Starting GTA VI report generation for {TODAY_SLUG}...")

    print("Searching the web...")
    results = search_news()
    print(f"Found {len(results)} unique results.")

    print("Generating report with Claude...")
    report_content = generate_report(results)

    print("Saving report...")
    save_report(report_content)

    print("Done!")
