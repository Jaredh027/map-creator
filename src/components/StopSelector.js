import React from "react";

export default function StopSelector({ stops, onSelectStart, onSelectEnd }) {
  return (
    <div>
      <label>Start:</label>
      <select onChange={(e) => onSelectStart(e.target.value)}>
        <option value="">Select</option>
        {stops.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <label>End:</label>
      <select onChange={(e) => onSelectEnd(e.target.value)}>
        <option value="">Select</option>
        {stops.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
