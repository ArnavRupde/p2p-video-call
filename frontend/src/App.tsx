import { useState } from 'react';
import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import VideoCallRoom from './components/VideoCallRoom';
import Home from './components/Home';

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/meeting/:roomId' element={<VideoCallRoom/>} />
        <Route path='*' element={<Home/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
