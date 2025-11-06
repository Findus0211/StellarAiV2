import React, { useState } from 'react';
import { login } from '../services/authService.ts';
import type { User } from '../types.ts';
import GitHubIcon from './icons/GitHubIcon.tsx';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await login();
      onSuccess(user, token);
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--background-secondary)] rounded-xl shadow-2xl p-8 w-full max-w-md m-4 text-center border border-[var(--border-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Login to Sync Favorites</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          Log in with your GitHub account (simulated) to save and sync your favorite characters across devices.
        </p>

        {error && <p className="text-[var(--danger-text)] text-sm mb-4">{error}</p>}
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-[var(--background-primary)] hover:bg-black rounded-lg text-[var(--text-primary)] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-t-transparent border-[var(--text-primary)] rounded-full animate-spin"></div>
          ) : (
            <>
              <GitHubIcon />
              <span>Login with GitHub</span>
            </>
          )}
        </button>

        <button 
          onClick={onClose}
          className="mt-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

export default LoginModal;