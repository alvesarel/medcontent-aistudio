import { Platform } from "../types";

export interface SavedPost {
  id: string;
  userId: string;
  createdAt: string; // ISO Date string
  postContent: string;
  imageUrl?: string; // Base64
  hashtags: string[];
  platform: Platform;
}

export type NewSavedPost = Omit<SavedPost, 'id' | 'userId' | 'createdAt'>;
