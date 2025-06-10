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
  author: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    email?: string;
    role?: string;
  };
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
} 