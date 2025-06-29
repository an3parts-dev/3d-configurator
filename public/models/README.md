# 3D Models Directory

This directory contains 3D models for the configurator products.

## File Organization

- `brake-line.glb` - Main brake line configurator model
- `brake-line-v2.glb` - Updated version of brake line model
- `other-products/` - Additional product models

## Supported Formats

- `.glb` (recommended) - Binary GLTF format, smaller file size
- `.gltf` - Text-based GLTF format with separate texture files

## Usage

Reference models in your admin panel using paths like:
- `/models/brake-line.glb`
- `/models/other-products/product-name.glb`

## File Size Guidelines

- Keep models under 10MB for optimal web performance
- Use Draco compression when possible to reduce file size
- Optimize textures to reasonable resolutions (1024x1024 or 2048x2048)