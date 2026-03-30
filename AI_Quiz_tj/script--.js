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
        document.getElementById('quiz-content').innerHTML = "❌ Хато: data.js ёфт нашуд!";
    }
}

function renderMenu() {
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('status-bar').style.display = 'none';
    let html = `<h1>Тести ҲМ</h1><div class="section-list">`;
    const totalAll = allSections.reduce((s, b) => s + b.questions.length, 0);
    html += `<button class="section-btn all" onclick="setupQuiz('all')"><span>🌍 Ҳамаи бахшҳо</span><small>${totalAll} савол</small></button>`;
    allSections.forEach((item, index) => {
        html += `<button class="section-btn" onclick="setupQuiz(${index})"><span>📦 ${item.section}</span><small>${item.questions.length} савол</small></button>`;
    });
    document.getElementById('quiz-content').innerHTML = html + `</div>`;
}

function setupQuiz(choice) {
    currentQuestions = (choice === 'all') ? allSections.flatMap(s => s.questions) : allSections[choice].questions;
    currentQuestions = [...currentQuestions].sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0; score = 0;
    document.getElementById('status-bar').style.display = 'flex';
    displayQuestion();
}

function displayQuestion() {
    if (timerInterval) clearInterval(timerInterval);
    const q = currentQuestions[currentQuestionIndex];
    document.getElementById('current-question-num').innerText = currentQuestionIndex + 1;
    document.getElementById('total-questions').innerText = currentQuestions.length;
    
    document.getElementById('quiz-content').innerHTML = `
        <div id="question-text">${q.question}</div>
        <div id="options" class="options-container"></div>
        <div id="explanation-box" class="explanation-box hidden">
            <p id="explanation-text"></p>
            <button class="next-btn" onclick="goToNext()">Саволи навбатӣ ➔</button>
        </div>`;

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => check(btn, opt, q.correct_answer, q.explanation);
        document.getElementById('options').appendChild(btn);
    });
    startTimer();
}

function startTimer() {
    timeLeft = 30;
    const timerDisplay = document.getElementById('timer');
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) { clearInterval(timerInterval); goToNext(); }
    }, 1000);
}

function check(btn, selected, correct, info) {
    clearInterval(timerInterval);
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true);
    if (selected === correct) { btn.classList.add('pop'); score++; } 
    else { btn.classList.add('shake'); btns.forEach(b => { if(b.innerText === correct) b.classList.add('correct-highlight'); }); }
    document.getElementById('explanation-text').innerHTML = `<b>💡 Тавзеҳ:</b> ${info}`;
    document.getElementById('explanation-box').classList.remove('hidden');
}

function goToNext() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) displayQuestion();
    else showResult();
}

function showResult() {
    const percent = Math.round((score / currentQuestions.length) * 100);
    let rank = percent === 100 ? "Донишманди ҲМ" : percent >= 80 ? "Мутахассис" : percent >= 50 ? "Навомӯз" : "Ҷӯянда";
    document.getElementById('status-bar').style.display = 'none';
    document.getElementById('quiz-content').innerHTML = `
        <div class="result-screen">
            <h2>Натиҷа</h2>
            <h1>${percent}%</h1>
            <div class="rank-badge" style="background:#3182ce">Унвон: ${rank}</div>
            <p>Дуруст: ${score} аз ${currentQuestions.length}</p>
            <button class="next-btn" onclick="renderMenu()">Бозгашт</button>
        </div>`;
}
init();