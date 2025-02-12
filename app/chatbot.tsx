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
  const [sessions, setSessions] = useState<{ id: string; messages: { user: string; bot: string }[] }[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4");

  // 🔹 Carregar sessões e modelo do IndexedDB ao montar o componente
  useEffect(() => {
    if (typeof window !== "undefined") {
      localforage.getItem("chat_sessions").then((storedSessions) => {
        if (storedSessions) {
          setSessions(storedSessions as any);
          if (storedSessions.length > 0) {
            setCurrentSession(storedSessions[0].id); // Definir primeira sessão salva como ativa
            setMessages(storedSessions[0].messages); // Carregar mensagens dessa sessão
          }
        }
      });
  
      localforage.getItem("selected_model").then((storedModel) => {
        if (storedModel) setSelectedModel(storedModel as string);
      });
    }
  }, []);
  

  // 🔹 Salvar sessões e modelo no IndexedDB sempre que houver mudanças
  useEffect(() => {
    if (sessions.length > 0) {
      localforage.setItem("chat_sessions", sessions);
    }
    localforage.setItem("selected_model", selectedModel);
  }, [sessions, selectedModel]);

  // 🔹 Criar nova sessão corretamente
  const startNewChat = () => {
    const newSessionId = uuidv4();
    const newSession = { id: newSessionId, messages: [] };

    setSessions((prev) => [...prev, newSession]); // Adiciona nova sessão à lista
    setMessages([]); // Zera mensagens
    setCurrentSession(newSessionId); // Define a nova sessão como ativa
  };

  // 🔹 Deletar chat corretamente
  const deleteChat = (sessionId: string) => {
    const updatedSessions = sessions.filter((session) => session.id !== sessionId);
    setSessions(updatedSessions);

    if (currentSession === sessionId) {
      setMessages([]);
      setCurrentSession(null);
    }
  };

  // 🔹 Enviar mensagem e salvar na sessão atual
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { user: input, bot: "" };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", {
        message: input,
        history: newMessages.slice(-10), // Enviar apenas as últimas 10 mensagens
        model: selectedModel,
      });

      const botMessage = { user: "", bot: response.data.response };
      const updatedMessages = [...newMessages, botMessage];

      setMessages(updatedMessages);

      // 🔹 Atualizar a sessão atual no estado e no IndexedDB
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === currentSession ? { ...session, messages: updatedMessages } : session
        )
      );
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">𝕏 Grupos.ai</h2>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 md:hidden">✖</button>
          </div>

          {/* Model Selection Dropdown */}
          <div className="relative mb-4">
            <select
              className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {["gpt-4", "gpt-3.5", "llama-3", "mistral"].map((model) => (
                <option key={model} value={model}>{model.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <button onClick={startNewChat} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg w-full mb-4">
            <Pencil className="mr-2" size={18} /> New Chat
          </button>

          <div className="overflow-y-auto flex-1">
            <h3 className="text-sm text-gray-400 mb-2">Recent Chats</h3>
            {sessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-2 w-full text-left rounded-lg hover:bg-gray-800">
                <button onClick={() => { setCurrentSession(session.id); setMessages(session.messages); setSidebarOpen(false); }} className="truncate flex-1 text-left">Chat {index + 1}</button>
                <button onClick={() => deleteChat(session.id)} className="text-red-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex flex-col flex-1 h-screen">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`p-3 rounded-lg max-w-[80%] ${msg.user ? "ml-auto bg-blue-500 text-white" : "mr-auto bg-gray-700 text-white"}`}>
              {msg.user || msg.bot}
            </div>
          ))}
          {loading && <div className="p-3 text-gray-400">Digitando...</div>}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-3 bg-gray-800 border-t border-gray-700">
          <input type="text" className="flex-1 p-2 rounded-lg border border-gray-600 bg-gray-900 text-white" placeholder="Digite sua mensagem..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} disabled={loading} />
          <button onClick={sendMessage} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50" disabled={loading}><Send size={20} /></button>
        </div>
      </div>
    </div>
  );
}
