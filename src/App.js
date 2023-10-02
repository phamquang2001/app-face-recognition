import logo from './logo.svg';
import './App.css';
import Home from "./Home.js"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Photo from './Photo/Photo';
import Video from './Video/VideoInput';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/photo" element={<Photo/>}/>
            <Route path="/video" element={<Video/>}/> 
          </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
