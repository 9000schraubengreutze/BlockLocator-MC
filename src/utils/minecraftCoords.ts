import type { ChunkInfo, MinecraftCommands } from '../types/locator.ts';

export function calculateChunkInfo(x: number, z: number): ChunkInfo {
  const chunkX = Math.floor(x / 16);
  const chunkZ = Math.floor(z / 16);
  const regionX = Math.floor(chunkX / 32);
  const regionZ = Math.floor(chunkZ / 32);

  return {
    x: chunkX,
    z: chunkZ,
    blockMinX: chunkX * 16,
    blockMaxX: chunkX * 16 + 15,
    blockMinZ: chunkZ * 16,
    blockMaxZ: chunkZ * 16 + 15,
    regionFile: `r.${regionX}.${regionZ}.mca`,
  };
}

export function calculateDistanceFromSpawn(x: number, z: number): number {
  return Math.round(Math.hypot(x, z));
}

export function generateMinecraftCommands(x: number, y: number, z: number, biome?: string): MinecraftCommands {
  const safeBiome = biome ? biome.toLowerCase().replace(/\s+/g, '_') : 'plains';
  return {
    tpSelf: `/tp @s ${x} ${y} ${z}`,
    tpPlayer: `/tp @p ${x} ${y} ${z}`,
    setWorldSpawn: `/setworldspawn ${x} ${y} ${z}`,
    spawnpoint: `/spawnpoint @s ${x} ${y} ${z}`,
    locateBiome: `/locate biome minecraft:${safeBiome}`,
  };
}

export function degreesToCardinal(deg: number): string {
  // Minecraft yaw: 0 = South (+Z), 90 = West (-X), 180 = North (-Z), 270 = East (+X)
  // Normalized 0-360
  const normalized = ((deg % 360) + 360) % 360;
  
  if (normalized >= 337.5 || normalized < 22.5) return 'South (+Z)';
  if (normalized >= 22.5 && normalized < 67.5) return 'South-West';
  if (normalized >= 67.5 && normalized < 112.5) return 'West (-X)';
  if (normalized >= 112.5 && normalized < 157.5) return 'North-West';
  if (normalized >= 157.5 && normalized < 202.5) return 'North (-Z)';
  if (normalized >= 202.5 && normalized < 247.5) return 'North-East';
  if (normalized >= 247.5 && normalized < 292.5) return 'East (+X)';
  return 'South-East';
}

export function formatCoordinate(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}
