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
    <header className="bg-gray-900/70 backdrop-blur-sm shadow-lg p-3 sm:p-4 flex justify-between items-center z-20 flex-shrink-0">
      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider">
        <span className="text-blue-400">Stellar</span>Ai
      </h1>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button 
          onClick={onOpenSettings}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Open Settings"
        >
          <SettingsIcon />
        </button>

        <div className="h-8 border-l border-gray-600"></div>

        <div className="relative">
            {user ? (
                <div className="flex items-center">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <LoginIcon />
                        </div>
                        <span className="text-white font-semibold hidden sm:inline">{user.email}</span>
                    </button>
                    {dropdownOpen && (
                        <div ref={dropdownRef} className="absolute top-12 right-0 bg-gray-800 rounded-md shadow-lg w-48 py-1">
                            <button onClick={onLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button 
                  onClick={onLogin} 
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                >
                    <LoginIcon />
                    <span className="text-white font-semibold">Login</span>
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;