/**
 * Minecraft World Seed Parser & Hash Utility
 * Handles 64-bit signed integers, text strings (Java & Bedrock algorithms).
 */

export interface ParsedSeed {
  raw: string;
  isNumeric: boolean;
  valueBigInt: bigint;
  seedHigh: number;
  seedLow: number;
  displayText: string;
}

export function parseMinecraftSeed(input: string): ParsedSeed {
  const clean = (input || '').trim();
  if (!clean) {
    // Default fallback seed
    const def = BigInt('805721102914');
    return {
      raw: '',
      isNumeric: false,
      valueBigInt: def,
      seedHigh: Number((def >> 32n) & 0xffffffffn),
      seedLow: Number(def & 0xffffffffn),
      displayText: '805721102914 (Default)',
    };
  }

  // Check if pure integer (positive or negative)
  if (/^-?\d+$/.test(clean)) {
    try {
      const val = BigInt(clean);
      return {
        raw: clean,
        isNumeric: true,
        valueBigInt: val,
        seedHigh: Number((val >> 32n) & 0xffffffffn),
        seedLow: Number(val & 0xffffffffn),
        displayText: clean,
      };
    } catch {
      // fallback to string hashing
    }
  }

  // Java String.hashCode() algorithm for alphanumeric seed strings
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash * 31 + char) | 0;
  }
  const bigHash = BigInt(hash);
  return {
    raw: clean,
    isNumeric: false,
    valueBigInt: bigHash,
    seedHigh: 0,
    seedLow: hash,
    displayText: `${clean} [Hash: ${hash}]`,
  };
}

/**
 * 64-bit Java Linear Congruential Generator (LCG) simulation
 * used in Minecraft terrain & bedrock layer generation.
 */
export class JavaLCG {
  private state: bigint;

  constructor(seed: bigint | number) {
    const s = typeof seed === 'number' ? BigInt(seed) : seed;
    this.state = (s ^ 0x5deece66dn) & ((1n << 48n) - 1n);
  }

  public next(bits: number): number {
    this.state = (this.state * 0x5deece66dn + 0xbn) & ((1n << 48n) - 1n);
    return Number(this.state >> BigInt(48 - bits));
  }

  public nextFloat(): number {
    return this.next(24) / (1 << 24);
  }

  public nextInt(bound?: number): number {
    if (!bound || bound <= 0) return this.next(31);
    return Math.floor(this.nextFloat() * bound);
  }
}
