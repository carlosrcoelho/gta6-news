import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = getAllPosts();
  const found = posts.find((p) => p.slug === slug);
  if (!found) return {};
  return { title: found.title, description: found.excerpt };
}

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = getAllPosts();
  const found = posts.find((p) => p.slug === slug);
  if (!found) notFound();

  const post = await getPostBySlug(slug);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm"
          style={{ color: "#6b7280", textDecoration: "none" }}
        >
          ← All Reports
        </Link>
      </div>

      <div
        className="rounded-lg p-6 mb-6"
        style={{ backgroundColor: "#111118", border: "1px solid #1e1e2e" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-black" style={{ color: "#f5c518" }}>
            {post.title}
          </h1>
          <span
            className="text-xs font-mono px-3 py-1 rounded"
            style={{ backgroundColor: "#1e1e2e", color: "#f5c518" }}
          >
            {post.date}
          </span>
        </div>
        {post.excerpt && (
          <p className="mt-2 text-sm" style={{ color: "#6b7280" }}>
            {post.excerpt}
          </p>
        )}
      </div>

      <article
        className="prose-gta rounded-lg p-6"
        style={{ backgroundColor: "#0d0d14", border: "1px solid #1e1e2e" }}
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <div className="mt-6">
        <Link
          href="/"
          className="text-sm"
          style={{ color: "#6b7280", textDecoration: "none" }}
        >
          ← Back to all reports
        </Link>
      </div>
    </div>
  );
}
