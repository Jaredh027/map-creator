import React, { useEffect, useRef, useState } from "react";
import { nodesTerminal } from "../data/stops";
import { stopToNodeTerminal } from "../data/stops";

// Define a list of colors to cycle through
const PATH_COLORS = [
  "#FF5252", // Red
  "#FF9800", // Orange
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#9C27B0", // Purple
  "#E91E63", // Pink
];

export default function TerminalMapCanvas({ terminal, path = [] }) {
  const canvasRef = useRef(null);
  const imageSrc =
    terminal === "A"
      ? require("../assets/terminal_A.png")
      : require("../assets/terminal_B.png");
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 700 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  const currentTerminalRef = useRef(terminal);

  // Reference dimensions for coordinate scaling
  const REFERENCE_WIDTH = 439;
  const REFERENCE_HEIGHT = 700;

  console.log("Path to render:", path);

  // Create a set of stop node IDs for faster lookups
  const stopNodeIds = new Set(stopToNodeTerminal.map((stop) => stop.id));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Check if terminal changed
    const terminalChanged = currentTerminalRef.current !== terminal;
    currentTerminalRef.current = terminal;

    // Load new image if needed
    if (!imageRef.current || terminalChanged) {
      if (terminalChanged) {
        setImageLoaded(false);
      }

      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        imageRef.current = image;
        setImageLoaded(true);

        // Fixed height of 500px with proportional width
        const fixedHeight = 500;
        const aspectRatio = image.width / image.height;
        const calculatedWidth = fixedHeight * aspectRatio;

        setCanvasSize({
          width: calculatedWidth,
          height: fixedHeight,
        });
      };
    } else if (imageLoaded && imageRef.current) {
      const image = imageRef.current;

      // Set canvas dimensions
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      // Calculate scaling factors
      const scaleX = canvasSize.width / REFERENCE_WIDTH;
      const scaleY = canvasSize.height / REFERENCE_HEIGHT;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the terminal map image
      ctx.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);

      // Draw the path with color changes at stop nodes
      if (path && path.length > 1) {
        // Create an edge map to track segment occurrences
        const edgeMap = new Map();

        // Create a unique key for each edge
        const getEdgeKey = (node1, node2) => {
          return node1 < node2 ? `${node1}-${node2}` : `${node2}-${node1}`;
        };

        // First pass: identify all segments and count occurrences
        for (let i = 0; i < path.length - 1; i++) {
          const currentNode = path[i];
          const nextNode = path[i + 1];
          const edgeKey = getEdgeKey(currentNode, nextNode);

          // Track both the count and the original order in the path
          if (!edgeMap.has(edgeKey)) {
            edgeMap.set(edgeKey, {
              count: 1,
              pairs: [{ from: currentNode, to: nextNode, index: i }],
            });
          } else {
            const edgeData = edgeMap.get(edgeKey);
            edgeData.count += 1;
            edgeData.pairs.push({ from: currentNode, to: nextNode, index: i });
            edgeMap.set(edgeKey, edgeData);
          }
        }

        // Identify bidirectional edges
        const bidirectionalEdges = new Array();
        for (const [key, data] of edgeMap.entries()) {
          if (data.count > 1) {
            bidirectionalEdges.push({
              key,
              pairs: data.pairs,
            });
          }
        }

        // Log for debugging
        console.log("Bidirectional edges:", bidirectionalEdges);

        // Find all stop node indices in the path
        const stopNodeIndices = [];
        path.forEach((nodeId, index) => {
          if (stopNodeIds.has(nodeId)) {
            stopNodeIndices.push(index);
          }
        });

        // Add starting point to segments if it's not already a stop node
        if (stopNodeIndices.length === 0 || stopNodeIndices[0] !== 0) {
          stopNodeIndices.unshift(0);
        }

        // Add ending point to segments if it's not already a stop node
        if (stopNodeIndices[stopNodeIndices.length - 1] !== path.length - 1) {
          stopNodeIndices.push(path.length - 1);
        }

        // Set up path rendering
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Step 1: Draw main path with color changes at stop nodes
        // for (let segIdx = 0; segIdx < stopNodeIndices.length - 1; segIdx++) {
        //   const startIdx = stopNodeIndices[segIdx];
        //   const endIdx = stopNodeIndices[segIdx + 1];
        //   const colorIdx = segIdx % PATH_COLORS.length;

        //   ctx.beginPath();

        //   // Get first node in segment
        //   const firstNode = nodesTerminal[path[startIdx]];
        //   if (!firstNode) continue;

        //   ctx.moveTo(firstNode.x * scaleX, firstNode.y * scaleY);

        //   // Draw all intermediate points
        //   for (let j = startIdx + 1; j <= endIdx; j++) {
        //     const nodeId = path[j];
        //     const node = nodesTerminal[nodeId];
        //     if (!node) continue;

        //     ctx.lineTo(node.x * scaleX, node.y * scaleY);
        //   }

        //   ctx.strokeStyle = PATH_COLORS[colorIdx];
        //   ctx.stroke();
        // }

        // Step 2: Draw bidirectional segments with offset
        // Use a fixed offset distance from the original path
        const OFFSET = 6;

        // Draw each bidirectional edge with offset
        bidirectionalEdges.forEach((edge) => {
          // For each pair of nodes in this bidirectional edge
          edge.pairs.forEach((pair) => {
            const fromNode = nodesTerminal[pair.from];
            const toNode = nodesTerminal[pair.to];

            if (!fromNode || !toNode) return;

            // Calculate which segment (between stop nodes) this edge belongs to
            let segmentIndex = 0;
            for (let i = 0; i < stopNodeIndices.length - 1; i++) {
              if (
                pair.index >= stopNodeIndices[i] &&
                pair.index < stopNodeIndices[i + 1]
              ) {
                segmentIndex = i;
                break;
              }
            }

            // Get the color for this segment
            const colorIdx = segmentIndex % PATH_COLORS.length;

            // Calculate direction vector
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const length = Math.sqrt(dx * dx + dy * dy);

            if (length === 0) return;

            // Calculate perpendicular offset
            const offsetX = (-dy / length) * OFFSET;
            const offsetY = (dx / length) * OFFSET;

            // Draw offset line
            ctx.beginPath();
            ctx.moveTo(
              (fromNode.x + offsetX) * scaleX,
              (fromNode.y + offsetY) * scaleY
            );
            ctx.lineTo(
              (toNode.x + offsetX) * scaleX,
              (toNode.y + offsetY) * scaleY
            );

            // Use dashed line for bidirectional segments
            ctx.setLineDash([8, 4]);
            ctx.strokeStyle = PATH_COLORS[colorIdx];
            ctx.lineWidth = 5; // Slightly thinner line for the offset path
            ctx.stroke();

            // Reset line style
            ctx.setLineDash([]);
            ctx.lineWidth = 5;
          });
        });

        // Draw nodes
        // path.forEach((nodeId) => {
        //   const node = nodesTerminal[nodeId];
        //   if (!node) return;

        //   // Special visualization for stop nodes
        //   if (stopNodeIds.has(nodeId)) {
        //     // Draw larger indicator for stop nodes
        //     ctx.beginPath();
        //     ctx.arc(node.x * scaleX, node.y * scaleY, 8, 0, 2 * Math.PI);
        //     ctx.fillStyle = "#333333";
        //     ctx.fill();

        //     ctx.beginPath();
        //     ctx.arc(node.x * scaleX, node.y * scaleY, 6, 0, 2 * Math.PI);
        //     ctx.fillStyle = "#FFFFFF";
        //     ctx.fill();

        //     // Find which segment this stop corresponds to
        //     const nodeIndex = path.indexOf(nodeId);
        //     const segmentIndex = stopNodeIndices.indexOf(nodeIndex);

        //     ctx.beginPath();
        //     ctx.arc(node.x * scaleX, node.y * scaleY, 4, 0, 2 * Math.PI);
        //     // Use the segment color
        //     ctx.fillStyle =
        //       PATH_COLORS[Math.max(0, segmentIndex - 1) % PATH_COLORS.length];
        //     ctx.fill();
        //   } else {
        //     // Standard node visualization
        //     ctx.beginPath();
        //     ctx.arc(node.x * scaleX, node.y * scaleY, 4, 0, 2 * Math.PI);
        //     ctx.fillStyle = "#333333";
        //     ctx.fill();

        //     ctx.beginPath();
        //     ctx.arc(node.x * scaleX, node.y * scaleY, 2, 0, 2 * Math.PI);
        //     ctx.fillStyle = "#FFFFFF";
        //     ctx.fill();
        //   }
        // });
      }
    }

    // Add click handler for debugging
    const handleClick = (e) => {
      if (!imageLoaded || !imageRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert to original reference coordinates
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
  }, [imageSrc, path, terminal, canvasSize, imageLoaded, stopToNodeTerminal]);

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
