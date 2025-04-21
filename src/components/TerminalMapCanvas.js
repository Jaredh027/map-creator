import React, { useEffect, useRef, useState } from "react";
import { nodesTerminal } from "../data/stops";
import { stopToNodeTerminal } from "../data/stops";

// Define a list of colors to cycle through for segments.
const PATH_COLORS = [
  "#FF5252", // Red
  "#FF9800", // Orange
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#9C27B0", // Purple
  "#E91E63", // Pink
];

const OFFSET = 6; // Fixed offset for non-stop nodes

// Helper: Compute the normalized vector (with magnitude) from p1 to p2.
function getNormalizedVector(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  return { x: dx / len, y: dy / len, length: len };
}

// Helper: Get a perpendicular offset vector scaled by offsetDistance.
// For vector (dx, dy), a perpendicular is (-dy, dx).
function getPerpendicularOffset(vec, offsetDistance) {
  return { x: -vec.y * offsetDistance, y: vec.x * offsetDistance };
}

// Helper: Compute the intersection of two lines defined by (p1->p2) and (p3->p4).
// Returns null if the lines are parallel.
function getIntersectionPoint(p1, p2, p3, p4) {
  const denominator =
    (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (denominator === 0) return null; // lines are parallel
  const t =
    ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) /
    denominator;
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y),
  };
}

// Given the index of a node within a segment, compute its drawn position.
// For nodes that are designated as stops, we use the actual coordinate so that
// the colored line touches the stop. For non-stop nodes, we compute an offset.
function computePoint(i, path, stopNodeIds) {
  const nodeId = path[i];
  const actual = nodesTerminal[nodeId];
  // If the node is a stop, always use its actual coordinate.
  if (stopNodeIds.has(nodeId)) {
    return { x: actual.x, y: actual.y };
  }
  // For endpoints, offset based on the adjacent segment.
  if (i === 0) {
    // console.log("PATH I+1", path[i + 1]);
    const nextNode = nodesTerminal[path[i + 1]];
    if (!nextNode) return { x: actual.x, y: actual.y };
    const vec = getNormalizedVector(actual, nextNode);
    const offset = getPerpendicularOffset(vec, OFFSET);
    return { x: actual.x + offset.x, y: actual.y + offset.y };
  } else if (i === path.length - 1) {
    const prevNode = nodesTerminal[path[i - 1]];
    if (!prevNode) return { x: actual.x, y: actual.y };
    const vec = getNormalizedVector(prevNode, actual);
    const offset = getPerpendicularOffset(vec, OFFSET);
    return { x: actual.x + offset.x, y: actual.y + offset.y };
  } else {
    // For interior nodes that are not stops, compute an intersection of offset lines.
    const prevNode = nodesTerminal[path[i - 1]];
    const nextNode = nodesTerminal[path[i + 1]];
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

export default function TerminalMapCanvas({
  terminal,
  path = [],
  colorArr,
  stopCount,
}) {
  const canvasRef = useRef(null);
  const imageSrc =
    terminal === "A"
      ? require("../assets/terminal_A.png")
      : require("../assets/terminal_B.png");
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 700 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  const currentTerminalRef = useRef(terminal);

  // Reference dimensions for coordinate scaling.
  const REFERENCE_WIDTH = 439;
  const REFERENCE_HEIGHT = 700;

  // Create a set of stop node IDs for quick lookup.
  const stopNodeIds = new Set(stopToNodeTerminal.map((stop) => stop.id));

  // console.log("PATH", path);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Check if the terminal has changed.
    const terminalChanged = currentTerminalRef.current !== terminal;
    currentTerminalRef.current = terminal;

    // Load new image if needed.
    if (!imageRef.current || terminalChanged) {
      if (terminalChanged) {
        setImageLoaded(false);
      }
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        imageRef.current = image;
        setImageLoaded(true);
        // Fixed display height with proportional width.
        const fixedHeight = 500;
        const aspectRatio = image.width / image.height;
        const calculatedWidth = fixedHeight * aspectRatio;
        setCanvasSize({ width: calculatedWidth, height: fixedHeight });
      };
    } else if (imageLoaded && imageRef.current) {
      // Set canvas dimensions and compute scaling factors.
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const scaleX = canvasSize.width / REFERENCE_WIDTH;
      const scaleY = canvasSize.height / REFERENCE_HEIGHT;

      // Clear and redraw background image.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        imageRef.current,
        0,
        0,
        canvasSize.width,
        canvasSize.height
      );

      if (path && path.length > 1) {
        // Determine indices where stops occur.
        const stopIndices = [];
        for (let i = 0; i < path.length; i++) {
          if (stopNodeIds.has(path[i])) {
            stopIndices.push(i);
          }
        }
        // Ensure the first and last nodes are considered stops.
        if (stopIndices.length === 0 || stopIndices[0] !== 0) {
          stopIndices.unshift(0);
        }
        if (stopIndices[stopIndices.length - 1] !== path.length - 1) {
          stopIndices.push(path.length - 1);
        }

        // Draw each segment between stops in reverse order so that
        // the earliest segments (first paths) are drawn last and appear on top.
        let actualSegLineCount = colorArr.length - 1;
        console.log("stopCount", actualSegLineCount);
        console.log("COLOR ARRAY TERMINAL", colorArr);
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
              colorArr,
              segmentPoints
            );
            if (segmentPoints.length <= 2) {
              ctx.strokeStyle = PATH_COLORS[colorArr[actualSegLineCount]];
            } else {
              ctx.strokeStyle = PATH_COLORS[colorArr[actualSegLineCount]];
              actualSegLineCount -= 1;
            }

            ctx.lineWidth = 5;
            ctx.lineJoin = "round";
            ctx.stroke();
          }
        }

        // Draw stop markers (always on top).
        let index2 = 0;
        stopIndices.forEach((i, index) => {
          const node = nodesTerminal[path[i]];
          console.log("nodesTerminal", node);
          // Outer circle.
          ctx.beginPath();
          ctx.arc(node.x * scaleX, node.y * scaleY, 8, 0, 2 * Math.PI);
          ctx.fillStyle = "#333333";
          ctx.fill();
          // Inner circle.
          ctx.beginPath();
          ctx.arc(node.x * scaleX, node.y * scaleY, 6, 0, 2 * Math.PI);

          if (index === 0) {
            ctx.fillStyle = PATH_COLORS[colorArr[index2]];
            console.log(colorArr, index2, PATH_COLORS[colorArr[index2]]);
          } else {
            ctx.fillStyle = PATH_COLORS[colorArr[index2]];
            if (
              stopIndices[index + 1] &&
              node !== nodesTerminal[path[stopIndices[index + 1]]]
            ) {
              index2 += 1;
            }
          }

          ctx.fill();
        });
      }
    }

    // Optional: Add a click handler to log the map coordinates for debugging.
    const handleClick = (e) => {
      if (!imageLoaded || !imageRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
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
    <div className="flex justify-center w-full">
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
