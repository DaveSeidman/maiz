import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import inobonce from 'inobounce'; // eslint-disable-line
import Controls from './components/Controls';
import Corn from './components/Corn';
import { generateMaze } from './maze';

import './index.scss';


const App = () => {
  const width = 32;
  const height = 28;
  const canvasRef = useRef();
  const [move, setMove] = useState({ x: 0, y: 0 });
  const [kernals, setKernals] = useState([]);
  const [currentKernal, setCurrentKernal] = useState({ x: Math.round(width / 2), y: Math.round(height / 4) });
  const [display, setDisplay] = useState('3d');

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
    const maze = generateMaze(height / 2, width / 2);
    const _kernals = [];

    let count = 0;
    maze.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        _kernals.push({
          id: count,
          y: colIndex,
          x: rowIndex,
          status: col === 1 ? 'wall' : 'normal',
        });
        count += 1;
      });
    });
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
          display={display}
        />
        <pointLight position={[0, 10, 10]} />
      </Canvas>
      <Controls
        setMove={setMove}
        display={display}
        setDisplay={setDisplay}
      />
    </div>
  );
};
export default App;
