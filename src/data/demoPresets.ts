import { DemoPreset } from '../types/locator';
import { calculateChunkInfo, generateMinecraftCommands } from '../utils/minecraftCoords';

// SVG helpers to create aesthetic Minecraft scene mockups for demo screenshots
function createPlainsVillageSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="60%" stop-color="#93c5fd"/>
        <stop offset="100%" stop-color="#dbeafe"/>
      </linearGradient>
      <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#55a832"/>
        <stop offset="100%" stop-color="#3b7a20"/>
      </linearGradient>
      <linearGradient id="mountain" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e2e8f0"/>
        <stop offset="40%" stop-color="#64748b"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
    </defs>
    <!-- Sky & Sun -->
    <rect width="800" height="450" fill="url(#sky)"/>
    <rect x="580" y="40" width="55" height="55" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
    <!-- Minecraft Clouds (Blocky) -->
    <rect x="60" y="70" width="180" height="35" fill="#ffffff" opacity="0.85"/>
    <rect x="180" y="60" width="120" height="45" fill="#ffffff" opacity="0.85"/>
    <rect x="420" y="90" width="220" height="30" fill="#ffffff" opacity="0.85"/>
    <!-- Background Mountains -->
    <polygon points="120,280 240,140 360,280" fill="url(#mountain)"/>
    <polygon points="280,280 440,110 580,280" fill="url(#mountain)"/>
    <polygon points="500,280 620,160 760,280" fill="url(#mountain)"/>
    <!-- Terrain / Plains -->
    <path d="M0,260 Q200,240 400,270 T800,250 L800,450 L0,450 Z" fill="url(#grass)"/>
    <!-- River Water -->
    <path d="M150,450 Q300,340 450,280 L520,285 Q360,350 240,450 Z" fill="#2563eb" opacity="0.85"/>
    <!-- Village Houses (Blocky pixel-styled) -->
    <rect x="480" y="220" width="50" height="40" fill="#78350f"/>
    <polygon points="470,220 505,190 540,220" fill="#451a03"/>
    <rect x="500" y="235" width="12" height="25" fill="#1e293b"/>
    <rect x="485" y="230" width="10" height="10" fill="#fef08a" stroke="#78350f"/>
    <!-- Church Tower -->
    <rect x="550" y="180" width="35" height="80" fill="#64748b"/>
    <polygon points="545,180 567,150 590,180" fill="#334155"/>
    <rect x="560" y="200" width="14" height="20" fill="#fef08a"/>
    <!-- Oak Trees -->
    <rect x="180" y="270" width="16" height="45" fill="#78350f"/>
    <rect x="160" y="225" width="56" height="50" fill="#15803d"/>
    <rect x="170" y="210" width="36" height="20" fill="#16a34a"/>
    
    <rect x="340" y="290" width="14" height="40" fill="#78350f"/>
    <rect x="325" y="250" width="46" height="45" fill="#15803d"/>

    <!-- Minecraft Hotbar / HUD simulation subtle watermark -->
    <rect x="250" y="415" width="300" height="30" fill="rgba(0,0,0,0.5)" rx="4"/>
    <text x="400" y="435" fill="#e2e8f0" font-family="monospace" font-size="11" text-anchor="middle">BEDROCK 1.21 • PLAINS VALLEY</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createCherryMountainSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ec4899"/>
        <stop offset="50%" stop-color="#f43f5e"/>
        <stop offset="100%" stop-color="#fde047"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#sunsetSky)"/>
    <rect x="360" y="180" width="80" height="80" fill="#ffffff" opacity="0.9"/>
    <!-- Jagged Peaks -->
    <polygon points="50,450 250,80 450,450" fill="#475569"/>
    <polygon points="200,160 250,80 300,160" fill="#f8fafc"/>
    <polygon points="350,450 550,110 750,450" fill="#334155"/>
    <polygon points="500,180 550,110 600,180" fill="#f8fafc"/>
    <!-- Cherry Blossom Trees Canopy -->
    <rect x="0" y="320" width="800" height="130" fill="#15803d"/>
    <circle cx="200" cy="310" r="45" fill="#f472b6"/>
    <circle cx="230" cy="300" r="35" fill="#fbcfe8"/>
    <circle cx="340" cy="330" r="50" fill="#f472b6"/>
    <circle cx="620" cy="320" r="55" fill="#f472b6"/>
    <circle cx="660" cy="305" r="40" fill="#fbcfe8"/>
    <text x="400" y="435" fill="#ffffff" font-family="monospace" font-size="11" text-anchor="middle">BEDROCK 1.21 • CHERRY PEAKS</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createJungleTempleSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <rect width="800" height="450" fill="#14532d"/>
    <!-- Lush jungle canopy -->
    <rect x="0" y="0" width="800" height="200" fill="#166534" opacity="0.8"/>
    <!-- Jungle Temple Stone Structure -->
    <rect x="280" y="160" width="240" height="180" fill="#475569"/>
    <rect x="330" y="120" width="140" height="50" fill="#334155"/>
    <rect x="380" y="80" width="40" height="40" fill="#1e293b"/>
    <!-- Vines and moss -->
    <rect x="290" y="180" width="30" height="90" fill="#22c55e" opacity="0.7"/>
    <rect x="470" y="170" width="35" height="120" fill="#22c55e" opacity="0.7"/>
    <!-- River -->
    <path d="M0,380 L800,340 L800,450 L0,450 Z" fill="#0284c7"/>
    <text x="400" y="435" fill="#e2e8f0" font-family="monospace" font-size="11" text-anchor="middle">JUNGLE TEMPLE • OVERWORLD</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createBadlandsMesaSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <rect width="800" height="450" fill="#fde047"/>
    <!-- Sun -->
    <rect x="680" y="30" width="60" height="60" fill="#ffffff"/>
    <!-- Terracotta layers -->
    <rect x="0" y="180" width="800" height="30" fill="#c2410c"/>
    <rect x="0" y="210" width="800" height="25" fill="#ea580c"/>
    <rect x="0" y="235" width="800" height="35" fill="#d97706"/>
    <rect x="0" y="270" width="800" height="30" fill="#b45309"/>
    <rect x="0" y="300" width="800" height="40" fill="#9a3412"/>
    <rect x="0" y="340" width="800" height="110" fill="#7c2d12"/>
    <!-- Cactus -->
    <rect x="150" y="300" width="20" height="70" fill="#15803d"/>
    <rect x="135" y="320" width="15" height="25" fill="#15803d"/>
    <rect x="170" y="330" width="15" height="20" fill="#15803d"/>
    <text x="400" y="435" fill="#fed7aa" font-family="monospace" font-size="11" text-anchor="middle">BEDROCK 1.21 • BADLANDS PLATEAU</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'demo-plains-village',
    title: 'Plains Village & River Crossroads',
    subtitle: 'Classic Bedrock 1.21 Plains biome with church tower and mountain ridge',
    badge: 'Exact Match (97.4%)',
    edition: 'bedrock',
    version: '1.21.x',
    seed: '8057211',
    imageThumbnail: createPlainsVillageSvg(),
    description: 'A screenshot featuring a generated Bedrock village nestled beside an S-bend river and distant jagged mountain peaks.',
    expectedResult: {
      status: 'found',
      primaryMatch: {
        id: 'match-1',
        rank: 1,
        x: 1842,
        y: 72,
        z: -391,
        confidence: 97.4,
        facing: 'South-East',
        facingAngleDeg: 134.2,
        pitchDeg: -4.5,
        biome: 'Plains',
        subBiome: 'River Valley & Meadow Foothills',
        chunk: calculateChunkInfo(1842, -391),
        distanceFromSpawn: 1883,
        elevationDescription: 'Y: 72 (Surface level ~10 blocks above sea level Y=62)',
        matchingLandmarks: ['Plains Village', 'River S-Bend', 'Oak Trees', 'Distant Jagged Peaks', 'Cobblestone Church'],
        explanation: 'Seed 8057211 confirms an authentic Bedrock 1.21 plains village generation at chunk [115, -25]. The river bend topology and mountain contour match the visual horizon within 0.8° tolerance.',
      },
      candidates: [
        {
          id: 'match-1',
          rank: 1,
          x: 1842,
          y: 72,
          z: -391,
          confidence: 97.4,
          facing: 'South-East',
          facingAngleDeg: 134.2,
          pitchDeg: -4.5,
          biome: 'Plains',
          subBiome: 'River Valley & Meadow Foothills',
          chunk: calculateChunkInfo(1842, -391),
          distanceFromSpawn: 1883,
          elevationDescription: 'Y: 72 (Surface level)',
          matchingLandmarks: ['Plains Village', 'River S-Bend', 'Oak Trees', 'Distant Mountain'],
          explanation: 'Exact match corresponding to the seed terrain heightmap and village street generator.',
        },
      ],
      features: [
        { id: 'f1', name: 'Plains biome', category: 'biome', confidence: 99, tagColor: 'emerald' },
        { id: 'f2', name: 'Village (Plains)', category: 'structure', confidence: 98, tagColor: 'amber' },
        { id: 'f3', name: 'Mountain ridge', category: 'geology', confidence: 95, tagColor: 'cyan' },
        { id: 'f4', name: 'River bend', category: 'geology', confidence: 94, tagColor: 'blue' },
        { id: 'f5', name: 'Oak trees', category: 'flora', confidence: 92, tagColor: 'emerald' },
        { id: 'f6', name: 'Sun morning angle (East)', category: 'celestial', confidence: 89, tagColor: 'yellow' },
      ],
      overallConfidence: 97.4,
      seedProvided: true,
      seedUsed: '8057211',
      edition: 'bedrock',
      version: '1.21.x',
      referencePointUsed: false,
      notes: [
        'World seed 8057211 provided high-confidence correlation with Bedrock 1.21 terrain generation algorithm.',
        'Celestial markers indicate player was looking South-East with morning sun at ~45° azimuth.',
        'Y-level 72 calculated from grass surface elevation relative to adjacent sea level (Y=62).',
      ],
      commands: generateMinecraftCommands(1842, 72, -391, 'plains'),
      timeOfDay: 'Morning (~08:30 in-game)',
      sunElevationAngle: 42,
      cloudDirection: 'West (-X drift)',
      rawAiReasoning: 'Triangulation confirmed via seed noise layer analysis. Terrain height matches Bedrock seed 8057211 at (1842, 72, -391).',
      timestamp: Date.now(),
    },
  },
  {
    id: 'demo-cherry-peaks',
    title: 'Jagged Peaks & Cherry Blossom Ridge',
    subtitle: 'Mountain seed analysis with multiple plausible candidate locations',
    badge: '3 Candidates',
    edition: 'bedrock',
    version: '1.21.x',
    seed: '-44910283',
    imageThumbnail: createCherryMountainSvg(),
    description: 'High-altitude screenshot showing snowy jagged peaks framed by pink cherry blossom foliage during sunset.',
    expectedResult: {
      status: 'multiple_candidates',
      primaryMatch: {
        id: 'cand-1',
        rank: 1,
        x: 1842,
        y: 72,
        z: -391,
        confidence: 97.4,
        facing: 'South-East',
        facingAngleDeg: 135,
        pitchDeg: -8,
        biome: 'Cherry Grove',
        subBiome: 'Jagged Peaks Mountain Rim',
        chunk: calculateChunkInfo(1842, -391),
        distanceFromSpawn: 1883,
        elevationDescription: 'Y: 72 (High-altitude outlook)',
        matchingLandmarks: ['Cherry Blossom Canopy', 'Snowy Peak #1', 'Sunset Azimuth'],
        explanation: 'Primary candidate matches mountain ridgeline and peak height of 196 blocks in seed -44910283.',
      },
      candidates: [
        {
          id: 'cand-1',
          rank: 1,
          x: 1842,
          y: 72,
          z: -391,
          confidence: 97.4,
          facing: 'South-East',
          facingAngleDeg: 135,
          pitchDeg: -8,
          biome: 'Cherry Grove',
          subBiome: 'Jagged Peaks Mountain Rim',
          chunk: calculateChunkInfo(1842, -391),
          distanceFromSpawn: 1883,
          elevationDescription: 'Y: 72 (Mountain Rim)',
          matchingLandmarks: ['Cherry Canopy', 'Twin Peaks'],
          explanation: 'Highest correlation with mountain ridgeline profile.',
        },
        {
          id: 'cand-2',
          rank: 2,
          x: 621,
          y: 68,
          z: 1042,
          confidence: 82.1,
          facing: 'North-East',
          facingAngleDeg: 45,
          pitchDeg: -6,
          biome: 'Cherry Grove',
          subBiome: 'Meadow Slopes',
          chunk: calculateChunkInfo(621, 1042),
          distanceFromSpawn: 1213,
          elevationDescription: 'Y: 68 (Mid-slope terrace)',
          matchingLandmarks: ['Cherry Trees', 'Single Peak'],
          explanation: 'Secondary mountain ring with similar cherry tree density.',
        },
        {
          id: 'cand-3',
          rank: 3,
          x: -391,
          y: 71,
          z: 812,
          confidence: 76.8,
          facing: 'South-West',
          facingAngleDeg: 225,
          pitchDeg: -10,
          biome: 'Meadow',
          subBiome: 'Cherry Grove Border',
          chunk: calculateChunkInfo(-391, 812),
          distanceFromSpawn: 901,
          elevationDescription: 'Y: 71 (Lower ridge)',
          matchingLandmarks: ['Snowy Horizon', 'Pink Petals'],
          explanation: 'Alternative viewpoint showing reversed peak silhouette.',
        },
      ],
      features: [
        { id: 'f1', name: 'Cherry Grove biome', category: 'biome', confidence: 99, tagColor: 'pink' },
        { id: 'f2', name: 'Jagged Peaks', category: 'geology', confidence: 96, tagColor: 'cyan' },
        { id: 'f3', name: 'Sunset celestial glow', category: 'celestial', confidence: 92, tagColor: 'orange' },
        { id: 'f4', name: 'High elevation (>120Y)', category: 'elevation', confidence: 94, tagColor: 'purple' },
        { id: 'f5', name: 'Snow block caps', category: 'geology', confidence: 91, tagColor: 'blue' },
      ],
      overallConfidence: 97.4,
      seedProvided: true,
      seedUsed: '-44910283',
      edition: 'bedrock',
      version: '1.21.x',
      referencePointUsed: false,
      notes: [
        'Multiple mountain ranges match the visual peaks in seed -44910283.',
        'Candidate #1 (X: 1842, Y: 72, Z: -391) represents the closest terrain silhouette alignment at 97.4% confidence.',
        'Select any candidate card below to view its specific teleport command and map position.',
      ],
      commands: generateMinecraftCommands(1842, 72, -391, 'cherry_grove'),
      timeOfDay: 'Sunset (~18:15 in-game)',
      sunElevationAngle: 12,
      cloudDirection: 'West (-X drift)',
      rawAiReasoning: 'Multiple candidate peaks identified in seed -44910283. Triangulated 3 candidate coordinates.',
      timestamp: Date.now(),
    },
  },
  {
    id: 'demo-jungle-noseed',
    title: 'Jungle Temple Riverbank (No Seed)',
    subtitle: 'Demonstrates visual AI feature extraction & seed recommendation banner',
    badge: 'Seed Recommended',
    edition: 'bedrock',
    version: '1.21.x',
    seed: '',
    imageThumbnail: createJungleTempleSvg(),
    description: 'Jungle temple screenshot uploaded without world seed, showing how BlockLocator extracts rich visual metadata while honestly advising for a seed.',
    expectedResult: {
      status: 'seed_recommended',
      candidates: [],
      features: [
        { id: 'f1', name: 'Jungle biome', category: 'biome', confidence: 98, tagColor: 'emerald' },
        { id: 'f2', name: 'Jungle Temple structure', category: 'structure', confidence: 97, tagColor: 'amber' },
        { id: 'f3', name: 'Vines & Mossy Cobblestone', category: 'flora', confidence: 95, tagColor: 'emerald' },
        { id: 'f4', name: 'River Basin (Water level Y=62)', category: 'geology', confidence: 92, tagColor: 'blue' },
        { id: 'f5', name: 'Estimated Y-Level: 66-70', category: 'elevation', confidence: 88, tagColor: 'purple' },
        { id: 'f6', name: 'Facing: West (-X)', category: 'celestial', confidence: 86, tagColor: 'cyan' },
      ],
      overallConfidence: 45.0,
      seedProvided: false,
      seedUsed: null,
      edition: 'bedrock',
      version: '1.21.x',
      referencePointUsed: false,
      notes: [
        'A world seed is recommended for accurate coordinate detection.',
        'Visual analysis extracted 6 environmental landmarks, estimated player facing West (-X), and estimated player elevation at Y: 66.',
        'Without a world seed, absolute Minecraft world coordinates cannot be deterministically computed.',
      ],
      commands: {
        tpSelf: '/locate structure minecraft:jungle_pyramid',
        tpPlayer: '/locate structure minecraft:jungle_pyramid',
        setWorldSpawn: '/setworldspawn ~ ~ ~',
        spawnpoint: '/spawnpoint @s ~ ~ ~',
        locateBiome: '/locate biome minecraft:jungle',
      },
      timeOfDay: 'Midday (~12:00 in-game)',
      sunElevationAngle: 88,
      cloudDirection: 'West (-X drift)',
      rawAiReasoning: 'Identified Jungle biome and Jungle Pyramid structure. Seed is absent, so absolute coordinates cannot be guaranteed.',
      timestamp: Date.now(),
    },
  },
  {
    id: 'demo-badlands-reference',
    title: 'Badlands Mesa with Known Reference (0,0)',
    subtitle: 'Demonstrates high precision localized search with seed and reference point',
    badge: 'Localized Precision (99.1%)',
    edition: 'bedrock',
    version: '1.21.x',
    seed: '19482012',
    knownCoords: { x: 0, y: 70, z: 0, landmarkName: 'World Spawn' },
    imageThumbnail: createBadlandsMesaSvg(),
    description: 'Badlands plateau analyzed with known world spawn point (0, 70, 0) bounding the search space to 1,500 blocks.',
    expectedResult: {
      status: 'found',
      primaryMatch: {
        id: 'mesa-1',
        rank: 1,
        x: 640,
        y: 85,
        z: -1280,
        confidence: 99.1,
        facing: 'North-East',
        facingAngleDeg: 42,
        pitchDeg: -2.1,
        biome: 'Badlands',
        subBiome: 'Wooded Badlands Plateau',
        chunk: calculateChunkInfo(640, -1280),
        distanceFromSpawn: 1431,
        elevationDescription: 'Y: 85 (Terracotta plateau summit)',
        matchingLandmarks: ['Terracotta Banding 8 Layers', 'Dead Bush & Cactus', 'High Plateau Clifftop', 'Facing 42° NE'],
        explanation: 'Reference point at spawn (0,0) bounded the search to within 2,000 blocks. Terracotta banding sequence matches chunk [40, -80] with 99.1% statistical certainty.',
      },
      candidates: [
        {
          id: 'mesa-1',
          rank: 1,
          x: 640,
          y: 85,
          z: -1280,
          confidence: 99.1,
          facing: 'North-East',
          facingAngleDeg: 42,
          pitchDeg: -2.1,
          biome: 'Badlands',
          subBiome: 'Wooded Badlands Plateau',
          chunk: calculateChunkInfo(640, -1280),
          distanceFromSpawn: 1431,
          elevationDescription: 'Y: 85 (Plateau)',
          matchingLandmarks: ['Terracotta Banding', 'Cactus Clifftop'],
          explanation: 'Targeted bounded seed search confirms exact location.',
        },
      ],
      features: [
        { id: 'f1', name: 'Badlands biome', category: 'biome', confidence: 99, tagColor: 'amber' },
        { id: 'f2', name: 'Terracotta stratum bands', category: 'geology', confidence: 98, tagColor: 'orange' },
        { id: 'f3', name: 'Plateau elevation (Y: 85)', category: 'elevation', confidence: 96, tagColor: 'purple' },
        { id: 'f4', name: 'Cactus & Dead Bush', category: 'flora', confidence: 93, tagColor: 'emerald' },
        { id: 'f5', name: 'Afternoon sun (~15:30)', category: 'celestial', confidence: 90, tagColor: 'yellow' },
      ],
      overallConfidence: 99.1,
      seedProvided: true,
      seedUsed: '19482012',
      edition: 'bedrock',
      version: '1.21.x',
      referencePointUsed: true,
      notes: [
        'Known reference point (0, 70, 0) dramatically accelerated triangulation to within 1,431 blocks.',
        'Terracotta vertical color stripe arrangement perfectly matched Bedrock seed 19482012 surface block noise at chunk [40, -80].',
      ],
      commands: generateMinecraftCommands(640, 85, -1280, 'badlands'),
      timeOfDay: 'Afternoon (~15:30 in-game)',
      sunElevationAngle: 38,
      cloudDirection: 'West (-X drift)',
      rawAiReasoning: 'Bounded seed search matched Badlands plateau at (640, 85, -1280).',
      timestamp: Date.now(),
    },
  },
];
