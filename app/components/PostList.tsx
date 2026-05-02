"use client";

import Link from "next/link";
import { useState } from "react";
import type { PostMeta } from "@/lib/posts";

const PILL_BASE: React.CSSProperties = {
  fontSize: "0.7rem",
  padding: "4px 12px",
  borderRadius: "99px",
  border: "1px solid #2a2a3e",
  background: "#111118",
  color: "#6b7280",
  cursor: "pointer",
  fontWeight: 600,
  letterSpacing: "0.6px",
  textTransform: "uppercase" as const,
  transition: "all 0.15s",
};

const PILL_ACTIVE: React.CSSProperties = {
  ...PILL_BASE,
  background: "#f5c518",
  border: "1px solid #f5c518",
  color: "#0a0a0f",
};

export default function PostList({ posts }: { posts: PostMeta[] }) {
  const [activeTag, setActiveTag] = useState("all");

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();
  const filtered =
    activeTag === "all" ? posts : posts.filter((p) => p.tags.includes(activeTag));

  return (
    <div>
      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-xs self-center" style={{ color: "#4b5563" }}>
            Filter:
          </span>
          {["all", ...allTags].map((tag) => (
            <button
              key={tag}
              style={tag === activeTag ? PILL_ACTIVE : PILL_BASE}
              onClick={() => setActiveTag(tag)}
            >
              {tag === "all" ? "All" : tag}
            </button>
          ))}
        </div>
      )}

      {/* Post list */}
      {filtered.length === 0 ? (
        <div style={{ color: "#6b7280" }}>
          <p>No reports tagged &ldquo;{activeTag}&rdquo;.</p>
          <button
            style={{ ...PILL_BASE, marginTop: "12px" }}
            onClick={() => setActiveTag("all")}
          >
            Show all
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((post) => (
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
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: "0.65rem",
                        padding: "2px 8px",
                        borderRadius: "99px",
                        background: "#1e1e2e",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
