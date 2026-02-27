import dotenv from 'dotenv';
dotenv.config();

const required = [
    'GROQ_API_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
];

const optional = [
    'OPENAI_API_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'MONGO_URI'
];

console.log('--- Environment Validation ---');
let missing = false;

required.forEach(key => {
    if (!process.env[key]) {
        console.error(`❌ Missing required env var: ${key}`);
        missing = true;
    } else {
        console.log(`✅ ${key} is set`);
    }
});

optional.forEach(key => {
    if (!process.env[key]) {
        console.warn(`⚠️  Missing optional env var: ${key} (RAG features will be disabled)`);
    } else {
        console.log(`✅ ${key} is set`);
    }
});

if (missing) {
    console.error('Stopping: Please fix missing environment variables.');
    process.exit(1);
}
console.log('--- Validation Passed ---');
