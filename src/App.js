import React, { useState, useEffect } from "react";
import {
  debugPointsTerminal,
  edgesTerminal,
  nodesTerminal,
  stopToNodeTerminal,
} from "./data/stops";
import StopSelector from "./components/StopSelector";
import AirportMapCanvas from "./components/AirportMapCanvas";
import TerminalMapCanvas from "./components/TerminalMapCanvas";
import { edges } from "./data/stops";
import { stopToNode } from "./data/stops";
import { nodes } from "./data/stops";
import "./App.css";
import HomePage from "./screens/HomePage";
import NavPage from "./screens/NavPage";
import BarcodeScanner from "./components/BarcodeScanner";

function findPath(nodes, edges, startNode, endNode) {
  // These is are in the form "P8"
  console.log("startNode 1", startNode);
  console.log("endNode 1", endNode);
  const startNodeAsTerminal = stopToNode.find(
    (s) => s.name === "Terminal " + startNode.terminal
  ).id;
  const endNodeAsTerminal = stopToNode.find(
    (s) => s.name === "Terminal " + endNode.terminal
  ).id;

  const queue = [[startNodeAsTerminal]];
  const visited = new Set();

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];

    if (current === endNodeAsTerminal) return path;

    if (!visited.has(current)) {
      console.log("current 1", current);
      visited.add(current);
      const neighbors = edges[current] || [];
      for (const next of neighbors) {
        queue.push([...path, next]);
      }
    }
  }

  return [];
}

function findPathTerminal(nodes, edges, startNode, endNode) {
  console.log("startNode 2", startNode);
  console.log("endNode 2", endNode);
  if (
    !debugPointsTerminal.find((nodeTerminal) => nodeTerminal.id === endNode)
  ) {
    endNode = startNode[0] + startNode[1] + "P1";
  }
  const queue = [[startNode]];
  const visited = new Set();

  while (queue.length > 0) {
    // console.log(queue);
    const path = queue.shift();
    const current = path[path.length - 1];

    if (current === endNode) return path;

    if (!visited.has(current)) {
      console.log("Current", current);
      visited.add(current);
      const neighbors = edges[current] || [];
      for (const next of neighbors) {
        queue.push([...path, next]);
      }
    }
  }

  return [];
}

function App() {
  const [startNode, setStartNode] = useState(null); // Setting as Terminal B for kiosk location for now
  const [endNode, setEndNode] = useState("");
  const [nodes, setNodes] = useState([]);
  const [path, setPath] = useState([]);
  const [terminalPath, setTerminalPath] = useState([]);

  const [screen, setScreen] = useState([true, false, false]); // Fixed screen state initialization

  useEffect(() => {
    console.log("nodes", nodes);

    // Only proceed if we have nodes to process
    if (!nodes.length || !startNode) return;

    // Build paths across all stops
    let fullPath = [];
    let fullTerminalPath = [];
    let currentStartNode = startNode;

    // Process each stop as a waypoint in order
    for (let i = 0; i < nodes.length; i++) {
      const currentStop = nodes[i];

      if (currentStartNode && currentStop) {
        // Handle terminal to terminal travel
        if (currentStartNode?.terminal !== currentStop?.terminal) {
          const segmentPath = findPath(
            nodes,
            edges,
            currentStartNode,
            currentStop
          );
          fullPath = [...fullPath, ...segmentPath];

          // Select the appropriate terminal entry point
          let terminalEntryNode;
          if (
            currentStartNode.type === "Terminal" &&
            currentStop.type !== "Terminal"
          ) {
            terminalEntryNode = debugPointsTerminal.find(
              (s) => s.id === "T" + currentStop?.terminal + "P1"
            );
          } else if (
            currentStartNode?.terminal === currentStop?.terminal &&
            currentStartNode.name === "Terminal " + currentStartNode.terminal
          ) {
            terminalEntryNode = debugPointsTerminal.find(
              (s) => s.id === "T" + currentStop?.terminal + "P1"
            );
          } else {
            terminalEntryNode = currentStartNode;
          }

          // Find path in terminal
          const terminalSegmentPath = findPathTerminal(
            nodes,
            edgesTerminal,
            terminalEntryNode.id,
            currentStop.id
          );

          fullTerminalPath = [...fullTerminalPath, ...terminalSegmentPath];
        } else {
          // Same terminal navigation
          let terminalEntryNode;

          // Check if we're coming from outside the terminal
          if (
            currentStartNode.name ===
            "Terminal " + currentStartNode.terminal
          ) {
            terminalEntryNode = debugPointsTerminal.find(
              (s) => s.id === "T" + currentStop?.terminal + "P1"
            );
          } else {
            terminalEntryNode = currentStartNode;
          }

          // Find path within the terminal
          const terminalSegmentPath = findPathTerminal(
            nodes,
            edgesTerminal,
            terminalEntryNode.id,
            currentStop.id
          );

          fullTerminalPath = [...fullTerminalPath, ...terminalSegmentPath];
        }
      }

      // Move to next segment
      currentStartNode = currentStop;
    }

    // Set paths once, after processing all stops
    setPath(fullPath);
    setTerminalPath(fullTerminalPath);
  }, [nodes, startNode]); // Also depend on startNode since it's used in the effect

  useEffect(() => {
    //Setting start stop as Terminal B for now aka the kiosk location
    const startStop = stopToNode.find((s) => s.id === "PSB");
    setStartNode(startStop);
  }, []);

  return (
    <div>
      {screen[0] && (
        <>
          <HomePage doneSelecting={setScreen} screens={screen} />
          <BarcodeScanner />
        </>
      )}
      {screen[1] && (
        <NavPage
          doneSelecting={setScreen}
          screens={screen}
          setNodes={setNodes}
        />
      )}
      {screen[2] && (
        <div>
          <h1>Airport Map App</h1>
          <StopSelector
            terminals={stopToNode}
            otherStops={stopToNodeTerminal}
            onSelectStart={setStartNode}
            onSelectEnd={setEndNode}
          />
          <div className="map-container">
            {startNode?.terminal !== endNode?.terminal && (
              <AirportMapCanvas path={path} />
            )}

            <TerminalMapCanvas
              terminal={
                endNode?.terminal ||
                (nodes.length > 0 ? nodes[nodes.length - 1]?.terminal : null)
              }
              path={terminalPath}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
