'use strict';

// Standalone (plain-node) tests for the Doubles/Triples decision helpers.
// Run with: node spec/multibattle.test.js
// These avoid the jasmine + babel + module-alias harness so they can run without
// installing dev dependencies.

const assert = require('assert');
const mb = require('../src/multibattle');

let passed = 0;
function it(name, fn) {
  fn();
  passed++;
  console.log(`  ok - ${name}`);
}

const zero = () => 0; // deterministic rng: always picks the first option / always transforms
const never = () => 0.99; // deterministic rng: never transforms (>= TRANSFORM_CHANCE)

// --- mirrorFoeTarget -------------------------------------------------------
it('mirrorFoeTarget returns the opposite foe slot', () => {
  assert.strictEqual(mb.mirrorFoeTarget(0, 2), 2);
  assert.strictEqual(mb.mirrorFoeTarget(1, 2), 1);
  assert.strictEqual(mb.mirrorFoeTarget(0, 3), 3);
  assert.strictEqual(mb.mirrorFoeTarget(1, 3), 2);
  assert.strictEqual(mb.mirrorFoeTarget(2, 3), 1);
});

// --- isAdjacentFoe (triples adjacency) ------------------------------------
it('isAdjacentFoe matches the sim adjacency rule in triples', () => {
  // left source (i=0) can hit foes 2 and 3, not 1
  assert.strictEqual(mb.isAdjacentFoe(1, 0, 3), false);
  assert.strictEqual(mb.isAdjacentFoe(2, 0, 3), true);
  assert.strictEqual(mb.isAdjacentFoe(3, 0, 3), true);
  // center source (i=1) can hit all foes
  assert.strictEqual(mb.isAdjacentFoe(1, 1, 3), true);
  assert.strictEqual(mb.isAdjacentFoe(2, 1, 3), true);
  assert.strictEqual(mb.isAdjacentFoe(3, 1, 3), true);
  // right source (i=2) can hit foes 1 and 2, not 3
  assert.strictEqual(mb.isAdjacentFoe(1, 2, 3), true);
  assert.strictEqual(mb.isAdjacentFoe(2, 2, 3), true);
  assert.strictEqual(mb.isAdjacentFoe(3, 2, 3), false);
});

it('the mirror target is always adjacent (and thus legal)', () => {
  for (const numActive of [2, 3]) {
    for (let i = 0; i < numActive; i++) {
      assert.ok(
        mb.isAdjacentFoe(mb.mirrorFoeTarget(i, numActive), i, numActive),
        `mirror should be adjacent for i=${i}, numActive=${numActive}`
      );
    }
  }
});

// --- pickTargetLoc ---------------------------------------------------------
it('pickTargetLoc returns no target in singles', () => {
  assert.strictEqual(mb.pickTargetLoc('normal', 0, 1, [true]), 0);
});

it('pickTargetLoc targets the mirror foe for foe-target moves', () => {
  assert.strictEqual(mb.pickTargetLoc('normal', 0, 2, [true, true]), 2);
  assert.strictEqual(mb.pickTargetLoc('any', 1, 2, [true, true]), 1);
  assert.strictEqual(mb.pickTargetLoc('adjacentFoe', 2, 3, [true, true, true]), 1);
});

it('pickTargetLoc returns no target for non-choosable target types', () => {
  assert.strictEqual(mb.pickTargetLoc('allAdjacentFoes', 0, 2, [true, true]), 0);
  assert.strictEqual(mb.pickTargetLoc('self', 0, 2, [true, true]), 0);
  assert.strictEqual(mb.pickTargetLoc('randomNormal', 0, 2, [true, true]), 0);
});

it('pickTargetLoc targets self for adjacentAllyOrSelf', () => {
  assert.strictEqual(mb.pickTargetLoc('adjacentAllyOrSelf', 1, 2, [true, true]), -2);
});

it('pickTargetLoc picks an adjacent ally, or null when none', () => {
  assert.strictEqual(mb.pickTargetLoc('adjacentAlly', 0, 2, [true, true]), -2);
  assert.strictEqual(mb.pickTargetLoc('adjacentAlly', 1, 3, [true, true, true]), -1);
  // no adjacent ally alive -> unusable
  assert.strictEqual(mb.pickTargetLoc('adjacentAlly', 0, 2, [true, false]), null);
});

// --- buildMovePiece --------------------------------------------------------
it('buildMovePiece adds a target for single-target moves', () => {
  const slotReq = { moves: [{ id: 'tackle', target: 'normal', disabled: false }] };
  assert.strictEqual(mb.buildMovePiece(slotReq, 0, 2, [true, true], new Set(), zero), 'move 1 2');
});

it('buildMovePiece omits a target for spread/self moves', () => {
  const slotReq = { moves: [{ id: 'earthquake', target: 'allAdjacent', disabled: false }] };
  assert.strictEqual(mb.buildMovePiece(slotReq, 0, 2, [true, true], new Set(), zero), 'move 1');
});

it('buildMovePiece passes for a commanding slot', () => {
  assert.strictEqual(mb.buildMovePiece({ commanding: true }, 0, 2, [true, true], new Set(), zero), 'pass');
});

it('buildMovePiece defaults when no move is usable', () => {
  const slotReq = { moves: [{ id: 'tackle', target: 'normal', disabled: true }] };
  assert.strictEqual(mb.buildMovePiece(slotReq, 0, 2, [true, true], new Set(), zero), 'default');
});

it('buildMovePiece skips moves whose target cannot be satisfied', () => {
  // Only move is an adjacentAlly move but the ally is gone -> falls back to default.
  const slotReq = { moves: [{ id: 'helpinghand', target: 'adjacentAlly', disabled: false }] };
  assert.strictEqual(mb.buildMovePiece(slotReq, 0, 2, [true, false], new Set(), zero), 'default');
});

// --- battle mechanics (Mega / Ultra / Z / Dynamax / Tera) ------------------
it('chooseTransform offers nothing when the rng declines', () => {
  const slotReq = { moves: [{ id: 'tackle', target: 'normal' }], canTerastallize: 'Steel' };
  assert.strictEqual(mb.chooseTransform(slotReq, new Set(), never), null);
});

it('chooseTransform skips a mechanic already claimed this turn', () => {
  const slotReq = { canMegaEvo: true, moves: [{ id: 'tackle', target: 'normal' }] };
  assert.strictEqual(mb.chooseTransform(slotReq, new Set(['mega']), zero), null);
});

it('buildMovePiece appends the terastallize event', () => {
  const slotReq = { moves: [{ id: 'tackle', target: 'normal', disabled: false }], canTerastallize: 'Steel' };
  assert.strictEqual(mb.buildMovePiece(slotReq, 0, 2, [true, true], new Set(), zero), 'move 1 2 terastallize');
});

it('buildMovePiece appends the mega event', () => {
  const slotReq = { moves: [{ id: 'flamethrower', target: 'normal', disabled: false }], canMegaEvo: true };
  assert.strictEqual(mb.buildMovePiece(slotReq, 0, 2, [true, true], new Set(), zero), 'move 1 2 mega');
});

it('buildMovePiece dynamaxes using the Max Move target (adjacentFoe)', () => {
  const slotReq = {
    moves: [{ id: 'tackle', target: 'normal', disabled: false }],
    canDynamax: true,
    maxMoves: { maxMoves: [{ move: 'maxstrike', target: 'adjacentFoe', disabled: false }] },
  };
  assert.strictEqual(mb.buildMovePiece(slotReq, 0, 2, [true, true], new Set(), zero), 'move 1 2 dynamax');
});

it('buildMovePiece keeps using Max Moves while already Dynamaxed (no event)', () => {
  // Already dynamaxed: maxMoves present, canDynamax absent. Status Max Move -> Max Guard (self, no target).
  const slotReq = {
    moves: [{ id: 'tackle', target: 'normal', disabled: false }],
    maxMoves: { maxMoves: [{ move: 'maxguard', target: 'self', disabled: false }] },
  };
  assert.strictEqual(mb.buildMovePiece(slotReq, 0, 2, [true, true], new Set(), zero), 'move 1');
});

it('buildMovePiece uses the z-move target from canZMove', () => {
  const slotReq = {
    moves: [{ id: 'tackle', target: 'normal', disabled: false }],
    canZMove: [{ move: 'Breakneck Blitz', target: 'normal' }],
  };
  assert.strictEqual(mb.buildMovePiece(slotReq, 1, 2, [true, true], new Set(), zero), 'move 1 1 zmove');
});

it('buildMoveChoice never uses the same mechanic on two slots in one turn', () => {
  const request = {
    active: [
      { moves: [{ id: 'a', target: 'normal', disabled: false }], canTerastallize: 'Steel' },
      { moves: [{ id: 'b', target: 'normal', disabled: false }], canTerastallize: 'Fire' },
    ],
  };
  const pieces = mb.buildMoveChoice(request, zero);
  const teras = pieces.filter(p => p.endsWith('terastallize'));
  assert.strictEqual(teras.length, 1, `only one slot should Terastallize, got: ${pieces.join(' | ')}`);
});

// --- buildMoveChoice -------------------------------------------------------
it('buildMoveChoice builds one sub-choice per active slot', () => {
  const request = {
    active: [
      { moves: [{ id: 'tackle', target: 'normal', disabled: false }] },
      { moves: [{ id: 'protect', target: 'self', disabled: false }] },
    ],
  };
  const pieces = mb.buildMoveChoice(request, zero);
  assert.deepStrictEqual(pieces, ['move 1 2', 'move 1']);
});

// --- buildSwitchChoice -----------------------------------------------------
it('buildSwitchChoice switches forced slots to distinct benched mons', () => {
  const request = {
    forceSwitch: [true, false],
    side: {
      pokemon: [
        { ident: 'p1: A', active: true, condition: '0 fnt' },
        { ident: 'p1: B', active: true, condition: '100/100' },
        { ident: 'p1: C', active: false, condition: '100/100' },
        { ident: 'p1: D', active: false, condition: '100/100' },
      ],
    },
  };
  assert.deepStrictEqual(mb.buildSwitchChoice(request), ['switch 3', 'pass']);
});

it('buildSwitchChoice assigns different mons when multiple slots must switch', () => {
  const request = {
    forceSwitch: [true, true],
    side: {
      pokemon: [
        { ident: 'p1: A', active: true, condition: '0 fnt' },
        { ident: 'p1: B', active: true, condition: '0 fnt' },
        { ident: 'p1: C', active: false, condition: '100/100' },
        { ident: 'p1: D', active: false, condition: '100/100' },
      ],
    },
  };
  assert.deepStrictEqual(mb.buildSwitchChoice(request), ['switch 3', 'switch 4']);
});

console.log(`\n${passed} multibattle tests passed.`);
