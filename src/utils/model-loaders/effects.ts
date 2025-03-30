// ================================================
// File: src/utils/model-loaders/effects.ts
// ================================================

import * as THREE from 'three';

// Create a visual highlight effect (e.g., for selection)
export const createHighlightEffect = (scene: THREE.Scene, position: THREE.Vector3, color: string = '#FFFF00', size = 1.1): THREE.Mesh => {
  // Use a Cylinder or Ring geometry slightly larger than the hex base
  const geometry = new THREE.CylinderGeometry(size * 0.95, size * 0.95, 0.05, 6); // Hexagon shape
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    depthWrite: false // Render on top without z-fighting
  });

  const highlight = new THREE.Mesh(geometry, material);
  highlight.position.copy(position);
  highlight.position.y += 0.01; // Slightly above the base hex
  highlight.rotation.x = Math.PI / 2; // Align with hex orientation if needed (depends on base hex)
  scene.add(highlight);

  return highlight; // Return the mesh so it can be managed (added/removed)
};


// Example of a simple particle effect for combat or events
export const createParticleEffect = (scene: THREE.Scene, position: THREE.Vector3, count: number = 20, color: string = '#FF0000') => {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size: 0.1,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending, // Nice effect for explosions/sparks
        depthWrite: false
    });

    const vertices = [];
    for (let i = 0; i < count; i++) {
        // Random position spread around the target position
        const x = position.x + (Math.random() - 0.5) * 1.5;
        const y = position.y + Math.random() * 1.0; // Spread vertically
        const z = position.z + (Math.random() - 0.5) * 1.5;
        vertices.push(x, y, z);
    }
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Animate particles (fade out and remove)
    let opacity = particlesMaterial.opacity;
    const fadeOutDuration = 0.5; // seconds
    const startTime = Date.now();

    const animate = () => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        opacity = Math.max(0, particlesMaterial.opacity - (elapsedTime / fadeOutDuration) * particlesMaterial.opacity);
        particlesMaterial.opacity = opacity;

        if (opacity <= 0) {
            scene.remove(particles);
            particlesGeometry.dispose();
            particlesMaterial.dispose();
            return;
        }
        requestAnimationFrame(animate);
    };
    animate();

    return particles; // Return if further manipulation needed
};


// Utility function to update pulsing effect (example)
export const updatePulseEffect = (mesh: THREE.Mesh | null, time: number) => {
    if (!mesh) return;
    const pulseFactor = Math.sin(time * 5) * 0.1 + 1.0; // Gentle pulsing scale
    mesh.scale.set(pulseFactor, pulseFactor, pulseFactor);
    if (mesh.material instanceof THREE.MeshBasicMaterial) {
         mesh.material.opacity = Math.sin(time * 3) * 0.15 + 0.4; // Pulsing opacity
    }
};