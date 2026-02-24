|⚡ Quick Start (Copy & Paste to Terminal)
To install all dependencies (Frontend + Backend) and start the AI Smart Assistant immediately, run this single command in your project root:

Bash
npm install && cd server && npm install && cd .. && npx concurrently "npm run dev" "node server/index.js"
🛠️ Manual Terminal Commands
If you prefer to control the AI Smart Assistant components separately, use these commands:

1. First Time Setup
Run this once to download all necessary AI and UI packages:

Bash
# Setup the whole project
npm run setup
2. Launch the AI Backend
This starts the Gemini 1.5 Flash engine:

Bash
cd server
node server.js
3. Launch the Assistant UI
Open a new terminal window and run:

Bash
npm run dev
🧪 Requirements Check
Before running the commands above, ensure your terminal has access to:

Node.js (v18 or higher)

NPM (v9 or higher)

Valid API Keys (Stored in your .env files)
