/* =========================
   GLOBAL STATE
========================= */

let quizzes = [];
let activeQuizId = null;

let currentIndex = 0;
let userAnswers = [];
let quizActive = false;

/* =========================
   STORAGE
========================= */

function saveApp() {
  localStorage.setItem("quizAppData", JSON.stringify({
    quizzes,
    activeQuizId,
    currentIndex,
    userAnswers,
    quizActive
  }));
}

function loadApp() {
  const data = localStorage.getItem("quizAppData");
  if (!data) return;

  const parsed = JSON.parse(data);
  quizzes = parsed.quizzes || [];
  activeQuizId = parsed.activeQuizId;
  currentIndex = parsed.currentIndex || 0;
  userAnswers = parsed.userAnswers || [];
  quizActive = parsed.quizActive || false;
}

function clearProgress() {
  quizActive = false;
  currentIndex = 0;
  userAnswers = [];
  saveApp();
}

/* =========================
   HELPERS
========================= */

function $(id) {
  return document.getElementById(id);
}

function show(screen) {
  ["menu", "builder", "quiz", "finishMenu"].forEach(s => {
    $(s).classList.add("hidden");
  });
  $(screen).classList.remove("hidden");
}

function getActiveQuiz() {
  return quizzes.find(q => q.id === activeQuizId);
}

/* =========================
   MENU
========================= */

function createNewQuiz() {
  const title = prompt("Quiz title?");
  if (!title) return;

  const quiz = {
    id: crypto.randomUUID(),
    title,
    questions: []
  };

  quizzes.push(quiz);
  activeQuizId = quiz.id;
  saveApp();
  openBuilder();
}

function openBuilder(id = activeQuizId) {
  activeQuizId = id;
  saveApp();

  $("quizTitle").value = getActiveQuiz().title;
  renderQuestionList();
  show("builder");
}

function backToMenu() {
  activeQuizId = null;
  saveApp();
  renderQuizList();
  show("menu");
}

function renderQuizList() {
  const list = $("quizList");
  list.innerHTML = "";

  quizzes.forEach(q => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${q.title}</strong><br>
      <small>${q.questions.length} questions</small><br>
      <button onclick="openBuilder('${q.id}')">Edit</button>
      <button onclick="startQuiz('${q.id}')">Start</button>
    `;
    list.appendChild(card);
  });
}

/* =========================
   BUILDER
========================= */

function addQuestion() {
  const quiz = getActiveQuiz();
  if (!quiz) return;

  const q = $("q").value.trim();
  const type = $("type").value;
  const correct = parseInt($("correct").value);

  if (!q || isNaN(correct)) {
    alert("Fill question and correct answer");
    return;
  }

  let answers = [];

  if (type === "tf") {
    answers = ["True", "False"];
  } else {
    answers = [
      $("a1").value,
      $("a2").value,
      $("a3").value,
      $("a4").value
    ].filter(a => a);

    if (answers.length < 2) {
      alert("At least 2 answers required");
      return;
    }
  }

  quiz.questions.push({ q, answers, correct });
  clearInputs();
  saveApp();
  renderQuestionList();
}

function renderQuestionList() {
  const quiz = getActiveQuiz();
  const list = $("questionList");
  list.innerHTML = "";

  quiz.questions.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${i + 1}. ${q.q}</strong><br>
      <small>Correct: ${q.answers[q.correct]}</small><br>
      <button onclick="editQuestion(${i})">Edit</button>
      <button onclick="deleteQuestion(${i})">Delete</button>
    `;
    list.appendChild(div);
  });
}

function editQuestion(i) {
  const quiz = getActiveQuiz();
  const q = quiz.questions[i];

  $("q").value = q.q;
  $("type").value = q.answers.length === 2 ? "tf" : "mc";
  q.answers.forEach((a, idx) => {
    const el = $("a" + (idx + 1));
    if (el) el.value = a;
  });
  $("correct").value = q.correct;

  quiz.questions.splice(i, 1);
  saveApp();
  renderQuestionList();
}

function deleteQuestion(i) {
  getActiveQuiz().questions.splice(i, 1);
  saveApp();
  renderQuestionList();
}

function clearInputs() {
  ["q", "a1", "a2", "a3", "a4"].forEach(id => {
    const el = $(id);
    if (el) el.value = "";
  });
  $("correct").value = "";
}

/* =========================
   QUIZ
========================= */

function startQuiz(id = activeQuizId) {
  activeQuizId = id;
  const quiz = getActiveQuiz();

  if (!quiz.questions.length) {
    alert("No questions");
    return;
  }

  quizActive = true;
  currentIndex = 0;
  userAnswers = [];
  saveApp();

  show("quiz");
  showQuestion();
}

function showQuestion() {
  const quiz = getActiveQuiz();
  const q = quiz.questions[currentIndex];

  $("questionText").innerText = q.q;
  $("choices").innerHTML = "";

  const shuffled = q.answers
    .map((text, idx) => ({ text, idx }))
    .sort(() => Math.random() - 0.5);

  shuffled.forEach(a => {
    const btn = document.createElement("button");
    btn.innerText = a.text;
    btn.onclick = () => selectAnswer(a.idx, btn);
    $("choices").appendChild(btn);
  });

  updateProgress();
}

function selectAnswer(idx, btn) {
  document.querySelectorAll("#choices button")
    .forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");

  userAnswers[currentIndex] = idx;
  saveApp();
}

function nextQuestion() {
  if (userAnswers[currentIndex] === undefined) {
    alert("Select an answer");
    return;
  }

  currentIndex++;
  saveApp();

  if (currentIndex >= getActiveQuiz().questions.length) {
    finishQuiz();
  } else {
    showQuestion();
  }
}

/* =========================
   FINISH & REVIEW
========================= */

function finishQuiz() {
  quizActive = false;
  saveApp();

  show("finishMenu");

  const quiz = getActiveQuiz();
  let correct = 0;
  let review = "";

  quiz.questions.forEach((q, i) => {
    if (userAnswers[i] === q.correct) {
      correct++;
    } else {
      review += `
        <div class="card">
          <strong>${q.q}</strong><br>
          <span style="color:red">Your answer: ${q.answers[userAnswers[i]]}</span><br>
          <span style="color:#4caf50">Correct answer: ${q.answers[q.correct]}</span>
        </div>
      `;
    }
  });

  const percent = Math.round((correct / quiz.questions.length) * 100);
  $("finalScore").innerHTML =
    `Score: ${correct}/${quiz.questions.length} (${percent}%)<br><br>${review}`;

  clearProgress();
}

function restartQuiz() {
  startQuiz(activeQuizId);
}

function exitQuiz() {
  backToMenu();
}

/* =========================
   PROGRESS
========================= */

function updateProgress() {
  $("progressBar").style.width =
    ((currentIndex / getActiveQuiz().questions.length) * 100) + "%";
}

/* =========================
   INIT
========================= */

window.onload = () => {
  loadApp();
  renderQuizList();
  show("menu");

  if (quizActive && activeQuizId) {
    if (confirm("Resume your quiz?")) {
      show("quiz");
      showQuestion();
    }
  }
};