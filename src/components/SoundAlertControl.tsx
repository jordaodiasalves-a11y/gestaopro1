import { useState, useEffect } from 'react';
import { useSoundAlert } from '@/contexts/SoundAlertContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Volume2, VolumeX, Clock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SoundAlertAudioManager } from './SoundAlertAudioManager';

export function SoundAlertControl() {
  const { alertMode, setAlertMode, intervalMinutes, setIntervalMinutes } = useSoundAlert();
  const [audioSource, setAudioSource] = useState<'server' | 'local'>(() => (localStorage.getItem('audio_source') as 'server' | 'local') || 'server');

  useEffect(() => {
    localStorage.setItem('audio_source', audioSource);
  }, [audioSource]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Alertas Sonoros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fonte de áudio */}
          <div className="space-y-2">
            <Label>Fonte do áudio</Label>
            <RadioGroup value={audioSource} onValueChange={(v) => setAudioSource(v as 'server' | 'local')} className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="server" id="audio-server" />
                <Label htmlFor="audio-server" className="cursor-pointer">Servidor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="local" id="audio-local" />
                <Label htmlFor="audio-local" className="cursor-pointer">Local</Label>
              </div>
            </RadioGroup>
          </div>

          <RadioGroup value={alertMode} onValueChange={(value) => setAlertMode(value as any)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="disabled" id="disabled" />
              <Label htmlFor="disabled" className="flex items-center gap-2 cursor-pointer">
                <VolumeX className="w-4 h-4" />
                Desativado
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="on-order" id="on-order" />
              <Label htmlFor="on-order" className="flex items-center gap-2 cursor-pointer">
                <Volume2 className="w-4 h-4" />
                Ao chegar pedido
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="interval" id="interval" />
              <Label htmlFor="interval" className="flex items-center gap-2 cursor-pointer">
                <Clock className="w-4 h-4" />
                A cada intervalo
              </Label>
            </div>
          </RadioGroup>

          {alertMode === 'interval' && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="interval-minutes">Intervalo (minutos)</Label>
              <Input
                id="interval-minutes"
                type="number"
                min="1"
                max="60"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 1)}
                className="w-32"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <SoundAlertAudioManager />
    </div>
  );
}