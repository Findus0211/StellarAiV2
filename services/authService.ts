import type { User } from '../types';

const USER_KEY = 'githubUser';

// Simulates a GitHub OAuth login flow.
export const login = async (): Promise<{ user: User, token: string }> => {
  console.log("Simulating GitHub login...");
  // In a real app, this would involve a popup, redirect to GitHub,
  // and a backend call to exchange a code for a token.

  // For simulation, we'll create a mock user and token.
  const mockUser: User = {
    email: 'stellar.user@example.com',
  };
  const mockToken = `gh_token_${Date.now()}`;

  // Store user info and token to persist session
  localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
  
  console.log("Simulated login successful.");
  return { user: mockUser, token: mockToken };
};

// Clears the simulated user session.
export const logout = (): void => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('githubToken');
  console.log("User logged out.");
};

// Gets the current user from storage, if available.
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};
