import React, { useState, useRef, useEffect } from 'react';
import { Sphere, Cylinder } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

import { CylinderGeometry, MeshStandardMaterial } from 'three';

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
    metalness: 0.001,
  });

  const selectedCornMat = new MeshStandardMaterial({
    color: 0xFF9900,
    roughness: 0.2,
    metalness: 0.05,
    emissiveIntensity: 1.5,
  });

  useFrame((e) => {
    const timeDiff = e.clock.elapsedTime - prevTime;
    spin *= 0.9;
    cob.current.rotation.x += timeDiff * spin;
    prevTime = e.clock.elapsedTime;
  });

  const spinCob = ({ deltaY }) => {
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
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        position={[(height / 2) + 1, 0, 0]}
        geometry={new CylinderGeometry(radius, radius, height, 32, 64)}
        material={selectedCornMat}
      />
      {
        kernals.map((kernal) => {
          const isCurrent = kernal.x === currentKernal.x && kernal.y === currentKernal.y;
          // wrap to cylindar
          const position = [
            kernal.x,
            Math.cos(kernal.y / arc) * radius,
            Math.sin(kernal.y / arc) * radius,
          ];
          // const rotation = Math.Pi(kernal.y / arc);

          return (
            <Sphere
              key={kernal.id}
              args={[0.75, 32, 32]}
              scale={kernal.status === 'normal' ? [1, 1, 1] : [0.5, 0.5, 0.5]}
              position={position}
              // rotation={Math.PI * 180}
              material={isCurrent ? selectedCornMat : cornMat}
            />
          );
        })
      }
    </group>
  );
};
export default Corn;
