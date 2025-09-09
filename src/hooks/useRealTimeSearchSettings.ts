import { useState, useEffect } from 'react';

interface RealTimeSearchSettings {
  realTimeSearchEnabled: boolean;
  setRealTimeSearchEnabled: (enabled: boolean) => void;
}

export const useRealTimeSearchSettings = (): RealTimeSearchSettings => {
  const [realTimeSearchEnabled, setRealTimeSearchEnabled] = useState<boolean>(() => {
    // Default to enabled, but check localStorage
    const stored = localStorage.getItem('realTimeSearchEnabled');
    return stored !== null ? JSON.parse(stored) : true;
  });

  useEffect(() => {
    localStorage.setItem('realTimeSearchEnabled', JSON.stringify(realTimeSearchEnabled));
  }, [realTimeSearchEnabled]);

  return {
    realTimeSearchEnabled,
    setRealTimeSearchEnabled
  };
};