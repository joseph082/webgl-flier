# Wingsuit Flier

We want to capture the experience of flying through a set of beautiful winter mountains

# Gameplay
Glide down the mountain while moving the player around. On the way down, you aim to avoid crashing into the terrain and can pass through rings for bonus points.

|  KEY  |            ACTION             |
|:-----:|:-----------------------------:|
|   W   | Flatten parachute (slow down) |
|   S   |     Bank down (speed up)      |
|   A   |           Turn left           |
|   D   |          Turn right           |
|   Q   |       Lateral move left       |
|   E   |      Lateral move right       |
| SPACE |         Pause/Unpause         |
|  ESC  |        Restart the game       |

# Features:
- Modeling
    - Mountain Scene
        - With trees, rocks, and rings randomly placed
- Rendering
  - Phong Lighting for objects
    -  Sun is a point light
  - Animation
    - Player Movement
    - Camera tracks flier
- Textures for trees, mountains, rocks, & snow
- Track and display score & time 

# Advanced Features
- Shadow Lighting
  - 2-pass z-buffer algorithm draws shadows for player, trees, and mountains
- Collision Detection
  - Computed intersection with plane, cone, and cylinders to determine what the player collides with (rings, mountain, ground, trees)
- Snow Particles
  - Created 10 particles which move around the screen in random directions
