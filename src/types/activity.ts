// types/activity.ts
export type Activity = {
  id: string;
  type: 'member_application' | 'membership_renewal' | 'payment_received' | 
        'publication_submission' | 'member_upgrade' | 'admin_action';
  title: string;
  description: string;
  user_id?: string;
  related_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
};