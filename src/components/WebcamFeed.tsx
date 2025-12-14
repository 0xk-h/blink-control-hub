import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

interface WebcamFeedProps {
  isActive: boolean;
  onVideoReady?: (video: HTMLVideoElement) => void;
  className?: string;
}

export interface WebcamFeedRef {
  getVideo: () => HTMLVideoElement | null;
  getCanvas: () => HTMLCanvasElement | null;
}

const WebcamFeed = forwardRef<WebcamFeedRef, WebcamFeedProps>(
  ({ isActive, onVideoReady, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useImperativeHandle(ref, () => ({
      getVideo: () => videoRef.current,
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: "user",
            },
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current && onVideoReady) {
                onVideoReady(videoRef.current);
              }
            };
          }
        } catch (error) {
          console.error("Error accessing camera:", error);
        }
      };

      const stopCamera = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      if (isActive) {
        startCamera();
      } else {
        stopCamera();
      }

      return () => {
        stopCamera();
      };
    }, [isActive, onVideoReady]);

    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border-2 border-primary/30 bg-card",
          isActive && "glow-primary",
          className
        )}
      >
        {/* Scan line effect */}
        {isActive && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scan-line" />
          </div>
        )}

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary z-20" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary z-20" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary z-20" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary z-20" />

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "w-full h-full object-cover transform -scale-x-100",
            !isActive && "hidden"
          )}
        />
        
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"
        />

        {!isActive && (
          <div className="flex items-center justify-center h-full min-h-[300px] text-muted-foreground">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm">Camera Inactive</p>
              <p className="text-xs text-muted-foreground/70">Click "Start Camera" to begin</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

WebcamFeed.displayName = "WebcamFeed";

export default WebcamFeed;