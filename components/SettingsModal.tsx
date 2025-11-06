import React from 'react';
import type { AppSettings, AiModel } from '../App.tsx';
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


const AI_MODELS: { id: AiModel, name: string, disabled?: boolean }[] = [
  { id: 'gemini', name: 'StellarAi (Gemini)' },
  { id: 'claude', name: 'Claude', disabled: true },
  { id: 'chatgpt', name: 'ChatGPT', disabled: true },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings, mode, setMode }) => {
  if (!isOpen) return null;

  const handleAiChange = (aiModel: AiModel) => {
    onUpdateSettings({ ...settings, aiModel });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg m-4 border border-gray-700 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Close settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id="settings-title" className="text-2xl font-bold text-white mb-6">Settings</h2>

        {/* Application Mode Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">Application Mode</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {APP_MODES.map(appMode => (
              <label 
                key={appMode.id}
                className={`flex flex-col p-3 rounded-lg border-2 transition-all cursor-pointer ${mode === appMode.id ? 'bg-blue-900/50 border-blue-500' : 'bg-gray-700 border-transparent hover:bg-gray-600'}`}
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
                  <span className="ml-3 text-white font-semibold">{appMode.name}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-7">{appMode.description}</p>
              </label>
            ))}
          </div>
        </div>

        {/* AI Model Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">AI Model</h3>
          <div className="space-y-2">
            {AI_MODELS.map(model => (
              <label 
                key={model.id}
                className={`flex items-center p-3 rounded-lg border-2 transition-all ${settings.aiModel === model.id ? 'bg-blue-900/50 border-blue-500' : 'bg-gray-700 border-transparent'} ${model.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-600'}`}
              >
                <input
                  type="radio"
                  name="ai-model"
                  value={model.id}
                  checked={settings.aiModel === model.id}
                  onChange={() => !model.disabled && handleAiChange(model.id)}
                  disabled={model.disabled}
                  className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                />
                <span className="ml-3 text-white">{model.name}</span>
                {model.disabled && <span className="ml-auto text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded-full">Coming Soon</span>}
              </label>
            ))}
          </div>
        </div>

        {/* Content Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">Content Filter</h3>
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <label htmlFor="nsfw-toggle-button" className="text-white cursor-pointer pr-4">
              Enable NSFW Content
              <p className="text-xs text-gray-400 mt-1">Allows for mature topics and stronger language. Content policies still apply.</p>
            </label>
            <button
                id="nsfw-toggle-button"
                onClick={() => onUpdateSettings({ ...settings, isNsfw: !settings.isNsfw })}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0 ${settings.isNsfw ? 'bg-red-500' : 'bg-gray-600'}`}
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
          <h3 className="text-lg font-semibold text-gray-300 mb-3">Performance</h3>
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <label htmlFor="deep-thinking-toggle" className="text-white cursor-pointer pr-4">
              Enable Deep Thinking
              <p className="text-xs text-gray-400 mt-1">Allows the AI more processing time for complex questions, yielding more thorough answers. (Gemini only)</p>
            </label>
            <button
                id="deep-thinking-toggle"
                onClick={() => onUpdateSettings({ ...settings, deepThinking: !settings.deepThinking })}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0 ${settings.deepThinking ? 'bg-blue-500' : 'bg-gray-600'}`}
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
          <h3 className="text-lg font-semibold text-gray-300 mb-3">Response Style</h3>
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <label htmlFor="essay-mode-toggle" className="text-white cursor-pointer pr-4">
              Human-like Essay Mode
              <p className="text-xs text-gray-400 mt-1">The AI will respond in a structured, formal, and detailed manner. (Disables character personas)</p>
            </label>
            <button
                id="essay-mode-toggle"
                onClick={() => onUpdateSettings({ ...settings, humanEssayMode: !settings.humanEssayMode })}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0 ${settings.humanEssayMode ? 'bg-blue-500' : 'bg-gray-600'}`}
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