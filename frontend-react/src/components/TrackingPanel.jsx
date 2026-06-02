import { useEffect, useRef } from "react";
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

const TRY_ON_STAGE_LABELS = {
  idle: "Mirror ready",
  extracting: "Extracting garment",
  analyzing: "Detecting body landmarks",
  generating: "Aligning shirt to torso",
  rendering: "Rendering AI try-on preview",
  complete: "Upper body fit preview",
};

const metricPercent = (value, fallback = 82) =>
  Math.max(52, Math.min(98, Math.round(Number.isFinite(value) ? value : fallback)));

function TrackingPanel({
  videoRef,
  canvasRef,
  loadingText,
  cameraUnavailable,
  category,
  compact = false,
  tryOnState = "idle",
  product,
  onMetricsChange,
}) {
  const trackingMode = TRACKING_MODES[category] || TRACKING_MODES.Shirts;
  const stageLabel = TRY_ON_STAGE_LABELS[tryOnState] || TRY_ON_STAGE_LABELS.idle;
  const tryOnActive = ["generating", "rendering", "complete"].includes(tryOnState);
  const garmentImageRef = useRef(null);
  const torsoSmoothingRef = useRef(null);
  const lastMetricsRef = useRef({ confidence: 0, shoulder: "--", torso: "--" });
  const lastMetricsEmitRef = useRef(0);
  const runtimeRef = useRef({ category, stageLabel, tryOnActive, trackingMode });

  useEffect(() => {
    runtimeRef.current = { category, stageLabel, tryOnActive, trackingMode };
  }, [category, stageLabel, trackingMode, tryOnActive]);

  useEffect(() => {
    if (!cameraUnavailable) return;

    onMetricsChange?.({
      confidence: 0,
      shoulderFit: 0,
      torsoCoverage: 0,
      alignmentConfidence: 0,
      fitConfidence: 0,
      shoulder: "--",
      torso: "--",
      chest: "--",
      alignment: "camera paused",
      alignmentVerdict: "Camera paused",
      bodyScale: "--",
      overlaySmoothing: "0%",
      landmarksDetected: false,
    });
  }, [cameraUnavailable, onMetricsChange]);

  useEffect(() => {
    if (!product?.image) {
      garmentImageRef.current = null;
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      garmentImageRef.current = image;
    };
    image.onerror = () => {
      garmentImageRef.current = null;
    };
    image.src = product.image;
  }, [product?.image]);

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
      drawSegmentationGlow(ctx, canvas, results.segmentationMask);
    }

    drawGrid(ctx, canvas);
    drawTorsoMask(ctx, canvas, results.poseLandmarks);
    drawGarmentPreview(ctx, canvas, results.poseLandmarks);
    drawCategoryPreview(ctx, canvas, results.poseLandmarks, face);
    drawPose(ctx, canvas, results.poseLandmarks);
    drawFocusOverlay(ctx, canvas, results.poseLandmarks, face);
    drawFaceBox(ctx, canvas, face);
    drawHUD(ctx, results.poseLandmarks);
  };

  const getUpperBodyPoints = (canvas, landmarks) => {
    if (!landmarks) return null;

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return null;

    return {
      ls: { x: leftShoulder.x * canvas.width, y: leftShoulder.y * canvas.height },
      rs: { x: rightShoulder.x * canvas.width, y: rightShoulder.y * canvas.height },
      lh: { x: leftHip.x * canvas.width, y: leftHip.y * canvas.height },
      rh: { x: rightHip.x * canvas.width, y: rightHip.y * canvas.height },
    };
  };

  const drawTorsoMask = (ctx, canvas, landmarks) => {
    const points = getUpperBodyPoints(canvas, landmarks);
    if (!points || !["Shirts", "Hoodies"].includes(runtimeRef.current.category)) return;

    const { ls, rs, lh, rh } = points;
    const shoulderWidth = Math.abs(rs.x - ls.x);
    const waistWidth = Math.abs(rh.x - lh.x);
    const shoulderPad = shoulderWidth * 0.14;
    const waistPad = waistWidth * 0.1;
    const neck = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 + shoulderWidth * 0.12 };

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ls.x - shoulderPad, ls.y + 10);
    ctx.quadraticCurveTo(neck.x - shoulderWidth * 0.16, neck.y, neck.x, neck.y);
    ctx.quadraticCurveTo(neck.x + shoulderWidth * 0.16, neck.y, rs.x + shoulderPad, rs.y + 10);
    ctx.lineTo(rh.x + waistPad, rh.y + 34);
    ctx.lineTo(lh.x - waistPad, lh.y + 34);
    ctx.closePath();
    ctx.fillStyle = "rgba(34,211,238,0.105)";
    ctx.strokeStyle = "rgba(34,211,238,0.72)";
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 9]);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(ls.x, ls.y - 24);
    ctx.lineTo(rs.x, rs.y - 24);
    ctx.strokeStyle = "rgba(230,216,195,0.82)";
    ctx.lineWidth = 4;
    ctx.stroke();

    [
      ["LS", ls],
      ["RS", rs],
      ["LH", lh],
      ["RH", rh],
    ].forEach(([label, point]) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#e6d8c3";
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "bold 13px Arial";
      ctx.fillText(label, point.x + 10, point.y - 8);
    });

    ctx.fillStyle = "rgba(0,0,0,0.56)";
    ctx.fillRect(ls.x - shoulderPad, Math.min(ls.y, rs.y) - 56, 178, 28);
    ctx.fillStyle = "#bae6fd";
    ctx.font = "bold 15px Arial";
    ctx.fillText("BODY MASK BUILT", ls.x - shoulderPad + 12, Math.min(ls.y, rs.y) - 36);
    ctx.restore();
  };

  const drawSegmentationGlow = (ctx, canvas, segmentationMask) => {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.filter = "blur(2px)";
    ctx.drawImage(segmentationMask, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-in";
    const glow = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    glow.addColorStop(0, "rgba(214,194,161,0.18)");
    glow.addColorStop(0.5, "rgba(34,211,238,0.18)");
    glow.addColorStop(1, "rgba(255,255,255,0.12)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  const drawGarmentPreview = (ctx, canvas, landmarks) => {
    const currentCategory = runtimeRef.current.category;
    const overlayActive = runtimeRef.current.tryOnActive;
    if (!overlayActive || !landmarks || !["Shirts", "Hoodies"].includes(currentCategory)) {
      return;
    }

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return;

    const rawTorso = {
      ls: {
      x: leftShoulder.x * canvas.width,
      y: leftShoulder.y * canvas.height,
      },
      rs: {
        x: rightShoulder.x * canvas.width,
        y: rightShoulder.y * canvas.height,
      },
      lh: {
        x: leftHip.x * canvas.width,
        y: leftHip.y * canvas.height,
      },
      rh: {
        x: rightHip.x * canvas.width,
        y: rightHip.y * canvas.height,
      },
    };
    const previous = torsoSmoothingRef.current || rawTorso;
    const smoothPoint = (current, old) => ({
      x: old.x * 0.72 + current.x * 0.28,
      y: old.y * 0.72 + current.y * 0.28,
    });
    const smoothed = {
      ls: smoothPoint(rawTorso.ls, previous.ls),
      rs: smoothPoint(rawTorso.rs, previous.rs),
      lh: smoothPoint(rawTorso.lh, previous.lh),
      rh: smoothPoint(rawTorso.rh, previous.rh),
    };
    torsoSmoothingRef.current = smoothed;
    const { ls, rs, lh, rh } = smoothed;

    const shoulderWidth = Math.abs(rs.x - ls.x);
    const hipWidth = Math.abs(rh.x - lh.x);
    const torsoHeight = Math.abs(((lh.y + rh.y) / 2) - ((ls.y + rs.y) / 2));
    const bodyHeightScale = Math.max(0.82, Math.min(1.22, torsoHeight / 230));
    const bodyDistanceScale = Math.max(0.82, Math.min(1.18, shoulderWidth / 260));
    const torsoWidthScale = Math.max(0.84, Math.min(1.18, ((shoulderWidth + hipWidth) / 2) / 235));
    const garmentScale = bodyDistanceScale * 0.55 + bodyHeightScale * 0.25 + torsoWidthScale * 0.2;
    const perspectiveSkew = (rs.y - ls.y) * 0.28 + (shoulderWidth - hipWidth) * 0.035;
    const shoulderAngle = Math.atan2(rs.y - ls.y, rs.x - ls.x);
    const expand = (currentCategory === "Hoodies" ? shoulderWidth * 0.22 : shoulderWidth * 0.14) * garmentScale;
    const neckDip = Math.max(18, shoulderWidth * 0.13);
    const hemDrop = (currentCategory === "Hoodies" ? 62 : 36) * bodyHeightScale;
    const leftHem = { x: lh.x - expand * 0.35, y: lh.y + hemDrop };
    const rightHem = { x: rh.x + expand * 0.35, y: rh.y + hemDrop };
    const centerNeck = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 + neckDip };

    ctx.save();
    ctx.translate(centerNeck.x, centerNeck.y);
    ctx.rotate(shoulderAngle * 0.12);
    ctx.translate(-centerNeck.x, -centerNeck.y);
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 18;

    ctx.beginPath();
    ctx.moveTo(ls.x - expand, ls.y + 8);
    ctx.quadraticCurveTo(centerNeck.x - shoulderWidth * 0.18, centerNeck.y, centerNeck.x, centerNeck.y);
    ctx.quadraticCurveTo(centerNeck.x + shoulderWidth * 0.18, centerNeck.y, rs.x + expand, rs.y + 8);
    ctx.lineTo(rightHem.x + perspectiveSkew, rightHem.y);
    ctx.quadraticCurveTo((leftHem.x + rightHem.x) / 2, rightHem.y + 24, leftHem.x + perspectiveSkew, leftHem.y);
    ctx.closePath();

    const garmentGradient = ctx.createLinearGradient(ls.x, ls.y, rh.x, rh.y);
    garmentGradient.addColorStop(0, "rgba(246,241,229,0.48)");
    garmentGradient.addColorStop(0.5, "rgba(214,194,161,0.34)");
    garmentGradient.addColorStop(1, "rgba(20,20,18,0.5)");
    const garmentImage = garmentImageRef.current;
    const imagePattern = garmentImage?.complete
      ? ctx.createPattern(garmentImage, "repeat")
      : null;
    ctx.fillStyle = imagePattern || garmentGradient;
    ctx.globalAlpha = currentCategory === "Hoodies" ? 0.58 : 0.52;
    ctx.fill();

    if (imagePattern) {
      ctx.globalCompositeOperation = "soft-light";
      ctx.globalAlpha = 0.42;
      ctx.fillStyle = garmentGradient;
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = "rgba(246,241,229,0.42)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.clip();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      const y = centerNeck.y + i * 44;
      ctx.moveTo(ls.x - expand, y);
      ctx.quadraticCurveTo(centerNeck.x, y + 18, rs.x + expand, y + 3);
      ctx.strokeStyle = `rgba(255,255,255,${0.07 - i * 0.007})`;
      ctx.lineWidth = 6;
      ctx.stroke();
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(centerNeck.x, centerNeck.y - 4, shoulderWidth * 0.16, 18, 0, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "rgba(34,211,238,0.55)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(ls.x, ls.y - 20);
    ctx.lineTo(rs.x, rs.y - 20);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(34,211,238,0.9)";
    ctx.font = "bold 18px Arial";
    ctx.fillText(`SHOULDER ${Math.round(shoulderWidth)}PX`, ls.x, Math.min(ls.y, rs.y) - 30);
    ctx.fillText(`CHEST ${Math.round((shoulderWidth + hipWidth) / 2)}PX`, centerNeck.x - 58, centerNeck.y + torsoHeight * 0.45);
    ctx.fillText(`SCALE ${Math.round(garmentScale * 100)}%`, rightHem.x - 98, rightHem.y + 30);
    ctx.restore();
  };

  const drawCategoryPreview = (ctx, canvas, landmarks, face) => {
    if (!landmarks) return;

    if (category === "Shoes") {
      [31, 32].forEach((index) => {
        const point = landmarks[index] || landmarks[index - 4];
        if (!point) return;
        const x = point.x * canvas.width;
        const y = point.y * canvas.height;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(index === 31 ? -0.08 : 0.08);
        ctx.shadowColor = "rgba(163,230,53,0.45)";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "rgba(163,230,53,0.18)";
        ctx.strokeStyle = "rgba(190,242,100,0.85)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 12, 72, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    }

    if (category === "Watches") {
      [15, 16].forEach((index) => {
        const wrist = landmarks[index];
        if (!wrist) return;
        const x = wrist.x * canvas.width;
        const y = wrist.y * canvas.height;
        ctx.save();
        ctx.strokeStyle = "rgba(226,232,240,0.85)";
        ctx.fillStyle = "rgba(226,232,240,0.18)";
        ctx.lineWidth = 5;
        ctx.shadowColor = "rgba(226,232,240,0.45)";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#e6d8c3";
        ctx.font = "bold 16px Arial";
        ctx.fillText("WRIST FIT", x + 30, y + 5);
        ctx.restore();
      });
    }

    if (category === "Glasses" && face) {
      const box = face.boundingBox;
      const x = box.xCenter * canvas.width;
      const y = box.yCenter * canvas.height - box.height * canvas.height * 0.08;
      const lensWidth = box.width * canvas.width * 0.28;
      ctx.save();
      ctx.strokeStyle = "rgba(56,189,248,0.85)";
      ctx.lineWidth = 5;
      ctx.shadowColor = "rgba(56,189,248,0.5)";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.ellipse(x - lensWidth * 0.7, y, lensWidth, lensWidth * 0.58, 0, 0, Math.PI * 2);
      ctx.ellipse(x + lensWidth * 0.7, y, lensWidth, lensWidth * 0.58, 0, 0, Math.PI * 2);
      ctx.moveTo(x - lensWidth * 0.08, y);
      ctx.lineTo(x + lensWidth * 0.08, y);
      ctx.stroke();
      ctx.restore();
    }
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

  const getFitMetrics = (landmarks) => {
    if (!landmarks) {
      return {
        confidence: cameraUnavailable ? 0 : 58,
        shoulderFit: 0,
        torsoCoverage: 0,
        alignmentConfidence: cameraUnavailable ? 0 : 58,
        fitConfidence: cameraUnavailable ? 0 : 58,
        shoulder: "--",
        torso: "--",
        chest: "--",
        alignment: "--",
        alignmentVerdict: cameraUnavailable ? "Camera paused" : "Waiting",
        bodyScale: "--",
        overlaySmoothing: "72%",
        landmarksDetected: false,
      };
    }

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      return {
        confidence: 62,
        shoulderFit: 62,
        torsoCoverage: 58,
        alignmentConfidence: 60,
        fitConfidence: 60,
        shoulder: "--",
        torso: "--",
        chest: "--",
        alignment: "partial",
        alignmentVerdict: "Partial",
        bodyScale: "--",
        overlaySmoothing: "72%",
        landmarksDetected: false,
      };
    }

    const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
    const hipWidth = Math.abs(rightHip.x - leftHip.x);
    const torsoHeight = Math.abs((leftHip.y + rightHip.y) / 2 - (leftShoulder.y + rightShoulder.y) / 2);
    const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
    const bodyScale = Math.max(0.82, Math.min(1.18, shoulderWidth / 0.2));
    const visibility =
      [leftShoulder, rightShoulder, leftHip, rightHip].reduce(
        (sum, point) => sum + (point.visibility || 0.75),
        0
      ) / 4;
    const confidence = Math.round(
      Math.max(54, Math.min(98, visibility * 72 + shoulderWidth * 70 + torsoHeight * 32 - shoulderTilt * 80))
    );
    const shoulderFit = metricPercent(96 - Math.abs(shoulderWidth - 0.2) * 130 - shoulderTilt * 110);
    const torsoCoverage = metricPercent(86 + torsoHeight * 42 - Math.abs(shoulderWidth - hipWidth) * 45);
    const alignmentConfidence = metricPercent(98 - shoulderTilt * 360 + visibility * 8);
    const fitConfidence = metricPercent(
      shoulderFit * 0.36 + torsoCoverage * 0.3 + alignmentConfidence * 0.34
    );
    const alignmentVerdict =
      alignmentConfidence >= 90
        ? "Excellent"
        : alignmentConfidence >= 80
          ? "Strong"
          : alignmentConfidence >= 68
            ? "Needs adjustment"
            : "Reposition";

    return {
      confidence: fitConfidence || confidence,
      shoulderFit,
      torsoCoverage,
      alignmentConfidence,
      fitConfidence,
      shoulder: `${Math.round(shoulderWidth * 1280)}px`,
      torso: `${Math.round(torsoHeight * 720)}px`,
      chest: `${Math.round(((shoulderWidth + hipWidth) / 2) * 1280)}px`,
      alignment: shoulderTilt < 0.035 ? "level" : "tilted",
      alignmentVerdict,
      bodyScale: `${Math.round(bodyScale * 100)}%`,
      overlaySmoothing: "72%",
      landmarksDetected: true,
    };
  };

  const drawHUD = (ctx, landmarks) => {
    const metrics = getFitMetrics(landmarks);
    const previous = lastMetricsRef.current;
    const changed =
      previous.confidence !== metrics.confidence ||
      previous.shoulder !== metrics.shoulder ||
      previous.torso !== metrics.torso ||
      previous.alignment !== metrics.alignment;

    if (changed && performance.now() - lastMetricsEmitRef.current > 650) {
      lastMetricsRef.current = metrics;
      lastMetricsEmitRef.current = performance.now();
      onMetricsChange?.(metrics);
    }

    const currentStageLabel = runtimeRef.current.stageLabel;
    const currentTrackingMode = runtimeRef.current.trackingMode;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(30, 30, 430, 230);

    ctx.fillStyle = "#22d3ee";
    ctx.font = "bold 26px Arial";
    ctx.fillText(currentTrackingMode.label, 50, 70);

    ctx.fillStyle = "#6ee7b7";
    ctx.font = "bold 20px Arial";
    ctx.fillText(currentTrackingMode.subtitle, 50, 105);

    ctx.fillStyle = "rgba(214,194,161,0.16)";
    ctx.fillRect(50, 116, 260, 34);
    ctx.fillStyle = "#e6d8c3";
    ctx.font = "bold 18px Arial";
    ctx.fillText(currentStageLabel.toUpperCase(), 64, 139);

    ctx.fillStyle = "rgba(34,211,238,0.16)";
    ctx.fillRect(50, 158, 340, 34);
    ctx.fillStyle = "#bae6fd";
    ctx.font = "bold 17px Arial";
    ctx.fillText(
      `FIT ${metrics.fitConfidence}%  SHOULDER ${metrics.shoulder}  ${metrics.alignment.toUpperCase()}`,
      64,
      181
    );

    [
      [`SHOULDER FIT ${metrics.shoulderFit}%`, 50, 216],
      [`TORSO COVER ${metrics.torsoCoverage}%`, 250, 216],
      [`ALIGN ${metrics.alignmentConfidence}% ${metrics.alignmentVerdict.toUpperCase()}`, 50, 244],
    ].forEach(([label, x, y]) => {
      ctx.fillStyle = "rgba(230,216,195,0.14)";
      ctx.fillRect(x, y - 17, label.length * 8.2, 23);
      ctx.fillStyle = "#f6f1e5";
      ctx.font = "bold 14px Arial";
      ctx.fillText(label, x + 8, y);
    });

    const scanlineY = ((performance.now() / 18) % 720);
    ctx.fillStyle = "rgba(34,211,238,0.2)";
    ctx.fillRect(0, scanlineY, 1280, 8);
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

        <div className="flex flex-wrap justify-end gap-2">
          <div className="rounded-full border border-stone-200/10 bg-stone-100/[0.04] px-4 py-2 text-sm font-black text-[#e6d8c3]">
            {cameraUnavailable ? "PAUSED" : "LIVE"}
          </div>
          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-100">
            {stageLabel}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-stone-200/10 bg-black/35 shadow-inner shadow-black/40">
        {cameraUnavailable ? (
          <div
            className={`relative flex flex-col items-center justify-center overflow-hidden bg-[linear-gradient(135deg,rgba(214,194,161,0.12),rgba(24,24,27,0.72))] p-8 text-center ${
              compact
                ? "min-h-[220px] sm:min-h-[260px] xl:min-h-[300px]"
                : "min-h-[360px] sm:min-h-[460px] xl:min-h-[560px]"
            }`}
          >
            <div
              className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px)]"
              style={{ backgroundSize: "44px 44px" }}
            />
            <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-300/15" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-300/15" />
            <div className="rounded-full border border-stone-200/10 bg-stone-100/[0.05] px-4 py-2 font-black text-[#e6d8c3]">
              {trackingMode.label}
            </div>

            <div className="relative mt-5 flex h-48 w-44 items-center justify-center sm:h-56 sm:w-52">
              <div className="absolute top-0 h-14 w-14 rounded-full bg-stone-500/70 shadow-xl shadow-black/30" />
              <div className="absolute top-16 h-36 w-28 rounded-[42%_42%_18%_18%] bg-stone-600/55 shadow-2xl shadow-black/40" />
              {tryOnActive && ["Shirts", "Hoodies"].includes(category) && (
                <div
                  className="absolute top-[72px] h-36 w-40 overflow-hidden rounded-[34%_34%_18%_18%] bg-gradient-to-br from-[#f6f1e5]/70 via-[#d6c2a1]/45 to-zinc-950/70 opacity-90 shadow-2xl shadow-black/50 ring-1 ring-white/20"
                  style={{
                    clipPath:
                      "polygon(9% 12%, 30% 0, 50% 13%, 70% 0, 91% 12%, 84% 100%, 16% 100%)",
                  }}
                >
                  <div className="absolute inset-x-3 top-12 h-16 rounded-full border border-white/10 bg-white/10 blur-xl" />
                  <div className="absolute inset-y-4 left-2 w-10 rounded-full bg-white/10 blur-lg" />
                  <div className="absolute left-1/2 top-2 h-8 w-16 -translate-x-1/2 rounded-b-full bg-black/30" />
                  <div className="absolute inset-x-5 top-14 h-px bg-white/20" />
                  <div className="absolute inset-x-5 bottom-5 h-6 rounded-full bg-black/15 blur-sm" />
                </div>
              )}
              <div className="absolute bottom-2 rounded-full border border-cyan-300/20 bg-black/65 px-3 py-2 text-[11px] font-black text-cyan-100 backdrop-blur">
                {["Shirts", "Hoodies"].includes(category)
                  ? "Torso alignment active"
                  : trackingMode.subtitle}
              </div>
            </div>

            <p className="relative mt-4 max-w-sm text-gray-300">
              Camera is paused. The AI mirror is ready for {trackingMode.subtitle.toLowerCase()}.
            </p>
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
        <span className="text-[#e6d8c3]">
          {tryOnState === "idle" ? loadingText : stageLabel}
        </span>
        <span className="rounded-full border border-stone-200/10 bg-stone-100/[0.035] px-3 py-2 text-stone-300">
          {trackingMode.subtitle}
        </span>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-cyan-100">
          {tryOnActive ? "Fit confidence active" : "Landmark model armed"}
        </span>
      </div>
    </section>
  );
}

export default TrackingPanel;
