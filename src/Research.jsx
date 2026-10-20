import { useEffect, useState } from 'react'
import { STORAGE_KEY, CLASSIFICATIONS, DECISIONS, LIMITATIONS, loadResearch, newResearch, validateEvidence, recordDecision, buildPassport, passportText, safeHttpUrl } from './research.js'

const blankEvidence = () => ({ title: '', url: '', excerpt: '', notes: '', classification: 'Insufficient Evidence' })

export default function Research({ onActivity, initialTopic = '' }) {
  const [record, setRecord] = useState(() => {
    try { return loadResearch(window.localStorage, initialTopic) }
    catch { return newResearch(initialTopic) }
  })
  const [draft, setDraft] = useState(blankEvidence)
  const [editing, setEditing] = useState(null)
  const [decision, setDecision] = useState('Verify More')
  const [rationale, setRationale] = useState('')
  const [error, setError] = useState('')
  const [storageError, setStorageError] = useState('')
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record)); setStorageError('') }
    catch { setStorageError('Browser storage is unavailable or full. Changes are only in memory; export a passport to keep them.') }
  }, [record])
  const update = (key, value) => setRecord(r => ({ ...r, [key]: value }))
  const saveEvidence = event => {
    event.preventDefault()
    const problem = validateEvidence(draft)
    if (problem) { setError(problem); return }
    const timestamp = new Date().toISOString()
    const item = { ...draft, url: safeHttpUrl(draft.url), id: editing || crypto.randomUUID(), createdAt: draft.createdAt || timestamp, updatedAt: timestamp }
    setRecord(r => ({ ...r, evidence: editing ? r.evidence.map(e => e.id === editing ? item : e) : [...r.evidence, item] }))
    setDraft(blankEvidence()); setEditing(null); setError('')
    onActivity?.('Research evidence saved')
  }
  const decide = event => {
    event.preventDefault()
    try { setRecord(recordDecision(record, decision, rationale)); setRationale(''); setError(''); onActivity?.(`Research decision: ${decision}`) }
    catch (err) { setError(err.message) }
  }
  const download = format => {
    const blob = new Blob([format === 'json' ? JSON.stringify(buildPassport(record), null, 2) : passportText(record)], { type: format === 'json' ? 'application/json' : 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a'); link.href = url; link.download = `cothink-research-passport.${format}`; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    onActivity?.('Research passport exported')
  }
  return <section className="stack" aria-labelledby="research-heading">
    <header><span className="badge">Evidence workspace</span><h1 id="research-heading">Think it through. Leave a trail.</h1><p className="muted">Build a hypothesis, assess your sources, and keep a record of how your thinking changes.</p></header>
    <p className="notice">Your assessments, not a fact-checker. Nothing here is machine verified. Data stays in this browser; exports let you keep a copy.</p>
    {storageError && <p role="alert" className="notice">{storageError}</p>}
    {error && <p role="alert" className="notice">{error}</p>}
    <div className="panel stack">
      <h2>Your hypothesis</h2>
      {initialTopic && initialTopic !== record.hypothesis && <button className="button secondary" onClick={() => update('hypothesis', initialTopic)}>Use selected topic: {initialTopic}</button>}
      <label className="field">Claim to investigate<textarea value={record.hypothesis} onChange={e => update('hypothesis', e.target.value)} placeholder="What specific claim do you want to examine?" /></label>
      <div className="grid-two">{['initialConfidence', 'currentConfidence'].map(key => <label key={key} className="field">{key === 'initialConfidence' ? 'Initial' : 'Current'} confidence: {record[key]}%<input type="range" min="0" max="100" value={record[key]} onChange={e => update(key, Number(e.target.value))} /></label>)}</div>
      <p className="muted">Confidence is your subjective estimate, not a measured probability. Decision snapshots preserve the values at that time.</p>
    </div>
    <form className="panel stack" onSubmit={saveEvidence}>
      <h2>{editing ? 'Edit evidence' : 'Add a source'}</h2>
      <div className="form-grid"><label className="field">Source title<input required value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></label><label className="field">Source URL<input required type="url" placeholder="https://…" value={draft.url} onChange={e => setDraft({ ...draft, url: e.target.value })} /></label></div>
      <label className="field">Exact excerpt you read<textarea required value={draft.excerpt} onChange={e => setDraft({ ...draft, excerpt: e.target.value })} placeholder="Paste the source’s exact words. We preserve your input without rewriting it." /></label>
      <label className="field">Relevance and caveats<textarea required value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} placeholder="How does this relate to the claim? What remains uncertain?" /></label>
      <label className="field">Your assessment of the claim<select value={draft.classification} onChange={e => setDraft({ ...draft, classification: e.target.value })}>{CLASSIFICATIONS.map(c => <option key={c}>{c}</option>)}</select></label>
      <div><button className="button" type="submit">{editing ? 'Save evidence edit' : 'Add evidence'}</button>{editing && <button type="button" className="button secondary" onClick={() => { setEditing(null); setDraft(blankEvidence()) }}>Cancel edit</button>}</div>
    </form>
    <div className="stack"><h2>Evidence ledger · {record.evidence.length}</h2>{!record.evidence.length && <div className="panel"><h3>No evidence yet</h3><p className="muted">Start with a source you have actually read. Add its URL, an exact excerpt, and why it matters. An empty ledger is better than invented support.</p></div>}
      {record.evidence.map(e => <article className="panel stack" key={e.id}><a href={safeHttpUrl(e.url) || undefined} target="_blank" rel="noopener noreferrer">{e.title}</a><span className="badge">User assessed: {e.classification}</span><blockquote style={{ whiteSpace: 'pre-wrap' }}>{e.excerpt}</blockquote><p>{e.notes}</p><small className="muted">User-entered excerpt · added {e.createdAt} · last edited {e.updatedAt}</small><div><button className="button secondary" onClick={() => { setDraft({ ...e }); setEditing(e.id) }}>Edit evidence</button><button className="button secondary" onClick={() => { update('evidence', record.evidence.filter(item => item.id !== e.id)); if (editing === e.id) { setEditing(null); setDraft(blankEvidence()) } }}>Remove evidence</button></div></article>)}
    </div>
    <form className="panel stack" onSubmit={decide}><h2>Record a decision</h2><p className="muted">Every decision saves an immutable copy of the hypothesis, confidence, and evidence. “Edit” records your decision to revise; change the hypothesis above when ready.</p><label className="field">Decision<select value={decision} onChange={e => setDecision(e.target.value)}>{DECISIONS.map(d => <option key={d}>{d}</option>)}</select></label><label className="field">Rationale<textarea required value={rationale} onChange={e => setRationale(e.target.value)} /></label><button className="button" type="submit">Save decision snapshot</button></form>
    <div className="panel stack"><h2>Decision history</h2>{!record.history.length && <p className="muted">No decisions recorded. You can choose “Verify More” while questions remain.</p>}{record.history.map((h, i) => <details key={`${h.timestamp}-${i}`}><summary>{h.decision} · {new Date(h.timestamp).toLocaleString()}</summary><p>{h.rationale}</p><p>Hypothesis: {h.snapshot.hypothesis}</p><p>Confidence: {h.snapshot.initialConfidence}% → {h.snapshot.currentConfidence}%</p><p className="muted">Evidence at this decision: {h.snapshot.evidence.length} sources. Later edits and removals do not change this snapshot.</p>{h.snapshot.evidence.map((e, n) => <div key={n}><a href={safeHttpUrl(e.url) || undefined} target="_blank" rel="noopener noreferrer">{e.title}</a><p>User assessed: {e.classification}</p><blockquote style={{ whiteSpace: 'pre-wrap' }}>{e.excerpt}</blockquote><p>{e.notes}</p></div>)}</details>)}</div>
    <div className="panel stack"><h2>Your research passport</h2><p className="muted">{LIMITATIONS}</p><div><button className="button" onClick={() => download('txt')}>Download TXT</button> <button className="button secondary" onClick={() => download('json')}>Download JSON</button></div></div>
  </section>
}
