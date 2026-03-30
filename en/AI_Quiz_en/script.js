let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 20;

// 1. Функция загрузки вопросов
async function loadQuestions(section = 'all') {
    try {
        const url = section === 'all' ? '/api/questions' : `/api/questions?section=${encodeURIComponent(section)}`;
        console.log("Запрос по адресу:", url); // Увидим, куда идет запрос
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log("Данные от сервера:", data); // Увидим, ЧТО пришло из базы

        // Если в базе данные лежат как [{ section: "...", questions: [...] }]
        questions = data.flatMap(item => item.questions);
        
        if (questions && questions.length > 0) {
            currentQuestionIndex = 0;
            score = 0;
            displayQuestion();
        } else {
            console.error("Массив вопросов пуст для раздела:", section);
            alert("Вопросы не найдены. Проверьте консоль (F12)");
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
    }
}
// 2. Функция запуска таймера
function startTimer() {
    clearInterval(timer); // Сброс предыдущего таймера
    timeLeft = 20;
    const timerElement = document.getElementById('timer-seconds');
    timerElement.innerText = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        timerElement.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            timeOut();
        }
    }, 1000);
}

// 3. Если время вышло
function timeOut() {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    document.getElementById('explanation-text').innerHTML = `<b style="color:red;">⏰ Время истекло!</b>`;
    document.getElementById('explanation-box').classList.remove('hidden');
}

// 4. Отображение вопроса
function displayQuestion() {
    const q = questions[currentQuestionIndex];
    
    // Обновляем текст вопроса и счетчики
    document.getElementById('question').innerText = q.question;
    document.getElementById('current-question-num').innerText = currentQuestionIndex + 1;
    document.getElementById('score').innerText = score;

    // Прогресс-бар
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    document.getElementById('progress-bar').style.width = progress + "%";

    // Очищаем варианты ответов
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    document.getElementById('explanation-box').classList.add('hidden');

    // Создаем кнопки ответов
    q.options.forEach(option => {
        const btn = document.createElement('button');
        btn.innerText = option;
        btn.className = 'option-btn btn btn-outline-dark w-100 mb-2'; // Добавил классы Bootstrap
        btn.onclick = () => checkAnswer(btn, option, q.correct_answer, q.explanation);
        optionsDiv.appendChild(btn);
    });

    startTimer(); // Запускаем таймер ДЛЯ КАЖДОГО вопроса
}

// 5. Проверка ответа
function checkAnswer(selectedBtn, selected, correct, explanation) {
    clearInterval(timer); // Останавливаем таймер при клике
    const buttons = document.querySelectorAll('.option-btn');
    const s_correct = document.getElementById('sound-correct');
    const s_wrong = document.getElementById('sound-wrong');
    
    buttons.forEach(btn => btn.disabled = true);

    if (selected === correct) {
        selectedBtn.classList.add('btn-success');
        selectedBtn.classList.remove('btn-outline-dark');
        if(s_correct) s_correct.play();
        score++;
    } else {
        selectedBtn.classList.add('btn-danger');
        selectedBtn.classList.remove('btn-outline-dark');
        if(s_wrong) s_wrong.play();
        
        // Подсвечиваем правильный
        buttons.forEach(btn => {
            if (btn.innerText === correct) {
                btn.classList.add('btn-success');
                btn.classList.remove('btn-outline-dark');
            }
        });
    }
    
    document.getElementById('explanation-text').innerHTML = `<b>💡 Пояснение:</b> ${explanation}`;
    document.getElementById('explanation-box').classList.remove('hidden');
}

// 6. Кнопка "Следующий вопрос"
document.getElementById('next-btn').onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        alert(`Тест завершен! Ваш результат: ${score} из ${questions.length}`);
        location.reload(); // Перезагрузка для нового теста
    }
};