import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { loadModels, getFullFaceDescription, createMatcher } from "../api/face";
import { Link } from "react-router-dom";
import "./Video.scss";
import Loading from "../Loading/Loading";

const JSON_PROFILE = require("../descriptors/bnk48.json");
const WIDTH = 420;
const HEIGHT = 420;
const inputSize = 160;

const VideoInput = () => {
  const webcamRef = useRef(null);
  const [fullDesc, setFullDesc] = useState(null);
  const [detections, setDetections] = useState(null);
  const [descriptors, setDescriptors] = useState(null);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [match, setMatch] = useState(null);
  const [facingMode, setFacingMode] = useState(null);
  let interval;
  useEffect(() => {
    const initialize = async () => {
      await loadModels();
      setFaceMatcher(await createMatcher(JSON_PROFILE));
      setInputDevice();
    };
    initialize();
  }, []);

  useEffect(() => {
    startCapture();
    return () => clearInterval(interval);
  }, [facingMode]);

  const setInputDevice = () => {
    navigator.mediaDevices.enumerateDevices().then(async (devices) => {
      const inputDevice = await devices.filter(
        (device) => device.kind === "videoinput"
      );
      if (inputDevice.length < 2) {
        setFacingMode("user");
      } else {
        setFacingMode({ exact: "environment" });
      }
    });
  };

  const startCapture = () => {
    interval = setInterval(() => {
      capture();
    }, 3000);
  };

  const capture = async () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      const fullFaceDesc = await getFullFaceDescription(screenshot, inputSize);

      if (fullFaceDesc) {
        setDetections(fullFaceDesc.map((fd) => fd.detection));
        setDescriptors(fullFaceDesc.map((fd) => fd.descriptor));
      }

      if (descriptors && faceMatcher) {
        const matchResults = descriptors.map((descriptor) =>
          faceMatcher.findBestMatch(descriptor)
        );
        setMatch(matchResults);
      }
    }
  };

  let videoConstraints = null;
  let camera = "";

  if (facingMode) {
    videoConstraints = {
      width: WIDTH,
      height: HEIGHT,
      facingMode: facingMode,
    };
    camera = facingMode === "user" ? "Front" : "Back";
  }

  let drawBox = null;

  if (detections) {
    drawBox = detections.map((detection, i) => {
      const _H = detection.box.height;
      const _W = detection.box.width;
      const _X = detection.box._x;
      const _Y = detection.box._y;

      return (
        <div key={i}>
          <div
            style={{
              position: "absolute",
              border: "solid",
              borderColor: "blue",
              height: _H,
              width: _W,
              transform: `translate(${_X}px,${_Y}px)`,
            }}
          >
            {match && match[i] ? (
              <p
                style={{
                  backgroundColor: "blue",
                  border: "solid",
                  borderColor: "blue",
                  width: _W,
                  marginTop: 0,
                  color: "#fff",
                  transform: `translate(-3px,${_H}px)`,
                }}
              >
                {match[i]._label}
              </p>
            ) : null}
          </div>
        </div>
      );
    });
  }

  return (
    <div
      className="Camera"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <p>Camera: {camera}</p>
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
        }}
      >
        <div style={{ position: "relative", width: WIDTH }}>
          {videoConstraints ? (
            <div style={{ position: "absolute" }}>
              <Webcam
                audio={false}
                width={WIDTH}
                height={HEIGHT}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
              />
            </div>
          ) : <Loading/>}
          {drawBox ? drawBox : null}
        </div>
      </div>
      <div className="go-to-home">
        <Link to="/">Go to Home!</Link>
      </div>
    </div>
  );
};

export default VideoInput;
