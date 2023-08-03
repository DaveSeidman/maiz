import React, { useState } from 'react';
import { Sphere } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';

const Corn = (props) => {
  const { currentKernal, kernals } = props;
  console.log(kernals);
  // const [kernals, setKernals] = useState([])
  const rows = 20;
  const cols = 20;
  const spacing = 0.5; // Adjust this value to set the distance between spheres

  // Function to calculate the position of each sphere
  const calculatePosition = (row, col) => {
    const x = (col - cols / 2) * spacing;
    const y = (row - rows / 2) * spacing;
    return [x, y, 0];
  };

  const cornMat = new MeshStandardMaterial({
    color: 0xCCCC00,
    roughness: 0.5,
    metalness: 0.01,
  });

  const selectedCornMat = new MeshStandardMaterial({
    color: 0xFFCC00,
    roughness: 0.2,
    metalness: 0.05,
    emissiveIntensity: 0.5,
  });

  return (
    <group>
      {
        kernals.map(kernal => (
          <Sphere
            key={kernal.id}
            args={[0.5, 32, 32]}
            position={[kernal.x, kernal.y, 0]}
            material={cornMat}
          />
        ))
      }
      {/* {Array.from({ length: rows }).map((_, row) => Array.from({ length: cols }).map((_, col) => {
        const [x, y, z] = calculatePosition(row, col);
        return (
          <Sphere
            key={`sphere-${row}-${col}`}
            args={[0.5, 32, 32]}
            position={[x, y, z]}
            material={cornMat}
          />
        );
      }),)} */}
    </group>
  );
};
export default Corn;
