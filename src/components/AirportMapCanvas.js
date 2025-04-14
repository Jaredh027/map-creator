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
        // Create a map to track edges (pairs of nodes)
        const edgeMap = new Map();

        // Create a unique key for each edge
        const getEdgeKey = (node1, node2) => {
          return node1 < node2 ? `${node1}-${node2}` : `${node2}-${node1}`;
        };

        // Count edge occurrences
        for (let i = 0; i < path.length - 1; i++) {
          const currentNode = path[i];
          const nextNode = path[i + 1];
          const edgeKey = getEdgeKey(currentNode, nextNode);

          edgeMap.set(edgeKey, (edgeMap.get(edgeKey) || 0) + 1);
        }

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
        // Draw bidirectional segments - only edges that appear multiple times
        ctx.strokeStyle = "purple";
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = 0; i < path.length - 1; i++) {
          const currentNode = path[i];
          const nextNode = path[i + 1];
          const edgeKey = getEdgeKey(currentNode, nextNode);

          // Only draw offset lines for edges that appear more than once
          if (edgeMap.get(edgeKey) > 1) {
            const currentNodeData = nodes[currentNode];
            const nextNodeData = nodes[nextNode];

            if (!currentNodeData || !nextNodeData) continue;

            // Need to track if we've drawn this edge already to avoid duplicates
            // We'll use a simple approach: only draw if this is the first occurrence
            // of the edge in the path
            let firstOccurrence = true;
            for (let j = 0; j < i; j++) {
              if (getEdgeKey(path[j], path[j + 1]) === edgeKey) {
                firstOccurrence = false;
                break;
              }
            }

            if (firstOccurrence) {
              // Calculate the perpendicular offset
              const dx = nextNodeData.x - currentNodeData.x;
              const dy = nextNodeData.y - currentNodeData.y;
              const length = Math.sqrt(dx * dx + dy * dy);

              if (length > 0) {
                // Normalized perpendicular vector (90 degrees rotation)
                const perpX = -dy / length;
                const perpY = dx / length;

                // Offset amount
                const offset = 8; // Pixels offset

                // Draw the offset line

                const startX = (currentNodeData.x + perpX * offset) * scaleX;
                const startY = (currentNodeData.y + perpY * offset) * scaleY;
                const endX = (nextNodeData.x + perpX * offset) * scaleX;
                const endY = (nextNodeData.y + perpY * offset) * scaleY;

                if (i === 0) {
                  ctx.moveTo(startX, startY);
                }
                ctx.lineTo(endX, endY);
              }
              ctx.stroke();
            }
          }
        }
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
