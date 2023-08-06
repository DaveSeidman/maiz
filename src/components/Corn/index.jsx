// TODO: currently the targetRotation and useSpin and fighting,
// create a "rotationFrom" property that gets set based on which user interaction was most recent... a scroll/drag or a kernal move
import React, { useRef, useEffect, useState } from 'react';
import { Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import PropTypes from 'prop-types';

import { CylinderGeometry } from 'three';
import materials from '../../materials';

console.log(materials);

let prevTime = 0;
let spin = 0;
let targetRotation = 0;
let targetPosition = 0;


const Corn = (props) => {
  const { currentKernal, kernals, width, height, display } = props;
  const [useSpin, setUseSpin] = useState(false);

  // targetPosition = -width / 2;
  const pointer = { x: 0, y: 0 };
  const cob = useRef();
  const radius = 5;
  const arc = (height / 2) / Math.PI;


  useEffect(() => {
    targetPosition = (currentKernal.x / width) * -25;
    targetRotation = (currentKernal.y / height) * Math.PI * -2 + (Math.PI / 2);
    setUseSpin(false);
  }, [currentKernal]);

  useFrame((e) => {
    const timeDiff = e.clock.elapsedTime - prevTime;
    spin *= 0.9;
    if (display === '3d') {
      cob.current.position.x += (targetPosition - cob.current.position.x) / 20;
      if (useSpin) cob.current.rotation.x += timeDiff * spin;
      else {
        // TODO: fix this for wrapping, ie: calculate how far we'd have to rotate in either direction and pick the shorter one
        cob.current.rotation.x += (targetRotation - cob.current.rotation.x) / 20;
      }
      // }
    } else cob.current.rotation.x = Math.PI; // TODO: no need to set on every frame
    prevTime = e.clock.elapsedTime;
  });

  const spinCob = ({ deltaY }) => {
    setUseSpin(true);
    spin += -deltaY / 100;
  };

  const dragStart = (e) => {
    pointer.x = e.changedTouches[0].clientX;
    pointer.y = e.changedTouches[0].clientY;
  };

  const drag = (e) => {
    setUseSpin(true);
    const x = e.changedTouches[0].clientX;
    const y = e.changedTouches[0].clientY;
    // if (Math.abs(pointer.y - y) > 100) return;
    spin -= (pointer.y - y) / 25;
    pointer.y = y;
  };

  useEffect(() => {
    addEventListener('mousewheel', spinCob);
    addEventListener('touchstart', dragStart);
    addEventListener('touchmove', drag);
    // TODO: listen to pointer events here for mousedrags
    return () => {
      removeEventListener('mousewheel', spinCob);
      removeEventListener('touchstart', dragStart);
      removeEventListener('touchmove', drag);
    };
  });

  return (
    <group
      ref={cob}
      position={[-width / 2, 0, -10]}
    >
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        position={[(height / 2) + 1, 0, 0]}
        geometry={new CylinderGeometry(radius, radius, height, 32, 64)}
        material={materials.cobMat}
        visible={display === '3d'}
      />
      {
        kernals.map((kernal) => {
          const isCurrent = kernal.x === currentKernal.x && kernal.y === currentKernal.y;
          // wrap to cylindar
          const position2D = [
            kernal.x,
            kernal.y + height / -2,
            10,
          ];
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
