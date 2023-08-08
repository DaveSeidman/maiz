// TODO: currently the targetRotation and useSpin and fighting,
// create a "rotationFrom" property that gets set based on which user interaction was most recent... a scroll/drag or a kernal move
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import PropTypes from 'prop-types';

import { MeshStandardMaterial, Color } from 'three';
import { degToRad, lerp } from 'three/src/math/MathUtils';
import kernalModel from '../../assets/kernal.glb';

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
  const gltf = useGLTF(kernalModel);

  const normal_0 = new MeshStandardMaterial({ color: 0xf2bb00, roughness: 0.2, metalness: 0.05 });
  const normal_1 = new MeshStandardMaterial({ color: 0xf9ee00, roughness: 0.2, metalness: 0.05 });
  const cobMat = new MeshStandardMaterial({ color: 0xe2cd7e, roughness: 1, metalness: 0.01 });
  const cornWallMat = new MeshStandardMaterial({ color: 0x763d15, roughness: 0.7, metalness: 0.05 });
  const cornWallMat_0 = new MeshStandardMaterial({ color: 0x450605, roughness: 0.2, metalness: 0.05 });
  const cornWallMat_1 = new MeshStandardMaterial({ color: 0x401811, roughness: 0.1, metalness: 0.05 });
  const cornWallMat_2 = new MeshStandardMaterial({ color: 0x2a0911, roughness: 0.25, metalness: 0.05 });
  const selectedCornMat = new MeshStandardMaterial({ color: new Color(14 / 255, 176 / 255, 179 / 255), roughness: 0.2, metalness: 0.5 });

  const glowMat = new MeshStandardMaterial({ color: 0x0000ff, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.9, emissive: 0x0200ff, emissiveIntensity: 2 });

  const materials = {
    wall: cornWallMat,
    wall_0: cornWallMat_0,
    wall_1: cornWallMat_1,
    wall_2: cornWallMat_2,
    normal_0,
    normal_1,
    selected: selectedCornMat,
    selectedCornMat,
    cobMat,
    glowMat,
  };

  const { currentKernal, kernals, width, height, display } = props;
  const [useSpin, setUseSpin] = useState(false);
  const [rotations, setRotations] = useState(0);
  const [arc, setArc] = useState((height / 2) / Math.PI);
  const cob = useRef();

  useEffect(() => {
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

  useEffect(() => {
    addEventListener('mousewheel', moveCob);
    addEventListener('touchstart', dragStart);
    addEventListener('pointerdown', dragStart);
    addEventListener('pointermove', drag);
    addEventListener('touchmove', drag);
    addEventListener('pointerup', dragEnd);
    addEventListener('pointerleave', dragEnd);
    return () => {
      removeEventListener('mousewheel', moveCob);
      removeEventListener('touchstart', dragStart);
      removeEventListener('touchmove', drag);
      removeEventListener('pointermove', drag);
      removeEventListener('pointerdown', dragStart);
      removeEventListener('pointerup', dragEnd);
      removeEventListener('pointerleave', dragEnd);
    };
  });

  return (
    <group
      ref={cob}
      position={[(-width / 2) - (kernalWidth / 2), 0, -10]}
      scale={display === '3d' ? [1, 1, 1] : [1, 1, 0.3]}
    >
      {
        kernals.map((kernal) => {
          const isCurrent = kernal.x === currentKernal.x && kernal.y === currentKernal.y;
          const position2D = [ // wrap to cylindar
            kernal.x,
            kernal.y + height / -2,
            5,
          ];
          const position3D = [ // 2d view
            kernal.x,
            Math.cos(kernal.y / arc) * (radius + (Math.sin((kernal.x / width) * Math.PI) / 2) - 1),
            Math.sin(kernal.y / arc) * (radius + (Math.sin((kernal.x / width) * Math.PI) / 2) - 1),
          ];
          // TODO: would be nice to animate this but currently not performant
          // TODO: look into instancing
          const position = display === '3d' ? position3D : position2D;
          // const position = [
          //   lerp(position2D[0], position3D[0], lerpAmount),
          //   lerp(position2D[1], position3D[1], lerpAmount),
          //   lerp(position2D[2], position3D[2], lerpAmount),
          // ];

          const rotation = display === '3d' ? (kernal.y / height) * (Math.PI * 2) : (Math.PI / -2);
          const model = gltf.scene.clone(true);
          const rootMesh = model.children.find(mesh => mesh.name === 'Root');
          const kernalMesh = model.children.find(mesh => mesh.name === 'Kernal');
          const selectMesh = model.children.find(mesh => mesh.name === 'Select');
          const cutout = model.children.find(mesh => mesh.name === 'Cutout');
          rootMesh.receiveShadow = true;
          kernalMesh.castShadow = true;
          kernalMesh.receiveShadow = true;
          selectMesh.castShadow = true;
          rootMesh.material = materials.cobMat;
          selectMesh.material = materials.glowMat;
          cutout.visible = false;
          kernalMesh.material = isCurrent ? materials.selectedCornMat : materials[kernal.material]; // isCurrent ? materials.selectedCornMat : materials[kernal.status];
          kernalMesh.visible = kernal.status !== 'chewed';
          selectMesh.visible = isCurrent;
          return (
            <group
              key={kernal.id}
              rotation={[rotation, 0, 0]}
              // position={display === '3d' ? position3D : position2D}
              position={position}
            >
              <primitive
                object={model}
                scale={display === '3d' ? [1, 1, 1] : [0.75, 0.75, 0.75]}
              />
            </group>
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
