import { safeHttpUrl } from './research.js'

export const CATALOG_DATE = '2026-10-20'
export const FEED_CATEGORIES = [
  { id: 'ai', label: 'AI research / news', source: 'MIT News · Artificial intelligence', url: 'https://news.mit.edu/rss/topic/artificial-intelligence2', reference: 'https://news.mit.edu/topic/artificial-intelligence2' },
  { id: 'education', label: 'AI education', source: 'Google Research', url: 'https://research.google/blog/rss/', reference: 'https://developers.google.com/machine-learning/crash-course' },
  { id: 'tools', label: 'Developer tools', source: 'GitHub Blog', url: 'https://github.blog/feed/', reference: 'https://docs.github.com/' },
  { id: 'security', label: 'Cybersecurity', source: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', reference: 'https://www.cisa.gov/secure-our-world' },
  { id: 'science', label: 'Science / general knowledge', source: 'NASA', url: 'https://www.nasa.gov/feed/', reference: 'https://science.nasa.gov/' },
  { id: 'programming', label: 'Programming', source: 'Mozilla Hacks', url: 'https://hacks.mozilla.org/feed/', reference: 'https://developer.mozilla.org/en-US/docs/Learn_web_development' },
]
export const categories = FEED_CATEGORIES

export function normalizeFeedItem({ title, url, publishedAt, source }) {
  const safeUrl = safeHttpUrl(url)
  if (!title?.trim() || !safeUrl) return null
  const parsed = publishedAt ? new Date(publishedAt) : null
  return { title: title.trim(), url: safeUrl, source, publishedAt: parsed && Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null }
}

export function parseFeed(xml, source, Parser = globalThis.DOMParser) {
  if (!Parser) throw new Error('XML parsing is unavailable in this environment.')
  const document = new Parser().parseFromString(xml, 'application/xml')
  if (document.querySelector('parsererror')) throw new Error('The source returned invalid XML.')
  const items = [...document.querySelectorAll('item, entry')].map(node => {
    const link = node.querySelector('link[rel="alternate"]') || node.querySelector('link:not([rel="self"])')
    return normalizeFeedItem({ title: node.querySelector('title')?.textContent, url: link?.getAttribute('href') || link?.textContent, publishedAt: node.querySelector('pubDate, published')?.textContent, source })
  }).filter(Boolean)
  if (!items.length) throw new Error('The feed contained no usable entries.')
  return items.slice(0, 12)
}

export function offlineReference(category) {
  return { title: `${category.label}: curated learning reference`, url: category.reference, source: new URL(category.reference).hostname, publishedAt: null, catalogDate: CATALOG_DATE }
}

export async function fetchFeed(category, { fetchImpl = globalThis.fetch, timeoutMs = 8000, signal, parse = parseFeed, now = () => new Date().toISOString() } = {}) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (signal?.aborted) controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(abort, timeoutMs)
  try {
    const response = await fetchImpl(category.url, { signal: controller.signal, headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' } })
    if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}.`)
    const items = parse(await response.text(), category.source)
    return { mode: 'live', items, retrievedAt: now(), attemptedAt: null, error: null }
  } catch (error) {
    if (signal?.aborted) throw error
    return { mode: 'offline', items: [offlineReference(category)], retrievedAt: null, attemptedAt: now(), error: controller.signal.aborted ? 'The feed request timed out.' : 'The feed could not be retrieved directly. The source may block browser requests (CORS), be unavailable, or you may be offline.' }
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort) }
}
