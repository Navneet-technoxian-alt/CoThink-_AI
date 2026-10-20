import test from 'node:test'
import assert from 'node:assert/strict'
import { FEED_CATEGORIES, normalizeFeedItem, fetchFeed } from '../src/feeds.js'

test('feed item rejects unsafe links and never invents publication dates', () => {
  assert.equal(normalizeFeedItem({ title: 'Unsafe', url: 'javascript:alert(1)' }), null)
  assert.equal(normalizeFeedItem({ title: 'Reference', url: 'https://example.org', publishedAt: 'bad' }).publishedAt, null)
  assert.equal(FEED_CATEGORIES.length, 6)
})
test('network and HTTP failures provide explicitly undated offline catalog references', async () => {
  for (const fetchImpl of [async () => { throw new Error('CORS') }, async () => ({ ok: false, status: 503 })]) {
    const result = await fetchFeed(FEED_CATEGORIES[0], { fetchImpl, now: () => 'attempt-time' })
    assert.equal(result.mode, 'offline')
    assert.equal(result.retrievedAt, null)
    assert.equal(result.attemptedAt, 'attempt-time')
    assert.equal(result.items[0].publishedAt, null)
    assert.ok(result.items[0].catalogDate)
  }
})
test('successful retrieval timestamp remains distinct from publisher date', async () => {
  const result = await fetchFeed(FEED_CATEGORIES[0], { fetchImpl: async () => ({ ok: true, text: async () => '<rss/>' }), parse: () => [{ title: 'Title', publishedAt: 'older-date' }], now: () => 'retrieval-time' })
  assert.equal(result.mode, 'live')
  assert.equal(result.retrievedAt, 'retrieval-time')
  assert.equal(result.items[0].publishedAt, 'older-date')
})
test('timeout aborts native request and produces offline result', async () => {
  let aborted = false
  const result = await fetchFeed(FEED_CATEGORIES[0], { timeoutMs: 5, fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => { aborted = true; reject(new Error('aborted')) })) })
  assert.equal(aborted, true)
  assert.equal(result.mode, 'offline')
  assert.match(result.error, /timed out/)
})

test('parser failures fall back instead of presenting an empty live feed', async () => {
  const result = await fetchFeed(FEED_CATEGORIES[1], { fetchImpl: async () => ({ ok: true, text: async () => 'invalid XML' }), parse: () => { throw new Error('Invalid XML') } })
  assert.equal(result.mode, 'offline')
  assert.equal(result.items[0].publishedAt, null)
})

test('caller cancellation propagates rather than showing stale fallback results', async () => {
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(fetchFeed(FEED_CATEGORIES[0], { signal: controller.signal, fetchImpl: async (_url, { signal }) => { assert.equal(signal.aborted, true); throw new Error('cancelled') } }), /cancelled/)
})
