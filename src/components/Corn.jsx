import React, { useState } from 'react';
import { Sphere } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';

const Corn = (props) => {
  const { currentKernal, kernals, width, height } = props;
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

  return (
    <group
      position={[-width / 2, 0, -10]}
    >
      {
        kernals.map((kernal) => {
          const isCurrent = kernal.x === currentKernal.x && kernal.y === currentKernal.y;
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
