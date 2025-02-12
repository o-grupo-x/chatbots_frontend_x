"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import localforage from "localforage";
import { v4 as uuidv4 } from "uuid";
import { Send, Menu, Pencil, Trash2 } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<{ id: string; name: string; messages: { user: string; bot: string }[] }[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  useEffect(() => {
    localforage.getItem("chat_sessions").then((storedSessions) => {
      if (storedSessions) setSessions(storedSessions as any);
    });

    localforage.getItem("selected_model").then((storedModel) => {
      if (storedModel) setSelectedModel(storedModel as string);
    });
  }, []);

  useEffect(() => {
    localforage.setItem("chat_sessions", sessions);
    localforage.setItem("selected_model", selectedModel);
  }, [sessions, selectedModel]);

  const renameChat = (sessionId: string, newName: string) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId ? { ...session, name: newName } : session
      )
    );
  };

  const startNewChat = () => {
    const newSessionId = uuidv4();
    const newSession = { id: newSessionId, name: `Chat ${sessions.length + 1}`, messages: [] };
    setSessions((prev) => [...prev, newSession]);
    setMessages([]);
    setCurrentSession(newSessionId);
  };

  const deleteChat = (sessionId: string) => {
    setSessions(sessions.filter((session) => session.id !== sessionId));

    if (currentSession === sessionId) {
      setMessages([]);
      setCurrentSession(null);
    }
  };

  const loadChat = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSession(sessionId);
      setMessages(session.messages);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { user: input, bot: "" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", {
        message: input,
        history: [...messages, userMessage].slice(-10),
        model: selectedModel,
      });

      const botMessage = { user: "", bot: response.data.response };
      const updatedMessages = [...messages, userMessage, botMessage];

      setMessages(updatedMessages);

      if (currentSession) {
        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.id === currentSession ? { ...session, messages: updatedMessages } : session
          )
        );
      } else {
        const newSessionId = uuidv4();
        const newSession = { id: newSessionId, name: `Chat ${sessions.length + 1}`, messages: updatedMessages };
        setSessions((prev) => [...prev, newSession]);
        setCurrentSession(newSessionId);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { user: "", bot: "Erro ao conectar ao servidor." }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-900 transition-transform transform ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} md:relative md:translate-x-0 md:w-80 shadow-lg`}>
        <div className="p-4 flex flex-col h-full">
          <h2 className="text-lg font-bold mb-4">𝕏 Grupos.ai</h2>

          <select className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg mb-4" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
            {["gpt-4", "gpt-3.5", "llama-3", "mistral"].map((model) => (
              <option key={model} value={model}>{model.toUpperCase()}</option>
            ))}
          </select>

          <button onClick={startNewChat} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg w-full mb-4">
            <Pencil className="mr-2" size={18} /> Novo Chat
          </button>

          <div className="overflow-y-auto flex-1">
            <h3 className="text-sm text-gray-400 mb-2">Conversas Recentes</h3>
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-2 w-full text-left rounded-lg hover:bg-gray-800">
                {editingSessionId === session.id ? (
                  <input
                    type="text"
                    className="bg-transparent border-b border-gray-500 text-white outline-none flex-1"
                    value={session.name}
                    autoFocus
                    onChange={(e) => renameChat(session.id, e.target.value)}
                    onBlur={() => setEditingSessionId(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingSessionId(null)}
                  />
                ) : (
                  <button onClick={() => loadChat(session.id)} className="truncate flex-1 text-left">
                    {session.name}
                  </button>
                )}
                <button onClick={() => setEditingSessionId(session.id)} className="text-gray-400 hover:text-gray-200 ml-2">
                  <Pencil size={16} />
                </button>
                <button onClick={() => deleteChat(session.id)} className="text-red-400 hover:text-red-500 ml-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex flex-col flex-1 h-screen">
        <div className="bg-gray-800 p-4 text-center text-lg font-bold">
          {sessions.find((s) => s.id === currentSession)?.name || "Novo Chat"} - {selectedModel.toUpperCase()}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`p-3 rounded-lg max-w-[80%] ${msg.user ? "ml-auto bg-blue-500 text-white" : "mr-auto bg-gray-700 text-white"}`}>
              {msg.user || msg.bot}
            </div>
          ))}
          {loading && <div className="p-3 text-gray-400">Digitando...</div>}
        </div>

        <div className="p-4 bg-gray-800 flex items-center">
          <input type="text" className="flex-1 p-2 rounded-lg bg-gray-700 text-white outline-none" placeholder="Digite sua mensagem..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
          <button onClick={sendMessage} className="ml-2 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg" disabled={loading}><Send size={20} /></button>
        </div>
      </div>
    </div>
  );
}
