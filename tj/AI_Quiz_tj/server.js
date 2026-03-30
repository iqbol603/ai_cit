const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Пайвастшавӣ ба MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/ai_quiz_db')
    .then(() => console.log("✅ Пайвастшавӣ ба MongoDB муваффақ буд!"))
    .catch(err => console.error("❌ Хатогии MongoDB:", err));

// Модели маълумот
const Quiz = mongoose.model('Quiz', new mongoose.Schema({ 
    section: String, 
    questions: Array 
}));

// API барои гирифтани саволҳо (бо филтри бахш)
app.get('/api/questions', async (req, res) => {
    try {
        const sectionName = req.query.section; 
        let data;
        
        if (sectionName && sectionName !== "all") {
            // Ҷустуҷӯ танҳо дар бахши мушаххас
            data = await Quiz.find({ section: sectionName });
        } else {
            // Гирифтани ҳамаи саволҳо
            data = await Quiz.find();
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Хато дар сервер" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер: http://localhost:${PORT}`);
});