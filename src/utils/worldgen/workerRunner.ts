import {
  ObservedBedrockPattern,
  PatternMatchCandidate,
  MinecraftEdition,
  Dimension,
  BedrockScanProgress,
} from '../../types/locator.ts';
import { searchBedrockChunks } from './chunkPatternMatcher.ts';
import { WorkerSearchRequest, WorkerMessage } from '../../workers/bedrockSearchWorker.ts';

export interface BedrockSearchPayload {
  pattern: ObservedBedrockPattern;
  seed: string;
  edition: MinecraftEdition;
  version: string;
  dimension: Dimension;
  searchRadiusChunks: number;
  centerChunkX?: number;
  centerChunkZ?: number;
  scanLayers?: number[];
  minConfidenceThreshold?: number;
  maxCandidates?: number;
}

export class BedrockSearchService {
  private worker: Worker | null = null;

  public async runSearch(
    payload: BedrockSearchPayload,
    onProgress: (progress: BedrockScanProgress) => void
  ): Promise<{ candidates: PatternMatchCandidate[]; totalChunks: number; durationMs: number }> {
    // Attempt to instantiate Web Worker
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        return await this.runInWebWorker(payload, onProgress);
      } catch (workerErr) {
        console.warn('Web Worker startup failed or blocked, falling back to main-thread search:', workerErr);
      }
    }

    // Main thread fallback
    return this.runInMainThread(payload, onProgress);
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  private runInWebWorker(
    payload: BedrockSearchPayload,
    onProgress: (progress: BedrockScanProgress) => void
  ): Promise<{ candidates: PatternMatchCandidate[]; totalChunks: number; durationMs: number }> {
    return new Promise((resolve, reject) => {
      this.terminate();

      try {
        this.worker = new Worker(
          new URL('../../workers/bedrockSearchWorker.ts', import.meta.url),
          { type: 'module' }
        );

        this.worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
          const msg = e.data;
          if (msg.type === 'PROGRESS') {
            onProgress({
              chunksScanned: msg.chunksScanned,
              totalChunksToScan: msg.totalChunksToScan,
              percentage: msg.percentage,
              candidatesFound: msg.candidatesFound,
              bestMatchPercentage: msg.bestMatchPercentage,
              speedChunksPerSec: msg.speedChunksPerSec,
              elapsedMs: msg.elapsedMs,
              estimatedTimeRemaining: msg.estimatedTimeRemaining,
              currentSearchLayer: msg.currentSearchLayer,
              isScanning: true,
            });
          } else if (msg.type === 'COMPLETE') {
            this.terminate();
            resolve({
              candidates: msg.candidates,
              totalChunks: msg.totalChunksEvaluated,
              durationMs: msg.durationMs,
            });
          } else if (msg.type === 'ERROR') {
            this.terminate();
            reject(new Error(msg.message));
          }
        };

        this.worker.onerror = (err) => {
          this.terminate();
          reject(err);
        };

        const request: WorkerSearchRequest = {
          type: 'START_SEARCH',
          pattern: payload.pattern,
          seed: payload.seed,
          edition: payload.edition,
          version: payload.version,
          dimension: payload.dimension,
          searchRadiusChunks: payload.searchRadiusChunks,
          centerChunkX: payload.centerChunkX || 0,
          centerChunkZ: payload.centerChunkZ || 0,
          scanLayers: payload.scanLayers || [payload.pattern.estimatedLayer || 125],
          minConfidenceThreshold: payload.minConfidenceThreshold || 80,
          maxCandidates: payload.maxCandidates || 8,
        };

        this.worker.postMessage(request);
      } catch (err) {
        reject(err);
      }
    });
  }

  private async runInMainThread(
    payload: BedrockSearchPayload,
    onProgress: (progress: BedrockScanProgress) => void
  ): Promise<{ candidates: PatternMatchCandidate[]; totalChunks: number; durationMs: number }> {
    const startTime = Date.now();
    const radius = payload.searchRadiusChunks;
    const layers = payload.scanLayers || [payload.pattern.estimatedLayer || 125];
    const totalChunks = (radius * 2 + 1) * (radius * 2 + 1) * layers.length;

    const candidates = searchBedrockChunks(
      payload.pattern,
      {
        seed: payload.seed,
        edition: payload.edition,
        version: payload.version,
        dimension: payload.dimension,
        searchRadiusChunks: radius,
        centerChunkX: payload.centerChunkX || 0,
        centerChunkZ: payload.centerChunkZ || 0,
        scanLayers: layers,
        minConfidenceThreshold: payload.minConfidenceThreshold || 80,
        maxCandidates: payload.maxCandidates || 8,
      },
      (p) => {
        const elapsed = Date.now() - startTime;
        const speed = Math.round((p.chunksScanned / (elapsed / 1000)) || 0);
        const remaining = totalChunks - p.chunksScanned;
        const eta = speed > 0 ? `${Math.ceil(remaining / speed)}s` : '< 1s';

        onProgress({
          chunksScanned: p.chunksScanned,
          totalChunksToScan: totalChunks,
          percentage: Math.round((p.chunksScanned / totalChunks) * 100),
          candidatesFound: p.candidatesFound,
          bestMatchPercentage: Math.round(p.bestScore * 10) / 10,
          speedChunksPerSec: speed,
          elapsedMs: elapsed,
          estimatedTimeRemaining: eta,
          currentSearchLayer: payload.pattern.estimatedLayer || 125,
          isScanning: true,
        });
      }
    );

    return {
      candidates,
      totalChunks,
      durationMs: Date.now() - startTime,
    };
  }
}
