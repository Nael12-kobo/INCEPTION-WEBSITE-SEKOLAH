"use client";

import { useEffect, useRef, useState } from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathUtils } from "three";

export interface VrmFraming {
  /** Geser horizontal (satuan dunia). Default 0. */
  offsetX?: number;
  /** Geser vertikal (satuan dunia). Default 0. */
  offsetY?: number;
  /** Pengali jarak kamera (1 = default). Default 1.45 faktor internal. */
  distance?: number;
  /** Faktor titik pandang vertikal (0.55 = tengah badan). Default 0.55. */
  targetY?: number;
  /**
   * Offset jarak kamera aditif (satuan dunia). Default 0.
   * Positif = menjauh, negatif = mendekat. Live via framingRef (tanpa reload).
   */
  zoomOffset?: number;
}

/**
 * Offset global model — ditulis ke wrapper Group (parent vrm.scene)
 * sehingga TIDAK PERNAH tercampur prosedural/clip yang menulis vrm.scene.
 * Semua live via ref (tanpa reload model). Default 0 = tanpa perubahan.
 */
export interface VrmGlobalOffset {
  /** Geser model sumbu X (satuan dunia). Default 0. */
  offsetX?: number;
  /** Geser model sumbu Y (satuan dunia). Default 0. */
  offsetY?: number;
  /** Putar model sumbu Y (derajat). Default 0. */
  rotationYOffset?: number;
  /** Jarak kamera aditif; mengalahkan framing.zoomOffset bila diisi. Default 0. */
  zoomOffset?: number;
}

interface VrmViewerProps {
  src?: string;
  speaking?: boolean;
  framing?: VrmFraming;
  globalOffset?: VrmGlobalOffset;
  className?: string;
}

/**
 * Viewer karakter VRM (three + @pixiv/three-vrm), VRM 1.0.
 * - src default dari NEXT_PUBLIC_VRM_URL (/models/character.vrm).
 * - File ±17.5MB (aslinya 149MB, dipangkas oleh scripts/optimize-vrm.mjs):
 *   tampilkan progress unduhan % + MB, tanpa timeout agresif.
 * - Cache di-bust via query `?v=` (lihat cacheVersion di bawah).
 * - Auto-frame bounding box agar karakter selalu masuk frame.
 * - Offset global (prop globalOffset: offsetX/offsetY/rotationYOffset/
 *   zoomOffset) ditulis ke wrapper Group parent — tak tercampur prosedural.
 * - Entrance .vrma sekali-putar → crossfade 0.4s → idle.vrma loop;
 *   saat clip aktif prosedural badan mati (clip pegang penuh), blink +
 *   mulut prosedural tetap jalan di atasnya + frustumCulled=false.
 * - Error asli ditampilkan (bukan pesan generik) agar mudah diagnosis.
 * - Diet runtime: pixelRatio max 1.5, pause saat tab hidden.
 */
export function VrmViewer({ src, speaking = false, framing, globalOffset, className }: VrmViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const speakingRef = useRef(speaking);
  const framingRef = useRef<VrmFraming | undefined>(framing);
  const globalOffsetRef = useRef<VrmGlobalOffset | undefined>(globalOffset);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const audioSpeakingRef = useRef(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const mediaElementSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const streamReaderRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading"
  );
  const [hint, setHint] = useState("");
  const [progress, setProgress] = useState(0);
  const [loadedMB, setLoadedMB] = useState(0);
  const [totalMB, setTotalMB] = useState<number | null>(null);

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  // framing dibaca via ref agar ganti breakpoint (desktop/mobile)
  // tidak memicu reload ulang model besar.
  useEffect(() => {
    framingRef.current = framing;
  }, [framing]);

  // globalOffset live (bisa diubah kapan saja tanpa reload model).
  useEffect(() => {
    globalOffsetRef.current = globalOffset;
  }, [globalOffset]);

  /**
   * Versi cache model. Ganti angka ini (atau set NEXT_PUBLIC_VRM_VERSION)
   * setiap file .vrm diganti — menambah query `?v=` membuat browser
   * mengabaikan cache lama (header immutable 1 tahun di next.config.ts).
   */
  const cacheVersion = process.env.NEXT_PUBLIC_VRM_VERSION || "3";
  const baseUrl =
    src || process.env.NEXT_PUBLIC_VRM_URL || "/models/character.vrm";
  const url =
    baseUrl + (baseUrl.includes("?") ? "&" : "?") + `v=${cacheVersion}`;

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;
    let renderer: import("three").WebGLRenderer | null = null;
    let raf = 0;
    let onVisibility: (() => void) | null = null;
    let onResize: (() => void) | null = null;
    let ro: ResizeObserver | null = null;
    let manager: import("three").LoadingManager | null = null;
    let mixer: import("three").AnimationMixer | null = null;
    let mixerRoot: import("three").Object3D | null = null;

    const createAudioContext = () => {
      if (typeof window === "undefined") return null;
      if (!audioContextRef.current) {
        const AudioContextCtor =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (AudioContextCtor) {
          audioContextRef.current = new AudioContextCtor();
        }
      }
      return audioContextRef.current;
    };

    const onUnlockAudio = () => {
      const ctx = createAudioContext();
      if (ctx?.state === "suspended") {
        void ctx.resume().catch(() => undefined);
      }
    };

    const stopCurrentAudio = () => {
      try {
        streamReaderRef.current?.cancel();
      } catch {
        /* stream mungkin sudah selesai */
      }
      streamReaderRef.current = null;

      try {
        audioSourceRef.current?.stop();
      } catch {
        /* audio mungkin sudah selesai */
      }
      audioSourceRef.current?.disconnect();
      audioSourceRef.current = null;

      mediaElementSourceRef.current?.disconnect();
      mediaElementSourceRef.current = null;

      const audio = audioElementRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        audio.remove();
      }
      audioElementRef.current = null;

      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
        audioObjectUrlRef.current = null;
      }
      mediaSourceRef.current = null;
      sourceBufferRef.current = null;
      audioSpeakingRef.current = false;
      analyserRef.current = null;
      analyserDataRef.current = null;
    };

    const onAudio = async (event: Event) => {
      const buffer = (event as CustomEvent<{ buffer?: ArrayBuffer }>).detail?.buffer;
      if (!buffer) return;

      try {
        stopCurrentAudio();
        const ctx = createAudioContext();
        if (!ctx) return;
        await ctx.resume().catch(() => undefined);

        const audioBuffer = await ctx.decodeAudioData(buffer.slice(0));
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;
        const data = new Uint8Array(analyser.fftSize);
        analyser.connect(ctx.destination);
        analyserRef.current = analyser;
        analyserDataRef.current = data;

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyser);
        source.onended = () => {
          if (audioSourceRef.current === source) {
            audioSourceRef.current = null;
            audioSpeakingRef.current = false;
            analyserRef.current = null;
            analyserDataRef.current = null;
          }
        };
        audioSourceRef.current = source;
        audioSpeakingRef.current = true;
        source.start(0);
      } catch (error) {
        audioSpeakingRef.current = false;
        console.warn("[VrmViewer] audio TTS gagal diputar", error);
      }
    };

    const onAudioStream = async (event: Event) => {
      const stream = (event as CustomEvent<{ stream?: ReadableStream<Uint8Array> }>).detail?.stream;
      if (!stream) return;

      try {
        stopCurrentAudio();
        const ctx = createAudioContext();
        if (!ctx) return;
        await ctx.resume().catch(() => undefined);

        const audio = document.createElement("audio");
        audio.dataset.naraAudio = "true";
        audio.preload = "auto";
        audio.autoplay = true;
        audio.style.display = "none";
        document.body.appendChild(audio);
        audioElementRef.current = audio;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;
        const data = new Uint8Array(analyser.fftSize);
        const mediaElementSource = ctx.createMediaElementSource(audio);
        mediaElementSource.connect(analyser);
        analyser.connect(ctx.destination);
        mediaElementSourceRef.current = mediaElementSource;
        analyserRef.current = analyser;
        analyserDataRef.current = data;

        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;
        const objectUrl = URL.createObjectURL(mediaSource);
        audioObjectUrlRef.current = objectUrl;
        audio.src = objectUrl;

        const reader = stream.getReader();
        streamReaderRef.current = reader;
        const queue: Uint8Array[] = [];
        let done = false;
        let started = false;

        const appendNext = () => {
          const sourceBuffer = sourceBufferRef.current;
          if (!sourceBuffer || sourceBuffer.updating) return;
          const next = queue.shift();
          if (next) {
            const ab = next.buffer.slice(
              next.byteOffset,
              next.byteOffset + next.byteLength
            );
            sourceBuffer.appendBuffer(ab as ArrayBuffer);
            return;
          }
          if (done && mediaSource.readyState === "open") {
            try {
              mediaSource.endOfStream();
            } catch {
              /* sudah ditutup */
            }
          }
        };

        mediaSource.addEventListener(
          "sourceopen",
          () => {
            if (mediaSourceRef.current !== mediaSource) return;
            if (!MediaSource.isTypeSupported("audio/mpeg")) {
              console.warn("[VrmViewer] MediaSource audio/mpeg tidak didukung");
              return;
            }

            const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
            sourceBufferRef.current = sourceBuffer;
            sourceBuffer.addEventListener("updateend", () => {
              if (!started) {
                started = true;
                audioSpeakingRef.current = true;
                void audio.play().catch((error) => {
                  console.warn("[VrmViewer] autoplay audio gagal", error);
                });
              }
              appendNext();
            });
            appendNext();
          },
          { once: true }
        );

        audio.onended = () => {
          if (audioElementRef.current === audio) {
            audioSpeakingRef.current = false;
          }
        };

        while (true) {
          const result = await reader.read();
          if (result.done) {
            done = true;
            appendNext();
            break;
          }
          if (result.value?.byteLength) {
            queue.push(result.value);
            appendNext();
          }
        }
      } catch (error) {
        audioSpeakingRef.current = false;
        console.warn("[VrmViewer] audio TTS streaming gagal diputar", error);
      }
    };

    window.addEventListener("nara:unlock-audio", onUnlockAudio);
    window.addEventListener("nara:audio", onAudio);
    window.addEventListener("nara:audio-stream", onAudioStream);
    // Node mount dicapture di awal effect agar cleanup tidak membaca
    // mountRef.current yang bisa sudah berubah (StrictMode remount).
    const effectMount = mountRef.current;

    async function init() {
      const mount = mountRef.current;
      if (!mount) return;
      // Idempotent: buang canvas sisa dari init sebelumnya (StrictMode
      // remount / HMR) agar inspect hanya menampilkan 1 <canvas>.
      mount.querySelectorAll("canvas").forEach((c) => c.remove());
      try {
        const THREE = await import("three");
        if (isCancelled()) return;
        const { GLTFLoader } = await import(
          "three/examples/jsm/loaders/GLTFLoader.js"
        );
        if (isCancelled()) return;
        const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");
        if (isCancelled() || !mount.isConnected) return;

        const width = mount.clientWidth || 600;
        const height = mount.clientHeight || 600;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 50);
        // Posisi awal aman; akan di-frame ulang otomatis setelah model termuat.
        camera.position.set(0, 1.35, 2.4);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        // Canvas harus block + mengisi penuh mount agar tidak terpotong /
        // menyisakan gap inline di desktop maupun mobile.
        renderer.domElement.style.display = "block";
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.dataset.vrmCanvas = "true";
        if (isCancelled() || !mount.isConnected) {
          renderer.dispose();
          renderer.domElement.remove();
          renderer = null;
          return;
        }
        // Pertahanan terakhir anti-double: hanya boleh 1 canvas per mount.
        mount.querySelectorAll("canvas").forEach((c) => c.remove());
        mount.appendChild(renderer.domElement);

        // Ukur ulang dari mount (bukan angka fallback) — dipanggil saat
        // layout sudah final via ResizeObserver di bawah, agar canvas
        // benar-benar fullscreen mengikuti container.
        const fit = () => {
          const m = mountRef.current;
          if (!m || !renderer) return;
          const w = m.clientWidth || 1;
          const h = m.clientHeight || 1;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        ro = new ResizeObserver(fit);
        ro.observe(mount);
        // RO selalu fire sekali saat observe — ukuran awal terkoreksi di sini.

        scene.add(new THREE.HemisphereLight(0xffffff, 0x8ab4ff, 1.1));
        const key = new THREE.DirectionalLight(0xffffff, 1.6);
        key.position.set(2, 4, 3);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x818cf8, 0.9);
        rim.position.set(-3, 2, -2);
        scene.add(rim);

        manager = new THREE.LoadingManager();
        const loader = new GLTFLoader(manager);
        loader.register((parser: unknown) => new VRMLoaderPlugin(parser as never));

        let gltf: import("three/examples/jsm/loaders/GLTFLoader.js").GLTF;
        try {
          gltf = await loader.loadAsync(
            url,
            (event) => {
              if (isCancelled()) return;
              if (event.total > 0) {
                setProgress(
                  Math.min(100, Math.round((event.loaded / event.total) * 100))
                );
                setLoadedMB(event.loaded / 1024 / 1024);
                setTotalMB(event.total / 1024 / 1024);
              } else {
                // Server tidak mengirim content-length — tampilkan MB berjalan.
                setLoadedMB(event.loaded / 1024 / 1024);
              }
            }
          );
        } catch (loadError) {
          // Abort saat unmount/StrictMode remount — bukan error, diam saja.
          if (isCancelled()) return;
          throw loadError;
        }
        if (isCancelled()) {
          VRMUtils.deepDispose(gltf.scene);
          return;
        }
        const vrm = gltf.userData.vrm;
        if (!vrm) {
          throw new Error(
            "File termuat tapi bukan VRM 1.0 yang valid (userData.vrm kosong). " +
              "Pastikan file adalah VRM 1.0 dari VRoid Studio terbaru."
          );
        }
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        // Karakter menghadap kamera (putar 180° pada sumbu Y).
        // Sumbu Z dibiarkan 0 agar karakter tidak terbalik.
        vrm.scene.rotation.y = Math.PI;
        vrm.scene.rotation.z = 0;
        // Rig global (parent vrm.scene): satu-satunya tempat offset global
        // ditulis. Prosedural + clip hanya menyentuh vrm.scene (anak).
        const rig = new THREE.Group();
        rig.add(vrm.scene);
        scene.add(rig);
        // Anti-culling: bounds mesh dihitung dari bind pose; clip yang
        // menggerakkan tulang membuat mesh ter-cull (elemen hilang).
        vrm.scene.traverse((obj: import("three").Object3D) => {
          if ((obj as import("three").Mesh).isMesh) {
            (obj as import("three").Mesh).frustumCulled = false;
          }
        });

        // ---- Auto-frame: karakter selalu masuk frame apapun skala/offsetnya ----
        // base* = hasil auto-frame MURNI (tanpa offset pengguna). Offset
        // dibaca per-frame dari framingRef agar ganti breakpoint tidak
        // butuh reload model besar.
        let baseX = 0;
        let baseY = 0;
        let baseZ = 0;
        // Posisi kamera dasar + target lookAt — zoomOffset diterapkan
        // per-frame di atas nilai dasar ini (live tanpa reload).
        const baseCam = { x: 0, y: 1.35, z: 2.4 };
        const lookTarget = new THREE.Vector3(0, 1, 0);
        try {
          const box = new THREE.Box3().setFromObject(vrm.scene);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          if (size.length() > 0) {
            // Geser agar tengah model di origin XZ dan kaki di y=0.
            vrm.scene.position.x -= center.x;
            vrm.scene.position.z -= center.z;
            vrm.scene.position.y -= box.min.y;
            const framingNow = framingRef.current;
            const fitHeight = Math.max(size.y, 0.5);
            const distFactor = framingNow?.distance ?? 1.45;
            const baseFit =
              (fitHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))) *
              distFactor;
            const targetFactor = framingNow?.targetY ?? 0.55;
            baseCam.x = 0;
            baseCam.y = fitHeight * 0.62;
            baseCam.z = baseFit;
            lookTarget.set(0, fitHeight * targetFactor, 0);
            const zoom =
              globalOffsetRef.current?.zoomOffset ?? framingNow?.zoomOffset ?? 0;
            camera.position.set(baseCam.x, baseCam.y, Math.max(0.3, baseCam.z + zoom));
            camera.lookAt(lookTarget);
          }
        } catch {
          /* frame default tetap dipakai bila kalkulasi gagal */
        }
        baseX = vrm.scene.position.x;
        baseY = vrm.scene.position.y;
        baseZ = vrm.scene.position.z;

        if (!isCancelled()) {
          setProgress(100);
          setStatus("ready");
        }

        // ---- Entrance (sekali) + Idle (loop) .vrma — opsional ----
        // File tak ada/invalid → warn + lanjut prosedural seperti biasa.
        // State: entrance --crossfade 0.4s--> idle. Tanpa idle, entrance
        // clamp lalu prosedural ambil alih. Tanpa keduanya, full prosedural.
        // Slot talk.vrma menyusul: idle tetap loop saat speaking + mulut
        // prosedural (lihat bawah); tinggal tambah talkAction + crossfade.
        let activeClip: "entrance" | "idle" | "none" = "none";
        const setActiveClip = (s: typeof activeClip) => {
          activeClip = s;
        };
        if (!isCancelled()) {
          try {
            const { VRMAnimationLoaderPlugin, createVRMAnimationClip } = await import(
              "@pixiv/three-vrm-animation"
            );
            if (!isCancelled()) {
              const animLoader = new GLTFLoader(manager);
              animLoader.register(
                (parser: unknown) => new VRMAnimationLoaderPlugin(parser as never)
              );
              const loadClip = async (path: string) => {
                try {
                  const animGltf = await animLoader.loadAsync(path);
                  const anims = (
                    animGltf.userData as {
                      vrmAnimations?: import("@pixiv/three-vrm-animation").VRMAnimation[];
                    }
                  ).vrmAnimations;
                  const first = anims?.[0];
                  if (!first) {
                    console.warn(`[VrmViewer] ${path} dilewati (bukan .vrma valid).`);
                    return null;
                  }
                  return createVRMAnimationClip(first, vrm);
                } catch (e) {
                  console.warn(`[VrmViewer] ${path} dilewati:`, e);
                  return null;
                }
              };
              const [entranceClip, idleClip] = await Promise.all([
                loadClip("/models/animation/entrance.vrma"),
                loadClip("/models/animation/idle.vrma"),
              ]);
              if (!isCancelled() && (entranceClip || idleClip)) {
                mixer = new THREE.AnimationMixer(vrm.scene);
                mixerRoot = vrm.scene;
                const entranceAction = entranceClip
                  ? mixer.clipAction(entranceClip)
                  : null;
                const idleAction = idleClip ? mixer.clipAction(idleClip) : null;
                if (entranceAction) {
                  entranceAction.setLoop(THREE.LoopOnce, 1);
                  entranceAction.clampWhenFinished = true;
                }
                if (idleAction) {
                  idleAction.setLoop(THREE.LoopRepeat, Infinity);
                }
                const onFinished = (e: { action: unknown }) => {
                  if (isCancelled()) return;
                  if (e.action === entranceAction) {
                    if (idleAction && entranceAction) {
                      setActiveClip("idle");
                      idleAction.reset().play();
                      entranceAction.crossFadeTo(idleAction, 0.4, false);
                    } else {
                      // Entrance tanpa idle: kembalikan ke prosedural.
                      setActiveClip("none");
                    }
                  }
                };
                mixer.addEventListener("finished", onFinished as never);
                if (entranceAction) {
                  setActiveClip("entrance");
                  entranceAction.reset().play();
                } else if (idleAction) {
                  setActiveClip("idle");
                  idleAction.reset().play();
                }
              }
            }
          } catch (animError) {
            if (!isCancelled()) {
              console.warn("[VrmViewer] animasi .vrma dilewati:", animError);
            }
          }
        }
        if (isCancelled()) {
          mixer?.stopAllAction();
          mixer = null;
          return;
        }

        const clock = new THREE.Clock();
        // Kedip dengan tweening: idle → closing → hold → opening.
        // Durasi fase (detik): tutup cepat, tahan singkat, buka natural.
        const BLINK_CLOSE = 0.09;
        const BLINK_HOLD = 0.05;
        const BLINK_OPEN = 0.16;
        const easeInQuad = (x: number) => x * x;
        const easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x);
        const blink = {
          t: 0,
          next: 2 + Math.random() * 3,
          phase: "idle" as "idle" | "closing" | "hold" | "opening",
          phaseT: 0,
        };
        let paused = document.hidden;

        onVisibility = () => {
          paused = document.hidden;
        };
        document.addEventListener("visibilitychange", onVisibility);

        const animate = () => {
          raf = requestAnimationFrame(animate);
          if (paused) {
            clock.getDelta();
            return;
          }
          const dt = Math.min(clock.getDelta(), 0.05);
          const t = clock.elapsedTime;

          // Idle breathing + sway — relatif terhadap posisi dasar
          // auto-frame + offset framingRef (responsif tanpa reload).
          const framingNow = framingRef.current;
          const offX = framingNow?.offsetX ?? 0;
          const offY = framingNow?.offsetY ?? 0;
          // Zoom aditif live: geser kamera di sumbu Z dari posisi dasar.
          const zoom =
            globalOffsetRef.current?.zoomOffset ?? framingNow?.zoomOffset ?? 0;
          if (zoom !== 0) {
            camera.position.set(baseCam.x, baseCam.y, Math.max(0.3, baseCam.z + zoom));
            camera.lookAt(lookTarget);
          }
          // Global offset (rig parent) — tak tersentuh prosedural/clip.
          const g = globalOffsetRef.current;
          rig.position.set(g?.offsetX ?? 0, g?.offsetY ?? 0, 0);
          rig.rotation.y = MathUtils.degToRad(g?.rotationYOffset ?? 0);
          const clipActive = activeClip !== "none";
          if (clipActive) {
            // Clip (.vrma) pegang PENUH badan + tulang: tanpa breathing,
            // sway, chest, head prosedural agar tidak double-transform.
            // Hanya placement statis (auto-frame + offset framing).
            vrm.scene.position.y = baseY + offY;
            vrm.scene.position.x = baseX + offX;
            vrm.scene.position.z = baseZ;
            vrm.scene.rotation.y = MathUtils.degToRad(0);
          } else {
            vrm.scene.position.y = baseY + offY + Math.sin(t * 1.4) * 0.02;
            vrm.scene.position.x = baseX + offX + Math.sin(t * 0.4) * 0.008;
            vrm.scene.position.z = baseZ;
            vrm.scene.rotation.y = MathUtils.degToRad(0);
          }
          const isSpeakingNow = speakingRef.current || audioSpeakingRef.current;

          if (!clipActive && vrm.humanoid) {
            const chest = vrm.humanoid.getNormalizedBoneNode("chest");
            if (chest) chest.rotation.x = isSpeakingNow
              ? Math.sin(t * 1.8) * 0.035
              : Math.sin(t * 1.4) * 0.03;
            const head = vrm.humanoid.getNormalizedBoneNode("head");
            if (head) {
              head.rotation.x = isSpeakingNow
                ? Math.sin(t * 6) * 0.06
                : Math.sin(t * 0.8) * 0.03;
              head.rotation.y = Math.sin(t * 0.5) * 0.08;
            }
          }
          // Blink dengan tweening — nilai 0→1→0 dihaluskan per-frame
          // (tanpa setTimeout), sinkron dengan render loop.
          if (vrm.expressionManager) {
            let blinkValue: number | null = null;
            if (blink.phase === "idle") {
              blink.t += dt;
              if (blink.t > blink.next) {
                blink.t = 0;
                blink.next = 2 + Math.random() * 3.5;
                blink.phase = "closing";
                blink.phaseT = 0;
              }
            } else {
              blink.phaseT += dt;
              if (blink.phase === "closing") {
                const p = Math.min(blink.phaseT / BLINK_CLOSE, 1);
                blinkValue = easeInQuad(p);
                if (p >= 1) {
                  blink.phase = "hold";
                  blink.phaseT = 0;
                }
              } else if (blink.phase === "hold") {
                blinkValue = 1;
                if (blink.phaseT >= BLINK_HOLD) {
                  blink.phase = "opening";
                  blink.phaseT = 0;
                }
              } else {
                const p = Math.min(blink.phaseT / BLINK_OPEN, 1);
                blinkValue = 1 - easeOutQuad(p);
                if (p >= 1) {
                  blink.phase = "idle";
                  blinkValue = 0;
                }
              }
            }
            if (blinkValue !== null) {
              vrm.expressionManager.setValue("blink", blinkValue);
            }
            let mouthOpen = 0;
            if (audioSpeakingRef.current && analyserRef.current && analyserDataRef.current) {
              const analyser = analyserRef.current;
              const data = analyserDataRef.current;
              analyser.getByteTimeDomainData(data);
              let sum = 0;
              for (let i = 0; i < data.length; i += 1) {
                const sample = (data[i] - 128) / 128;
                sum += sample * sample;
              }
              const rms = Math.sqrt(sum / data.length);
              mouthOpen = Math.min(1, rms * 6);
            }

            if (isSpeakingNow) {
              const fallback =
                0.08 + Math.abs(Math.sin(t * 7)) * 0.12;
              vrm.expressionManager.setValue(
                "aa",
                Math.max(mouthOpen, fallback)
              );
            } else {
              vrm.expressionManager.setValue("aa", 0);
            }
          }
          mixer?.update(dt);
          vrm.update(dt);
          renderer?.render(scene, camera);
        };
        animate();

        // ResizeObserver sudah dipasang tepat setelah renderer dibuat
        // (agar ukuran awal terkoreksi); di sini cukup window resize.
        onResize = () => {
          const m = mountRef.current;
          if (!m || !renderer) return;
          const w = m.clientWidth || 1;
          const h = m.clientHeight || 1;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);
      } catch (e) {
        // Tampilkan error ASLI agar mudah diagnosis (404, OOM, parse, dsb).
        const msg =
          e instanceof Error ? e.message : "Gagal memuat model (unknown error).";
        console.warn("[VrmViewer] gagal memuat", url, e);
        if (!isCancelled()) {
          setStatus("fallback");
          setHint(`${url} — ${msg.slice(0, 300)}`);
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (mixer) {
        mixer.stopAllAction();
        if (mixerRoot) mixer.uncacheRoot(mixerRoot);
        mixer = null;
        mixerRoot = null;
      }
      if (onVisibility) document.removeEventListener("visibilitychange", onVisibility);
      if (onResize) window.removeEventListener("resize", onResize);
      window.removeEventListener("nara:unlock-audio", onUnlockAudio);
      window.removeEventListener("nara:audio", onAudio);
      window.removeEventListener("nara:audio-stream", onAudioStream);
      stopCurrentAudio();
      void audioContextRef.current?.close().catch(() => undefined);
      audioContextRef.current = null;
      ro?.disconnect();
      // Batalkan unduhan model besar yang masih berjalan (satu-satunya
      // cara resmi: LoadingManager.abort → FileLoader memakai signal-nya).
      try {
        (manager as unknown as { abort?: () => void })?.abort?.();
      } catch {
        /* abaikan */
      }
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
        renderer = null;
      }
      // Buang canvas sisa bila init telat selesai setelah unmount.
      effectMount?.querySelectorAll("canvas").forEach((c) => c.remove());
    };
  // framing sengaja TIDAK jadi dep: dibaca via framingRef agar ganti
  // breakpoint tidak reload ulang model besar.
  }, [url]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {/* Latar dekoratif */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_35%,rgb(186_230_253/0.5),transparent_70%),radial-gradient(50%_40%_at_70%_80%,rgb(199_210_254/0.45),transparent_70%)]" />
      <div ref={mountRef} className="absolute inset-0" />
      
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 text-white shadow-2xl">
            <Bot className="h-12 w-12" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Memuat karakter 3D... {progress > 0 ? `${progress}%` : ""}
          </p>
          {/* Progress bar — penting untuk file besar */}
          <div className="h-2 w-56 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="max-w-sm text-xs text-slate-500">
            {loadedMB > 0
              ? `${loadedMB.toFixed(1)} MB${totalMB ? ` / ${totalMB.toFixed(0)} MB` : " terunduh..."}`
              : "Menghubungi server..."}
          </p>
          <p className="max-w-sm text-[11px] text-slate-400">
            File model berukuran besar — loading pertama bisa memakan waktu.
            Kunjungan berikutnya instan dari cache.
          </p>
        </div>
      )}
      {status === "fallback" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 text-white shadow-2xl">
            <Bot className="h-12 w-12" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Karakter 3D gagal dimuat
          </p>
          {hint && (
            <p className="max-w-md break-words text-xs text-slate-500">{hint}</p>
          )}
          {speaking && (
            <p className="rounded-full bg-blue-600/10 px-3 py-1 text-xs text-blue-700">
              Asisten sedang menjawab...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
