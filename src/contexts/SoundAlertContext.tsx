import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AlertMode = 'disabled' | 'on-order' | 'interval';

interface SoundAlertContextType {
  alertMode: AlertMode;
  setAlertMode: (mode: AlertMode) => void;
  playAlert: () => void;
}

const SoundAlertContext = createContext<SoundAlertContextType | undefined>(undefined);

export function SoundAlertProvider({ children }: { children: ReactNode }) {
  const [alertMode, setAlertModeState] = useState<AlertMode>('disabled');
  const [audio] = useState(() => {
    const a = new Audio();
    // Som de alerta simples usando Web Audio API
    a.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eefTRAMUKfj8LZjHAY4ktfyy3ksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Ik2CBlou+3nn00QDFC...';
    return a;
  });

  useEffect(() => {
    const stored = localStorage.getItem('alert_mode');
    if (stored) {
      setAlertModeState(stored as AlertMode);
    }
  }, []);

  useEffect(() => {
    if (alertMode === 'interval') {
      const interval = setInterval(() => {
        playAlert();
      }, 20 * 60 * 1000); // 20 minutos

      return () => clearInterval(interval);
    }
  }, [alertMode]);

  const setAlertMode = (mode: AlertMode) => {
    setAlertModeState(mode);
    localStorage.setItem('alert_mode', mode);
  };

  const playAlert = () => {
    if (alertMode !== 'disabled') {
      // Usar um beep simples do navegador
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  return (
    <SoundAlertContext.Provider value={{ alertMode, setAlertMode, playAlert }}>
      {children}
    </SoundAlertContext.Provider>
  );
}

export function useSoundAlert() {
  const context = useContext(SoundAlertContext);
  if (context === undefined) {
    throw new Error('useSoundAlert must be used within a SoundAlertProvider');
  }
  return context;
}
