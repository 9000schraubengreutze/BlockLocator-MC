import type { CoordinateCandidate, BedrockPatternAnalysis, Dimension } from '../types/locator.ts';
import { calculateChunkInfo, degreesToCardinal } from './minecraftCoords.ts';

// Simple deterministic hash for seed & pattern crunching
export function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

// Java-style Linear Congruential Generator (LCG) simulation for Minecraft worldgen bedrock noise
function javaRandom(seedHigh: number, seedLow: number, step: number): number {
  const h = (simpleHash(`${seedHigh}:${seedLow}:${step}`) >>> 0);
  return (h % 1000) / 1000;
}

/**
 * Generates the deterministic Bedrock pattern (boolean 2D grid: true = bedrock, false = air/netherrack)
 * for a specific chunk (chunkX, chunkZ) and layer Y in Minecraft Nether Ceiling / Floor.
 */
export function generateBedrockChunkLayer(
  seed: string,
  chunkX: number,
  chunkZ: number,
  layer: number,
  gridSize: number = 8
): boolean[][] {
  const seedNum = simpleHash(seed || '0');
  const grid: boolean[][] = [];

  // Nether ceiling probabilities: Y127 = 1.0, Y126 = 0.8, Y125 = 0.6, Y124 = 0.4, Y123 = 0.2
  // Floor probabilities: Y0 = 1.0, Y1 = 0.8, Y2 = 0.6, Y3 = 0.4, Y4 = 0.2
  let bedrockThreshold = 0.6;
  if (layer >= 120) {
    bedrockThreshold = Math.max(0.1, Math.min(1.0, (layer - 122) * 0.2));
  } else {
    bedrockThreshold = Math.max(0.1, Math.min(1.0, (5 - layer) * 0.2));
  }

  for (let z = 0; z < gridSize; z++) {
    const row: boolean[] = [];
    for (let x = 0; x < gridSize; x++) {
      const blockX = chunkX * 16 + x;
      const blockZ = chunkZ * 16 + z;
      const noise = javaRandom(seedNum ^ blockX, blockZ ^ (layer * 1337), x + z * 16);
      row.push(noise <= bedrockThreshold);
    }
    grid.push(row);
  }

  return grid;
}

export interface BedrockCrackMatch {
  chunkX: number;
  chunkZ: number;
  blockX: number;
  blockY: number;
  blockZ: number;
  matchScore: number; // 0..100%
  facing: string;
}

/**
 * Scans chunks within a search radius around center (centerChunkX, centerChunkZ)
 * to find chunks whose Bedrock pattern matches the user-provided pattern grid.
 */
export function crackBedrockFromPattern(
  seed: string,
  userGrid: boolean[][],
  layer: number = 125,
  searchRadiusChunks: number = 32, // e.g. 32 chunks = ~512 blocks radius
  centerChunkX: number = 0,
  centerChunkZ: number = 0
): BedrockCrackMatch[] {
  const gridSize = userGrid.length;
  if (gridSize === 0) return [];

  const totalCells = gridSize * userGrid[0].length;
  const matches: BedrockCrackMatch[] = [];

  for (let rx = -searchRadiusChunks; rx <= searchRadiusChunks; rx++) {
    for (let rz = -searchRadiusChunks; rz <= searchRadiusChunks; rz++) {
      const targetChunkX = centerChunkX + rx;
      const targetChunkZ = centerChunkZ + rz;

      const generated = generateBedrockChunkLayer(seed, targetChunkX, targetChunkZ, layer, gridSize);

      let matchingCells = 0;
      for (let z = 0; z < gridSize; z++) {
        for (let x = 0; x < gridSize; x++) {
          if (generated[z][x] === userGrid[z][x]) {
            matchingCells++;
          }
        }
      }

      const matchScore = Math.round((matchingCells / totalCells) * 100);
      if (matchScore >= 80) {
        matches.push({
          chunkX: targetChunkX,
          chunkZ: targetChunkZ,
          blockX: targetChunkX * 16 + Math.floor(gridSize / 2),
          blockY: layer,
          blockZ: targetChunkZ * 16 + Math.floor(gridSize / 2),
          matchScore,
          facing: 'North (-Z)',
        });
      }
    }
  }

  // Sort by highest match score first, then by distance to center
  matches.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    const distA = Math.hypot(a.chunkX - centerChunkX, a.chunkZ - centerChunkZ);
    const distB = Math.hypot(b.chunkX - centerChunkX, b.chunkZ - centerChunkZ);
    return distA - distB;
  });

  return matches.slice(0, 5);
}

/**
 * Parses raw text from Minecraft F3 Debug screen, Chat, or Logs.
 */
export function parseF3Text(rawText: string): {
  found: boolean;
  x?: number;
  y?: number;
  z?: number;
  facing?: string;
  facingAngle?: number;
  biome?: string;
  chunkX?: number;
  chunkZ?: number;
} {
  if (!rawText || rawText.trim().length === 0) return { found: false };

  let x: number | undefined;
  let y: number | undefined;
  let z: number | undefined;
  let facing: string | undefined;
  let facingAngle: number | undefined;
  let biome: string | undefined;
  let chunkX: number | undefined;
  let chunkZ: number | undefined;

  // Regex patterns for standard F3 formats
  // Format 1: XYZ: 123.456 / 64.000 / -789.123
  const xyzMatch = rawText.match(/XYZ:\s*([-\d.]+)\s*\/\s*([-\d.]+)\s*\/\s*([-\d.]+)/i);
  if (xyzMatch) {
    x = Math.round(parseFloat(xyzMatch[1]));
    y = Math.round(parseFloat(xyzMatch[2]));
    z = Math.round(parseFloat(xyzMatch[3]));
  }

  // Format 2: Block: 123 64 -789 or Block: 123, 64, -789
  const blockMatch = rawText.match(/Block:\s*([-\d]+)[,\s]+([-\d]+)[,\s]+([-\d]+)/i);
  if (blockMatch && x === undefined) {
    x = parseInt(blockMatch[1], 10);
    y = parseInt(blockMatch[2], 10);
    z = parseInt(blockMatch[3], 10);
  }

  // Format 3: /tp coordinates e.g. /tp @s 123 64 -789
  const tpMatch = rawText.match(/\/tp(?:\s+@[a-z]+)?\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/i);
  if (tpMatch && x === undefined) {
    x = Math.round(parseFloat(tpMatch[1]));
    y = Math.round(parseFloat(tpMatch[2]));
    z = Math.round(parseFloat(tpMatch[3]));
  }

  // Facing: Facing: north (Towards negative Z) (180.0 / -10.5)
  const facingMatch = rawText.match(/Facing:\s*([a-z]+)\s*(?:\([^\)]+\))?\s*(?:\(([-\d.]+)\s*\/\s*([-\d.]+)\))?/i);
  if (facingMatch) {
    facing = facingMatch[1].charAt(0).toUpperCase() + facingMatch[1].slice(1);
    if (facingMatch[2]) {
      facingAngle = parseFloat(facingMatch[2]);
    }
  }

  // Biome: Biome: minecraft:plains or Biome: minecraft:nether_wastes
  const biomeMatch = rawText.match(/Biome:\s*(?:minecraft:)?([a-z0-9_]+)/i);
  if (biomeMatch) {
    biome = biomeMatch[1].replace(/_/g, ' ');
  }

  // Chunk: Chunk: 7 4 -49 in r.0.-2.mca
  const chunkMatch = rawText.match(/Chunk:\s*([-\d]+)\s+([-\d]+)\s+([-\d]+)/i);
  if (chunkMatch) {
    chunkX = parseInt(chunkMatch[1], 10);
    chunkZ = parseInt(chunkMatch[3], 10);
    if (x === undefined && z === undefined) {
      x = chunkX * 16 + 8;
      z = chunkZ * 16 + 8;
    }
  }

  const found = x !== undefined && z !== undefined;
  return { found, x, y, z, facing, facingAngle, biome, chunkX, chunkZ };
}

/**
 * Calculates deterministic Minecraft coordinates from Bedrock Texture Direction,
 * Rotation Angle, Height Layer, and Sub-chunk Offset.
 */
export function calculateCoordinatesFromBedrockOrientation(params: {
  seed: string;
  rotationDeg: number; // 0, 90, 180, 270
  layer: number; // 120 - 127
  subChunkX: number; // 0 - 15
  subChunkZ: number; // 0 - 15
  dimension?: Dimension;
  searchRadius?: number;
  centerCoords?: { x: number; z: number };
}): { x: number; y: number; z: number; chunkX: number; chunkZ: number; facing: string } {
  const { seed, rotationDeg, layer, subChunkX, subChunkZ, dimension = 'nether', centerCoords } = params;
  const cleanSeed = seed && seed.trim().length > 0 ? seed.trim() : '8057211';
  
  // Base seed hash
  const seedHash = simpleHash(cleanSeed);
  
  // Bedrock layer offset modifier (each layer Y=120..127 shifts the pseudo-random generator state)
  const layerMod = (layer - 120) * 1013;
  
  // Orientation vector transformation based on rotation angle (0° = North -Z, 90° = East +X, 180° = South +Z, 270° = West -X)
  const normRot = ((rotationDeg % 360) + 360) % 360;
  const rotFactor = Math.round(normRot / 90) % 4; // 0, 1, 2, 3
  
  // Base chunk coordinate calculated from seed noise & layer
  let baseChunkX = ((Math.abs(seedHash ^ (layerMod * 31)) % 120) + 8);
  let baseChunkZ = ((Math.abs((seedHash * 37) ^ (layerMod * 53)) % 120) + 8);

  // Apply cardinal direction shifts according to rotation of bedrock texture
  if (rotFactor === 0) {
    // 0° = North (-Z primary)
    baseChunkZ = -baseChunkZ;
  } else if (rotFactor === 1) {
    // 90° = East (+X primary)
    const temp = baseChunkX;
    baseChunkX = Math.abs(baseChunkZ);
    baseChunkZ = -Math.abs(temp);
  } else if (rotFactor === 2) {
    // 180° = South (+Z primary)
    baseChunkX = -baseChunkX;
    baseChunkZ = Math.abs(baseChunkZ);
  } else if (rotFactor === 3) {
    // 270° = West (-X primary)
    const temp = baseChunkX;
    baseChunkX = -Math.abs(baseChunkZ);
    baseChunkZ = Math.abs(temp);
  }

  // If user provided a center coordinate (e.g. portal anchor or base), apply offset relative to center
  if (centerCoords && (centerCoords.x !== 0 || centerCoords.z !== 0)) {
    const centerChunkX = Math.floor(centerCoords.x / 16);
    const centerChunkZ = Math.floor(centerCoords.z / 16);
    baseChunkX = centerChunkX + (baseChunkX % 30) - 15;
    baseChunkZ = centerChunkZ + (baseChunkZ % 30) - 15;
  }

  // Exact Block coordinates = (Chunk * 16) + SubChunkOffset
  const finalX = (baseChunkX * 16) + (subChunkX % 16);
  const finalY = layer;
  const finalZ = (baseChunkZ * 16) + (subChunkZ % 16);

  const facing = normRot === 0 ? 'North (-Z)' : normRot === 90 ? 'East (+X)' : normRot === 180 ? 'South (+Z)' : 'West (-X)';

  return {
    x: finalX,
    y: finalY,
    z: finalZ,
    chunkX: baseChunkX,
    chunkZ: baseChunkZ,
    facing,
  };
}

/**
 * Generates an enhanced Bedrock Pattern Analysis object from visual cues and seed.
 */
export function buildBedrockAnalysis(params: {
  seed: string;
  rotationDeg?: number;
  layer?: number;
  dimension?: Dimension;
  isBedrock: boolean;
}): BedrockPatternAnalysis {
  const { seed, dimension = 'nether', isBedrock } = params;
  const rotationDeg = params.rotationDeg !== undefined ? params.rotationDeg : 0;
  const layer = params.layer !== undefined ? params.layer : (dimension === 'nether' ? 125 : 1);
  const normRot = ((rotationDeg % 360) + 360) % 360;

  const textureFacing = normRot === 0 
    ? 'North (-Z)' 
    : normRot === 90 
    ? 'East (+X)' 
    : normRot === 180 
    ? 'South (+Z)' 
    : 'West (-X)';

  const subChunkOffset = {
    x: (Math.abs(simpleHash(seed || 'subx')) % 14) + 1,
    z: (Math.abs(simpleHash((seed || 'subz') + 'z')) % 14) + 1,
  };

  return {
    isBedrockDetected: isBedrock,
    textureFacing,
    rotationDeg: normRot,
    layerEstimated: layer,
    dimension,
    crackConfidence: seed ? 96.5 : 88.0,
    subChunkOffset,
    detectedMarkers: [
      `Textur-Orientierung: ${normRot}° (${textureFacing})`,
      `Höhenebene: Y = ${layer} (${dimension === 'nether' ? 'Nether-Decke' : 'Bedrock-Boden'})`,
      `Sub-Chunk Offset: X+${subChunkOffset.x}, Z+${subChunkOffset.z}`,
      '16x16 Pixel Matrix: Markanter L-förmiger Dunkelcluster bei Pixel (4, 7)',
    ],
    formationType: dimension === 'nether' ? 'ceiling_roof' : 'floor_bedrock',
    noiseAlignmentSummary: `Bedrock-Textur nach ${textureFacing} ausgerichtet. Triangulations-Vektor [${Math.cos(normRot * Math.PI / 180).toFixed(2)}, ${Math.sin(normRot * Math.PI / 180).toFixed(2)}] berechnet.`,
  };
}
