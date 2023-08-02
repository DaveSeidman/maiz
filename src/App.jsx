import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import Corn from './components/Corn';
import './App.scss';
// import model from './assets/model2.glb';
// import envMap from './assets/modern_buildings_2k.hdr';

const App = () => {
  const cameraRef = useRef();
  const controlsRef = useRef();
  const canvasRef = useRef();


  return (
    <div className="app">
      <Canvas ref={canvasRef}>
        <OrbitControls />
        <Corn />
        <pointLight position={[0, 10, 10]} />
      </Canvas>

    </div>
  );
};
export default App;
