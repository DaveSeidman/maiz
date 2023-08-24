import { Color } from 'three';

export const levels = {
  easy: { width: 10, height: 24 },
  medium: { width: 18, height: 24 },
  hard: { width: 24, height: 24 },
};

export const colors = {
  yellows: [
    new Color('hsl(45, 100%, 60%)'),
    new Color('hsl(50, 100%, 60%)'),
    new Color('hsl(55, 100%, 70%)'),
  ],
  browns: [
    new Color('hsl(40, 20%, 20%)'),
    new Color('hsl(50, 20%, 20%)'),
    new Color('hsl(25, 20%, 30%)'),
    new Color('hsl(25, 10%, 40%)'),
  ],
};

export const randomColor = (base) => colors[base][Math.floor(Math.random() * colors[base].length)];

export const gameDuration = 60;
