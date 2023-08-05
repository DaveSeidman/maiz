import { MeshStandardMaterial } from 'three';

export const cornMat = new MeshStandardMaterial({
  color: 0xFFCC00,
  roughness: 0.2,
  metalness: 0.05,
  emissiveIntensity: 1.5,
});

export const cobMat = new MeshStandardMaterial({
  color: 0xEEEEEE,
  roughness: 1,
  metalness: 0.01,
});

export const cornWallMat = new MeshStandardMaterial({
  color: 0x763d13,
  roughness: 0.7,
  metalness: 0.05,
  emissiveIntensity: 1.5,
});

export const selectedCornMat = new MeshStandardMaterial({
  color: 0x0000FF,
  roughness: 0.2,
  metalness: 0.05,
  emissiveIntensity: 1.5,
});

export const blankMat = new MeshStandardMaterial({
  color: 0xcccccc,
  roughness: 0.9,
  metalness: 0.1,
});
