let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 20;

// Функсияи боркунии саволҳо
async function loadQuestions(section = 'all') {
    try {
        const url = section === 'all' ? '/api/questions' : `/api/questions?section=${encodeURIComponent(section)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        // Ҳамаи саволҳоро ба як массив меорем
        questions = data.flatMap(item => item.questions);
        
        if (questions.length > 0) {
            currentQuestionIndex = 0;
            score = 0;
            displayQuestion();
        } else {
            alert("Дар ин бахш саволҳо ёфт нашуданд!");
        }
    } catch (error) {
        console.error("Хато ҳангоми боркунӣ:", error);
    }
}

// Функсияи Таймер
function startTimer() {
    clearInterval(timer); // Тоза кардани таймери пешина
    timeLeft = 20;
    document.getElementById('timer-seconds').innerText = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-seconds').innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            timeOut(); // Вақте вақт тамом мешавад
        }
    }, 1000);
}

function timeOut() {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    document.getElementById('explanation-text').innerHTML = `<b style="color:red;">⏰ Вақт тамом шуд!</b>`;
    document.getElementById('explanation-box').classList.remove('hidden');
}

function displayQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById('question').innerText = q.question;
    document.getElementById('current-question-num').innerText = currentQuestionIndex + 1;
    document.getElementById('score').innerText = score;

    // Сатри пешрафт (Progress Bar)
    const progress = (currentQuestionIndex / questions.length) * 100;
    document.getElementById('progress-bar').style.width = progress + "%";

    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    document.getElementById('explanation-box').classList.add('hidden');

    q.options.forEach(option => {
        const btn = document.createElement('button');
        btn.innerText = option;
        btn.className = 'option-btn';
        btn.onclick = () => checkAnswer(btn, option, q.correct_answer, q.explanation);
        optionsDiv.appendChild(btn);
    });

    startTimer();
}

function checkAnswer(selectedBtn, selected, correct, explanation) {
    clearInterval(timer); // Боздошти таймер пас аз ҷавоб
    const buttons = document.querySelectorAll('.option-btn');
    const s_correct = document.getElementById('sound-correct');
    const s_wrong = document.getElementById('sound-wrong');
    
    buttons.forEach(btn => btn.disabled = true);

    if (selected === correct) {
        selectedBtn.classList.add('pop');
        if(s_correct) s_correct.play();
        score++;
    } else {
        selectedBtn.classList.add('shake');
        if(s_wrong) s_wrong.play();
        // Нишон додани ҷавоби дуруст
        buttons.forEach(btn => {
            if (btn.innerText === correct) btn.style.border = "2px solid #28a745";
        });
    }
    
    document.getElementById('explanation-text').innerHTML = `<b>💡 Тавзеҳ:</b> ${explanation}`;
    document.getElementById('explanation-box').classList.remove('hidden');
}

document.getElementById('next-btn').onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        alert(`Табрик! Тест ба охир расид. Натиҷа: ${score} аз ${questions.length}`);
        location.reload();
    }
};

// Дар аввал ҳамаи саволҳоро бор мекунад
loadQuestions();