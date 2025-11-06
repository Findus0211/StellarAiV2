import React from 'react';
import type { AppSettings, AiModel, Theme } from '../App.tsx';
import type { AppMode } from '../types.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const APP_MODES: { id: AppMode, name: string, description: string }[] = [
    { id: 'chat', name: 'Standard Chat', description: 'Chat with a helpful AI assistant.' },
    { id: 'bsd', name: 'BSD Mode', description: 'Converse with characters from Bungo Stray Dogs.' },
    { id: 'image', name: 'Image Generation', description: 'Create visuals from text prompts.' },
    { id: 'code', name: 'Coding Assistant', description: 'Get help with programming and code.' },
    { id: 'chess', name: 'Chess Mode', description: 'Play a game of chess against the AI.' },
];

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

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings, mode, setMode }) => {
  if (!isOpen) return null;

  const handleUpdate = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg my-8 border border-[var(--border-primary)] relative"
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

        <h2 id="settings-title" className="text-2xl font-bold text-[var(--text-primary)] mb-6">Settings</h2>

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
            {APP_MODES.map(appMode => (
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
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Content Filter</h3>
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
        
        {/* Deep Thinking */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Performance</h3>
          <div className="flex items-center justify-between p-3 bg-[var(--background-tertiary)] rounded-lg">
            <label htmlFor="deep-thinking-toggle" className="text-[var(--text-primary)] cursor-pointer pr-4">
              Enable Deep Thinking
              <p className="text-xs text-[var(--text-secondary)] mt-1">Allows the AI more processing time for complex questions, yielding more thorough answers. (Gemini only)</p>
            </label>
            <button
                id="deep-thinking-toggle"
                onClick={() => handleUpdate('deepThinking', !settings.deepThinking)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0 ${settings.deepThinking ? 'bg-[var(--accent-primary)]' : 'bg-[var(--background-hover)]'}`}
                aria-pressed={settings.deepThinking}
            >
                <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.deepThinking ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </button>
          </div>
        </div>

        {/* Human-like Essay Mode */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Response Style</h3>
          <div className="flex items-center justify-between p-3 bg-[var(--background-tertiary)] rounded-lg">
            <label htmlFor="essay-mode-toggle" className="text-[var(--text-primary)] cursor-pointer pr-4">
              Human-like Essay Mode
              <p className="text-xs text-[var(--text-secondary)] mt-1">The AI will respond in a structured, formal, and detailed manner. (Disables character personas)</p>
            </label>
            <button
                id="essay-mode-toggle"
                onClick={() => handleUpdate('humanEssayMode', !settings.humanEssayMode)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0 ${settings.humanEssayMode ? 'bg-[var(--accent-primary)]' : 'bg-[var(--background-hover)]'}`}
                aria-pressed={settings.humanEssayMode}
            >
                <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.humanEssayMode ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;