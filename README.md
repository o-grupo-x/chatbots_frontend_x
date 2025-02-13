This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
Chatbot System

📌 Project Overview

This is a Chatbot System that integrates two AI chat models to provide diverse conversational experiences. Users can interact with either AI system, and chat history can be created, modified, or deleted dynamically.

🚀 Features

Two AI Chat Systems: Users can switch between two different AI models.

Chat History Management:

Create new conversations.

Edit messages.

Delete chat history.

Modern UI built with Next.js.

Backend API powered by FastAPI.

🛠️ Technologies Used

Backend:

FastAPI (Python) – Handles API requests and communication with AI models.

OpenAI API – Provides AI-generated responses.

SQLite / PostgreSQL – Stores chat history (optional).

Frontend:

Next.js (React) – Dynamic, real-time user interface.

Tailwind CSS – Clean and responsive styling.

🔧 Installation & Setup

1️⃣ Backend Setup (FastAPI)

# Clone the repository
git clone https://github.com/your-repo/chatbot-system.git
cd chatbot-system/backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use 'venv\Scripts\activate'

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

2️⃣ Frontend Setup (Next.js)

cd chatbot-system/frontend

# Install dependencies
npm install

# Run the development server
npm run dev

Access the frontend at http://localhost:3000

📡 API Endpoints

Method

Endpoint

Description

POST

/chat

Sends a message to AI and returns a response.

GET

/history

Retrieves the chat history.

DELETE

/history

Deletes all chat history.

PATCH

/history

Edits a specific message in history.

📌 Future Improvements

User Authentication to store personalized chat history.

WebSocket Support for real-time AI responses.

More AI Models for different chatbot personalities.

📜 License

This project is licensed under the MIT License.

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
