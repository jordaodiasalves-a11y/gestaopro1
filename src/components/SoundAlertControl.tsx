import { useSoundAlert } from '@/contexts/SoundAlertContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX, Clock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function SoundAlertControl() {
  const { alertMode, setAlertMode } = useSoundAlert();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Alertas Sonoros
        </CardTitle>
      </CardHeader>
      <CardContent>
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
              A cada 20 minutos
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
