let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 30;

// Function to fetch questions from server.js
async function loadQuestions(section = "all") {
    try {
        const response = await fetch(`/api/questions?section=${encodeURIComponent(section)}`);
        currentQuestions = await response.json();
        
        if (currentQuestions.length === 0) {
            alert("No questions found for this section.");
            return;
        }

        currentQuestionIndex = 0;
        score = 0;
        document.getElementById("score").innerText = score;
        showQuestion();
    } catch (error) {
        console.error("Error loading questions:", error);
    }
}

function showQuestion() {
    clearInterval(timer);
    timeLeft = 30;
    document.getElementById("timer-seconds").innerText = timeLeft;
    
    startTimer();

    const q = currentQuestions[currentQuestionIndex];
    document.getElementById("question").innerText = q.question;
    document.getElementById("current-question-num").innerText = currentQuestionIndex + 1;
    
    const optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = "";
    
    q.options.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.className = "btn btn-outline-dark text-start p-3";
        btn.onclick = () => checkAnswer(index);
        optionsContainer.appendChild(btn);
    });

    document.getElementById("explanation-box").classList.add("hidden");
    updateProgressBar();
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer-seconds").innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer(-1); // Time's up
        }
    }, 1000);
}

function checkAnswer(selectedIndex) {
    clearInterval(timer);
    const q = currentQuestions[currentQuestionIndex];
    const options = document.getElementById("options").children;
    
    if (selectedIndex === q.correct) {
        score += 10;
        document.getElementById("score").innerText = score;
        options[selectedIndex].classList.replace("btn-outline-dark", "btn-success");
        document.getElementById("sound-correct").play();
    } else {
        if (selectedIndex !== -1) {
            options[selectedIndex].classList.replace("btn-outline-dark", "btn-danger");
        }
        options[q.correct].classList.replace("btn-outline-dark", "btn-success");
        document.body.classList.add("shake");
        setTimeout(() => document.body.classList.remove("shake"), 500);
        document.getElementById("sound-wrong").play();
    }

    document.getElementById("explanation-text").innerText = q.explanation;
    document.getElementById("explanation-box").classList.remove("hidden");
    
    for (let btn of options) {
        btn.disabled = true;
    }
}

document.getElementById("next-btn").onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion();
    } else {
        alert(`Quiz finished! Your final score: ${score}`);
        location.reload();
    }
};

function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    document.getElementById("progress-bar").style.width = `${progress}%`;
}

// Initial load
window.onload = () => loadQuestions("all");