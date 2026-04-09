import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface PointsContextType {
  userPoints: number;
  updatePoints: (newPoints: number) => void;
  deductPoints: (amount: number) => void;
  addPoints: (amount: number) => void;
  refreshPoints: () => Promise<void>;
  loading: boolean;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};

interface PointsProviderProps {
  children: ReactNode;
}

export const PointsProvider: React.FC<PointsProviderProps> = ({ children }) => {
  const [userPoints, setUserPoints] = useState(1247); // Default starting points
  const [loading, setLoading] = useState(true);

  // Fetch user points from database or localStorage
  const fetchUserPoints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Try to get points from database first
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();

        if (!error && profileData?.points !== null) {
          setUserPoints(profileData.points);
        } else {
          // Fallback to localStorage
          const localPoints = localStorage.getItem(`userPoints_${user.id}`);
          if (localPoints) {
            setUserPoints(parseInt(localPoints));
          }
        }
      }
    } catch (error) {
      console.log('Error fetching user points, using default');
      // Use default points if everything fails
    } finally {
      setLoading(false);
    }
  };

  // Update points in database and localStorage
  const updatePointsInStorage = async (newPoints: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update in database
        await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            points: newPoints,
            updated_at: new Date().toISOString()
          });

        // Update in localStorage as backup
        localStorage.setItem(`userPoints_${user.id}`, newPoints.toString());
      }
    } catch (error) {
      console.log('Error updating points in database, using localStorage only');
      // Fallback to localStorage only
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem(`userPoints_${user.id}`, newPoints.toString());
      }
    }
  };

  // Update points
  const updatePoints = (newPoints: number) => {
    setUserPoints(newPoints);
    updatePointsInStorage(newPoints);
  };

  // Deduct points
  const deductPoints = (amount: number) => {
    const newPoints = Math.max(0, userPoints - amount);
    setUserPoints(newPoints);
    updatePointsInStorage(newPoints);
  };

  // Add points
  const addPoints = (amount: number) => {
    const newPoints = userPoints + amount;
    setUserPoints(newPoints);
    updatePointsInStorage(newPoints);
  };

  // Refresh points from storage
  const refreshPoints = async () => {
    setLoading(true);
    await fetchUserPoints();
    setLoading(false);
  };

  // Initialize points on mount
  useEffect(() => {
    fetchUserPoints();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        fetchUserPoints();
      } else if (event === 'SIGNED_OUT') {
        setUserPoints(1247); // Reset to default
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: PointsContextType = {
    userPoints,
    updatePoints,
    deductPoints,
    addPoints,
    refreshPoints,
    loading
  };

  return (
    <PointsContext.Provider value={value}>
      {children}
    </PointsContext.Provider>
  );
}; 