import React, { useState, useEffect } from "react";
import {
  debugPointsTerminal,
  edgesTerminal,
  stops,
  stopToNodeTerminal,
} from "./data/stops";
import StopSelector from "./components/StopSelector";
import AirportMapCanvas from "./components/AirportMapCanvas";
import TerminalMapCanvas from "./components/TerminalMapCanvas";
import { debugPoints } from "./data/stops";
import { edges } from "./data/stops";
import { stopToNode } from "./data/stops";
import { nodes } from "./data/stops";

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
  console.log(startNode);
  console.log(endNode);
  const queue = [[startNode]];
  const visited = new Set();

  while (queue.length > 0) {
    console.log(queue);
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
  const [startNode, setStartNode] = useState("");
  const [endNode, setEndNode] = useState("");
  const [path, setPath] = useState([]);
  const [terminalPath, setTerminalPath] = useState([]);

  useEffect(() => {
    if (startNode && endNode) {
      let newStartNode = startNode.id;
      if (startNode?.terminal !== endNode?.terminal) {
        const newPath = findPath(nodes, edges, startNode, endNode);
        setPath(newPath);

        // Since we are starting outside terminal start node is located at the entrance of terminal
        newStartNode = debugPointsTerminal.find(
          (s) => s.id === "T" + endNode?.terminal + "P1"
        ).id;
      }
      //For case where starting point is terminal 5 aka right outside of it
      if (
        startNode?.terminal === endNode?.terminal &&
        startNode.name === "Terminal " + startNode.terminal
      ) {
        newStartNode = debugPointsTerminal.find(
          (s) => s.id === "T" + endNode?.terminal + "P1"
        ).id;
      }
      const newTerminalPath = findPathTerminal(
        nodes,
        edgesTerminal,
        newStartNode,
        endNode.id
      );
      setTerminalPath(newTerminalPath);
    } else {
      setPath([]);
    }
  }, [startNode, endNode]);

  return (
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

        <div>
          <h3>Zoomed into Terminal {endNode?.terminal}</h3>
          <TerminalMapCanvas terminal={endNode?.terminal} path={terminalPath} />
        </div>
      </div>
    </div>
  );
}

export default App;
