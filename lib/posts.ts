import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

const TAG_RULES: { tag: string; pattern: RegExp }[] = [
  { tag: 'official',     pattern: /\b(rockstar|official|announcement|confirmed|take-two)\b/i },
  { tag: 'leak',         pattern: /\b(leak|leaked|insider|datamine)\b/i },
  { tag: 'gameplay',     pattern: /\b(gameplay|trailer|footage|screenshot|demo)\b/i },
  { tag: 'rumor',        pattern: /\b(rumou?r|allegedly|reportedly|unconfirmed)\b/i },
  { tag: 'release date', pattern: /\b(release date|launch date|launch window|november)\b/i },
  { tag: 'online',       pattern: /\b(online|multiplayer|gta online)\b/i },
]

function detectTags(content: string): string[] {
  return TAG_RULES.filter((r) => r.pattern.test(content)).map((r) => r.tag)
}

export interface PostMeta {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
}

export interface Post extends PostMeta {
  contentHtml: string
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) return []

  const fileNames = fs.readdirSync(postsDirectory)
  const posts = fileNames
    .filter((f) => f.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      return {
        slug,
        title: data.title as string,
        date: data.date as string,
        excerpt: data.excerpt as string,
        tags: (data.tags as string[] | undefined) ?? detectTags(fileContents),
      }
    })

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const processed = await remark().use(html).process(content)
  const contentHtml = processed.toString()

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    excerpt: data.excerpt as string,
    contentHtml,
  }
}
