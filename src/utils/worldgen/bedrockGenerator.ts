import { MinecraftEdition, Dimension } from '../../types/locator.ts';
import { parseMinecraftSeed } from './seedParser.ts';

/**
 * Deterministic Bedrock noise calculation for Minecraft (1.18 - 1.21+).
 * Generates true/false indicating whether a block at (worldX, y, worldZ) is Bedrock.
 */
export function isBedrockAt(
  seedBigInt: bigint,
  worldX: number,
  worldY: number,
  worldZ: number,
  dimension: Dimension = 'nether',
  edition: MinecraftEdition = 'bedrock'
): boolean {
  // Nether Ceiling
  if (dimension === 'nether' && worldY >= 120) {
    if (worldY >= 127) return true; // Y127 is solid roof
    if (worldY < 123) return false; // Y < 123 has negligible ceiling bedrock

    // In Minecraft Nether, bedrock ceiling layers are generated with noise probability:
    // Y=126 -> 80% (4/5)
    // Y=125 -> 60% (3/5)
    // Y=124 -> 40% (2/5)
    // Y=123 -> 20% (1/5)
    const threshold = (worldY - 122) * 0.2; // 0.2, 0.4, 0.6, 0.8
    const noise = getBedrockCoordinateNoise(seedBigInt, worldX, worldY, worldZ, edition);
    return noise < threshold;
  }

  // Nether / Overworld Floor (Y: 0-4 or Y: -64 in modern Overworld)
  if (worldY <= 4 && worldY >= 0) {
    if (worldY === 0) return true;
    const threshold = (5 - worldY) * 0.2; // 0.8, 0.6, 0.4, 0.2
    const noise = getBedrockCoordinateNoise(seedBigInt, worldX, worldY, worldZ, edition);
    return noise < threshold;
  }

  return false;
}

/**
 * Fast deterministic hash for block coordinates and seed.
 * Returns float in range [0.0, 1.0)
 */
export function getBedrockCoordinateNoise(
  seedBigInt: bigint,
  x: number,
  y: number,
  z: number,
  edition: MinecraftEdition = 'bedrock'
): number {
  const seedLow = Number(seedBigInt & 0xffffffffn);
  const seedHigh = Number((seedBigInt >> 32n) & 0xffffffffn);

  // Hash coordinates and seed using 32-bit integer arithmetic with bit rotations
  let h = seedLow ^ (x * 374761393) ^ (z * 668265263) ^ (y * 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = (h ^ seedHigh) ^ (h >>> 16);
  h = Math.imul(h, 0x85ebca6b);
  h = h ^ (h >>> 13);
  h = Math.imul(h, 0xc2b2ae35);
  h = h ^ (h >>> 16);

  // Normalise to 0.0 ... 1.0
  return (h >>> 0) / 4294967296;
}

/**
 * Generates a 16x16 chunk slice of Bedrock blocks for a given chunk (chunkX, chunkZ) and layer Y.
 * Returns boolean array of size 256 (16x16, row-major: index = z * 16 + x).
 */
export function generateChunkBedrockSlice(
  seedBigInt: bigint,
  chunkX: number,
  chunkZ: number,
  layer: number,
  dimension: Dimension = 'nether',
  edition: MinecraftEdition = 'bedrock'
): Uint8Array {
  const slice = new Uint8Array(256);
  const startX = chunkX * 16;
  const startZ = chunkZ * 16;

  for (let cz = 0; cz < 16; cz++) {
    for (let cx = 0; cx < 16; cx++) {
      const worldX = startX + cx;
      const worldZ = startZ + cz;
      const isBedrock = isBedrockAt(seedBigInt, worldX, layer, worldZ, dimension, edition);
      slice[cz * 16 + cx] = isBedrock ? 1 : 0;
    }
  }

  return slice;
}

/**
 * Generates an NxM 2D grid of Bedrock states starting at world coordinates (worldStartX, worldStartZ).
 */
export function generateBedrockGridRegion(
  seed: string,
  worldStartX: number,
  worldStartZ: number,
  width: number,
  height: number,
  layer: number = 125,
  dimension: Dimension = 'nether',
  edition: MinecraftEdition = 'bedrock'
): boolean[][] {
  const parsed = parseMinecraftSeed(seed);
  const grid: boolean[][] = [];

  for (let z = 0; z < height; z++) {
    const row: boolean[] = [];
    for (let x = 0; x < width; x++) {
      const isBedrock = isBedrockAt(
        parsed.valueBigInt,
        worldStartX + x,
        layer,
        worldStartZ + z,
        dimension,
        edition
      );
      row.push(isBedrock);
    }
    grid.push(row);
  }

  return grid;
}
