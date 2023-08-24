// 🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨
// 🟨🟫🟫🟫🟨🟫🟫🟫🟨🟤🟨🟫🟫🟫🟨
// 🟨🟫🟤🟫🟨🟫🟡🟫🟨🟫🟨🟨🟤🟨🟨
// 🟨🟫🟨🟫🟨🟫🟨🟫🟨🟫🟨🟫🟫🟫🟨
// 🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨

// TODO: remove all !important's in CSS
// TODO: check performance / movement on android
// TODO: better color on buttons
// TODO: try some textures and normal maps
// TODO: add more popped kernals in blender
// TODO: make sound effects on explode
// TODO: directional light shadows not working
// TODO: use texture for popped kernals
// TODO: add husk
// TODO: on mobile if you click fast enough you can go "through" kernals without popping them and then they are stuck
// TODO: EffectComposer crashes on mobile occasionally
// TODO: move / rotation speed on android 10x too slow
// TODO: add husk
// TODO: add sound effect for rotating, sliding
// TODO: increase shake with timer
import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, CameraShake, PerformanceMonitor } from '@react-three/drei';
import { PCFSoftShadowMap, Color } from 'three';
import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';
import { EffectComposer, DepthOfField, Bloom, Vignette, ChromaticAberration, Noise, SSAO, ToneMapping } from '@react-three/postprocessing';
import { BlendFunction, RenderPass } from 'postprocessing';
import { Joystick } from 'react-joystick-component';
import Mobile from 'is-mobile';
import { RWebShare } from 'react-web-share';
import Footer from './components/Footer';
import Corn from './components/Corn';
import Instructions from './components/Instructions';
import Results from './components/Results';
import Score from './components/Score';
import envMap from './assets/images/spaichingen_hill_2k.hdr';
import Maze from './components/Maze';
import { levels, randomColor, gameDuration } from './config';
import pop1 from './assets/audio/pop1.mp3';
import pop2 from './assets/audio/pop2.mp3';
import pop3 from './assets/audio/pop3.mp3';
import pop4 from './assets/audio/pop4.mp3';
import pop5 from './assets/audio/pop5.mp3';
import pop6 from './assets/audio/pop6.mp3';
import pop7 from './assets/audio/pop7.mp3';
import './index.scss';

const soundEffectFiles = [pop1, pop2, pop3, pop4, pop5, pop6, pop7];
const soundEffectPlayers = soundEffectFiles.map((file) => {
  const player = document.createElement('audio');
  player.src = file;
  return player;
});

// console.log(soundEffectPlayers);

const mobile = Mobile();
const local = location.hostname === 'localhost'; // false

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
  // const soundEffectRef = useRef();
  const fakeShareButton = useRef();

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
  const [popCount, setPopCount] = useState(0);
  const [tabActive, setTabActive] = useState(true);
  const [explode, setExplode] = useState(false);
  const [shakeFrequency, setShakeFrequency] = useState(0.5);
  const [share, setShare] = useState(false);

  const [kernals, setKernals] = useState([]);
  const [currentKernal, setCurrentKernal] = useState({ x: 0, y: 0, justPopped: false });
  const [focusKernal, setFocusKernal] = useState({ x: levels[difficulty].width / 2, y: 0, offset: 0 });
  const [display, setDisplay] = useState('normal');
  const [move, setMove] = useState({ x: 0, y: 0 });

  const [performance, setPerformance] = useState('normal');

  const dprs = {
    low: 0.25,
    normal: 0.75,
    high: 1,
  };
  // const [dpr, setDpr] = useState(0.75);

  const handleKeydown = ({ key }) => {
    const keys = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };

    if (!playing) return;
    const nextMove = keys[key];
    if (nextMove) setMove(nextMove);
    if (key === 'Escape') setInstructions(!instructions);
  };

  const handleTabActive = (e) => {
    setTabActive(e.type === 'focus');
  };

  const createMaze = () => {
    const { startCell, endCell, cells } = new Maze(height / 2, width / 2);
    const nextKernals = [];
    let id = 0;
    cells.forEach((row, y) => {
      row.forEach((kernal, x) => {
        const type = kernal ? 'wall' : 'path';
        const color = randomColor(type === 'wall' ? 'browns' : 'yellows');
        const start = x === 0 && y === startCell;
        const end = x === width && y === endCell;
        const popped = start || end;
        const direction = undefined;
        nextKernals.push({ id, x, y, color, type, popped, start, end, direction });
        id += 1;
      });
    });
    setKernals(() => nextKernals);
    setCurrentKernal({ x: 0, y: startCell });
  };

  const startGame = () => {
    setAnimating(true);
    const startKernal = kernals.find((kernal) => kernal.start);
    const endKernal = kernals.find((kernal) => kernal.end);
    // setShakeFrequency(0.5);
    setTimer(gameDuration);
    setPopCount(0);
    setFocusKernal({ x: startKernal.x, y: startKernal.y, offset: -2 });
    setPage(1);
    setTimeout(() => {
      setPage(2);
      setFocusKernal({ x: endKernal.x, y: endKernal.y, offset: 2 });
    }, local ? 20 : 2000);
    setTimeout(() => {
      setPage(3);
      setFocusKernal({});
    }, local ? 40 : 4000);
    setTimeout(() => {
      setCurrentKernal({ x: startKernal.x, y: startKernal.y });
      setMove({ x: 0, y: 0 });
      setAnimating(false);
      setInstructions(false);
      setPlaying(true);
      analytics.track('start', { difficulty });
    }, local ? 60 : 6000);
    setTimeout(() => {
      setPage(4);
    }, local ? 80 : 8000);
  };

  const continueGame = () => {
    setInstructions(false);
    setPlaying(true);
  };

  const endGame = (won) => {
    setExplode(true);
    setPlaying(false);
    setTimeout(() => {
      setFocusKernal({ x: width / 2, y: currentKernal.y, offset: 0 });
    }, 1000);
    setResults({ won });
    analytics.track('end', { won, difficulty: 'medium' });
  };

  const playAgain = () => {
    setPage(0);
    setResults({});
    setFocusKernal({ x: width / 2, y: 0, offset: 0 });
    createMaze();
    setInstructions(true);
  };

  // Move Event
  // TODO: consider making this a string: up, down, left, right
  useEffect(() => {
    const x = currentKernal.x + move.x;
    let y = currentKernal.y + move.y;
    if (x < 0 || x > width) return;
    if (y > height - 1) y = 0;
    if (y < 0) y = height - 1;

    let direction;
    if (move.x !== 0) direction = move.x > 0 ? 'right' : 'left';
    if (move.y !== 0) direction = move.y > 0 ? 'down' : 'up';
    const kernal = kernals.find((k) => k.x === x && k.y === y);

    let justPopped = false;
    if (kernal) {
      if (kernal.type === 'wall') {
        setCurrentKernal({ x: currentKernal.x, y: currentKernal.y, justPopped, direction });
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
        soundEffectPlayers[Math.floor(Math.random() * soundEffectPlayers.length)].play();
        // soundEffectRef.current.src = soundEffects[Math.floor(Math.random() * soundEffects.length)];
        // soundEffectRef.current.play();
      }
    }
    setCurrentKernal({ x, y, justPopped, direction });
  }, [move]);

  useEffect(() => {
    setWidth(levels[difficulty].width);
    setHeight(levels[difficulty].height);
    setFocusKernal({ x: levels[difficulty].width / 2, y: 0, offset: 0 });
  }, [difficulty]);

  // create the maze
  useEffect(() => {
    createMaze();
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
    }

    return () => {
      clearInterval(interval);
    };
  }, [playing, timer]);

  useEffect(() => {
    const percentComplete = (gameDuration - timer) / gameDuration;
    // setShakeFrequency(0.5 + percentComplete);
  }, [timer]);

  useEffect(() => {
    console.log(share, fakeShareButton.current);
    if (share && fakeShareButton.current) fakeShareButton.current.click();
  }, [share]);

  return (
    <div className="app">
      {/* <audio ref={soundEffectRef} /> */}
      <Canvas
        ref={canvasRef}
        shadows={{ type: PCFSoftShadowMap }}
        camera={{ fov: 60, far: 28 }}
        dpr={dprs[performance]}
      >
        <PerformanceMonitor
          onIncline={() => {
            // setDpr(1);
            setPerformance('high');
          }}
          onDecline={() => {
            // setDpr(0.5);
            setPerformance('low');
          }}
        >

          {/* <fog attach="fog" color={new Color('rgb(128, 155, 175)')} near={10} far={display === 'normal' ? 15 : 100} /> */}
          <CameraShake
            maxYaw={0.005}
            maxPitch={0.005}
            maxRoll={0.005}
            yawFrequency={shakeFrequency}
            pitchFrequency={shakeFrequency}
            rollFrequency={shakeFrequency}
          />
          <EffectComposer
            enabled={performance === 'normal' || performance === 'high'}
          >
            <Corn
              tabActive={tabActive}
              playing={playing}
              animating={animating}
              explode={explode}
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
              position={[10, 4, 3]}
              target-position={[5, 0, 0]}
              castShadow
              shadow-mapSize={256}
              shadow-bias={0.0001}
            />
            <ambientLight intensity={-0.5} />
            <Environment
              files={envMap}
              background
              blur={0.3}
            />
            <DepthOfField enabled={false} focusDistance={0.3} focalLength={0.25} bokehScale={4} height={256} />
            {/* <ChromaticAberration offset={[mobile ? 0.006 : 0.004, 0.0]} /> */}
            {/* <Bloom luminanceThreshold={0.95} luminanceSmoothing={0.02} intensity={0.2} /> */}
          </EffectComposer>
        </PerformanceMonitor>
      </Canvas>
      <Score
        timer={timer}
        popCount={popCount}
        kernals={kernals}
      />
      <button
        className={`instructionsToggle ${(instructions || results.won !== undefined) ? 'hidden' : ''}`}
        type="button"
        onClick={() => {
          // TODO: maybe just set playing to false here
          setInstructions(true);
          setPlaying(false);
        }}
      >
        ?
      </button>
      <Footer setShare={setShare} />
      <Instructions
        instructions={instructions}
        setInstructions={setInstructions}
        startGame={startGame}
        continueGame={continueGame}
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
        setShare={setShare}
      />
      {/* {false && (
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
      )} */}
      <div className={`joystick ${((playing || animating) && !instructions && mobile) ? '' : 'hidden'}`}>
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
      </div>
      {share && (
        <RWebShare
          data={{ text: 'test', url: 'https://maiz.uno', title: 'best corn game' }}
          sites={['twitter', 'facebook', 'linkedin', 'reddit', 'mail', 'copy']}
          onClick={() => {
            setShare(false);
            console.log('here');
          }}
          onClose={() => {
            setShare(false);
          }}
        >
          <button ref={fakeShareButton} />
        </RWebShare>
      )}
    </div>
  );
}
export default App;
