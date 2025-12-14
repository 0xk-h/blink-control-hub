import { useCallback, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

// Eye landmark indices for MediaPipe Face Landmarker
// Left eye landmarks
const LEFT_EYE_TOP = 159;
const LEFT_EYE_BOTTOM = 145;
const LEFT_EYE_LEFT = 33;
const LEFT_EYE_RIGHT = 133;

// Right eye landmarks
const RIGHT_EYE_TOP = 386;
const RIGHT_EYE_BOTTOM = 374;
const RIGHT_EYE_LEFT = 362;
const RIGHT_EYE_RIGHT = 263;

interface UseBlinkDetectionOptions {
  onBlink?: () => void;
  earThreshold?: number;
  consecutiveFrames?: number;
}

interface UseBlinkDetectionReturn {
  initializeDetector: () => Promise<void>;
  startDetection: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => void;
  stopDetection: () => void;
  isInitialized: boolean;
  isRunning: boolean;
  error: string | null;
}

const calculateEAR = (
  landmarks: Array<{ x: number; y: number; z: number }>,
  topIdx: number,
  bottomIdx: number,
  leftIdx: number,
  rightIdx: number
): number => {
  const top = landmarks[topIdx];
  const bottom = landmarks[bottomIdx];
  const left = landmarks[leftIdx];
  const right = landmarks[rightIdx];

  const verticalDist = Math.sqrt(
    Math.pow(top.x - bottom.x, 2) + Math.pow(top.y - bottom.y, 2)
  );
  const horizontalDist = Math.sqrt(
    Math.pow(left.x - right.x, 2) + Math.pow(left.y - right.y, 2)
  );

  return verticalDist / (horizontalDist + 0.0001);
};

export const useBlinkDetection = ({
  onBlink,
  earThreshold = 0.2,
  consecutiveFrames = 2,
}: UseBlinkDetectionOptions = {}): UseBlinkDetectionReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const blinkCounterRef = useRef(0);
  const wasBlinkingRef = useRef(false);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);

  const initializeDetector = useCallback(async () => {
    try {
      setError(null);
      
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
        filesetResolver,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        }
      );

      setIsInitialized(true);
    } catch (err) {
      console.error("Failed to initialize face detector:", err);
      setError("Failed to initialize face detector. Please try again.");
      setIsInitialized(false);
    }
  }, []);

  const startDetection = useCallback(
    (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
      if (!faceLandmarkerRef.current || !video || !canvas) {
        console.error("Face landmarker not initialized or elements missing");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      drawingUtilsRef.current = new DrawingUtils(ctx);
      setIsRunning(true);

      let lastVideoTime = -1;

      const detectFrame = () => {
        if (!faceLandmarkerRef.current || !video.videoWidth) {
          animationFrameRef.current = requestAnimationFrame(detectFrame);
          return;
        }

        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;

          const results = faceLandmarkerRef.current.detectForVideo(
            video,
            performance.now()
          );

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];

            // Draw face mesh
            if (drawingUtilsRef.current) {
              drawingUtilsRef.current.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_TESSELATION,
                { color: "#22d3ee20", lineWidth: 0.5 }
              );
              drawingUtilsRef.current.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                { color: "#22d3ee", lineWidth: 2 }
              );
              drawingUtilsRef.current.drawConnectors(
                landmarks,
                FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                { color: "#22d3ee", lineWidth: 2 }
              );
            }

            // Calculate EAR for both eyes
            const leftEAR = calculateEAR(
              landmarks,
              LEFT_EYE_TOP,
              LEFT_EYE_BOTTOM,
              LEFT_EYE_LEFT,
              LEFT_EYE_RIGHT
            );
            const rightEAR = calculateEAR(
              landmarks,
              RIGHT_EYE_TOP,
              RIGHT_EYE_BOTTOM,
              RIGHT_EYE_LEFT,
              RIGHT_EYE_RIGHT
            );

            const avgEAR = (leftEAR + rightEAR) / 2;

            // Detect blink
            if (avgEAR < earThreshold) {
              blinkCounterRef.current++;
            } else {
              if (blinkCounterRef.current >= consecutiveFrames) {
                if (!wasBlinkingRef.current) {
                  wasBlinkingRef.current = true;
                  onBlink?.();
                }
              } else {
                wasBlinkingRef.current = false;
              }
              blinkCounterRef.current = 0;
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(detectFrame);
      };

      detectFrame();
    },
    [earThreshold, consecutiveFrames, onBlink]
  );

  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsRunning(false);
    blinkCounterRef.current = 0;
    wasBlinkingRef.current = false;
  }, []);

  return {
    initializeDetector,
    startDetection,
    stopDetection,
    isInitialized,
    isRunning,
    error,
  };
};