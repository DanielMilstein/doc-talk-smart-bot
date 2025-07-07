import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Bug, Eye, EyeOff, Brain, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DebugSettings {
  showConfidence: boolean;
  showMemoryContext: boolean;
  showProcessingTime: boolean;
  showQueryAnalysis: boolean;
}

interface DebugPanelProps {
  settings: DebugSettings;
  onSettingsChange: (settings: DebugSettings) => void;
  className?: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ settings, onSettingsChange, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('debugSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        onSettingsChange(parsed);
      } catch (e) {
        console.error('Failed to parse debug settings:', e);
      }
    }
  }, [onSettingsChange]);

  // Save settings to localStorage when they change
  const handleSettingChange = (key: keyof DebugSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
    localStorage.setItem('debugSettings', JSON.stringify(newSettings));
  };

  const activeCount = Object.values(settings).filter(Boolean).length;

  return (
    <Card className={cn('fixed bottom-4 right-4 w-80 shadow-lg z-50', className)}>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debug Tools
            {activeCount > 0 && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                {activeCount} activo{activeCount !== 1 ? 's' : ''}
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-4 pt-0 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="confidence" className="text-sm font-normal">
                  Mostrar confianza
                </Label>
              </div>
              <Switch
                id="confidence"
                checked={settings.showConfidence}
                onCheckedChange={(checked) => handleSettingChange('showConfidence', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.showMemoryContext ? (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="memory" className="text-sm font-normal">
                  Contexto de memoria
                </Label>
              </div>
              <Switch
                id="memory"
                checked={settings.showMemoryContext}
                onCheckedChange={(checked) => handleSettingChange('showMemoryContext', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="processing" className="text-sm font-normal">
                  Tiempo de procesamiento
                </Label>
              </div>
              <Switch
                id="processing"
                checked={settings.showProcessingTime}
                onCheckedChange={(checked) => handleSettingChange('showProcessingTime', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="analysis" className="text-sm font-normal">
                  Análisis de consulta
                </Label>
              </div>
              <Switch
                id="analysis"
                checked={settings.showQueryAnalysis}
                onCheckedChange={(checked) => handleSettingChange('showQueryAnalysis', checked)}
              />
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Las opciones de debug muestran información adicional sobre las respuestas del sistema RAG.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DebugPanel;