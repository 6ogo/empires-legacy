
import * as THREE from 'three';

interface TextSpriteOptions {
  text: string;
  position: { x: number, y: number, z: number };
  color?: string;
  backgroundColor?: string;
  fontFace?: string;
  fontSize?: number;
  padding?: number;
  scale?: { x: number, y: number };
}

export const createTextSprite = ({
  text,
  position,
  color = 'white',
  backgroundColor = 'rgba(0,0,0,0.7)',
  fontFace = 'Arial',
  fontSize = 24,
  padding = 10,
  scale = { x: 0.5, y: 0.25 }
}: TextSpriteOptions): THREE.Sprite => {
  // Create canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to get canvas context');
  
  // Set canvas dimensions
  canvas.width = 256;
  canvas.height = 128;
  
  // Draw background
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw text
  context.font = `${fontSize}px ${fontFace}`;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // Handle multi-line text
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.2;
  const totalHeight = lineHeight * lines.length;
  const startY = (canvas.height - totalHeight) / 2 + fontSize / 2;
  
  lines.forEach((line, index) => {
    context.fillText(line, canvas.width / 2, startY + index * lineHeight);
  });
  
  // Create sprite from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  const spriteMaterial = new THREE.SpriteMaterial({ 
    map: texture,
    transparent: true
  });
  
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(scale.x, scale.y, 1);
  sprite.position.set(position.x, position.y, position.z);
  
  return sprite;
};

export const updateTextSprite = (
  sprite: THREE.Sprite, 
  newText: string,
  backgroundColor: string = 'rgba(0,0,0,0.7)',
  textColor: string = 'white'
): void => {
  const material = sprite.material as THREE.SpriteMaterial;
  const texture = material.map as THREE.CanvasTexture;
  
  if (!texture || !texture.image) return;
  
  const canvas = texture.image as HTMLCanvasElement;
  const context = canvas.getContext('2d');
  if (!context) return;
  
  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw text
  context.font = '24px Arial';
  context.fillStyle = textColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // Handle multi-line text
  const lines = newText.split('\n');
  const lineHeight = 28;
  const totalHeight = lineHeight * lines.length;
  const startY = (canvas.height - totalHeight) / 2 + 12;
  
  lines.forEach((line, index) => {
    context.fillText(line, canvas.width / 2, startY + index * lineHeight);
  });
  
  // Update texture
  texture.needsUpdate = true;
};
