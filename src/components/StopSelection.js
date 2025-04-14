import React, { useState } from "react";
import { stopToNode, stopType } from "../data/stops";
import CustomButton from "./CustomButton";

export const StopSelection = ({
  currentNavType,
  currentStop,
  handleSelectStop,
  handleConfirmStop,
  index,
}) => {
  return (
    <div>
      <h2>Choose a {currentNavType.toLowerCase()} option</h2>
      <div className="nav-stops-div">
        {stopToNode
          .filter((stop) => stop.type === currentNavType)
          .map((stop) => (
            <CustomButton
              selected={stop.name === currentStop}
              onClick={() => handleSelectStop(stop, index)}
            >
              {stop.name}
            </CustomButton>
          ))}
      </div>
      {currentStop && (
        <div
          style={{
            justifyContent: "center",
            marginTop: "16px",
            justifyItems: "center",
          }}
        >
          <CustomButton
            style={{ color: "green", borderColor: "green" }}
            onClick={() => handleConfirmStop(index)}
          >
            Confirm Selection
          </CustomButton>
        </div>
      )}
    </div>
  );
};
