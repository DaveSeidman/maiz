// TODO: change 'normal' to 'path'
// TODO: remove all !important's in CSS
// TODO: better color on close / open instructions buttons
// TODO: use some textures and normal maps
import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
// import { EffectComposer, DepthOfField, Bloom, Vignette, ChromaticAberration, Noise, SSAO, ToneMapping } from '@react-three/postprocessing';
import { Environment, CameraShake, OrbitControls } from '@react-three/drei';
import { PCFSoftShadowMap, Color } from 'three';
import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';
// import { BlendFunction } from 'postprocessing';
import { Joystick } from 'react-joystick-component';
import Mobile from 'is-mobile';
import Footer from './components/Footer';
import Corn from './components/Corn';
import Instructions from './components/Instructions';
import Results from './components/Results';
import Score from './components/Score';
import envMap from './assets/images/spaichingen_hill_2k.hdr';
import Maze from './components/Maze';
import { camshakeConfig, levels, randomColor, gameDuration } from './config';

import './index.scss';

const mobile = Mobile();

const analytics = Analytics({
  app: 'website data',
  plugins: [
    googleAnalytics({
      measurementIds: ['G-33LFT6EBGE'],
    }),
  ],
});

function App() {
  const canvasRef = useRef();

  const [width, setWidth] = useState(levels.medium.width);
  const [height, setHeight] = useState(levels.medium.height);
  const [curvature, setCurvature] = useState(1);
  const [difficulty, setDifficulty] = useState('medium');

  const [animating, setAnimating] = useState(false);
  const [instructions, setInstructions] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [page, setPage] = useState(0);
  const [results, setResults] = useState({});
  const [timer, setTimer] = useState(gameDuration);
  const [tabActive, setTabActive] = useState(true);

  const [kernals, setKernals] = useState([]);
  const [currentKernal, setCurrentKernal] = useState({ x: 0, y: 0, justPopped: false });
  const [focusKernal, setFocusKernal] = useState({ x: levels[difficulty].width / 2, y: 0, offset: 0 });
  const [display, setDisplay] = useState('normal');
  const [move, setMove] = useState({ x: 0, y: 0 });

  const [popCount, setPopCount] = useState(0);

  const handleKeydown = ({ key }) => {
    if (!playing) return;
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
    if (key === 'Escape') setInstructions(false);
  };

  const handleTabActive = (e) => {
    setTabActive(e.type === 'focus');
  };

  const createMaze = () => {
    const { start, end, cells } = new Maze(height / 2, width / 2);
    const nextKernals = [];
    let id = 0;
    cells.forEach((row, y) => {
      row.forEach((kernal, x) => {
        const type = kernal ? 'wall' : 'path';
        const color = randomColor(type === 'wall' ? 'browns' : 'yellows');
        const popped = false;
        nextKernals.push({ id, x, y, color, type, popped, start: x === 0 && y === start, end: x === width && y === end });
        id += 1;
      });
    });
    setKernals(() => nextKernals);
  };

  const startGame = () => {
    setAnimating(true);
    const startKernal = kernals.find((kernal) => kernal.start);
    const endKernal = kernals.find((kernal) => kernal.end);
    setTimer(gameDuration);
    setPopCount(0);
    setFocusKernal({ x: startKernal.x, y: startKernal.y, offset: -2 });
    setPage(1);
    setTimeout(() => {
      setPage(2);
      setFocusKernal({ x: endKernal.x, y: endKernal.y, offset: 2 });
    }, 1000);
    setTimeout(() => {
      setPage(3);
      setFocusKernal({});
    }, 3000);
    setTimeout(() => {
      // setFocusKernal({ x: startKernal.x, y: startKernal.y, offset: 0 });
      setCurrentKernal({ x: startKernal.x, y: startKernal.y });
      setAnimating(false);
      setInstructions(false);
      setPlaying(true);
      analytics.track('start', { difficulty });
    }, 5000);
  };

  const endGame = (won) => {
    // clearInterval(interval);
    setPlaying(false);
    setFocusKernal({ x: width / 2, y: currentKernal.y, offset: 0 });
    setResults({ won });
    analytics.track('end', { won, difficulty: 'medium' });
  };

  const playAgain = () => {
    setPage(0);
    setResults({});
    createMaze();
    // setWidth(levels[difficulty].width);
    // setHeight(levels[difficulty].height);

    setInstructions(true);
  };

  useEffect(() => {
    const x = currentKernal.x + move.x;
    let y = currentKernal.y + move.y;
    if (x < 0 || x > width) return;
    if (y > height - 1) y = 0;
    if (y < 0) y = height - 1;

    const kernal = kernals.find((k) => k.x === x && k.y === y);
    // console.log({ x, y, kernals });

    let justPopped = false;
    if (kernal) {
      if (kernal.type === 'wall') {
        setCurrentKernal({ x: currentKernal.x, y: currentKernal.y, justPopped });
        return;
      }
      // TODO: implement focusKernal complete and then remove the check for animating here
      if (kernal.end) {
        endGame(true);
      }
      if (!kernal.popped) {
        justPopped = true;
        kernal.popped = true;
        setPopCount(popCount + 1);
      }
      // setKernals(kernals);
    }
    setCurrentKernal({ x, y, justPopped });
  }, [move]);

  useEffect(() => {
    setWidth(levels[difficulty].width);
    setHeight(levels[difficulty].height);
    setFocusKernal({ x: levels[difficulty].width / 2, y: 0, offset: 0 });
  }, [difficulty]);

  // create the maze
  useEffect(() => {
    createMaze();
    // setFocusKernal({ x: width / 2, y: 0, offset: 0 });
    // setCurrentKernal({ x: width / 2, y: start, justPopped: false });
    // setMove({ x: 0, y: 0 });
  }, [width, height]);

  useEffect(() => {
    addEventListener('keydown', handleKeydown);
    addEventListener('blur', handleTabActive);
    addEventListener('focus', handleTabActive);
    return () => {
      removeEventListener('keydown', handleKeydown);
      removeEventListener('blur', handleTabActive);
      removeEventListener('focus', handleTabActive);
    };
  }, [instructions, results, animating]); // TODO: double check this dependency array

  useEffect(() => {
    let interval;

    if (playing && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
      endGame(false);
      // You can trigger some action here when the timer reaches zero
    }

    return () => {
      clearInterval(interval);
    };
  }, [playing, timer]);

  return (
    <div className="app">
      <Canvas
        ref={canvasRef}
        shadows={{ type: PCFSoftShadowMap }}
        camera={{ fov: 60 }}
        dpr={0.5}
      >
        <fog attach="fog" color={new Color('rgb(128, 155, 175)')} near={10} far={display === 'normal' ? 15 : 100} />
        {/* <OrbitControls /> */}
        {/* {display === 'normal' && (<CameraShake {...camshakeConfig} />)} */}
        <Corn
          tabActive={tabActive}
          playing={playing}
          animating={animating}
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
            // clearInterval(interval);
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
      {false && (
        <div className="debug">
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
            onChange={({ target }) => { setWidth(parseInt(target.value, 10)); }}
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
        </div>
      )}
      {((playing || animating) && mobile) && (
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
        />
      )}
    </div>
  );
}
export default App;
