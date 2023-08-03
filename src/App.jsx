import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import Corn from './components/Corn';
import './App.scss';

const App = () => {
  const width = 11;
  const height = 28;
  const canvasRef = useRef();
  const [kernals, setKernals] = useState([]);
  const [currentKernal, setCurrentKernal] = useState({ x: Math.round(width /2), y: Math.round(height / 2) });

  const handleKeydown = ({ key }) => {
    switch(key) {
      case 'ArrowLeft':
        setCurrentKernal((prevKernal) => ({ ...prevKernal, x: prevKernal.x > 0 ? prevKernal.x - 1 : width - 1 }));
      break;
      case 'ArrowRight':
        setCurrentKernal((prevKernal) => ({ ...prevKernal, x: prevKernal.x < width - 1 ? prevKernal.x + 1 : 0 }));
      break;
      case 'ArrowUp':
        setCurrentKernal((prevKernal) => ({ ...prevKernal, y: prevKernal.y > 0 ? prevKernal.y - 1 : height - 1 }));
      break;
      case 'ArrowDown':
        setCurrentKernal((prevKernal) => ({ ...prevKernal, y: prevKernal.y < height - 1 ? prevKernal.y + 1 : 0 }));
      break;
    }
  };

  useEffect(() => {
    const cols = width;
    const rows = height;
    const _kernals = [];
    let count = 0;
    for(let col = 0; col < cols; col+=1) {
      for(let row = 0; row < rows; row += 1) {
        count+= 1;
        _kernals.push({id: count, x: col, y: row, status: 'yellow'});
      }
    }
    setKernals(_kernals);
    addEventListener('keydown', handleKeydown);
    return () => { removeEventListener('keydown', handleKeydown); };
  }, []);

  return (
    <div className="app">
      <Canvas ref={canvasRef}>
        <OrbitControls />
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
