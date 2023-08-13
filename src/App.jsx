// TODO: change 'normal' to 'path'
// TODO: remove all !important's in CSS
// TODO: better color on close / open instructions buttons
// TODO: use some textures and normal maps
import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
// import { EffectComposer, DepthOfField, Bloom, Vignette, ChromaticAberration, Noise, SSAO, ToneMapping } from '@react-three/postprocessing';
import { Environment, CameraShake, OrbitControls } from '@react-three/drei';
import { AmbientLight, PCFSoftShadowMap } from 'three';
import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';
// import { BlendFunction } from 'postprocessing';
import Footer from './components/Footer';
import Corn from './components/Corn';
import Instructions from './components/Instructions';
import Results from './components/Results';
import Score from './components/Score';
import envMap from './assets/images/spaichingen_hill_2k.hdr';
import Maze from './components/Maze';
import { camshakeConfig, levels, colors, gameDuration } from './config';
import { Joystick } from 'react-joystick-component';
import Mobile from 'is-mobile';

const mobile = Mobile();

import './index.scss';

const analytics = Analytics({
  app: 'website data',
  plugins: [
    googleAnalytics({
      measurementIds: ['G-33LFT6EBGE'],
    }),
  ],
});

let interval = null;

const App = () => {
  // const width = 14;// 34;
  // const height = 26;
  const canvasRef = useRef();
  const [width, setWidth] = useState(levels.easy.width);
  const [height, setHeight] = useState(levels.easy.height);
  const [curvature, setCurvature] = useState(1);
  // const [start, setStart] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [animating, setAnimating] = useState(false);
  const [instructions, setInstructions] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [page, setPage] = useState(0);
  const [results, setResults] = useState({});
  const [move, setMove] = useState({ x: 0, y: 0 });
  const [kernals, setKernals] = useState([]);
  const [currentKernal, setCurrentKernal] = useState({ x: 0, y: 0, justPopped: false });
  const [focusKernal, setFocusKernal] = useState({ x: width / 2, y: 1, offset: 0 });
  const [display, setDisplay] = useState('normal');
  const [timer, setTimer] = useState(gameDuration);
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
      if (kernal.end) {
        console.log('this is being triggered', animating);
        setResults({ won: true });
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

      setKernals(kernals);
    }

    setCurrentKernal({ x, y, justPopped });
  }, [move]); // TODO add popcount here and to useState

  const randomColor = base => colors[base][Math.floor(Math.random() * colors[base].length)];

  useEffect(() => {
    setWidth(levels[difficulty].width);
    setHeight(levels[difficulty].height);
    setFocusKernal({ x: levels[difficulty].width / 2, y: 0, offset: 0 });
  }, [difficulty]);


  // create the maze
  useEffect(() => {
    const { start, end, cells } = new Maze(height / 2, width / 2);
    const nextKernals = [];
    let id = 0;
    cells.forEach((row, y) => {
      row.forEach((kernal, x) => {
        const color = randomColor(kernal ? 'browns' : 'yellows');
        const type = kernal ? 'wall' : 'path';
        const popped = false;
        nextKernals.push({ id, x, y, color, type, popped, start: x === 0 && y === start, end: x === width && y === end });
        id += 1;
      });
    });
    setKernals(() => nextKernals);
    setFocusKernal({ x: width / 2, y: 0, offset: 0 });
    // setCurrentKernal({ x: width / 2, y: start, justPopped: false });
    // setMove({ x: 0, y: 0 });
  }, [width, height]);

  useEffect(() => {
    addEventListener('keydown', handleKeydown);
    return () => {
      removeEventListener('keydown', handleKeydown);
    };
  }, [instructions, results, animating]);

  useEffect(() => {
    if (playing) {
      interval = setInterval(() => setTimer(
        (prevTimer) => {
          if (prevTimer === 1) endGame();
          return (prevTimer - 1);
        },
      ), 1000);
    }

    return () => {
      console.log('startedReturned');
      clearInterval(interval);
    };
  }, [playing]);

  useEffect(() => {
    // console.log('instructions?', instructions);
  }, [instructions]);

  const startGame = () => {
    console.log('start game');
    setAnimating(true);
    const startKernal = kernals.find(kernal => kernal.start);
    const endKernal = kernals.find(kernal => kernal.end);
    setTimer(gameDuration);
    setFocusKernal({ x: startKernal.x, y: startKernal.y, offset: -2 });
    setPage(1);
    setTimeout(() => {
      setPage(2);
      setFocusKernal({ x: endKernal.x, y: endKernal.y, offset: 2 });
    }, 3000);
    setTimeout(() => {
      setPage(3);
      setFocusKernal({ x: width / 2, y: 0, offset: 0 })
    }, 6000);
    setTimeout(() => {
      setCurrentKernal({ x: startKernal.x, y: startKernal.y })
      setAnimating(false);
      setInstructions(false);
      setPlaying(true);
    }, 7500);
    analytics.track('start', { difficulty: 'medium' });
  };

  const endGame = () => {
    clearInterval(interval);
    setPlaying(false);
    setResults({ won: false, reason: 'time' });
  }

  const playAgain = () => {
    setPage(0)
    setResults({});
    setInstructions(true);
  };

  return (
    <div className="app">
      <Canvas
        ref={canvasRef}
        shadows={{ type: PCFSoftShadowMap }}
        camera={{ fov: 60 }}
        dpr={0.5}

      >
        <fog attach="fog" color="black" near={10} far={display === 'normal' ? 15 : 100} />


        {/* <OrbitControls /> */}
        {/* {display === 'normal' && (<CameraShake {...camshakeConfig} />)} */}
        <Corn
          canvasRef={canvasRef}
          kernals={kernals}
          currentKernal={currentKernal}
          focusKernal={focusKernal}
          setMove={setMove}
          width={width}
          height={height}
          curvature={curvature}
          display={display}
        />
        <directionalLight
          intensity={1}
          position={[0, 10, 5]}
          target-position={[0, 0, -5]}
          castShadow
          shadow-mapSize={1024}
          shadow-bias={-0.00001}
        />
        <Environment
          files={envMap}
          background
          blur={0.4}
        />
        {/* <EffectComposer>
          <ToneMapping 
            blendFunction={BlendFunction.NORMAL} // blend mode
            adaptive={true} // toggle adaptive luminance map usage
            resolution={256} // texture resolution of the luminance map
            middleGrey={0.6} // middle grey factor
            maxLuminance={16.0} // maximum luminance
            averageLuminance={1.0} // average luminance
            adaptationRate={1.0} // luminance adaptation rate
          />
        </EffectComposer> */}
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
        playing={playing}
        animating={animating}
        page={page}
      />
      <Results
        results={results}
        setResults={setResults}
        playAgain={playAgain}
        result={{}}
        popCount={popCount}
        timer={timer}
        kernals={kernals}
      />
      {false && (<div className="debug">
        <button
          type="button"
          onClick={() => { setDisplay(display === 'normal' ? 'grid' : 'normal'); }}
        >Display
        </button>
        <input
          type="range"
          min="6"
          max="60"
          step="2"
          value={width}
          onChange={({ target }) => { setWidth(parseInt(target.value, 10)); }
          }
        />
        <input
          type="range"
          min="6"
          max="60"
          step="2"
          value={height}
          onChange={
            ({ target }) => { setHeight(parseInt(target.value, 10)); }
          }
        />
        <input
          type="range"
          min="0"
          max="10"
          value={curvature}
          onChange={
            ({ target }) => {
              setCurvature(target.value);
            }
          }
        />
      </div>)}
      {(playing && mobile) && (
        <Joystick
          size={100}
          sticky={false}
          throttle={200}
          move={({ direction }) => {
            if (direction === 'BACKWARD') setMove({ x: 0, y: 1 });
            if (direction === 'FORWARD') setMove({ x: 0, y: -1 });
            if (direction === 'LEFT') setMove({ x: -1, y: 0 });
            if (direction === 'RIGHT') setMove({ x: 1, y: 0 });
          }}
          stop={() => { }}
        ></Joystick>
      )}
    </div>
  );
};
export default App;
