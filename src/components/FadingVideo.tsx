import React, { useEffect, useRef } from "react";

interface FadingVideoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

export const FadingVideo: React.FC<FadingVideoProps> = ({ src, className, style }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const fadingOutRef = useRef<boolean>(false);

  const FADE_MS = 500;
  const FADE_OUT_LEAD = 0.55;

  const fadeTo = (targetOpacity: number, duration: number = FADE_MS) => {
    const video = videoRef.current;
    if (!video) return;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    const startOpacity = parseFloat(video.style.opacity || "0");
    const opacityDiff = targetOpacity - startOpacity;
    if (opacityDiff === 0) return;

    const startTime = performance.now();

    const animateFade = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentOpacity = startOpacity + opacityDiff * progress;
      video.style.opacity = currentOpacity.toFixed(4);

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animateFade);
      } else {
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(animateFade);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Initial state
    video.style.opacity = "0";
    fadingOutRef.current = false;

    const handleLoadedData = () => {
      video.style.opacity = "0";
      video.play().catch((err) => console.log("Video autoplay blocked or interrupted:", err));
      fadeTo(1);
    };

    const handleTimeUpdate = () => {
      const duration = video.duration;
      const currentTime = video.currentTime;

      if (!duration || isNaN(duration)) return;

      if (!fadingOutRef.current && (duration - currentTime <= FADE_OUT_LEAD) && (duration - currentTime > 0)) {
        fadingOutRef.current = true;
        fadeTo(0);
      }
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((err) => console.log("Video play interrupted on loop:", err));
        fadingOutRef.current = false;
        fadeTo(1);
      }, 100);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // If source changes or mounts, trigger load
    video.load();

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      style={{
        ...style,
        transition: "none", // Strictly disable CSS transitions for opacity
      }}
      muted
      playsInline
      preload="auto"
    />
  );
};
