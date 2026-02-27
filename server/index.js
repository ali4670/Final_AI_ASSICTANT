import './validate-env.js';
import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { connectDB } from './db.js';
import StudyProfile from './models/Study.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const groq = new Groq({ apiKey: GROQ_API_KEY });
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) 
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) 
    : null;

// --- UTILITY: CHUNK TEXT ---
const chunkText = (text, maxLength = 1000, overlap = 200) => {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        let end = start + maxLength;
        chunks.push(text.slice(start, end));
        start = end - overlap;
    }
    return chunks;
};

// --- INDEX DOCUMENT ENDPOINT ---
app.post('/api/index-document', async (req, res) => {
    const { documentId, content, userId } = req.body;

    if (!openai || !supabase) {
        return res.status(500).json({ error: "RAG not configured (OpenAI or Supabase missing)" });
    }

    try {
        const chunks = chunkText(content);
        console.log(`Indexing document ${documentId} into ${chunks.length} chunks`);

        for (const chunk of chunks) {
            const embeddingResponse = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
            });

            const embedding = embeddingResponse.data[0].embedding;

            const { error } = await supabase.from('document_chunks').insert({
                document_id: documentId,
                user_id: userId,
                content: chunk,
                embedding: embedding
            });

            if (error) throw error;
        }

        res.json({ message: "Indexing complete", chunks: chunks.length });
    } catch (error) {
        console.error("Indexing Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- FLASHCARD GENERATION ENDPOINT (NON-STREAMING) ---
app.post('/api/generate-cards', async (req, res) => {
    const { documentContent, title, existingQuestions, documentId } = req.body;

    try {
        let context = documentContent;

        // If content is too large, try to use RAG or just truncate
        if (context.length > 30000) {
            context = context.slice(0, 30000) + "... (truncated)";
        }

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
                { role: "user", content: `Document: ${title}\nContent: ${context}` }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            stream: false,
        });

        const responseData = JSON.parse(completion.choices[0].message.content);
        res.json(responseData.cards || []);
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to generate cards" });
    }
});

// --- CHAT ENDPOINT (STREAMING with RAG) ---
app.post('/api/chat', async (req, res) => {
    const { message, documentContent, conversationHistory, documentId } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        let context = documentContent;

        // RAG Retrieval if possible
        if (documentId && openai && supabase && documentContent.length > 5000) {
            const embeddingResponse = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: message,
            });
            const embedding = embeddingResponse.data[0].embedding;

            const { data: chunks, error } = await supabase.rpc('match_document_chunks', {
                query_embedding: embedding,
                match_threshold: 0.5,
                match_count: 5,
                p_document_id: documentId
            });

            if (!error && chunks) {
                context = chunks.map(c => c.content).join("\n---\n");
            }
        } else if (context.length > 30000) {
            context = context.slice(0, 30000);
        }

        const stream = await groq.chat.completions.create({
            messages: [
                { role: "system", content: `Study Assistant context:\n${context}` },
                ...(conversationHistory || []),
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error("Chat AI Error:", error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

// --- SAVE STUDY PROFILE ---
app.post("/api/save-study", async (req, res) => {
    try {
        const { age, subjects } = req.body;
        const newProfile = new StudyProfile({ age, subjects });
        await newProfile.save();
        res.json({ message: "Study profile saved successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Unified Server running on port ${PORT}`));
