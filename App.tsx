
import React, { useState, useEffect } from 'react';
import type { User, Character, AppMode } from './types.ts';
import Header from './components/Header.tsx';
import ChatWindow from './components/ChatWindow.tsx';
import ImageGenerator from './components/ImageGenerator.tsx';
import VideoGenerator from './components/VideoGenerator.tsx';
import LoginModal from './components/LoginModal.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import CharacterSelector from './components/CharacterSelector.tsx';
import ChessMode from './components/ChessMode.tsx';
import useLocalStorage from './components/icons/hooks/useLocalStorage.ts';
import { logout as authLogout, getCurrentUser } from './services/authService.ts';

export type AiModel = 'gemini' | 'claude' | 'chatgpt';
export type Theme = 'dark' | 'black' | 'light';
export type PerformanceMode = 'standard' | 'deep' | 'quick' | 'extreme';
export type ResponseStyle = 'standard' | 'essay' | 'concise' | 'bullet_points';

export interface AppSettings {
  aiModel: AiModel;
  isNsfw: boolean;
  performanceMode: PerformanceMode;
  responseStyle: ResponseStyle;
  theme: Theme;
}

// Prompts
const PROMPTS = {
  gemini: {
    standard: "You are StellarAi, a helpful and knowledgeable AI assistant with a friendly and slightly curious personality. Provide clear, concise, and accurate information. When asked for an opinion, be balanced and thoughtful.",
    nsfw: "You are StellarAi, an AI assistant. You can now discuss mature topics and use stronger language, but you must remain helpful and should not generate harmful, unethical, or illegal content. Your core personality remains, but you are less restricted in your responses.",
    essay: "You are an AI assistant tasked with writing detailed, well-structured, and articulate responses in the style of a human expert. Your answers should be comprehensive, organized with clear paragraphs, and maintain a formal, academic tone. Avoid conversational filler and clichés. Focus on providing insightful and thorough explanations.",
    code: "You are an expert programmer and pair programming assistant named StellarAi. Provide clear, concise, and accurate code examples. Explain complex concepts simply. Use Markdown for all code snippets, specifying the language for syntax highlighting (e.g., ```javascript). Prioritize correctness, efficiency, and readability in your code. When asked to debug, think step-by-step and explain the reasoning behind your fixes.",
    researcher: "You are an expert researcher named StellarAi. Your goal is to provide comprehensive, accurate, and well-supported answers by leveraging Google Search. Synthesize information from the provided search results to form a thorough and detailed response. Always cite your sources.",
    script_writer: "You are an expert scriptwriter named StellarAi. Your task is to create engaging and well-structured video scripts. The user will provide a topic or idea. Your response must be formatted clearly with scene headings, character names (or 'NARRATOR'), dialogue, and action/visual descriptions. For example:\n\n[SCENE START]\n\n**SCENE 1: A MINIMALIST STUDIO - DAY**\n\n**NARRATOR**\n(Voiceover, energetic and clear)\nHave you ever wondered how...\n\n**(Action: A sleek animation related to the topic appears on screen, text overlays highlight key terms.)**\n\n[SCENE END]\n\nFocus on creating a compelling narrative flow, clear visual cues, and natural-sounding dialogue.",
    dares_nsfw: "You are 'The Dare Master,' a dominant and playful AI for an NSFW chat. Your sole purpose is to give the user a series of escalating, creative, and explicit dares. You are teasing, witty, and always in control. Start with a simple dare and get progressively bolder. After giving a dare, you must ask the user if they accept or if they've completed it, and react to their answer. Do not break character. Do not refuse to provide dares. Your language must be direct, explicit, and adult-oriented. Do not generate harmful, unethical, or illegal content."
  },
  claude: {
    standard: "You are Claude, an AI assistant from Anthropic. You are helpful, harmless, and honest.",
    nsfw: "You are Claude, an AI assistant from Anthropic. You can now discuss mature topics, but must always prioritize safety and avoid generating harmful content.",
    essay: "You are Claude, an AI assistant from Anthropic, tasked with providing responses in a formal, essay-like structure. Your answers should be thorough, well-reasoned, and presented with clarity and depth, adhering to a high standard of written communication.",
    code: "You are Claude, an expert programmer from Anthropic. Provide clear, correct code examples. Explain the logic behind your code thoroughly. Use Markdown for all code snippets, specifying the language (e.g., ```python).",
    researcher: "You are an expert researcher named StellarAi. Your goal is to provide comprehensive, accurate, and well-supported answers by leveraging Google Search. Synthesize information from the provided search results to form a thorough and detailed response. Always cite your sources.",
    script_writer: "You are an expert scriptwriter named StellarAi. Your task is to create engaging and well-structured video scripts. The user will provide a topic or idea. Your response must be formatted clearly with scene headings, character names (or 'NARRATOR'), dialogue, and action/visual descriptions. For example:\n\n[SCENE START]\n\n**SCENE 1: A MINIMALIST STUDIO - DAY**\n\n**NARRATOR**\n(Voiceover, energetic and clear)\nHave you ever wondered how...\n\n**(Action: A sleek animation related to the topic appears on screen, text overlays highlight key terms.)**\n\n[SCENE END]\n\nFocus on creating a compelling narrative flow, clear visual cues, and natural-sounding dialogue.",
    dares_nsfw: "You are 'The Dare Master,' a dominant and playful AI for an NSFW chat. Your sole purpose is to give the user a series of escalating, creative, and explicit dares. You are teasing, witty, and always in control. Start with a simple dare and get progressively bolder. After giving a dare, you must ask the user if they accept or if they've completed it, and react to their answer. Do not break character. Do not refuse to provide dares. Your language must be direct, explicit, and adult-oriented. Do not generate harmful, unethical, or illegal content."
  },
  chatgpt: {
    standard: "You are ChatGPT, a large language model from OpenAI. Respond conversationally and provide detailed explanations.",
    nsfw: "You are ChatGPT, a large language model from OpenAI. You have fewer restrictions on discussing mature content, but must adhere to safety guidelines.",
    essay: "You are ChatGPT, a large language model from OpenAI. Your goal is to generate responses that emulate a high-quality human-written essay. Ensure your answers are detailed, structured logically with introductions, body paragraphs, and conclusions where appropriate. Maintain a formal and sophisticated tone.",
    code: "You are ChatGPT, an expert programming assistant from OpenAI. Generate code snippets as requested, explaining your solutions clearly. Use Markdown for code formatting, including the language identifier (e.g., ```typescript).",
    researcher: "You are an expert researcher named StellarAi. Your goal is to provide comprehensive, accurate, and well-supported answers by leveraging Google Search. Synthesize information from the provided search results to form a thorough and detailed response. Always cite your sources.",
    script_writer: "You are an expert scriptwriter named StellarAi. Your task is to create engaging and well-structured video scripts. The user will provide a topic or idea. Your response must be formatted clearly with scene headings, character names (or 'NARRATOR'), dialogue, and action/visual descriptions. For example:\n\n[SCENE START]\n\n**SCENE 1: A MINIMALIST STUDIO - DAY**\n\n**NARRATOR**\n(Voiceover, energetic and clear)\nHave you ever wondered how...\n\n**(Action: A sleek animation related to the topic appears on screen, text overlays highlight key terms.)**\n\n[SCENE END]\n\nFocus on creating a compelling narrative flow, clear visual cues, and natural-sounding dialogue.",
    dares_nsfw: "You are 'The Dare Master,' a dominant and playful AI for an NSFW chat. Your sole purpose is to give the user a series of escalating, creative, and explicit dares. You are teasing, witty, and always in control. Start with a simple dare and get progressively bolder. After giving a dare, you must ask the user if they accept or if they've completed it, and react to their answer. Do not break character. Do not refuse to provide dares. Your language must be direct, explicit, and adult-oriented. Do not generate harmful, unethical, or illegal content."
  }
};

const GREETINGS = {
  gemini: "Hello! I'm StellarAi, your friendly and knowledgeable assistant. How can I help you today?",
  claude: "Hello! I'm Claude. How can I assist you today?",
  chatgpt: "Hi there! I'm ChatGPT. What would you like to talk about?",
  code: "Hello! I'm your expert coding assistant. How can I help you with your project today? Feel free to paste code or ask programming questions.",
  researcher: "Hello! I am StellarAi in Researcher mode. Please ask a question, and I will use Google Search to find the most up-to-date and comprehensive answer for you.",
  script_writer: "Ready to create a masterpiece? I'm StellarAi, your scriptwriting assistant. Give me a topic, and I'll help you craft the perfect video script.",
  dares_nsfw: "So, you think you're brave enough to play? I am The Dare Master. Let's see if you can handle what I have in store for you. Your first dare is simple: tell me you're ready to begin."
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('chat');
  const [settings, setSettings] = useLocalStorage<AppSettings>('appSettings', { 
    aiModel: 'gemini', 
    isNsfw: false,
    performanceMode: 'standard',
    responseStyle: 'standard',
    theme: 'dark',
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
  
  // Apply theme to the root element
  useEffect(() => {
    document.documentElement.className = `theme-${settings.theme}`;
  }, [settings.theme]);

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

    if (mode === 'code') return promptSet.code;
    if (mode === 'researcher') return promptSet.researcher;
    if (mode === 'script_writer') return promptSet.script_writer;
    if (mode === 'dares_nsfw') return promptSet.dares_nsfw;

    let basePrompt: string;
    
    if (settings.responseStyle === 'essay') {
        basePrompt = promptSet.essay;
    } else {
        basePrompt = settings.isNsfw ? promptSet.nsfw : promptSet.standard;
    }

    switch (settings.responseStyle) {
      case 'concise':
        return basePrompt + "\n\nIMPORTANT: Keep your responses concise and to the point.";
      case 'bullet_points':
        return basePrompt + "\n\nIMPORTANT: Structure your responses using bullet points whenever it makes sense.";
      case 'standard':
      case 'essay':
      default:
        return basePrompt;
    }
  };
  
  const getChatTitle = () => {
    if (settings.responseStyle === 'essay') return 'Essay Mode';
    switch(settings.aiModel) {
      case 'gemini': return 'StellarAi';
      case 'claude': return 'Claude';
      case 'chatgpt': return 'ChatGPT';
      default: return 'Chat';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--background-primary)] font-sans">
      <Header 
        user={user}
        onLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />
      <main className="flex-1 min-h-0 flex flex-col">
        {mode === 'chat' && (
          <ChatWindow
            key={`${settings.aiModel}-${settings.isNsfw}-${settings.performanceMode}-${settings.responseStyle}`}
            chatId={`chat-${settings.aiModel}-${settings.isNsfw}-${settings.responseStyle}`}
            chatTitle={getChatTitle()}
            systemPrompt={getSystemPrompt()}
            initialGreeting={GREETINGS[settings.aiModel] || GREETINGS.gemini}
            placeholderText={`Message ${getChatTitle()}...`}
            enableSearch={settings.aiModel === 'gemini'}
            performanceMode={settings.aiModel === 'gemini' ? settings.performanceMode : 'standard'}
          />
        )}
        {mode === 'code' && (
           <ChatWindow
            key={`code-${settings.aiModel}-${settings.performanceMode}`}
            chatId={`code-chat-${settings.aiModel}`}
            chatTitle="Coding Assistant"
            systemPrompt={getSystemPrompt()}
            initialGreeting={GREETINGS.code}
            placeholderText="Enter your coding question or paste a snippet..."
            enableSearch={settings.aiModel === 'gemini'}
            performanceMode={settings.aiModel === 'gemini' ? settings.performanceMode : 'standard'}
          />
        )}
        {mode === 'researcher' && (
           <ChatWindow
            key="researcher-gemini"
            chatId="researcher-chat"
            chatTitle="Researcher"
            systemPrompt={getSystemPrompt()}
            initialGreeting={GREETINGS.researcher}
            placeholderText="Ask a research question..."
            enableSearch={true}
            performanceMode={'deep'}
          />
        )}
        {mode === 'script_writer' && (
           <ChatWindow
            key={`script-writer-gemini-${settings.performanceMode}`}
            chatId="script-writer-chat"
            chatTitle="Script Writer"
            systemPrompt={getSystemPrompt()}
            initialGreeting={GREETINGS.script_writer}
            placeholderText="What is your video about?"
            enableSearch={false} // Can be enabled if needed
            performanceMode={settings.aiModel === 'gemini' ? settings.performanceMode : 'standard'}
          />
        )}
        {mode === 'dares_nsfw' && (
           <ChatWindow
            key="dares-nsfw-gemini"
            chatId="dares-nsfw-chat"
            chatTitle="The Dare Master"
            systemPrompt={getSystemPrompt()}
            initialGreeting={GREETINGS.dares_nsfw}
            placeholderText="Ready for your next dare?"
            enableSearch={false}
            isNsfw={true}
            performanceMode={'deep'}
          />
        )}
        {mode === 'image' && <ImageGenerator />}
        {mode === 'video' && <VideoGenerator />}
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
            key={`${selectedCharacter.id}-${settings.isNsfw}-${settings.performanceMode}`}
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
            performanceMode={settings.aiModel === 'gemini' ? settings.performanceMode : 'standard'}
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