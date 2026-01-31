let questions = JSON.parse(localStorage.getItem("questions")) || [];
let quizIndex = 0;
let score = 0;
let selected = null;
let wrong = [];

const builder = document.getElementById("builder");
const quiz = document.getElementById("quiz");
const results = document.getElementById("results");

const qInput = document.getElementById("questionInput");
const typeSelect = document.getElementById("questionType");
const answers = [
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

document.getElementById("addBtn").onclick = addQuestion;
document.getElementById("startBtn").onclick = startQuiz;
document.getElementById("nextBtn").onclick = nextQuestion;
document.getElementById("backBtn").onclick = backToBuilder;

typeSelect.onchange = handleType;

handleType();
renderList();

/* ---------- BUILDER ---------- */

function handleType() {
  if (typeSelect.value === "tf") {
    answers[0].value = "True";
    answers[1].value = "False";
    answers[2].value = "";
    answers[3].value = "";

    answers[2].style.display = "none";
    answers[3].style.display = "none";

    correctSelect.innerHTML = `
      <option value="">Correct Answer</option>
      <option value="0">True</option>
      <option value="1">False</option>
    `;
  } else {
    answers.forEach(a => a.style.display = "block");
    correctSelect.innerHTML = `
      <option value="">Correct Answer</option>
      <option value="0">A</option>
      <option value="1">B</option>
      <option value="2">C</option>
      <option value="3">D</option>
    `;
  }
}

function addQuestion() {
  if (!qInput.value || correctSelect.value === "") {
    alert("Fill everything");
    return;
  }

  const ans = answers.map(a => a.value).filter(a => a !== "");

  questions.push({
    text: qInput.value,
    answers: ans,
    correct: Number(correctSelect.value)
  });

  localStorage.setItem("questions", JSON.stringify(questions));

  qInput.value = "";
  answers.forEach(a => a.value = "");
  correctSelect.value = "";

  renderList();
}

function renderList() {
  list.innerHTML = "";
  questions.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${i + 1}. ${q.text}</strong><br><br>
      <button onclick="edit(${i})">Edit</button>
      <button onclick="del(${i})">Delete</button>
    `;
    list.appendChild(div);
  });
}

window.edit = function (i) {
  const q = questions[i];
  qInput.value = q.text;
  q.answers.forEach((a, idx) => answers[idx].value = a);
  correctSelect.value = q.correct;
  questions.splice(i, 1);
  renderList();
};

window.del = function (i) {
  if (!confirm("Delete?")) return;
  questions.splice(i, 1);
  localStorage.setItem("questions", JSON.stringify(questions));
  renderList();
};

/* ---------- QUIZ ---------- */

function startQuiz() {
  if (questions.length === 0) return alert("Add questions first");

  quizIndex = 0;
  score = 0;
  wrong = [];

  builder.classList.add("hidden");
  quiz.classList.remove("hidden");

  loadQuestion();
}

function loadQuestion() {
  selected = null;
  choicesDiv.innerHTML = "";

  const q = questions[quizIndex];
  quizQuestion.textContent = q.text;

  const shuffled = q.answers
    .map((t, i) => ({ t, i }))
    .sort(() => Math.random() - 0.5);

  shuffled.forEach(c => {
    const btn = document.createElement("button");
    btn.textContent = c.t;
    btn.onclick = () => {
      document.querySelectorAll("#choices button")
        .forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selected = c.i;
    };
    choicesDiv.appendChild(btn);
  });
}

function nextQuestion() {
  if (selected === null) return alert("Pick an answer");

  const q = questions[quizIndex];

  if (selected === q.correct) score++;
  else wrong.push({
    q: q.text,
    right: q.answers[q.correct],
    picked: q.answers[selected]
  });

  quizIndex++;

  if (quizIndex >= questions.length) finishQuiz();
  else loadQuestion();
}

function finishQuiz() {
  quiz.classList.add("hidden");
  results.classList.remove("hidden");

  const pct = Math.round((score / questions.length) * 100);
  scoreText.textContent = `Score: ${score}/${questions.length} (${pct}%)`;

  reviewDiv.innerHTML = wrong.map(w => `
    <p><strong>${w.q}</strong><br>
    <span style="color:red">Your answer: ${w.picked}</span><br>
    <span style="color:lightgreen">Correct: ${w.right}</span></p>
  `).join("");
}

function backToBuilder() {
  results.classList.add("hidden");
  builder.classList.remove("hidden");
}
