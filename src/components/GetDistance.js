import React from "react";
import {
  debugPoints,
  debugPointsTerminal,
  nodes,
  nodesTerminal,
  stopToNode,
} from "../data/stops";

export function GetDistance(edges1, edges2, startNode, endNode) {
  let pathsArr1 = getPaths(edges1, edges2, startNode, endNode);
  let pathsArr2 = getPathsTerminal(edges1, edges2, startNode, endNode);

  console.log("pathsArr1", pathsArr1);
  console.log("pathsArr2", pathsArr2);
  let pointsPath1 = [];
  let pointsPath2 = [];
  pathsArr1.forEach((stop) => {
    if (stop in nodes) {
      pointsPath1.push(nodes[stop]);
    }
  });
  pathsArr2.forEach((stop) => {
    if (stop in nodesTerminal) {
      pointsPath1.push(nodesTerminal[stop]);
    }
  });

  let distance1 = totalPairwiseDistance(pointsPath1);
  let distance2 = totalPairwiseDistance(pointsPath2) / 4;
  return distance1 + distance2;
}

function totalPairwiseDistance(points) {
  console.log(points);
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      total += Math.hypot(dx, dy);
    }
  }
  return Math.ceil(total * 0.0011);
}

function getPaths(edges1, edges2, startNode, endNode) {
  // These is are in the form "P8"
  console.log("startNode 1", startNode);
  console.log("endNode 1", endNode);
  const startNodeAsTerminal = stopToNode.find((s) => s.id === startNode).id;
  console.log("startNodeAsTerminal", startNodeAsTerminal);
  const endNodeAsTerminal = stopToNode.find(
    (s) => s.id === "PS" + endNode.terminal
  ).id;
  console.log("endNodeAsTerminal", endNodeAsTerminal);

  const queue1 = [[startNodeAsTerminal]];
  const visited1 = new Set();

  while (queue1.length > 0) {
    const path = queue1.shift();
    const current = path[path.length - 1];

    if (current === endNodeAsTerminal) return path;

    if (!visited1.has(current)) {
      console.log("current 1", current);
      visited1.add(current);
      const neighbors = edges1[current] || [];
      for (const next of neighbors) {
        queue1.push([...path, next]);
      }
    }
  }
}
function getPathsTerminal(edges1, edges2, startNode, endNode) {
  // startNode 2 T5P1
  // endNode 2 T5S2
  startNode = "T5P1";
  endNode = endNode.id;
  const queue2 = [[startNode]];
  const visited2 = new Set();

  while (queue2.length > 0) {
    // console.log(queue);
    const path = queue2.shift();
    const current = path[path.length - 1];

    if (current === endNode) {
      return path;
    }

    if (!visited2.has(current)) {
      console.log("Current", current);
      visited2.add(current);
      const neighbors = edges2[current] || [];
      for (const next of neighbors) {
        queue2.push([...path, next]);
      }
    }
  }

  return [];
}
