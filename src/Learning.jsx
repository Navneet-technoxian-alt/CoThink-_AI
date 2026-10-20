import { useId, useRef, useState } from 'react'
import { DEFAULT_PREFERENCES, STYLE_OPTIONS, TOPICS, getLesson, matchTopic, nextLevel, scoreQuiz, selectQuestions } from './learning.js'

const STORAGE_KEY = 'cothink.learning.quiz.v1'
const LESSON_KEY = 'cothink.learning.lessons.v1'
function readCompletedLessons() {
  try {
    const values = JSON.parse(localStorage.getItem(LESSON_KEY) || '[]')
    if (!Array.isArray(values) || values.some(value => typeof value !== 'string')) throw new Error('Invalid lessons')
    return { values, error: '' }
  } catch { return { values: [], error: 'Lesson progress could not be read. Completion will be tracked for this session.' } }
}
function readProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { used: {}, history: [], error: '' }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.used !== 'object' || !parsed.used || Array.isArray(parsed.used) || !Array.isArray(parsed.history) || Object.values(parsed.used).some(ids => !Array.isArray(ids) || ids.some(id => typeof id !== 'string')) || parsed.history.some(entry => !entry || typeof entry.topic !== 'string' || typeof entry.correct !== 'number' || typeof entry.total !== 'number')) throw new Error('Invalid progress')
    return { used: parsed.used, history: parsed.history, error: '' }
  } catch { return { used: {}, history: [], error: 'Saved quiz progress could not be read. You can continue in this session.' } }
}
function Diagram({ steps }) {
  const id = useId()
  return <svg viewBox="0 0 600 260" role="img" aria-labelledby={id} style={{ width: '100%', maxWidth: 650 }}>
    <title id={id}>{steps.join(' → ')}</title>
    {steps.map((step, index) => {
      const y = index * 64 + 8
      return <g key={step}><rect x="18" y={y} width="564" height="44" rx="12" fill="currentColor" opacity=".07" /><circle cx="42" cy={y + 22} r="14" fill="currentColor" opacity=".15" /><text x="42" y={y + 27} textAnchor="middle" fill="currentColor" fontSize="14">{index + 1}</text><text x="70" y={y + 27} fill="currentColor" fontSize="14">{step}</text>{index < steps.length - 1 && <path d={`M300 ${y + 46}v14m-5-5 5 5 5-5`} fill="none" stroke="currentColor" strokeWidth="2" />}</g>
    })}
  </svg>
}
export function Preferences({ preferences = DEFAULT_PREFERENCES, onChange }) {
  const id = useId()
  return <section className="panel stack" aria-labelledby={`${id}-heading`}><h2 id={`${id}-heading`}>Your learning preferences</h2><p className="muted">Shape the curated lessons around how you learn.</p><div className="form-grid">
    <label className="field">Learning level<select value={preferences.level} onChange={e => onChange({ ...preferences, level: e.target.value })}>{['Beginner', 'Intermediate', 'Advanced'].map(value => <option key={value}>{value}</option>)}</select></label>
    <label className="field">Lesson language<select value={preferences.language} onChange={e => onChange({ ...preferences, language: e.target.value })}>{['English', 'Hindi', 'Hinglish'].map(value => <option key={value}>{value}</option>)}</select></label>
  </div><fieldset className="stack"><legend>Explanation styles · choose any</legend>{STYLE_OPTIONS.map(style => <label key={style} className={`option ${(preferences.styles || []).includes(style) ? 'selected' : ''}`}><input type="checkbox" checked={(preferences.styles || []).includes(style)} onChange={e => onChange({ ...preferences, styles: e.target.checked ? [...(preferences.styles || []), style] : (preferences.styles || []).filter(item => item !== style) })} /> {style}</label>)}</fieldset></section>
}
export default function Learning({ preferences = DEFAULT_PREFERENCES, onActivity, initialTopic = '' }) {
  const [input, setInput] = useState(initialTopic)
  const [topic, setTopic] = useState(() => matchTopic(initialTopic))
  const [attempted, setAttempted] = useState(Boolean(initialTopic))
  const [completion, setCompletion] = useState(readCompletedLessons)
  const completedRef = useRef(new Set(completion.values))
  const completed = completion.values
  const lesson = getLesson(topic, preferences)
  const key = `${topic}:${preferences.level}:${preferences.language}`
  function openTopic(value) { setInput(value); setTopic(matchTopic(value)); setAttempted(true) }
  function completeLesson() {
    if (completedRef.current.has(key)) return
    completedRef.current.add(key)
    const values = [...completedRef.current]
    let error = ''
    try { localStorage.setItem(LESSON_KEY, JSON.stringify(values)) }
    catch { error = 'Lesson completion could not be saved. It is tracked for this session, but may reset after a reload.' }
    setCompletion({ values, error })
    onActivity?.({ type: 'lesson', title: topic, detail: `${preferences.level} lesson completed in ${preferences.language}` })
  }
  const labels = preferences.language === 'Hindi' ? ['सीखना शुरू करें', 'पाठ पूरा किया', 'पूरा हो गया'] : preferences.language === 'Hinglish' ? ['Seekhna shuru karo', 'Lesson complete karo', 'Complete ho gaya'] : ['Explore a topic', 'Mark lesson complete', 'Lesson completed']
  return <div className="stack"><section className="panel stack"><div className="section-heading"><h2>{labels[0]}</h2><span className="badge">Curated · offline</span></div><p className="muted">Choose one of five supported topics. Lessons are locally authored, not generated by AI.</p><form className="form-grid" onSubmit={e => { e.preventDefault(); openTopic(input) }}><label className="field">Topic<input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. machine learning or coding" /></label><button className="button" type="submit">Open lesson</button></form><div className="form-grid">{TOPICS.map(item => <button className={`button secondary ${item === topic ? 'selected' : ''}`} key={item} onClick={() => openTopic(item)}>{item}</button>)}</div>{attempted && !lesson && <p className="notice" role="status">This topic is not in our curated library yet. Please choose one of the five topics above; we won’t invent a lesson.</p>}</section>
    {completion.error && <p className="notice" role="status">{completion.error}</p>}
    {lesson && <article className="panel stack" lang={preferences.language === 'Hindi' ? 'hi' : preferences.language === 'Hinglish' ? 'hi-Latn' : 'en'}><div className="section-heading"><h2>{topic}</h2><span className="badge">{preferences.level} · {preferences.language}</span></div>{lesson.sections.map(section => <section key={section.title}><h3>{section.title}</h3><p>{section.text}</p></section>)}<section><h3>{preferences.language === 'Hindi' ? 'प्रक्रिया का चित्र' : 'The process, at a glance'}</h3><Diagram steps={lesson.diagram} /></section><button className="button" disabled={completed.includes(key)} onClick={completeLesson}>{completed.includes(key) ? labels[2] : labels[1]}</button></article>}
  </div>
}
export function Quiz({ preferences = DEFAULT_PREFERENCES, onActivity }) {
  const [progress, setProgress] = useState(readProgress)
  const [topic, setTopic] = useState(TOPICS[0])
  const [round, setRound] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const submitted = useRef(false)
  function save(next) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ used: next.used, history: next.history })); next.error = '' }
    catch { next.error = 'Progress could not be saved on this device. This session still works, but a reload may repeat questions.' }
    setProgress(next)
  }
  function start() {
    const questions = selectQuestions(topic, progress.used[topic] || [])
    const ids = questions.map(q => q.id)
    save({ ...progress, used: { ...progress.used, [topic]: [...(progress.used[topic] || []).filter(id => !ids.includes(id)), ...ids] } })
    submitted.current = false
    setRound({ questions, topic, level: preferences.level }); setAnswers({}); setResult(null); setError('')
  }
  function submit(e) {
    e.preventDefault()
    if (result || submitted.current || !round) return
    if (round.questions.some(q => answers[q.id] === undefined)) { setError('Choose an answer for every question before checking your score.'); return }
    submitted.current = true
    const scored = scoreQuiz(round.questions, answers)
    const recommended = nextLevel(round.level, scored.correct, scored.total)
    setResult({ ...scored, recommended }); setError('')
    save({ ...progress, history: [...progress.history, { topic: round.topic, correct: scored.correct, total: scored.total, level: round.level, recommended, completedAt: new Date().toISOString() }].slice(-100) })
    onActivity?.({ type: 'quiz', title: `${round.topic} quiz`, detail: `${scored.correct}/${scored.total} correct · suggested next level: ${recommended}`, score: Math.round(scored.correct / scored.total * 100) })
  }
  return <div className="stack"><section className="panel stack"><div className="section-heading"><h2>Check your understanding</h2><span className="badge">3 questions per round</span></div><p className="muted">Quizzes are in English. Lesson language preferences apply to lessons. Each topic has eight questions; fresh questions come first, then the oldest seen questions return.</p><label className="field">Quiz topic<select value={topic} disabled={Boolean(round && !result)} onChange={e => setTopic(e.target.value)}>{TOPICS.map(item => <option key={item}>{item}</option>)}</select></label><button className="button" onClick={start} disabled={Boolean(round && !result)}>{result ? 'Start another round' : 'Start quiz'}</button>{progress.error && <p className="notice" role="status">{progress.error}</p>}</section>
    {round && <form className="panel stack" onSubmit={submit}><h2>{round.topic} · {round.level} practice</h2>{round.questions.map((q, index) => <fieldset className="stack" key={q.id} disabled={Boolean(result)}><legend>{index + 1}. {q.prompt}</legend>{q.options.map((option, i) => <label className={`option ${answers[q.id] === i ? 'selected' : ''}`} key={option}><input type="radio" name={`question-${q.id}`} checked={answers[q.id] === i} onChange={() => setAnswers(previous => ({ ...previous, [q.id]: i }))} /> {option}</label>)}</fieldset>)}{error && <p role="alert" className="notice">{error}</p>}{!result && <button type="submit" className="button">Check answers</button>}</form>}
    {result && <section className="panel stack" aria-live="polite"><h2>{result.correct} / {result.total} correct</h2><p>Suggested next level: <strong>{result.recommended}</strong>. This is a simple practice heuristic, not a validated assessment. The question bank is shared across levels; use the suggested level for your next lesson.</p><h3>Mistake analysis</h3>{result.correct === result.total ? <p>No mistakes this round. Try explaining the ideas without looking at the lesson.</p> : <p>Review the explanations below, revisit the lesson, then try a fresh round.</p>}{result.results.map(q => <section key={q.id}><h3>{q.correct ? '✓ Correct' : 'Review'}: {q.prompt}</h3><p>Your answer: {q.options[q.answer]}{!q.correct && <> · Correct answer: <strong>{q.options[q.correctIndex]}</strong></>}</p><p>{q.explanation}</p></section>)}</section>}
    <section className="panel stack"><h2>Your quiz progress</h2><p className="muted">{progress.history.length} completed rounds saved (latest 100 retained). Started rounds reserve question IDs, including after a reload.</p>{TOPICS.map(item => { const entries = progress.history.filter(entry => entry.topic === item); return <p key={item}><strong>{item}:</strong> {entries.length} rounds · {entries.reduce((sum, entry) => sum + entry.correct, 0)}/{entries.reduce((sum, entry) => sum + entry.total, 0)} answers correct</p> })}</section>
  </div>
}
