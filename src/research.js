export const STORAGE_KEY = 'cothink.research.v1'
export const CLASSIFICATIONS = ['Supported', 'Contradicted', 'Insufficient Evidence']
export const DECISIONS = ['Accept', 'Edit', 'Reject', 'Verify More']
export const LIMITATIONS = 'Local, user-authored research record. Classifications and confidence are user assessed, not machine verified. Excerpts are supplied by the user and are not authenticated or independently retrieved. No completeness, accuracy, or truth guarantee. Decision snapshots preserve the record at decision time; later evidence edits do not update them.'

export function safeHttpUrl(value) {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null
  } catch { return null }
}

export function newResearch(topic = '') {
  return { version: 1, hypothesis: topic, initialConfidence: 50, currentConfidence: 50, evidence: [], history: [] }
}

export function validateEvidence(evidence) {
  if (!safeHttpUrl(evidence.url)) return 'Enter a complete http:// or https:// source URL without credentials.'
  if (!evidence.title.trim() || !evidence.excerpt.trim() || !evidence.notes.trim()) return 'Add a source title, exact excerpt, and relevance notes.'
  if (!CLASSIFICATIONS.includes(evidence.classification)) return 'Choose your assessment.'
  return ''
}

export function recordDecision(record, decision, rationale, timestamp = new Date().toISOString()) {
  if (!record.hypothesis.trim() || !rationale.trim() || !DECISIONS.includes(decision)) throw new Error('A hypothesis, valid decision, and rationale are required.')
  const snapshot = structuredClone({ hypothesis: record.hypothesis, initialConfidence: record.initialConfidence, currentConfidence: record.currentConfidence, evidence: record.evidence })
  return { ...record, history: [...record.history, { decision, rationale, timestamp, snapshot }] }
}

export function buildPassport(record, exportedAt = new Date().toISOString()) {
  return structuredClone({ format: 'CoThink research passport', version: 1, exportedAt, limitations: LIMITATIONS, provenance: 'Every excerpt, source title, relevance note, assessment, and confidence value was entered by the user. Source URLs are references, not proof of verification.', ...record })
}

export function passportText(record, exportedAt) {
  const passport = buildPassport(record, exportedAt)
  const evidenceText = (items) => items.length ? items.map((e, i) => `${i + 1}. ${e.title}\nSource: ${e.url}\nUser assessment: ${e.classification}\nRecorded: ${e.createdAt || 'Not recorded'}; last edited: ${e.updatedAt || e.createdAt || 'Not recorded'}\nExact user-entered excerpt:\n${e.excerpt}\nRelevance notes: ${e.notes}`).join('\n\n') : 'No evidence recorded.'
  return `${passport.format}\nExported: ${passport.exportedAt}\n\nLIMITATIONS\n${LIMITATIONS}\n${passport.provenance}\n\nHYPOTHESIS\n${record.hypothesis || '(empty)'}\nInitial confidence: ${record.initialConfidence}%\nCurrent confidence: ${record.currentConfidence}%\n\nCURRENT EVIDENCE\n${evidenceText(record.evidence)}\n\nAPPEND-ONLY DECISION HISTORY\n${record.history.map(h => `${h.timestamp} — ${h.decision}\nRationale: ${h.rationale}\nHypothesis at decision: ${h.snapshot.hypothesis}\nConfidence at decision: ${h.snapshot.initialConfidence}% → ${h.snapshot.currentConfidence}%\nEvidence snapshot:\n${evidenceText(h.snapshot.evidence)}`).join('\n\n') || 'No decisions recorded.'}`
}

export const buildPassportText = passportText

export function loadResearch(storage, topic = '') {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY))
    const confidenceValid = n => Number.isFinite(n) && n >= 0 && n <= 100
    const evidenceValid = e => e && typeof e.id === 'string' && typeof e.title === 'string' && typeof e.excerpt === 'string' && typeof e.notes === 'string' && safeHttpUrl(e.url) && CLASSIFICATIONS.includes(e.classification)
    const snapshotValid = s => s && typeof s.hypothesis === 'string' && confidenceValid(s.initialConfidence) && confidenceValid(s.currentConfidence) && Array.isArray(s.evidence) && s.evidence.every(evidenceValid)
    if (saved?.version === 1 && snapshotValid(saved) && Array.isArray(saved.history) && saved.history.every(h => h && DECISIONS.includes(h.decision) && typeof h.rationale === 'string' && typeof h.timestamp === 'string' && Number.isFinite(Date.parse(h.timestamp)) && snapshotValid(h.snapshot))) return saved
  } catch { /* Storage may be disabled or contain invalid JSON. */ }
  return newResearch(topic)
}
