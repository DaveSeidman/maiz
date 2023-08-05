import React, { useRef, useEffect } from 'react';
import { Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import PropTypes from 'prop-types';

import { CylinderGeometry, MeshStandardMaterial } from 'three';

let prevTime = 0;
let spin = 0;
// const previousSelected = { x: 0, y: 0 };
const radToDeg = rad => rad * (180 / Math.PI);
const Corn = (props) => {
  const { currentKernal, kernals, width, height, display } = props;
  const pointer = { x: 0, y: 0 };
  const cob = useRef();
  const radius = 5;
  const arc = (height / 2) / Math.PI;

  const cornMat = new MeshStandardMaterial({
    color: 0xFFCC00,
    roughness: 0.2,
    metalness: 0.05,
    emissiveIntensity: 1.5,
  });

  const cobMat = new MeshStandardMaterial({
    color: 0xEEEEEE,
    roughness: 1,
    metalness: 0.01,
  });

  const cornWallMat = new MeshStandardMaterial({
    color: 0x763d13,
    roughness: 0.7,
    metalness: 0.05,
    emissiveIntensity: 1.5,
  });

  const selectedCornMat = new MeshStandardMaterial({
    color: 0x0000FF,
    roughness: 0.2,
    metalness: 0.05,
    emissiveIntensity: 1.5,
  });

  const blankMat = new MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.9,
    metalness: 0.1,
  });

  const materials = {
    unset: blankMat,
    normal: cornMat,
    chewed: cornMat,
    wall: cornWallMat,
    selected: selectedCornMat,
  };

  useEffect(() => {
    console.log(currentKernal.y, arc, radToDeg(Math.cos(currentKernal.y / arc)));
    cob.current.rotation.x = -Math.cos(currentKernal.y / arc);
    // console.log('adjust camera to', previousSelected, currentKernal);
    // spin += previousSelected.y - currentKernal.y;
    // previousSelected.x = currentKernal.x;
    // previousSelected.y = currentKernal.y;
  }, [currentKernal]);

  useFrame((e) => {
    const timeDiff = e.clock.elapsedTime - prevTime;
    spin *= 0.9;
    if (display === '3d') cob.current.rotation.x += timeDiff * spin;
    else cob.current.rotation.x = Math.PI; // TODO: no need to set on every frame
    prevTime = e.clock.elapsedTime;
  });

  const spinCob = ({ deltaY }) => {
    spin += -deltaY / 100;
  };

  const handleTouchStart = (e) => {
    pointer.x = e.changedTouches[0].clientX;
    pointer.y = e.changedTouches[0].clientY;
  };
  const handleTouchMove = (e) => {
    const x = e.changedTouches[0].clientX;
    const y = e.changedTouches[0].clientY;
    // if (Math.abs(pointer.y - y) > 100) return;
    spin -= (pointer.y - y) / 25;
    pointer.y = y;
  };

  useEffect(() => {
    addEventListener('mousewheel', spinCob);
    addEventListener('touchstart', handleTouchStart);
    addEventListener('touchmove', handleTouchMove);
    return () => {
      removeEventListener('mousewheel', spinCob);
      removeEventListener('touchstart', handleTouchStart);
      removeEventListener('touchmove', handleTouchMove);
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
        material={cobMat}
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
              scale={kernal.status === 'chewed' ? [0.5, 0.5, 0.5] : [1, 1, 1]}
              position={display === '3d' ? position3D : position2D}
              // rotation={Math.PI * 180}
              material={isCurrent ? selectedCornMat : materials[kernal.status]}
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
