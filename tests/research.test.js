import test from 'node:test'
import assert from 'node:assert/strict'
import { newResearch, safeHttpUrl, validateEvidence, recordDecision, buildPassport, passportText, loadResearch } from '../src/research.js'

const evidence = { id: 'one', title: 'Original source', url: 'https://example.org/paper', excerpt: '  Exact\nwords & punctuation.  ', notes: 'Relevant but limited.', classification: 'Insufficient Evidence' }
test('empty record contains no fabricated evidence; unsafe URLs rejected', () => {
  assert.deepEqual(newResearch().evidence, [])
  for (const url of ['javascript:alert(1)', 'data:text/html,x', '/relative', 'https://user:pass@example.org']) assert.equal(safeHttpUrl(url), null)
  assert.equal(safeHttpUrl('https://example.org'), 'https://example.org/')
  assert.equal(validateEvidence(evidence), '')
  assert.ok(validateEvidence({ ...evidence, excerpt: ' ' }))
})
test('decision snapshots survive evidence edits and removal', () => {
  const record = { ...newResearch('A testable claim'), evidence: [structuredClone(evidence)] }
  const decided = recordDecision(record, 'Verify More', 'Need independent replication.', '2026-01-01T00:00:00Z')
  decided.evidence[0].excerpt = 'changed'
  decided.evidence = []
  assert.equal(decided.history[0].snapshot.evidence[0].excerpt, evidence.excerpt)
  const next = recordDecision(decided, 'Reject', 'New reasoning.', '2026-01-02T00:00:00Z')
  assert.equal(next.history.length, 2)
  assert.deepEqual(next.history[0], decided.history[0])
  assert.throws(() => recordDecision(record, 'Accept', ' '))
})
test('exports retain exact excerpts, provenance, limitations and historical evidence', () => {
  const record = recordDecision({ ...newResearch('Claim'), evidence: [evidence] }, 'Accept', 'Tentatively supported.')
  const passport = buildPassport(record, 'fixed-time')
  assert.equal(passport.exportedAt, 'fixed-time')
  assert.equal(passport.evidence[0].excerpt, evidence.excerpt)
  assert.match(passport.limitations, /not machine verified/)
  assert.match(passport.provenance, /entered by the user/)
  assert.ok(passportText(record).includes(evidence.excerpt))
  passport.evidence[0].excerpt = 'export mutation'
  assert.equal(record.evidence[0].excerpt, evidence.excerpt)
})
test('storage recovers invalid records and restores complete valid state', () => {
  assert.deepEqual(loadResearch({ getItem: () => '{broken' }, 'Topic'), newResearch('Topic'))
  const record = recordDecision({ ...newResearch('Persist me'), evidence: [evidence] }, 'Edit', 'Narrow the claim.')
  assert.deepEqual(loadResearch({ getItem: () => JSON.stringify(record) }), record)
  record.history[0].snapshot.evidence = [null]
  assert.deepEqual(loadResearch({ getItem: () => JSON.stringify(record) }), newResearch())
})
