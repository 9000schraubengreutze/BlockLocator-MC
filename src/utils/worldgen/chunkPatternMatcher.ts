import {
  ObservedBedrockPattern,
  PatternMatchCandidate,
  MinecraftEdition,
  Dimension,
} from '../../types/locator.ts';
import { parseMinecraftSeed } from './seedParser.ts';
import { isBedrockAt } from './bedrockGenerator.ts';

export interface SearchOptions {
  seed: string;
  edition: MinecraftEdition;
  version: string;
  dimension?: Dimension;
  searchRadiusChunks?: number; // e.g. 16 chunks = 256 blocks radius, 64 chunks = 1024 blocks
  centerChunkX?: number;
  centerChunkZ?: number;
  scanLayers?: number[]; // default [127, 126, 125, 124] for Nether roof
  minConfidenceThreshold?: number; // default 80%
  maxCandidates?: number;
}

/**
 * Evaluates match score between an ObservedBedrockPattern and a specific world origin (blockStartX, layer, blockStartZ).
 */
export function scorePatternAtLocation(
  pattern: ObservedBedrockPattern,
  seedBigInt: bigint,
  blockStartX: number,
  layer: number,
  blockStartZ: number,
  dimension: Dimension = 'nether',
  edition: MinecraftEdition = 'bedrock'
): {
  scorePct: number;
  matchedBedrock: number;
  matchedEmpty: number;
  mismatches: number;
  totalEvaluated: number;
} {
  let matchedBedrock = 0;
  let matchedEmpty = 0;
  let mismatches = 0;
  let totalEvaluated = 0;

  const weights = pattern.weights;

  let totalWeightedPossible = 0;
  let totalWeightedEarned = 0;

  for (let r = 0; r < pattern.height; r++) {
    for (let c = 0; c < pattern.width; c++) {
      const state = pattern.grid[r][c];
      if (state === 'unknown') {
        // Unknown cells don't penalize or contribute
        continue;
      }

      totalEvaluated++;
      const cellWeight = weights && weights[r] && weights[r][c] !== undefined ? weights[r][c] : 1.0;
      const isWorldBedrock = isBedrockAt(
        seedBigInt,
        blockStartX + c,
        layer,
        blockStartZ + r,
        dimension,
        edition
      );

      if (state === 'bedrock') {
        totalWeightedPossible += 1.0 * cellWeight;
        if (isWorldBedrock) {
          matchedBedrock++;
          totalWeightedEarned += 1.0 * cellWeight;
        } else {
          mismatches++;
        }
      } else if (state === 'empty') {
        totalWeightedPossible += 0.8 * cellWeight;
        if (!isWorldBedrock) {
          matchedEmpty++;
          totalWeightedEarned += 0.8 * cellWeight;
        } else {
          mismatches++;
        }
      }
    }
  }

  if (totalWeightedPossible === 0) {
    return { scorePct: 0, matchedBedrock: 0, matchedEmpty: 0, mismatches: 0, totalEvaluated: 0 };
  }

  const scorePct = Math.max(0, Math.min(100, (totalWeightedEarned / totalWeightedPossible) * 100));

  return {
    scorePct: Math.round(scorePct * 10) / 10,
    matchedBedrock,
    matchedEmpty,
    mismatches,
    totalEvaluated,
  };
}

/**
 * Searches chunks deterministically for matches to the observed pattern.
 */
export function searchBedrockChunks(
  pattern: ObservedBedrockPattern,
  options: SearchOptions,
  onProgress?: (progress: {
    chunksScanned: number;
    totalChunks: number;
    candidatesFound: number;
    bestScore: number;
  }) => void
): PatternMatchCandidate[] {
  const parsed = parseMinecraftSeed(options.seed);
  const radius = options.searchRadiusChunks || 32;
  const centerX = options.centerChunkX || 0;
  const centerZ = options.centerChunkZ || 0;
  const layers = options.scanLayers || [pattern.estimatedLayer || 125];
  const minThreshold = options.minConfidenceThreshold || 82;
  const maxCandidates = options.maxCandidates || 6;
  const dimension = options.dimension || 'nether';
  const edition = options.edition || 'bedrock';

  const candidates: PatternMatchCandidate[] = [];
  let bestScore = 0;
  let scannedCount = 0;

  const totalChunks = (radius * 2 + 1) * (radius * 2 + 1) * layers.length;

  for (const layer of layers) {
    for (let rx = -radius; rx <= radius; rx++) {
      for (let rz = -radius; rz <= radius; rz++) {
        scannedCount++;
        const currentChunkX = centerX + rx;
        const currentChunkZ = centerZ + rz;

        // Slide the pattern inside this chunk (sample steps of 1-2 blocks to keep performance ultra high)
        // Sub-chunk offsets: check (0, 4, 8, 12) or all 0..15
        const step = radius > 48 ? 3 : 2;
        for (let subZ = 0; subZ < 16; subZ += step) {
          for (let subX = 0; subX < 16; subX += step) {
            const worldX = currentChunkX * 16 + subX;
            const worldZ = currentChunkZ * 16 + subZ;

            const res = scorePatternAtLocation(
              pattern,
              parsed.valueBigInt,
              worldX,
              layer,
              worldZ,
              dimension,
              edition
            );

            if (res.scorePct > bestScore) {
              bestScore = res.scorePct;
            }

            if (res.scorePct >= minThreshold) {
              const overworldX = worldX * 8;
              const overworldZ = worldZ * 8;

              candidates.push({
                id: `cand-${layer}-${currentChunkX}-${currentChunkZ}-${subX}-${subZ}`,
                rank: 1,
                chunkX: currentChunkX,
                chunkZ: currentChunkZ,
                subChunkX: subX,
                subChunkZ: subZ,
                blockX: worldX,
                blockY: layer,
                blockZ: worldZ,
                matchPercentage: res.scorePct,
                confidenceScore: Math.min(99.5, res.scorePct),
                matchedBedrock: res.matchedBedrock,
                matchedEmpty: res.matchedEmpty,
                mismatches: res.mismatches,
                overworldX,
                overworldY: layer,
                overworldZ,
                explanation: `Seed ${options.seed} generated ${res.matchedBedrock} matching bedrock blocks and ${res.matchedEmpty} empty blocks at Chunk [${currentChunkX}, ${currentChunkZ}] on layer Y: ${layer}.`,
              });
            }
          }
        }

        if (scannedCount % 400 === 0 && onProgress) {
          onProgress({
            chunksScanned: scannedCount,
            totalChunks,
            candidatesFound: candidates.length,
            bestScore,
          });
        }
      }
    }
  }

  // Sort candidates by match percentage descending, then by proximity to center
  candidates.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    const distA = Math.hypot(a.chunkX - centerX, a.chunkZ - centerZ);
    const distB = Math.hypot(b.chunkX - centerX, b.chunkZ - centerZ);
    return distA - distB;
  });

  // Assign ranks
  const uniqueCandidates: PatternMatchCandidate[] = [];
  for (const c of candidates) {
    // Deduplicate candidates that are within 3 blocks of an existing candidate
    const isDuplicate = uniqueCandidates.some(
      (u) =>
        Math.abs(u.blockX - c.blockX) <= 3 &&
        Math.abs(u.blockZ - c.blockZ) <= 3 &&
        u.blockY === c.blockY
    );
    if (!isDuplicate) {
      c.rank = uniqueCandidates.length + 1;
      uniqueCandidates.push(c);
      if (uniqueCandidates.length >= maxCandidates) break;
    }
  }

  return uniqueCandidates;
}
