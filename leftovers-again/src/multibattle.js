/**
 * Multi-active battle helpers (Doubles / Triples).
 *
 * The leftovers-again framework was written for Singles, where a side only ever
 * has one active Pokemon. In Doubles (2) and Triples (3) the server sends a
 * `request` whose `active` array has one entry per active slot, and it expects a
 * `/choose` command containing one sub-choice per slot (joined by commas), each
 * single-target move carrying an explicit target.
 *
 * This module builds those per-slot sub-choices, including the battle mechanics
 * (Mega Evolution, Mega-X/Y, Ultra Burst, Z-Moves, Dynamax/Gigantamax, and
 * Terastallization). It is intentionally free of any framework / network
 * dependencies so it can be unit-tested in isolation.
 *
 * Target-location reference (matches pokemon-showdown sim/battle.ts validTargetLoc):
 *   - Foe slots are POSITIVE locs (1..numActive), ally/self slots are NEGATIVE.
 *   - A foe loc `t` is adjacent to a source at 0-indexed slot `i` (out of
 *     `numActive`) iff |i + t - numActive| <= 1. The "mirror" foe directly
 *     opposite the source, t = numActive - i, is always adjacent and therefore
 *     always a legal target (even if that foe has fainted, in which case the move
 *     simply fails that turn instead of being rejected).
 *
 * Mechanics reference (matches pokemon-showdown sim/side.ts chooseMove):
 *   - The per-slot sub-choice is `move <index> [target] [event]`, where `event`
 *     is one of mega | megax | megay | ultra | zmove | dynamax | terastallize.
 *   - Mega/Ultra/Tera pick a regular move (target from the regular move).
 *   - Z-Moves pick from `canZMove` (target from the z-move).
 *   - Dynamax picks the REGULAR move index but takes the target from the
 *     corresponding Max Move (`maxMoves.maxMoves[i]`): damaging Max Moves are
 *     adjacentFoe (need a target), Max Guard is self (no target).
 *   - Each mechanic is once-per-side-per-battle, so at most one slot per turn may
 *     use a given mechanic. `buildMoveChoice` tracks this across slots.
 */

// Target types that REQUIRE an explicit target in Doubles/Triples.
// Mirrors CHOOSABLE_TARGETS in pokemon-showdown/sim/battle-actions.ts.
const CHOOSABLE_TARGETS = new Set([
  'normal', 'any', 'adjacentAlly', 'adjacentAllyOrSelf', 'adjacentFoe',
]);

// How often the bot uses an available battle mechanic on an eligible slot.
const TRANSFORM_CHANCE = 0.5;

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
 * The once-per-battle "bucket" a transformation event consumes. Mega, Mega-X and
 * Mega-Y all share the single Mega Evolution per battle.
 * @param {string} event mega|megax|megay|ultra|zmove|dynamax|terastallize
 * @return {string}
 */
function mechanicKey(event) {
  if (event === 'mega' || event === 'megax' || event === 'megay') return 'mega';
  if (event === 'terastallize') return 'tera';
  return event; // 'ultra' | 'zmove' | 'dynamax'
}

/**
 * Decide which battle mechanic (if any) this slot should use, given the
 * mechanics already claimed by earlier slots this turn.
 *
 * @param {Object} slotReq request.active[i]
 * @param {Set<string>} used mechanic buckets already claimed this turn
 * @param {function():number} rng
 * @return {?string} an event name, or null for a plain move
 */
function chooseTransform(slotReq, used, rng) {
  const options = [];
  if (slotReq.canMegaEvoX && !used.has('mega')) options.push('megax');
  if (slotReq.canMegaEvoY && !used.has('mega')) options.push('megay');
  if (slotReq.canMegaEvo && !used.has('mega')) options.push('mega');
  if (slotReq.canUltraBurst && !used.has('ultra')) options.push('ultra');
  if (slotReq.canTerastallize && !used.has('tera')) options.push('terastallize');
  if (slotReq.canDynamax && !used.has('dynamax')) options.push('dynamax');
  if (Array.isArray(slotReq.canZMove) && slotReq.canZMove.some(z => z) && !used.has('zmove')) {
    options.push('zmove');
  }
  if (!options.length) return null;
  if (rng() >= TRANSFORM_CHANCE) return null;
  return options[Math.floor(rng() * options.length)];
}

/**
 * Build the list of usable {slot, loc} move options for a slot, drawn from the
 * pool implied by `mechanic`.
 *
 * @param {Object} slotReq request.active[i]
 * @param {?string} mechanic 'dynamax' (Max Moves), 'zmove' (Z-Moves), or null
 *   (regular moves; also used for the moves of an already-Dynamaxed Pokemon)
 * @param {number} i 0-indexed slot
 * @param {number} numActive active Pokemon per side
 * @param {boolean[]} aliveAllies usable ally slots
 * @return {{slot: number, loc: number}[]}
 */
function movePool(slotReq, mechanic, i, numActive, aliveAllies) {
  let raw;
  if (mechanic === 'dynamax') {
    raw = ((slotReq.maxMoves && slotReq.maxMoves.maxMoves) || [])
      .map((m, j) => (m && !m.disabled ? { slot: j + 1, target: m.target } : null));
  } else if (mechanic === 'zmove') {
    raw = (slotReq.canZMove || [])
      .map((z, j) => (z ? { slot: j + 1, target: z.target } : null));
  } else {
    raw = (slotReq.moves || [])
      .map((m, j) => (m && !m.disabled ? { slot: j + 1, target: m.target } : null));
  }

  const usable = [];
  for (const c of raw) {
    if (!c) continue;
    const loc = pickTargetLoc(c.target, i, numActive, aliveAllies);
    if (loc === null) continue; // target can't be satisfied right now
    usable.push({ slot: c.slot, loc });
  }
  return usable;
}

/**
 * Format a chosen move option into a `/choose` sub-choice string.
 * @param {{slot: number, loc: number}} choice
 * @param {string} event suffix (ex. 'mega', 'dynamax'); '' for a plain move
 * @return {string}
 */
function formatMove(choice, event) {
  const base = choice.loc ? `move ${choice.slot} ${choice.loc}` : `move ${choice.slot}`;
  return event ? `${base} ${event}` : base;
}

/**
 * Build the `/choose` sub-choice string for one active slot's move turn.
 *
 * @param {Object} slotReq request.active[i]
 * @param {number} i 0-indexed slot
 * @param {number} numActive active Pokemon per side
 * @param {boolean[]} aliveAllies usable ally slots
 * @param {Set<string>} used mechanic buckets already claimed this turn
 * @param {function():number} rng returns a float in [0,1)
 * @return {string} ex. 'move 1 2', 'move 3 terastallize', 'pass', or 'default'
 */
function buildMovePiece(slotReq, i, numActive, aliveAllies, used, rng) {
  // A slot we cannot act with (ex. a Commander'd Tatsugiri) must pass.
  if (!slotReq || slotReq.commanding) return 'pass';

  // Try a battle mechanic first.
  const transform = chooseTransform(slotReq, used, rng);
  if (transform) {
    const pool = transform === 'dynamax' ? 'dynamax' : (transform === 'zmove' ? 'zmove' : null);
    const usable = movePool(slotReq, pool, i, numActive, aliveAllies);
    if (usable.length) {
      used.add(mechanicKey(transform));
      const chosen = usable[Math.floor(rng() * usable.length)];
      return formatMove(chosen, transform);
    }
    // Couldn't form a transformed move; fall through to a plain move without
    // consuming the mechanic.
  }

  // Plain move. An already-Dynamaxed Pokemon (has Max Moves but can no longer
  // start a Dynamax) must keep using its Max Moves, with their targets.
  const plainPool = (slotReq.maxMoves && !slotReq.canDynamax) ? 'dynamax' : null;
  const usable = movePool(slotReq, plainPool, i, numActive, aliveAllies);

  // No usable move (everything disabled, or only unsatisfiable targets): let the
  // server auto-resolve this slot rather than send something illegal.
  if (!usable.length) return 'default';

  const chosen = usable[Math.floor(rng() * usable.length)];
  return formatMove(chosen, '');
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
  const used = new Set(); // mechanics claimed this turn (once-per-battle each)
  return actives.map((slotReq, i) => buildMovePiece(slotReq, i, numActive, aliveAllies, used, rng));
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
  TRANSFORM_CHANCE,
  mirrorFoeTarget,
  isAdjacentFoe,
  pickTargetLoc,
  mechanicKey,
  chooseTransform,
  movePool,
  buildMovePiece,
  buildMoveChoice,
  buildSwitchChoice,
};
