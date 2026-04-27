import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "#f5c518" }}>
          Latest Reports
        </h1>
        <p className="text-sm" style={{ color: "#6b7280" }}>
          Daily news, leaks &amp; rumors about Grand Theft Auto VI
        </p>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No reports published yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/report/${post.slug}`}
              className="block rounded-lg p-5 transition-colors"
              style={{
                backgroundColor: "#111118",
                border: "1px solid #1e1e2e",
                textDecoration: "none",
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-semibold" style={{ color: "#e2e2e2" }}>
                  {post.title}
                </h2>
                <span
                  className="text-xs whitespace-nowrap font-mono px-2 py-1 rounded"
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
