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
const mainMenu = document.getElementById("mainMenu");
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
  results.classList.add("hidden");
  mainMenu.classList.remove("hidden");
};
document.getElementById("addBtn").onclick = addQuestion;
document.getElementById("nextBtn").onclick = nextQuestion;
document.getElementById("backBtn").onclick = () => {
  results.classList.add("hidden");
  mainMenu.classList.remove("hidden");
};
typeSelect.onchange = applyTypeUI;

/***********************
 INIT
************************/
applyTypeUI();
renderList();

/***********************
 TYPE UI
************************/
function applyTypeUI() {
  if(typeSelect.value === "tf") {
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
    answerInputs.forEach(a => a.style.display = "block");
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
  if(!qInput.value || correctSelect.value === ""){ alert("Fill everything"); return; }

  const ans = answerInputs.map(a => a.value.trim()).filter(a => a!=="");
  questions.push({
    text: qInput.value,
    type: typeSelect.value,
    answers: ans,
    correct: Number(correctSelect.value)
  });
  localStorage.setItem("questions", JSON.stringify(questions));
  clearBuilder();
  renderList();
}

function clearBuilder(){
  qInput.value="";
  answerInputs.forEach(a=>a.value="");
  correctSelect.value="";
}

function renderList(){
  list.innerHTML="";
  questions.forEach((q,i)=>{
    const div=document.createElement("div");
    div.className="card";
    div.innerHTML=`
      <strong>${i+1}. ${q.text}</strong><br><br>
      <button onclick="editQuestion(${i})">Edit</button>
      <button onclick="deleteQuestion(${i})">Delete</button>
    `;
    list.appendChild(div);
  });
}

window.editQuestion = function(i){
  const q = questions[i];
  qInput.value = q.text;
  typeSelect.value = q.type;
  applyTypeUI();
  q.answers.forEach((a,idx)=>answerInputs[idx].value = a);
  correctSelect.value = q.correct;
  questions.splice(i,1);
  localStorage.setItem("questions", JSON.stringify(questions));
  renderList();
};

window.deleteQuestion = function(i){
  if(!confirm("Delete this question?")) return;
  questions.splice(i,1);
  localStorage.setItem("questions", JSON.stringify(questions));
  renderList();
};

/***********************
 QUIZ
************************/
function startQuiz(){
  quizIndex=0;
  score=0;
  wrongAnswers=[];
  builder.classList.add("hidden");
  quiz.classList.remove("hidden");
  loadQuestion();
}

function loadQuestion(){
  selectedIndex=null;
  choicesDiv.innerHTML="";
  const q = questions[quizIndex];
  quizQuestion.textContent=q.text;
  const shuffled = q.answers.map((t,i)=>({t,i})).sort(()=>Math.random()-0.5);
  shuffled.forEach(c=>{
    const btn=document.createElement("button");
    btn.textContent=c.t;
    btn.onclick=()=>{
      document.querySelectorAll("#choices button").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedIndex=c.i;
    };
    choicesDiv.appendChild(btn);
  });
}

function nextQuestion(){
  if(selectedIndex===null){ alert("Pick an answer"); return; }
  const q = questions[quizIndex];
  if(selectedIndex === q.correct) score++;
  else wrongAnswers.push({question:q.text,picked:q.answers[selectedIndex],correct:q.answers[q.correct]});
  quizIndex++;
  quizIndex >= questions.length ? finishQuiz() : loadQuestion();
}

function finishQuiz(){
  quiz.classList.add("hidden");
  results.classList.remove("hidden");
  const pct = Math.round((score/questions.length)*100);
  scoreText.textContent = `Score: ${score}/${questions.length} (${pct}%)`;
  reviewDiv.innerHTML = wrongAnswers.map(w=>`
    <p>
      <strong>${w.question}</strong><br>
      <span style="color:red">Your Answer: ${w.picked}</span><br>
      <span style="color:lightgreen">Correct Answer: ${w.correct}</span>
    </p>
  `).join("");
}
