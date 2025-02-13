"use client";

import { useState, useEffect, SetStateAction } from "react";
import axios from "axios";
import localforage from "localforage";
import { v4 as uuidv4 } from "uuid";
import { Send, Pencil, Trash2 } from "lucide-react";

// Definição de endpoints para cada modelo
const modelRoutes = {
  gpt: "https://chatgptbotia-geghh4dpcrc2cndr.brazilsouth-01.azurewebsites.net/gpt/chat",
  deepseek: "https://chatgptbotia-geghh4dpcrc2cndr.brazilsouth-01.azurewebsites.net/deepseek/chat",
};

// Lista de modelos disponíveis
const availableModels = [
  { name: "GPT-4", value: "gpt-4", type: "gpt" },
  { name: "DeepSeek", value: "deepseek", type: "deepseek" },
];

export default function Chatbot() {
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<{ id: string; name: string; model: string; messages: { user: string; bot: string }[] }[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(availableModels[0].value);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  useEffect(() => {
    localforage.getItem("chat_sessions").then((storedSessions) => {
      if (Array.isArray(storedSessions)) {
        setSessions(storedSessions);
      } else {
        setSessions([]); // Garante que `sessions` será sempre um array
      }
    });
  }, []);
  

  useEffect(() => {
    localforage.setItem("chat_sessions", sessions);
  }, [sessions]);

  const getApiRoute = () =>
    modelRoutes[availableModels.find((m) => m.value === selectedModel)?.type as keyof typeof modelRoutes || "gpt"];

  const renameChat = (sessionId: string, newName: string) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId ? { ...session, name: newName } : session
      )
    );
  };

  const startNewChat = () => {
    const newSessionId = uuidv4();
    const newSession = {
      id: newSessionId,
      name: `Chat ${sessions.length + 1} - ${availableModels.find(m => m.value === selectedModel)?.name}`,
      model: selectedModel, // Define o modelo do chat com base no dropdown atual
      messages: [],
    };
    setSessions((prev) => [...prev, newSession]);
    setMessages([]);
    setCurrentSession(newSessionId);
  };

  const deleteChat = (sessionId: string | null) => {
    setSessions(sessions.filter((session) => session.id !== sessionId));
    if (currentSession === sessionId) {
      setMessages([]);
      setCurrentSession(null);
    }
  };

  const loadChat = (sessionId: SetStateAction<string | null>) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSession(sessionId);
      setMessages(session.messages);
      setSelectedModel(session.model); // Mantém a IA definida para esse chat
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { user: input, bot: "" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(getApiRoute(), {
        message: input,
        history: messages,
      });

      const botMessage = { user: "", bot: response.data.response || "Erro ao processar resposta." };
      const updatedMessages = [...messages, userMessage, botMessage];

      setMessages(updatedMessages);

      if (currentSession) {
        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.id === currentSession
              ? { ...session, messages: updatedMessages }
              : session
          )
        );
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error); 
      setMessages((prev) => [...prev, { user: "", bot: "Erro ao conectar ao servidor." }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      <div className={`fixed inset-y-0 left-0 w-64 bg-gray-800 ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} md:relative md:translate-x-0 md:w-80 shadow-lg`}>
        <div className="p-4 flex flex-col h-full">
          <h2 className="text-lg font-bold mb-4">𝕏 Grupos.ai</h2>
          <select
            className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg mb-4"
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              if (currentSession) {
                setSessions((prevSessions) =>
                  prevSessions.map((session) =>
                    session.id === currentSession ? { ...session, model: e.target.value } : session
                  )
                );
              }
            }}
          >
            {availableModels.map((model) => (
              <option key={model.value} value={model.value}>{model.name}</option>
            ))}
          </select>
          <button onClick={startNewChat} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg w-full mb-4">
            <Pencil className="mr-2" size={18} /> Novo Chat
          </button>
          <div className="overflow-y-auto flex-1">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-2 w-full rounded-lg hover:bg-gray-700">
                {editingSessionId === session.id ? (
                  <input type="text" className="bg-transparent border-b border-gray-500 text-white flex-1" value={session.name} autoFocus onChange={(e) => renameChat(session.id, e.target.value)} onBlur={() => setEditingSessionId(null)} onKeyDown={(e) => e.key === "Enter" && setEditingSessionId(null)} />
                ) : (
                  <button onClick={() => loadChat(session.id)} className="truncate flex-1 text-left">{session.name}</button>
                )}
                <button onClick={() => setEditingSessionId(session.id)} className="text-gray-400 hover:text-gray-200 ml-2"><Pencil size={16} /></button>
                <button onClick={() => deleteChat(session.id)} className="text-red-400 hover:text-red-500 ml-2"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-1 h-screen">
        <div className="p-4 bg-gray-800 text-center text-lg font-bold">
          {sessions.find((s) => s.id === currentSession)?.name || "Novo Chat"} - {availableModels.find(m => m.value === selectedModel)?.name}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">{messages.map((msg, index) => <div key={index} className={`p-3 rounded-lg max-w-[80%] ${msg.user ? "ml-auto bg-blue-500" : "mr-auto bg-gray-700"}`}>{msg.user || msg.bot}</div>)}</div>
        <div className="p-4 bg-gray-800 flex items-center"><input type="text" className="flex-1 p-2 bg-gray-700 text-white" placeholder="Digite sua mensagem..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} /><button onClick={sendMessage} className="ml-2 p-2 bg-blue-600 hover:bg-blue-700"><Send size={20} /></button></div>
      </div>
    </div>
  );
}
