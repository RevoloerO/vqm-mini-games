import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';
import MouseStalkers from './mini-games/MouseStalker/MouseStalker';
import BloomingGarden from './mini-games/BloomingGarden';
import ThreeDBall from './mini-games/3DBall/3DBall';
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/vqm-mini-games/" element={<HomePage />} />
        <Route path="/vqm-mini-games/mouse-stalker" element={<MouseStalkers />} />
        <Route path="/vqm-mini-games/blooming-garden" element={<BloomingGarden />} />
        <Route path="/vqm-mini-games/3d-ball" element={<ThreeDBall />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  )
}

export default App
