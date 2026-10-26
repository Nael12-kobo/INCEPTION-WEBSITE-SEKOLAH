"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExplorePhotosphereViewerProps {
  src: string;
  alt: string;
}

type PointerPosition = { x: number; y: number };

const PANORAMA_ROTATION = Math.PI;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getDistance(a: PointerPosition, b: PointerPosition): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function ExplorePhotosphereViewer({
  src,
  alt,
}: ExplorePhotosphereViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fovRef = useRef(75);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const zoomIn = useCallback(() => {
    fovRef.current = clamp(fovRef.current - 8, 35, 95);
  }, []);

  const zoomOut = useCallback(() => {
    fovRef.current = clamp(fovRef.current + 8, 35, 95);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      const errorFrame = window.requestAnimationFrame(() => setStatus("error"));
      return () => window.cancelAnimationFrame(errorFrame);
    }

    let disposed = false;
    let animationFrame = 0;
    let texture: THREE.Texture | null = null;
    let resizedBitmap: ImageBitmap | null = null;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1100);
    const geometry = new THREE.SphereGeometry(500, 64, 48);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(geometry, material));

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "block h-full w-full touch-none";
    renderer.domElement.setAttribute("aria-label", alt);
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.style.cursor = "grab";
    container.appendChild(renderer.domElement);

    let longitude = 0;
    let latitude = 0;
    const pointers = new Map<number, PointerPosition>();
    let dragStart: {
      x: number;
      y: number;
      longitude: number;
      latitude: number;
    } | null = null;
    let pinchStartDistance = 0;
    let pinchStartFov = fovRef.current;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      renderer.domElement.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 1) {
        dragStart = {
          x: event.clientX,
          y: event.clientY,
          longitude,
          latitude,
        };
      } else if (pointers.size === 2) {
        const [first, second] = Array.from(pointers.values());
        pinchStartDistance = getDistance(first, second);
        pinchStartFov = fovRef.current;
        dragStart = null;
      }
      renderer.domElement.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 1 && dragStart) {
        longitude = dragStart.longitude - (event.clientX - dragStart.x) * 0.12;
        latitude = clamp(
          dragStart.latitude + (event.clientY - dragStart.y) * 0.12,
          -85,
          85,
        );
      } else if (pointers.size >= 2 && pinchStartDistance > 0) {
        const [first, second] = Array.from(pointers.values());
        fovRef.current = clamp(
          pinchStartFov +
            (pinchStartDistance - getDistance(first, second)) * 0.05,
          35,
          95,
        );
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }

      if (pointers.size === 1) {
        const [remaining] = Array.from(pointers.values());
        dragStart = {
          x: remaining.x,
          y: remaining.y,
          longitude,
          latitude,
        };
      } else {
        dragStart = null;
      }
      if (pointers.size === 0) renderer.domElement.style.cursor = "grab";
      pinchStartDistance = 0;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      fovRef.current = clamp(fovRef.current + event.deltaY * 0.025, 35, 95);
    };

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width <= 0 || height <= 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const render = () => {
      if (disposed) return;
      animationFrame = window.requestAnimationFrame(render);
      if (camera.fov !== fovRef.current) {
        camera.fov = fovRef.current;
        camera.updateProjectionMatrix();
      }
      const phi = THREE.MathUtils.degToRad(90 - latitude);
      const theta = THREE.MathUtils.degToRad(longitude);
      camera.lookAt(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta),
      );
      renderer.render(scene, camera);
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", resize);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    render();

    const image = new window.Image();
    image.decoding = "async";
    image.onload = async () => {
      if (disposed) return;

      try {
        const maxTextureSize = Math.min(renderer.capabilities.maxTextureSize, 4096);
        const scale = Math.min(
          1,
          maxTextureSize / image.naturalWidth,
          maxTextureSize / image.naturalHeight,
        );
        let loadedTexture: THREE.Texture;

        if (scale < 1) {
          const width = Math.max(1, Math.round(image.naturalWidth * scale));
          const height = Math.max(1, Math.round(image.naturalHeight * scale));
          if (typeof createImageBitmap === "function") {
            resizedBitmap = await createImageBitmap(image, {
              resizeWidth: width,
              resizeHeight: height,
              resizeQuality: "high",
            });
            if (disposed) {
              resizedBitmap.close();
              return;
            }
            loadedTexture = new THREE.CanvasTexture(resizedBitmap);
          } else {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Canvas 2D tidak tersedia");
            context.drawImage(image, 0, 0, width, height);
            loadedTexture = new THREE.CanvasTexture(canvas);
          }
        } else {
          loadedTexture = new THREE.Texture(image);
        }

        if (disposed) {
          loadedTexture.dispose();
          return;
        }
        texture = loadedTexture;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.center.set(0.5, 0.5);
        texture.rotation = PANORAMA_ROTATION;
        texture.needsUpdate = true;
        material.map = texture;
        material.needsUpdate = true;
        setStatus("ready");
      } catch {
        if (!disposed) setStatus("error");
      }
    };
    image.onerror = () => {
      if (!disposed) setStatus("error");
    };
    image.src = src;

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      texture?.dispose();
      resizedBitmap?.close();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [src, alt]);

  return (
    <div className="absolute inset-0 bg-slate-950">
      <div ref={containerRef} className="absolute inset-0 touch-none" />
      {status === "loading" && (
        <div
          role="status"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-sm text-white/80"
        >
          Memuat photosphere...
        </div>
      )}
      {status === "error" && (
        <div
          role="alert"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 text-center text-sm text-white/80"
        >
          Photosphere tidak dapat dimuat di perangkat ini.
        </div>
      )}
      {status === "ready" && (
        <div className="absolute bottom-5 right-5 z-20 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Perkecil photosphere"
            onClick={zoomOut}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Perbesar photosphere"
            onClick={zoomIn}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
