import { useEffect } from "react";
import { Pose } from "@mediapipe/pose";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";

const TRACKING_MODES = {
  Shirts: {
    label: "TORSO TRACKING",
    subtitle: "Upper body fit analysis",
    color: "#22d3ee",
    landmarks: [11, 12, 13, 14, 23, 24],
  },
  Hoodies: {
    label: "TORSO TRACKING",
    subtitle: "Layer volume + shoulder mapping",
    color: "#22d3ee",
    landmarks: [11, 12, 13, 14, 23, 24],
  },
  Shoes: {
    label: "FOOT TRACKING",
    subtitle: "Lower body stance + footwear focus",
    color: "#a3e635",
    landmarks: [23, 24, 25, 26, 27, 28, 31, 32],
  },
  Glasses: {
    label: "FACE TRACKING",
    subtitle: "Face frame + eyewear alignment",
    color: "#38bdf8",
    landmarks: [],
  },
  Watches: {
    label: "WRIST TRACKING",
    subtitle: "Wrist and arm accessory focus",
    color: "#cbd5e1",
    landmarks: [11, 12, 13, 14, 15, 16],
  },
};

function TrackingPanel({ videoRef, canvasRef, loadingText, cameraUnavailable, category, compact = false }) {
  const trackingMode = TRACKING_MODES[category] || TRACKING_MODES.Shirts;

  useEffect(() => {
    if (cameraUnavailable) return;

    if (!videoRef.current || !canvasRef.current) return;

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    const faceDetection = new FaceDetection({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    faceDetection.setOptions({
      model: "short",
      minDetectionConfidence: 0.6,
    });

    let latestFace = null;

    faceDetection.onResults((faceResults) => {
      latestFace = faceResults.detections?.[0] || null;
    });

    pose.onResults((poseResults) => {
      drawResults(poseResults, latestFace);
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await faceDetection.send({ image: videoRef.current });
        await pose.send({ image: videoRef.current });
      },
      width: 1280,
      height: 720,
    });

    camera.start();

    return () => {
      camera.stop();
    };
    // MediaPipe should initialize once for this mounted panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraUnavailable, category]);

  const drawResults = (results, face) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 1280;
    canvas.height = 720;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.segmentationMask) {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    drawGrid(ctx, canvas);
    drawPose(ctx, canvas, results.poseLandmarks);
    drawFocusOverlay(ctx, canvas, results.poseLandmarks, face);
    drawFaceBox(ctx, canvas, face);
    drawHUD(ctx);
  };

  const drawGrid = (ctx, canvas) => {
    ctx.strokeStyle = "rgba(34,211,238,0.08)";
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const drawPose = (ctx, canvas, landmarks) => {
    if (!landmarks) return;

    const connections = [
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16],
      [11, 12],
      [23, 24],
      [11, 23],
      [12, 24],
      [23, 25],
      [25, 27],
      [24, 26],
      [26, 28],
    ];

    connections.forEach(([start, end]) => {
      const s = landmarks[start];
      const e = landmarks[end];
      if (!s || !e) return;

      ctx.beginPath();
      ctx.moveTo(s.x * canvas.width, s.y * canvas.height);
      ctx.lineTo(e.x * canvas.width, e.y * canvas.height);
      ctx.strokeStyle = "rgba(34,211,238,0.32)";
      ctx.lineWidth = 4;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#22d3ee";
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    landmarks.forEach((point) => {
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, 14, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(34,211,238,0.10)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(34,211,238,0.55)";
      ctx.fill();
    });
  };

  const drawFocusOverlay = (ctx, canvas, landmarks, face) => {
    ctx.save();
    ctx.strokeStyle = trackingMode.color;
    ctx.fillStyle = `${trackingMode.color}28`;
    ctx.lineWidth = 5;
    ctx.shadowBlur = 18;
    ctx.shadowColor = trackingMode.color;

    if (category === "Glasses" && face) {
      const box = face.boundingBox;
      const x = box.xCenter * canvas.width - (box.width * canvas.width) / 2;
      const y = box.yCenter * canvas.height - (box.height * canvas.height) / 2;
      const w = box.width * canvas.width;
      const h = box.height * canvas.height;
      ctx.strokeRect(x - 12, y - 12, w + 24, h + 24);
      ctx.fillRect(x - 12, y - 48, 205, 34);
      ctx.fillStyle = trackingMode.color;
      ctx.font = "bold 22px Arial";
      ctx.fillText(trackingMode.label, x + 2, y - 24);
      ctx.restore();
      return;
    }

    if (!landmarks) {
      ctx.restore();
      return;
    }

    const points = trackingMode.landmarks
      .map((index) => landmarks[index])
      .filter(Boolean)
      .map((point) => ({
        x: point.x * canvas.width,
        y: point.y * canvas.height,
      }));

    if (!points.length) {
      ctx.restore();
      return;
    }

    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const x = Math.min(...xs) - 45;
    const y = Math.min(...ys) - 45;
    const w = Math.max(...xs) - Math.min(...xs) + 90;
    const h = Math.max(...ys) - Math.min(...ys) + 90;

    ctx.strokeRect(x, y, w, h);
    ctx.fillRect(x, y - 42, 220, 34);
    ctx.fillStyle = trackingMode.color;
    ctx.font = "bold 22px Arial";
    ctx.fillText(trackingMode.label, x + 12, y - 18);

    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 9, 0, 2 * Math.PI);
      ctx.fillStyle = trackingMode.color;
      ctx.fill();
    });

    ctx.restore();
  };

  const drawFaceBox = (ctx, canvas, face) => {
    if (!face) return;

    const box = face.boundingBox;
    const x = box.xCenter * canvas.width - (box.width * canvas.width) / 2;
    const y = box.yCenter * canvas.height - (box.height * canvas.height) / 2;
    const w = box.width * canvas.width;
    const h = box.height * canvas.height;

    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#10b981";
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(16,185,129,0.18)";
    ctx.fillRect(x, y - 38, 190, 32);

    ctx.fillStyle = "#6ee7b7";
    ctx.font = "bold 22px Arial";
    ctx.fillText("FACE DETECTED", x + 12, y - 15);
  };

  const drawHUD = (ctx) => {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(30, 30, 360, 110);

    ctx.fillStyle = "#22d3ee";
    ctx.font = "bold 26px Arial";
    ctx.fillText(trackingMode.label, 50, 70);

    ctx.fillStyle = "#6ee7b7";
    ctx.font = "bold 20px Arial";
    ctx.fillText(trackingMode.subtitle, 50, 105);

    ctx.fillStyle = "rgba(34,211,238,0.2)";
    ctx.fillRect(0, Math.random() * 720, 1280, 8);
  };

  return (
    <section className="group relative overflow-hidden rounded-[28px] border border-stone-200/10 bg-[#11100e]/90 p-4 shadow-2xl shadow-black/25 backdrop-blur sm:p-5">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-stone-200/35 to-transparent" />

      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#d6c2a1]">
            AI Mirror
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {trackingMode.label}
          </h2>
        </div>

        <div className="rounded-full border border-stone-200/10 bg-stone-100/[0.04] px-4 py-2 text-sm font-black text-[#e6d8c3]">
          {cameraUnavailable ? "PAUSED" : "LIVE"}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-stone-200/10 bg-black/35 shadow-inner shadow-black/40">
        {cameraUnavailable ? (
          <div
            className={`flex flex-col items-center justify-center bg-[linear-gradient(135deg,rgba(214,194,161,0.12),rgba(24,24,27,0.72))] p-8 text-center ${
              compact
                ? "min-h-[260px] sm:min-h-[320px] xl:min-h-[360px]"
                : "min-h-[360px] sm:min-h-[460px] xl:min-h-[560px]"
            }`}
          >
            <div className="rounded-full border border-stone-200/10 bg-stone-100/[0.05] px-4 py-2 font-black text-[#e6d8c3]">
              {trackingMode.label}
            </div>

            <p className="mt-4 max-w-sm text-gray-300">
              Camera is paused. The AI mirror is ready for {trackingMode.subtitle.toLowerCase()}.
            </p>
            <div className="mt-6 h-24 w-24 rounded-full border border-stone-200/10 bg-stone-100/[0.05] shadow-2xl shadow-black/30" />
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="hidden"
            />

            <canvas
              ref={canvasRef}
              className="aspect-video w-full rounded-3xl object-cover"
            />
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm font-black">
        <span className="text-[#e6d8c3]">{loadingText}</span>
        <span className="rounded-full border border-stone-200/10 bg-stone-100/[0.035] px-3 py-2 text-stone-300">
          {trackingMode.subtitle}
        </span>
      </div>
    </section>
  );
}

export default TrackingPanel;
