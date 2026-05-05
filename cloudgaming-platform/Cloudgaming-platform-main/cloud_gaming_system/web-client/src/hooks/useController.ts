/**
 * useController Hook
 * Detects and manages gamepad/controller input using the Gamepad API
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GamepadState } from '../types';

interface UseControllerReturn {
  gamepads: GamepadState[];
  connected: boolean;
  activeGamepad: GamepadState | null;
}

export const useController = (): UseControllerReturn => {
  const [gamepads, setGamepads] = useState<GamepadState[]>([]);
  const [connected, setConnected] = useState(false);
  const animationFrameId = useRef<number | null>(null);

  /**
   * Convert Gamepad to GamepadState
   */
  const convertGamepad = useCallback((gamepad: Gamepad): GamepadState => {
    return {
      connected: gamepad.connected,
      id: gamepad.id,
      index: gamepad.index,
      buttons: Array.from(gamepad.buttons),
      axes: Array.from(gamepad.axes),
      timestamp: gamepad.timestamp,
    };
  }, []);

  /**
   * Poll gamepad state
   */
  const pollGamepads = useCallback(() => {
    const gamepadsArray = navigator.getGamepads();
    const connectedGamepads: GamepadState[] = [];

    for (let i = 0; i < gamepadsArray.length; i++) {
      const gamepad = gamepadsArray[i];
      if (gamepad) {
        connectedGamepads.push(convertGamepad(gamepad));
      }
    }

    setGamepads(connectedGamepads);
    setConnected(connectedGamepads.length > 0);

    // Continue polling
    animationFrameId.current = requestAnimationFrame(pollGamepads);
  }, [convertGamepad]);

  /**
   * Handle gamepad connected event
   */
  const handleGamepadConnected = useCallback((event: GamepadEvent) => {
    console.log('Gamepad connected:', event.gamepad.id);
    // Polling will pick up the new gamepad
  }, []);

  /**
   * Handle gamepad disconnected event
   */
  const handleGamepadDisconnected = useCallback((event: GamepadEvent) => {
    console.log('Gamepad disconnected:', event.gamepad.id);
  }, []);

  /**
   * Set up event listeners and polling
   */
  useEffect(() => {
    // Check if Gamepad API is supported
    if (!('getGamepads' in navigator)) {
      console.warn('Gamepad API not supported');
      return;
    }

    // Add event listeners
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Start polling
    animationFrameId.current = requestAnimationFrame(pollGamepads);

    // Cleanup
    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [pollGamepads, handleGamepadConnected, handleGamepadDisconnected]);

  return {
    gamepads,
    connected,
    activeGamepad: gamepads.length > 0 ? gamepads[0] : null,
  };
};
