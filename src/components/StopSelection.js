import React, { useState } from "react";
import { edges, edgesTerminal, stopToNode, stopType } from "../data/stops";
import CustomButton from "./CustomButton";
import { GetDistance } from "./GetDistance";

export const StopSelection = ({
  currentNavType,
  currentStop,
  handleSelectStop,
  handleConfirmStop,
  index,
  userInformation,
}) => {
  return (
    <div>
      <h2>Choose a {currentNavType.toLowerCase()} option</h2>
      <div className="nav-stops-div">
        {stopToNode
          .filter((stop) => stop.type === currentNavType)
          .map((stop) => {
            console.log(stop);
            return (
              <CustomButton
                selected={stop.name === currentStop?.name}
                onClick={() => handleSelectStop(stop, index)}
                key={stop.id}
                style={{
                  display: "grid",
                  minWidth: "10rem",
                  backgroundColor:
                    userInformation[1] ===
                      stop.name[0] + stop.name.split(" ")[1] && "#D9FFD1",
                }}
              >
                <p style={{ margin: 0 }}>{stop.name}</p>
                <p style={{ margin: 0 }}>
                  {GetDistance(edges, edgesTerminal, "PSB", stop)} {" mins"}
                </p>
              </CustomButton>
            );
          })}
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
