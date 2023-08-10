import { Color, PCFSoftShadowMap } from 'three';

export const camshakeConfig = {
  maxYaw: 0.005, // Max amount camera can yaw in either direction
  maxPitch: 0.005, // Max amount camera can pitch in either direction
  maxRoll: 0.005, // Max amount camera can roll in either direction
  yawFrequency: 0.7, // Frequency of the the yaw rotation
  pitchFrequency: 0.7, // Frequency of the pitch rotation
  rollFrequency: 0.7, // Frequency of the roll rotation
  intensity: 1, // initial intensity of the shake
  decay: false, // should the intensity decay over time
  decayRate: 0.65, // if decay = true this is the rate at which intensity will reduce at
  controls: undefined, // if using orbit controls, pass a ref here so we can update the rotation
};

export const levels = {
  easy: { width: 10, height: 24 },
  medium: { width: 18, height: 24 },
  hard: { width: 24, height: 24 },
};

export const colors = {
  yellows: [
    new Color('rgb(251, 225, 14)'),
    new Color('rgb(253, 244, 18)'),
    new Color('rgb(247, 229, 48)'),
  ],
  browns: [
    new Color('rgb(10 , 10, 5)'),
    new Color('rgb(19, 8, 10)'),
    new Color('rgb(13, 8, 6)'),
  ],
};
