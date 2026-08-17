import { LocatorResult, CoordinateCandidate } from '../types/locator';

/**
 * Generates and downloads a well-structured JSON report file of the detected location and features.
 */
export function exportReportAsJson(
  result: LocatorResult,
  activeCandidate?: CoordinateCandidate | null
): string {
  const exportTimestamp = new Date().toISOString();
  const active = activeCandidate || result.primaryMatch || result.candidates[0] || null;

  const reportData = {
    generator: 'BlockLocator Minecraft Geolocation Engine',
    version: '1.21.x',
    exportTimestamp,
    summary: {
      status: result.status,
      overallConfidencePercent: result.overallConfidence,
      edition: result.edition,
      gameVersion: result.version,
      seed: result.seedUsed ?? (result.seedProvided ? 'Provided' : 'None'),
      referencePointUsed: result.referencePointUsed,
    },
    primaryLocation: active
      ? {
          coordinates: {
            x: active.x,
            y: active.y,
            z: active.z,
          },
          orientation: {
            facing: active.facing,
            facingAngleDegrees: active.facingAngleDeg,
            pitchDegrees: active.pitchDeg,
          },
          biome: {
            name: active.biome,
            subBiome: active.subBiome,
          },
          chunk: active.chunk,
          distanceFromSpawnBlocks: active.distanceFromSpawn,
          elevation: active.elevationDescription,
          confidencePercent: active.confidence,
          matchingLandmarks: active.matchingLandmarks,
          explanation: active.explanation,
        }
      : null,
    allCandidateLocations: result.candidates.map((cand) => ({
      rank: cand.rank,
      coordinates: { x: cand.x, y: cand.y, z: cand.z },
      facing: cand.facing,
      facingAngleDegrees: cand.facingAngleDeg,
      confidencePercent: cand.confidence,
      biome: cand.biome,
      chunk: cand.chunk,
      explanation: cand.explanation,
    })),
    detectedFeatures: result.features.map((f) => ({
      id: f.id,
      name: f.name,
      category: f.category,
      confidencePercent: f.confidence,
    })),
    environmentalAnalysis: {
      timeOfDay: result.timeOfDay,
      sunElevationAngleDeg: result.sunElevationAngle,
      cloudDirection: result.cloudDirection,
      reasoningNotes: result.rawAiReasoning,
    },
    minecraftCommands: active
      ? {
          teleportSelf: `/tp @s ${active.x} ${active.y} ${active.z}`,
          teleportPlayer: `/tp @p ${active.x} ${active.y} ${active.z}`,
          setWorldSpawn: `/setworldspawn ${active.x} ${active.y} ${active.z}`,
          setSpawnpoint: `/spawnpoint @s ${active.x} ${active.y} ${active.z}`,
          bedrockCameraView: `/camera @s set minecraft:free pos ${active.x} ${active.y + 15} ${active.z} rot 45 135`,
          ...result.commands,
        }
      : result.commands,
    technicalNotes: result.notes,
  };

  const jsonString = JSON.stringify(reportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const seedPart = result.seedUsed ? `seed-${result.seedUsed}` : 'no-seed';
  const coordPart = active ? `X${active.x}_Y${active.y}_Z${active.z}` : 'features';
  const fileName = `blocklocator-report-${seedPart}-${coordPart}-${Date.now()}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileName;
}
