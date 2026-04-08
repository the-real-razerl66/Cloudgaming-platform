"""Input injection system for keyboard and mouse events"""

import asyncio
from typing import Dict, Any
from pynput import mouse, keyboard
from pynput.mouse import Button
from pynput.keyboard import Key
from .config import config
from .logger import logger


class InputHandler:
    """Handle remote input injection"""

    def __init__(self):
        self.enabled = config.get("input.enabled", True)
        self.mouse_sensitivity = config.get("input.mouse_sensitivity", 1.0)
        self.mouse_controller = mouse.Controller()
        self.keyboard_controller = keyboard.Controller()
        logger.info("Input handler initialized")

    async def handle_input(self, input_data: Dict[str, Any]) -> None:
        """Process input event from remote client"""
        if not self.enabled:
            return

        try:
            input_type = input_data.get("type")
            
            if input_type == "mouse_move":
                await self._handle_mouse_move(input_data)
            elif input_type == "mouse_button":
                await self._handle_mouse_button(input_data)
            elif input_type == "mouse_wheel":
                await self._handle_mouse_wheel(input_data)
            elif input_type == "keyboard":
                await self._handle_keyboard(input_data)
            elif input_type == "gamepad":
                await self._handle_gamepad(input_data)
            else:
                logger.warning(f"Unknown input type: {input_type}")
        except Exception as e:
            logger.error(f"Error handling input: {e}")

    async def _handle_mouse_move(self, data: Dict[str, Any]) -> None:
        """Handle mouse movement"""
        try:
            dx = data.get("dx", 0) * self.mouse_sensitivity
            dy = data.get("dy", 0) * self.mouse_sensitivity
            
            # Get current position
            current_x, current_y = self.mouse_controller.position
            
            # Move to new position
            new_x = current_x + dx
            new_y = current_y + dy
            
            self.mouse_controller.position = (new_x, new_y)
        except Exception as e:
            logger.error(f"Error handling mouse move: {e}")

    async def _handle_mouse_button(self, data: Dict[str, Any]) -> None:
        """Handle mouse button press/release"""
        try:
            button_name = data.get("button", "left")
            action = data.get("action", "press")
            
            # Map button name to pynput Button
            button_map = {
                "left": Button.left,
                "right": Button.right,
                "middle": Button.middle,
            }
            
            button = button_map.get(button_name, Button.left)
            
            if action == "press":
                self.mouse_controller.press(button)
            elif action == "release":
                self.mouse_controller.release(button)
        except Exception as e:
            logger.error(f"Error handling mouse button: {e}")

    async def _handle_mouse_wheel(self, data: Dict[str, Any]) -> None:
        """Handle mouse wheel scroll"""
        try:
            dx = data.get("dx", 0)
            dy = data.get("dy", 0)
            
            self.mouse_controller.scroll(dx, dy)
        except Exception as e:
            logger.error(f"Error handling mouse wheel: {e}")

    async def _handle_keyboard(self, data: Dict[str, Any]) -> None:
        """Handle keyboard press/release"""
        try:
            key_name = data.get("key")
            action = data.get("action", "press")
            
            if not key_name:
                return
            
            # Try to get special key first
            key = self._get_key(key_name)
            
            if action == "press":
                self.keyboard_controller.press(key)
            elif action == "release":
                self.keyboard_controller.release(key)
        except Exception as e:
            logger.error(f"Error handling keyboard: {e}")

    async def _handle_gamepad(self, data: Dict[str, Any]) -> None:
        """Handle gamepad input and translate to keyboard/mouse"""
        try:
            # Gamepad button/axis mappings to keyboard/mouse actions
            action_type = data.get("action_type")
            
            if action_type == "button":
                button = data.get("button")
                pressed = data.get("pressed", False)
                
                # Map gamepad buttons to keyboard keys
                button_mapping = {
                    0: "space",      # A button -> Space
                    1: "escape",     # B button -> Escape
                    2: "e",          # X button -> E
                    3: "r",          # Y button -> R
                    # Add more mappings as needed
                }
                
                key_name = button_mapping.get(button)
                if key_name:
                    await self._handle_keyboard({
                        "key": key_name,
                        "action": "press" if pressed else "release"
                    })
            
            elif action_type == "axis":
                axis = data.get("axis")
                value = data.get("value", 0.0)
                
                # Map analog sticks to mouse movement or WASD
                if axis == 0:  # Left stick X
                    if abs(value) > 0.2:  # Deadzone
                        # Translate to A/D keys
                        if value < 0:
                            await self._handle_keyboard({"key": "a", "action": "press"})
                        else:
                            await self._handle_keyboard({"key": "d", "action": "press"})
                elif axis == 1:  # Left stick Y
                    if abs(value) > 0.2:
                        # Translate to W/S keys
                        if value < 0:
                            await self._handle_keyboard({"key": "w", "action": "press"})
                        else:
                            await self._handle_keyboard({"key": "s", "action": "press"})
                elif axis == 2:  # Right stick X (mouse look)
                    if abs(value) > 0.1:
                        await self._handle_mouse_move({"dx": value * 10, "dy": 0})
                elif axis == 3:  # Right stick Y (mouse look)
                    if abs(value) > 0.1:
                        await self._handle_mouse_move({"dx": 0, "dy": value * 10})
        except Exception as e:
            logger.error(f"Error handling gamepad: {e}")

    def _get_key(self, key_name: str):
        """Get pynput Key object from string"""
        # Try special keys first
        special_keys = {
            "space": Key.space,
            "enter": Key.enter,
            "escape": Key.esc,
            "shift": Key.shift,
            "ctrl": Key.ctrl,
            "alt": Key.alt,
            "tab": Key.tab,
            "backspace": Key.backspace,
            "delete": Key.delete,
            "up": Key.up,
            "down": Key.down,
            "left": Key.left,
            "right": Key.right,
        }
        
        return special_keys.get(key_name.lower(), key_name)

    def set_sensitivity(self, sensitivity: float) -> None:
        """Update mouse sensitivity"""
        self.mouse_sensitivity = max(0.1, min(5.0, sensitivity))
        logger.info(f"Mouse sensitivity set to: {self.mouse_sensitivity}")
