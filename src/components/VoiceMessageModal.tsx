import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, X, Loader2 } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceMessageModalProps {
  isActive: boolean;
  onDismiss: () => void;
  userEmail?: string;
}

const VoiceMessageModal = ({ isActive, onDismiss, userEmail }: VoiceMessageModalProps) => {
  const [isSending, setIsSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  
  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText();

  // Auto-start listening when modal opens
  useEffect(() => {
    if (isActive && !isListening && !messageSent) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isActive, isListening, messageSent, startListening]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isActive) {
      resetTranscript();
      setMessageSent(false);
      stopListening();
    }
  }, [isActive, resetTranscript, stopListening]);

  const handleSendMessage = useCallback(async () => {
    if (!transcript.trim() || !userEmail) {
      toast({
        title: "Cannot Send Message",
        description: !transcript.trim() ? "No message recorded" : "No email address available",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const { error } = await supabase.functions.invoke("send-voice-message", {
        body: {
          to_email: userEmail,
          message: transcript.trim(),
          time: new Date().toLocaleString(),
        },
      });

      if (error) throw error;

      setMessageSent(true);
      toast({
        title: "Voice Message Sent!",
        description: "Your message has been emailed successfully.",
      });

      // Auto-close after success
      setTimeout(() => {
        onDismiss();
      }, 2000);
    } catch (err: any) {
      console.error("Error sending voice message:", err);
      toast({
        title: "Failed to Send",
        description: err.message || "Could not send voice message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }, [transcript, userEmail, onDismiss]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClose = () => {
    stopListening();
    onDismiss();
  };

  return (
    <Dialog open={isActive} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md border-primary/30 bg-card/95 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mic className="w-6 h-6 text-primary" />
            Voice Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Indicator */}
          <div className="flex items-center justify-center py-4">
            <button
              onClick={handleToggleListening}
              disabled={isSending || messageSent}
              className={cn(
                "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300",
                isListening
                  ? "bg-primary/20 animate-pulse"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              {isListening ? (
                <>
                  <Mic className="w-10 h-10 text-primary" />
                  <span className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-30" />
                </>
              ) : (
                <MicOff className="w-10 h-10 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Status Text */}
          <p className="text-center text-sm text-muted-foreground">
            {isListening ? (
              <span className="text-primary font-medium">Listening... Speak now</span>
            ) : messageSent ? (
              <span className="text-success font-medium">Message sent!</span>
            ) : (
              "Click the microphone to start recording"
            )}
          </p>

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}

          {/* Transcript Display */}
          <div className="min-h-[100px] max-h-[200px] overflow-y-auto p-4 rounded-lg bg-secondary/50 border border-border">
            {transcript ? (
              <p className="text-foreground leading-relaxed">{transcript}</p>
            ) : (
              <p className="text-muted-foreground text-center italic">
                Your speech will appear here...
              </p>
            )}
          </div>

          {/* Email Info */}
          {userEmail && (
            <p className="text-xs text-muted-foreground text-center">
              Message will be sent to: <span className="text-primary">{userEmail}</span>
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSending}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!transcript.trim() || isSending || messageSent}
              className="flex-1 gradient-primary"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : messageSent ? (
                <>Sent!</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceMessageModal;
