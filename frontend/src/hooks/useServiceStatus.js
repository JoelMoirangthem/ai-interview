import { useState, useEffect, useCallback } from 'react';
import { healthAPI } from '../services/api';

export function useServiceStatus() {
  const [backendUp, setBackendUp] = useState(true);
  const [aiUp, setAiUp] = useState(true);
  const [checking, setChecking] = useState(true);

  const check = useCallback(async () => {
    try {
      await healthAPI.check();
      setBackendUp(true);
    } catch {
      setBackendUp(false);
      setChecking(false);
      return;
    }

    try {
      const res = await healthAPI.checkAI();
      setAiUp(res.data?.available ?? false);
    } catch {
      setAiUp(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  return { backendUp, aiUp, checking, recheck: check };
}
