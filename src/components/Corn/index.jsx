// TODO: increase and decrease rotations with dragging as well
// TODO: sometimes gltf's don't load (usually the roots)
// TODO: changing heights doesn't have effect here
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import PropTypes from 'prop-types';

import { MeshStandardMaterial, Object3D, Vector3, Matrix4, TextureLoader, MeshPhysicalMaterial } from 'three';
import { degToRad, lerp } from 'three/src/math/MathUtils';
import kernalModel from '../../assets/models/models.glb';
import grayImage from '../../assets/images/gray.jpg';

const scaleZero = new Matrix4().makeScale(0, 0, 0);
let prevTime = 0;
let spin = 0;
let targetRotation = 0;
let targetPosition = 0;
let lerpAmount = 1;
let prevKernalY = 0;
// const radius = 5;
const kernalWidth = 1;
const pointer = { x: null, y: null, down: false, startX: 0, startY: 0 };
const pointerMovementThreshold = 10;
const kernalLifeThreshold = 100;
const poppedKernals = [];

const Corn = (props) => {
  const { canvasRef, setMove, currentKernal, focusKernal, kernals, width, height, curvature, display } = props;
  const gltf = useGLTF(kernalModel);
  const { camera } = useThree();

  const [useSpin, setUseSpin] = useState(false);
  const [rotations, setRotations] = useState(0);
  const [texture, setTexture] = useState();
  const [targetPosition2, setTargetPosition2] = useState(0);
  const groupRef = useRef();
  const cobRef = useRef();
  const kernalsRef = useRef();
  const basesRef = useRef();
  const cursorRef = useRef();
  const arrowsRef = useRef();

  const kernalMesh = gltf.scene.children.find(child => child.name === 'Kernal');
  const baseMesh = gltf.scene.children.find(child => child.name === 'Base');
  const cursorMesh = gltf.scene.children.find(child => child.name === 'Cursor');
  const arrowMesh = gltf.scene.children.find(child => child.name === 'Arrow');
  const poppedMeshes = gltf.scene.children.filter(child => child.name.indexOf('Popped') >= 0);

  // const kernalMaterial = new MeshStandardMaterial({ roughness: 0.27, metalness: 0.13, envMapIntensity: 1 });
  const baseMaterial = new MeshStandardMaterial({ roughness: 0.9, metalness: 0.2, color: 0xcbcb8a });
  const cursorMaterial = new MeshPhysicalMaterial({ roughness: 0.1, metalness: 0.8, color: 0xddeeff, reflectivity: 0.9, transmission: 0.99, thickness: 0.02, opacity: 0.5 });
  const poppedMaterial = new MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0xfefefe });

  const loader = new TextureLoader();
  loader.load(grayImage, (texture) => {
    setTexture(texture);
  });

  const positionToGrid = (object, kernal) => {
    object.position.set(kernal.x, kernal.y + height / -2, 0);
    object.rotation.set(Math.PI / 2, 0, 0);
    // const scale = kernal.popped ? 0 : 0.9;
    if (kernal.popped) object.scale.set(0, 0, 0);
    else object.scale.set(0.9, 0.1, 0.7);
    object.updateMatrix();
  };

  const positionToCylindar = (object, kernal) => {
    const { x } = kernal;
    const arc = (height / 2) / Math.PI;
    //      | position around cylindar | barrel outwards towards the middle
    const y = Math.cos(kernal.y / arc) * (((height / 2) / Math.PI) + (curvature * (Math.sin((x / width) * Math.PI) / 2) - 1));
    const z = Math.sin(kernal.y / arc) * (((height / 2) / Math.PI) + (curvature * (Math.sin((x / width) * Math.PI) / 2) - 1));
    const rotation = (kernal.y / height) * (Math.PI * 2);
    object.position.set(x, y, z);
    object.rotation.set(rotation, 0, 0);
    const scale = kernal.popped ? 0 : 1;
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
    const object1 = new Object3D();
    const object2 = new Object3D();
    kernals.forEach((kernal, index) => {
      positionToGrid(object1, kernal);
      positionToCylindar(object2, kernal);
      blendMatrices(object1, object2, lerpAmount);
      const scale = kernal.popped ? 0 : 1;

      object1.scale.set(scale, scale, scale);
      kernalsRef.current.setMatrixAt(index, object1.matrix);
      kernalsRef.current.setColorAt(index, kernal.color);
      basesRef.current.setMatrixAt(index, object1.matrix);
    });
    kernalsRef.current.instanceMatrix.needsUpdate = true;
    basesRef.current.instanceMatrix.needsUpdate = true;
    kernalsRef.current.instanceColor.needsUpdate = true;
    // kernalsRef.current.material.needsUpdate = true;
    const startKernal = kernals.find(kernal => kernal.start);
    const endKernal = kernals.find(kernal => kernal.end);
    const startKernalOffset = JSON.parse(JSON.stringify(startKernal));
    const endKernalOffset = JSON.parse(JSON.stringify(endKernal));
    startKernalOffset.x -= 2;
    endKernalOffset.x += 2;
    const tempStart = new Object3D();
    const tempEnd = new Object3D();
    positionToCylindar(tempStart, startKernalOffset);
    positionToCylindar(tempEnd, endKernalOffset);
    arrowsRef.current.setMatrixAt(0, tempStart.matrix);
    arrowsRef.current.setMatrixAt(1, tempEnd.matrix);
    arrowsRef.current.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    // console.log({ kernals });
    positionKernals();
  }, [kernals, curvature, display]);

  // currentKernal updated
  useEffect(() => {
    // adjust cob position / rotation
    targetPosition = -currentKernal.x;
    // TODO: grab this from positionToCylindar object below
    const object = new Object3D();
    if (display === 'normal') positionToCylindar(object, currentKernal);
    if (display === 'grid') {
      positionToGrid(object, currentKernal);
      object.position.z = -3;
    }
    targetRotation = (currentKernal.y / height) * Math.PI * -2;
    // handle "overrotations", when going from near 0 to near 360 we get a jump in how we're easing our rotation
    // this will set a rotations counter to be added to the targetRotations to preven that jump
    if (currentKernal.y === height - 1 && prevKernalY === 0) setRotations(rotations - 1);
    if (currentKernal.y === 0 && prevKernalY === height - 1) setRotations(rotations + 1);

    setUseSpin(false);

    // set cursor position
    cursorRef.current.position.copy(object.position);
    cursorRef.current.rotation.copy(object.rotation);

    if (currentKernal.justPopped) {
      // remove kernal mesh by scaling it to 0
      const index = (currentKernal.y * (width + 1)) + currentKernal.x;
      const matrix = new Matrix4();
      kernalsRef.current.getMatrixAt(index, matrix);
      matrix.multiply(scaleZero);
      kernalsRef.current.setMatrixAt(index, matrix);
      kernalsRef.current.instanceMatrix.needsUpdate = true;

      // add popped kernal and animate
      const poppedKernal = poppedMeshes[Math.floor(Math.random() * poppedMeshes.length)].clone();
      poppedKernal.material = poppedMaterial;
      positionToCylindar(poppedKernal, currentKernal);
      // poppedKernal.position.y -= 2;
      // add it to the cob
      cobRef.current.add(poppedKernal);
      poppedKernal.updateMatrix();
      // get it's world position
      const worldPos = new Vector3();
      poppedKernal.getWorldPosition(worldPos);
      // remove it from the cob, add it to the world so it's not affected by
      // the cobs translations or rotations, and instead follows gravity
      groupRef.current.add(poppedKernal);
      poppedKernal.position.copy(worldPos);
      poppedKernals.push({
        mesh: poppedKernal,
        life: 0,
        velocity: new Vector3(0, -worldPos.y, -worldPos.z).normalize().multiplyScalar(0.1).add(new Vector3((Math.random() - 0.5) * 0.2, 0.1, 0)),
        rotation: new Vector3(Math.random() * Math.PI / 2, Math.random() * Math.PI / 2, Math.random() * Math.PI / 2),
      });
    }
    prevKernalY = currentKernal.y;
  }, [currentKernal]);

  useEffect(() => {
    targetPosition = -focusKernal.x;
    targetRotation = (focusKernal.y / height) * Math.PI * -2;
  }, [focusKernal]);

  useFrame((e) => {
    const timeDiff = e.clock.elapsedTime - prevTime;

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
      kernal.velocity.y -= timeDiff;
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


  return (
    <group
      ref={groupRef}
      position={display === 'normal' ? [0, 0, 0] : [0, 0, 0]}
    >
      <group
        ref={cobRef}
        position={[(-width / 2) - (kernalWidth / 2), 0, -10]}
      >
        <instancedMesh
          key="roots"
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
          geometry={kernalMesh.geometry}
          // material={kernalMaterial}
          args={[null, null, kernals.length]}
        >
          <meshStandardMaterial
            map={texture}
            roughness={0.4}
            metalness={0.4}
          />
        </instancedMesh>
        <instancedMesh
          key="arrows"
          ref={arrowsRef}
          geometry={arrowMesh.geometry}
          material={cursorMaterial}
          args={[null, null, 2]}
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
  canvasRef: {},
  setMove: () => {},
  currentKernal: { x: 0, y: 0 },
  focusKernal: { x: 0, y: 0 },
  kernals: [],
  width: 0,
  height: 0,
  display: 'normal',
};
