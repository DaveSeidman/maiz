// TODO: increase and decrease rotations with dragging as well
// TODO: changing heights doesn't have effect here
// TODO: Dracoloader needs to be, reproduce by testing site offline
// TODO: figure out why endkernal is being scaled to 0 even if we remove the .popped in App.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import PropTypes from 'prop-types';

import { MeshStandardMaterial, Object3D, Vector3, Matrix4, TextureLoader, MeshPhysicalMaterial, Color, MeshNormalMaterial } from 'three';
import { degToRad, lerp } from 'three/src/math/MathUtils';
import { colors, randomColor } from '../../config';
import kernalModel from '../../assets/models/models.glb';
import grayImage from '../../assets/images/gray.jpg';

const scaleZero = new Matrix4().makeScale(0, 0, 0);
let spin = 0;
let targetRotation = 0;
let targetPosition = 0;
let lerpAmount = 1;

let prevKernal = {}; // TODO: may be a better way to handle this with state.previous?
let prevFocusKernal = {};

const kernalWidth = 1;
const pointer = { x: null, y: null, down: false, startX: 0, startY: 0 };
const pointerMovementThreshold = 10;
const kernalLifeThreshold = 300;
const poppedKernals = [];

function Corn(props) {
  const { tabActive, playing, animating, explode, canvasRef, setMove, currentKernal, focusKernal, kernals, width, height, curvature, display } = props;
  const gltf = useGLTF(kernalModel);
  const { camera } = useThree();

  const [useSpin, setUseSpin] = useState(false);
  const [rotations, setRotations] = useState(0);
  const [texture, setTexture] = useState();
  const [endKernalIndex, setEndKernalIndex] = useState(-1);

  const groupRef = useRef();
  const cobRef = useRef();
  const kernalsRef = useRef();
  const basesRef = useRef();
  const kernalMatRef = useRef();

  const endKernal = useRef();
  const playerRef = useRef();
  const playerRefTarget = useRef();
  const playerTargetChildRef = useRef();
  const playerChildRef = useRef();
  const elapsedTime = 0;
  // let endKernalIndex;

  const kernalMesh = gltf.scene.children.find((child) => child.name === 'Kernal');
  const baseMesh = gltf.scene.children.find((child) => child.name === 'Base');
  const cursorMesh = gltf.scene.children.find((child) => child.name === 'Cursor');
  const playerMesh = gltf.scene.children.find((child) => child.name === 'Arrow2');
  const poppedMeshes = gltf.scene.children.filter((child) => child.name.indexOf('Popped') >= 0);
  const kernalMaterial = new MeshStandardMaterial({ roughness: 0.2, metalness: 0.4 });
  const baseMaterial = new MeshStandardMaterial({ roughness: 0.9, metalness: 0.1, color: 0xf4e8a3 });
  const cursorMaterial = new MeshPhysicalMaterial({ roughness: 0.05, metalness: 0.2, ior: 1.0, color: 0xdd44dd, reflectivity: 0.8, transmission: 0.9, thickness: 0.5, opacity: 0, envMapIntensity: 2 });
  const poppedMaterial = new MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0xfefefe });

  const highlightColor1 = colors.yellows[0];
  // const highlightColor2 = new Color('rgb(255, 255, 255)');
  const highlightColor2 = new Color('hsl(100, 100%, 70%)');
  const highlightColor = highlightColor1.clone();

  const loader = new TextureLoader();
  loader.load(grayImage, (_texture) => {
    setTexture(_texture);
    kernalMatRef.needsUpdate = true;
  });

  const kernalIndex = (kernal) => (kernal.y * (width + 1)) + kernal.x;

  const positionToGrid = (object, kernal) => {
    object.position.set(kernal.x, kernal.y + height / -2, 0);
    object.rotation.set(Math.PI / 2, 0, 0);
    // const scale = kernal.popped ? 0 : 0.9;
    if (kernal.popped) object.scale.set(0, 0, 0);
    else object.scale.set(0.9, 0.1, 0.7);
    object.updateMatrix();
  };

  const positionToCylindar = (object, kernal, type) => {
    const { x } = kernal;
    const arc = (height / 2) / Math.PI;
    // position around cylindar, barrel outwards towards the middle
    const y = Math.cos(kernal.y / arc) * (((height / 2) / Math.PI) + (curvature * (Math.sin((x / width) * Math.PI) / 2) - 1));
    const z = Math.sin(kernal.y / arc) * (((height / 2) / Math.PI) + (curvature * (Math.sin((x / width) * Math.PI) / 2) - 1));
    const rotation = (kernal.y / height) * (Math.PI * 2);
    object.position.set(x, y, z);
    object.rotation.set(rotation, 0, 0);
    const scale = type === 'kernal' ? (kernal.popped || kernal.end ? 0 : 1) : 1;
    object.scale.set(scale, scale, scale);
    object.updateMatrix();
  };

  const blendMatrices = (object1, object2, amount) => {
    object1.position.lerp(object2.position, amount);
    object1.rotation.x = lerp(object1.rotation.x, object2.rotation.x, amount);
    object1.scale.lerp(object2.scale, amount);
    object1.updateMatrix();
  };

  const positionKernals = () => {
    const kernalsOnGrid = new Object3D();
    const kernalsOnCylindar = new Object3D();
    const basesOnCylindar = new Object3D();
    kernals.forEach((kernal, index) => {
      if (kernal.end) setEndKernalIndex(index);

      positionToGrid(kernalsOnGrid, kernal);
      positionToCylindar(kernalsOnCylindar, kernal, 'kernal');
      positionToCylindar(basesOnCylindar, kernal, 'base');
      blendMatrices(kernalsOnGrid, kernalsOnCylindar, lerpAmount);
      kernalsRef.current.setMatrixAt(index, kernalsOnGrid.matrix);
      kernalsRef.current.setColorAt(index, kernal.color);
      basesRef.current.setMatrixAt(index, basesOnCylindar.matrix);
    });
    kernalsRef.current.instanceMatrix.needsUpdate = true;
    basesRef.current.instanceMatrix.needsUpdate = true;
    kernalsRef.current.instanceColor.needsUpdate = true;
  };

  const popKernal = (kernal) => {
    const index = kernalIndex(kernal);
    // const prevIndex = kernalIndex(prevKernal);
    const matrix = new Matrix4();
    kernalsRef.current.getMatrixAt(index, matrix);
    matrix.multiply(scaleZero);
    kernalsRef.current.setMatrixAt(index, matrix);
    kernalsRef.current.instanceMatrix.needsUpdate = true;

    const poppedKernal = poppedMeshes[Math.floor(Math.random() * poppedMeshes.length)].clone();
    poppedKernal.material = poppedMaterial;
    positionToCylindar(poppedKernal, kernal, 'kernal');
    // poppedKernal.position.y -= 2;
    // add it to the cob
    cobRef.current.add(poppedKernal);
    poppedKernal.updateMatrix();
    // get it's world position
    const worldPos = new Vector3();
    poppedKernal.getWorldPosition(worldPos);
    const velocity = new Vector3(0, -worldPos.y * (Math.random() * 0.125), -worldPos.z * (Math.random() * 0.125));
    // remove it from the cob, add it to the world so it's not affected by
    // the cobs translations or rotations, and instead follows gravity
    groupRef.current.add(poppedKernal);
    poppedKernal.position.copy(worldPos);
    poppedKernals.push({
      mesh: poppedKernal,
      life: 0,
      velocity,
      gravity: 0,
      rotation: new Vector3(Math.random() * Math.PI / 2, Math.random() * Math.PI / 2, Math.random() * Math.PI / 2),
    });
  };

  useEffect(() => {
    positionKernals();
  }, [kernals, curvature, display]);

  // currentKernal updated
  useEffect(() => {
    // adjust cob position / rotation
    targetPosition = -currentKernal.x;
    targetRotation = (currentKernal.y / height) * Math.PI * -2;

    const object = new Object3D();

    if (display === 'normal') {
      positionToCylindar(object, currentKernal, 'kernal');
      // positionToCylindar2(objectTemp, currentKernal);
    }
    if (display === 'grid') {
      positionToGrid(object, currentKernal);
      object.position.z = -3;
    }
    // handle "overrotations", when going from near 0 to near 360 we get a jump in how we're easing our rotation
    // this will set a rotations counter to be added to the targetRotations to preven that jump
    if (currentKernal.y === height - 1 && prevKernal.y === 0) setRotations(rotations - 1);
    if (currentKernal.y === 0 && prevKernal.y === height - 1) setRotations(rotations + 1);

    // set cursor position
    playerRefTarget.current.position.copy(object.position);

    const { start } = kernals.find((kernal) => kernal.x === currentKernal.x && kernal.y === currentKernal.y);
    playerRefTarget.current.rotation.copy(object.rotation);
    playerRef.current.rotation.copy(object.rotation);
    if (currentKernal.x === prevKernal.x && currentKernal.y === prevKernal.y) {
      // console.log('bump the player so they know they hit a wall');
    }

    if (start) {
      // if (currentKernal.x === prevKernal.x && currentKernal.y === prevKernal.y) {
      // console.log('didnt move');
      playerTargetChildRef.current.rotation.y = degToRad(0);
    } else {
      // playerRefTarget.current.rotation.copy(object.rotation);
      // playerRef.current.rotation.copy(object.rotation);

      // Rotate to match heading
      // TODO: this occasionally flips if we're at the cylindar's wrapping point
      // console.log(currentKernal.y, prevKernal.y, height);
      if (currentKernal.x > prevKernal.x) {
        // console.log('face right');
        playerTargetChildRef.current.rotation.y = degToRad(0);
      }
      if (currentKernal.x < prevKernal.x) {
        // console.log('face left');
        playerTargetChildRef.current.rotation.y = degToRad(180);
      }
      if (currentKernal.y < prevKernal.y) {
        // console.log('face up');
        playerTargetChildRef.current.rotation.y = degToRad(prevKernal.y ? 90 : 270);
      }
      if (currentKernal.y > prevKernal.y) {
        // console.log('face down');
        playerTargetChildRef.current.rotation.y = degToRad(currentKernal.y ? 270 : 90);
      }
    }

    if (currentKernal.justPopped) {
      popKernal(currentKernal);
    }

    setUseSpin(false);
    prevKernal = JSON.parse(JSON.stringify(currentKernal));
  }, [currentKernal]);

  useEffect(() => {
    if (focusKernal.x !== undefined && focusKernal.y !== undefined) {
      targetPosition = -focusKernal.x + focusKernal.offset;
      targetRotation = (focusKernal.y / height) * Math.PI * -2;
    } else {
      targetPosition = -width / 2;
    }
    if (prevFocusKernal.x !== undefined) {
      const index = kernalIndex(prevFocusKernal);
      const kernal = kernals[index];
      kernalsRef.current.setColorAt(index, randomColor(kernal.type === 'path' ? 'yellows' : 'browns'));
      kernalsRef.current.instanceColor.needsUpdate = true;
    }
    prevFocusKernal = JSON.parse(JSON.stringify(focusKernal));
  }, [focusKernal]);

  useEffect(() => {
    if (explode) {
      kernals.forEach((kernal) => {
        if (kernal.type === 'path' && !kernal.popped) {
          popKernal(kernal);
        }
      });
    }
  }, [explode]);

  useFrame((e, timeDiff) => {
    // console.log(endKernalIndex);
    // if (!tabActive) return;
    // elapsedTime += timeDiff;

    if (!(playing || animating) && tabActive) {
      // TODO: this should be fixed to be more robust
      if (timeDiff < 1) { targetRotation += timeDiff / 4; }
    }

    if (playerRef.current && playerRefTarget.current) {
      playerRef.current.position.x += (playerRefTarget.current.position.x - playerRef.current.position.x) / 10;
      playerRef.current.position.y += (playerRefTarget.current.position.y - playerRef.current.position.y) / 10;
      playerRef.current.position.z += (playerRefTarget.current.position.z - playerRef.current.position.z) / 10;
      // console.log(playerTargetChildRef.current.rotation.y);
      playerChildRef.current.rotation.y += (playerTargetChildRef.current.rotation.y - playerChildRef.current.rotation.y) / 10;
    }

    spin *= 0.9;
    const lerpDifference = (display === 'normal' ? 1 : 0) - lerpAmount;
    if (Math.abs(lerpDifference) > 0.001) {
      lerpAmount += (lerpDifference) / (20);
      positionKernals();
    }

    if (display === 'normal') {
      cobRef.current.position.x += (targetPosition - cobRef.current.position.x) / 20;

      if (useSpin) {
        cobRef.current.rotation.x += timeDiff * spin;
      } else {
        cobRef.current.rotation.x += (((targetRotation + (degToRad(90))) - (rotations * (Math.PI * 2))) - cobRef.current.rotation.x) / 30;
      }
    } else {
      cobRef.current.rotation.x = Math.PI;
      cobRef.current.position.x = -width / 2;
    }

    poppedKernals.forEach((kernal, index) => {
      kernal.life += (timeDiff * 100);
      kernal.velocity.multiplyScalar(0.975);
      kernal.gravity -= 0.005;
      // kernal.velocity.y -= timeDiff;
      kernal.mesh.position.add(kernal.velocity).add(new Vector3(0, kernal.gravity, 0));
      kernal.mesh.rotateOnAxis(kernal.rotation, 0.05);
      if (kernal.life >= kernalLifeThreshold) {
        groupRef.current.remove(kernal.mesh);
        poppedKernals.splice(index, 1);
      }
    });
  }, []);

  const moveCob = ({ deltaX, deltaY }) => {
    if (!playing) return;
    setUseSpin(true);
    targetPosition += -deltaX / 100;
    if (targetPosition > 0) targetPosition = 0;
    if (targetPosition < -width) targetPosition = -width;
    spin += -deltaY / 100;
  };

  const dragStart = (e) => {
    pointer.down = true;
    pointer.x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    pointer.y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    pointer.startX = pointer.x;
    pointer.startY = pointer.y;
  };

  const drag = (e) => {
    if (!playing) return;
    if (!pointer.down) return;
    setUseSpin(true);
    const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    if (pointer.x) targetPosition += (pointer.x - x) / -25;
    if (targetPosition > 0) targetPosition = 0;
    if (targetPosition < -width) targetPosition = -width;
    if (pointer.y) spin -= (pointer.y - y) / 25;
    pointer.x = x;
    pointer.y = y;
  };

  const dragEnd = () => {
    pointer.down = false;
  };

  const clickToMove = (e) => {
    if (!playing) return;
    // eslint-disable-next-line
    const pointerMovement = Math.sqrt(Math.pow((pointer.startX - pointer.x), 2) + Math.pow((pointer.startY - pointer.y), 2));
    if (pointerMovement < pointerMovementThreshold) {
      // TODO: check these multipliers
      const clickX = 1.666 * ((e.clientX / window.innerWidth) - 0.5);
      const clickY = -1.25 * ((e.clientY / window.innerHeight) - 0.5);

      const kernalScreenPosition = new Vector3();
      kernalScreenPosition.setFromMatrixPosition(playerRef.current.matrixWorld);
      kernalScreenPosition.project(camera);
      const moveX = clickX - kernalScreenPosition.x;
      const moveY = clickY - kernalScreenPosition.y;
      const move = { x: 0, y: 0 };
      if (Math.abs(moveX) > Math.abs(moveY)) {
        move.x = moveX > 0 ? 1 : -1;
      } else {
        move.y = moveY > 0 ? -1 : 1;
      }
      setMove(move);
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousewheel', moveCob, { passive: true });
      canvasRef.current.addEventListener('touchstart', dragStart, { passive: true });
      canvasRef.current.addEventListener('pointerdown', dragStart, { passive: true });
      canvasRef.current.addEventListener('pointermove', drag, { passive: true });
      canvasRef.current.addEventListener('touchmove', drag, { passive: true });
      canvasRef.current.addEventListener('pointerup', dragEnd, { passive: true });
      canvasRef.current.addEventListener('pointerleave', dragEnd, { passive: true });
      canvasRef.current.addEventListener('click', clickToMove, { passive: true });
    }
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousewheel', moveCob);
        canvasRef.current.removeEventListener('touchstart', dragStart);
        canvasRef.current.removeEventListener('touchmove', drag);
        canvasRef.current.removeEventListener('pointermove', drag);
        canvasRef.current.removeEventListener('pointerdown', dragStart);
        canvasRef.current.removeEventListener('pointerup', dragEnd);
        canvasRef.current.removeEventListener('pointerleave', dragEnd);
        canvasRef.current.removeEventListener('click', clickToMove);
      }
    };
  });

  return (
    <group
      ref={groupRef}
      position={display === 'normal' ? [0, 0, 0] : [0, 0, -width / 2]}
    >
      <group
        ref={cobRef}
        position={[(-width / 2) - (kernalWidth / 2), 0, -10]}
      >
        <instancedMesh
          key="bases"
          ref={basesRef}
          geometry={baseMesh.geometry}
          material={baseMaterial}
          receiveShadow
          args={[null, null, kernals.length]}
          visible={display === 'normal'}
        />
        <instancedMesh
          key="kernals"
          ref={kernalsRef}
          castShadow
          receiveShadow
          material={kernalMaterial}
          geometry={kernalMesh.geometry}
          args={[null, null, kernals.length]}
        />
        <mesh
          ref={endKernal}
          geometry={kernalMesh.geometry.clone()}
          material={new MeshNormalMaterial()}
        />
        <group ref={playerRefTarget}>
          <mesh
            ref={playerTargetChildRef}
            geometry={playerMesh.clone().geometry}
            position={[0, 2, 0]}
            visible={false}
          />
        </group>
        <group ref={playerRef}>
          <mesh
            ref={playerChildRef}
            geometry={playerMesh.clone().geometry}
            material={cursorMaterial}
            position={[0, 2, 0]}
          />
        </group>
      </group>
    </group>
  );
}
export default Corn;

Corn.propTypes = {
  tabActive: PropTypes.bool,
  playing: PropTypes.bool,
  explode: PropTypes.bool,
  canvasRef: PropTypes.any,
  setMove: PropTypes.func,
  currentKernal: PropTypes.any,
  focusKernal: PropTypes.object,
  kernals: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  display: PropTypes.string,
};

Corn.defaultProps = {
  tabActive: true,
  playing: false,
  explode: false,
  canvasRef: {},
  setMove: () => { },
  currentKernal: { x: 0, y: 0 },
  focusKernal: { x: 0, y: 0 },
  kernals: [],
  width: 0,
  height: 0,
  display: 'normal',
};
