import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, SEOReport } from '../types';
import { createSeoChat } from '../services/geminiService';
import { RobotIcon } from './icons/RobotIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { CloseIcon } from './icons/CloseIcon';
import type { Chat } from '@google/genai';

interface ChatbotProps {
  reportContext: SEOReport | null;
  apiKey: string | null;
}

export const Chatbot: React.FC<ChatbotProps> = ({ reportContext, apiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔹 Initialize chat when opened
  useEffect(() => {
    if (isOpen) {
      if (apiKey) {
        const chatInstance = createSeoChat(apiKey, reportContext);
        setChat(chatInstance);

        // Only set the initial greeting if there is no conversation yet.
        setMessages(prev => prev.length === 0 ? [
          {
            sender: 'bot',
            text: reportContext
              ? "👋 Hi — I'm an AI SEO Expert Assistant powered by Google's Gemini model. I can provide data-specific insights from your SEO report. Ask a question about the report, or provide another URL to analyze."
              : "👋 Hi — I'm an AI SEO Expert Assistant powered by Google's Gemini model. I can analyze a URL or answer SEO questions. Please provide a URL to analyze or ask an SEO-related question."
          }
        ] : prev);
      } else {
        setMessages([
          {
            sender: 'bot',
            text: "⚠️ Please set your API key in the main app to enable chat functionality."
          }
        ]);
        setChat(null);
      }
    } else {
      // Reset on close
      setMessages([]);
      setChat(null);
    }
  }, [isOpen, apiKey]);

  // 🔹 Scroll to bottom on message update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  // 🔹 Handle sending message
  const handleSend = async () => {
    if (input.trim() === '' || isLoading || !chat) return;

    const currentInput = input;
    const userMessage: ChatMessage = { sender: 'user', text: currentInput };

    setMessages(prev => [...prev, userMessage, { sender: 'bot', text: '' }]);
    setInput('');
    setIsLoading(true);

    try {
      const responseStream = await chat.sendMessageStream({ message: currentInput });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          setMessages(prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.sender === 'bot') {
              lastMsg.text += chunk.text;
            }
            return updated;
          });
        }
      }

      // ✅ Add fallback validation if AI response is empty or too short
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.sender === 'bot' && (!last.text || last.text.length < 10)) {
          last.text = "I'm not sure about that yet. Could you rephrase your SEO question?";
        }
        return updated;
      });

    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last) {
          last.text = "❌ Sorry, I’m having trouble connecting. Please try again.";
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isChatDisabled = isLoading || !chat;

  // 🔹 Placeholder handling
  let placeholderText = "Ask about SEO (e.g. 'How to improve keyword ranking?')";
  if (!apiKey) {
    placeholderText = "Set API key to chat...";
  } else if (!reportContext) {
    placeholderText = "Ask any SEO-related question...";
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-accent hover:bg-highlight text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 z-20"
      >
        {isOpen ? <CloseIcon className="w-8 h-8"/> : <RobotIcon className="w-8 h-8" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] max-w-md h-[60vh] bg-secondary rounded-xl shadow-2xl flex flex-col z-20 animate-fade-in">
          <header className="p-4 border-b border-primary/50">
            <h3 className="font-bold text-lg text-text-primary">AI SEO Assistant</h3>
          </header>

          {/* Chat messages */}
          <div className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center">
                      <RobotIcon className="w-5 h-5"/>
                    </div>
                  )}
                  <p
                    className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-2 break-words ${
                      msg.sender === 'user'
                        ? 'bg-highlight text-white rounded-br-none'
                        : 'bg-primary text-text-primary rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                    {isLoading && msg.sender === 'bot' && messages[messages.length - 1] === msg && (
                      <span className="inline-block w-2 h-4 bg-text-primary ml-1 animate-pulse" />
                    )}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <footer className="p-4 border-t border-primary/50">
            <div className="flex items-center bg-primary rounded-lg">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={placeholderText}
                className="flex-grow bg-transparent px-4 py-2 focus:outline-none text-text-primary"
                disabled={isChatDisabled}
              />
              <button
                onClick={handleSend}
                disabled={isChatDisabled || !input.trim()}
                className="p-3 text-accent disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="w-6 h-6" />
              </button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};
