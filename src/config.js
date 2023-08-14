import { Color } from 'three';

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
    new Color('hsl(45, 100%, 60%)'),
    new Color('hsl(50, 100%, 60%)'),
  ],
  browns: [
    new Color('hsl(40, 20%, 20%)'),
    new Color('hsl(50, 20%, 20%)'),
    new Color('hsl(25, 20%, 30%)'),
  ],
};

export const randomColor = (base) => colors[base][Math.floor(Math.random() * colors[base].length)];

export const gameDuration = 30;
