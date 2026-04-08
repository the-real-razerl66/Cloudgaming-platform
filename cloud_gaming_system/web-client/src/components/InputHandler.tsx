/**
 * InputHandler Component
 * Captures and sends keyboard, mouse, and gamepad inputs to the VM
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useController } from '../hooks/useController';
import { GamepadState } from '../types';

interface InputHandlerProps {
  enabled: boolean;
  onInput: (inputData: any) => void;
  captureElement?: React.RefObject<HTMLElement>;
  showGamepadStatus?: boolean;
}

export const InputHandler: React.FC<InputHandlerProps> = ({
  enabled,
  onInput,
  captureElement,
  showGamepadStatus = false,
}) => {
  const { gamepads, connected: gamepadConnected, activeGamepad } = useController();
  const previousGamepadState = useRef<GamepadState | null>(null);
  const mouseLocked = useRef(false);

  /**
   * Handle keyboard input
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      event.preventDefault();
      onInput({
        type: 'keyboard',
        key: event.key.toLowerCase(),
        code: event.code,
        action: 'press',
      });
    },
    [enabled, onInput]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      event.preventDefault();
      onInput({
        type: 'keyboard',
        key: event.key.toLowerCase(),
        code: event.code,
        action: 'release',
      });
    },
    [enabled, onInput]
  );

  /**
   * Handle mouse movement
   */
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!enabled || !mouseLocked.current) return;

      onInput({
        type: 'mouse_move',
        dx: event.movementX,
        dy: event.movementY,
      });
    },
    [enabled, onInput]
  );

  /**
   * Handle mouse buttons
   */
  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (!enabled) return;

      event.preventDefault();
      const buttonNames = ['left', 'middle', 'right'];
      onInput({
        type: 'mouse_button',
        button: buttonNames[event.button] || 'left',
        action: 'press',
      });
    },
    [enabled, onInput]
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      if (!enabled) return;

      event.preventDefault();
      const buttonNames = ['left', 'middle', 'right'];
      onInput({
        type: 'mouse_button',
        button: buttonNames[event.button] || 'left',
        action: 'release',
      });
    },
    [enabled, onInput]
  );

  /**
   * Handle mouse wheel
   */
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!enabled) return;

      event.preventDefault();
      onInput({
        type: 'mouse_wheel',
        dx: event.deltaX,
        dy: event.deltaY,
      });
    },
    [enabled, onInput]
  );

  /**
   * Handle pointer lock
   */
  const handleClick = useCallback(() => {
    if (!enabled) return;

    const element = captureElement?.current || document.body;
    element.requestPointerLock?.();
  }, [enabled, captureElement]);

  const handlePointerLockChange = useCallback(() => {
    mouseLocked.current = document.pointerLockElement !== null;
  }, []);

  /**
   * Process gamepad input
   */
  useEffect(() => {
    if (!enabled || !activeGamepad) return;

    const previous = previousGamepadState.current;

    // Check button changes
    activeGamepad.buttons.forEach((button, index) => {
      const wasPressed = previous?.buttons[index]?.pressed || false;
      const isPressed = button.pressed;

      if (wasPressed !== isPressed) {
        onInput({
          type: 'gamepad',
          action_type: 'button',
          button: index,
          pressed: isPressed,
          value: button.value,
        });
      }
    });

    // Check axis changes (with deadzone)
    const deadzone = 0.15;
    activeGamepad.axes.forEach((value, index) => {
      const previousValue = previous?.axes[index] || 0;
      const adjustedValue = Math.abs(value) > deadzone ? value : 0;
      const adjustedPrevious = Math.abs(previousValue) > deadzone ? previousValue : 0;

      if (Math.abs(adjustedValue - adjustedPrevious) > 0.01) {
        onInput({
          type: 'gamepad',
          action_type: 'axis',
          axis: index,
          value: adjustedValue,
        });
      }
    });

    previousGamepadState.current = activeGamepad;
  }, [activeGamepad, enabled, onInput]);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    if (!enabled) return;

    const element = captureElement?.current || document;

    // Keyboard events
    element.addEventListener('keydown', handleKeyDown as any);
    element.addEventListener('keyup', handleKeyUp as any);

    // Mouse events
    element.addEventListener('mousemove', handleMouseMove as any);
    element.addEventListener('mousedown', handleMouseDown as any);
    element.addEventListener('mouseup', handleMouseUp as any);
    element.addEventListener('wheel', handleWheel as any);
    element.addEventListener('click', handleClick as any);

    // Pointer lock events
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      element.removeEventListener('keydown', handleKeyDown as any);
      element.removeEventListener('keyup', handleKeyUp as any);
      element.removeEventListener('mousemove', handleMouseMove as any);
      element.removeEventListener('mousedown', handleMouseDown as any);
      element.removeEventListener('mouseup', handleMouseUp as any);
      element.removeEventListener('wheel', handleWheel as any);
      element.removeEventListener('click', handleClick as any);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);

      // Release pointer lock
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    };
  }, [enabled, captureElement, handleKeyDown, handleKeyUp, handleMouseMove, handleMouseDown, handleMouseUp, handleWheel, handleClick, handlePointerLockChange]);

  if (!showGamepadStatus) {
    return null;
  }

  return (
    <div className="gamepad-status">
      <h4>Gamepad Status</h4>
      {gamepadConnected ? (
        <div>
          <p>✓ Gamepad Connected</p>
          {gamepads.map((gamepad) => (
            <p key={gamepad.index}>
              {gamepad.index}: {gamepad.id}
            </p>
          ))}
        </div>
      ) : (
        <p>No gamepad detected</p>
      )}
    </div>
  );
};
