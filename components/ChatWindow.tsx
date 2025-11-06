import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Chat } from '@google/genai';
import type { ChatMessage, Character } from '../types.ts';
import useLocalStorage from './icons/hooks/useLocalStorage.ts';
import BotIcon from './icons/BotIcon.tsx';
import UserIcon from './icons/UserIcon.tsx';
import SendIcon from './icons/SendIcon.tsx';
import BackIcon from './icons/BackIcon.tsx';
import type { PerformanceMode } from '../App.tsx';

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
  performanceMode?: PerformanceMode;
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
  performanceMode = 'standard',
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
        
        let budget: number | undefined = undefined;

        if (enableSearch) {
          config.tools = [{googleSearch: {}}];
          budget = 8192; // Default budget for search
        }
        
        // Performance mode can override the budget
        switch (performanceMode) {
            case 'deep':
                budget = 16384;
                break;
            case 'quick':
                budget = 2048;
                break;
            case 'extreme':
                budget = 0;
                break;
            case 'standard':
                // Uses default budget (8192 if search is on, else undefined)
                break;
        }

        if (budget !== undefined) {
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
  }, [systemPrompt, initialGreeting, enableSearch, chatId, performanceMode]);

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
    <div className="flex flex-col h-full bg-[var(--background-secondary)]">
      <div className="flex items-center p-3 border-b border-[var(--border-primary)] bg-[var(--background-primary)] flex-shrink-0">
        {onBack && (
          <button 
            onClick={onBack} 
            className="p-2 mr-2 -ml-2 rounded-full hover:bg-[var(--background-interactive-hover)] transition-colors"
            aria-label="Back to character selection"
          >
            <BackIcon />
          </button>
        )}
        {character && (
            <img src={character.image} alt={character.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
        )}
        <h2 className="text-xl font-semibold text-[var(--text-primary)] truncate">{character ? character.name : chatTitle}</h2>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--background-tertiary)] flex items-center justify-center">
                  {character ? <img src={character.image} alt={character.name} className="w-full h-full rounded-full object-cover" /> : <BotIcon />}
                </div>
              )}
              <div className={`p-3 rounded-2xl max-w-md md:max-w-lg ${msg.role === 'user' ? 'bg-[var(--accent-primary)] text-white rounded-br-none' : 'bg-[var(--background-tertiary)] text-[var(--text-primary)] rounded-bl-none'}`}>
                 <p className="whitespace-pre-wrap">{msg.content}</p>
                 {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[var(--border-secondary)]">
                    <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Sources:</h4>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingChunks.map((chunk, i) => (
                        chunk.web?.uri && (
                          <a href={chunk.web.uri} key={i} target="_blank" rel="noopener noreferrer" className="text-xs bg-[var(--background-hover)] hover:bg-[var(--background-interactive-hover)] text-[var(--accent-text)] px-2 py-1 rounded-full transition-colors truncate">
                            {chunk.web.title || new URL(chunk.web.uri).hostname}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center"><UserIcon /></div>}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-[var(--background-primary)]/80 backdrop-blur-sm border-t border-[var(--border-primary)] flex-shrink-0">
        {error && <p className="text-[var(--danger-text)] text-sm text-center mb-2">{error}</p>}
        <div className="flex items-center bg-[var(--background-tertiary)] rounded-lg">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isLoading ? 'Waiting for response...' : placeholderText}
            disabled={isLoading}
            className="w-full bg-transparent p-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            className="p-3 text-white rounded-r-lg disabled:text-[var(--text-muted)] disabled:cursor-not-allowed hover:bg-[var(--accent-primary)] transition-colors"
          >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-[var(--text-primary)] rounded-full animate-spin"></div>
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