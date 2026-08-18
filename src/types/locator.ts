export type MinecraftEdition = 'bedrock' | 'java';

export type Dimension = 'overworld' | 'nether' | 'the_end';

export type AnalysisMode = 'overworld' | 'nether' | 'nether_roof_pattern' | 'the_end';

export type BedrockBlockState = 'bedrock' | 'empty' | 'unknown';

export type TexturePackOption = 'default' | 'custom' | 'unknown';

export type AnalysisStatus = 
  | 'idle'
  | 'analyzing'
  | 'found'
  | 'multiple_candidates'
  | 'seed_recommended'
  | 'inconclusive'
  | 'no_reliable_location';

export interface ChunkInfo {
  x: number;
  z: number;
  blockMinX: number;
  blockMaxX: number;
  blockMinZ: number;
  blockMaxZ: number;
  regionFile: string;
}

export interface ObservedBedrockPattern {
  width: number;
  height: number;
  grid: BedrockBlockState[][]; // 2D array [row][col]
  weights?: number[][]; // 0.0 - 1.0 confidence per cell
  totalBedrock: number;
  totalEmpty: number;
  totalUnknown: number;
  estimatedLayer: number; // e.g. 127, 126, 125, 124, 123
  texturePack: TexturePackOption;
  perspectiveAngleDeg?: number;
  sourceConfidence: number;
  perspectiveRectified: boolean;
}

export interface PatternMatchCandidate {
  id: string;
  rank: number;
  chunkX: number;
  chunkZ: number;
  subChunkX: number;
  subChunkZ: number;
  blockX: number;
  blockY: number;
  blockZ: number;
  matchPercentage: number; // e.g. 98.7
  confidenceScore: number; // 0 - 100
  matchedBedrock: number;
  matchedEmpty: number;
  mismatches: number;
  overworldX: number;
  overworldY: number;
  overworldZ: number;
  facing?: string;
  explanation: string;
}

export interface BedrockScanProgress {
  chunksScanned: number;
  totalChunksToScan: number;
  percentage: number;
  candidatesFound: number;
  bestMatchPercentage: number;
  speedChunksPerSec: number;
  elapsedMs: number;
  estimatedTimeRemaining: string;
  currentSearchLayer: number;
  isScanning: boolean;
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  status: 'waiting' | 'running' | 'completed' | 'failed';
  detail?: string;
  progressPercent?: number;
}

export interface NetherRoofAnalysisResult {
  status: 'found' | 'multiple_candidates' | 'no_reliable_location';
  isDemo: boolean;
  primaryMatch?: PatternMatchCandidate;
  candidates: PatternMatchCandidate[];
  observedPattern: ObservedBedrockPattern;
  seedUsed: string;
  edition: MinecraftEdition;
  version: string;
  layer: number;
  searchRadiusChunks: number;
  totalChunksEvaluated: number;
  searchDurationMs: number;
  commands: MinecraftCommands;
  notes: string[];
  timestamp: number;
}

export interface BedrockPatternAnalysis {
  isBedrockDetected: boolean;
  textureFacing: 'North (-Z)' | 'East (+X)' | 'South (+Z)' | 'West (-X)' | 'Up (Ceiling)' | 'Down (Floor)';
  rotationDeg: number; // 0, 90, 180, 270
  layerEstimated: number; // 120 - 127 for Nether Ceiling, 0 - 4 for floor
  dimension: Dimension;
  crackConfidence: number;
  subChunkOffset: { x: number; z: number };
  detectedMarkers: string[];
  formationType: 'ceiling_roof' | 'floor_bedrock' | 'isolated_block';
  noiseAlignmentSummary: string;
}

export interface CoordinateCandidate {
  id: string;
  rank: number;
  x: number;
  y: number;
  z: number;
  confidence: number; // 0 - 100
  facing: string;
  facingAngleDeg: number; // 0 - 360 (0 = South in Minecraft, 90 = West, 180 = North, 270 = East)
  pitchDeg: number;
  biome: string;
  subBiome?: string;
  chunk: ChunkInfo;
  distanceFromSpawn: number;
  elevationDescription: string;
  matchingLandmarks: string[];
  explanation: string;
  bedrockDetails?: {
    rotationDeg: number;
    textureFacing: string;
    layer: number;
    subChunkOffset: { x: number; z: number };
    patternHash: string;
  };
}

export interface AnalysisFeature {
  id: string;
  name: string;
  category: 'biome' | 'structure' | 'geology' | 'flora' | 'celestial' | 'elevation';
  confidence: number;
  tagColor?: string;
  description?: string;
}

export interface KnownCoords {
  x?: number | '';
  y?: number | '';
  z?: number | '';
  radius?: number;
  landmarkName?: string;
}

export interface LocatorFormState {
  screenshot: string | null;
  screenshotFileName?: string;
  screenshotFileSize?: number;
  seed: string;
  edition: MinecraftEdition;
  version: string;
  knownCoords: KnownCoords;
  dimension: Dimension;
}

export interface MinecraftCommands {
  tpSelf: string;
  tpPlayer: string;
  setWorldSpawn: string;
  spawnpoint: string;
  locateBiome?: string;
}

export interface LocatorResult {
  status: 'found' | 'multiple_candidates' | 'seed_recommended' | 'inconclusive';
  primaryMatch?: CoordinateCandidate;
  candidates: CoordinateCandidate[];
  features: AnalysisFeature[];
  overallConfidence: number;
  seedProvided: boolean;
  seedUsed: string | null;
  edition: MinecraftEdition;
  version: string;
  referencePointUsed: boolean;
  notes: string[];
  commands: MinecraftCommands;
  bedrockAnalysis?: BedrockPatternAnalysis;
  timeOfDay?: string;
  sunElevationAngle?: number;
  cloudDirection?: string;
  rawAiReasoning?: string;
  timestamp: number;
}

export interface DemoPreset {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  edition: MinecraftEdition;
  version: string;
  seed: string;
  knownCoords?: KnownCoords;
  imageThumbnail: string;
  description: string;
  expectedResult: LocatorResult;
}
