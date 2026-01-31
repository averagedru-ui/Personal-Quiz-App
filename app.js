/***********************
  GLOBAL STATE
************************/
let quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
let currentQuiz = null;
let quizIndex = 0;
let score = 0;
let selectedAnswer = null;
let shuffledChoices = [];
let wrongAnswers = [];

/***********************
  DOM READY
************************/
document.addEventListener("DOMContentLoaded", () => {
  renderQuestionList();
});

/***********************
  BUILDER LOGIC
************************/
const qInput = document.getElementById("q");
const typeSelect = document.getElementById("type");
const aInputs = [
  document.getElementById("a1"),
  document.getElementById("a2"),
  document.getElementById("a3"),
  document.getElementById("a4")
];
const correctSelect = document.getElementById("correct");
const questionList = document.getElementById("questionList");

typeSelect.addEventListener("change", handleTypeChange);

function handleTypeChange() {
  if (typeSelect.value === "tf") {
    aInputs[0].value = "True";
    aInputs[1].value = "False";
    aInputs[2].value = "";
    aInputs[3].value = "";

    aInputs[2].style.display = "none";
    aInputs[3].style.display = "none";

    correctSelect.innerHTML = `
      <option value="">Correct Answer</option>
      <option value="0">True</option>
      <option value="1">False</option>
    `;
  } else {
    aInputs.forEach(i => i.style.display = "block");

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
  if (!qInput.value || correctSelect.value === "") return alert("Fill all fields");

  const answers = aInputs
    .map(i => i.value.trim())
    .filter(a => a !== "");

  const question = {
    text: qInput.value,
    type: typeSelect.value,
    answers,
    correct: Number(correctSelect.value)
  };

  quizzes.push(question);
  saveData();
  clearInputs();
  renderQuestionList();
}

function clearInputs() {
  qInput.value = "";
  aInputs.forEach(i => i.value = "");
  correctSelect.value = "";
}

function renderQuestionList() {
  questionList.innerHTML = "";

  quizzes.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>${index + 1}. ${q.text}</strong>
      <br><small>${q.type === "tf" ? "True / False" : "Multiple Choice"}</small>
      <br><br>
      <button onclick="editQuestion(${index})">Edit</button>
      <button onclick="deleteQuestion(${index})">Delete</button>
    `;
    questionList.appendChild(div);
  });
}

function deleteQuestion(index) {
  if (!confirm("Delete this question?")) return;
  quizzes.splice(index, 1);
  saveData();
  renderQuestionList();
}

function editQuestion(index) {
  const q = quizzes[index];
  qInput.value = q.text;
  typeSelect.value = q.type;
  handleTypeChange();

  q.answers.forEach((a, i) => aInputs[i].value = a);
  correctSelect.value = q.correct;

  quizzes.splice(index, 1);
  saveData();
  renderQuestionList();
}

/***********************
  QUIZ LOGIC
************************/
const builder = document.getElementById("builder");
const quiz = document.getElementById("quiz");
const finishMenu = document.getElementById("finishMenu");
const questionText = document.getElementById("questionText");
const choicesDiv = document.getElementById("choices");
const progressBar = document.getElementById("progressBar");
const finalScore = document.getElementById("finalScore");

function startQuiz() {
  if (quizzes.length === 0) return alert("Add questions first");

  currentQuiz = [...quizzes];
  quizIndex = 0;
  score = 0;
  wrongAnswers = [];

  builder.classList.add("hidden");
  quiz.classList.remove("hidden");

  loadQuestion();
}

function loadQuestion() {
  selectedAnswer = null;
  choicesDiv.innerHTML = "";

  const q = currentQuiz[quizIndex];
  questionText.textContent = q.text;

  shuffledChoices = q.answers.map((text, index) => ({ text, index }));
  shuffledChoices.sort(() => Math.random() - 0.5);

  shuffledChoices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => selectAnswer(btn, choice.index);
    choicesDiv.appendChild(btn);
  });

  updateProgress();
  saveProgress();
}

function selectAnswer(btn, index) {
  document.querySelectorAll("#choices button")
    .forEach(b => b.classList.remove("selected"));

  btn.classList.add("selected");
  selectedAnswer = index;
}

function nextQuestion() {
  if (selectedAnswer === null) return alert("Select an answer");

  const q = currentQuiz[quizIndex];
  if (selectedAnswer === q.correct) {
    score++;
  } else {
    wrongAnswers.push({
      question: q.text,
      correct: q.answers[q.correct],
      selected: q.answers[selectedAnswer]
    });
  }

  quizIndex++;

  if (quizIndex >= currentQuiz.length) {
    finishQuiz();
  } else {
    loadQuestion();
  }
}

function finishQuiz() {
  quiz.classList.add("hidden");
  finishMenu.classList.remove("hidden");

  const percent = Math.round((score / currentQuiz.length) * 100);
  finalScore.innerHTML = `
    Score: ${score}/${currentQuiz.length} (${percent}%)
    <hr>
    ${wrongAnswers.map(w => `
      <p><strong>${w.question}</strong><br>
      <span style="color:red">Your Answer: ${w.selected}</span><br>
      <span style="color:lightgreen">Correct Answer: ${w.correct}</span>
      </p>
    `).join("")}
  `;

  localStorage.removeItem("quizProgress");
}

function restartQuiz() {
  finishMenu.classList.add("hidden");
  startQuiz();
}

function exitQuiz() {
  finishMenu.classList.add("hidden");
  builder.classList.remove("hidden");
}

/***********************
  PROGRESS + STORAGE
************************/
function updateProgress() {
  const percent = ((quizIndex) / currentQuiz.length) * 100;
  progressBar.style.width = percent + "%";
}

function saveData() {
  localStorage.setItem("quizzes", JSON.stringify(quizzes));
}

function saveProgress() {
  localStorage.setItem("quizProgress", JSON.stringify({
    quizIndex,
    score,
    currentQuiz,
    wrongAnswers
  }));
}
