import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, VolumeX, Zap, Eye, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { soundManager } from '@/lib/sound';
import { haptics } from '@/lib/haptics';
import { tutorialManager } from '@/lib/tutorial';
import { cn } from '@/lib/utils';

interface SettingsState {
  audioEnabled: boolean;
  audioVolume: number;
  animationsEnabled: boolean;
  perfMode: boolean;
  colorBlindMode: boolean;
  hapticsEnabled: boolean;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartTutorial?: () => void;
}

export function SettingsPanel({ isOpen, onClose, onRestartTutorial }: SettingsPanelProps) {
  const [settings, setSettings] = useState<SettingsState>({
    audioEnabled: soundManager.isEnabled(),
    audioVolume: soundManager.getVolume(),
    animationsEnabled: true,
    perfMode: false,
    colorBlindMode: false,
    hapticsEnabled: haptics.isEnabled(),
  });

  useEffect(() => {
    // Load settings from localStorage
    try {
      const stored = localStorage.getItem('game.settings.v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }, []);

  const saveSettings = (newSettings: SettingsState) => {
    setSettings(newSettings);
    
    try {
      localStorage.setItem('game.settings.v1', JSON.stringify(newSettings));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }

    // Apply settings
    soundManager.setEnabled(newSettings.audioEnabled);
    soundManager.setVolume(newSettings.audioVolume);
    haptics.setEnabled(newSettings.hapticsEnabled);

    // Apply perf mode to document
    if (newSettings.perfMode) {
      document.documentElement.setAttribute('data-perf-mode', 'true');
    } else {
      document.documentElement.removeAttribute('data-perf-mode');
    }

    // Apply color-blind mode
    if (newSettings.colorBlindMode) {
      document.documentElement.setAttribute('data-colorblind-mode', 'true');
    } else {
      document.documentElement.removeAttribute('data-colorblind-mode');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9997]"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9998] w-full max-w-md bg-background/95 backdrop-blur-lg border-2 border-primary rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">⚙️ Réglages</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-destructive/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Settings */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            Audio
          </h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="audio-enabled" className="flex items-center gap-2">
              {settings.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Sons activés
            </Label>
            <Switch
              id="audio-enabled"
              checked={settings.audioEnabled}
              onCheckedChange={(checked) => {
                const newSettings = { ...settings, audioEnabled: checked };
                saveSettings(newSettings);
                if (checked) soundManager.play('uiClick');
              }}
            />
          </div>

          {settings.audioEnabled && (
            <div className="space-y-2">
              <Label htmlFor="audio-volume">Volume: {Math.round(settings.audioVolume * 100)}%</Label>
              <Slider
                id="audio-volume"
                value={[settings.audioVolume]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={([value]) => {
                  const newSettings = { ...settings, audioVolume: value };
                  saveSettings(newSettings);
                }}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Performance Settings */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Performance
          </h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="animations" className="text-sm">
              Animations
            </Label>
            <Switch
              id="animations"
              checked={settings.animationsEnabled}
              onCheckedChange={(checked) => {
                saveSettings({ ...settings, animationsEnabled: checked });
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="perf-mode" className="text-sm">Mode Performance</Label>
              <p className="text-xs text-muted-foreground">Réduit les effets visuels</p>
            </div>
            <Switch
              id="perf-mode"
              checked={settings.perfMode}
              onCheckedChange={(checked) => {
                saveSettings({ ...settings, perfMode: checked });
              }}
            />
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Accessibilité
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="colorblind" className="text-sm">Mode daltonien</Label>
              <p className="text-xs text-muted-foreground">Schéma de couleurs adapté</p>
            </div>
            <Switch
              id="colorblind"
              checked={settings.colorBlindMode}
              onCheckedChange={(checked) => {
                saveSettings({ ...settings, colorBlindMode: checked });
              }}
            />
          </div>
        </div>

        {/* Haptics Settings */}
        {haptics.isSupported() && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Vibrations
            </h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="haptics" className="text-sm">
                Retour haptique
              </Label>
              <Switch
                id="haptics"
                checked={settings.hapticsEnabled}
                onCheckedChange={(checked) => {
                  saveSettings({ ...settings, hapticsEnabled: checked });
                  if (checked) haptics.tap();
                }}
              />
            </div>
          </div>
        )}

        {/* Tutorial */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">📚 Tutoriel</h3>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              tutorialManager.reset();
              onRestartTutorial?.();
              onClose();
            }}
          >
            Revoir le guide
          </Button>
        </div>

        {/* Close button */}
        <div className="mt-6 pt-4 border-t border-border">
          <Button
            variant="default"
            className="w-full"
            onClick={onClose}
          >
            Fermer
          </Button>
        </div>
      </motion.div>
    </>
  );
}

export function useSettings() {
  const [settings, setSettings] = useState({
    animationsEnabled: true,
    perfMode: false,
    colorBlindMode: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('game.settings.v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }, []);

  return settings;
}
