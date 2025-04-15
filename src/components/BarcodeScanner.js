import React, { useEffect, useRef } from "react";
import Quagga from "@ericblade/quagga2";

const BarcodeScanner = () => {
  // Create a ref to attach the scanner's video element
  const scannerRef = useRef(null);

  // Callback function to handle detected barcode data
  const handleDetected = (result) => {
    const code = result.codeResult.code;
    console.log("Barcode detected:", code);
    // You can add additional processing here.
  };

  useEffect(() => {
    // Check if the DOM element is available.
    if (scannerRef.current) {
      // Initialize Quagga with your desired configuration options.
      Quagga.init(
        {
          inputStream: {
            // Set up the live stream from the user's camera.
            type: "LiveStream",
            target: scannerRef.current, // Attach to the ref DOM element.
            constraints: {
              width: 640,
              height: 480,
              facingMode: "environment", // Prefer rear camera if available.
            },
          },
          decoder: {
            // Use the desired readers (for example, a Code 128 barcode).
            readers: ["code_128_reader"],
            // For a custom barcode, adjust this array or add custom logic.
          },
        },
        (err) => {
          if (err) {
            console.error("Quagga initialization failed: ", err);
            return;
          }
          // Start scanning once initialization is complete.
          Quagga.start();
        }
      );

      // Listen for detected barcodes.
      Quagga.onDetected(handleDetected);
    }

    // Cleanup function to stop the scanner when the component unmounts.
    return () => {
      Quagga.offDetected(handleDetected); // Unregister the event handler.
      Quagga.stop(); // Stop the scanner to free resources.
    };
  }, []);

  return (
    <div>
      <h2>React Barcode Scanner</h2>
      {/* This div will host the live camera feed. */}
      <div
        ref={scannerRef}
        style={{ width: "640px", height: "480px", border: "1px solid #ccc" }}
      />
    </div>
  );
};

export default BarcodeScanner;
