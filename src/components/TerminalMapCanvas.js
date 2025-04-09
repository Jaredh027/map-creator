import React, { useEffect, useRef, useState } from "react";
import { stops } from "../data/stops";
import terminalAImg from "../assets/terminal_A.png";
import terminalBImg from "../assets/terminal_B.png";
import { debugPointsTerminal } from "../data/stops";
import { nodesTerminal } from "../data/stops";

export default function TerminalMapCanvas({ terminal, path }) {
  const canvasRef = useRef(null);
  const imageSrc = terminal === "A" ? terminalAImg : terminalBImg;
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 700 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  const currentTerminalRef = useRef(terminal);

  // Define reference dimensions that your node coordinates were originally based on
  // Adjust these values based on your original coordinate system
  const REFERENCE_WIDTH = 439; // Example reference width
  const REFERENCE_HEIGHT = 700; // Example reference height

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Track terminal changes
    const terminalChanged = currentTerminalRef.current !== terminal;
    currentTerminalRef.current = terminal;

    // Load new image if needed
    if (!imageRef.current || terminalChanged) {
      // Reset state when terminal changes
      if (terminalChanged) {
        setImageLoaded(false);
      }

      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        imageRef.current = image;
        setImageLoaded(true);

        // Use a fixed height of 700px
        const fixedHeight = 500;
        // Calculate width based on the image's aspect ratio
        const aspectRatio = image.width / image.height;
        const calculatedWidth = fixedHeight * aspectRatio;

        setCanvasSize({
          width: calculatedWidth,
          height: fixedHeight,
        });
      };
    }
    // If image is already loaded, render everything
    else if (imageLoaded && imageRef.current) {
      const image = imageRef.current;

      // Set canvas dimensions to match our state
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      // Calculate scaling factors - based on the reference dimensions
      // rather than the image's natural dimensions
      const scaleX = canvasSize.width / REFERENCE_WIDTH;
      const scaleY = canvasSize.height / REFERENCE_HEIGHT;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the image properly sized
      ctx.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);

      // Draw the path with scaled coordinates
      if (path && path.length > 1) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.beginPath();
        path.forEach((nodeId, i) => {
          const node = nodesTerminal[nodeId];
          if (!node) return;
          if (i === 0) {
            ctx.moveTo(node.x * scaleX, node.y * scaleY);
          } else {
            ctx.lineTo(node.x * scaleX, node.y * scaleY);
          }
        });
        ctx.stroke();
      }

      // Draw debug points with scaled coordinates
      //   if (debugPointsTerminal && debugPointsTerminal.length) {
      //     debugPointsTerminal.forEach((point) => {
      //       ctx.beginPath();
      //       ctx.arc(point.x * scaleX, point.y * scaleY, 5, 0, 2 * Math.PI);
      //       ctx.fillStyle = "red";
      //       ctx.fill();

      //       ctx.font = "12px Arial";
      //       ctx.fillStyle = "black";
      //       ctx.fillText(point.id, point.x * scaleX + 8, point.y * scaleY - 8);
      //     });
      //   }
    }

    // Add click event
    const handleClick = (e) => {
      if (!imageLoaded || !imageRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert to original reference coordinates for consistency
      const scaleX = canvasSize.width / REFERENCE_WIDTH;
      const scaleY = canvasSize.height / REFERENCE_HEIGHT;

      const originalX = x / scaleX;
      const originalY = y / scaleY;

      console.log(`Clicked at: x=${x.toFixed(0)}, y=${y.toFixed(0)}`);
      console.log(
        `Original coordinates: x=${originalX.toFixed(0)}, y=${originalY.toFixed(
          0
        )}`
      );
    };

    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [imageSrc, path, terminal, canvasSize, imageLoaded]);

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          objectFit: "contain",
        }}
      />
    </div>
  );
}
