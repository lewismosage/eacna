export interface Post {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  attachments?: Array<{
    type: string;
    name: string;
    url: string;
  }>;
  author_first_name: string;
  author_last_name: string;
  author_avatar_url?: string;
  author_email?: string;
  author_role?: string;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
} 