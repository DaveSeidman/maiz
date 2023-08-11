// TODO: change 'normal' to 'path'
// TODO: remove all !important's in CSS
// TODO: better color on close / open instructions buttons
// TODO: use some textures and normal maps
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
import { camshakeConfig, levels, colors } from './config';

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
let interval = null;

const App = () => {
  // const width = 14;// 34;
  // const height = 26;
  const canvasRef = useRef();
  const [width, setWidth] = useState(levels.easy.width);
  const [height, setHeight] = useState(levels.easy.height);
  // const [start, setStart] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [animating, setAnimating] = useState(false);
  const [instructions, setInstructions] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [page, setPage] = useState('instructions');
  const [results, setResults] = useState(false);
  const [move, setMove] = useState({ x: 0, y: 0 });
  const [kernals, setKernals] = useState([]);
  const [currentKernal, setCurrentKernal] = useState({ x: 0, y: 0, justPopped: false });
  const [focusKernal, setFocusKernal] = useState({ x: width / 2, y: 1 });
  const [display, setDisplay] = useState('normal');
  const [timer, setTimer] = useState(0);
  // const [timerInterval, setTimerInterval] = useState();
  const [popCount, setKernalsEaten] = useState(0);

  const handleKeydown = ({ key }) => {
    if (instructions || results || animating) return;
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
    // if (key === 'r') setTimeout(() => { setResults(true); });
    // if (key === 'e') setTimeout(() => { setResults(false); });
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
      if (kernal.type === 'wall') {
        setCurrentKernal({ x: currentKernal.x, y: currentKernal.y, justPopped });
        return;
      }
      // TODO: implement focusKernal complete and then remove the check for animating here
      if (kernal.end && !animating) {
        console.log('this is being triggered', animating);
        setResults(true);
        clearInterval(interval);
        // clearInterval(interval);
        // TODO: include results here
        analytics.track('end', { difficulty: 'medium' });
      }
      if (!kernal.popped) {
        justPopped = true;
        kernal.popped = true;
        setKernalsEaten(popCount + 1);
      }

      // kernal.popped = true;
      setKernals(kernals);
    }

    setCurrentKernal({ x, y, justPopped });
  }, [move]); // TODO add popcount here and to useState

  const randomColor = base => colors[base][Math.floor(Math.random() * colors[base].length)];

  useEffect(() => {
    setWidth(levels[difficulty].width);
    setHeight(levels[difficulty].height);
    setFocusKernal({ x: levels[difficulty].width / 2, y: 0 });
  }, [difficulty]);


  // create the maze
  useEffect(() => {
    const { start, end, cells } = new Maze(height / 2, width / 2);
    const nextKernals = [];
    let id = 0;
    cells.forEach((row, y) => {
      row.forEach((kernal, x) => {
        const color = randomColor(kernal ? 'browns' : 'yellows');
        const type = kernal ? 'wall' : 'normal';
        const popped = false;
        nextKernals.push({ id, x, y, color, type, popped, start: x === 0 && y === start, end: x === width && y === end });
        id += 1;
      });
    });
    setKernals(() => nextKernals);
    // setCurrentKernal({ x: width / 2, y: start, justPopped: false });
    setMove({ x: 0, y: 0 });
  }, [width, height]);

  useEffect(() => {
    addEventListener('keydown', handleKeydown);
    return () => {
      removeEventListener('keydown', handleKeydown);
    };
  }, [instructions, results, animating]);

  useEffect(() => {
    if (playing) {
      interval = setInterval(() => setTimer(prevTimer => prevTimer + 1), 1000);
    }

    return () => {
      console.log('startedReturned');
      clearInterval(interval);
    };
  }, [playing]);

  useEffect(() => {
    console.log('instructions?', instructions);
  }, [instructions]);

  const startGame = () => {
    // setInstructions(false);
    // setAnimating(true);
    const startKernal = kernals.find(kernal => kernal.start);
    const endKernal = kernals.find(kernal => kernal.end);
    setPlaying(true);
    // setAnimating(false);
    // setMove({ x: 0, y: 0 });
    setCurrentKernal({ x: startKernal.x, y: startKernal.y });
    setInstructions(false);
    // setFocusKernal(endKernal);
    // setPage('end');
    // setTimeout(() => {
    //   setPage('start');
    //   setFocusKernal(startKernal);
    // }, 3000);
    // setTimeout(() => {
    //   setPage('go');
    //   setAnimating(false);
    //   setInstructions(false);
    // }, 6000);
    // setMove({ x: 0, y: 0 });
    // console.log('set interval');
    // interval = setInterval(() => {
    //   count += 1;
    //   setTimer({ elapsed: count });
    // }, 1000);
    // setTimerInterval(startTimer);
    analytics.track('start', { difficulty: 'medium' });
  };

  const playAgain = () => {
    console.log('play again!');
  };

  return (
    <div className="app">
      <Canvas
        ref={canvasRef}
        shadows={{ type: PCFSoftShadowMap }}
        camera={{ fov: 60 }}
        dpr={0.5}
      >
        <CameraShake {...camshakeConfig} />
        <EffectComposer>
          <Corn
            canvasRef={canvasRef}
            kernals={kernals}
            currentKernal={currentKernal}
            focusKernal={focusKernal}
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
          <ChromaticAberration offset={[0.001, 0.001]} />
          {/* <DepthOfField focusDistance={0.05} focalLength={display === '3d' ? 0.1 : 1} bokehScale={2} height={1024} /> */}
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={500} />
          <Noise opacity={0.05} intensity={0.002} />
          <Vignette eskil={false} offset={0} darkness={0.8} />
          <Environment files={envMap} background blur={0.1} exposure={1} />
        </EffectComposer>
      </Canvas>
      <Score
        timer={timer}
        popCount={popCount}
        kernals={kernals}
      />
      {!instructions && (
        <button
          className="instructionsToggle"
          type="button"
          onClick={() => {
            setInstructions(true);
            clearInterval(interval);
          }}
        >
          ?
        </button>
      )}
      <Footer />
      <Instructions
        instructions={instructions}
        setInstructions={setInstructions}
        startGame={startGame}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        page={page}
      />
      <Results
        results={results}
        setResults={setResults}
        playAgain={playAgain}
        result="won"
        popCount={popCount}
        timer={timer}
        kernals={kernals}
      />
      <button
        className="debug"
        type="button"
        onClick={() => { setDisplay(display === 'normal' ? 'grid' : 'normal'); }}
      >Display
      </button>

    </div>
  );
};
export default App;
