/**
 * Multi-active battle helpers (Doubles / Triples).
 *
 * The leftovers-again framework was written for Singles, where a side only ever
 * has one active Pokemon. In Doubles (2) and Triples (3) the server sends a
 * `request` whose `active` array has one entry per active slot, and it expects a
 * `/choose` command containing one sub-choice per slot (joined by commas), each
 * single-target move carrying an explicit target.
 *
 * This module builds those per-slot sub-choices. It is intentionally free of any
 * framework / network dependencies so it can be unit-tested in isolation.
 *
 * Target-location reference (matches pokemon-showdown sim/battle.ts validTargetLoc):
 *   - Foe slots are POSITIVE locs (1..numActive), ally/self slots are NEGATIVE.
 *   - A foe loc `t` is adjacent to a source at 0-indexed slot `i` (out of
 *     `numActive`) iff |i + t - numActive| <= 1. The "mirror" foe directly
 *     opposite the source, t = numActive - i, is always adjacent and therefore
 *     always a legal target (even if that foe has fainted, in which case the move
 *     simply fails that turn instead of being rejected).
 */

// Target types that REQUIRE an explicit target in Doubles/Triples.
// Mirrors CHOOSABLE_TARGETS in pokemon-showdown/sim/battle-actions.ts.
const CHOOSABLE_TARGETS = new Set([
  'normal', 'any', 'adjacentAlly', 'adjacentAllyOrSelf', 'adjacentFoe',
]);

/**
 * The foe slot directly opposite source slot `i`; always adjacent and valid.
 * @param {number} i 0-indexed source active slot
 * @param {number} numActive number of active Pokemon per side
 * @return {number} positive foe target loc
 */
function mirrorFoeTarget(i, numActive) {
  return numActive - i;
}

/**
 * Whether foe target loc `t` is a legal target for a source at slot `i`.
 * @param {number} t 1-based foe target loc
 * @param {number} i 0-indexed source active slot
 * @param {number} numActive active Pokemon per side
 * @return {boolean}
 */
function isAdjacentFoe(t, i, numActive) {
  if (t < 1 || t > numActive) return false;
  return Math.abs(i + t - numActive) <= 1;
}

/**
 * Resolve the target loc for a move of the given target type from slot `i`.
 *
 * @param {string} targetType the move's target type (ex. 'normal')
 * @param {number} i 0-indexed source active slot
 * @param {number} numActive active Pokemon per side
 * @param {boolean[]} aliveAllies which active ally slots are present/usable
 * @return {?number} 0 when no explicit target is needed, a positive loc for a
 *   foe, a negative loc for an ally/self, or `null` when the move is unusable
 *   (ex. an adjacentAlly move with no adjacent ally) so the caller can skip it.
 */
function pickTargetLoc(targetType, i, numActive, aliveAllies) {
  if (numActive <= 1) return 0;
  if (!CHOOSABLE_TARGETS.has(targetType)) return 0;
  switch (targetType) {
    case 'normal':
    case 'any':
    case 'adjacentFoe':
      return mirrorFoeTarget(i, numActive);
    case 'adjacentAllyOrSelf':
      // Targeting yourself is always legal, so fall back to self.
      return -(i + 1);
    case 'adjacentAlly': {
      const candidates = [i - 1, i + 1].filter(
        j => j >= 0 && j < numActive && (!aliveAllies || aliveAllies[j])
      );
      if (!candidates.length) return null;
      return -(candidates[0] + 1);
    }
    default:
      return 0;
  }
}

/**
 * Build the `/choose` sub-choice string for one active slot's move turn.
 *
 * @param {Object} slotReq request.active[i] ({moves: [{move,id,target,disabled}]})
 * @param {number} i 0-indexed slot
 * @param {number} numActive active Pokemon per side
 * @param {boolean[]} aliveAllies usable ally slots
 * @param {function():number} rng returns a float in [0,1)
 * @return {string} ex. 'move 1 2', 'move 3', 'pass', or 'default'
 */
function buildMovePiece(slotReq, i, numActive, aliveAllies, rng) {
  // A slot we cannot act with (ex. a Commander'd Tatsugiri) must pass.
  if (!slotReq || slotReq.commanding) return 'pass';

  const moves = slotReq.moves || [];
  const usable = [];
  for (let j = 0; j < moves.length; j++) {
    const m = moves[j];
    if (!m || m.disabled) continue;
    const loc = pickTargetLoc(m.target, i, numActive, aliveAllies);
    if (loc === null) continue; // move's target can't be satisfied right now
    usable.push({ slot: j + 1, loc });
  }

  // No usable move (everything disabled, or only unsatisfiable targets): let the
  // server auto-resolve this slot rather than send something illegal.
  if (!usable.length) return 'default';

  const chosen = usable[Math.floor(rng() * usable.length)];
  return chosen.loc ? `move ${chosen.slot} ${chosen.loc}` : `move ${chosen.slot}`;
}

/**
 * Build the full array of per-slot move sub-choices for a Doubles/Triples turn.
 *
 * @param {Object} request the raw server request (with `active`)
 * @param {function():number} [rng=Math.random]
 * @return {string[]} one sub-choice per active slot
 */
function buildMoveChoice(request, rng = Math.random) {
  const actives = (request && request.active) || [];
  const numActive = actives.length;
  const aliveAllies = actives.map(a => !!(a && !a.commanding));
  return actives.map((slotReq, i) => buildMovePiece(slotReq, i, numActive, aliveAllies, rng));
}

/**
 * Build the per-slot sub-choices for a Doubles/Triples forced switch.
 *
 * Each slot that must switch gets a distinct, non-fainted, benched Pokemon; every
 * other slot passes.
 *
 * @param {Object} request the raw server request (with `forceSwitch`, `side`)
 * @return {string[]} one sub-choice per active slot
 */
function buildSwitchChoice(request) {
  const forceSwitch = (request && request.forceSwitch) || [];
  const party = (request && request.side && request.side.pokemon) || [];
  const chosen = new Set();
  const isFainted = mon => !!(mon && mon.condition && mon.condition.endsWith(' fnt'));

  return forceSwitch.map((mustSwitch) => {
    if (!mustSwitch) return 'pass';
    for (let k = 0; k < party.length; k++) {
      if (chosen.has(k)) continue;
      const mon = party[k];
      if (!mon || mon.active || isFainted(mon)) continue;
      chosen.add(k);
      return `switch ${k + 1}`; // server switch slots are 1-indexed party positions
    }
    return 'pass'; // nothing left to switch to
  });
}

module.exports = {
  CHOOSABLE_TARGETS,
  mirrorFoeTarget,
  isAdjacentFoe,
  pickTargetLoc,
  buildMovePiece,
  buildMoveChoice,
  buildSwitchChoice,
};
