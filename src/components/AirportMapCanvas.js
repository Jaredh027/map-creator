import React, { useEffect, useRef, useState } from "react";
import { stops, debugPoints } from "../data/stops";
import airportImg from "../assets/airport_full.png";
import { nodes } from "../data/stops";

export default function AirportMapCanvas({ path = [] }) {
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
    else if (imageLoaded && imageRef.current) {
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
      if (path && path.length > 1) {
        // Create a map to track bidirectional edges
        const edgeMap = new Map();

        // Create a unique key for each edge
        const getEdgeKey = (node1, node2) => {
          return node1 < node2 ? `${node1}-${node2}` : `${node2}-${node1}`;
        };

        // First pass: count edge occurrences
        for (let i = 0; i < path.length - 1; i++) {
          const currentNode = path[i];
          const nextNode = path[i + 1];
          const edgeKey = getEdgeKey(currentNode, nextNode);

          edgeMap.set(edgeKey, (edgeMap.get(edgeKey) || 0) + 1);
        }

        // Draw the main path in blue
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

        // Find bidirectional segments in the path
        const bidirectionalSegments = [];
        let currentSegment = [];

        for (let i = 0; i < path.length - 1; i++) {
          const currentNode = path[i];
          const nextNode = path[i + 1];
          const edgeKey = getEdgeKey(currentNode, nextNode);

          if (edgeMap.get(edgeKey) > 1) {
            // If we're starting a new segment
            if (currentSegment.length === 0) {
              currentSegment.push(currentNode);
            }
            currentSegment.push(nextNode);
          } else if (currentSegment.length > 0) {
            // End of a bidirectional segment
            bidirectionalSegments.push([...currentSegment]);
            currentSegment = [];
          }
        }

        // Add the last segment if it exists
        if (currentSegment.length > 0) {
          bidirectionalSegments.push([...currentSegment]);
        }

        // Draw each bidirectional segment as a continuous purple path
        ctx.strokeStyle = "purple";
        ctx.lineWidth = 4;

        // Constant offset distance
        const OFFSET = 8;

        bidirectionalSegments.forEach((segment) => {
          if (segment.length < 2) return;

          ctx.beginPath();

          // For each node in the segment
          for (let i = 0; i < segment.length; i++) {
            const nodeId = segment[i];
            const node = nodes[nodeId];
            if (!node) continue;

            // Calculate offset based on neighboring points
            let offsetX = 0;
            let offsetY = 0;

            if (i === 0) {
              // First node - use direction to next node
              const nextNode = nodes[segment[i + 1]];
              if (nextNode) {
                const dx = nextNode.x - node.x;
                const dy = nextNode.y - node.y;
                const length = Math.sqrt(dx * dx + dy * dy);

                // Perpendicular vector
                offsetX = (-dy / length) * OFFSET;
                offsetY = (dx / length) * OFFSET;
              }
            } else if (i === segment.length - 1) {
              // Last node - use direction from previous node
              const prevNode = nodes[segment[i - 1]];
              if (prevNode) {
                const dx = node.x - prevNode.x;
                const dy = node.y - prevNode.y;
                const length = Math.sqrt(dx * dx + dy * dy);

                // Perpendicular vector
                offsetX = (-dy / length) * OFFSET;
                offsetY = (dx / length) * OFFSET;
              }
            } else {
              // Middle node - average direction from prev to next
              const prevNode = nodes[segment[i - 1]];
              const nextNode = nodes[segment[i + 1]];

              if (prevNode && nextNode) {
                // Vector from prev to current
                const dx1 = node.x - prevNode.x;
                const dy1 = node.y - prevNode.y;
                const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

                // Vector from current to next
                const dx2 = nextNode.x - node.x;
                const dy2 = nextNode.y - node.y;
                const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                // Normalized vectors
                const nx1 = dx1 / len1;
                const ny1 = dy1 / len1;
                const nx2 = dx2 / len2;
                const ny2 = dy2 / len2;

                // Perpendicular vectors
                const px1 = -ny1;
                const py1 = nx1;
                const px2 = -ny2;
                const py2 = nx2;

                // Average of the perpendicular vectors
                const avgPx = (px1 + px2) / 2;
                const avgPy = (py1 + py2) / 2;
                const avgLength = Math.sqrt(avgPx * avgPx + avgPy * avgPy);

                // Normalize and apply offset
                offsetX = (avgPx / avgLength) * OFFSET;
                offsetY = (avgPy / avgLength) * OFFSET;
              }
            }

            const finalX = (node.x + offsetX) * scaleX;
            const finalY = (node.y + offsetY) * scaleY;

            if (i === 0) {
              ctx.moveTo(finalX, finalY);
            } else {
              ctx.lineTo(finalX, finalY);
            }
          }

          ctx.stroke();
        });
      }

      // Draw debug points if needed
      /*
      if (debugPoints && debugPoints.length) {
        debugPoints.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x * scaleX, point.y * scaleY, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "blue";
          ctx.fill();

          ctx.font = "12px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(point.id, point.x * scaleX + 8, point.y * scaleY - 8);
        });
      }
      */
    }

    // Add click handler for debugging
    const handleClick = (e) => {
      if (!imageLoaded || !imageRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert to original image coordinates
      const scaleX = canvasSize.width / imageRef.current.width;
      const scaleY = canvasSize.height / imageRef.current.height;

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
