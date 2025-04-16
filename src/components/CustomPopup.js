import React from "react";
import { Popover, Typography } from "@mui/material";
import CustomButton from "./CustomButton";

const CustomPopup = ({ message, open, handleYes, handleNo }) => {
  return (
    <Popover
      open={open}
      anchorReference={"none"}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ padding: "16px", display: "grid", rowGap: "16px" }}>
        {message.map((text, index) => (
          <Typography
            style={{
              fontSize: index === 0 ? "2rem" : "1.5rem",
              textAlign: "center",
            }}
          >
            {text}
          </Typography>
        ))}

        <div
          style={{
            display: "flex",
            columnGap: "16px",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <CustomButton
            style={{ color: "black", borderColor: "black" }}
            onClick={handleYes}
          >
            Yes
          </CustomButton>
          <CustomButton
            style={{ color: "black", borderColor: "black" }}
            onClick={handleNo}
          >
            No
          </CustomButton>
        </div>
      </div>
    </Popover>
  );
};

export default CustomPopup;
