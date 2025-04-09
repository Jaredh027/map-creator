import React, { useEffect, useRef, useState } from "react";
import { stops, debugPoints } from "../data/stops";
import airportImg from "../assets/airport_full.png";
import { nodes } from "../data/stops";

export default function AirportMapCanvas({ path }) {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 500 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Create image if it doesn't exist yet
    if (!imageRef.current) {
      const image = new Image();
      image.src = airportImg;
      image.onload = () => {
        imageRef.current = image;
        setImageLoaded(true);

        // Using a fixed height approach
        const fixedHeight = 500; // Set your desired fixed height here
        const aspectRatio = image.width / image.height;
        const calculatedWidth = fixedHeight * aspectRatio;

        setCanvasSize({
          width: calculatedWidth,
          height: fixedHeight,
        });
      };
    }
    // If image is already loaded, render everything
    else if (imageLoaded) {
      const image = imageRef.current;

      // Set canvas dimensions to match our state
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      // Calculate scaling factors
      const scaleX = canvasSize.width / image.width;
      const scaleY = canvasSize.height / image.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the image properly sized
      ctx.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);

      // Draw the path with scaled coordinates
      if (path.length > 1) {
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 4;
        ctx.beginPath();
        path.forEach((nodeId, i) => {
          const node = nodes[nodeId];
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
      //   debugPoints.forEach((point) => {
      //     ctx.beginPath();
      //     ctx.arc(point.x * scaleX, point.y * scaleY, 5, 0, 2 * Math.PI);
      //     ctx.fillStyle = "blue";
      //     ctx.fill();

      //     ctx.font = "12px Arial";
      //     ctx.fillStyle = "black";
      //     ctx.fillText(point.id, point.x * scaleX + 8, point.y * scaleY - 8);
      //   });
    }
  }, [path, canvasSize, imageLoaded]);

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
