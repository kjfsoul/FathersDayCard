import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Mail, Copy, Share2 } from 'lucide-react';

interface ShareCardProps {
  cardTitle?: string;
  dadName?: string;
}

export function ShareCard({ cardTitle = "Father's Day Card", dadName = "Dad" }: ShareCardProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const getShareUrl = () => {
    return window.location.href;
  };

  const getShareMessage = () => {
    return `Happy Father's Day! I created a special ${cardTitle} for ${dadName}. Check it out: ${getShareUrl()}`;
  };

  const handleSMSShare = async () => {
    setIsSharing(true);
    const message = getShareMessage();
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    
    try {
      // Try to open SMS app
      window.open(smsUrl, '_self');
      
      // Fallback for desktop or unsupported devices
      setTimeout(() => {
        if (!document.hidden) {
          handleCopyLink();
        }
      }, 1000);
    } catch (error) {
      handleCopyLink();
    }
    
    setIsSharing(false);
  };

  const handleEmailShare = async () => {
    setIsSharing(true);
    const subject = `Happy Father's Day from your child!`;
    const body = getShareMessage();
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      // Try to open email client
      window.open(emailUrl, '_self');
      
      // Fallback for desktop or unsupported devices
      setTimeout(() => {
        if (!document.hidden) {
          handleCopyLink();
        }
      }, 1000);
    } catch (error) {
      handleCopyLink();
    }
    
    setIsSharing(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      toast({
        title: "Link Copied!",
        description: "The link has been copied to your clipboard. You can now share it anywhere!",
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = getShareUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Link Copied!",
        description: "The link has been copied to your clipboard.",
      });
    }
  };

  const handleWebShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `Father's Day Card for ${dadName}`,
          text: `Happy Father's Day! I created a special card for ${dadName}.`,
          url: getShareUrl(),
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Share Your Card
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Send this special Father's Day card to make his day!
          </p>
        </div>

        <div className="space-y-3">
          {/* Native Web Share API (mobile devices) */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <Button
              onClick={handleWebShare}
              disabled={isSharing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}

          {/* SMS Share */}
          <Button
            onClick={handleSMSShare}
            disabled={isSharing}
            variant="outline"
            className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send via SMS
          </Button>

          {/* Email Share */}
          <Button
            onClick={handleEmailShare}
            disabled={isSharing}
            variant="outline"
            className="w-full border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Mail className="w-4 h-4 mr-2" />
            Send via Email
          </Button>

          {/* Copy Link */}
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
            SMS and email will open your device's default apps. 
            If they don't work, the link will be copied for you to share manually.
          </p>
        </div>
      </div>
    </div>
  );
}