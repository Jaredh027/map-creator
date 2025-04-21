import React, { useState } from "react";
import CustomButton from "../components/CustomButton";
import { stopToNode, stopType } from "../data/stops";
import { StopTypeSelection } from "../components/StopTypeSelection";
import { StopSelection } from "../components/StopSelection";

const NavPage = ({ doneSelecting, screens, setNodes, userInformation }) => {
  const [navType, setNavType] = useState([null]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [confirmedStops, setConfirmedSpots] = useState([]);

  const handleSelectStop = (stop, index) => {
    console.log("STOP", stop);
    let cpySelectedStops = [...selectedStops];
    cpySelectedStops[index] = stop;
    setSelectedStops(cpySelectedStops);
    // let cpyConfirmedStops = [...confirmedStops];
    // cpyConfirmedStops[index] = 0;
    // setConfirmedSpots(cpyConfirmedStops);
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
  const handleConfirmStop = (index) => {
    let cpyConfirmedStops = [...confirmedStops];
    cpyConfirmedStops[index] = 1;
    setConfirmedSpots(cpyConfirmedStops);
  };

  const handleAddStop = () => {
    setNavType((prevNavTypeArr) => [...prevNavTypeArr, null]);
  };

  const handleEditStop = (index) => {
    let cpyConfirmedStops = [...confirmedStops];
    cpyConfirmedStops[index] = 0;
    setConfirmedSpots(cpyConfirmedStops);
  };

  const handleDoneSelecting = () => {
    let cpy = [...screens];
    cpy[0] = false;
    cpy[1] = false;
    cpy[2] = true;
    doneSelecting(cpy);

    let nodesArr = [...selectedStops];
    console.log(nodesArr);
    setNodes(nodesArr);
  };

  let flightNumber = null;
  let gate = null;
  let flightTime = null;
  if (userInformation) {
    flightNumber = userInformation[0];
    gate = userInformation[1];
    flightTime = userInformation[2];
  }

  return (
    <div className="nav-main-div">
      <div className="nav-text-div">
        <h1>Select where you would like to go</h1>

        {userInformation && (
          <p>
            {"Flight: " + flightNumber + " | "} {"Gate: " + gate + " | "}{" "}
            {"Departure: " + flightTime}
          </p>
        )}
        <p></p>
      </div>
      <div style={{ display: "grid", rowGap: "16px" }}>
        {navType.map((type, index) => (
          <div key={index} style={{ display: "flex", columnGap: "16px" }}>
            <div
              style={{
                display: "flex",
                columnGap: "16px",
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "16px",
                color: "#444",
              }}
            >
              <div>
                <h1 style={{ fontSize: "3rem" }}>Stop {index + 1}</h1>
              </div>
              <div
                style={{ borderLeft: "solid #444 1px", paddingLeft: "16px" }}
              >
                {confirmedStops[index] !== 1 ? (
                  <div>
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
                        handleConfirmStop={handleConfirmStop}
                        index={index}
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    <h1 style={{ fontSize: "3rem" }}>
                      {selectedStops[index].name}
                    </h1>
                  </div>
                )}
              </div>
            </div>

            {!confirmedStops[index] ||
              (confirmedStops[index] !== 0 && (
                <CustomButton
                  style={{
                    padding: "16px",
                    border: "solid white 1px",
                    borderRadius: "16px",
                    textAlign: "center",
                    alignContent: "center",
                    margin: 0,
                    color: "white",
                  }}
                  onClick={() => handleEditStop(index)}
                >
                  Edit
                </CustomButton>
              ))}
          </div>
        ))}
        <div
          style={{
            display: "flex",
            columnGap: "16px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CustomButton
            style={{ margin: 0, color: "white", borderColor: "white" }}
            onClick={handleAddStop}
          >
            + Add another stop
          </CustomButton>

          {confirmedStops.length > 0 && (
            <CustomButton
              style={{ margin: 0, color: "white", borderColor: "white" }}
              onClick={handleDoneSelecting}
            >
              Create Route
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavPage;
