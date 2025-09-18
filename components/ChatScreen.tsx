import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { Icon } from './Icon';

interface ChatScreenProps {
  chatHistory: ChatMessage[];
  sendMessage: (message: string, onStream: (chunk: string) => void) => Promise<void>;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ chatHistory, sendMessage }) => {
  const [input, setInput] = useState('');
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistory, streamingResponse]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageToSend = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingResponse('');

    await sendMessage(messageToSend, (chunk) => {
      setStreamingResponse(chunk);
    });

    setIsLoading(false);
    setStreamingResponse('');
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold text-primary mb-4">AI Coach</h1>
      <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2 no-scrollbar" style={{ minHeight: 0 }}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-background rounded-br-none' : 'bg-surface text-text-primary rounded-bl-none'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
            </div>
          </div>
        ))}
        {streamingResponse && (
          <div className="flex justify-start">
             <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-surface text-text-primary rounded-bl-none">
              <p className="text-sm whitespace-pre-wrap">{streamingResponse}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach anything..."
          className="flex-grow bg-surface border border-gray-600 rounded-full px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-primary text-background rounded-full p-3 hover:bg-secondary transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          <Icon name="send" className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default ChatScreen;