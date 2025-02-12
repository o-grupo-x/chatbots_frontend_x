'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import localforage from 'localforage';
import { Send, Menu, Pencil, Trash2 } from 'lucide-react';

// Define API endpoints for each model type
const modelRoutes = {
  gpt: 'http://127.0.0.1:5000/gpt/chat',
  deepseek: 'http://127.0.0.1:5000/deepseek/chat',
};

// List of available AI models
type ModelType = 'gpt' | 'deepseek';

const availableModels: { name: string; value: string; type: ModelType }[] = [
  { name: 'GPT-4', value: 'gpt-4', type: 'gpt' },
  // { name: 'GPT-3.5', value: 'gpt-3.5', type: 'gpt' },
  { name: 'DeepSeek', value: 'deepseek', type: 'deepseek' },
  // { name: 'LLaMA-3', value: 'llama-3', type: 'deepseek' },
  // { name: 'Mistral', value: 'mistral', type: 'deepseek' },
];

export default function Chatbot() {
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<{ id: string; messages: { user: string; bot: string }[] }[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(availableModels[0].value);

  // Load previous chats and model
  useEffect(() => {
    localforage.getItem('chat_sessions').then((storedSessions) => {
      if (storedSessions) setSessions(storedSessions as any);
    });

    localforage.getItem('selected_model').then((storedModel) => {
      if (storedModel) setSelectedModel(storedModel as string);
    });
  }, []);

  // Save chats and model when they change
  useEffect(() => {
    localforage.setItem('chat_sessions', sessions);
    localforage.setItem('selected_model', selectedModel);
  }, [sessions, selectedModel]);

  // Start a fresh chat when changing the model
  useEffect(() => {
    startNewChat();
  }, [selectedModel]);

  const getApiRoute = () =>
    modelRoutes[availableModels.find((m) => m.value === selectedModel)?.type || 'gpt'];

  // Start a new chat session
  const startNewChat = () => {
    const newSessionId = Date.now().toString();
    const newSession = { id: newSessionId, messages: [] };
    // Add the new session to sessions
    setSessions((prev) => [...prev, newSession]);

    setCurrentSession(newSessionId);
    setMessages([]);
  };

  // Delete a chat session
  const deleteChat = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    if (currentSession === sessionId) {
      setMessages([]);
      setCurrentSession(null);
    }
  };

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { user: input, bot: '' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // If there's no current session, create one on the fly
      if (!currentSession) {
        const newSessionId = Date.now().toString();
        const newSession = { id: newSessionId, messages: [userMessage] };

        setSessions((prev) => [...prev, newSession]);
        setCurrentSession(newSessionId);
      } else {
        // Append user's message to the existing session
        setSessions((prev) =>
          prev.map((session) =>
            session.id === currentSession
              ? { ...session, messages: [...session.messages, userMessage] }
              : session
          )
        );
      }

      const response = await axios.post(getApiRoute(), {
        message: userMessage.user,
        history: messages,
        session_id: currentSession || Date.now().toString(),
      });

      const botMessage = {
        user: '',
        bot: response.data.response?.content || response.data.response || '',
      };

      setMessages((prev) => [...prev, botMessage]);

      // Now update sessions with the bot response
      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSession
            ? { ...session, messages: [...session.messages, botMessage] }
            : session
        )
      );
    } catch (error) {
      const errorMsg = { user: '', bot: 'Erro ao conectar ao servidor.' };
      setMessages((prev) => [...prev, errorMsg]);

      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSession
            ? { ...session, messages: [...session.messages, errorMsg] }
            : session
        )
      );
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 transition-transform transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-64'
        } md:relative md:translate-x-0 md:w-80 shadow-lg z-50`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold"> 𝕏 Grupos.ai</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 md:hidden"
            >
              ✖
            </button>
          </div>

          {/* Model Selection Dropdown */}
          <div className="relative mb-4">
            <select
              className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {availableModels.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={startNewChat}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg w-full mb-4"
          >
            <Pencil className="mr-2" size={18} /> New Chat
          </button>

          <div className="overflow-y-auto flex-1">
            <h3 className="text-sm text-gray-400 mb-2">Recent Chats</h3>
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-2 w-full text-left rounded-lg hover:bg-gray-700"
              >
                <button
                  onClick={() => {
                    setCurrentSession(session.id);
                    setMessages(session.messages);
                    setSidebarOpen(false);
                  }}
                  className="truncate flex-1 text-left"
                >
                  Chat {index + 1}
                </button>
                <button
                  onClick={() => deleteChat(session.id)}
                  className="text-red-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 h-screen">
        {/* Mobile top bar (Hamburger Menu) */}
        <div className="p-2 bg-gray-800 flex items-center md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-200 mr-2"
          >
            <Menu size={24} />
          </button>
          <span className="text-lg font-semibold">Chat</span>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.user
                  ? 'ml-auto bg-blue-500 text-white'
                  : 'mr-auto bg-gray-700 text-white'
              }`}
            >
              {msg.user || msg.bot}
            </div>
          ))}
          {loading && <div className="p-3 text-gray-400">Digitando...</div>}
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2 p-3 bg-gray-800 border-t border-gray-700">
          <input
            type="text"
            className="flex-1 p-2 rounded-lg border border-gray-600 bg-gray-900 text-white"
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            disabled={loading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
