import { MeshStandardMaterial, Color } from 'three';


const cornMat = new MeshStandardMaterial({
  // transparent: true,
  // opacity: 0.25,
  color: 0xFFCC00,
  roughness: 0.2,
  metalness: 0.05,
});

const cobMat = new MeshStandardMaterial({
  color: 0x794e25,
  roughness: 1,
  metalness: 0.01,
});

const cornWallMat = new MeshStandardMaterial({
  // transparent: true,
  // opacity: 0.25,
  color: 0x763d14,
  roughness: 0.7,
  metalness: 0.05,
});

const selectedCornMat = new MeshStandardMaterial({
  color: 0xFF0000,
  roughness: 0.2,
  metalness: 0.5,
});

const blankMat = new MeshStandardMaterial({
  color: 0xcccccc,
  roughness: 0.9,
  metalness: 0.1,
});

const materials = {
  unset: blankMat,
  normal: cornMat,
  chewed: blankMat,
  wall: cornWallMat,
  selected: selectedCornMat,
  selectedCornMat,
  cobMat,
};

export default materials;
