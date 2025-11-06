import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types.ts';
import LoginIcon from './icons/LoginIcon.tsx';
import SettingsIcon from './icons/SettingsIcon.tsx';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout, onOpenSettings }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[var(--background-primary)]/80 backdrop-blur-sm shadow-lg p-3 sm:p-4 flex justify-between items-center z-20 flex-shrink-0 border-b border-[var(--border-primary)]">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-wider">
        <span className="text-[var(--accent-text)]">Stellar</span>Ai
      </h1>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button 
          onClick={onOpenSettings}
          className="p-2 rounded-full hover:bg-[var(--background-interactive-hover)] transition-colors"
          aria-label="Open Settings"
        >
          <SettingsIcon />
        </button>

        <div className="h-8 border-l border-[var(--border-secondary)]"></div>

        <div className="relative">
            {user ? (
                <div className="flex items-center">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
                          <LoginIcon />
                        </div>
                        <span className="text-[var(--text-primary)] font-semibold hidden sm:inline">{user.email}</span>
                    </button>
                    {dropdownOpen && (
                        <div ref={dropdownRef} className="absolute top-12 right-0 bg-[var(--background-secondary)] rounded-md shadow-lg w-48 py-1 border border-[var(--border-primary)]">
                            <button onClick={onLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-[var(--danger-text)] hover:bg-[var(--background-interactive-hover)]">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button 
                  onClick={onLogin} 
                  className="flex items-center space-x-2 px-3 py-2 bg-[var(--background-secondary)] hover:bg-[var(--background-interactive-hover)] rounded-md transition-colors"
                >
                    <LoginIcon />
                    <span className="text-[var(--text-primary)] font-semibold">Login</span>
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;