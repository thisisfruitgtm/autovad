import { supabase } from './supabase';

export async function logActivity(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: any
) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

export async function getActivityLogs(userId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
}