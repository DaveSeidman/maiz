import React, { useState, useRef, useEffect } from 'react';
import { Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

import { MeshStandardMaterial } from 'three';

let prevTime = 0;
let spin = 0;

const Corn = (props) => {
  const { currentKernal, kernals, width, height } = props;
  const cob = useRef();
  const radius = 5;
  const arc = (height / 2) / Math.PI;
  const cornMat = new MeshStandardMaterial({
    color: 0xCCCC00,
    roughness: 0.5,
    metalness: 0.01,
  });

  const selectedCornMat = new MeshStandardMaterial({
    color: 0xFF9900,
    roughness: 0.2,
    metalness: 0.05,
    emissiveIntensity: 1.5,
  });

  useFrame((e) => {
    const timeDiff = e.clock.elapsedTime - prevTime;
    // cob.current.rotation.x += timeDiff;
    spin *= 0.9;
    cob.current.rotation.x += timeDiff * spin;
    prevTime = e.clock.elapsedTime;
  });

  const spinCob = ({ deltaY }) => {
    console.log(deltaY);
    spin += -deltaY / 100;
  };

  useEffect(() => {
    addEventListener('mousewheel', spinCob);
    return () => {
      removeEventListener('mousewheel', spinCob);
    };
  });

  return (
    <group
      ref={cob}
      position={[-width / 2, 0, -10]}
    >
      {
        kernals.map((kernal) => {
          const isCurrent = kernal.x === currentKernal.x && kernal.y === currentKernal.y;
          // wrap to cylindar
          const position = [
            kernal.x,
            Math.cos(kernal.y / arc) * radius,
            Math.sin(kernal.y / arc) * radius,
          ];

          return (
            <Sphere
              key={kernal.id}
              args={[0.75, 32, 32]}
              position={position}
              material={isCurrent ? selectedCornMat : cornMat}
            />
          );
        })
      }
    </group>
  );
};
export default Corn;
