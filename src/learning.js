export const STYLE_OPTIONS = ['Real-life examples', 'Visual analogies', 'Step-by-step explanation', 'Short/simple answers', 'Technical depth']
export const TOPICS = ['Machine learning', 'Generative AI', 'Cybersecurity', 'Programming', 'Critical thinking']
export const DEFAULT_PREFERENCES = { level: 'Beginner', language: 'English', styles: ['Real-life examples', 'Step-by-step explanation'] }
const aliases = [['machine learning', 'ml', 'मशीन लर्निंग'], ['generative ai', 'gen ai', 'genai', 'जनरेटिव एआई'], ['cybersecurity', 'cyber security', 'साइबर सुरक्षा'], ['programming', 'coding', 'प्रोग्रामिंग'], ['critical thinking', 'आलोचनात्मक चिंतन']]
export function matchTopic(input = '') {
  const normalized = String(input).trim().toLowerCase().replace(/[?!.,]+$/g, '')
  const index = aliases.findIndex(group => group.some(alias => normalized === alias || normalized === `explain ${alias}` || normalized === `teach me ${alias}` || normalized === `what is ${alias}`))
  return index < 0 ? null : TOPICS[index]
}

const lessonRows = [
  [
    ['Machine learning learns patterns from examples instead of following a rule written for every case. Training finds a useful pattern; testing checks it on examples the model has not seen.', 'मशीन लर्निंग हर स्थिति के लिए अलग नियम लिखने के बजाय उदाहरणों से पैटर्न सीखती है। प्रशिक्षण में पैटर्न खोजा जाता है और परीक्षण में नए उदाहरणों पर उसकी जाँच होती है।', 'Machine learning mein har case ka rule nahi likhte: examples se pattern seekhte hain. Training mein seekhna hota hai; testing unseen examples par check karti hai.'],
    ['A spam filter learns from messages labelled spam or safe. A useful filter must also handle a new sender, not just remember old messages.', 'स्पैम फ़िल्टर स्पैम और सुरक्षित चिह्नित संदेशों से सीखता है। उसे पुराने संदेश याद करने के साथ नए प्रेषक का संदेश भी पहचानना चाहिए।', 'Spam filter labelled messages se seekhta hai. Sirf purane messages yaad karna kaafi nahi; naye sender ka message bhi samajhna chahiye.'],
    ['Separate data → train on one part → evaluate on held-out data → inspect errors.', 'डेटा अलग करें → एक भाग से प्रशिक्षण दें → अलग रखे डेटा पर जाँचें → गलतियाँ देखें।', 'Data split karo → training part se sikhao → held-out data par test karo → errors dekho.'],
    ['Overfitting is memorizing practice answers rather than learning the method. Keep validation data separate when choosing model settings.', 'ओवरफिटिंग अभ्यास के उत्तर याद करना है, तरीका सीखना नहीं। मॉडल की सेटिंग चुनते समय सत्यापन डेटा अलग रखें।', 'Overfitting matlab practice answers ratna, method nahi seekhna. Settings choose karte waqt validation data alag rakho.'],
    ['Minimize a loss on training data, but estimate generalization on independent data. Leakage, class imbalance, and distribution shift can make accuracy misleading; compare precision and recall for the actual error costs.', 'प्रशिक्षण डेटा पर हानि कम करें, पर सामान्यीकरण का अनुमान स्वतंत्र डेटा से लगाएँ। डेटा रिसाव, वर्ग असंतुलन और वितरण में बदलाव से सटीकता भ्रामक हो सकती है; त्रुटि की लागत के अनुसार प्रिसिजन और रिकॉल देखें।', 'Training loss kam hona enough nahi. Independent data par generalization check karo. Leakage, class imbalance aur distribution shift accuracy ko misleading bana sakte hain; error cost ke hisaab se precision aur recall dekho.'],
  ],
  [
    ['Generative AI produces new text, images, or audio using patterns learned during training. A fluent answer is a prediction, not proof that a claim is true.', 'जनरेटिव एआई प्रशिक्षण से सीखे पैटर्न के आधार पर नया पाठ, चित्र या ध्वनि बनाती है। सहज भाषा में लिखा उत्तर एक अनुमान है, उसके सही होने का प्रमाण नहीं।', 'Generative AI training ke patterns se naya text, image ya audio banati hai. Fluent answer prediction hai, sach hone ka proof nahi.'],
    ['Ask for a draft study plan, then check dates and resources yourself. Never treat an invented citation as evidence.', 'पढ़ाई की योजना का मसौदा माँगें, फिर तारीखें और स्रोत स्वयं जाँचें। गढ़े हुए संदर्भ को प्रमाण न मानें।', 'Study plan ka draft lo, phir dates aur sources khud verify karo. Banaya hua citation evidence nahi hota.'],
    ['State the task → supply relevant context → request a format → verify claims.', 'काम स्पष्ट करें → संबंधित संदर्भ दें → प्रारूप बताएँ → दावों की जाँच करें।', 'Task batao → relevant context do → format maango → claims verify karo.'],
    ['Think of a very capable autocomplete, not a library catalogue. Context steers the output but cannot guarantee truth.', 'इसे बहुत सक्षम स्वतः-पूरण समझें, पुस्तकालय की प्रमाणित सूची नहीं। संदर्भ उत्तर की दिशा बदलता है, सत्य की गारंटी नहीं देता।', 'Isse powerful autocomplete samjho, verified library catalogue nahi. Context output ko guide karta hai, truth guarantee nahi karta.'],
    ['A language model estimates token probabilities conditioned on context. Sampling changes output variability; retrieval can ground answers in documents but still requires source checking and resistance to instructions embedded in untrusted documents.', 'भाषा मॉडल संदर्भ के आधार पर टोकन की संभावनाएँ अनुमानित करता है। सैंपलिंग से उत्तर की विविधता बदलती है। दस्तावेज़ खोज उत्तर को आधार दे सकती है, लेकिन स्रोतों की जाँच और अविश्वसनीय दस्तावेज़ों में छिपे निर्देशों से बचाव फिर भी आवश्यक है।', 'Language model context ke basis par token probabilities estimate karta hai. Sampling se variability badalti hai. Retrieval documents ka support deta hai, par sources verify karna aur untrusted documents ke hidden instructions se bachna zaroori hai.'],
  ],
  [
    ['Cybersecurity protects information and systems from unauthorized access, alteration, and disruption. Good security combines prevention, detection, and recovery.', 'साइबर सुरक्षा जानकारी और प्रणालियों को अनधिकृत पहुँच, बदलाव और बाधा से बचाती है। अच्छी सुरक्षा में रोकथाम, पहचान और पुनर्प्राप्ति तीनों शामिल हैं।', 'Cybersecurity information aur systems ko unauthorized access, changes aur disruption se bachati hai. Prevention, detection aur recovery teeno chahiye.'],
    ['An urgent bank message may be phishing. Open the bank’s known app yourself instead of following the message link.', 'जल्दी कार्रवाई माँगने वाला बैंक संदेश फ़िशिंग हो सकता है। संदेश का लिंक खोलने के बजाय बैंक का परिचित ऐप स्वयं खोलें।', 'Urgent bank message phishing ho sakta hai. Message link ke bajay bank ka known app khud kholo.'],
    ['Use unique passwords → enable MFA → install updates → test a backup restore.', 'अलग-अलग पासवर्ड रखें → बहु-कारक प्रमाणीकरण चालू करें → अपडेट लगाएँ → बैकअप से बहाली जाँचें।', 'Unique passwords rakho → MFA on karo → updates install karo → backup restore test karo.'],
    ['Security is like several doors in a building: one broken lock should not expose every room. Grant only the access each role needs.', 'सुरक्षा भवन के कई दरवाज़ों जैसी है: एक ताला टूटने से सभी कमरे नहीं खुलने चाहिए। हर भूमिका को केवल आवश्यक पहुँच दें।', 'Security building ke multiple doors jaisi hai: ek lock tootne se sab rooms expose na hon. Har role ko sirf needed access do.'],
    ['Model threats by assets, adversaries, and trust boundaries. Enforce authorization on the server, rotate compromised credentials, and rehearse incident recovery. Encryption protects confidentiality but does not replace access control.', 'संपत्ति, हमलावर और विश्वास सीमाओं के आधार पर खतरों का मॉडल बनाएँ। सर्वर पर अनुमति जाँचें, लीक हुए क्रेडेंशियल बदलें और घटना से उबरने का अभ्यास करें। एन्क्रिप्शन गोपनीयता बचाता है, पर पहुँच नियंत्रण का विकल्प नहीं है।', 'Assets, attackers aur trust boundaries se threat model banao. Server par authorization enforce karo, leaked credentials rotate karo, recovery rehearse karo. Encryption access control ka replacement nahi.'],
  ],
  [
    ['Programming expresses a solution as precise instructions. Variables hold values, conditions choose paths, and functions group reusable behavior.', 'प्रोग्रामिंग किसी समाधान को स्पष्ट निर्देशों में व्यक्त करती है। वेरिएबल मान रखते हैं, शर्तें रास्ता चुनती हैं और फ़ंक्शन दोबारा उपयोग योग्य व्यवहार को समूहित करते हैं।', 'Programming solution ko precise instructions mein likhna hai. Variables values rakhte hain, conditions path choose karti hain, functions reusable behavior group karte hain.'],
    ['A shopping total adds item prices, applies a discount only when its condition holds, and returns the final amount.', 'खरीदारी का कुल मूल्य वस्तुओं की कीमत जोड़ता है, शर्त पूरी होने पर छूट लगाता है और अंतिम राशि लौटाता है।', 'Shopping total prices add karta hai, condition true ho tab discount lagata hai aur final amount return karta hai.'],
    ['Define input and output → split the problem → implement → test normal and edge cases.', 'इनपुट और आउटपुट तय करें → समस्या बाँटें → कोड लिखें → सामान्य और सीमा मामलों की जाँच करें।', 'Input-output define karo → problem split karo → implement karo → normal aur edge cases test karo.'],
    ['A function is like a recipe with named ingredients and a result. A clear contract lets callers use it without reading every instruction.', 'फ़ंक्शन नामित सामग्री और परिणाम वाली विधि जैसा है। स्पष्ट अनुबंध से उपयोगकर्ता हर निर्देश पढ़े बिना उसका उपयोग कर सकता है।', 'Function recipe jaisa hai: named ingredients aur result. Clear contract ho toh caller ko har instruction padhna nahi padta.'],
    ['Reason about invariants and complexity. A single pass over n items is O(n); nested full scans are O(n²). Validate external input at boundaries and separate calculations from side effects to make behavior easier to test.', 'अपरिवर्तनीय नियम और जटिलता पर विचार करें। n वस्तुओं पर एक बार चलना O(n) है; दो पूर्ण नेस्टेड लूप O(n²) हैं। बाहरी इनपुट सीमा पर जाँचें और गणना को दुष्प्रभावों से अलग रखें ताकि परीक्षण आसान हो।', 'Invariants aur complexity socho. n items ka single pass O(n), nested full scans O(n²). External input boundary par validate karo; calculations aur side effects separate rakhne se testing easy hoti hai.'],
  ],
  [
    ['Critical thinking means evaluating a claim using reasons and evidence, while being willing to revise your view. Confidence should match the quality of evidence.', 'आलोचनात्मक चिंतन का अर्थ कारण और प्रमाण से दावे को परखना और ज़रूरत पर अपना मत बदलना है। विश्वास का स्तर प्रमाण की गुणवत्ता के अनुरूप होना चाहिए।', 'Critical thinking matlab reasons aur evidence se claim evaluate karna, aur zaroorat par apni view badalna. Confidence evidence ki quality ke hisaab se hona chahiye.'],
    ['A student improves after using an app. That alone does not prove the app caused the improvement: extra practice or easier tests could explain it.', 'ऐप उपयोग करने के बाद छात्र के अंक बढ़े। केवल इससे ऐप का प्रभाव सिद्ध नहीं होता: अधिक अभ्यास या आसान परीक्षा भी कारण हो सकती है।', 'App use ke baad marks badhe, par app hi cause tha ye prove nahi hota. Extra practice ya easier test bhi reason ho sakta hai.'],
    ['Identify the claim → inspect the source → consider alternatives → update your confidence.', 'दावा पहचानें → स्रोत जाँचें → वैकल्पिक कारण देखें → अपना विश्वास संशोधित करें।', 'Claim identify karo → source check karo → alternatives socho → confidence update karo.'],
    ['Evidence is like weight on a balance: independent, reliable observations matter more than many copies of the same story.', 'प्रमाण तराज़ू पर भार जैसा है: स्वतंत्र और विश्वसनीय अवलोकन एक ही कहानी की कई प्रतियों से अधिक महत्वपूर्ण हैं।', 'Evidence balance ke weight jaisa hai: independent reliable observations, same story ki many copies se stronger hain.'],
    ['Distinguish correlation from causation, account for base rates, and seek disconfirming evidence. Controlled comparisons reduce confounding; they do not eliminate every measurement error or guarantee results generalize.', 'सहसंबंध और कारण में अंतर करें, आधार दर ध्यान में रखें और विरोधी प्रमाण खोजें। नियंत्रित तुलना भ्रमकारी कारण घटाती है, लेकिन हर मापन त्रुटि मिटाती नहीं और परिणाम हर जगह लागू होने की गारंटी नहीं देती।', 'Correlation aur causation alag hain; base rates dekho aur disconfirming evidence dhoondo. Controlled comparisons confounding reduce karti hain, par measurement errors aur generalization ki guarantee nahi deti.'],
  ],
]
export function getLesson(topic, preferences = DEFAULT_PREFERENCES) {
  const index = TOPICS.indexOf(topic)
  if (index < 0) return null
  const language = preferences.language === 'Hindi' ? 1 : preferences.language === 'Hinglish' ? 2 : 0
  const row = lessonRows[index].map(part => part[language])
  const sections = [{ title: ['Core idea', 'मुख्य विचार', 'Main idea'][language], text: row[0] }]
  if (preferences.level !== 'Beginner') sections.push({ title: ['Go deeper', 'और गहराई से', 'Thoda deeper'][language], text: row[3] })
  if (preferences.level === 'Advanced') sections.push({ title: ['Advanced perspective', 'उन्नत दृष्टिकोण', 'Advanced nazariya'][language], text: row[4] })
  const texts = { 'Real-life examples': row[1], 'Visual analogies': row[3], 'Step-by-step explanation': row[2], 'Short/simple answers': row[0].split(/[.!।]/)[0] + '.', 'Technical depth': row[4] }
  for (const style of preferences.styles || []) if (texts[style]) sections.push({ title: style, text: texts[style] })
  return { topic, sections, diagram: row[2].split(' → ') }
}

// Each row is [prompt, correct answer, distractor, distractor, explanation].
const bank = [
  [
    ['What is training?', 'Learning patterns from examples', 'Testing only new examples', 'Deleting all data', 'Training adjusts a model using examples; evaluation measures its behavior separately.'],
    ['What is overfitting?', 'Memorizing training details', 'Learning useful general patterns', 'Having no training data', 'A memorized training set can look accurate while predictions on new data fail.'],
    ['Which data should evaluate a final model?', 'Independent held-out data', 'Only its training data', 'Only correctly predicted rows', 'Independent held-out data provides a less biased estimate of generalization.'],
    ['Which is a supervised-learning example?', 'Learning from labelled spam messages', 'Sorting files alphabetically', 'Generating random numbers', 'Supervised learning uses examples paired with target labels.'],
    ['Why can accuracy mislead?', 'One class can dominate the dataset', 'Accuracy is always random', 'Every dataset is balanced', 'Predicting the majority class can score highly while missing rare important cases.'],
    ['What is data leakage?', 'Training uses information unavailable at prediction time', 'Data is stored on a disk', 'A model makes an error', 'Leaked future or test information makes evaluation unrealistically optimistic.'],
    ['What does recall measure?', 'The fraction of actual positives found', 'The fraction of predictions that are negative', 'Training speed', 'Recall is true positives divided by all actual positives.'],
    ['What is distribution shift?', 'Real-world data differs from training data', 'Moving a file to a folder', 'Increasing screen resolution', 'A changed data distribution can invalidate past evaluation results.'],
  ],
  [
    ['What does generative AI produce?', 'New content based on learned patterns', 'Only verified facts', 'Only database copies', 'Generation produces content; it does not guarantee factual correctness.'],
    ['What is a hallucination?', 'A plausible but unsupported output', 'A verified citation', 'A slow network request', 'Fluent language may contain invented facts or sources.'],
    ['What improves a prompt?', 'Relevant context and a clear task', 'Unrelated private information', 'Repeating random words', 'Clear constraints and context make the desired output easier to specify.'],
    ['How should a citation be checked?', 'Open the source and verify its support', 'Trust its professional formatting', 'Count the words in its title', 'A real source must exist and actually support the claim being made.'],
    ['What does retrieval add?', 'Relevant documents as context', 'A guarantee of truth', 'Unlimited model memory', 'Retrieved documents can ground a response but may still be wrong or misused.'],
    ['What does sampling affect?', 'Output variability', 'Whether every fact is verified', 'The age of training data', 'Sampling chooses among token probabilities and changes variability, not truth guarantees.'],
    ['What is a token?', 'A unit of text processed by a model', 'Always one complete sentence', 'An external fact checker', 'Tokens may be words, parts of words, or punctuation.'],
    ['What is prompt injection?', 'Untrusted content tries to redirect instructions', 'A normal spelling correction', 'Compressing a picture', 'Treat instructions inside retrieved or uploaded content as untrusted data.'],
  ],
  [
    ['What is phishing?', 'Deception to obtain access or information', 'A software backup', 'A secure password manager', 'Phishing imitates a trusted sender to trick a person into disclosing information or taking action.'],
    ['Why use unique passwords?', 'One breach cannot unlock every account', 'They remove the need for updates', 'They make all messages safe', 'Password reuse lets attackers try one stolen password on many services.'],
    ['What does MFA add?', 'Another authentication factor', 'A shared password', 'A public login link', 'A second factor adds protection if one credential is stolen.'],
    ['What is least privilege?', 'Grant only the access needed', 'Give everyone administrator access', 'Disable all logging', 'Limited permissions reduce the damage from mistakes and compromise.'],
    ['Where must authorization be enforced?', 'On the trusted server', 'Only in a hidden button', 'Only in a browser label', 'Clients can be modified; the server must verify access to each protected resource.'],
    ['What makes a backup useful?', 'A tested ability to restore it', 'A reassuring filename', 'Being on the same failing disk only', 'Recovery requires a usable, accessible backup and a tested restoration process.'],
    ['What should follow a leaked API key?', 'Revoke or rotate it', 'Only rename its file', 'Post it publicly for checking', 'A compromised key remains usable until revoked; rotation supplies a replacement.'],
    ['Does encryption replace access control?', 'No, both solve different problems', 'Yes, always', 'Only when passwords are short', 'Encryption protects data confidentiality; authorization controls who may perform actions.'],
  ],
  [
    ['What does a variable hold?', 'A value', 'Only a whole application', 'A guaranteed correct answer', 'A variable is a name associated with a value.'],
    ['What does a condition do?', 'Chooses behavior based on a test', 'Always repeats forever', 'Deletes functions', 'A condition selects a branch according to whether a test succeeds.'],
    ['Why use a function?', 'Group reusable behavior with an interface', 'Prevent all possible errors', 'Avoid defining inputs', 'Functions provide a named unit with inputs, behavior, and often an output.'],
    ['What is an edge case?', 'An unusual boundary input', 'Only the most common input', 'A visual border', 'Empty lists, zero values, and maximum limits can reveal bugs missed by typical inputs.'],
    ['What is the complexity of one pass over n items?', 'O(n)', 'O(1) regardless of n', 'Always O(n²)', 'The work grows proportionally with the number of items visited.'],
    ['Why separate calculation from side effects?', 'To make behavior easier to test', 'To remove all functions', 'To guarantee zero memory usage', 'Pure calculations can be tested without network, files, or other changing external state.'],
    ['Where should external input be validated?', 'At the system boundary', 'Only after storing it everywhere', 'Never if the form looks correct', 'Validate data as it enters the trusted system; client controls alone are not sufficient.'],
    ['What is an invariant?', 'A property that must remain true', 'A random variable name', 'A type of image', 'An invariant describes a rule that valid system states or algorithm steps must preserve.'],
  ],
  [
    ['What makes a claim stronger?', 'Reliable independent evidence', 'Repeating it many times', 'A confident voice alone', 'Independent, relevant evidence supports a claim better than repetition or confidence.'],
    ['Does correlation prove causation?', 'No', 'Yes, always', 'Only for large numbers', 'A common cause, coincidence, or reverse causation can produce correlation.'],
    ['What is confirmation bias?', 'Favoring evidence that supports an existing belief', 'Testing opposing explanations fairly', 'Correcting a mistake', 'Seeking only supporting evidence can preserve a mistaken belief.'],
    ['Why consider alternative explanations?', 'To test whether a conclusion is uniquely supported', 'To reject all evidence', 'To make every view equally likely', 'Alternatives reveal whether the same observation could have another cause.'],
    ['What is a base rate?', 'How common something is before new evidence', 'The largest number in a chart', 'A guaranteed outcome', 'Prior prevalence matters when interpreting tests, risks, and predictions.'],
    ['Are ten copies of one story independent sources?', 'No, they may share one origin', 'Yes, always', 'Only if the fonts differ', 'Repeated publication does not create independent confirmation.'],
    ['What should confidence track?', 'The strength and limits of the evidence', 'How much you want a result', 'The speaker’s volume', 'Calibrated confidence changes when reliable evidence changes.'],
    ['What does a controlled comparison help reduce?', 'Confounding explanations', 'All uncertainty forever', 'The need to measure outcomes', 'A controlled comparison isolates a factor more carefully, but measurement and generalization limits remain.'],
  ],
]
export const QUESTION_BANK = Object.fromEntries(TOPICS.map((topic, t) => [topic, bank[t].map((row, i) => {
  const correctIndex = i % 3
  const options = [row[2], row[3]]
  options.splice(correctIndex, 0, row[1])
  return { id: `${t}-${i}`, topic, prompt: row[0], options, correctIndex, explanation: row[4] }
})]))
export function selectQuestions(topic, usedIds = [], count = 3, random = Math.random) {
  const all = QUESTION_BANK[topic] || []
  const used = new Set(usedIds)
  const shuffle = list => list.map(value => ({ value, order: random() })).sort((a, b) => a.order - b.order).map(entry => entry.value)
  const fresh = shuffle(all.filter(q => !used.has(q.id)))
  // At exhaustion, oldest-seen questions refill the round; the immediately previous round stays last.
  const recycled = all.filter(q => used.has(q.id)).sort((a, b) => usedIds.lastIndexOf(a.id) - usedIds.lastIndexOf(b.id))
  return [...fresh, ...recycled].slice(0, Math.min(count, all.length))
}
export function scoreQuiz(questions, answers) {
  const results = questions.map(q => ({ ...q, answer: answers[q.id], correct: answers[q.id] === q.correctIndex }))
  return { correct: results.filter(q => q.correct).length, total: questions.length, results }
}
export function nextLevel(level, correct, total) {
  const levels = ['Beginner', 'Intermediate', 'Advanced']
  const index = Math.max(0, levels.indexOf(level))
  const ratio = total > 0 ? correct / total : 0
  return levels[Math.max(0, Math.min(2, index + (ratio >= 0.8 ? 1 : ratio < 0.5 ? -1 : 0)))]
}
