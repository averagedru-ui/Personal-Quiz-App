// ===== Elements =====
const builder = document.getElementById("builder");
const quizSelect = document.getElementById("quizSelect");
const menu = document.getElementById("menu");
const quizDiv = document.getElementById("quiz");
const results = document.getElementById("results");

const qInput = document.getElementById("q");
const typeSelect = document.getElementById("type");
const mcDiv = document.getElementById("mc");
const tfDiv = document.getElementById("tf");
const a1 = document.getElementById("a1");
const a2 = document.getElementById("a2");
const a3 = document.getElementById("a3");
const a4 = document.getElementById("a4");
const correct = document.getElementById("correct");
const tfCorrect = document.getElementById("tfCorrect");
const questionList = document.getElementById("questionList");
const quizNameInput = document.getElementById("quizName");

const questionText = document.getElementById("questionText");
const choices = document.getElementById("choices");
const progressBar = document.getElementById("progressBar");
const finalScore = document.getElementById("finalScore");
const review = document.getElementById("review");
const quizListDiv = document.getElementById("quizList");

// ===== Variables =====
let quizzes = [];
let currentQuiz = null;
let currentQuestions = [];
let currentIndex = 0;
let answers = [];

// ===== Load quizzes from localStorage =====
if (localStorage.getItem("quizzes")) {
  quizzes = JSON.parse(localStorage.getItem("quizzes"));
}

// ===== Persist quizzes =====
function saveQuizzesToStorage() {
  localStorage.setItem("quizzes", JSON.stringify(quizzes));
}

// ===== Show / Hide Sections =====
function showBuilder() {
  menu.classList.add("hidden");
  quizSelect.classList.add("hidden");
  results.classList.add("hidden");
  quizDiv.classList.add("hidden");
  builder.classList.remove("hidden");
  questionList.innerHTML = "";
  currentQuestions = [];
  answers = [];
  currentIndex = 0;
}

function showQuizSelection() {
  menu.classList.add("hidden");
  builder.classList.add("hidden");
  results.classList.add("hidden");
  quizDiv.classList.add("hidden");
  quizSelect.classList.remove("hidden");
  renderQuizList();
}

function backToMenu() {
  builder.classList.add("hidden");
  quizSelect.classList.add("hidden");
  quizDiv.classList.add("hidden");
  results.classList.add("hidden");
  menu.classList.remove("hidden");
  renderQuizList();
}

// ===== Toggle MC / TF =====
typeSelect.addEventListener("change", () => {
  if (typeSelect.value === "tf") {
    mcDiv.classList.add("hidden");
    tfDiv.classList.remove("hidden");
  } else {
    mcDiv.classList.remove("hidden");
    tfDiv.classList.add("hidden");
  }
});

// ===== Add Question =====
function addQuestion() {
  const text = qInput.value.trim();
  if (!text) return alert("Enter a question!");
  let question;
  if (typeSelect.value === "mc") {
    question = {
      q: text,
      answers: [a1.value, a2.value, a3.value, a4.value],
      correct: parseInt(correct.value)
    };
  } else {
    question = {
      q: text,
      answers: ["True","False"],
      correct: parseInt(tfCorrect.value)
    };
  }
  currentQuestions.push(question);
  renderQuestionList();
  qInput.value = a1.value = a2.value = a3.value = a4.value = "";
  correct.value = tfCorrect.value = "";
}

// ===== Render Question List =====
function renderQuestionList() {
  questionList.innerHTML = "";
  currentQuestions.forEach((q, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${q.q}</strong>
      <button onclick="deleteQuestion(${i})">Delete</button>
      <button onclick="editQuestion(${i})">Edit</button>
    `;
    questionList.appendChild(card);
  });
}

// ===== Delete Question =====
function deleteQuestion(index) {
  if (!confirm("Delete this question?")) return;
  currentQuestions.splice(index, 1);
  renderQuestionList();
}

// ===== Edit Question =====
function editQuestion(index) {
  const q = currentQuestions[index];
  qInput.value = q.q;
  if (q.answers.length === 2) {
    typeSelect.value = "tf";
    mcDiv.classList.add("hidden");
    tfDiv.classList.remove("hidden");
    tfCorrect.value = q.correct;
  } else {
    typeSelect.value = "mc";
    mcDiv.classList.remove("hidden");
    tfDiv.classList.add("hidden");
    a1.value = q.answers[0];
    a2.value = q.answers[1];
    a3.value = q.answers[2];
    a4.value = q.answers[3];
    correct.value = q.correct;
  }
  currentQuestions.splice(index, 1);
  renderQuestionList();
}

// ===== Save Quiz =====
function saveQuiz() {
  const name = quizNameInput.value.trim();
  if (!name) return alert("Enter a quiz name!");
  quizzes.push({ name, questions: [...currentQuestions] });
  saveQuizzesToStorage();
  quizNameInput.value = "";
  currentQuestions = [];
  answers = [];
  questionList.innerHTML = "";
  alert("Quiz saved!");
  showQuizSelection();
}

// ===== Render Quiz List =====
function renderQuizList() {
  quizListDiv.innerHTML = "";
  quizzes.forEach((qz, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${qz.name}</strong>
      <div class="button-row">
        <button class="btn-primary" onclick="startQuiz(${i})">Start</button>
        <button class="btn-secondary" onclick="editQuiz(${i})">Edit</button>
        <button class="btn-danger" onclick="deleteQuiz(${i})">Delete</button>
      </div>
    `;
    quizListDiv.appendChild(card);
  });
}

// ===== Delete Quiz =====
function deleteQuiz(index) {
  if (!confirm("Delete this quiz?")) return;
  quizzes.splice(index, 1);
  saveQuizzesToStorage();
  renderQuizList();
}

// ===== Start Quiz =====
function startQuiz(index) {
  currentQuiz = quizzes[index];

  currentQuestions = currentQuiz.questions.map(q => {
    const shuffled = [...q.answers]
      .map(a => ({ a, sort: Math.random() }))
      .sort((x, y) => x.sort - y.sort)
      .map(x => x.a);

    return {
      ...q,
      shuffledAnswers: shuffled,
      shuffledCorrect: shuffled.indexOf(q.answers[q.correct])
    };
  });

  currentIndex = 0;
  answers = [];

  quizSelect.classList.add("hidden");
  builder.classList.add("hidden");
  quizDiv.classList.remove("hidden");

  showQuestion();
}


// ===== Edit Quiz =====
function editQuiz(index) {
  currentQuiz = quizzes[index];
  currentQuestions = [...currentQuiz.questions];
  currentIndex = 0;
  answers = [];
  quizSelect.classList.add("hidden");
  builder.classList.remove("hidden");
  questionList.innerHTML = "";
  renderQuestionList();
}

// ===== Show Question =====
function showQuestion() {
  const qObj = currentQuestions[currentIndex];
  questionText.innerText = qObj.q;
  choices.innerHTML = "";

 (qObj.shuffledAnswers || qObj.answers).forEach((ans, i) => {
    const btn = document.createElement("button");
    btn.innerText = qObj.answers.length === 2 ? ans : `${String.fromCharCode(65+i)}. ${ans}`;
    btn.onclick = () => {
      document.querySelectorAll("#choices button").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      answers[currentIndex] = i;
    };
    if (answers[currentIndex] === i) btn.classList.add("selected");
    choices.appendChild(btn);
  });

  progressBar.style.width = ((currentIndex) / currentQuestions.length) * 100 + "%";

  // Add Back button dynamically if not exists
  let buttonWrapper = document.querySelector("#quiz .button-wrapper");
  buttonWrapper.innerHTML = `
    <button id="backBtn">Back</button>
    <button id="nextBtn">${currentIndex === currentQuestions.length - 1 ? "Finish" : "Next"}</button>
  `;

  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");

  backBtn.disabled = currentIndex === 0;
  backBtn.onclick = prevQuestion;
  nextBtn.onclick = nextQuestion;
}

// ===== Next / Previous Question =====
function nextQuestion() {
  if (answers[currentIndex] == null) return alert("Select an answer!");
  currentIndex++;
  if (currentIndex >= currentQuestions.length) finishQuiz();
  else showQuestion();
}

function prevQuestion() {
  if (currentIndex === 0) return;
  currentIndex--;
  showQuestion();
}

// ===== Finish Quiz =====
function finishQuiz() {
  quizDiv.classList.add("hidden");
  results.classList.remove("hidden");
  let correctCount = 0;
  let reviewHTML = "";
  currentQuestions.forEach((qObj, i) => {
    if (answers[i] === qObj.shuffledCorrect) correctCount++;
    else {
      reviewHTML += `
        <div class="card">
          <strong>${qObj.q}</strong><br>
          <span class="wrong">
  Your answer: ${
    answers[i] != null
      ? (qObj.shuffledAnswers || qObj.answers)[answers[i]]
      : "None"
  }
</span><br>
<span class="correct">
  Correct: ${(qObj.shuffledAnswers || qObj.answers)[qObj.shuffledCorrect]}
</span>

        </div>
      `;
    }
  });
  finalScore.innerText = `${correctCount}/${currentQuestions.length} (${Math.round(correctCount / currentQuestions.length * 100)}%)`;
  review.innerHTML = reviewHTML || "<p>Perfect score 🎉</p>";
}
function shuffleAnswers(question) {
  const indexed = question.answers.map((text, index) => ({
    text,
    index
  }));

  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }

  question.shuffledAnswers = indexed.map(i => i.text);
  question.shuffledCorrect = indexed.findIndex(i => i.index === question.correct);
}


