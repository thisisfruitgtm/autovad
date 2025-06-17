import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { logActivity } from '@/lib/analytics';

type Brand = Database['public']['Tables']['brands']['Row'];

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [userBrands, setUserBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrands(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBrands = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserBrands(data || []);
    } catch (err) {
      console.error('Error fetching user brands:', err);
    }
  };

  const createBrand = async (brandData: Omit<Brand, 'id' | 'owner_id' | 'created_at' | 'updated_at' | 'total_cars' | 'total_sold' | 'rating'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('brands')
        .insert({
          ...brandData,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update user type to seller
      await supabase
        .from('users')
        .update({ user_type: 'seller' })
        .eq('id', user.id);

      await logActivity(user.id, 'create', 'brand', data.id);
      
      setUserBrands(prev => [data, ...prev]);
      setBrands(prev => [data, ...prev]);
      
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create brand';
      return { data: null, error };
    }
  };

  const updateBrand = async (brandId: string, updates: Partial<Brand>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', brandId)
        .eq('owner_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await logActivity(user.id, 'update', 'brand', brandId);
      
      setUserBrands(prev => prev.map(brand => brand.id === brandId ? data : brand));
      setBrands(prev => prev.map(brand => brand.id === brandId ? data : brand));
      
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update brand';
      return { data: null, error };
    }
  };

  const deleteBrand = async (brandId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId)
        .eq('owner_id', user.id);

      if (error) throw error;

      await logActivity(user.id, 'delete', 'brand', brandId);
      
      setUserBrands(prev => prev.filter(brand => brand.id !== brandId));
      setBrands(prev => prev.filter(brand => brand.id !== brandId));
      
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete brand';
      return { error };
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchUserBrands();
  }, []);

  return {
    brands,
    userBrands,
    loading,
    error,
    refetch: fetchBrands,
    refetchUserBrands: fetchUserBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  };
}