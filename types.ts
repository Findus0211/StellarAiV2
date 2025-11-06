import type { GroundingChunk } from '@google/genai';

export type AppMode = 'chat' | 'image' | 'bsd' | 'code' | 'chess' | 'researcher' | 'script_writer' | 'dares_nsfw';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  groundingChunks?: GroundingChunk[];
}

export interface Character {
  id: string;
  name: string;
  image: string;
  greeting: string;
  systemPrompt: string;
  nsfwSystemPrompt?: string;
  voice?: string;
}

export interface User {
  email: string;
}