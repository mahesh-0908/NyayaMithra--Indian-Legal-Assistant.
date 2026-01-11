
export enum Role {
  USER = 'user',
  BOT = 'bot'
}

export type Language = 'en' | 'hi' | 'te';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Attachment {
  data: string; // base64
  mimeType: string;
  name: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  suggestions?: string[];
  sources?: GroundingSource[];
  isError?: boolean;
  attachments?: Attachment[];
  query?: string; // The user query that triggered this response
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

export interface LegalTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Law {
  id: string;
  title: string;
  fullTitle: string;
  year: string;
  category: string;
  summary: string;
  keySections: { number: string; title: string; desc: string }[];
}

export interface CaseLawResult {
  title: string;
  citation: string;
  court: string;
  year: string;
  summary: string;
  link: string;
}
