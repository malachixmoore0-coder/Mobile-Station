import { useEffect, useState } from 'react';
import { Short, subscribeToShorts } from '@/services/projectService';
import { useAuth } from '@/context/AuthContext';

export function useShorts() {
  const { user } = useAuth();
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setShorts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToShorts(
      user.uid,
      (data) => {
        setShorts(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [user]);

  return { shorts, loading, error };
}
