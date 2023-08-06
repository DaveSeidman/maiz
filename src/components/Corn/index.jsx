// TODO: currently the targetRotation and useSpin and fighting,
// create a "rotationFrom" property that gets set based on which user interaction was most recent... a scroll/drag or a kernal move
import React, { useRef, useEffect, useState } from 'react';
import { Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import PropTypes from 'prop-types';

import { CylinderGeometry, ZeroCurvatureEnding } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import materials from '../../materials';

let prevTime = 0;
let spin = 0;
let targetRotation = 0;
let targetPosition = 0;
let prevKernalY = 0;
const radius = 5;
const kernalWidth = 1;

const radToDeg = rad => rad * (180 / Math.PI);


const Corn = (props) => {
  const { currentKernal, kernals, width, height, display } = props;
  const [useSpin, setUseSpin] = useState(false);
  const [rotations, setRotations] = useState(0);
  const [arc, setArc] = useState((height / 2) / Math.PI);
  const pointer = { x: null, y: null, down: false };
  const cob = useRef();

  useEffect(() => {
    // targetPosition = (currentKernal.x / width) * -;
    targetPosition = -currentKernal.x;
    targetRotation = (currentKernal.y / height) * Math.PI * -2;
    // handle "overrotations", when going from near 0 to near 360 we get a jump in how we're easing our rotation
    // this will set a rotations counter to be added to the targetRotations to preven that jump
    if (currentKernal.y === height - 1 && prevKernalY === 0) setRotations(rotations - 1);
    if (currentKernal.y === 0 && prevKernalY === height - 1) setRotations(rotations + 1);
    setUseSpin(false);
    prevKernalY = currentKernal.y;
  }, [currentKernal]);

  useFrame((e) => {
    const timeDiff = e.clock.elapsedTime - prevTime;
    spin *= 0.9;
    if (display === '3d') {
      cob.current.position.x += (targetPosition - cob.current.position.x) / 20;
      if (useSpin) cob.current.rotation.x += timeDiff * spin;
      else {
        cob.current.rotation.x += (((targetRotation + (degToRad(90))) - (rotations * (Math.PI * 2))) - cob.current.rotation.x) / 30;
      }
    } else cob.current.rotation.x = Math.PI; // TODO: no need to set on every frame
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


  const debugArc = (e) => {
    if (e.key === 'r') setArc(arc + 1);
    if (e.key === 'e') setArc(arc - 1);
  };

  useEffect(() => {
    addEventListener('mousewheel', moveCob);
    addEventListener('touchstart', dragStart);
    addEventListener('pointerdown', dragStart);
    addEventListener('pointermove', drag);
    addEventListener('pointerup', dragEnd);
    addEventListener('touchmove', drag);
    addEventListener('keydown', debugArc);
    return () => {
      removeEventListener('mousewheel', moveCob);
      removeEventListener('touchstart', dragStart);
      removeEventListener('touchmove', drag);
      removeEventListener('pointerdown', dragStart);
      removeEventListener('pointermove', drag);
      removeEventListener('pointerup', dragEnd);
      removeEventListener('keydown', debugArc);
    };
  });

  return (
    <group
      ref={cob}
      position={[(-width / 2) - (kernalWidth / 2), 0, -10]}
    >
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        position={[(width / 2), 0, 0]}
        geometry={new CylinderGeometry(radius, radius, 1, 32, 64)}
        scale={[1, width + kernalWidth, 1]}
        material={materials.cobMat}
        visible={display === '3d'}
      />
      {
        kernals.map((kernal) => {
          const isCurrent = kernal.x === currentKernal.x && kernal.y === currentKernal.y;
          // wrap to cylindar
          const position2D = [
            kernal.x,
            kernal.y + height / -2 - 2,
            10,
          ];
          // 2d view
          const position3D = [
            kernal.x,
            Math.cos(kernal.y / arc) * radius,
            Math.sin(kernal.y / arc) * radius,
          ];
          // const rotation = Math.Pi(kernal.y / arc);

          return (
            <Sphere
              key={kernal.id}
              args={[0.75, 32, 32]}
              scale={kernal.status === 'chewed' ? [0.25, 0.25, 0.25] : [1, 1, 1]}
              position={display === '3d' ? position3D : position2D}
              // rotation={Math.PI * 180}
              material={isCurrent ? materials.selectedCornMat : materials[kernal.status]}
              // visible={!kernal.end}
            />
          );
        })
      }
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
