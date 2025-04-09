import React, { useEffect, useRef } from "react";
import { stops, debugPoints } from "../data/stops"; // assuming debugPoints are also in stops.js
import airportImg from "../assets/airport_full.png";
import { nodes } from "../data/stops"; // nodes should be an object: { P1: {x, y}, ... }

export default function AirportMapCanvas({ path }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const image = new Image();
    image.src = airportImg;
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);

      // ✅ Set line style before drawing path
      if (path.length > 1) {
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 4;
        ctx.beginPath();
        path.forEach((nodeId, i) => {
          const node = nodes[nodeId];
          if (!node) return;
          if (i === 0) {
            ctx.moveTo(node.x, node.y);
          } else {
            ctx.lineTo(node.x, node.y);
          }
        });
        ctx.stroke();
      }

      // ✅ Draw debug points AFTER image and path are drawn
      debugPoints.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();

        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(point.id, point.x + 8, point.y - 8);
      });
    };
  }, [path]);

  return <canvas ref={canvasRef} width={1000} height={700} />;
}
