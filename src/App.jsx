import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import Corn from './components/Corn';
import './App.scss';

const App = () => {
  const canvasRef = useRef();
  const [kernals, setKernals] = useState([]);
  const [currentKernal, setCurrentKernal] = useState({ x: 0, y: 0 });

  const handleKeydown = ({ key }) => {
    switch(key) {
      case 'ArrowLeft':
        setCurrentKernal((prevKernal) => ({ ...prevKernal, x: prevKernal.x - 1 }));
      break;
      case 'ArrowRight':
        setCurrentKernal((prevKernal) => ({ ...prevKernal, x: prevKernal.x + 1 }));
      break;
      case 'ArrowUp':
        setCurrentKernal((prevKernal) => ({ ...prevKernal, y: prevKernal.y - 1 }));
      break;
      case 'ArrowDown':
        setCurrentKernal((prevKernal) => ({ ...prevKernal, y: prevKernal.y + 1 }));
      break;
    }
  };

  useEffect(() => {
    const cols = 10;
    const rows = 10;
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
        <Corn kernals={kernals} currentKernal={currentKernal} />
        <pointLight position={[0, 10, 10]} />
      </Canvas>

    </div>
  );
};
export default App;
