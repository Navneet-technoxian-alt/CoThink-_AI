export const ACTIVITY_KEY = 'cothink.activity.v1'
export const PREFERENCES_KEY = 'cothink.preferences.v1'
export const QUIZ_KEY = 'cothink.learning.quiz.v1'
export const LESSON_KEY = 'cothink.learning.lessons.v1'

export function getBrowserStorage() {
  if (typeof window === 'undefined') return { getItem: () => null, setItem: () => {} }
  try { return window.localStorage }
  catch { return { getItem: () => null, setItem: () => { throw new Error('Browser storage is unavailable.') } } }
}

function readJson(storage, key, fallback) {
  try {
    const value = JSON.parse(storage.getItem(key) || 'null')
    return value === null ? fallback : value
  } catch {
    return fallback
  }
}

export function readActivity(storage) {
  const value = readJson(storage, ACTIVITY_KEY, [])
  if (!Array.isArray(value)) return []
  return value.filter(item => item && typeof item === 'object' && typeof item.title === 'string' && typeof item.detail === 'string' && typeof item.at === 'string')
}

export function readProgress(storage) {
  const lessons = readJson(storage, LESSON_KEY, [])
  const quiz = readJson(storage, QUIZ_KEY, {})
  const lessonCount = Array.isArray(lessons) ? lessons.filter(value => typeof value === 'string').length : 0
  const history = Array.isArray(quiz?.history) ? quiz.history.filter(entry => Number.isFinite(entry?.correct) && Number.isFinite(entry?.total) && entry.total > 0 && entry.correct >= 0 && entry.correct <= entry.total) : []
  const score = history.length ? Math.round(history.reduce((sum, entry) => sum + (entry.correct / entry.total) * 100, 0) / history.length) : 0
  return { lessons: lessonCount, quizzes: history.length, score }
}

export function writeJson(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
