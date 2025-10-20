import { useState } from 'react'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import MouseStalkers from './mini-games/MouseStalker/MouseStalker';
import BloomingGarden from './mini-games/BloomingGarden';
import ThreeDBall from './mini-games/3DBall/3DBall';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/vqm-mini-games/" replace />} />
      <Route path="/vqm-mini-games/" element={<HomePage />} />
      <Route path="/vqm-mini-games/mouse-stalker" element={<MouseStalkers />} />
      <Route path="/vqm-mini-games/blooming-garden" element={<BloomingGarden />} />
      <Route path="/vqm-mini-games/3d-ball" element={<ThreeDBall />} />
      {/* Catch-all route must be last */}
      <Route path="*" element={<Navigate to="/vqm-mini-games/" replace />} />
    </Routes>
  )
}

export default App