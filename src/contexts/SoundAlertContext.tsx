import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { externalServer } from '@/api/externalServer';

type AlertMode = 'disabled' | 'on-order' | 'interval';
type AlertType = 'new-order' | 'order-completed' | 'low-stock';

interface SoundAlertContextType {
  alertMode: AlertMode;
  setAlertMode: (mode: AlertMode) => void;
  playAlert: (type?: AlertType) => void;
  playManualAudio: (audioName: string) => void;
  intervalMinutes: number;
  setIntervalMinutes: (minutes: number) => void;
}

const SoundAlertContext = createContext<SoundAlertContextType | undefined>(undefined);

export function SoundAlertProvider({ children }: { children: ReactNode }) {
  const [alertMode, setAlertModeState] = useState<AlertMode>('disabled');
  const [intervalMinutes, setIntervalMinutesState] = useState<number>(20);

  useEffect(() => {
    const stored = localStorage.getItem('alert_mode');
    const storedInterval = localStorage.getItem('alert_interval_minutes');
    if (stored) {
      setAlertModeState(stored as AlertMode);
    }
    if (storedInterval) {
      setIntervalMinutesState(parseInt(storedInterval));
    }
  }, []);

  useEffect(() => {
    if (alertMode === 'interval') {
      const interval = setInterval(() => {
        playAlert();
      }, intervalMinutes * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [alertMode, intervalMinutes]);

  const setAlertMode = (mode: AlertMode) => {
    setAlertModeState(mode);
    localStorage.setItem('alert_mode', mode);
  };

  const setIntervalMinutes = (minutes: number) => {
    setIntervalMinutesState(minutes);
    localStorage.setItem('alert_interval_minutes', minutes.toString());
  };

  const playAlert = async (type: AlertType = 'new-order') => {
    if (alertMode === 'disabled') return;

    // Preferência de fonte de áudio
    const audioSourcePref = (localStorage.getItem('audio_source') || 'server') as 'server' | 'local';

    // 1) PRIORIDADE: Áudio do servidor externo por tipo (se preferido)
    const audioMap: Record<AlertType, string> = {
      'new-order': 'novo_pedido.mp3',
      'order-completed': 'pedido_concluido.mp3',
      'low-stock': 'estoque_baixo.mp3'
    };

    if (audioSourcePref === 'server') {
      try {
        const audioUrl = await externalServer.getAudio(audioMap[type]);
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.src = audioUrl;
        audio.load();
        audio.play().catch(() => {
          console.warn('Erro ao tocar áudio do servidor, tentando alternativas');
          playLocalOrBeep(type);
        });
        return;
      } catch (e) {
        console.warn('Servidor externo indisponível, usando áudio local:', e);
        // continua para tentar local abaixo
      }
    }

    // 2) Caso preferido seja local OU falhou servidor
    playLocalOrBeep(type);
  };

  const playLocalOrBeep = (type: AlertType) => {
    // 2) Tenta áudio customizado local por tipo
    const customAudioKey = `notification_audio_${type}`;
    const customAudio = localStorage.getItem(customAudioKey);
    if (customAudio) {
      try {
        const audio = new Audio(customAudio);
        audio.play().catch(() => playBeep());
        return;
      } catch (e) {
        console.error('Erro ao tocar áudio customizado:', e);
      }
    }

    // 3) Preferência de áudio manual selecionado
    const preferred = localStorage.getItem('preferred_alert_manual_audio');
    if (preferred) {
      const manual = localStorage.getItem(`manual_audio_${preferred}`);
      if (manual) {
        try {
          const audio = new Audio(manual);
          audio.play().catch(() => playBeep());
          return;
        } catch (e) {
          console.error('Erro ao tocar áudio manual preferido:', e);
        }
      }
    }

    // 4) Fallback: beep simples
    playBeep();
  };

  const playManualAudio = (audioName: string) => {
    const customAudio = localStorage.getItem(`manual_audio_${audioName}`);
    
    if (customAudio) {
      try {
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.src = customAudio;
        audio.load();
        audio.play().catch((e) => {
          console.error('Erro ao tocar áudio manual:', e);
        });
      } catch (e) {
        console.error('Erro ao tocar áudio manual:', e);
      }
    } else {
      playBeep();
    }
  };

  const playBeep = () => {
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
  };

  return (
    <SoundAlertContext.Provider value={{ alertMode, setAlertMode, playAlert, playManualAudio, intervalMinutes, setIntervalMinutes }}>
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
