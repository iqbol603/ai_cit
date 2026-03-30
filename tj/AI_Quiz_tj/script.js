// Ин суроғаи мустақим аст
const API_URL = 'http://localhost:3000/api/questions';
let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// 1. Гирифтани саволҳо аз API
async function fetchQuestions() {
    try {
        console.log("Кӯшиши гирифтани саволҳо аз сервер...");
        const response = await fetch('/api/questions');
        
        if (!response.ok) {
            throw new Error(`Хатогии сервер: ${response.status}`);
        }

        questions = await response.json();
        console.log("Саволҳо бор шуданд. Теъдод:", questions.length);

        if (questions.length > 0) {
            displayQuestion();
        } else {
            document.getElementById('quiz-container').innerHTML = "База холӣ аст ё саволҳо бор нашуданд.";
        }
    } catch (error) {
        console.error("Хатогӣ ҳангоми боркунӣ:", error);
        document.getElementById('quiz-container').innerHTML = `Хатогӣ: ${error.message}`;
    }
}

// 2. Нишон додани савол
function displayQuestion() {
    const q = questions[currentQuestionIndex];
    const container = document.getElementById('quiz-container');

    container.innerHTML = `
        <div class="quiz-card p-4 shadow rounded bg-white">
            <h6 class="text-muted">Саволи ${currentQuestionIndex + 1} аз ${questions.length}</h6>
            <h4 class="mb-4">${q.question}</h4>
            <div id="options" class="d-grid gap-2">
                ${q.options.map(opt => `
                    <button class="btn btn-outline-primary text-start p-3" onclick="checkAnswer('${opt}')">
                        ${opt}
                    </button>
                `).join('')}
            </div>
            <div id="explanation-box" class="alert mt-3" style="display:none;"></div>
            <button id="next-btn" class="btn btn-dark mt-3 w-100" style="display:none;" onclick="nextQuestion()">Саволи навбатӣ →</button>
        </div>
    `;
}

// 3. Санҷиши ҷавоб
function checkAnswer(selected) {
    const q = questions[currentQuestionIndex];
    const box = document.getElementById('explanation-box');
    const buttons = document.querySelectorAll('#options button');

    buttons.forEach(b => b.disabled = true);

    if (selected === q.answer) {
        score++;
        box.className = "alert alert-success mt-3";
        box.innerHTML = `<strong>Дуруст!</strong><br>${q.explanation || ""}`;
    } else {
        box.className = "alert alert-danger mt-3";
        box.innerHTML = `<strong>Хато!</strong> Ҷавоби дуруст: ${q.answer}<br><br><em>Шарҳ:</em> ${q.explanation || "Шарҳ мавҷуд нест."}`;
    }

    box.style.display = 'block';
    document.getElementById('next-btn').style.display = 'block';
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        document.getElementById('quiz-container').innerHTML = `
            <div class="text-center p-5 bg-light rounded shadow">
                <h2>Тест анҷом ёфт!</h2>
                <p class="fs-4">Шумо ба <strong>${score}</strong> аз ${questions.length} савол ҷавоб додед.</p>
                <button class="btn btn-primary" onclick="location.reload()">Аз нав оғоз кардан</button>
            </div>
        `;
    }
}

// Оғоз
fetchQuestions();
