import { useEffect, useState } from 'react';
import { DesktopStatus, subscribeToDesktopStatus } from '@/services/projectService';
import { useAuth } from '@/context/AuthContext';

export function useDesktopStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<DesktopStatus>({ online: false, lastSeen: 0 });

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToDesktopStatus(user.uid, setStatus);
    return unsub;
  }, [user]);

  return status;
}
