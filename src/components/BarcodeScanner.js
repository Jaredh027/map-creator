import React, { useEffect, useRef } from "react";
import Quagga from "@ericblade/quagga2";
import { stopToNode } from "../data/stops";

const BarcodeScanner = ({ setUserInformaiton }) => {
  const scannerRef = useRef(null);

  const handleDetected = (result) => {
    const code = result.codeResult.code;
    let infoArr = code.split(" ");
    console.log(infoArr);

    if (infoArr.length === 3) {
      let gateNode = stopToNode.find(
        (stop) =>
          stop.type === "Gate" && "G" + stop.name.split(" ")[1] === infoArr[1]
      );
      if (gateNode) {
        console.log("Barcode detected:", infoArr);
        setUserInformaiton(infoArr);
        return;
      }
    }
  };

  useEffect(() => {
    // Ensure we're running on the client and the ref is available.
    if (typeof window !== "undefined" && scannerRef.current) {
      // Delay initialization slightly to ensure the DOM is fully rendered.
      const timeoutId = setTimeout(() => {
        Quagga.init(
          {
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: scannerRef.current,
              constraints: {
                width: 640,
                height: 480,
                facingMode: "environment", // Prefer rear camera if available.
              },
            },
            decoder: {
              readers: ["code_128_reader"],
            },
          },
          (err) => {
            if (err) {
              console.error("Quagga initialization failed: ", err);
              return;
            }
            // Start scanning if initialization is successful.
            Quagga.start();
          }
        );
        // Register the detection callback.
        Quagga.onDetected(handleDetected);
      }, 100);

      // Cleanup function to stop scanning and remove event listeners.
      return () => {
        clearTimeout(timeoutId);
        Quagga.offDetected(handleDetected);
        Quagga.stop();
      };
    }
  }, []); // Dependency array remains empty since we only want this to run on mount.

  return (
    <div>
      <div
        ref={scannerRef}
        style={{ width: "640px", height: "480px", border: "1px solid #ccc" }}
      />
    </div>
  );
};

export default BarcodeScanner;
