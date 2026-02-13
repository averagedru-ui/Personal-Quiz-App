// app.js

// ===== Elements =====
const mainMenu = document.querySelector(".button-wrapper");
const builder = document.getElementById("builder");
const quizSelect = document.getElementById("quizSelect");
const quizDiv = document.getElementById("quiz");
const results = document.getElementById("results");

const flashMenu = document.getElementById("flashMenu");
const flashBuilder = document.getElementById("flashBuilder");
const flashDeckSelect = document.getElementById("flashDeckSelect");
const flashStudy = document.getElementById("flashStudy");

const qInput = document.getElementById("q");
const explanationInput = document.getElementById("explanation");
const typeSelect = document.getElementById("type");
const mcDiv = document.getElementById("mc");
const tfDiv = document.getElementById("tf");
const a1 = document.getElementById("a1");
const a2 = document.getElementById("a2");
const a3 = document.getElementById("a3");
const a4 = document.getElementById("a4");
const correctSelect = document.getElementById("correct");
const tfCorrect = document.getElementById("tfCorrect");
const questionList = document.getElementById("questionList");
const quizNameInput = document.getElementById("quizName");

const questionText = document.getElementById("questionText");
const choices = document.getElementById("choices");
const progressBar = document.getElementById("progressBar");
const finalScore = document.getElementById("finalScore");
const review = document.getElementById("review");
const quizListDiv = document.getElementById("quizList");

// Flashcard elements
const deckNameInput = document.getElementById("deckName");
const cardFrontInput = document.getElementById("cardFront");
const cardBackInput = document.getElementById("cardBack");
const cardList = document.getElementById("cardList");
const deckList = document.getElementById("deckList");
const flashFrontEl = document.getElementById("flashFront");
const flashBackEl = document.getElementById("flashBack");

// ===== Variables =====
let quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
let currentQuiz = null;
let currentQuestions = [];
let currentIndex = 0;
let selectedAnswers = [];

let decks = JSON.parse(localStorage.getItem("flashDecks") || "{}"); // { "DeckName": [{front,back}, ...] }
let currentDeckName = null;
let currentDeck = [];
let currentCardIndex = 0;
let isFlipped = false;
let startWithBack = false;
let shouldShuffle = true;

let editingQuestionIndex = null;

// ===== Helpers =====
function hideAllScreens() {
  const screens = [
    "builder", "quizSelect", "quiz", "results",
    "flashMenu", "flashBuilder", "flashDeckSelect", "flashStudy"
  ];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
}

function showScreen(id) {
  hideAllScreens();
  if (id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("hidden");
  }
  
  // Always hide main menu when showing any other screen
  const menu = document.getElementById("mainMenu");
  if (menu) {
    menu.classList.add("hidden-menu");
  }
}

function backToMenu() {
  showScreen(""); // hides all other screens
  
  const menu = document.getElementById("mainMenu");
  if (menu) {
    menu.classList.remove("hidden-menu");
    // Force re-show after transition
    setTimeout(() => {
      menu.style.opacity = "1";
      menu.style.transform = "translateY(0)";
      menu.style.visibility = "visible";
      menu.style.height = "auto";
      menu.style.margin = ""; // reset if needed
    }, 50); // small delay to let fade-out finish
  }
}

document.addEventListener("DOMContentLoaded", () => {
  hideAllScreens();
  document.getElementById("mainMenu").classList.remove("hidden-menu");
});

// ===== Quiz Builder =====
typeSelect.addEventListener("change", () => {
  if (typeSelect.value === "tf") {
    mcDiv.classList.add("hidden");
    tfDiv.classList.remove("hidden");
  } else {
    mcDiv.classList.remove("hidden");
    tfDiv.classList.add("hidden");
  }
});

function addQuestion() {
  const text = qInput.value.trim();
  if (!text) return alert("Enter a question!");

  const explanation = explanationInput.value.trim();

  let question;
  if (typeSelect.value === "mc") {
    const answers = [a1.value.trim(), a2.value.trim(), a3.value.trim(), a4.value.trim()];
    if (answers.some(a => !a)) return alert("Fill all 4 answers!");
    question = {
      type: "mc",
      q: text,
      answers,
      correct: parseInt(correctSelect.value),
      explanation
    };
  } else {
    question = {
      type: "tf",
      q: text,
      answers: ["True", "False"],
      correct: parseInt(tfCorrect.value),
      explanation
    };
  }

  if (isNaN(question.correct)) return alert("Select the correct answer!");

  if (editingQuestionIndex !== null) {
    currentQuestions[editingQuestionIndex] = question;
    editingQuestionIndex = null;
  } else {
    currentQuestions.push(question);
  }

  renderQuestionList();
  clearQuestionForm();
}

function clearQuestionForm() {
  qInput.value = "";
  explanationInput.value = "";
  a1.value = a2.value = a3.value = a4.value = "";
  correctSelect.value = "";
  tfCorrect.value = "";
}

function renderQuestionList() {
  questionList.innerHTML = "";
  currentQuestions.forEach((q, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${q.q}</strong><br>
      <small>Type: ${q.type.toUpperCase()}</small>
      <div class="button-row">
        <button onclick="editQuestion(${i})">Edit</button>
        <button onclick="deleteQuestion(${i})">Delete</button>
      </div>
    `;
    questionList.appendChild(card);
  });
}

function deleteQuestion(index) {
  if (confirm("Delete this question?")) {
    currentQuestions.splice(index, 1);
    renderQuestionList();
  }
}

function editQuestion(index) {
  const q = currentQuestions[index];
  qInput.value = q.q;
  explanationInput.value = q.explanation || "";

  if (q.type === "tf") {
    typeSelect.value = "tf";
    tfDiv.classList.remove("hidden");
    mcDiv.classList.add("hidden");
    tfCorrect.value = q.correct;
  } else {
    typeSelect.value = "mc";
    mcDiv.classList.remove("hidden");
    tfDiv.classList.add("hidden");
    [a1.value, a2.value, a3.value, a4.value] = q.answers;
    correctSelect.value = q.correct;
  }

  editingQuestionIndex = index;
}

function saveQuiz() {
  const name = quizNameInput.value.trim();
  if (!name) return alert("Enter a quiz name!");
  if (currentQuestions.length === 0) return alert("Add at least one question!");

  if (currentQuiz) {
    const idx = quizzes.findIndex(qz => qz.name === currentQuiz.name);
    if (idx !== -1) quizzes[idx] = { name, questions: [...currentQuestions] };
  } else {
    quizzes.push({ name, questions: [...currentQuestions] });
  }

  localStorage.setItem("quizzes", JSON.stringify(quizzes));
  currentQuiz = null;
  currentQuestions = [];
  quizNameInput.value = "";
  clearQuestionForm();
  renderQuestionList();
  showQuizSelection();
}

// ===== Quiz Selection & Play =====

function renderQuizList() {
  quizListDiv.innerHTML = "";
  quizzes.forEach((qz, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${qz.name}</strong> (${qz.questions.length} questions)
      <div class="button-row">
        <button onclick="startQuiz(${i})">Start</button>
        <button onclick="editQuiz(${i})">Edit</button>
        <button onclick="deleteQuiz(${i})">Delete</button>
      </div>
    `;
    quizListDiv.appendChild(card);
  });
}

function deleteQuiz(index) {
  if (confirm("Delete this quiz?")) {
    quizzes.splice(index, 1);
    localStorage.setItem("quizzes", JSON.stringify(quizzes));
    renderQuizList();
  }
}

function startQuiz(index) {
  currentQuiz = quizzes[index];
  currentQuestions = [...currentQuiz.questions];
  currentIndex = 0;
  selectedAnswers = new Array(currentQuestions.length).fill(null);

  showScreen("quiz");
  showQuestion();
}

function editQuiz(index) {
  currentQuiz = quizzes[index];
  currentQuestions = [...currentQuiz.questions];
  quizNameInput.value = currentQuiz.name;
  renderQuestionList();
  showScreen("builder");
}

// ===== Quiz Taking =====
function showQuestion() {
  if (currentIndex >= currentQuestions.length) return finishQuiz();

  const q = currentQuestions[currentIndex];
  questionText.innerText = q.q;

  if (choices.children.length === 0 || choices.dataset.questionIndex !== String(currentIndex)) {
    choices.innerHTML = "";
    choices.dataset.questionIndex = currentIndex;

    q.answers.forEach((ans, i) => {
      const btn = document.createElement("button");
      btn.textContent = ans;
      btn.dataset.index = i;
      btn.onclick = () => selectAnswer(i);
      choices.appendChild(btn);
    });
  }

  Array.from(choices.children).forEach(btn => {
    btn.classList.toggle("selected", Number(btn.dataset.index) === selectedAnswers[currentIndex]);
  });

  progressBar.style.width = ((currentIndex + 1) / currentQuestions.length) * 100 + "%";
}

function selectAnswer(index) {
  selectedAnswers[currentIndex] = index;
  showQuestion();
}

function nextQuestion() {
  if (selectedAnswers[currentIndex] === null) {
    return alert("Please select an answer.");
  }
  currentIndex++;
  showQuestion();
}

function prevQuestion() {
  if (currentIndex <= 0) return;
  currentIndex--;
  showQuestion();
}

function finishQuiz() {
  showScreen("results");

  let correctCount = 0;
  let reviewHTML = "<h3>Review</h3>";

  currentQuestions.forEach((q, i) => {
    const userAns = selectedAnswers[i];
    const isCorrect = userAns === q.correct;
    if (isCorrect) correctCount++;

    reviewHTML += `
      <div class="review-item ${isCorrect ? 'correct' : 'wrong'}">
        <p><strong>Q: ${q.q}</strong></p>
        <p>Your answer: ${q.answers[userAns] ?? "—"}</p>
        <p>Correct: ${q.answers[q.correct]}</p>
        ${q.explanation ? `<p><em>Explanation: ${q.explanation}</em></p>` : ""}
      </div>
    `;
  });

  finalScore.textContent = `Score: ${correctCount} / ${currentQuestions.length}`;
  review.innerHTML = reviewHTML;
}

// ===== Flashcards - Multiple Decks =====
function saveDecks() {
  localStorage.setItem("flashDecks", JSON.stringify(decks));
}

function addFlashcard() {
  const front = cardFrontInput.value.trim();
  const back = cardBackInput.value.trim();
  if (!front || !back) return alert("Enter both front and back!");

  if (!currentDeckName) return alert("Enter a deck name first!");

  if (!decks[currentDeckName]) decks[currentDeckName] = [];
  decks[currentDeckName].push({ front, back });
  saveDecks();
  renderCardList();
  cardFrontInput.value = "";
  cardBackInput.value = "";
}

function importBulkFlashcards() {
  const input = document.getElementById("bulkFlashInput").value.trim();
  if (!input) return alert("Paste some flashcards first!");

  if (!currentDeckName) return alert("Enter a deck name first!");

  let blocks = input.split(/\n\s*\n/).filter(b => b.trim());
  if (blocks.length <= 1) {
    const allLines = input.split('\n').map(l => l.trim()).filter(l => l);
    blocks = [];
    for (let i = 0; i < allLines.length; i += 3) {
      const group = allLines.slice(i, i + 3).join('\n');
      if (group) blocks.push(group);
    }
  }

  let importedCount = 0;
  const errors = [];

  blocks.forEach((block, idx) => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    let frontLine = lines.find(l => l.toLowerCase().startsWith("front:"));
    let backLine = lines.find(l => l.toLowerCase().startsWith("back:"));

    let front, back;
    if (frontLine && backLine) {
      front = frontLine.replace(/^front:\s*/i, '').trim();
      back = backLine.replace(/^back:\s*/i, '').trim();
    } else if (lines.length >= 2) {
      const offset = lines[0].toLowerCase().startsWith("flashcard") ? 1 : 0;
      front = lines[offset]?.replace(/^front:\s*/i, '').trim();
      back = lines[offset + 1]?.replace(/^back:\s*/i, '').trim();
    }

    if (front && back) {
      if (!decks[currentDeckName]) decks[currentDeckName] = [];
      decks[currentDeckName].push({ front, back });
      importedCount++;
    } else {
      errors.push(`Card ${idx + 1}: Could not parse`);
    }
  });

  if (importedCount === 0) {
    let msg = "No valid cards found.\nExpected:\nFlashcard 1\nFront: ...\nBack: ...\n\n(or blank lines between cards)";
    if (errors.length) msg += `\n\nIssues:\n${errors.join('\n')}`;
    return alert(msg);
  }

  saveDecks();
  renderCardList();
  document.getElementById("bulkFlashInput").value = "";
  alert(`Imported ${importedCount} card${importedCount === 1 ? '' : 's'}!`);
}

function renderCardList() {
  cardList.innerHTML = "";
  if (!currentDeckName || !decks[currentDeckName]) {
    cardList.innerHTML = "<p style='text-align:center; color:#94a3b8;'>No cards yet — add some!</p>";
    return;
  }
  decks[currentDeckName].forEach((card, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>Front:</strong> ${card.front.substring(0, 60)}${card.front.length > 60 ? '...' : ''}<br>
      <strong>Back:</strong> ${card.back.substring(0, 60)}${card.back.length > 60 ? '...' : ''}
      <button onclick="deleteFlashcard(${i})">Delete</button>
    `;
    cardList.appendChild(div);
  });
}

function deleteFlashcard(index) {
  if (confirm("Delete card?")) {
    decks[currentDeckName].splice(index, 1);
    saveDecks();
    renderCardList();
  }
}

function saveDeck() {
  const name = deckNameInput.value.trim();
  if (!name) return alert("Enter a deck name!");

  currentDeckName = name;
  if (!decks[name]) decks[name] = [];
  saveDecks();
  alert(`Deck "${name}" saved (${decks[name].length} cards)!`);
  renderCardList();
}

function renderDeckList() {
  deckList.innerHTML = "";
  const names = Object.keys(decks);
  if (names.length === 0) {
    deckList.innerHTML = "<p style='text-align:center; color:#94a3b8;'>No decks yet — create one!</p>";
    return;
  }
  names.forEach(name => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${name}</strong> (${decks[name].length} cards)
      <div class="button-row">
        <button onclick="startDeckStudy('${name.replace(/'/g, "\\'")}')">Study</button>
        <button onclick="editDeck('${name.replace(/'/g, "\\'")}')">Edit</button>
        <button onclick="deleteDeck('${name.replace(/'/g, "\\'")}')">Delete</button>
      </div>
    `;
    deckList.appendChild(card);
  });
}

function deleteDeck(name) {
  if (confirm(`Delete "${name}" and all cards?`)) {
    delete decks[name];
    saveDecks();
    renderDeckList();
  }
}

function editDeck(name) {
  currentDeckName = name;
  deckNameInput.value = name;
  showScreen("flashBuilder");
  renderCardList();
}

function startDeckStudy(name) {
  currentDeckName = name;
  currentDeck = [...decks[name]];

  shouldShuffle = document.getElementById("shuffleDeck")?.checked ?? true;
  startWithBack = document.getElementById("startWithBack")?.checked ?? false;

  if (shouldShuffle) {
    currentDeck.sort(() => Math.random() - 0.5);
  }

  currentCardIndex = 0;
  isFlipped = startWithBack;

  showScreen("flashStudy");
  showFlashcard();
}

function showFlashcard() {
  if (currentCardIndex >= currentDeck.length) {
    alert("End of deck!");
    backToMenu();
    return;
  }

  const card = currentDeck[currentCardIndex];
  flashFrontEl.textContent = card.front;
  flashBackEl.textContent = card.back;

  document.getElementById("flashCard").classList.toggle("flipped", isFlipped);
}

function flipCard() {
  isFlipped = !isFlipped;
  document.getElementById("flashCard").classList.toggle("flipped", isFlipped);
}

function nextCard() {
  currentCardIndex++;
  showFlashcard();
}

function prevCard() {
  if (currentCardIndex <= 0) return;
  currentCardIndex--;
  showFlashcard();
}

// ===== Screen Functions =====
function showBuilder() { showScreen("builder"); }
function showQuizSelection() {
  showScreen("quizSelect");
  renderQuizList();
}
function showFlashMenu() { showScreen("flashMenu"); }
function showFlashBuilder() {
  currentDeckName = null;
  deckNameInput.value = "";
  showScreen("flashBuilder");
  renderCardList();
}
function showFlashDeckSelection() {
  showScreen("flashDeckSelect");
  renderDeckList();
  if (document.getElementById("startWithBack")) {
    document.getElementById("startWithBack").checked = false;
    document.getElementById("shuffleDeck").checked = true;
  }
}

// ===== Global bindings =====
window.showBuilder = showBuilder;
window.showQuizSelection = showQuizSelection;
window.showFlashMenu = showFlashMenu;
window.backToMenu = backToMenu;
window.addQuestion = addQuestion;
window.saveQuiz = saveQuiz;
window.addFlashcard = addFlashcard;
window.flipCard = flipCard;
window.nextCard = nextCard;
window.prevCard = prevCard;
window.nextQuestion = nextQuestion;
window.prevQuestion = prevQuestion;
window.importBulkFlashcards = importBulkFlashcards;
window.saveDeck = saveDeck;
window.importBulkQuestions = () => alert("Bulk quiz import coming soon!");
window.applyAnswerKey = () => alert("Answer key feature coming soon!");
