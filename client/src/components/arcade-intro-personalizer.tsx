import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Gamepad2, Sparkles } from 'lucide-react';

interface ArcadeIntroPersonalizerProps {
  onComplete: (introData: ArcadeIntroData) => void;
}

export interface ArcadeIntroData {
  introStyle: 'classic' | 'neon' | 'retro' | 'space' | 'custom';
  welcomeMessage: string;
  dadNickname: string;
  favoriteColor: string;
  uploadedImage?: string;
  backgroundMusic: 'arcade' | 'electronic' | 'jazz' | 'rock' | 'none';
}

export function ArcadeIntroPersonalizer({ onComplete }: ArcadeIntroPersonalizerProps) {
  const [introData, setIntroData] = useState<ArcadeIntroData>({
    introStyle: 'classic',
    welcomeMessage: 'Welcome to your arcade, champion!',
    dadNickname: 'Player One',
    favoriteColor: '#FF6B35',
    backgroundMusic: 'arcade'
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setIntroData(prev => ({ ...prev, uploadedImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCustomIntro = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-arcade-intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(introData),
      });

      if (response.ok) {
        const customIntro = await response.json();
        setIntroData(prev => ({ ...prev, ...customIntro }));
      }
    } catch (error) {
      console.log('Using default intro configuration');
    }
    
    setIsGenerating(false);
  };

  const handleComplete = () => {
    onComplete(introData);
  };

  const introStyles = [
    { value: 'classic', label: 'Classic Arcade', emoji: '👾', description: 'Retro pixel art vibes' },
    { value: 'neon', label: 'Neon Nights', emoji: '🌃', description: 'Cyberpunk aesthetic' },
    { value: 'retro', label: 'Retro Wave', emoji: '🌴', description: '80s nostalgia' },
    { value: 'space', label: 'Space Adventure', emoji: '🚀', description: 'Cosmic exploration' },
    { value: 'custom', label: 'Custom Style', emoji: '🎨', description: 'Your personal touch' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            🎮
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">Customize Your Arcade Intro</h2>
          <p className="text-white/80">Make this arcade experience uniquely yours!</p>
        </div>

        <div className="space-y-6">
          {/* Intro Style Selection */}
          <div>
            <Label className="text-white text-lg font-semibold mb-4 block">Choose Your Style</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {introStyles.map((style) => (
                <motion.button
                  key={style.value}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    introData.introStyle === style.value
                      ? 'border-yellow-400 bg-yellow-400/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => setIntroData(prev => ({ ...prev, introStyle: style.value as any }))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-2xl mb-2">{style.emoji}</div>
                  <div className="text-white font-semibold">{style.label}</div>
                  <div className="text-white/60 text-sm">{style.description}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Welcome Message */}
          <div>
            <Label htmlFor="welcomeMessage" className="text-white text-lg font-semibold">
              Welcome Message
            </Label>
            <Input
              id="welcomeMessage"
              value={introData.welcomeMessage}
              onChange={(e) => setIntroData(prev => ({ ...prev, welcomeMessage: e.target.value }))}
              placeholder="Enter a custom welcome message..."
              className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          {/* Dad Nickname */}
          <div>
            <Label htmlFor="dadNickname" className="text-white text-lg font-semibold">
              Dad's Gamer Tag
            </Label>
            <Input
              id="dadNickname"
              value={introData.dadNickname}
              onChange={(e) => setIntroData(prev => ({ ...prev, dadNickname: e.target.value }))}
              placeholder="Enter dad's gaming nickname..."
              className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          {/* Favorite Color */}
          <div>
            <Label htmlFor="favoriteColor" className="text-white text-lg font-semibold">
              Theme Color
            </Label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="color"
                id="favoriteColor"
                value={introData.favoriteColor}
                onChange={(e) => setIntroData(prev => ({ ...prev, favoriteColor: e.target.value }))}
                className="w-12 h-12 rounded-lg border-2 border-white/20 bg-transparent cursor-pointer"
              />
              <Input
                value={introData.favoriteColor}
                onChange={(e) => setIntroData(prev => ({ ...prev, favoriteColor: e.target.value }))}
                className="bg-white/10 border-white/20 text-white flex-1"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-white text-lg font-semibold mb-2 block">
              Custom Background Image (Optional)
            </Label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center">
              {imagePreview ? (
                <div>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-w-full h-32 object-cover rounded-lg mx-auto mb-3"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImagePreview(null);
                      setIntroData(prev => ({ ...prev, uploadedImage: undefined }));
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-white/50 mx-auto mb-3" />
                  <p className="text-white/70 mb-3">Upload a custom background image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('imageUpload')?.click()}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Choose Image
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Background Music */}
          <div>
            <Label className="text-white text-lg font-semibold mb-2 block">Background Music</Label>
            <Select value={introData.backgroundMusic} onValueChange={(value) => 
              setIntroData(prev => ({ ...prev, backgroundMusic: value as any }))
            }>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arcade">🎵 Classic Arcade</SelectItem>
                <SelectItem value="electronic">🎶 Electronic Beats</SelectItem>
                <SelectItem value="jazz">🎷 Smooth Jazz</SelectItem>
                <SelectItem value="rock">🎸 Rock Anthem</SelectItem>
                <SelectItem value="none">🔇 No Music</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            {introData.introStyle === 'custom' && (
              <Button
                onClick={generateCustomIntro}
                disabled={isGenerating}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Custom Style
                  </>
                )}
              </Button>
            )}
            
            <Button
              onClick={handleComplete}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Start Your Arcade!
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}