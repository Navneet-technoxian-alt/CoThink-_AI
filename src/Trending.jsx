import { useEffect, useState } from 'react'
import { FEED_CATEGORIES, fetchFeed } from './feeds.js'

export default function Trending({ onLearn, onResearch }) {
  const [category, setCategory] = useState(FEED_CATEGORIES[0])
  const [refresh, setRefresh] = useState(0)
  const [result, setResult] = useState(null)
  useEffect(() => {
    const controller = new AbortController()
    fetchFeed(category, { signal: controller.signal }).then(data => { if (!controller.signal.aborted) setResult(data) }).catch(() => {})
    return () => controller.abort()
  }, [category, refresh])
  const select = next => { setResult(null); setCategory(next); setRefresh(n => n + 1) }
  return <section className="stack" aria-labelledby="topics-heading">
    <header><span className="badge">Explore & question</span><h1 id="topics-heading">Follow your curiosity.</h1><p className="muted">Browse publisher feeds, then turn a topic into a learning session or research question.</p></header>
    <div className="section-heading"><div role="group" aria-label="Topic categories">{FEED_CATEGORIES.map(item => <button key={item.id} className={`option ${item.id === category.id ? 'selected' : ''}`} aria-pressed={item.id === category.id} onClick={() => select(item)}>{item.label}</button>)}</div><button className="button secondary" onClick={() => { setResult(null); setRefresh(n => n + 1) }}>Refresh feed</button></div>
    <p className="muted">Requested source: <a href={category.url} target="_blank" rel="noopener noreferrer">{category.source} RSS</a>. Direct browser fetch; no proxy or AI-generated news. Categories are editorial groupings; publisher entries may cover broader topics.</p>
    {!result ? <p className="notice" role="status">Loading {category.label}…</p> : <>
      <div className="notice" role="status">{result.mode === 'live' ? <><strong>Publisher feed retrieved</strong><p>Retrieved: {new Date(result.retrievedAt).toLocaleString()}. This is retrieval time, not publication time.</p></> : <><strong>Offline reference · not live news</strong><p>{result.error}</p><p>Retrieval attempt: {new Date(result.attemptedAt).toLocaleString()}. The reference below is an undated curated resource, not a current feed item.</p></>}</div>
      <div className="grid-two">{result.items.map((item, index) => <article className="panel stack" key={`${item.url}-${index}`}><span className="badge">{result.mode === 'live' ? item.source : 'Curated reference · offline'}</span><h2><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a></h2><p className="muted">Source: {item.source}</p><p className="muted">{result.mode === 'offline' ? `Publication date: not supplied. Reference catalog date: ${item.catalogDate} (not a publication date).` : item.publishedAt ? `Publisher-listed date: ${new Date(item.publishedAt).toLocaleString()}` : 'Publication date: not supplied by source.'}</p><div><button className="button" onClick={() => onLearn?.(item.title)}>Learn this topic</button> <button className="button secondary" onClick={() => onResearch?.(item.title)}>Research this topic</button></div></article>)}</div>
    </>}
  </section>
}
