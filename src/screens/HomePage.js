import React from "react";
import CustomButton from "../components/CustomButton";

const HomePage = ({ doneSelecting, screens }) => {
  const handleDoneSelecting = () => {
    let cpy = [...screens];
    cpy[0] = false;
    cpy[1] = true;
    cpy[2] = false;
    doneSelecting(cpy);
  };

  return (
    <div className="home-main-div">
      <div className="home-text-div">
        <h1>Welcome to PathPilot or whatever this is called</h1>
        <h2>Scan your boarding pass below</h2>
        <CustomButton onClick={handleDoneSelecting}>Proceed</CustomButton>
      </div>
    </div>
  );
};

export default HomePage;
