import React, { useEffect, useRef, useState } from "react";
import { stops } from "../data/stops";
import terminalAImg from "../assets/terminal_A.png";
import terminalBImg from "../assets/terminal_B.png";
import { debugPointsTerminal } from "../data/stops";

export default function TerminalMapCanvas({ terminal, path }) {
  const canvasRef = useRef(null);
  const imageSrc = terminal === "A" ? terminalAImg : terminalBImg;
  const [canvasWidth, setCanvasWidth] = useState(300);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const aspectRatio = image.width / image.height;
      const newWidth = 700 * aspectRatio;
      setCanvasWidth(newWidth);

      canvas.width = newWidth;
      canvas.height = 700;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      debugPointsTerminal.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();

        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(point.id, point.x + 8, point.y - 8);
      });
    };

    // 🔍 Add click event
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      console.log(`Clicked at: x=${x.toFixed(0)}, y=${y.toFixed(0)}`);
    };

    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [imageSrc, path, terminal]);

  return <canvas ref={canvasRef} width={canvasWidth} height={700} />;
}
