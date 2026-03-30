let allSections = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 30;

function init() {
    if (typeof quizData !== 'undefined') {
        allSections = quizData;
        renderMenu();
    } else {
        document.getElementById('quiz-content').innerHTML = `<p style="color:red">❌ Error: data.js not found!</p>`;
    }
}

function renderMenu() {
    if (timerInterval) clearInterval(timerInterval);
    const quizContent = document.getElementById('quiz-content');
    document.getElementById('status-bar').style.display = 'none';
    document.getElementById('progress-bar').style.width = '0%';

    let html = `<h1>Quiz Menu</h1><div class="section-list">`;
    const totalAll = allSections.reduce((s, b) => s + b.questions.length, 0);
    
    html += `<button class="section-btn all" onclick="setupQuiz('all')">
                <span>🌍 All Sections</span><small>${totalAll} questions</small>
             </button>`;

    allSections.forEach((item, index) => {
        html += `<button class="section-btn" onclick="setupQuiz(${index})">
                    <span>📦 ${item.section}</span><small>${item.questions.length} questions</small>
                 </button>`;
    });

    html += `</div>`;
    quizContent.innerHTML = html;
}

function setupQuiz(choice) {
    currentQuestions = (choice === 'all') ? 
        allSections.flatMap(s => s.questions) : 
        allSections[choice].questions;

    currentQuestions = [...currentQuestions].sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0;
    score = 0;
    
    document.getElementById('status-bar').style.display = 'flex';
    document.getElementById('total-questions').innerText = currentQuestions.length;
    document.getElementById('score').innerText = "0";
    displayQuestion();
}

function displayQuestion() {
    if (timerInterval) clearInterval(timerInterval);
    const q = currentQuestions[currentQuestionIndex];
    const quizContent = document.getElementById('quiz-content');
    
    document.getElementById('current-question-num').innerText = currentQuestionIndex + 1;
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    quizContent.innerHTML = `
        <div id="question-text">${q.question}</div>
        <div id="options" class="options-container"></div>
        <button id="skip-btn" class="next-btn skip-btn" onclick="skip()">Skip ⏭️</button>
        <div id="explanation-box" class="explanation-box hidden">
            <p id="explanation-text"></p>
            <button class="next-btn" onclick="goToNext()">Next Question ➔</button>
        </div>
    `;

    const optionsDiv = document.getElementById('options');
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => check(btn, opt, q.correct_answer, q.explanation);
        optionsDiv.appendChild(btn);
    });
    startTimer();
}

function startTimer() {
    timeLeft = 30;
    const timerDisplay = document.getElementById('timer');
    timerDisplay.innerText = timeLeft;
    timerDisplay.parentElement.classList.remove('timer-low');

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 10) timerDisplay.parentElement.classList.add('timer-low');
        if (timeLeft <= 0) { clearInterval(timerInterval); handleTimeOut(); }
    }, 1000);
}

function check(btn, selected, correct, info) {
    if (timerInterval) clearInterval(timerInterval);
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true);
    document.getElementById('skip-btn').classList.add('hidden');

    if (selected === correct) {
        btn.classList.add('pop');
        score++;
        document.getElementById('score').innerText = score;
        try { document.getElementById('sound-correct').play(); } catch(e){}
    } else {
        btn.classList.add('shake');
        btns.forEach(b => { if(b.innerText === correct) b.classList.add('correct-highlight'); });
        try { document.getElementById('sound-wrong').play(); } catch(e){}
    }

    document.getElementById('explanation-text').innerHTML = `<b>💡 Explanation:</b> ${info}`;
    document.getElementById('explanation-box').classList.remove('hidden');
}

function handleTimeOut() {
    check({classList: {add: ()=>{}}}, null, currentQuestions[currentQuestionIndex].correct_answer, "Time's up!");
}

function skip() { if (confirm("Skip this question?")) { if (timerInterval) clearInterval(timerInterval); goToNext(); } }

function goToNext() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) displayQuestion();
    else showResult();
}

function showResult() {
    const percent = Math.round((score / currentQuestions.length) * 100);
    let rank = percent === 100 ? "AI Scholar 🌟" : percent >= 80 ? "Specialist 🎓" : percent >= 50 ? "Novice 🌱" : "Seeker 📚";

    document.getElementById('status-bar').style.display = 'none';
    document.getElementById('quiz-content').innerHTML = `
        <div class="result-screen">
            <h2>🎉 Results</h2>
            <h1 style="color:#3182ce; font-size: 48px;">${percent}%</h1>
            <p style="font-weight:bold; margin-bottom:10px;">Rank: ${rank}</p>
            <p>Correct: ${score} out of ${currentQuestions.length}</p>
            <button class="next-btn" onclick="renderMenu()">Back to Menu</button>
        </div>
    `;
}

init();