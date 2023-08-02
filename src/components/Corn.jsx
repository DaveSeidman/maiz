import React from 'react';
import { Sphere } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';

const Corn = () => {
  const rows = 20;
  const cols = 20;
  const spacing = 1.5; // Adjust this value to set the distance between spheres

  // Function to calculate the position of each sphere
  const calculatePosition = (row, col) => {
    const x = (col - cols / 2) * spacing;
    const y = (row - rows / 2) * spacing;
    return [x, y, 0];
  };

  const cornMat = new MeshStandardMaterial({ 
    color: 0xCCCC00,
    roughness: .5,
    metalness: .01,
  })

  return (
    <group>
      {Array.from({ length: rows }).map((_, row) => Array.from({ length: cols }).map((_, col) => {
        const [x, y, z] = calculatePosition(row, col);
        return (
          <Sphere
            key={`sphere-${row}-${col}`}
            args={[0.9, 16, 16]}
            position={[x, y, z]}
            material={cornMat}
          />
        );
      }),)}
    </group>
  );
};
export default Corn;
