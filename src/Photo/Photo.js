import React, { useState, useEffect } from "react";
import { loadModels, getFullFaceDescription, createMatcher } from "../api/face";
import { Link } from "react-router-dom";
import "./Photo.scss";
import Loading from "../Loading/Loading";

const testImg = require("../img/anhthe.png");
const JSON_PROFILE = require("../descriptors/bnk48.json");
const INIT_STATE = {
  imageURL: testImg,
  fullDesc: null,
  detections: null,
  descriptors: null,
  match: null,
};

function Photo(props) {
  const [state, setState] = useState({
    ...INIT_STATE,
    faceMatcher: null,
    loading: false,
  });
  let temp = INIT_STATE;

  useEffect(() => {
    initialize();
  }, temp.imageURL);

  async function initialize() {
    await loadModels();
    const faceMatcher = await createMatcher(JSON_PROFILE);
    temp = {
      imageURL: temp.imageURL,
      fullDesc: temp.fullDesc,
      detections: temp.detections,
      descriptors: temp.descriptor,
      match: temp.match,
      faceMatcher: faceMatcher,
      loading: true,
    };

    await handleImage(temp.imageURL);
  }

  async function handleImage(image = temp.imageURL) {
    const fullDesc = await getFullFaceDescription(image);
    const faceMatcher = await createMatcher(JSON_PROFILE);

    if (fullDesc && fullDesc.length > 0) {
      temp = {
        imageURL: temp.imageURL,
        fullDesc: fullDesc,
        detections: fullDesc.map((fd) => fd.detection),
        descriptors: fullDesc.map((fd) => fd.descriptor),
        match: temp.match,
        faceMatcher: faceMatcher,
        loading: true,
      };
    }

    if (!!temp.descriptors && !!temp.faceMatcher) {
      const match = await temp.descriptors.map((descriptor) =>
        temp.faceMatcher.findBestMatch(descriptor)
      );

      temp = {
        imageURL: temp.imageURL,
        fullDesc: fullDesc,
        detections: fullDesc.map((fd) => fd.detection),
        descriptors: fullDesc.map((fd) => fd.descriptor),
        match: temp.match,
        faceMatcher: faceMatcher,
        match: match,
        loading: true,
      };
      setState(temp);
    }
  }

  async function handleFileChange(event) {
    resetState();
    const imageURL = URL.createObjectURL(event.target.files[0]);
    temp = {
      imageURL: imageURL,
      loading: false,
    };

    setState(temp);

    handleImage();
  }

  function resetState() {
    temp = { INIT_STATE };
  }

  const { imageURL, detections, match } = state;

  let drawBox = null;
  if (detections && detections.length > 0) {
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

  console.log(state);

  return (
    <div className="container">
      <div className="go-to-home">
        <Link to="/">Go to Home!</Link>
      </div>
      <input
        id="myFileUpload"
        type="file"
        onChange={handleFileChange}
        accept=".jpg, .jpeg, .png"
      />
      <div className="Loading">
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute" }}>
            {state.loading === true ? (
              <img src={state.imageURL} alt="imageURL" />
            ) : (
              <Loading />
            )}
          </div>
          {drawBox ? drawBox : null}
        </div>
      </div>
    </div>
  );
}

export default Photo;
