/***********************
  STATE
************************/
let questions = JSON.parse(localStorage.getItem("questions")) || [];
let quizIndex = 0;
let score = 0;
let selectedIndex = null;
let wrongAnswers = [];

/***********************
  ELEMENTS
************************/
const builder = document.getElementById("builder");
const quiz = document.getElementById("quiz");
const results = document.getElementById("results");

const qInput = document.getElementById("questionInput");
const typeSelect = document.getElementById("questionType");

const answerInputs = [
  document.getElementById("a0"),
  document.getElementById("a1"),
  document.getElementById("a2"),
  document.getElementById("a3")
];

const correctSelect = document.getElementById("correctAnswer");
const list = document.getElementById("questionList");

const quizQuestion = document.getElementById("quizQuestion");
const choicesDiv = document.getElementById("choices");
const scoreText = document.getElementById("scoreText");
const reviewDiv = document.getElementById("review");

/***********************
  EVENTS
************************/
document.getElementById("addBtn").onclick = addQuestion;
document.getElementById("startBtn").onclick = startQuiz;
document.getElementById("nextBtn").onclick = nextQuestion;
document.getElementById("backBtn").onclick = backToBuilder;

typeSelect.onchange = applyTypeUI;

/***********************
  INIT
************************/
applyTypeUI();
renderList();

/***********************
  TYPE UI (FIXED)
************************/
function applyTypeUI() {
  if (typeSelect.value === "tf") {
    answerInputs[0].value = "True";
    answerInputs[1].value = "False";
    answerInputs[2].value = "";
    answerInputs[3].value = "";

    answerInputs[2].style.display = "none";
    answerInputs[3].style.display = "none";

    correctSelect.innerHTML = `
      <option value="">Correct Answer</option>
      <option value="0">True</option>
      <option value="1">False</option>
    `;
  } else {
    answerInputs.forEach(i => i.style.display = "block");

    correctSelect.innerHTML = `
      <option value="">Correct Answer</option>
      <option value="0">A</option>
      <option value="1">B</option>
      <option value="2">C</option>
      <option value="3">D</option>
    `;
  }
}

/***********************
  BUILDER
************************/
function addQuestion() {
  if (!qInput.value || correctSelect.value === "") {
    alert("Please complete the question");
    return;
  }

  const answers = answerInputs
    .map(i => i.value.trim())
    .filter(v => v !== "");

  questions.push({
    text: qInput.value,
    type: typeSelect.value,
    answers,
    correct: Number(correctSelect.value)
  });

  localStorage.setItem("questions", JSON.stringify(questions));
  clearBuilder();
  renderList();
}

function clearBuilder() {
  qInput.value = "";
  answerInputs.forEach(i => (i.value = ""));
  correctSelect.value = "";
}

function renderList() {
  list.innerHTML = "";

  questions.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${index + 1}. ${q.text}</strong><br><br>
      <button onclick="editQuestion(${index})">Edit</button>
      <button onclick="deleteQuestion(${index})">Delete</button>
    `;
    list.appendChild(div);
  });
}

window.editQuestion = function (index) {
  const q = questions[index];

  qInput.value = q.text;
  typeSelect.value = q.type;

  applyTypeUI(); // 🔥 THIS WAS THE BUG

  q.answers.forEach((a, i) => (answerInputs[i].value = a));
  correctSelect.value = q.correct;

  questions.splice(index, 1);
  localStorage.setItem("questions", JSON.stringify(questions));
  renderList();
};

window.deleteQuestion = function (index) {
  if (!confirm("Delete this question?")) return;

  questions.splice(index, 1);
  localStorage.setItem("questions", JSON.stringify(questions));
  renderList();
};

/***********************
  QUIZ
************************/
function startQuiz() {
  if (questions.length === 0) {
    alert("Add questions first");
    return;
  }

  quizIndex = 0;
  score = 0;
  wrongAnswers = [];

  builder.classList.add("hidden");
  quiz.classList.remove("hidden");

  loadQuestion();
}

function loadQuestion() {
  selectedIndex = null;
  choicesDiv.innerHTML = "";

  const q = questions[quizIndex];
  quizQuestion.textContent = q.text;

  const shuffled = q.answers
    .map((text, index) => ({ text, index }))
    .sort(() => Math.random() - 0.5);

  shuffled.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      document
        .querySelectorAll("#choices button")
        .forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedIndex = choice.index;
    };
    choicesDiv.appendChild(btn);
  });
}

function nextQuestion() {
  if (selectedIndex === null) {
    alert("Select an answer");
    return;
  }

  const q = questions[quizIndex];

  if (selectedIndex === q.correct) {
    score++;
  } else {
    wrongAnswers.push({
      question: q.text,
      picked: q.answers[selectedIndex],
      correct: q.answers[q.correct]
    });
  }

  quizIndex++;

  quizIndex >= questions.length ? finishQuiz() : loadQuestion();
}

function finishQuiz() {
  quiz.classList.add("hidden");
  results.classList.remove("hidden");

  const percent = Math.round((score / questions.length) * 100);
  scoreText.textContent = `Score: ${score}/${questions.length} (${percent}%)`;

  reviewDiv.innerHTML = wrongAnswers
    .map(
      w => `
      <p>
        <strong>${w.question}</strong><br>
        <span style="color:red">Your Answer: ${w.picked}</span><br>
        <span style="color:lightgreen">Correct Answer: ${w.correct}</span>
      </p>`
    )
    .join("");
}

function backToBuilder() {
  results.classList.add("hidden");
  builder.classList.remove("hidden");
}

const mainMenu = document.getElementById("mainMenu");
document.getElementById("goBuilder").onclick = () => {
  mainMenu.classList.add("hidden");
  builder.classList.remove("hidden");
};
document.getElementById("goQuiz").onclick = () => {
  if(questions.length===0){ alert("Add questions first"); return; }
  mainMenu.classList.add("hidden");
  startQuiz();
};
document.getElementById("backToMenu").onclick = () => {
  builder.classList.add("hidden");
  mainMenu.classList.remove("hidden");
};
