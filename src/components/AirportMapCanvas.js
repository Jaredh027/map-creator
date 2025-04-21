import React, { useEffect, useRef, useState } from "react";
import { stopToNode, nodes } from "../data/stops";
import airportImg from "../assets/airport_full.png";

// Define a list of colors to cycle through for segments.
const PATH_COLORS = [
  "#FF5252", // Red
  "#FF9800", // Orange
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#9C27B0", // Purple
  "#E91E63", // Pink
];

const OFFSET = 4; // Fixed offset distance for non-stop nodes

// Helper: Compute the normalized vector from point p1 to p2.
function getNormalizedVector(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  return { x: dx / len, y: dy / len, length: len };
}

// Helper: Get a perpendicular offset vector scaled by offsetDistance.
function getPerpendicularOffset(vec, offsetDistance) {
  // For a vector (dx, dy), a perpendicular vector is (-dy, dx)
  return { x: -vec.y * offsetDistance, y: vec.x * offsetDistance };
}

// Helper: Compute the intersection of two lines defined by (p1 -> p2) and (p3 -> p4).
// Returns null if the lines are parallel.
function getIntersectionPoint(p1, p2, p3, p4) {
  const denominator =
    (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (denominator === 0) return null;
  const t =
    ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) /
    denominator;
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y),
  };
}

// Given the index of a node in the path, compute its drawing coordinate.
// If the node is a designated stop, return its actual coordinate.
// Otherwise, compute a perpendicular offset coordinate (using intersection for interior nodes).
function computePoint(i, path, stopNodeIds) {
  const nodeId = path[i];
  const actual = nodes[nodeId];
  if (!actual) return { x: 0, y: 0 };

  // If the node is a stop, use its actual coordinate.
  if (stopNodeIds.has(nodeId)) {
    return { x: actual.x, y: actual.y };
  }

  // For endpoints, simply offset along the segment.
  if (i === 0) {
    const nextNode = nodes[path[i + 1]];
    if (!nextNode) return { x: actual.x, y: actual.y };
    const vec = getNormalizedVector(actual, nextNode);
    const offset = getPerpendicularOffset(vec, OFFSET);
    return { x: actual.x + offset.x, y: actual.y + offset.y };
  } else if (i === path.length - 1) {
    const prevNode = nodes[path[i - 1]];
    if (!prevNode) return { x: actual.x, y: actual.y };
    const vec = getNormalizedVector(prevNode, actual);
    const offset = getPerpendicularOffset(vec, OFFSET);
    return { x: actual.x + offset.x, y: actual.y + offset.y };
  } else {
    // For intermediate non-stop nodes, use two offset lines and compute their intersection.
    const prevNode = nodes[path[i - 1]];
    const nextNode = nodes[path[i + 1]];
    if (!prevNode || !nextNode) return { x: actual.x, y: actual.y };

    const vecIn = getNormalizedVector(prevNode, actual);
    const vecOut = getNormalizedVector(actual, nextNode);
    const offsetIn = getPerpendicularOffset(vecIn, OFFSET);
    const offsetOut = getPerpendicularOffset(vecOut, OFFSET);

    const line1Start = {
      x: prevNode.x + offsetIn.x,
      y: prevNode.y + offsetIn.y,
    };
    const line1End = { x: actual.x + offsetIn.x, y: actual.y + offsetIn.y };
    const line2Start = { x: actual.x + offsetOut.x, y: actual.y + offsetOut.y };
    const line2End = {
      x: nextNode.x + offsetOut.x,
      y: nextNode.y + offsetOut.y,
    };

    const intersection = getIntersectionPoint(
      line1Start,
      line1End,
      line2Start,
      line2End
    );
    return (
      intersection || {
        x: actual.x + (offsetIn.x + offsetOut.x) / 2,
        y: actual.y + (offsetIn.y + offsetOut.y) / 2,
      }
    );
  }
}

export default function AirportMapCanvas({ path = [], colorArr, stopCount }) {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 500 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Load the airport image if not already loaded.
    if (!imageRef.current) {
      const image = new Image();
      image.src = airportImg;
      image.onload = () => {
        imageRef.current = image;
        setImageLoaded(true);
        // Use a fixed height with proportional width.
        const fixedHeight = 500;
        const aspectRatio = image.width / image.height;
        const calculatedWidth = fixedHeight * aspectRatio;
        setCanvasSize({ width: calculatedWidth, height: fixedHeight });
      };
    } else if (imageLoaded && imageRef.current) {
      const image = imageRef.current;
      // Set canvas dimensions.
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      // Compute scaling factors based on the image's original dimensions.
      const scaleX = canvasSize.width / image.width;
      const scaleY = canvasSize.height / image.height;

      // Clear the canvas and draw the background image.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);

      // Only draw the path if there are at least two nodes.
      if (path && path.length > 1) {
        // Create a set of stop node IDs from the stops data.
        const stopNodeIds = new Set(stopToNode.map((stop) => stop.id));

        // Determine the indices where stops occur in the path.
        let stopIndices = [];
        for (let i = 0; i < path.length; i++) {
          if (stopNodeIds.has(path[i])) {
            stopIndices.push(i);
          }
        }
        // Always include the first and last nodes as stops.
        if (stopIndices.length === 0 || stopIndices[0] !== 0) {
          stopIndices.unshift(0);
        }
        if (stopIndices[stopIndices.length - 1] !== path.length - 1) {
          stopIndices.push(path.length - 1);
        }

        // Draw each segment (from one stop to the next) in reverse order so that
        // the earliest segments are drawn last and appear on top.
        let actualSegLineCount = colorArr.length - 1;
        console.log("stopCount", actualSegLineCount);
        console.log("COLOR ARRAY AIRPORT", colorArr);
        for (let seg = stopIndices.length - 2; seg >= 0; seg--) {
          const segStart = stopIndices[seg];
          const segEnd = stopIndices[seg + 1];
          const segmentPoints = [];

          for (let i = segStart; i <= segEnd; i++) {
            segmentPoints.push(computePoint(i, path, stopNodeIds));
          }
          if (segmentPoints.length > 1) {
            ctx.beginPath();
            ctx.moveTo(
              segmentPoints[0].x * scaleX,
              segmentPoints[0].y * scaleY
            );
            for (let i = 1; i < segmentPoints.length; i++) {
              ctx.lineTo(
                segmentPoints[i].x * scaleX,
                segmentPoints[i].y * scaleY
              );
            }

            console.log(
              actualSegLineCount,
              colorArr[actualSegLineCount],
              PATH_COLORS[colorArr[actualSegLineCount]],
              colorArr
            );
            if (segmentPoints.length <= 2) {
              ctx.strokeStyle = PATH_COLORS[colorArr[actualSegLineCount]];
            } else {
              ctx.strokeStyle = PATH_COLORS[colorArr[actualSegLineCount]];
              actualSegLineCount -= 1;
            }

            ctx.lineWidth = 4;
            ctx.lineJoin = "round";
            ctx.stroke();
          }
        }

        // Finally, draw stop markers so they appear on top.
        stopIndices.forEach((i) => {
          const node = nodes[path[i]];
          if (!node) return;
          // Outer circle.
          ctx.beginPath();
          ctx.arc(node.x * scaleX, node.y * scaleY, 8, 0, 2 * Math.PI);
          ctx.fillStyle = "#333333";
          ctx.fill();
          // Inner circle.
          ctx.beginPath();
          ctx.arc(node.x * scaleX, node.y * scaleY, 6, 0, 2 * Math.PI);
          ctx.fillStyle = "#FFFFFF";
          ctx.fill();
        });
      }
    }

    // Optional: Add a click handler to log the original image coordinates for debugging.
    const handleClick = (e) => {
      if (!imageLoaded || !imageRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
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
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
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
