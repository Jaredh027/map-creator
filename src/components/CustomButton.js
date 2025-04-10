import React from "react";
import { Grid, Button } from "@mui/material";

const CustomButton = ({ children, startIcon, selected, ...props }) => (
  <Button
    {...props}
    startIcon={
      startIcon ? (
        <span
          style={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 8,
            color: selected ? "#fff" : "#00cc00",
          }}
        >
          {React.cloneElement(startIcon, {
            style: { width: 24, height: 24 },
          })}
        </span>
      ) : null
    }
    sx={{
      textAlign: "center",
      borderRadius: 2,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: selected ? "#00cc00" : "white",
      backgroundColor: selected ? "#00cc00" : "transparent",
      color: "white",
      display: "flex",
      marginBottom: 2,
      padding: "8px 15px",
      fontWeight: "bold",
      alignItems: "center",
      "&:hover": {
        backgroundColor: selected ? "#55DD55" : "rgba(0,204,0,0.5)",
      },
    }}
  >
    {children}
  </Button>
);

export default CustomButton;
