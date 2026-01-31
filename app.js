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

let quizzes = []; // stores multiple quizzes
let currentQuiz = null;
let currentQuestions = [];
let currentIndex = 0;
let answers = [];

// ===== Show / Hide Sections =====
function showBuilder() {
  menu.classList.add("hidden");
  quizSelect.classList.add("hidden");
  builder.classList.remove("hidden");
  questionList.innerHTML = "";
  currentQuestions = [];
  answers = [];
  currentIndex = 0;
}

function showQuizSelection() {
  menu.classList.add("hidden");
  builder.classList.add("hidden");
  quizSelect.classList.remove("hidden");
  renderQuizList();
}

function backToMenu() {
  builder.classList.add("hidden");
  quizSelect.classList.add("hidden");
  quizDiv.classList.add("hidden");
  results.classList.add("hidden");
  menu.classList.remove("hidden");
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
    `;
    questionList.appendChild(card);
  });
}

// ===== Delete Question =====
function deleteQuestion(index) {
  currentQuestions.splice(index,1);
  renderQuestionList();
}

// ===== Save Quiz =====
function saveQuiz() {
  const name = quizNameInput.value.trim();
  if (!name) return alert("Enter a quiz name!");
  quizzes.push({name, questions: [...currentQuestions]});
  quizNameInput.value = "";
  alert("Quiz saved!");
}

// ===== Render Quiz Selection =====
function renderQuizList() {
  quizListDiv.innerHTML = "";
  quizzes.forEach((qz,i) => {
    const btn = document.createElement("button");
    btn.innerText = qz.name;
    btn.onclick = () => startQuiz(qz);
    quizListDiv.appendChild(btn);
  });
}

// ===== Start Quiz =====
function startQuiz(quiz) {
  currentQuiz = quiz;
  currentQuestions = quiz.questions;
  currentIndex = 0;
  answers = [];
  quizSelect.classList.add("hidden");
  builder.classList.add("hidden");
  quizDiv.classList.remove("hidden");
  showQuestion();
}

// ===== Show Question =====
function showQuestion() {
  const qObj = currentQuestions[currentIndex];
  questionText.innerText = qObj.q;
  choices.innerHTML = "";

  qObj.answers.forEach((ans,i)=>{
    if(!ans) return;
    const btn = document.createElement("button");
    btn.innerText = qObj.answers.length===2 ? ans : `${String.fromCharCode(65+i)}. ${ans}`;
    btn.onclick = ()=>{
      document.querySelectorAll("#choices button").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected");
      answers[currentIndex] = i;
    };
    choices.appendChild(btn);
  });
  progressBar.style.width = ((currentIndex)/currentQuestions.length)*100 + "%";
}

// ===== Next Question =====
function nextQuestion() {
  if (answers[currentIndex]==null) return alert("Select an answer!");
  currentIndex++;
  if(currentIndex>=currentQuestions.length) finishQuiz();
  else showQuestion();
}

// ===== Finish Quiz =====
function finishQuiz() {
  quizDiv.classList.add("hidden");
  results.classList.remove("hidden");
  let correctCount = 0;
  let reviewHTML = "";
  currentQuestions.forEach((qObj,i)=>{
    if(answers[i]===qObj.correct) correctCount++;
    else {
      reviewHTML += `
        <div class="card">
          <strong>${qObj.q}</strong><br>
          <span class="wrong">Your answer: ${answers[i]!=null?qObj.answers[answers[i]]:"None"}</span><br>
          <span class="correct">Correct: ${qObj.answers[qObj.correct]}</span>
        </div>
      `;
    }
  });
  finalScore.innerText = `${correctCount}/${currentQuestions.length} (${Math.round(correctCount/currentQuestions.length*100)}%)`;
  review.innerHTML = reviewHTML || "<p>Perfect score 🎉</p>";
}
