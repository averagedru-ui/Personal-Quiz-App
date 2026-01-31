let questions = [];
let currentIndex = 0;
let answers = [];

/* ===== TOGGLE TF ===== */
document.getElementById("type").addEventListener("change", () => {
  const isTF = type.value === "tf";
  document.getElementById("mc").classList.toggle("hidden", isTF);
  document.getElementById("tf").classList.toggle("hidden", !isTF);
});

/* ===== ADD QUESTION ===== */
function addQuestion() {
  const qText = q.value.trim();
  if (!qText) return;

  const typeVal = type.value;
  let question;

  if (typeVal === "mc") {
    question = {
      q: qText,
      answers: [a1.value, a2.value, a3.value, a4.value],
      correct: parseInt(correct.value)
    };
  } else {
    question = {
      q: qText,
      answers: ["True", "False"],
      correct: parseInt(tfCorrect.value)
    };
  }

  questions.push(question);
  questionList.innerHTML += `<div class="card">${qText}</div>`;
  q.value = "";
}

/* ===== START QUIZ ===== */
function startQuiz() {
  if (!questions.length) return;
  builder.classList.add("hidden");
  quiz.classList.remove("hidden");
  currentIndex = 0;
  answers = [];
  showQuestion();
}

/* ===== SHOW QUESTION ===== */
function showQuestion() {
  const q = questions[currentIndex];
  questionText.innerText = q.q;
  choices.innerHTML = "";

  q.answers.forEach((a, i) => {
    const btn = document.createElement("button");
    btn.innerText = `${String.fromCharCode(65 + i)}. ${a}`;
    btn.onclick = () => {
      document.querySelectorAll("#choices button").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      answers[currentIndex] = i;
    };
    choices.appendChild(btn);
  });

  progressBar.style.width =
    ((currentIndex + 1) / questions.length) * 100 + "%";
}

/* ===== NEXT ===== */
function nextQuestion() {
  if (answers[currentIndex] == null) return;
  currentIndex++;
  currentIndex >= questions.length ? finishQuiz() : showQuestion();
}

/* ===== FINISH ===== */
function finishQuiz() {
  quiz.classList.add("hidden");
  results.classList.remove("hidden");

  let correctCount = 0;
  let reviewHTML = "";

  questions.forEach((q, i) => {
    if (answers[i] === q.correct) correctCount++;
    else {
      reviewHTML += `
        <div class="card">
          <strong>${q.q}</strong><br>
          <span class="wrong">Your answer: ${q.answers[answers[i]]}</span><br>
          <span class="correct">Correct: ${q.answers[q.correct]}</span>
        </div>
      `;
    }
  });

  finalScore.innerText =
    `${correctCount}/${questions.length} (${Math.round(correctCount / questions.length * 100)}%)`;

  review.innerHTML = reviewHTML || "<p>Perfect score 🎉</p>";
}

/* ===== RESET ===== */
function restart() {
  results.classList.add("hidden");
  builder.classList.remove("hidden");
}
