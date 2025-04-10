import React from "react";
import { stopType } from "../data/stops";
import CustomButton from "./CustomButton";

export const StopTypeSelection = ({ currentNavType, setNavType, index }) => {
  return (
    <div className="nav-stops-div">
      {stopType.map((stop) => (
        <CustomButton
          onClick={() => setNavType(stop, index)}
          selected={currentNavType === stop}
          key={stop}
        >
          {stop}
        </CustomButton>
      ))}
    </div>
  );
};
