import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Mail, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "@/hooks/use-toast";

interface EmergencyAlertProps {
  isActive: boolean;
  onDismiss: () => void;
  className?: string;
}

const EmergencyAlert = ({ isActive, onDismiss, className }: EmergencyAlertProps) => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    // Create mailto link for emergency alert
    const subject = encodeURIComponent("EMERGENCY ALERT - Eye Blink Control System");
    const body = encodeURIComponent(
      `EMERGENCY ALERT!\n\nAn emergency alert has been triggered from the Eye Blink-Based Appliance Control System.\n\nTime: ${new Date().toLocaleString()}\n\nPlease respond immediately.`
    );
    
    // Open email client
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "Email Client Opened",
        description: "Please send the emergency email from your email client",
      });
    }, 1000);
  };

  if (!isActive) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="relative w-full max-w-md mx-4 p-8 rounded-2xl border-2 border-destructive bg-card animate-emergency-pulse">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-destructive/20 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Alert icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>

        {/* Title */}
        <h2 className="font-display text-2xl font-bold text-center text-destructive mb-2">
          EMERGENCY ALERT
        </h2>
        <p className="text-center text-muted-foreground mb-6">
          5 blinks detected. Send an emergency notification?
        </p>

        {/* Email input */}
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter emergency contact email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-secondary border-destructive/30 focus:border-destructive"
            />
          </div>

          <Button
            onClick={handleSendEmail}
            disabled={isSending}
            variant="danger"
            className="w-full"
            size="lg"
          >
            {isSending ? (
              "Opening Email Client..."
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Emergency Alert
              </>
            )}
          </Button>

          <Button
            onClick={onDismiss}
            variant="outline"
            className="w-full"
          >
            Dismiss Alert
          </Button>
        </div>

        {/* Pulsing background effect */}
        <div className="absolute inset-0 -z-10 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-destructive/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlert;