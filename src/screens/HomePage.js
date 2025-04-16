import React from "react";
import CustomButton from "../components/CustomButton";
import BarcodeScanner from "../components/BarcodeScanner";

const HomePage = ({ doneSelecting, screens, setUserInformaiton }) => {
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
        <div>
          <h1 style={{ fontSize: "3rem" }}>Welcome to PathPilot</h1>
          <h2>Scan your boarding pass below</h2>
        </div>
        <BarcodeScanner setUserInformaiton={setUserInformaiton} />
        <CustomButton
          style={{ color: "white", borderColor: "white" }}
          onClick={handleDoneSelecting}
        >
          Proceed without boarding pass
        </CustomButton>
      </div>
    </div>
  );
};

export default HomePage;
