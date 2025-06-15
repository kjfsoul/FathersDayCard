import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ThemeSelectorProps {
  onThemeSelect: (theme: string) => void;
}

export function ThemeSelector({ onThemeSelect }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>('');

  const themes = [
    {
      id: 'dark',
      name: 'Retro Arcade',
      description: 'Classic dark theme with neon highlights',
      preview: 'bg-gradient-to-br from-slate-900 to-slate-800',
      accent: 'border-cyan-400',
      colors: ['bg-slate-900', 'bg-slate-700', 'bg-cyan-400']
    },
    {
      id: 'theme-warm',
      name: 'Cozy Evening',
      description: 'Warm browns and oranges for comfort',
      preview: 'bg-gradient-to-br from-amber-900 to-orange-900',
      accent: 'border-orange-400',
      colors: ['bg-amber-900', 'bg-orange-800', 'bg-orange-400']
    },
    {
      id: 'theme-ocean',
      name: 'Deep Ocean',
      description: 'Cool blues and teals for relaxation',
      preview: 'bg-gradient-to-br from-blue-900 to-cyan-900',
      accent: 'border-cyan-400',
      colors: ['bg-blue-900', 'bg-cyan-800', 'bg-cyan-400']
    },
    {
      id: 'theme-forest',
      name: 'Forest Night',
      description: 'Rich greens for nature lovers',
      preview: 'bg-gradient-to-br from-green-900 to-emerald-900',
      accent: 'border-green-400',
      colors: ['bg-green-900', 'bg-emerald-800', 'bg-green-400']
    },
    {
      id: 'theme-light',
      name: 'Clean Light',
      description: 'Bright and clean for daytime use',
      preview: 'bg-gradient-to-br from-gray-100 to-white',
      accent: 'border-blue-400',
      colors: ['bg-white', 'bg-gray-200', 'bg-blue-500']
    }
  ];

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const handleConfirm = () => {
    if (selectedTheme) {
      onThemeSelect(selectedTheme);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        className="max-w-2xl w-full bg-card border border-border rounded-2xl p-8 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Choose Your Theme
          </h2>
          <p className="text-muted-foreground">
            Select a visual style that's comfortable for your eyes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {themes.map((theme) => (
            <motion.div
              key={theme.id}
              className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                selectedTheme === theme.id 
                  ? `${theme.accent} bg-accent/20` 
                  : 'border-border hover:border-muted-foreground'
              }`}
              onClick={() => handleThemeSelect(theme.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Theme Preview */}
              <div className={`${theme.preview} h-20 rounded-lg mb-3 relative overflow-hidden`}>
                <div className="absolute inset-0 flex space-x-1 p-2">
                  {theme.colors.map((color, i) => (
                    <div key={i} className={`${color} flex-1 rounded opacity-80`} />
                  ))}
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-1">
                {theme.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {theme.description}
              </p>

              {selectedTheme === theme.id && (
                <motion.div
                  className="absolute top-2 right-2 text-primary text-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.3 }}
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={handleConfirm}
            disabled={!selectedTheme}
            size="lg"
            className="px-8"
          >
            Continue with {themes.find(t => t.id === selectedTheme)?.name || 'Theme'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}