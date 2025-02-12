'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function Chatbot() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-2xl mx-auto p-4 bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 dark:bg-gray-700 text-black dark:text-white self-start'}`}> 
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700">
        <input 
          type="text" 
          className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-black dark:text-white" 
          placeholder="Digite sua mensagem..." 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}