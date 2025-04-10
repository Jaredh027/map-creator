import React from "react";
import CustomButton from "../components/CustomButton";

const HomePage = ({ setMainNav }) => {
  return (
    <div className="home-main-div">
      <div className="home-text-div">
        <h1>Welcome to PathPilot or whatever this is called</h1>
        <h2>Scan your boarding pass below</h2>
        <CustomButton onClick={() => setMainNav(false)}>Proceed</CustomButton>
      </div>
    </div>
  );
};

export default HomePage;
