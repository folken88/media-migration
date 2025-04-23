<<<<<<< HEAD
# Media Migration for FoundryVTT

A FoundryVTT module that automatically updates your world's entities to use WebP images when available. This module is designed to work in tandem with the [Media Optimizer](https://github.com/ghost-fvtt/media-optimizer) module, serving as the perfect companion to automatically migrate your entities to use the optimized WebP images.

## Features

- Automatically scans and updates image references in:
  - Actors and their items
  - Items
  - Journal entries
  - Scenes (including backgrounds and tokens)
- Only updates images if a WebP version exists with the same name
- Provides a progress bar during migration
- Generates a detailed report of all migrations in chat
- Simple one-click migration process
- GM-only controls for safety

## Installation

1. Inside FoundryVTT, select the Game Modules tab in the Configuration and Setup menu
2. Click the Install Module button and enter the following URL: [YOUR_MANIFEST_URL]
3. Click Install and wait for installation to complete

## Requirements

- FoundryVTT version 10 or higher
- [Media Optimizer](https://github.com/ghost-fvtt/media-optimizer) module (for creating WebP versions of your images)

## Usage

1. First, use the Media Optimizer module to create WebP versions of your images
2. Open the Module Settings in FoundryVTT
3. Click the "Run Migration" button under Media Migration settings
4. Review the pre-migration checklist
5. Click "Begin Migration" to start the process
6. Wait for the process to complete
7. Review the chat message for a detailed migration report

## How it Works

The module searches through all entities in your world that contain image references. For each image (jpg/jpeg/png), it checks if there's a corresponding WebP version with the same name. For example:
- `portraits/character.jpg` → `portraits/character.webp`
- `maps/dungeon.png` → `maps/dungeon.webp`

If a WebP version is found, the module updates the entity to use the WebP version instead.

## Credits

This module was inspired by and designed to work alongside the excellent [Media Optimizer](https://github.com/ghost-fvtt/media-optimizer) module. While Media Optimizer handles the creation of WebP images, Media Migration ensures your Foundry entities actually use these optimized versions.

## License

This module is licensed under the MIT License. See the LICENSE file for details. 
=======
# media-migration
>>>>>>> 804900e49bfc3b49c1a2f5b20d24400044f9e4a9
