import React, { useState, useEffect } from "react";
import { stops } from "./data/stops";
import StopSelector from "./components/StopSelector";
import AirportMapCanvas from "./components/AirportMapCanvas";
import TerminalMapCanvas from "./components/TerminalMapCanvas";
import { debugPoints } from "./data/stops";
import { edges } from "./data/stops";
import { stopToNode } from "./data/stops";
import { nodes } from "./data/stops";

function findPath(nodes, edges, startNode, endNode) {
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

  useEffect(() => {
    if (startNode && endNode) {
      const newPath = findPath(nodes, edges, startNode, endNode);
      setPath(newPath);
    } else {
      setPath([]);
    }
  }, [startNode, endNode]);

  const endStop = stopToNode.find((s) => s.id === endNode);
  const startStop = stopToNode.find((s) => s.id === startNode);
  const shouldZoom = endStop && startStop && endStop.name !== startStop.name;

  return (
    <div>
      <h1>Airport Map App</h1>
      <StopSelector
        stops={stopToNode}
        onSelectStart={setStartNode}
        onSelectEnd={setEndNode}
      />
      <div className="map-container">
        <AirportMapCanvas path={path} />
        {true && (
          <div>
            <h3>Zoomed into Terminal {"Terminal B"}</h3>
            <TerminalMapCanvas terminal={"Terminal 1"} path={path} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
