// TODO: increase and decrease rotations with dragging as well
// TODO: sometimes gltf's don't load (usually the roots)
// TODO: changing heights doesn't have effect here
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import PropTypes from 'prop-types';

import { MeshStandardMaterial, Color, Object3D, Vector3, Matrix4, MeshPhysicalMaterial } from 'three';
import { degToRad, lerp } from 'three/src/math/MathUtils';
import kernalModel from '../../assets/kernal.glb';

const scaleZero = new Matrix4().makeScale(0, 0, 0);
let prevTime = 0;
let spin = 0;
let targetRotation = 0;
let targetPosition = 0;
// let lerpAmount = 1;
let prevKernalY = 0;
const radius = 5;
const kernalWidth = 1;
const pointer = { x: null, y: null, down: false, startX: 0, startY: 0 };
const pointerMovementThreshold = 10;
const kernalLifeThreshold = 100;
const poppedKernals = [];

const Corn = (props) => {
  const { canvasRef, setMove, currentKernal, focusKernal, kernals, width, height } = props;
  const gltf = useGLTF(kernalModel);
  const { camera } = useThree();

  const [useSpin, setUseSpin] = useState(false);
  const [rotations, setRotations] = useState(0);
  const [arc, setArc] = useState((height / 2) / Math.PI);

  const groupRef = useRef();
  const cobRef = useRef();
  const kernalsRef = useRef();
  const basesRef = useRef();
  const cursorRef = useRef();

  const kernalMesh = gltf.scene.children.find(child => child.name === 'Kernal');
  const baseMesh = gltf.scene.children.find(child => child.name === 'Base');
  const cursorMesh = gltf.scene.children.find(child => child.name === 'Cursor');
  const arrowMesh = gltf.scene.children.find(child => child.name === 'Arrow');
  const poppedMeshes = gltf.scene.children.filter(child => child.name.indexOf('Popped') >= 0);

  const kernalMaterial = new MeshStandardMaterial({ roughness: 0.2, metalness: 0.23, envMapIntensity: 1 });
  const baseMaterial = new MeshStandardMaterial({ roughness: 0.9, metalness: 0.2, color: 0xcbcb8a });
  const cursorMaterial = new MeshPhysicalMaterial({ roughness: 0.1, metalness: 0.8, color: 0xddeeff, reflectivity: 0.9, transmission: 0.99, thickness: 0.02, opacity: 0.5 });

  useEffect(() => {
    // adjust cob position / rotation
    targetPosition = -currentKernal.x;
    targetRotation = (currentKernal.y / height) * Math.PI * -2;
    // handle "overrotations", when going from near 0 to near 360 we get a jump in how we're easing our rotation
    // this will set a rotations counter to be added to the targetRotations to preven that jump
    if (currentKernal.y === height - 1 && prevKernalY === 0) setRotations(rotations - 1);
    if (currentKernal.y === 0 && prevKernalY === height - 1) setRotations(rotations + 1);

    setUseSpin(false);
    prevKernalY = currentKernal.y;

    // remove popped kernals
    const index = (currentKernal.y * (width + 1)) + currentKernal.x;
    const temp = new Matrix4();
    kernalsRef.current.getMatrixAt(index, temp);
    temp.multiply(scaleZero);
    kernalsRef.current.setMatrixAt(index, temp);
    kernalsRef.current.instanceMatrix.needsUpdate = true;

    // set cursor position
    const { x } = currentKernal;
    const y = Math.cos(currentKernal.y / arc) * (radius + (Math.sin((currentKernal.x / width) * Math.PI) / 2) - 1);
    const z = Math.sin(currentKernal.y / arc) * (radius + (Math.sin((currentKernal.x / width) * Math.PI) / 2) - 1);
    const rotation = (currentKernal.y / height) * (Math.PI * 2);
    cursorRef.current.position.set(x, y, z);
    cursorRef.current.rotation.set(rotation, 0, 0);

    // pop a kernal!
    if (currentKernal.justPopped) {
      const poppedKernal = poppedMeshes[Math.floor(Math.random() * poppedMeshes.length)].clone();
      poppedKernal.position.set(x, y, z);
      cobRef.current.add(poppedKernal);
      poppedKernal.updateMatrix();
      const worldPos = new Vector3();
      poppedKernal.getWorldPosition(worldPos);
      groupRef.current.add(poppedKernal);
      poppedKernal.position.set(worldPos.x, worldPos.y, worldPos.z);
      poppedKernals.push({
        mesh: poppedKernal,
        life: 0,
        velocity: new Vector3(0, -worldPos.y, -worldPos.z).normalize().multiplyScalar(0.1).add(new Vector3((Math.random() - 0.5) * 0.2, 0.1, 0)),
        rotation: new Vector3(Math.random() * Math.PI / 2, Math.random() * Math.PI / 2, Math.random() * Math.PI / 2),
      });
    }
  }, [currentKernal]);

  useEffect(() => {
    console.log(focusKernal);
    targetPosition = -focusKernal.x;
    targetRotation = (focusKernal.y / height) * Math.PI * -2;
  }, [focusKernal]);

  useFrame((e) => {
    const timeDiff = e.clock.elapsedTime - prevTime;
    spin *= 0.9;
    // lerpAmount += ((display === '3d' ? 1 : 0) - lerpAmount) / 100;
    // console.log(lerpAmount);

    cobRef.current.position.x += (targetPosition - cobRef.current.position.x) / 20;

    if (useSpin) cobRef.current.rotation.x += timeDiff * spin;
    else {
      cobRef.current.rotation.x += (((targetRotation + (degToRad(90))) - (rotations * (Math.PI * 2))) - cobRef.current.rotation.x) / 30;
    }

    poppedKernals.forEach((kernal, index) => {
      kernal.life += 1;
      kernal.velocity.y -= 0.01;
      kernal.mesh.position.add(kernal.velocity);// .add(0, -kernal.life / 2, 0);
      kernal.mesh.rotateOnAxis(kernal.rotation, 0.05);
      if (kernal.life >= kernalLifeThreshold) {
        groupRef.current.remove(kernal.mesh);
        poppedKernals.splice(index, 1);
      }
    });

    prevTime = e.clock.elapsedTime;
  });

  const moveCob = ({ deltaX, deltaY }) => {
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
    const pointerMovement = Math.sqrt(Math.pow(pointer.startX - pointer.x, 2) + Math.pow(pointer.startY - pointer.y, 2));
    if (pointerMovement < pointerMovementThreshold) {
      // TODO: check these multipliers
      const clickX = 1.666 * ((e.clientX / window.innerWidth) - 0.5);
      const clickY = -1.25 * ((e.clientY / window.innerHeight) - 0.5);

      const kernalScreenPosition = new Vector3();
      kernalScreenPosition.setFromMatrixPosition(cursorRef.current.matrixWorld);
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
    // console.log(canvasRef.current);

    canvasRef.current.addEventListener('mousewheel', moveCob);
    canvasRef.current.addEventListener('touchstart', dragStart);
    canvasRef.current.addEventListener('pointerdown', dragStart);
    canvasRef.current.addEventListener('pointermove', drag);
    canvasRef.current.addEventListener('touchmove', drag);
    canvasRef.current.addEventListener('pointerup', dragEnd);
    canvasRef.current.addEventListener('pointerleave', dragEnd);
    canvasRef.current.addEventListener('click', clickToMove);
    return () => {
      canvasRef.current.removeEventListener('mousewheel', moveCob);
      canvasRef.current.removeEventListener('touchstart', dragStart);
      canvasRef.current.removeEventListener('touchmove', drag);
      canvasRef.current.removeEventListener('pointermove', drag);
      canvasRef.current.removeEventListener('pointerdown', dragStart);
      canvasRef.current.removeEventListener('pointerup', dragEnd);
      canvasRef.current.removeEventListener('pointerleave', dragEnd);
      canvasRef.current.removeEventListener('click', clickToMove);
    };
  });


  useEffect(() => {
    const temp = new Object3D();
    kernals.forEach((kernal, index) => {
      //      | position around cylindar | barrel outwards towards the middle
      const { x } = kernal;
      const y = Math.cos(kernal.y / arc) * (radius + (Math.sin((kernal.x / width) * Math.PI) / 2) - 1);
      const z = Math.sin(kernal.y / arc) * (radius + (Math.sin((kernal.x / width) * Math.PI) / 2) - 1);
      const rotation = (kernal.y / height) * (Math.PI * 2);
      temp.position.set(x, y, z);
      temp.rotation.set(rotation, 0, 0);
      temp.updateMatrix();
      kernalsRef.current.setMatrixAt(index, temp.matrix);
      kernalsRef.current.setColorAt(index, kernal.color);
      basesRef.current.setMatrixAt(index, temp.matrix);
    });

    const startKernal = kernals.find(kernal => kernal.start);
    const endKernal = kernals.find(kernal => kernal.end);
    const startArrow = arrowMesh.clone();
    const endArrow = arrowMesh.clone();
    startArrow.material = cursorMaterial;
    endArrow.material = cursorMaterial;
    startArrow.position.set(startKernal.x - 2, Math.cos(startKernal.y / arc) * radius, Math.sin(startKernal.y / arc) * radius);
    startArrow.rotation.set((startKernal.y / height) * (Math.PI * 2), 0, 0);
    endArrow.position.set(endKernal.x + 1.5, Math.cos(endKernal.y / arc) * radius, Math.sin(endKernal.y / arc) * radius);
    endArrow.rotation.set((endKernal.y / height) * (Math.PI * 2), 0, 0);
    cobRef.current.add(startArrow);
    cobRef.current.add(endArrow);
  }, [kernals]);


  return (
    <group
      ref={groupRef}
    >
      <group
        ref={cobRef}
        position={[(-width / 2) - (kernalWidth / 2), 0, -10]}
        // scale={display === '3d' ? [1, 1, 1] : [1, 1, 0.3]}
      >
        <instancedMesh
          key="roots"
          ref={basesRef}
          geometry={baseMesh.geometry}
          material={baseMaterial}
          args={[null, null, kernals.length]}
        />
        <instancedMesh
          key="kernals"
          ref={kernalsRef}
          geometry={kernalMesh.geometry}
          material={kernalMaterial}
          args={[null, null, kernals.length]}
        />
        <mesh
          key="cursor"
          ref={cursorRef}
          geometry={cursorMesh.geometry}
          material={cursorMaterial}
        />
      </group>
    </group>
  );
};
export default Corn;

Corn.propTypes = {
  currentKernal: PropTypes.any,
  kernals: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  // display: PropTypes.string,
};

Corn.defaultProps = {
  currentKernal: { x: 0, y: 0 },
  kernals: [],
  width: 0,
  height: 0,
  // display: '3d',
};
