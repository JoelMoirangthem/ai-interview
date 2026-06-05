import { useState, useEffect, useCallback } from 'react';
import { healthAPI } from '../services/api';

export function useAIStatus() {
  const [aiAvailable, setAiAvailable] = useState(true);
  const [checking, setChecking] = useState(true);

  const check = useCallback(async () => {
    try {
      const res = await healthAPI.checkAI();
      setAiAvailable(res.data.available);
    } catch {
      setAiAvailable(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  return { aiAvailable, checking, recheck: check };
}