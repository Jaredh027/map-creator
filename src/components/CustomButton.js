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
      borderColor: selected ? "#005DBA" : "#444",
      backgroundColor: selected ? "#005DBA" : "rgba(0, 0, 0, 0.1)",
      color: selected ? "white" : "#444",
      display: "flex",
      marginBottom: 2,
      padding: "8px 15px",
      fontWeight: "bold",
      alignItems: "center",
      "&:hover": {
        backgroundColor: selected
          ? "rgba(99, 208, 255, 0.5)"
          : "rgba(99, 208, 255, 0.5)",
      },
    }}
  >
    {children}
  </Button>
);

export default CustomButton;
