import React from "react";
import { stopToNode } from "../data/stops";

export default function StopSelector({
  terminals,
  otherStops,
  onSelectStart,
  onSelectEnd,
}) {
  const handleStartSelect = (value) => {
    const startStop = stopToNode.find((s) => s.id === value);
    onSelectStart(startStop);
  };
  const handleEndSelect = (value) => {
    const endStop = stopToNode.find((s) => s.id === value);
    onSelectEnd(endStop);
  };
  return (
    <div>
      <label>Start:</label>
      <select onChange={(e) => handleStartSelect(e.target.value)}>
        <option value="">Select</option>
        {terminals.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
        {otherStops.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <label>End:</label>
      <select onChange={(e) => handleEndSelect(e.target.value)}>
        <option value="">Select</option>
        {terminals.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
        {otherStops.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
