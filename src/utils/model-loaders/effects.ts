
import * as THREE from 'three';

// Create a visual highlight effect
export const createHighlightEffect = (scene: THREE.Scene, position: THREE.Vector3, color: string = '#FFFFFF') => {
  // Create a expanding ring effect
  const geometry = new THREE.RingGeometry(0.2, 0.3, 16);
  const material = new THREE.MeshBasicMaterial({ 
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  
  const ring = new THREE.Mesh(geometry, material);
  ring.position.copy(position);
  ring.position.y += 0.1;
  ring.rotation.x = -Math.PI / 2;
  scene.add(ring);
  
  // Animate the ring
  let scale = 1;
  let opacity = 0.7;
  
  const animate = () => {
    scale += 0.05;
    opacity -= 0.02;
    
    ring.scale.set(scale, scale, scale);
    material.opacity = opacity;
    
    if (opacity <= 0) {
      scene.remove(ring);
      ring.geometry.dispose();
      material.dispose();
      return;
    }
    
    requestAnimationFrame(animate);
  };
  
  animate();
};

// Create a pulsing highlight for selected hexes
export const createPulsingHighlight = (scene: THREE.Scene, position: THREE.Vector3, color: string = '#FFFFFF'): THREE.Mesh => {
  const geometry = new THREE.RingGeometry(0.8, 0.9, 32);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  
  const ring = new THREE.Mesh(geometry, material);
  ring.position.copy(position);
  ring.position.y += 0.05;
  ring.rotation.x = -Math.PI / 2;
  scene.add(ring);
  
  // Return the mesh so it can be removed later
  return ring;
};

// Animate a pulsing highlight
export const animatePulsingHighlight = (mesh: THREE.Mesh): { update: () => void, stop: () => void } => {
  let scale = 1;
  let opacity = 0.5;
  let increasing = false;
  let animationId: number | null = null;
  
  const update = () => {
    if (increasing) {
      scale += 0.005;
      opacity += 0.01;
      if (scale >= 1.1) increasing = false;
    } else {
      scale -= 0.005;
      opacity -= 0.01;
      if (scale <= 0.9) increasing = true;
    }
    
    mesh.scale.set(scale, scale, scale);
    (mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
    
    animationId = requestAnimationFrame(update);
  };
  
  update();
  
  return {
    update,
    stop: () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    }
  };
};
