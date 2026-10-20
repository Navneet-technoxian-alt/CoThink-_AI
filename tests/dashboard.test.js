import test from 'node:test'
import assert from 'node:assert/strict'
import { getBrowserStorage, readActivity, readProgress, writeJson } from '../src/dashboard.js'

function storage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
}

test('dashboard progress only counts valid saved lessons and quiz results', () => {
  const result = readProgress(storage({
    'cothink.learning.lessons.v1': JSON.stringify(['Machine learning', 12, 'Generative AI']),
    'cothink.learning.quiz.v1': JSON.stringify({ history: [{ correct: 3, total: 3 }, { correct: 1, total: 2 }, { correct: 10, total: 0 }, { correct: 5, total: 4 }] }),
  }))
  assert.deepEqual(result, { lessons: 2, quizzes: 2, score: 75 })
})

test('malformed dashboard storage falls back to empty, non-fabricated state', () => {
  const result = readProgress(storage({ 'cothink.learning.quiz.v1': '{bad json' }))
  assert.deepEqual(result, { lessons: 0, quizzes: 0, score: 0 })
  assert.deepEqual(readActivity(storage({ 'cothink.activity.v1': JSON.stringify([{ title: 'ok', detail: 'done', at: '2026-10-20' }, { title: 5 }]) })), [{ title: 'ok', detail: 'done', at: '2026-10-20' }])
})

test('writeJson reports storage failures without throwing', () => {
  const failing = { setItem: () => { throw new Error('full') } }
  assert.equal(writeJson(failing, 'key', { value: 1 }), false)
})

test('browser storage helper is safe outside a browser', () => {
  const storage = getBrowserStorage()
  assert.equal(storage.getItem('missing'), null)
})
