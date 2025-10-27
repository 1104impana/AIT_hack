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

  useEffect(() => {
    if (isOpen) {
      if (apiKey) {
        setChat(createSeoChat(apiKey, reportContext));
        setMessages([{
            sender: 'bot',
            text: reportContext 
                    ? "Hello! I'm your AI SEO assistant. Ask me anything about your report."
                    : "Hello! Please run an analysis first, then you can ask me questions about the report."
        }]);
      } else {
        setMessages([{
            sender: 'bot',
            text: "Please set your API key in the main app to enable the chat."
        }]);
        setChat(null);
      }
    } else {
      setMessages([]);
      setChat(null);
    }
  }, [isOpen, reportContext, apiKey]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

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
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.sender === 'bot') {
              lastMessage.text += chunk.text;
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage) {
            lastMessage.text = "Sorry, I'm having trouble connecting. Please try again.";
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isChatDisabled = isLoading || !chat;
  
  let placeholderText = "Ask a question...";
  if (!apiKey) {
      placeholderText = "Set API key to chat...";
  } else if (!reportContext) {
      placeholderText = "Run an analysis to chat...";
  }


  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-accent hover:bg-highlight text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 z-20"
      >
        {isOpen ? <CloseIcon className="w-8 h-8"/> : <RobotIcon className="w-8 h-8" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] max-w-md h-[60vh] bg-secondary rounded-xl shadow-2xl flex flex-col z-20 animate-fade-in">
          <header className="p-4 border-b border-primary/50">
            <h3 className="font-bold text-lg text-text-primary">AI SEO Assistant</h3>
          </header>

          <div className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                   {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center"><RobotIcon className="w-5 h-5"/></div>}
                  <p className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-2 break-words ${msg.sender === 'user' ? 'bg-highlight text-white rounded-br-none' : 'bg-primary text-text-primary rounded-bl-none'}`}>
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
              <button onClick={handleSend} disabled={isChatDisabled || !input.trim()} className="p-3 text-accent disabled:text-gray-500 disabled:cursor-not-allowed">
                <PaperAirplaneIcon className="w-6 h-6" />
              </button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};
