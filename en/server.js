const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Танзимот
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/'))); // Дастрасӣ ба ҳамаи папкаҳо

// Пайвастшавӣ ба MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/ai_platform')
    .then(() => console.log('Пайвастшавӣ ба MongoDB муваффақ буд...'))
    .catch(err => console.error('Хатогӣ дар пайвастшавӣ:', err));

// --- Схемаҳо ва Моделҳо ---

// Схема барои Тестҳо
const quizSchema = new mongoose.Schema({
    section: String,
    question: String,
    options: [String],
    answer: String,
    explanation: String
});

// Схема барои Мақолаҳо
const articleSchema = new mongoose.Schema({
    id: String,
    title: String,
    section: String,
    content: String,
    category: String
});

// Моделҳои забони тоҷикӣ
const QuizTJ = mongoose.model('QuizTJ', quizSchema, 'quizzes_tj');
const ArticleTJ = mongoose.model('ArticleTJ', articleSchema, 'articles_tj');

// --- API Роҳҳо (Routes) ---

// 1. Гирифтани саволҳои тест
app.get('/api/questions', async (req, res) => {
    try {
        const { section } = req.query;
        let query = {};
        if (section && section !== 'all') {
            query.section = section;
        }
        const questions = await QuizTJ.find(query);
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: "Хатогии сервер ҳангоми боркунии саволҳо" });
    }
});

// 2. Гирифтани рӯйхати мақолаҳо
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await ArticleTJ.find({}, { content: 0 }); // Муҳтаворо намегирем барои рӯйхат
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: "Хатогӣ ҳангоми боркунии рӯйхати мақолаҳо" });
    }
});

// 3. Гирифтани матни пурраи як мақола
app.get('/api/articles/:id', async (req, res) => {
    try {
        const article = await ArticleTJ.findOne({ id: req.params.id });
        if (!article) return res.status(404).json({ error: "Мақола ёфт нашуд" });
        res.json(article);
    } catch (err) {
        res.status(500).json({ error: "Хатогӣ ҳангоми боркунии мақола" });
    }
});

// Оғози сервер
app.listen(PORT, () => {
    console.log(`Сервер дар http://localhost:${PORT} фаъол шуд`);
});