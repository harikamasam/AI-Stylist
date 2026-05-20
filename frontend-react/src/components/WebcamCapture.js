import React, { useRef, useState } from "react";
import { API_BASE_URL } from "../services/api";

function WebcamCapture() {
  const videoRef = useRef(null);
  const [option, setOption] = useState("Glasses");
  const [result, setResult] = useState(null);

  React.useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => videoRef.current.srcObject = stream)
      .catch(() => setHasCamera(false));
  }, []);

  const handleTryOn = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const form = new FormData();
      form.append("image", blob, "frame.jpg");
      form.append("option", option);

      const response = await fetch(`${API_BASE_URL}/tryon`, {
        method: "POST",
        body: form
      });

      const imageBlob = await response.blob();
      setResult(URL.createObjectURL(imageBlob));
    }, "image/jpeg");
  };

  return (
    <div className="flex flex-col items-center">
      <video
        ref={videoRef}
        autoPlay
        className="rounded-lg border-4 border-gray-300 shadow-lg"
        width="640"
        height="480"
      />
      <div className="mt-4 flex items-center gap-4">
        <select
          value={option}
          onChange={e => setOption(e.target.value)}
          className="border rounded p-2 shadow"
        >
          <option value="Glasses">Glasses</option>
          <option value="T-Shirt">T-Shirt</option>
        </select>
        <button
          onClick={handleTryOn}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow"
        >
          Try On
        </button>
      </div>
      {result && (
        <img
          src={result}
          alt="Result"
          className="mt-6 rounded-lg shadow-xl border-2 border-gray-200 max-w-full"
        />
      )}
    </div>
  );
}

export default WebcamCapture;
