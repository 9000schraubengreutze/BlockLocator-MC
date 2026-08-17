export type MinecraftEdition = 'bedrock' | 'java';

export type Dimension = 'overworld' | 'nether' | 'the_end';

export type AnalysisStatus = 
  | 'idle'
  | 'analyzing'
  | 'found'
  | 'multiple_candidates'
  | 'seed_recommended'
  | 'inconclusive';

export interface ChunkInfo {
  x: number;
  z: number;
  blockMinX: number;
  blockMaxX: number;
  blockMinZ: number;
  blockMaxZ: number;
  regionFile: string;
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
