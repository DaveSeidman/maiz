// TODO: change 'normal' to 'path'

import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, DepthOfField, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { Environment, CameraShake } from '@react-three/drei';
import { Color, PCFSoftShadowMap } from 'three';
import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';
import Footer from './components/Footer';
import Corn from './components/Corn';
import Instructions from './components/Instructions';
import Results from './components/Results';
import Score from './components/Score';
import envMap from './assets/limpopo_golf_course_2k.hdr';
import Maze from './maze';

import inobonce from 'inobounce'; // eslint-disable-line

import './index.scss';

const analytics = Analytics({
  app: 'website data',
  plugins: [
    googleAnalytics({
      measurementIds: ['G-33LFT6EBGE'],
    }),
  ],
});

const count = 0;
// let interval = null;

const App = () => {
  const width = 34;
  const height = 26;
  const canvasRef = useRef();
  const [instructions, setInstructions] = useState(true);
  const [results, setResults] = useState(false);
  const [move, setMove] = useState({ x: 0, y: 0 });
  const [kernals, setKernals] = useState([]);
  const [currentKernal, setCurrentKernal] = useState({ x: 0, y: 0, justPopped: false });
  const [display, setDisplay] = useState('3d');
  const [mode, setMode] = useState('normal');
  const [timer, setTimer] = useState({ elapsed: 0 });
  const [kernalsEaten, setKernalsEaten] = useState(0);

  const handleKeydown = ({ key }) => {
    let x = 0;
    let y = 0;
    switch (key) {
      case 'ArrowLeft': x = -1; break;
      case 'ArrowRight': x = 1; break;
      case 'ArrowUp': y = -1; break;
      case 'ArrowDown': y = 1; break;
      default: break;
    }
    setMove({ x, y });
    if (key === 'r') setTimeout(() => { setResults(true); });
    if (key === 'e') setTimeout(() => { setResults(false); });
    if (key === 'Escape') setInstructions(false);
  };

  useEffect(() => {
    const x = currentKernal.x + move.x;
    let y = currentKernal.y + move.y;
    if (x < 0 || x > width) return;
    if (y > height - 1) y = 0;
    if (y < 0) y = height - 1;
    const kernal = kernals.find(k => k.x === x && k.y === y);

    let justPopped = false;
    if (kernal) {
      if (mode === 'normal' && kernal.type === 'wall') {
        setCurrentKernal({ x: currentKernal.x, y: currentKernal.y, justPopped });
        return;
      }
      if (kernal.end) {
        setResults(true);
        analytics.track('end', { difficulty: 'medium' });
      }
      if (kernal.type !== 'popped') {
        justPopped = true;
        setKernalsEaten(kernalsEaten + 1);
      }

      kernal.type = 'popped';
      setKernals(kernals);
    }

    setCurrentKernal({ x, y, justPopped });
  }, [move]);

  const colors = {
    yellows: [
      new Color('rgb(251, 225, 14)'),
      new Color('rgb(253, 244, 18)'),
      new Color('rgb(247, 229, 48)'),
    ],
    browns: [
      new Color('rgb(10 , 10, 5)'),
      new Color('rgb(15, 7, 8)'),
      new Color('rgb(13, 8, 6)'),
    ],
  };

  const randomColor = base => colors[base][Math.floor(Math.random() * colors[base].length)];

  useEffect(() => {
    const { start, end, cells } = new Maze(height / 2, width / 2);
    const nextKernals = [];
    let id = 0;
    cells.forEach((row, y) => {
      row.forEach((kernal, x) => {
        nextKernals.push({
          id,
          x,
          y,
          color: randomColor(kernal ? 'browns' : 'yellows'),
          type: kernal ? 'wall' : 'normal',
          highlight: x === 2 && y === 0,
          end: x === width && y === end,
        });
        id += 1;
      });
    });
    setKernals(() => nextKernals);
    setCurrentKernal({ x: 0, y: start, justPopped: false });
    setMove({ x: 0, y: 0 });
    addEventListener('keydown', handleKeydown);

    return () => {
      removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const start = () => {
    setInstructions(false);
    setMove({ x: 0, y: 0 });
    analytics.track('start', { difficulty: 'medium' });
    // console.log('set interval');
    // interval = setInterval(() => {
    //   count += 1;
    //   setTimer({ elapsed: count });
    // }, 1000);
  };

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
        camera={{ fov: 60 }}
        dpr={0.75}
      >
        {display === '3d' && (<CameraShake {...config} />)}
        <EffectComposer>
          <Corn
            kernals={kernals}
            currentKernal={currentKernal}
            setMove={setMove}
            width={width}
            height={height}
            display={display}
          />
          <directionalLight
            intensity={2}
            position={[0, -10, 0]}
            target-position={[-5, -10, 0]}
            castShadow
            shadow-mapSize={1024}
            shadow-bias={0.00001}
          />
          {/* <ChromaticAberration offset={[0.002, 0.002]} /> */}
          {/* <DepthOfField focusDistance={0.05} focalLength={display === '3d' ? 0.1 : 1} bokehScale={2} height={1024} /> */}
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={500} />
          <Noise opacity={0.05} intensity={0.002} />
          <Vignette eskil={false} offset={0} darkness={0.8} />
          <Environment files={envMap} background blur={0.1} exposure={1} />
        </EffectComposer>
      </Canvas>
      <Score
        timer={timer}
        kernalsEaten={kernalsEaten}
      />
      <button
        className="instructionsToggle"
        type="button"
        onClick={() => {
          setInstructions(true);
          // clearInterval(interval);
        }}
      >
        ?
      </button>
      <Footer />
      {instructions && (
      <Instructions
        start={start}
        setInstructions={setInstructions}
      />
      )}
      {results && (
      <Results
        result="won"
      />
      )}
    </div>
  );
};
export default App;
