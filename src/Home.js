import React from "react";
import { Link } from "react-router-dom";
import "./Home.scss"
function Home(props) {
  return (
    <div>
      <div className="face-authentication flex fdc jcfc aic">
        <img src="logo.jpg"></img>
        <button className="action face-registration">
          <Link to="/photo">Photo Input</Link>
        </button>
        <button className="action face-sign-in">
          <Link to="/video">Video Camera</Link>
        </button>
      </div>
    </div>
  );
}

export default Home;
