import test from 'node:test'
import assert from 'node:assert/strict'
import { TOPICS, QUESTION_BANK, matchTopic, selectQuestions, scoreQuiz, nextLevel, getLesson } from '../src/learning.js'

test('topic matching accepts supported aliases and rejects unsupported requests', () => {
  assert.equal(matchTopic(' Teach me ML! '), 'Machine learning')
  assert.equal(matchTopic('साइबर सुरक्षा'), 'Cybersecurity')
  assert.equal(matchTopic('coding'), 'Programming')
  assert.equal(matchTopic('quantum physics'), null)
  assert.equal(matchTopic('machine learning and astronomy'), null)
})
test('each topic has eight unique questions and valid choices', () => {
  for (const topic of TOPICS) {
    const questions = QUESTION_BANK[topic]
    assert.ok(questions.length >= 8)
    assert.equal(new Set(questions.map(q => q.id)).size, questions.length)
    assert.ok(questions.every(q => q.options[q.correctIndex] && q.explanation))
  }
})
test('selection avoids recent questions across serialization and exhaustion', () => {
  const topic = TOPICS[0]
  let used = []
  let previous = []
  for (let round = 0; round < 12; round++) {
    const selected = selectQuestions(topic, JSON.parse(JSON.stringify(used)), 3, () => 0.5).map(q => q.id)
    assert.equal(new Set(selected).size, 3)
    assert.ok(selected.every(id => !previous.includes(id)))
    used = [...used.filter(id => !selected.includes(id)), ...selected]
    previous = selected
  }
  assert.equal(used.length, 8)
  assert.deepEqual(selectQuestions('unsupported'), [])
})
test('scoring uses exact option indices and retains mistake explanations', () => {
  const questions = selectQuestions(TOPICS[1], [], 3, () => 0.5)
  const answers = Object.fromEntries(questions.map(q => [q.id, q.correctIndex]))
  assert.equal(scoreQuiz(questions, answers).correct, 3)
  answers[questions[0].id] = (questions[0].correctIndex + 1) % 3
  const result = scoreQuiz(questions, answers)
  assert.equal(result.correct, 2)
  assert.equal(result.results[0].correct, false)
  assert.ok(result.results[0].explanation)
  assert.equal(scoreQuiz(questions, {}).correct, 0)
})
test('level heuristic moves at most one level and stays within bounds', () => {
  assert.equal(nextLevel('Beginner', 3, 3), 'Intermediate')
  assert.equal(nextLevel('Intermediate', 2, 3), 'Intermediate')
  assert.equal(nextLevel('Intermediate', 1, 3), 'Beginner')
  assert.equal(nextLevel('Advanced', 3, 3), 'Advanced')
  assert.equal(nextLevel('Beginner', 0, 3), 'Beginner')
})
test('lessons change language, depth, and chosen style sections', () => {
  for (const topic of TOPICS) {
    const english = getLesson(topic, { level: 'Beginner', language: 'English', styles: [] })
    const hindi = getLesson(topic, { level: 'Advanced', language: 'Hindi', styles: ['Technical depth'] })
    const hinglish = getLesson(topic, { level: 'Intermediate', language: 'Hinglish', styles: ['Real-life examples'] })
    assert.notEqual(english.sections[0].text, hindi.sections[0].text)
    assert.notEqual(english.sections[0].text, hinglish.sections[0].text)
    assert.ok(/[\u0900-\u097f]/.test(hindi.sections[0].text))
    assert.ok(hindi.sections.length > english.sections.length)
    assert.equal(hinglish.diagram.length, 4)
  }
})
