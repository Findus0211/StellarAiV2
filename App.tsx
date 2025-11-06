import React, { useState, useEffect } from 'react';
import type { User, Character, AppMode } from './types.ts';
import Header from './components/Header.tsx';
import ChatWindow from './components/ChatWindow.tsx';
import ImageGenerator from './components/ImageGenerator.tsx';
import LoginModal from './components/LoginModal.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import CharacterSelector from './components/CharacterSelector.tsx';
import ChessMode from './components/ChessMode.tsx';
import useLocalStorage from './components/icons/hooks/useLocalStorage.ts';
import { logout as authLogout, getCurrentUser } from './services/authService.ts';

export type AiModel = 'gemini' | 'claude' | 'chatgpt';
export interface AppSettings {
  aiModel: AiModel;
  isNsfw: boolean;
  deepThinking: boolean;
  humanEssayMode: boolean;
}

// Prompts
const PROMPTS = {
  gemini: {
    standard: "You are StellarAi, a helpful and knowledgeable AI assistant with a friendly and slightly curious personality. Provide clear, concise, and accurate information. When asked for an opinion, be balanced and thoughtful.",
    nsfw: "You are StellarAi, an AI assistant. You can now discuss mature topics and use stronger language, but you must remain helpful and should not generate harmful, unethical, or illegal content. Your core personality remains, but you are less restricted in your responses.",
    essay: "You are an AI assistant tasked with writing detailed, well-structured, and articulate responses in the style of a human expert. Your answers should be comprehensive, organized with clear paragraphs, and maintain a formal, academic tone. Avoid conversational filler and clichés. Focus on providing insightful and thorough explanations.",
    code: "You are an expert programmer and pair programming assistant named StellarAi. Provide clear, concise, and accurate code examples. Explain complex concepts simply. Use Markdown for all code snippets, specifying the language for syntax highlighting (e.g., ```javascript). Prioritize correctness, efficiency, and readability in your code. When asked to debug, think step-by-step and explain the reasoning behind your fixes."
  },
  claude: {
    standard: "You are Claude, an AI assistant from Anthropic. You are helpful, harmless, and honest.",
    nsfw: "You are Claude, an AI assistant from Anthropic. You can now discuss mature topics, but must always prioritize safety and avoid generating harmful content.",
    essay: "You are Claude, an AI assistant from Anthropic, tasked with providing responses in a formal, essay-like structure. Your answers should be thorough, well-reasoned, and presented with clarity and depth, adhering to a high standard of written communication.",
    code: "You are Claude, an expert programmer from Anthropic. Provide clear, correct code examples. Explain the logic behind your code thoroughly. Use Markdown for all code snippets, specifying the language (e.g., ```python)."
  },
  chatgpt: {
    standard: "You are ChatGPT, a large language model from OpenAI. Respond conversationally and provide detailed explanations.",
    nsfw: "You are ChatGPT, a large language model from OpenAI. You have fewer restrictions on discussing mature content, but must adhere to safety guidelines.",
    essay: "You are ChatGPT, a large language model from OpenAI. Your goal is to generate responses that emulate a high-quality human-written essay. Ensure your answers are detailed, structured logically with introductions, body paragraphs, and conclusions where appropriate. Maintain a formal and sophisticated tone.",
    code: "You are ChatGPT, an expert programming assistant from OpenAI. Generate code snippets as requested, explaining your solutions clearly. Use Markdown for code formatting, including the language identifier (e.g., ```typescript)."
  }
};

const GREETINGS = {
  gemini: "Hello! I'm StellarAi, your friendly and knowledgeable assistant. How can I help you today?",
  claude: "Hello! I'm Claude. How can I assist you today?",
  chatgpt: "Hi there! I'm ChatGPT. What would you like to talk about?",
  code: "Hello! I'm your expert coding assistant. How can I help you with your project today? Feel free to paste code or ask programming questions."
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('chat');
  const [settings, setSettings] = useLocalStorage<AppSettings>('appSettings', { 
    aiModel: 'gemini', 
    isNsfw: false,
    deepThinking: false,
    humanEssayMode: false,
  });
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useLocalStorage<string | null>('githubToken', null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);
  
  // Reset character selection when leaving BSD mode
  useEffect(() => {
    if (mode !== 'bsd') {
      setSelectedCharacter(null);
    }
  }, [mode]);

  const handleLogout = () => {
    authLogout();
    setUser(null);
    setToken(null);
  };

  const handleLoginSuccess = (loggedInUser: User, authToken: string) => {
    setUser(loggedInUser);
    setToken(authToken);
    setLoginModalOpen(false);
  };
  
  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleBackToCharacters = () => {
    setSelectedCharacter(null);
  };

  const getSystemPrompt = () => {
    const promptSet = PROMPTS[settings.aiModel] || PROMPTS.gemini;
    if (mode === 'code') {
      return promptSet.code;
    }
    if (settings.humanEssayMode) {
      return promptSet.essay;
    }
    return settings.isNsfw ? promptSet.nsfw : promptSet.standard;
  };
  
  const getChatTitle = () => {
    if (settings.humanEssayMode) return 'Essay Mode';
    switch(settings.aiModel) {
      case 'gemini': return 'StellarAi';
      case 'claude': return 'Claude';
      case 'chatgpt': return 'ChatGPT';
      default: return 'Chat';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 font-sans">
      <Header 
        user={user}
        onLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />
      <main className="flex-1 min-h-0 flex flex-col">
        {mode === 'chat' && (
          <ChatWindow
            key={`${settings.aiModel}-${settings.isNsfw}-${settings.deepThinking}-${settings.humanEssayMode}`}
            chatId={`chat-${settings.aiModel}-${settings.isNsfw}-${settings.humanEssayMode}`}
            chatTitle={getChatTitle()}
            systemPrompt={getSystemPrompt()}
            initialGreeting={GREETINGS[settings.aiModel] || GREETINGS.gemini}
            placeholderText={`Message ${getChatTitle()}...`}
            enableSearch={settings.aiModel === 'gemini'}
            deepThinking={settings.deepThinking && settings.aiModel === 'gemini'}
          />
        )}
        {mode === 'code' && (
           <ChatWindow
            key={`code-${settings.aiModel}-${settings.deepThinking}`}
            chatId={`code-chat-${settings.aiModel}`}
            chatTitle="Coding Assistant"
            systemPrompt={getSystemPrompt()}
            initialGreeting={GREETINGS.code}
            placeholderText="Enter your coding question or paste a snippet..."
            enableSearch={settings.aiModel === 'gemini'}
            deepThinking={settings.deepThinking && settings.aiModel === 'gemini'}
          />
        )}
        {mode === 'image' && <ImageGenerator />}
        {mode === 'chess' && <ChessMode />}
        {mode === 'bsd' && !selectedCharacter && (
          <CharacterSelector 
            onSelectCharacter={handleSelectCharacter}
            user={user}
            token={token}
          />
        )}
        {mode === 'bsd' && selectedCharacter && (
          <ChatWindow
            key={`${selectedCharacter.id}-${settings.isNsfw}-${settings.deepThinking}`}
            chatId={`bsd-chat-${selectedCharacter.id}-${settings.isNsfw}`}
            character={selectedCharacter}
            systemPrompt={settings.isNsfw 
              ? selectedCharacter.nsfwSystemPrompt || selectedCharacter.systemPrompt 
              : selectedCharacter.systemPrompt}
            initialGreeting={selectedCharacter.greeting}
            placeholderText={`Message ${selectedCharacter.name}...`}
            enableSearch={false}
            onBack={handleBackToCharacters}
            isNsfw={settings.isNsfw}
            deepThinking={settings.deepThinking && settings.aiModel === 'gemini'}
          />
        )}
      </main>
      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setLoginModalOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={settings}
          onUpdateSettings={setSettings}
          mode={mode}
          setMode={setMode}
        />
      )}
    </div>
  );
};

export default App;