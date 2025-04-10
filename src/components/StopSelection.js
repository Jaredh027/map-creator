import React, { useState } from "react";
import { stopToNode, stopType } from "../data/stops";
import CustomButton from "./CustomButton";

export const StopSelection = ({
  currentNavType,
  currentStop,
  handleSelectStop,
  index,
}) => {
  const [confirmed, setConfirmed] = useState();
  return (
    <div>
      <h2>Choose a {currentNavType.toLowerCase()} option</h2>
      <div className="nav-stops-div">
        {stopToNode
          .filter((stop) => stop.type === currentNavType)
          .map((stop) => (
            <CustomButton
              selected={stop.name === currentStop}
              onClick={() => handleSelectStop(stop.name, index)}
            >
              {stop.name}
            </CustomButton>
          ))}
      </div>
      {currentStop && <CustomButton>Confirm Selection</CustomButton>}
    </div>
  );
};
