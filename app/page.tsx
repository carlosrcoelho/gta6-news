import { getAllPosts } from "@/lib/posts";
import PostList from "@/app/components/PostList";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "#f5c518" }}>
          Latest Reports
        </h1>
        <p className="text-sm" style={{ color: "#6b7280" }}>
          Daily news, leaks &amp; rumors about Grand Theft Auto VI — until launch day.
        </p>
      </div>

      {/* Post list with tag filter */}
      {posts.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No reports published yet.</p>
      ) : (
        <PostList posts={posts} />
      )}

      {/* About */}
      <section
        id="about"
        className="mt-16 rounded-lg p-6"
        style={{ backgroundColor: "#0d0d14", border: "1px solid #1e1e2e" }}
      >
        <h2 className="text-xl font-black mb-3" style={{ color: "#f5c518" }}>
          About This Site
        </h2>
        <p className="text-sm mb-5" style={{ color: "#9ca3af", lineHeight: "1.8" }}>
          GTA VI Daily Report is a fan-made digest dedicated exclusively to Grand Theft Auto VI.
          Every day, a report is compiled from the most reliable sources in the gaming community —
          covering official announcements, verified leaks, community analysis, and media previews.
          No filler, no unrelated content. Just GTA VI, every single day, until it launches.
        </p>
        <div
          className="rounded p-4 text-sm"
          style={{ backgroundColor: "#111118", border: "1px solid #1e1e2e" }}
        >
          <div className="grid gap-2" style={{ gridTemplateColumns: "90px 1fr" }}>
            <span className="font-bold text-xs uppercase tracking-wider" style={{ color: "#f5c518" }}>Official</span>
            <span style={{ color: "#6b7280" }}>Rockstar Games, Social Club, Take-Two Interactive</span>

            <span className="font-bold text-xs uppercase tracking-wider" style={{ color: "#f5c518" }}>Media</span>
            <span style={{ color: "#6b7280" }}>IGN, Kotaku, Eurogamer, VGC, GameSpot, Insider Gaming</span>

            <span className="font-bold text-xs uppercase tracking-wider" style={{ color: "#f5c518" }}>Community</span>
            <span style={{ color: "#6b7280" }}>r/GTA6, r/GrandTheftAutoVI, r/GamingLeaksAndRumours</span>

            <span className="font-bold text-xs uppercase tracking-wider" style={{ color: "#f5c518" }}>Social</span>
            <span style={{ color: "#6b7280" }}>X/Twitter — verified journalists and known insiders</span>
          </div>
        </div>
        <p className="mt-4 text-xs" style={{ color: "#4b5563" }}>
          Not affiliated with Rockstar Games or Take-Two Interactive. Fan-made project.
        </p>
      </section>
    </div>
  );
}
