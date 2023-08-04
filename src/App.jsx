import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import inobonce from 'inobounce';
import Corn from './components/Corn';

import './App.scss';

const App = () => {
  const width = 31;
  const height = 28;
  const canvasRef = useRef();
  const [move, setMove] = useState({ x: 0, y: 0 });
  const [kernals, setKernals] = useState([]);
  const [currentKernal, setCurrentKernal] = useState({ x: Math.round(width / 2), y: Math.round(height / 4) });

  const handleKeydown = ({ key }) => {
    let x = 0;
    let y = 0;
    switch (key) {
      case 'ArrowLeft':
        x = -1;
        break;
      case 'ArrowRight':
        x = 1;
        break;
      case 'ArrowUp':
        y = -1;
        break;
      case 'ArrowDown':
        y = 1;
        break;
      default:
        break;
    }
    setMove({ x, y });
  };

  useEffect(() => {
    let x = currentKernal.x + move.x;
    let y = currentKernal.y + move.y;
    if (x > width - 1) x = 0;
    if (x < 0) x = width - 1;
    if (y > height - 1) y = 0;
    if (y < 0) y = height - 1;
    const kernal = kernals.find(k => k.x === x && k.y === y);
    if (kernal) {
      if (kernal.status === 'chewed' || kernal.status === 'wall') return;
      kernal.status = 'chewed';
      setKernals(kernals);
    }
    setCurrentKernal({ x, y });
  }, [move]);


  useEffect(() => {
    const cols = width;
    const rows = height;
    const _kernals = [];
    let count = 0;
    for (let col = 0; col < cols; col += 1) {
      for (let row = 0; row < rows; row += 1) {
        count += 1;
        _kernals.push({
          id: count,
          x: col,
          y: row,
          status: Math.random() > 0.2 ? 'normal' : 'wall',
        });
      }
    }

    setKernals(() => _kernals);
    addEventListener('keydown', handleKeydown);
    return () => {
      removeEventListener('keydown', handleKeydown);
    };
  }, []);

  return (
    <div className="app">
      <Canvas ref={canvasRef}>
        <Corn
          kernals={kernals}
          currentKernal={currentKernal}
          width={width}
          height={height}
        />
        <pointLight position={[0, 10, 10]} />
      </Canvas>

    </div>
  );
};
export default App;
