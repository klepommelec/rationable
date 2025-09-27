import { useState, useEffect } from 'react';

interface RealTimeSearchSettings {
  realTimeSearchEnabled: boolean;
  setRealTimeSearchEnabled: (enabled: boolean) => void;
}

export const useRealTimeSearchSettings = (): RealTimeSearchSettings => {
  const [realTimeSearchEnabled, setRealTimeSearchEnabled] = useState<boolean>(() => {
    // Lire depuis localStorage ou default à false (mode manuel)
    const saved = localStorage.getItem('realTimeSearchEnabled');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('realTimeSearchEnabled', JSON.stringify(realTimeSearchEnabled));
  }, [realTimeSearchEnabled]);

  return {
    realTimeSearchEnabled,
    setRealTimeSearchEnabled
  };
};