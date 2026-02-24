import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// --- CORS CONFIGURATION ---
// This ensures your Vercel frontend is allowed to talk to your Choreo backend
app.use(cors({
    origin: '*', // For development. For production, replace with your Vercel URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
const groq = new Groq({ apiKey: API_KEY });

// --- FLASHCARD GENERATION ENDPOINT ---
app.post('/api/generate-cards', async (req, res) => {
    const { documentContent, title, existingQuestions } = req.body;

    console.log(`Gen request received for: ${title}`);

    try {
        const avoidList = existingQuestions?.length > 0
            ? `DO NOT REPEAT these questions: ${existingQuestions.slice(-20).join(", ")}.`
            : "";

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an academic expert. Create exactly 30 unique flashcards based on the text. 
                    If the text is short, use your knowledge to provide 10 additional "Advanced Context" cards.
                    ${avoidList}
                    Return ONLY a JSON object: { "cards": [{ "question": "...", "answer": "..." }] }`
                },
                { role: "user", content: `Document: ${title}\nContent: ${documentContent}` }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const data = JSON.parse(completion.choices[0].message.content);
        // Ensure we always return an array
        res.json(data.cards || []);
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to generate cards" });
    }
});

// --- CHAT ENDPOINT ---
app.post('/api/chat', async (req, res) => {
    const { message, documentContent, conversationHistory } = req.body;
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: `Study Assistant context: ${documentContent}` },
                ...(conversationHistory || []),
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
        });
        res.json({ response: chatCompletion.choices[0]?.message?.content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));