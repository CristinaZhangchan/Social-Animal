"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "./ThemeProvider";

interface UserCameraFeedProps {
  isUserSpeaking: boolean;
  isMicEnabled?: boolean;
  onToggleMic?: () => void;
}

// Icon components
function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  );
}

function MicOffIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M9.172 9.172a4 4 0 105.656 5.656M15 10V5a3 3 0 00-6 0v1m0 0L3 3m18 18l-3-3"
      />
    </svg>
  );
}

function VideoIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function VideoOffIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zM3 3l18 18"
      />
    </svg>
  );
}

export function UserCameraFeed({
  isUserSpeaking,
  isMicEnabled = true,
  onToggleMic,
}: UserCameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const { theme } = useTheme();

  // Initialize camera
  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: "user",
          },
          audio: false, // Audio is handled separately by LiveKit
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setHasPermission(true);
      } catch (err) {
        console.error("Camera access error:", err);
        setHasPermission(false);
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            setError("Camera access denied");
          } else if (err.name === "NotFoundError") {
            setError("No camera found");
          } else {
            setError("Camera unavailable");
          }
        }
      }
    }

    initCamera();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Re-attach stream to video element when theme changes (video element might be recreated)
  useEffect(() => {
    if (videoRef.current && streamRef.current && hasPermission) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [theme, hasPermission]);

  // Toggle camera on/off
  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  }, []);

  // Don't render if permission denied or error
  if (hasPermission === false) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div
          className={`w-[180px] h-[135px] md:w-[240px] md:h-[180px] flex items-center justify-center ${
            theme === "dark"
              ? "bg-sa-bg-secondary border border-sa-text-muted/30 clip-chamfer"
              : "glass-card-sm"
          }`}
        >
          <div className="text-center p-4">
            <div
              className={`text-xs ${
                theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
              }`}
            >
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Control buttons component
  const ControlButtons = () => (
    <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
      {onToggleMic && (
        <button
          onClick={onToggleMic}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isMicEnabled
              ? theme === "dark"
                ? "bg-sa-bg-tertiary/80 text-sa-text-secondary hover:text-white"
                : "bg-white/80 text-light-secondary hover:text-light-primary"
              : "bg-red-500/80 text-white hover:bg-red-500"
          }`}
          title={isMicEnabled ? "Mute microphone" : "Unmute microphone"}
        >
          {isMicEnabled ? (
            <MicIcon className="w-3.5 h-3.5" />
          ) : (
            <MicOffIcon className="w-3.5 h-3.5" />
          )}
        </button>
      )}
      <button
        onClick={toggleCamera}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          cameraEnabled
            ? theme === "dark"
              ? "bg-sa-bg-tertiary/80 text-sa-text-secondary hover:text-white"
              : "bg-white/80 text-light-secondary hover:text-light-primary"
            : "bg-red-500/80 text-white hover:bg-red-500"
        }`}
        title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
      >
        {cameraEnabled ? (
          <VideoIcon className="w-3.5 h-3.5" />
        ) : (
          <VideoOffIcon className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );

  // Status indicator component
  const StatusIndicator = () => (
    <div
      className={`absolute bottom-2 left-2 flex items-center gap-1.5 ${
        theme === "light"
          ? "bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full"
          : ""
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isUserSpeaking
            ? theme === "dark"
              ? "bg-sa-accent-cyan animate-pulse"
              : "bg-light-accent animate-pulse"
            : theme === "dark"
            ? "bg-sa-text-muted"
            : "bg-gray-400"
        }`}
      />
      <span
        className={`text-[10px] uppercase tracking-wider ${
          theme === "dark"
            ? "text-sa-text-secondary"
            : "text-light-text-primary font-medium"
        }`}
      >
        {isUserSpeaking ? "Speaking" : "You"}
      </span>
    </div>
  );

  // Camera off placeholder
  const CameraOffPlaceholder = () => (
    <div
      className={`absolute inset-0 flex items-center justify-center ${
        theme === "dark" ? "bg-sa-bg-tertiary" : "bg-gray-200"
      }`}
    >
      <VideoOffIcon
        className={`w-8 h-8 ${
          theme === "dark" ? "text-sa-text-muted" : "text-gray-400"
        }`}
      />
    </div>
  );

  // Loading state
  const LoadingState = () => (
    <div
      className={`absolute inset-0 flex items-center justify-center ${
        theme === "dark"
          ? "bg-sa-bg-secondary clip-chamfer"
          : "glass-card-sm"
      }`}
    >
      <div
        className={`w-6 h-6 border-2 rounded-full animate-spin ${
          theme === "dark"
            ? "border-sa-accent-cyan/30 border-t-sa-accent-cyan"
            : "border-light-accent/30 border-t-light-accent"
        }`}
      />
    </div>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Outer container with theme-specific styling */}
      <div
        className={`relative transition-all duration-300 ${
          isUserSpeaking
            ? theme === "dark"
              ? "speaking-pulse"
              : "camera-ring-speaking-light"
            : ""
        }`}
      >
        {/* HUD frame decorations - dark mode only */}
        {theme === "dark" && (
          <>
            <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-sa-accent-cyan" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-sa-accent-cyan" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-sa-accent-cyan" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-sa-accent-cyan" />
          </>
        )}

        {/* Video container */}
        <div
          className={`relative overflow-hidden transition-all duration-300 ${
            theme === "dark"
              ? `clip-chamfer ${
                  isUserSpeaking
                    ? "border-2 border-sa-accent-cyan shadow-neon-cyan"
                    : "border border-sa-accent-cyan/40"
                }`
              : `rounded-2xl ${
                  isUserSpeaking
                    ? "shadow-accent-violet-strong"
                    : "camera-ring-light shadow-glass"
                }`
          }`}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-[180px] h-[135px] md:w-[240px] md:h-[180px] object-cover transform scale-x-[-1] ${
              !cameraEnabled ? "invisible" : ""
            }`}
          />

          {/* Camera off placeholder */}
          {!cameraEnabled && <CameraOffPlaceholder />}

          {/* Overlay effect */}
          <div
            className={`absolute inset-0 pointer-events-none ${
              theme === "dark"
                ? "bg-gradient-to-b from-transparent via-sa-accent-cyan/5 to-transparent opacity-50"
                : "bg-gradient-to-b from-white/10 via-transparent to-black/10"
            }`}
          />

          {/* Status indicator */}
          <StatusIndicator />

          {/* Control buttons */}
          <ControlButtons />
        </div>

        {/* Loading state */}
        {hasPermission === null && <LoadingState />}
      </div>
    </div>
  );
}
