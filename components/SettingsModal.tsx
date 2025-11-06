import React, { useState, useEffect } from 'react';
import type { AppSettings, AiModel, Theme, PerformanceMode, ResponseStyle } from '../App.tsx';
import type { AppMode } from '../types.ts';
import useLocalStorage from './icons/hooks/useLocalStorage.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const BASE_APP_MODES: { id: AppMode, name: string, description: string }[] = [
    { id: 'chat', name: 'Standard Chat', description: 'Chat with a helpful AI assistant.' },
    { id: 'researcher', name: 'Researcher', description: 'Deep thinking with Google Search for detailed answers.' },
    { id: 'script_writer', name: 'Script Writer', description: 'Generate scripts for videos and content.' },
    { id: 'code', name: 'Coding Assistant', description: 'Get help with programming and code.' },
    { id: 'bsd', name: 'BSD Mode', description: 'Converse with characters from Bungo Stray Dogs.' },
    { id: 'image', name: 'Image Generation', description: 'Create visuals from text prompts.' },
    { id: 'chess', name: 'Chess Mode', description: 'Play a game of chess against the AI.' },
];

const DARES_MODE = { id: 'dares_nsfw', name: 'Dares (NSFW)', description: 'A playful, dominant AI gives you escalating dares.' };


const THEMES: { id: Theme, name: string }[] = [
    { id: 'light', name: 'Light' },
    { id: 'dark', name: 'Dark' },
    { id: 'black', name: 'Black' },
];

const AI_MODELS: { id: AiModel, name: string, disabled?: boolean }[] = [
  { id: 'gemini', name: 'StellarAi (Gemini)' },
  { id: 'claude', name: 'Claude', disabled: true },
  { id: 'chatgpt', name: 'ChatGPT', disabled: true },
];

const PERFORMANCE_MODES: { id: PerformanceMode, name: string, description: string }[] = [
    { id: 'standard', name: 'Standard', description: 'Balanced performance and response quality.' },
    { id: 'quick', name: 'Quick', description: 'Faster responses for simple queries.' },
    { id: 'extreme', name: 'Extremely Quick', description: 'Near-instant responses, may reduce quality.' },
    { id: 'deep', name: 'Deep Thinking', description: 'More time for complex questions, better answers.' },
];

const RESPONSE_STYLES: { id: ResponseStyle, name: string, description: string }[] = [
    { id: 'standard', name: 'Standard', description: 'Default conversational style.' },
    { id: 'essay', name: 'Essay', description: 'Formal, structured, and detailed responses.' },
    { id: 'concise', name: 'Concise', description: 'Short, to-the-point answers.' },
    { id: 'bullet_points', name: 'Bullet Points', description: 'Formatted with lists for clarity.' },
];


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings, mode, setMode }) => {
  const [daresUnlocked, setDaresUnlocked] = useLocalStorage('daresModeUnlocked', false);
  const [filterClicks, setFilterClicks] = useState(0);

  useEffect(() => {
    if (filterClicks >= 3) {
      setDaresUnlocked(true);
    }
  }, [filterClicks, setDaresUnlocked]);

  const handleFilterClick = () => {
    if (!daresUnlocked) {
        setFilterClicks(c => c + 1);
    }
  };

  if (!isOpen) return null;

  const handleUpdate = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };
  
  const availableModes = daresUnlocked ? [...BASE_APP_MODES, DARES_MODE] : BASE_APP_MODES;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl my-8 border border-[var(--border-primary)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Close settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 
            id="settings-title" 
            className="text-2xl font-bold text-[var(--text-primary)] mb-6"
        >
            Settings
        </h2>

        {/* Theme Selection */}
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Theme</h3>
            <div className="flex items-center bg-[var(--background-tertiary)] p-1 rounded-lg">
                {THEMES.map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => handleUpdate('theme', theme.id)}
                        className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${settings.theme === theme.id ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-primary)] hover:bg-[var(--background-hover)]'}`}
                    >
                        {theme.name}
                    </button>
                ))}
            </div>
        </div>

        {/* Application Mode Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Application Mode</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableModes.map(appMode => (
              <label 
                key={appMode.id}
                className={`flex flex-col p-3 rounded-lg border-2 transition-all cursor-pointer ${mode === appMode.id ? 'bg-[var(--background-interactive-selected)] border-[var(--accent-border)]' : 'bg-[var(--background-tertiary)] border-transparent hover:bg-[var(--background-hover)]'}`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="app-mode"
                    value={appMode.id}
                    checked={mode === appMode.id}
                    onChange={() => setMode(appMode.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-[var(--text-primary)] font-semibold">{appMode.name}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 ml-7">{appMode.description}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Performance Mode */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Performance (Gemini Only)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PERFORMANCE_MODES.map(perfMode => (
              <label 
                key={perfMode.id}
                className={`flex flex-col p-3 rounded-lg border-2 transition-all cursor-pointer ${settings.performanceMode === perfMode.id ? 'bg-[var(--background-interactive-selected)] border-[var(--accent-border)]' : 'bg-[var(--background-tertiary)] border-transparent hover:bg-[var(--background-hover)]'}`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="performance-mode"
                    value={perfMode.id}
                    checked={settings.performanceMode === perfMode.id}
                    onChange={() => handleUpdate('performanceMode', perfMode.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-[var(--text-primary)] font-semibold">{perfMode.name}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 ml-7">{perfMode.description}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Response Style */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Response Style</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RESPONSE_STYLES.map(style => (
              <label 
                key={style.id}
                className={`flex flex-col p-3 rounded-lg border-2 transition-all cursor-pointer ${settings.responseStyle === style.id ? 'bg-[var(--background-interactive-selected)] border-[var(--accent-border)]' : 'bg-[var(--background-tertiary)] border-transparent hover:bg-[var(--background-hover)]'}`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="response-style"
                    value={style.id}
                    checked={settings.responseStyle === style.id}
                    onChange={() => handleUpdate('responseStyle', style.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-[var(--text-primary)] font-semibold">{style.name}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 ml-7">{style.description}</p>
              </label>
            ))}
          </div>
        </div>
        
        {/* AI Model Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">AI Model</h3>
          <div className="space-y-2">
            {AI_MODELS.map(model => (
              <label 
                key={model.id}
                className={`flex items-center p-3 rounded-lg border-2 transition-all ${settings.aiModel === model.id ? 'bg-[var(--background-interactive-selected)] border-[var(--accent-border)]' : 'bg-[var(--background-tertiary)] border-transparent'} ${model.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--background-hover)]'}`}
              >
                <input
                  type="radio"
                  name="ai-model"
                  value={model.id}
                  checked={settings.aiModel === model.id}
                  onChange={() => !model.disabled && handleUpdate('aiModel', model.id)}
                  disabled={model.disabled}
                  className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                />
                <span className="ml-3 text-[var(--text-primary)]">{model.name}</span>
                {model.disabled && <span className="ml-auto text-xs text-[var(--text-secondary)] bg-[var(--background-hover)] px-2 py-1 rounded-full">Coming Soon</span>}
              </label>
            ))}
          </div>
        </div>

        {/* Content Filter */}
        <div>
          <h3 
            className="text-lg font-semibold text-[var(--text-primary)] mb-3 cursor-pointer select-none"
            onClick={handleFilterClick}
            title={daresUnlocked ? "Dares Unlocked" : "???"}
          >
            Content Filter
          </h3>
          <div className="flex items-center justify-between p-3 bg-[var(--background-tertiary)] rounded-lg">
            <label htmlFor="nsfw-toggle-button" className="text-[var(--text-primary)] cursor-pointer pr-4">
              Enable NSFW Content
              <p className="text-xs text-[var(--text-secondary)] mt-1">Allows for mature topics and stronger language. Content policies still apply.</p>
            </label>
            <button
                id="nsfw-toggle-button"
                onClick={() => handleUpdate('isNsfw', !settings.isNsfw)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0 ${settings.isNsfw ? 'bg-[var(--danger-background)]' : 'bg-[var(--background-hover)]'}`}
                aria-pressed={settings.isNsfw}
            >
                <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.isNsfw ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;