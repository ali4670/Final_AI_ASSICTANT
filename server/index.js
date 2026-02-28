import './validate-env.js';
import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { connectDB } from './db.js';
import StudyProfile from './models/Study.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GROQ_API_KEY) {
    console.warn("WARNING: GROQ_API_KEY is not defined in environment variables.");
}

const groq = new Groq({ apiKey: GROQ_API_KEY || 'MISSING_KEY' });
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) 
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) 
    : null;

import SpotifyWebApi from 'spotify-web-api-node';

// Spotify Configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback'; // Default for local dev

const spotifyApi = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    redirectUri: SPOTIFY_REDIRECT_URI,
});

// --- SPOTIFY OAUTH ENDPOINTS ---
app.get('/api/spotify/login', (req, res) => {
    console.log('Spotify login initiated');
    const scopes = [
        'user-read-private',
        'user-read-email',
        'streaming',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-library-read',
        'user-read-currently-playing',
    ];
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/api/spotify/callback', async (req, res) => {
    const code = req.query.code || null;

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token, expires_in } = data.body;

        // Redirect back to frontend with tokens
        const frontendUrl = process.env.VITE_FRONTEND_URL || 'http://localhost:5173';
        res.redirect(
            `${frontendUrl}/callback?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`
        );
    } catch (error) {
        console.error('Error during Spotify callback:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

app.get('/api/spotify/refresh_token', async (req, res) => {
    const refreshToken = req.query.refresh_token;
    spotifyApi.setRefreshToken(refreshToken);

    try {
        const data = await spotifyApi.refreshAccessToken();
        const { access_token, expires_in } = data.body;
        res.json({ access_token, expires_in });
    } catch (error) {
        console.error('Error refreshing Spotify access token:', error);
        res.status(500).json({ error: 'Could not refresh token' });
    }
});


// --- FALLBACK STORAGE (if MongoDB is missing) ---
const LOCAL_DB_PATH = path.join(process.cwd(), 'study_data.json');
const getLocalData = () => {
    if (!fs.existsSync(LOCAL_DB_PATH)) return {};
    try {
        const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
};
const saveLocalData = (data) => {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
};

// --- DOCUMENT INDEXING ---
app.post('/api/index-document', async (req, res) => {
    const { documentId, content, userId } = req.body;
    console.log(`Indexing document ${documentId} for user ${userId}`);
    // In a real app, this might involve vector embeddings.
    // For now, we'll just acknowledge receipt.
    res.json({ success: true, message: "Document indexed for search" });
});

// --- GENERATE FLASHCARDS ---
app.post('/api/generate-cards', async (req, res) => {
    const { documentContent, title, documentId, count = 10, existingQuestions = [] } = req.body;
    
    try {
        const prompt = `Based on the following document titled "${title}", generate ${count} high-quality flashcards for studying. Each flashcard must have a "question" and an "answer". 
        Return ONLY a valid JSON array of objects with "question" and "answer" keys. Do not include markdown code blocks, just the raw JSON.
        
        ${existingQuestions.length > 0 ? `AVOID these existing questions: ${existingQuestions.join(', ')}` : ''}

        Document Content:
        ${documentContent.slice(0, 15000)}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a JSON-only response bot. You output pure JSON arrays without markdown or explanation." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 3000,
        });

        let cardsText = completion.choices[0]?.message?.content || "[]";
        
        try {
            cardsText = cardsText.replace(/```json/g, '').replace(/```/g, '').trim();
            const cards = JSON.parse(cardsText);
            res.json(cards);
        } catch (parseError) {
            console.error("AI JSON Parse Error. Raw content:", cardsText);
            const jsonMatch = cardsText.match(/\[.*\]/s);
            if (jsonMatch) {
                const cards = JSON.parse(jsonMatch[0]);
                res.json(cards);
            } else {
                throw new Error("Could not extract valid JSON from AI response");
            }
        }
    } catch (error) {
        console.error("Flashcard generation error:", error);
        res.status(500).json({ error: "Failed to generate flashcards: " + error.message });
    }
});

// --- GENERATE QUIZ ---
app.post('/api/generate-quiz', async (req, res) => {
    const { documentContent, title, count = 10 } = req.body;
    
    try {
        const prompt = `Based on the following document titled "${title}", generate a quiz with ${count} multiple-choice questions. 
        Each question should have:
        1. "question": The question text.
        2. "options": An array of 4 possible answers.
        3. "answer": The string of the correct answer from the options.
        4. "explanation": A brief explanation of the correct answer.
        
        Return ONLY a valid JSON array of these objects. Do not include markdown code blocks.
        
        Document Content:
        ${documentContent.slice(0, 15000)}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a JSON-only response bot. You output pure JSON arrays without markdown or explanation." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 3000,
        });

        let quizText = completion.choices[0]?.message?.content || "[]";
        
        try {
            quizText = quizText.replace(/```json/g, '').replace(/```/g, '').trim();
            const quiz = JSON.parse(quizText);
            res.json(quiz);
        } catch (parseError) {
            console.error("AI Quiz JSON Parse Error. Raw content:", quizText);
            const jsonMatch = quizText.match(/\[.*\]/s);
            if (jsonMatch) {
                const quiz = JSON.parse(jsonMatch[0]);
                res.json(quiz);
            } else {
                throw new Error("Could not extract valid JSON from AI response");
            }
        }
    } catch (error) {
        console.error("Quiz generation error:", error);
        res.status(500).json({ error: "Failed to generate quiz: " + error.message });
    }
});

// --- GENERATE NEURAL SUMMARY (Summary + Quiz + Exam) ---
app.post('/api/generate-neural-summary', async (req, res) => {
    const { documentContent, title, documentId, userId } = req.body;
    
    try {
        const prompt = `Based on the document titled "${title}", create a comprehensive "Neural Summary".
        The response must be a SINGLE JSON object with the following structure:
        {
          "summary": "A deep, structured markdown summary with headings, bullet points, and key takeaways.",
          "quiz": [
            {"question": "...", "options": ["...", "...", "...", "..."], "answer": "...", "explanation": "..."}
          ],
          "exam": [
            {"question": "...", "type": "multiple-choice", "options": ["...", "...", "...", "..."], "answer": "..."},
            {"question": "...", "type": "true-false", "answer": "True/False"}
          ]
        }
        
        Generate 5 quiz questions and 5 exam questions.
        Return ONLY the raw JSON. No markdown code blocks.

        Document Content:
        ${documentContent.slice(0, 20000)}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a specialized academic AI. You provide deep synthesis and structured JSON outputs." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.4,
            max_tokens: 4096,
        });

        let responseText = completion.choices[0]?.message?.content || "{}";
        console.log("AI Response received (length):", responseText.length);
        
        // Improved JSON extraction
        const extractJSON = (text) => {
            try {
                // Try direct parse first
                return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
            } catch (e) {
                // Try finding JSON object in string
                const start = text.indexOf('{');
                const end = text.lastIndexOf('}');
                if (start !== -1 && end !== -1) {
                    try {
                        return JSON.parse(text.substring(start, end + 1));
                    } catch (innerE) {
                        throw new Error("JSON structure is incomplete or invalid.");
                    }
                }
                throw e;
            }
        };
        
        try {
            const data = extractJSON(responseText);
            console.log("JSON parsed successfully.");
            
            // If Supabase is available, save it
            if (supabase && userId && documentId) {
                const { error: dbError } = await supabase.from('neural_summaries').insert([{
                    user_id: userId,
                    document_id: documentId,
                    title: `Neural Summary: ${title}`,
                    summary_text: data.summary,
                    quiz_data: data.quiz,
                    exam_data: data.exam
                }]);
                
                if (dbError) {
                    console.error("Supabase Database Error:", dbError);
                    // Continue even if database save fails, to return data to user
                } else {
                    console.log("Neural Summary saved to Supabase.");
                }
            }

            res.json(data);
        } catch (parseError) {
            console.error("Neural Summary JSON Parse Error. Raw content:", responseText);
            res.status(500).json({ error: "Failed to parse AI response: " + parseError.message });
        }
    } catch (error) {
        console.error("Neural Summary Generation Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'online', groq: !!GROQ_API_KEY, supabase: !!supabase });
});

// --- NON-STREAMING CHAT FALLBACK ---
app.post('/api/chat-simple', async (req, res) => {
    let { message, documentContent, conversationHistory, documentId } = req.body;
    
    if (!documentContent && documentId && supabase) {
        const { data } = await supabase.from('documents').select('content').eq('id', documentId).single();
        if (data) documentContent = data.content;
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: `You are a Study Assistant. Context:\n${documentContent?.slice(0, 20000) || "No context."}` },
                ...(conversationHistory || []),
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            stream: false,
        });
        res.json({ content: completion.choices[0]?.message?.content || "" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- CHAT ENDPOINT ---
app.post('/api/chat', async (req, res) => {
    let { message, documentContent, conversationHistory, userId, documentId } = req.body;
    
    // Fallback: Fetch content if missing but ID is present
    if (!documentContent && documentId && supabase) {
        try {
            const { data, error } = await supabase.from('documents').select('content').eq('id', documentId).single();
            if (data) documentContent = data.content;
        } catch (e) {
            console.error("Failed to fetch document content fallback", e);
        }
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    try {
        const stream = await groq.chat.completions.create({
            messages: [
                { role: "system", content: `You are a Study Assistant. Context:\n${documentContent?.slice(0, 30000) || "No context provided."}` },
                ...(conversationHistory || []),
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile",
            stream: true,
        });

        let fullResponse = "";
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                fullResponse += content;
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        if (supabase && userId) {
            await supabase.from('chat_history').insert([{
                user_id: userId,
                document_id: documentId || null,
                message: message,
                response: fullResponse
            }]);
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

// --- CHAT HISTORY ENDPOINT ---
app.get('/api/chat-history/:userId', async (req, res) => {
    const { userId } = req.params;
    const { documentId } = req.query;

    if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

    try {
        let query = supabase.from('chat_history').select('*').eq('user_id', userId).order('created_at', { ascending: true });
        if (documentId) query = query.eq('document_id', documentId);
        
        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SAVE STUDY PROFILE ---
app.post("/api/save-study", async (req, res) => {
    const { userId, age, subjects, system } = req.body;
    console.log(`Saving study for ${userId}`);
    
    try {
        if (process.env.MONGO_URI) {
            const profile = await StudyProfile.findOneAndUpdate(
                { userId }, 
                { age, subjects, system }, 
                { upsert: true, new: true }
            );
            return res.json({ message: "Saved to MongoDB", profile });
        } else {
            // Use local file fallback
            const data = getLocalData();
            data[userId] = { age, subjects, system, updatedAt: new Date() };
            saveLocalData(data);
            return res.json({ message: "Saved to Local Storage", profile: data[userId] });
        }
    } catch (error) {
        console.error("Save Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- GET STUDY PROFILE ---
app.get("/api/get-study/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        if (process.env.MONGO_URI) {
            const profile = await StudyProfile.findOne({ userId });
            return res.json(profile);
        } else {
            const data = getLocalData();
            return res.json(data[userId] || null);
        }
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- CALENDAR ENDPOINTS ---
app.post("/api/save-calendar", async (req, res) => {
    const { userId, date, note } = req.body;
    console.log(`Saving calendar event for ${userId} on ${date}`);
    
    try {
        const data = getLocalData();
        if (!data[userId]) data[userId] = {};
        if (!data[userId].calendar) data[userId].calendar = {};
        
        // Use ISO date string without time as key
        const dateKey = new Date(date).toISOString().split('T')[0];
        data[userId].calendar[dateKey] = note;
        
        saveLocalData(data);
        res.json({ message: "Calendar event saved", calendar: data[userId].calendar });
    } catch (error) {
        console.error("Calendar Save Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/get-calendar/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const data = getLocalData();
        const userDocs = data[userId] || {};
        res.json(userDocs.calendar || {});
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- DAILY TASKS ENDPOINTS ---
app.get('/api/tasks/:userId', async (req, res) => {
    const { userId } = req.params;
    const { date } = req.query; // Expecting YYYY-MM-DD
    
    if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

    try {
        let query = supabase.from('daily_tasks').select('*').eq('user_id', userId);
        if (date) query = query.eq('scheduled_date', date);
        
        const { data, error } = await query.order('created_at', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { userId, taskText, date, time } = req.body;
    
    if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

    try {
        const { data, error } = await supabase.from('daily_tasks').insert([{
            user_id: userId,
            task_text: taskText,
            scheduled_date: date || new Date().toISOString().split('T')[0],
            scheduled_time: time || null
        }]).select().single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

    try {
        const { error } = await supabase.from('daily_tasks').delete().eq('id', taskId);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { isCompleted } = req.body;
    if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

    try {
        const { data, error } = await supabase.from('daily_tasks').update({ is_completed: isCompleted }).eq('id', taskId).select().single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- MOTIVATION & LEADERBOARD ENDPOINTS ---
app.get('/api/leaderboard', async (req, res) => {
    if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('username, stars_count')
            .order('stars_count', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/award-star', async (req, res) => {
    const { userId } = req.body;
    if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

    try {
        // Increment stars_count for the user
        const { data, error } = await supabase.rpc('increment_stars', { user_id: userId });
        
        // If RPC fails, try manual increment
        if (error) {
            const { data: profile } = await supabase.from('profiles').select('stars_count').eq('id', userId).single();
            const newCount = (profile?.stars_count || 0) + 1;
            await supabase.from('profiles').update({ stars_count: newCount }).eq('id', userId);
            return res.json({ success: true, stars: newCount });
        }
        
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ADMIN: PASSWORD RESET ---
app.post('/api/admin/reset-password', async (req, res) => {
    const { targetUserId, newPassword, adminId } = req.body;
    
    if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

    try {
        // Verify the requester is an admin
        const { data: adminProfile, error: adminError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', adminId)
            .single();

        if (adminError || !adminProfile?.is_admin) {
            return res.status(403).json({ error: "Access Denied: Admin privileges required." });
        }

        // Use Admin API (Service Role) to update password
        const { error: resetError } = await supabase.auth.admin.updateUserById(
            targetUserId,
            { password: newPassword }
        );

        if (resetError) throw resetError;
        res.json({ success: true, message: "User password updated successfully." });
    } catch (error) {
        console.error("Admin Password Reset Error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Unified Server running on port ${PORT}`);
    console.log(`🔗 Local Link: http://localhost:${PORT}`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${PORT} is already in use.`);
    } else {
        console.error("❌ Server startup error:", e);
    }
});
