// TODO: change 'normal' to 'path'

import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, DepthOfField, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { Environment, CameraShake } from '@react-three/drei';
import { Camera, PCFSoftShadowMap } from 'three';
import Controls from './components/Controls';
import Footer from './components/Footer';
import Corn from './components/Corn';
import Instructions from './components/Instructions';
import Results from './components/Results';
import Score from './components/Score';
import envMap from './assets/limpopo_golf_course_2k.hdr';
import Maze from './maze';
import inobonce from 'inobounce'; // eslint-disable-line

import './index.scss';

const App = () => {
  const width = 34;
  const height = 26;
  const canvasRef = useRef();
  const [instructions, setInstructions] = useState(true);
  const [move, setMove] = useState({ x: 0, y: 0 });
  const [kernals, setKernals] = useState([]);
  const [currentKernal, setCurrentKernal] = useState({ x: 0, y: 0 });
  const [display, setDisplay] = useState('3d');
  const [mode, setMode] = useState('normal');
  const [results, setResults] = useState(false);
  const [timer, setTimer] = useState(0);
  const [kernalsEaten, setKernalsEaten] = useState(0);

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
    const x = currentKernal.x + move.x;
    let y = currentKernal.y + move.y;
    if (x < 0 || x > width) return;
    if (y > height - 1) y = 0;
    if (y < 0) y = height - 1;
    const kernal = kernals.find(k => k.x === x && k.y === y);
    if (kernal) {
      if (mode === 'normal' && kernal.status === 'wall') {
        setCurrentKernal({ x: currentKernal.x, y: currentKernal.y });
        return;
      }
      setResults(kernal.end);
      if (kernal.status !== 'chewed') setKernalsEaten(kernalsEaten + 1);

      kernal.status = 'chewed';
      setKernals(kernals);
    }
    setCurrentKernal({ x, y });
  }, [move]);


  useEffect(() => {
    const { start, end, cells } = new Maze(height / 2, width / 2);
    const nextKernals = [];
    let id = 0;
    cells.forEach((row, y) => {
      row.forEach((col, x) => {
        nextKernals.push({
          id,
          x,
          y,
          material: col ? `wall_${Math.floor(Math.random() * 3)}` : `normal_${Math.floor(Math.random() * 2)}`,
          status: col ? 'wall' : 'normal',
          highlight: x === 2 && y === 0,
          end: x === width && y === end,
        });
        id += 1;
      });
    });
    setKernals(() => nextKernals);
    setCurrentKernal({ x: 0, y: start });
    setMove({ x: 0, y: 0 });
    addEventListener('keydown', handleKeydown);
    return () => {
      removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const config = {
    maxYaw: 0.005, // Max amount camera can yaw in either direction
    maxPitch: 0.005, // Max amount camera can pitch in either direction
    maxRoll: 0.005, // Max amount camera can roll in either direction
    yawFrequency: 0.7, // Frequency of the the yaw rotation
    pitchFrequency: 0.7, // Frequency of the pitch rotation
    rollFrequency: 0.7, // Frequency of the roll rotation
    intensity: 1, // initial intensity of the shake
    decay: false, // should the intensity decay over time
    decayRate: 0.65, // if decay = true this is the rate at which intensity will reduce at
    controls: undefined, // if using orbit controls, pass a ref here so we can update the rotation
  };

  return (
    <div className="app">
      <Canvas
        ref={canvasRef}
        shadows={{ type: PCFSoftShadowMap }}
        camera={{ fov: 80 }}
        dpr={0.5}
      >

        {display === '3d' && (<CameraShake {...config} />)}
        <EffectComposer>
          <Corn
            kernals={kernals}
            currentKernal={currentKernal}
            width={width}
            height={height}
            display={display}
          />
          {/* <pointLight
            position={[5, 10, 10]}
            intensity={2}
            castShadow
            shadow-mapSize={512}
            shadow-bias={0.00001}
          /> */}
          <directionalLight
            intensity={2}
            position={[5, -10, 0]}
            target-position={[-5, 0, 0]}
            castShadow
            shadow-mapSize={1024}
            shadow-bias={0.00001}
          />
          {/* <ambientLight color={0xffdd11} intensity={-0.5} /> */}
          <ChromaticAberration offset={[0.002, 0.002]} />
          {/* <DepthOfField focusDistance={0.25} focalLength={display === '3d' ? 0.04 : 1} bokehScale={2} height={1024} /> */}
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={500} />
          <Noise opacity={0.05} intensity={0.002} />
          <Vignette eskil={false} offset={0} darkness={0.8} />
          <Environment files={envMap} background blur={0.3} exposure={0.5} />
        </EffectComposer>
      </Canvas>
      <Controls
        setMove={setMove}
        display={display}
        setDisplay={setDisplay}
        mode={mode}
        setMode={setMode}
      />
      <Score
        timer={timer}
        kernalsEaten={kernalsEaten}
      />
      <button
        className="instructionsToggle"
        type="button"
        onClick={() => { setInstructions(true); }}
      >
        ?
      </button>
      <Footer />
      {instructions && (<Instructions setInstructions={setInstructions} />)}
      {results && (<Results />)}
    </div>
  );
};
export default App;
