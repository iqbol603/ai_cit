let allSectionsData = []; // Маълумот аз MongoDB
let currentQuestions = []; // Саволҳои бахши интихобшуда
let currentIndex = 0;
let score = 0;
let timer;

// 1. Боркунии додаҳо аз API
async function initQuiz() {
    try {
        // Суроғаи API-и шумо
        //const response = await fetch('http://localhost:3000/api/questions');
	const response = await fetch('/api/questions/tj');
        allSectionsData = await response.json();
        
        console.log("Додаҳо аз сервер гирифта шуданд:", allSectionsData);

        const select = document.getElementById('section-select');
        const statTotal = document.getElementById('stat-total');
        
        if (!allSectionsData || allSectionsData.length === 0) {
            select.innerHTML = '<option>Саволҳо ёфт нашуданд</option>';
            return;
        }

        let totalQCount = 0;
        select.innerHTML = '<option value="">-- Бахшро интихоб кунед --</option>';

        allSectionsData.forEach((item) => {
            if (item.section) {
                const opt = document.createElement('option');
                opt.value = item.section;
                opt.textContent = item.section;
                select.appendChild(opt);
                
                // Ҳисоб кардани шумораи умумии саволҳо дар база
                if(item.questions) totalQCount += item.questions.length;
            }
        });

        if (statTotal) statTotal.innerText = totalQCount;

        // Гӯш кардани тағйироти меню
        select.addEventListener('change', (e) => {
            if (e.target.value) startQuiz(e.target.value);
        });

    } catch (err) {
        console.error("Хато ҳангоми боргирӣ:", err);
        const setupBox = document.getElementById('setup-container');
        if(setupBox) {
            setupBox.innerHTML = `<h4 class='text-danger'>Хато дар пайвастшавӣ бо сервер!</h4>
                                  <p>Боварӣ ҳосил кунед, ки 'node server.js' фаъол аст.</p>`;
        }
    }
}

// 2. Оғози тест
function startQuiz(sectionName) {
    const sectionData = allSectionsData.find(s => s.section === sectionName);
    if (!sectionData) return;

    currentQuestions = sectionData.questions;
    currentIndex = 0;
    score = 0;

    document.getElementById('section-title').innerText = sectionName;
    document.getElementById('setup-container').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');

    displayQuestion();
}

// 3. Намоиши савол
function displayQuestion() {
    if (currentIndex >= currentQuestions.length) {
        showResult();
        return;
    }

    const q = currentQuestions[currentIndex];
    
    // Элементҳои интерфейс
    document.getElementById('question').innerText = q.question;
    document.getElementById('current-question-num').innerText = currentIndex + 1;
    document.getElementById('total-questions').innerText = currentQuestions.length;
    document.getElementById('score').innerText = score;
    document.getElementById('explanation-box').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');

    // Навсозии Progress Bar
    const progress = (currentIndex / currentQuestions.length) * 100;
    document.getElementById('progress-bar').style.width = progress + "%";

    const optionsBox = document.getElementById('options');
    optionsBox.innerHTML = '';

    // Сохтани тугмаҳо барои вариантҳо
    q.options.forEach(opt => {
        if (opt) {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt;
            
            // Муайян кардани ҷавоби дуруст (аз ду калиди мумкин)
            const rightAnswer = q.correct_answer || q.answer;
            
            btn.onclick = () => checkAnswer(btn, opt, rightAnswer, q.explanation);
            optionsBox.appendChild(btn);
        }
    });

    startTimer();
}

// 4. Функсияи ёрирасон барои тоза кардани матн (Нормализатсия)
function normalizeText(text) {
    if (!text) return "";
    return String(text)
        .trim()
        .toLowerCase()
        .normalize("NFC")
        .replace(/\s+/g, ' '); // Нест кардани фазоҳои зиёдатӣ
}

// 5. Санҷиши ҷавоб
function checkAnswer(selectedBtn, selected, correct, explanation) {
    clearInterval(timer);
    const buttons = document.querySelectorAll('.option-btn');
    const s_correct = document.getElementById('sound-correct');
    const s_wrong = document.getElementById('sound-wrong');
    
    buttons.forEach(btn => btn.disabled = true);

    // Муқоисаи мантиқӣ
    const isCorrect = normalizeText(selected) === normalizeText(correct);

    if (isCorrect) {
        selectedBtn.classList.add('correct-anim');
        if (s_correct) s_correct.play().catch(e => {});
        score++;
        document.getElementById('score').innerText = score;
    } else {
        selectedBtn.classList.add('wrong-anim');
        if (s_wrong) s_wrong.play().catch(e => {});
        
        // Нишон додани ҷавоби дуруст ба корбар
        buttons.forEach(btn => {
            if (normalizeText(btn.innerText) === normalizeText(correct)) {
                btn.style.border = "3px solid #27ae60";
                btn.style.color = "#27ae60";
                btn.style.fontWeight = "bold";
            }
        });
    }

    // Намоиши шарҳ ва тугмаи "Баъдӣ"
    document.getElementById('explanation-text').innerHTML = `<b>💡 Тавзеҳ:</b> ${explanation || "Шарҳ мавҷуд нест."}`;
    document.getElementById('explanation-box').classList.remove('hidden');
    document.getElementById('next-btn').classList.remove('hidden');

    const progress = ((currentIndex + 1) / currentQuestions.length) * 100;
    document.getElementById('progress-bar').style.width = progress + "%";
}

// 6. Таймер (30 сония барои ҳар як савол)
function startTimer() {
    let timeLeft = 30;
    const timerEl = document.getElementById('timer-seconds');
    timerEl.innerText = timeLeft;
    
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timerEl.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            // Агар вақт тамом шавад, ба таври худкор ба саволи баъдӣ мегузарад
            currentIndex++;
            displayQuestion();
        }
    }, 1000);
}

// 7. Натиҷаи ниҳоӣ
function showResult() {
    const quizContainer = document.getElementById('quiz-container');
    const percent = Math.round((score / currentQuestions.length) * 100);
    
    let message = percent >= 80 ? "Аъло! Шумо мутахассиси воқеӣ ҳастед! 🏆" : 
                  percent >= 50 ? "Натиҷаи хуб! Боз каме кӯшиш кунед. 👍" : 
                  "Кӯшиш кунед, ки маводҳоро бори дигар хонед. 📚";

    quizContainer.innerHTML = `
        <div class="text-center py-5">
            <h1 class="display-4 fw-bold text-primary mb-4">Натиҷа</h1>
            <p class="fs-2">Ҷавобҳои дуруст: <span class="text-success">${score}</span> аз ${currentQuestions.length}</p>
            <div class="progress mb-4" style="height: 30px;">
                <div