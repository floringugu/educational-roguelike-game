import { createContext, useContext } from 'react';
import { type CameraMove, depthDuring, stepKeyframes } from './camera';
import { type ClassroomPlane } from './classroomLayout';

// The camera of the classroom (ADR-0017), shared by GameFrame with every
// screen inside it. The planes of the classroom and the elements of a screen
// that stand on one of them, such as the enemy on the desk, attach to it;
// a screen asks it to play a move, such as the shake of a hit.
export type Camera = {
  // A plane of the classroom, laid out at one CSS pixel per pixel of the
  // art. Returns the function that detaches it.
  attachPlane: (plane: ClassroomPlane, element: HTMLElement) => () => void;
  // An element of a screen, outside the classroom, that moves with a plane.
  // Returns the function that detaches it.
  attachFollower: (plane: ClassroomPlane, element: HTMLElement) => () => void;
  // Moves the planes and their followers. It does nothing while the
  // classroom is still (useClassroomMotion).
  play: (move: CameraMove) => void;
  // Moves one element of a screen in whole pixels of the art, with the
  // keyframes of the camera, such as the enemy that drops onto the desk.
  // It plays even while the classroom is still.
  playOn: (element: HTMLElement, move: CameraMove, delayMs?: number) => Animation;
  // GameFrame keeps the settings up to date.
  setArtPixel: (artPixel: number) => void;
  setStill: (isStill: boolean) => void;
};

type CameraSettings = {
  // One pixel of the art in CSS pixels, outside the classroom.
  artPixel: number;
  isStill: boolean;
};

// The camera starts with the settings of the first render: the screens
// inside the frame run their effects before the frame runs its own, and the
// first move, when the combat starts, must already use them.
export function createCamera(initialSettings: CameraSettings): Camera {
  const planes = new Map<HTMLElement, ClassroomPlane>();
  const followers = new Map<HTMLElement, ClassroomPlane>();
  // The move that each element is playing. A new move replaces it, so two
  // moves never add up and take a plane further than its padding.
  const runningMoves = new Map<HTMLElement, Animation>();
  let artPixel = initialSettings.artPixel;
  let isStill = initialSettings.isStill;

  function playKeyframes(element: HTMLElement, keyframes: Keyframe[], move: CameraMove, delayMs = 0): Animation {
    runningMoves.get(element)?.cancel();
    const animation = element.animate(keyframes, { duration: move.durationMs, delay: delayMs });
    runningMoves.set(element, animation);
    return animation;
  }

  return {
    attachPlane(plane, element) {
      planes.set(element, plane);
      return () => planes.delete(element);
    },
    attachFollower(plane, element) {
      followers.set(element, plane);
      return () => followers.delete(element);
    },
    play(move) {
      if (isStill) {
        return;
      }
      for (const [element, plane] of planes) {
        playKeyframes(element, stepKeyframes(move, depthDuring(move, plane), 1), move);
      }
      for (const [element, plane] of followers) {
        playKeyframes(element, stepKeyframes(move, depthDuring(move, plane), artPixel), move);
      }
    },
    playOn(element, move, delayMs) {
      return playKeyframes(element, stepKeyframes(move, 1, artPixel), move, delayMs);
    },
    setArtPixel(newArtPixel) {
      artPixel = newArtPixel;
    },
    setStill(newIsStill) {
      isStill = newIsStill;
    },
  };
}

// Outside a GameFrame, as in a test that renders a single screen, the camera
// is one with nothing attached, which never moves.
export const CameraContext = createContext<Camera>(createCamera({ artPixel: 1, isStill: true }));

export function useCamera(): Camera {
  return useContext(CameraContext);
}
