import { CalcInputError } from '../engine';
import { ceilCount } from './volume';

export interface FenceInput {
  /** Total length of the fence line including gate openings, in metres. */
  lengthM: number;
  /** Maximum distance between post centers, in metres. */
  spacingM: number;
  /** True when the fence encloses an area (the line returns to its start). */
  closed: boolean;
  gates: number;
  gateWidthM: number;
  /** Rails, boards or strands per section. */
  rails: number;
}

export interface FenceMaterials {
  /** Fence line excluding gate openings, in metres. */
  fencedLengthM: number;
  sections: number;
  posts: number;
  /** Total rail / board / wire length, in metres. */
  railLengthM: number;
  /** Rail pieces, one per section per rail. */
  railPieces: number;
}

/**
 * Posts and rails for a fence line.
 *
 * sections = ⌈fenced length ÷ post spacing⌉
 * posts    = sections + 1 for an open line, or sections for a closed loop.
 * Each gate opening splits the line, adding one post.
 */
export function fenceMaterials(input: FenceInput): FenceMaterials {
  const gateTotal = input.gates * input.gateWidthM;
  const fencedLengthM = input.lengthM - gateTotal;
  if (fencedLengthM <= 0) {
    throw new CalcInputError(
      'The gates are as wide as the whole fence. Reduce the number or width of gates.',
      'gates',
    );
  }
  const sections = ceilCount(fencedLengthM / input.spacingM);
  const extraPosts = input.closed ? input.gates : input.gates + 1;
  const posts = sections + extraPosts;
  return {
    fencedLengthM,
    sections,
    posts,
    railLengthM: fencedLengthM * input.rails,
    railPieces: sections * input.rails,
  };
}
