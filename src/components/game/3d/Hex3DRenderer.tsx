
import React from "react";
import * as THREE from 'three';
import { loadModel, getTerritoryModel, createHighlightEffect } from '../../../utils/model-loader';

interface Hex3DRendererProps {
  territory: any;
  players: any[];
  isSelected: boolean;
  isHighlighted: boolean;
  highlightColor?: string;
  scene: THREE.Scene;
  hexMeshesRef: React.MutableRefObject<Map<number, THREE.Group>>;
  gridCenter: { x: number, y: number };
  horizontalSpacing: number;
  verticalSpacing: number;
}

// Function component to handle rendering individual 3D hexes
export const Hex3DRenderer = async ({
  territory,
  players,
  isSelected,
  isHighlighted,
  highlightColor = "#FFFFFF",
  scene,
  hexMeshesRef,
  gridCenter,
  horizontalSpacing,
  verticalSpacing
}: Hex3DRendererProps) => {
  // Convert from axial coordinates to 3D position
  const x = horizontalSpacing * (territory.position.x - gridCenter.x);
  const z = verticalSpacing * (territory.position.y - gridCenter.y);
  
  // Create a group for this territory and all its models
  const territoryGroup = new THREE.Group();
  territoryGroup.position.set(x, 0, z);
  territoryGroup.userData = { territoryId: territory.id };
  
  // Load base terrain model
  const baseModel = await loadModel('base');
  const terrainModel = await loadModel(territory.type || 'plains');
  
  baseModel.position.y = 0;
  territoryGroup.add(baseModel);
  
  terrainModel.position.y = 0.05; // Slightly elevated from base
  territoryGroup.add(terrainModel);
  
  // Add buildings if any
  if (territory.buildings && territory.buildings.length > 0) {
    const buildingPositions = [
      { x: 0, z: 0 },       // Center
      { x: 0.3, z: 0 },     // Right
      { x: 0.15, z: 0.25 },  // Top right
      { x: -0.15, z: 0.25 }, // Top left
      { x: -0.3, z: 0 },    // Left
      { x: -0.15, z: -0.25 }, // Bottom left
      { x: 0.15, z: -0.25 }   // Bottom right
    ];
    
    for (let i = 0; i < Math.min(territory.buildings.length, buildingPositions.length); i++) {
      const buildingType = typeof territory.buildings[i] === 'object' 
        ? territory.buildings[i].type 
        : getBuildingTypeFromId(territory.buildings[i], players[territory.owner || 0]?.buildings || []);
      
      if (buildingType) {
        const buildingModel = await loadModel(buildingType);
        if (buildingModel) {
          buildingModel.position.set(
            buildingPositions[i].x,
            0.12, // On top of the terrain
            buildingPositions[i].z
          );
          territoryGroup.add(buildingModel);
        }
      }
    }
  }
  
  // Add units if any
  if (territory.units && territory.units.length > 0) {
    // Position units in a circle around the center
    const unitCount = territory.units.length;
    const radius = 0.3;
    
    for (let i = 0; i < unitCount; i++) {
      const angle = (i / unitCount) * Math.PI * 2;
      const unitX = Math.sin(angle) * radius * 0.8;
      const unitZ = Math.cos(angle) * radius * 0.8;
      
      // Create a simple unit representation
      const unitModel = await loadModel('soldier');
      if (unitModel) {
        unitModel.position.set(unitX, 0.15, unitZ);
        unitModel.scale.set(0.5, 0.5, 0.5);
        territoryGroup.add(unitModel);
      }
    }
  }
  
  // Add owner marker
  if (territory.owner !== null && players[territory.owner]) {
    const color = players[territory.owner].color;
    const hexSize = 1.0;
    const markerGeometry = new THREE.CylinderGeometry(hexSize * 0.5, hexSize * 0.5, 0.05, 6);
    const markerMaterial = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.5
    });
    
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.y = -0.04; // Slightly below terrain
    territoryGroup.add(marker);
  }
  
  // Add selection highlight
  if (isSelected) {
    const hexSize = 1.0;
    const highlightGeometry = new THREE.CylinderGeometry(hexSize * 0.6, hexSize * 0.6, 0.05, 6);
    const highlightMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    
    const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlight.position.y = 0.1; // Above terrain
    territoryGroup.add(highlight);
  }
  
  // Add action highlight
  if (isHighlighted) {
    const hexSize = 1.0;
    const actionHighlightGeometry = new THREE.CylinderGeometry(hexSize * 0.55, hexSize * 0.55, 0.05, 6);
    const actionHighlightMaterial = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color(highlightColor),
      transparent: true,
      opacity: 0.4,
      wireframe: false
    });
    
    const actionHighlight = new THREE.Mesh(actionHighlightGeometry, actionHighlightMaterial);
    actionHighlight.position.y = 0.08; // Above terrain
    territoryGroup.add(actionHighlight);
  }
  
  // Add to scene and store reference
  scene.add(territoryGroup);
  hexMeshesRef.current.set(territory.id, territoryGroup);
  
  return territoryGroup;
};

// Helper function to get building type from building ID
const getBuildingTypeFromId = (buildingId: number, buildings: any[]): string | null => {
  if (!buildings) return null;
  const building = buildings.find(b => b.id === buildingId);
  return building ? building.type : null;
};
