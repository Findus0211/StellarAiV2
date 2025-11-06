import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Chat } from '@google/genai';
import type { ChatMessage, Character } from '../types';
import useLocalStorage from './icons/hooks/useLocalStorage';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';
import SendIcon from './icons/SendIcon';
import BackIcon from './icons/BackIcon';

interface ChatWindowProps {
  chatId: string;
  chatTitle?: string;
  systemPrompt: string;
  initialGreeting: string;
  placeholderText?: string;
  enableSearch: boolean;
  character?: Character;
  onBack?: () => void;
  isNsfw?: boolean;
  deepThinking?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chatId,
  chatTitle,
  systemPrompt,
  initialGreeting,
  placeholderText = 'Type your message...',
  enableSearch,
  character,
  onBack,
  isNsfw,
  deepThinking = false,
}) => {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(`chatHistory-${chatId}`, []);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const config: any = { 
          systemInstruction: systemPrompt,
        };
        
        let budget = 0;
        if (enableSearch) {
          config.tools = [{googleSearch: {}}];
          budget = 8192;
        }
        if (deepThinking) {
          budget = 16384; // Higher budget for deep thinking overrides others.
        }

        if (budget > 0) {
          config.thinkingConfig = { thinkingBudget: budget };
        }

        const history = messages
          .filter(msg => msg.content)
          .map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }],
          }));

        const newChat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: config,
          history: history,
        });

        setChatSession(newChat);

        if (messages.length === 0) {
            setMessages([{ role: 'model', content: initialGreeting }]);
        }
      } catch (e) {
        console.error("Failed to initialize Gemini:", e);
        setError("Failed to initialize AI session. Please check your API key.");
      }
    };
    initChat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemPrompt, initialGreeting, enableSearch, chatId, deepThinking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading || !chatSession) return;

    const userMessage: ChatMessage = { role: 'user', content: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const stream = await chatSession.sendMessageStream({ message: userInput });
      
      let text = '';
      let groundingChunks: any[] = [];
      setMessages((prev) => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        text += chunk.text;
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          groundingChunks = [...chunk.candidates[0].groundingMetadata.groundingChunks];
        }

        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          const updatedLastMessage = { ...lastMessage, content: text, groundingChunks };
          return [...prev.slice(0, -1), updatedLastMessage];
        });
      }
    } catch (e: any) {
      console.error("Gemini API Error:", e);
      setError("An error occurred while getting a response. Please try again.");
      setMessages((prev) => [...prev, { role: 'model', content: "I'm sorry, I encountered an error." }]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, chatSession, setMessages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex items-center p-3 border-b border-gray-700 bg-gray-900 flex-shrink-0">
        {onBack && (
          <button 
            onClick={onBack} 
            className="p-2 mr-2 -ml-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Back to character selection"
          >
            <BackIcon />
          </button>
        )}
        {character && (
            <img src={character.image} alt={character.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
        )}
        <h2 className="text-xl font-semibold text-white truncate">{character ? character.name : chatTitle}</h2>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  {character ? <img src={character.image} alt={character.name} className="w-full h-full rounded-full object-cover" /> : <BotIcon />}
                </div>
              )}
              <div className={`p-3 rounded-2xl max-w-md md:max-w-lg ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                 <p className="whitespace-pre-wrap">{msg.content}</p>
                 {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-600">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Sources:</h4>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingChunks.map((chunk, i) => (
                        chunk.web?.uri && (
                          <a href={chunk.web.uri} key={i} target="_blank" rel="noopener noreferrer" className="text-xs bg-gray-600 hover:bg-gray-500 text-blue-300 px-2 py-1 rounded-full transition-colors truncate">
                            {chunk.web.title || new URL(chunk.web.uri).hostname}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center"><UserIcon /></div>}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex-shrink-0">
        {error && <p className="text-red-400 text-sm text-center mb-2">{error}</p>}
        <div className="flex items-center bg-gray-700 rounded-lg">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isLoading ? 'Waiting for response...' : placeholderText}
            disabled={isLoading}
            className="w-full bg-transparent p-3 text-gray-200 placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            className="p-3 text-white rounded-r-lg disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            ) : (
                <SendIcon />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;