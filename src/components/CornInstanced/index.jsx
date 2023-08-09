// TODO: increase and decrease rotations with dragging as well
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import PropTypes from 'prop-types';

import { MeshStandardMaterial, Color, SphereGeometry, Object3D, Raycaster, Vector3, Vector2, Matrix4, MeshNormalMaterial, InstancedBufferAttribute } from 'three';
import { degToRad, lerp } from 'three/src/math/MathUtils';
import kernalModel from '../../assets/kernal.glb';

const scaleZero = new Matrix4().makeScale(0, 0, 0);
let prevTime = 0;
let spin = 0;
let targetRotation = 0;
let targetPosition = 0;
let lerpAmount = 1;
let prevKernalY = 0;
const radius = 5;
const kernalWidth = 1;
const pointer = { x: null, y: null, down: false };

const Corn = (props) => {
  const { setMove } = props;
  const gltf = useGLTF(kernalModel);
  const { currentKernal, kernals, width, height, display } = props;
  const [useSpin, setUseSpin] = useState(false);
  const [rotations, setRotations] = useState(0);
  const [arc, setArc] = useState((height / 2) / Math.PI);
  const cob = useRef();
  const mesh = useRef();

  const kernalMesh = gltf.scene.children.find(child => child.name === 'Kernal');
  const kernalMat = new MeshStandardMaterial({ roughness: 0.2, metalness: 0.2 });
  const colors = {
    normal: new Color(0x00ff00),
    wall: new Color(0xff0000),
    chewed: new Color(0x0000ff),
  };

  const { camera } = useThree();

  useEffect(() => {
    targetPosition = -currentKernal.x;
    targetRotation = (currentKernal.y / height) * Math.PI * -2;
    // handle "overrotations", when going from near 0 to near 360 we get a jump in how we're easing our rotation
    // this will set a rotations counter to be added to the targetRotations to preven that jump
    if (currentKernal.y === height - 1 && prevKernalY === 0) setRotations(rotations - 1);
    if (currentKernal.y === 0 && prevKernalY === height - 1) setRotations(rotations + 1);
    setUseSpin(false);
    prevKernalY = currentKernal.y;

    const index = (currentKernal.y * (width + 1)) + currentKernal.x;
    const temp = new Matrix4();
    mesh.current.getMatrixAt(index, temp);
    temp.multiply(scaleZero);
    mesh.current.setColorAt(index, colors.chewed);
    mesh.current.setMatrixAt(index, temp);
    mesh.current.instanceColor.needsUpdate = true;
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [currentKernal]);

  useFrame((e) => {
    const timeDiff = e.clock.elapsedTime - prevTime;
    spin *= 0.9;
    lerpAmount += ((display === '3d' ? 1 : 0) - lerpAmount) / 100;

    if (display === '3d') {
      cob.current.position.x += (targetPosition - cob.current.position.x) / 20;

      if (useSpin) cob.current.rotation.x += timeDiff * spin;
      else {
        cob.current.rotation.x += (((targetRotation + (degToRad(90))) - (rotations * (Math.PI * 2))) - cob.current.rotation.x) / 30;
      }
    } else {
      cob.current.rotation.x = Math.PI; // TODO: no need to set on every frame
      cob.current.position.x = -width / 2;
    }
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
    const clickX = 1.666 * ((e.clientX / window.innerWidth) - 0.5);
    const clickY = -1.25 * ((e.clientY / window.innerHeight) - 0.5);
    const currentKernalMesh = cob.current.children.find(kernal => kernal.name === `${currentKernal.x}-${currentKernal.y}`);
    const kernalScreenPosition = new Vector3();
    kernalScreenPosition.setFromMatrixPosition(currentKernalMesh.matrixWorld);
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
  };

  useEffect(() => {
    addEventListener('mousewheel', moveCob);
    addEventListener('touchstart', dragStart);
    addEventListener('pointerdown', dragStart);
    addEventListener('pointermove', drag);
    addEventListener('touchmove', drag);
    addEventListener('pointerup', dragEnd);
    addEventListener('pointerleave', dragEnd);
    // addEventListener('click', clickToMove);
    return () => {
      removeEventListener('mousewheel', moveCob);
      removeEventListener('touchstart', dragStart);
      removeEventListener('touchmove', drag);
      removeEventListener('pointermove', drag);
      removeEventListener('pointerdown', dragStart);
      removeEventListener('pointerup', dragEnd);
      removeEventListener('pointerleave', dragEnd);
      // removeEventListener('click', clickToMove);
    };
  });


  useEffect(() => {
    const temp = new Object3D();
    kernals.forEach((kernal, index) => {
      const { x } = kernal;
      const y = Math.cos(kernal.y / arc) * (radius + (Math.sin((kernal.x / width) * Math.PI) / 2) - 1);
      const z = Math.sin(kernal.y / arc) * (radius + (Math.sin((kernal.x / width) * Math.PI) / 2) - 1);
      const rotation = (kernal.y / height) * (Math.PI * 2);
      temp.position.set(x, y, z);
      temp.rotation.set(rotation, 0, 0);
      temp.updateMatrix();
      mesh.current.setMatrixAt(index, temp.matrix);
      mesh.current.setColorAt(index, kernal.color);
    });
  }, [kernals]);

  return (
    <group
      ref={cob}
      position={[(-width / 2) - (kernalWidth / 2), 0, -10]}
      scale={display === '3d' ? [1, 1, 1] : [1, 1, 0.3]}
    >
      <instancedMesh
        ref={mesh}
        geometry={kernalMesh.geometry}
        material={kernalMat}
        // instanceMatrix={matrix}
        // count={count}
        args={[null, null, kernals.length]}
      >
        {/* <boxGeometry args={[0.5, 0.5, 0.5]} /> */}
        {/* <meshNormalMaterial /> */}
      </instancedMesh>
    </group>
  );
};
export default Corn;

Corn.propTypes = {
  currentKernal: PropTypes.any,
  kernals: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  display: PropTypes.string,
};

Corn.defaultProps = {
  currentKernal: { x: 0, y: 0 },
  kernals: [],
  width: 0,
  height: 0,
  display: '3d',
};
