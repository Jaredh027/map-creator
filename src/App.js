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
import CustomPopup from "./components/CustomPopup";
import CustomButton from "./components/CustomButton";

const PATH_COLORS = [
  "#FF5252", // Red
  "#FF9800", // Orange
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#9C27B0", // Purple
  "#E91E63", // Pink
];

function findPath(nodes, edges, startNode, endNode) {
  // These is are in the form "P8"
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
  if (
    !debugPointsTerminal.find((nodeTerminal) => nodeTerminal.id === endNode)
  ) {
    endNode = startNode[0] + startNode[1] + "P1";
  }

  const queue = [[startNode]];
  const visited = new Set();

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];

    if (current === endNode) return path;

    if (!visited.has(current)) {
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
  const [mainPathColors, setMainPathColors] = useState([]);
  const [subPathColors, setSubPathColors] = useState([]);

  const [screen, setScreen] = useState([true, false, false]); // Fixed screen state initialization
  const [scannedInfo, setScannedInfo] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only proceed if we have nodes to process
    if (!nodes.length || !startNode) return;

    // Build paths across all stops
    let fullPath = [];
    let fullTerminalPath = [];
    let currentStartNode = startNode;

    let mainPathColor = [];
    let subPathColor = [];

    // Process each stop as a waypoint in order
    let colorIndex = 0;
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
          mainPathColor.push(colorIndex);

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
          console.log(
            "Top",
            terminalSegmentPath,
            colorIndex,
            terminalEntryNode.id,
            currentStop.id
          );

          if (terminalSegmentPath.length > 0) {
            subPathColor.push(colorIndex);
            fullTerminalPath = [...fullTerminalPath, ...terminalSegmentPath];
          }

          colorIndex += 1;
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
          console.log(
            "Btm",
            terminalSegmentPath,
            colorIndex,
            terminalEntryNode.id,
            currentStop.id
          );
          subPathColor.push(colorIndex);
          colorIndex += 1;
        }
      }

      // Move to next segment
      currentStartNode = currentStop;
    }

    // Set paths once, after processing all stops
    setPath(fullPath);
    setTerminalPath(fullTerminalPath);
    setMainPathColors(mainPathColor);
    setSubPathColors(subPathColor);
  }, [nodes, startNode]); // Also depend on startNode since it's used in the effect

  useEffect(() => {
    //Setting start stop as Terminal B for now aka the kiosk location
    const startStop = stopToNode.find((s) => s.id === "PSB");
    setStartNode(startStop);
  }, []);

  useEffect(() => {
    if (scannedInfo) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [scannedInfo]);

  const handleScannedBarcode = (information) => {
    setScannedInfo(information);
  };

  const handleYesPopup = () => {
    setScreen([false, true, false]);
    setOpen(false);
  };

  const handleNoPopup = () => {
    setScannedInfo(null);
    setOpen(false);
  };

  const handleBackButton = () => {
    let activeScreenIndex = screen.findIndex((s) => s === true);
    let cpyScreen = [...screen];
    cpyScreen[activeScreenIndex] = false;
    cpyScreen[activeScreenIndex - 1] = true;
    setScreen(cpyScreen);
  };

  return (
    <div
      style={{
        justifyItems: "center",
        alignContent: "center",
        height: "100vh",
      }}
    >
      {screen[0] && (
        <>
          <HomePage
            doneSelecting={setScreen}
            screens={screen}
            setUserInformaiton={handleScannedBarcode}
          />

          {scannedInfo && (
            <CustomPopup
              message={[
                "Is this information correct?",
                "Flight: " + scannedInfo[0],
                "Gate: " + scannedInfo[1],
                "Departure: " + scannedInfo[2],
              ]}
              open={open}
              handleYes={handleYesPopup}
              handleNo={handleNoPopup}
            />
          )}
        </>
      )}
      {screen[1] && (
        <NavPage
          doneSelecting={setScreen}
          screens={screen}
          setNodes={setNodes}
          userInformation={scannedInfo}
        />
      )}
      {screen[2] && (
        <div style={{ justifyItems: "center" }}>
          <h1>Here is a map with your designated stops!</h1>

          <div className="map-container">
            {startNode?.terminal !== endNode?.terminal && (
              <AirportMapCanvas
                path={path}
                colorArr={mainPathColors}
                stopCount={nodes.length - 1}
              />
            )}

            {terminalPath.length > 0 && (
              <TerminalMapCanvas
                terminal={
                  endNode?.terminal ||
                  (nodes.length > 0 ? nodes[nodes.length - 1]?.terminal : null)
                }
                path={terminalPath}
                colorArr={subPathColors}
                stopCount={nodes.length - 1}
              />
            )}
          </div>
          <div style={{ display: "flex", columnGap: "16px" }}>
            <CustomButton
              style={{
                marginTop: "16px",
                color: "white",
                borderColor: "white",
              }}
            >
              Print
            </CustomButton>
            <CustomButton
              style={{
                marginTop: "16px",
                color: "white",
                borderColor: "white",
              }}
            >
              Message
            </CustomButton>
          </div>
        </div>
      )}
      {screen[0] !== true && (
        <div style={{ marginTop: "2rem" }}>
          <CustomButton
            style={{ color: "white", borderColor: "white" }}
            onClick={handleBackButton}
          >
            Back
          </CustomButton>
        </div>
      )}
    </div>
  );
}

export default App;
