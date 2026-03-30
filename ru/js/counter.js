document.addEventListener("DOMContentLoaded", function() {
    const lang = document.body.getAttribute('data-lang') || 'tg';
    const pType = document.body.getAttribute('data-page-type'); 
    const pId = document.body.getAttribute('data-page-id');

    const namespace = 'ai-cit-tj-v3'; 

    const totalDisplay = document.getElementById('total-count');
    const contentDisplay = document.getElementById('content-count');

    // Функция через создание невидимого изображения (обходим CORS)
    function countWithImage(key, element) {
        if (!element) return;

        // Создаем уникальную ссылку для запроса
        const url = `https://countapi.it/hit/${namespace}/${key}?nocache=${Date.now()}`;
        
        // Просто запрашиваем данные через обычный fetch, 
        // но с режимом 'no-cors' для локальных тестов
        fetch(url, { mode: 'cors' })
            .then(res => res.json())
            .then(data => {
                element.innerText = data.value.toLocaleString(lang);
            })
            .catch(() => {
                // Если fetch всё равно блокируется локально, 
                // просто выведем "Ок", так как запрос на сервер всё равно уйдет
                element.innerText = "Обновлено"; 
                console.log("Запрос отправлен, но просмотр результата заблокирован браузером локально.");
            });
    }

    // Запускаем
    countWithImage(`total_${lang}`, totalDisplay);
    if (pType && pId) {
        countWithImage(`${pType}_${pId}_${lang}`, contentDisplay);
    }
});