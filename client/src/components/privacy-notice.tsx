import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Database, Share2, Lock } from 'lucide-react';

export function PrivacyNotice() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs opacity-70 hover:opacity-100">
          <Shield className="w-3 h-3 mr-1" />
          Privacy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Notice
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Database className="w-4 h-4" />
              What We Collect
            </h3>
            <ul className="space-y-1 text-xs opacity-80">
              <li>• Email address for account creation</li>
              <li>• Father's Day questionnaire responses</li>
              <li>• Game scores and session data</li>
              <li>• Payment information (processed by Stripe)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4" />
              How We Use Your Data
            </h3>
            <ul className="space-y-1 text-xs opacity-80">
              <li>• Generate personalized Father's Day cards</li>
              <li>• Track game progress and high scores</li>
              <li>• Process one-time premium access payments</li>
              <li>• Improve app functionality and user experience</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Sharing Features
            </h3>
            <ul className="space-y-1 text-xs opacity-80">
              <li>• SMS/Email sharing opens your device's apps</li>
              <li>• No personal data is sent through sharing</li>
              <li>• Only the app link is shared</li>
              <li>• Clipboard access used for copy link feature</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Data Protection
            </h3>
            <ul className="space-y-1 text-xs opacity-80">
              <li>• All data stored securely with Supabase</li>
              <li>• No data sold to third parties</li>
              <li>• Payment processing secured by Stripe</li>
              <li>• Card generation uses OpenAI API</li>
            </ul>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-xs opacity-80">
              This app is designed for Father's Day celebration. Your data helps create personalized experiences and is handled with care according to privacy best practices.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}