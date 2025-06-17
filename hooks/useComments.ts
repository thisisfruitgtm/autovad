import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { logActivity } from '@/lib/analytics';

type Comment = Database['public']['Tables']['comments']['Row'] & {
  user: Database['public']['Tables']['users']['Row'];
};

export function useComments(carId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(*)
        `)
        .eq('car_id', carId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (text: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          car_id: carId,
          text,
        })
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) throw error;

      setComments(prev => [data, ...prev]);
      await logActivity(user.id, 'comment', 'car', carId, { text });
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const deleteComment = async (commentId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      await logActivity(user.id, 'delete_comment', 'car', carId);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [carId]);

  return {
    comments,
    loading,
    error,
    addComment,
    deleteComment,
    refetch: fetchComments,
  };
}