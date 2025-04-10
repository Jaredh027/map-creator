import React, { useState } from "react";
import CustomButton from "../components/CustomButton";
import { stopToNode, stopType } from "../data/stops";
import { StopTypeSelection } from "../components/StopTypeSelection";
import { StopSelection } from "../components/StopSelection";

const NavPage = ({}) => {
  const [navType, setNavType] = useState([null]);
  const [selectedStops, setSelectedStops] = useState([]);

  const handleSelectStop = (stop, index) => {
    let cpySelectedStops = [...selectedStops];
    cpySelectedStops[index] = stop;
    setSelectedStops(cpySelectedStops);
  };
  const handleNavType = (type, index) => {
    let cpyNavType = [...navType];
    cpyNavType[index] = type;
    setNavType(cpyNavType);

    if (selectedStops[index]) {
      let cpySelectedStops = [...selectedStops];
      cpySelectedStops[index] = null;
      setSelectedStops(cpySelectedStops);
    }
  };

  const handleAddStop = () => {
    setNavType((prevNavTypeArr) => [...prevNavTypeArr, null]);
  };

  return (
    <div className="nav-main-div">
      <div className="nav-text-div">
        <h1>Select where you would like to go</h1>
      </div>
      <div style={{ display: "grid", rowGap: "16px" }}>
        {navType.map((type, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              columnGap: "16px",
              alignItems: "center",
              backgroundColor: "gray",
              borderRadius: "16px",
              padding: "16px",
            }}
          >
            <div>
              <h1 style={{ fontSize: "3rem" }}>Stop {index + 1}</h1>
            </div>
            <div style={{ borderLeft: "solid white 1px", paddingLeft: "16px" }}>
              <h2>Choose a stop category</h2>
              <StopTypeSelection
                currentNavType={navType[index]}
                setNavType={handleNavType}
                index={index}
              />
              {console.log(navType, index)}
              {navType[index] !== null && (
                <StopSelection
                  currentNavType={navType[index]}
                  currentStop={selectedStops[index]}
                  handleSelectStop={handleSelectStop}
                  index={index}
                />
              )}
            </div>
          </div>
        ))}
        <div style={{ display: "flex" }}>
          <h2>Would you like to add another stop?</h2>

          <CustomButton onClick={handleAddStop}>Yes</CustomButton>

          <CustomButton>No</CustomButton>
        </div>
      </div>
    </div>
  );
};

export default NavPage;
