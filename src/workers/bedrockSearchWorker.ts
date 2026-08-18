import {
  ObservedBedrockPattern,
  PatternMatchCandidate,
  MinecraftEdition,
  Dimension,
} from '../types/locator.ts';
import { parseMinecraftSeed } from '../utils/worldgen/seedParser.ts';
import { scorePatternAtLocation } from '../utils/worldgen/chunkPatternMatcher.ts';

export interface WorkerSearchRequest {
  type: 'START_SEARCH';
  pattern: ObservedBedrockPattern;
  seed: string;
  edition: MinecraftEdition;
  version: string;
  dimension: Dimension;
  searchRadiusChunks: number;
  centerChunkX: number;
  centerChunkZ: number;
  scanLayers: number[];
  minConfidenceThreshold: number;
  maxCandidates: number;
}

export type WorkerMessage =
  | {
      type: 'PROGRESS';
      chunksScanned: number;
      totalChunksToScan: number;
      percentage: number;
      candidatesFound: number;
      bestMatchPercentage: number;
      speedChunksPerSec: number;
      elapsedMs: number;
      estimatedTimeRemaining: string;
      currentSearchLayer: number;
    }
  | {
      type: 'COMPLETE';
      candidates: PatternMatchCandidate[];
      totalChunksEvaluated: number;
      durationMs: number;
    }
  | {
      type: 'ERROR';
      message: string;
    };

// Web Worker message listener
self.onmessage = (e: MessageEvent<WorkerSearchRequest>) => {
  if (e.data.type === 'START_SEARCH') {
    const {
      pattern,
      seed,
      edition,
      dimension,
      searchRadiusChunks,
      centerChunkX,
      centerChunkZ,
      scanLayers,
      minConfidenceThreshold,
      maxCandidates,
    } = e.data;

    const startTime = Date.now();
    const parsed = parseMinecraftSeed(seed);
    const radius = searchRadiusChunks || 32;
    const centerX = centerChunkX || 0;
    const centerZ = centerChunkZ || 0;
    const layers = scanLayers && scanLayers.length > 0 ? scanLayers : [pattern.estimatedLayer || 125];
    const threshold = minConfidenceThreshold || 80;
    const maxCand = maxCandidates || 8;

    const totalChunksToScan = (radius * 2 + 1) * (radius * 2 + 1) * layers.length;
    let chunksScanned = 0;
    let candidatesFound: PatternMatchCandidate[] = [];
    let bestMatchPercentage = 0;
    let lastProgressTime = startTime;

    try {
      for (const layer of layers) {
        for (let rx = -radius; rx <= radius; rx++) {
          for (let rz = -radius; rz <= radius; rz++) {
            chunksScanned++;
            const chunkX = centerX + rx;
            const chunkZ = centerZ + rz;

            // Slide sub-chunk offset
            const step = radius > 64 ? 4 : 2;
            for (let subZ = 0; subZ < 16; subZ += step) {
              for (let subX = 0; subX < 16; subX += step) {
                const worldX = chunkX * 16 + subX;
                const worldZ = chunkZ * 16 + subZ;

                const res = scorePatternAtLocation(
                  pattern,
                  parsed.valueBigInt,
                  worldX,
                  layer,
                  worldZ,
                  dimension,
                  edition
                );

                if (res.scorePct > bestMatchPercentage) {
                  bestMatchPercentage = res.scorePct;
                }

                if (res.scorePct >= threshold) {
                  candidatesFound.push({
                    id: `cand-${layer}-${chunkX}-${chunkZ}-${subX}-${subZ}`,
                    rank: 1,
                    chunkX,
                    chunkZ,
                    subChunkX: subX,
                    subChunkZ: subZ,
                    blockX: worldX,
                    blockY: layer,
                    blockZ: worldZ,
                    matchPercentage: res.scorePct,
                    confidenceScore: Math.min(99.8, res.scorePct),
                    matchedBedrock: res.matchedBedrock,
                    matchedEmpty: res.matchedEmpty,
                    mismatches: res.mismatches,
                    overworldX: worldX * 8,
                    overworldY: layer,
                    overworldZ: worldZ * 8,
                    explanation: `Seed ${seed} match confirmed: ${res.matchedBedrock} bedrock blocks verified on layer Y=${layer}.`,
                  });
                }
              }
            }

            const now = Date.now();
            if (now - lastProgressTime > 120 || chunksScanned === totalChunksToScan) {
              const elapsedMs = now - startTime;
              const speed = Math.round((chunksScanned / (elapsedMs / 1000)) || 0);
              const remainingChunks = totalChunksToScan - chunksScanned;
              const etaSec = speed > 0 ? Math.ceil(remainingChunks / speed) : 0;

              self.postMessage({
                type: 'PROGRESS',
                chunksScanned,
                totalChunksToScan,
                percentage: Math.round((chunksScanned / totalChunksToScan) * 100),
                candidatesFound: candidatesFound.length,
                bestMatchPercentage: Math.round(bestMatchPercentage * 10) / 10,
                speedChunksPerSec: speed,
                elapsedMs,
                estimatedTimeRemaining: etaSec > 0 ? `${etaSec}s` : '< 1s',
                currentSearchLayer: layer,
              } as WorkerMessage);

              lastProgressTime = now;
            }
          }
        }
      }

      // Sort and deduplicate top candidates
      candidatesFound.sort((a, b) => {
        if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
        const distA = Math.hypot(a.chunkX - centerX, a.chunkZ - centerZ);
        const distB = Math.hypot(b.chunkX - centerX, b.chunkZ - centerZ);
        return distA - distB;
      });

      const unique: PatternMatchCandidate[] = [];
      for (const c of candidatesFound) {
        const isDupe = unique.some(
          (u) =>
            Math.abs(u.blockX - c.blockX) <= 3 &&
            Math.abs(u.blockZ - c.blockZ) <= 3 &&
            u.blockY === c.blockY
        );
        if (!isDupe) {
          c.rank = unique.length + 1;
          unique.push(c);
          if (unique.length >= maxCand) break;
        }
      }

      self.postMessage({
        type: 'COMPLETE',
        candidates: unique,
        totalChunksEvaluated: chunksScanned,
        durationMs: Date.now() - startTime,
      } as WorkerMessage);
    } catch (err: any) {
      self.postMessage({
        type: 'ERROR',
        message: err?.message || 'Search worker error',
      } as WorkerMessage);
    }
  }
};
