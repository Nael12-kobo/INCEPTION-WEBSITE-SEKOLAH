"use client";

import { useRef, useState } from "react";

const FADEOUT_DURATION = 500;

export function HomeEntranceVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dismissingRef = useRef(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [mounted, setMounted] = useState(true);

  const dismiss = () => {
    if (dismissingRef.current) return;
    dismissingRef.current = true;
    setIsDismissing(true);

    window.setTimeout(() => {
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
      setMounted(false);
    }, FADEOUT_DURATION);
  };

  if (!mounted) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Tutup video pembuka"
      onClick={dismiss}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") dismiss();
      }}
      className={`fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-black transition-opacity duration-500 ease-out ${
        isDismissing ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={dismiss}
        className="h-full w-full object-cover"
        aria-label="Video pembuka SMK Telekomunikasi Tunas Harapan"
      >
        <source
          src="/animated/INTROTTHMOBILE.webm"
          type="video/webm"
          media="(max-width: 767px)"
        />
        <source src="/animated/INTROTTH.webm" type="video/webm" />
      </video>
    </div>
  );
}
