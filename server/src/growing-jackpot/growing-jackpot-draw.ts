import { createHash, randomBytes } from 'node:crypto';
import {
  computeParticipantCoefficient,
  type ChatRollRoleSettings,
  type WeightCombineMode,
} from '../chat-roll/chat-roll-utils.js';

export type GrowingJackpotDrawParticipant = {
  id: number;
  roleIds: string[];
};

function createSeededRandom(seed: string): () => number {
  let state = createHash('sha256').update(seed).digest();
  let offset = 0;

  return () => {
    if (offset + 4 > state.length) {
      state = createHash('sha256').update(state).digest();
      offset = 0;
    }
    const value = state.readUInt32BE(offset);
    offset += 4;
    return value / 0x1_0000_0000;
  };
}

export function pickGrowingJackpotWinner(
  participants: GrowingJackpotDrawParticipant[],
  roleSettings: ChatRollRoleSettings,
  combineMode: WeightCombineMode,
  rngSeed?: string,
): { winner: GrowingJackpotDrawParticipant; seed: string } | null {
  if (participants.length === 0) {
    return null;
  }

  const seed = rngSeed ?? randomBytes(16).toString('hex');
  const random = createSeededRandom(seed);

  const weighted = participants
    .map((participant) => ({
      participant,
      weight: computeParticipantCoefficient(
        participant.roleIds,
        roleSettings,
        combineMode,
      ),
    }))
    .filter((entry) => entry.weight > 0);

  if (weighted.length === 0) {
    return null;
  }

  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = random() * totalWeight;

  for (const entry of weighted) {
    if (roll < entry.weight) {
      return { winner: entry.participant, seed };
    }
    roll -= entry.weight;
  }

  return {
    winner: weighted[weighted.length - 1]!.participant,
    seed,
  };
}
