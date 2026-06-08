'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const { TeamValidator } = require('./../../../dist/sim/team-validator');

const FORMAT = 'gen9purehackmonsnonerfs';

function reqFor(battle, sideId, speciesName) {
	const mon = battle[sideId].pokemon.find(p => p.species.name === speciesName);
	return mon.getMoveRequestData();
}

// Resolve a Team Preview request (if present) keeping default team order.
function startBattle(battle) {
	if (battle.requestState === 'teampreview') battle.makeChoices('default', 'default');
}

describe('[Gen 9] Pure Hackmons No Nerfs - Dynamax', () => {
	let battle;
	afterEach(() => {
		if (battle) battle.destroy();
	});

	it('offers only Mega Evolution to a Pokemon holding a Mega Stone', () => {
		battle = common.mod('phnn').createBattle({ formatid: FORMAT }, [[
			{ species: 'Charizard', ability: 'Blaze', item: 'charizarditex', moves: ['flamethrower', 'dragonclaw'], level: 100 },
		], [
			{ species: 'Pikachu', ability: 'Static', moves: ['thunderbolt'], level: 100 },
		]]);
		const req = reqFor(battle, 'p1', 'Charizard');
		assert.equal(req.canMegaEvo, true);
		assert(!req.canDynamax, 'Mega-capable Pokemon should not be offered Dynamax');
		assert(!req.canTerastallize, 'Mega-capable Pokemon should not be offered Terastallization');
	});

	it('offers only Terastallization when the Tera type differs from the primary type', () => {
		// Garchomp is Dragon/Ground; a Steel Tera type is a deliberate, non-default choice -> Tera.
		battle = common.mod('phnn').createBattle({ formatid: FORMAT }, [[
			{ species: 'Garchomp', ability: 'Rough Skin', teraType: 'Steel', moves: ['earthquake', 'dragonclaw'], level: 100 },
		], [
			{ species: 'Pikachu', ability: 'Static', moves: ['thunderbolt'], level: 100 },
		]]);
		const req = reqFor(battle, 'p1', 'Garchomp');
		assert.equal(req.canTerastallize, 'Steel');
		assert(!req.canDynamax, 'A Pokemon with a non-default Tera type should not be offered Dynamax');
		assert(!req.canMegaEvo);
	});

	it('offers only Dynamax when no Tera type is set, even for cannotDynamax species (No Nerfs)', () => {
		battle = common.mod('phnn').createBattle({ formatid: FORMAT }, [[
			{ species: 'Zacian', ability: 'Intrepid Sword', moves: ['behemothblade', 'playrough'], level: 100 },
		], [
			{ species: 'Pikachu', ability: 'Static', moves: ['thunderbolt'], level: 100 },
		]]);
		const req = reqFor(battle, 'p1', 'Zacian');
		assert.equal(req.canDynamax, true);
		assert(req.maxMoves && req.maxMoves.maxMoves.length, 'Dynamax request should include Max moves');
		assert(!req.canTerastallize, 'A Pokemon without a Tera type should not be offered Terastallization');
	});

	it('treats a Tera type equal to the primary type as the default (Dynamax, not Tera)', () => {
		// This mirrors the teambuilder: an unchosen Tera type defaults to the species' first type.
		// Garchomp's primary type is Dragon, so teraType 'Dragon' must be treated as "no Tera chosen".
		battle = common.mod('phnn').createBattle({ formatid: FORMAT }, [[
			{ species: 'Garchomp', ability: 'Rough Skin', teraType: 'Dragon', moves: ['earthquake', 'dragonclaw'], level: 100 },
		], [
			{ species: 'Pikachu', ability: 'Static', moves: ['thunderbolt'], level: 100 },
		]]);
		const req = reqFor(battle, 'p1', 'Garchomp');
		assert.equal(req.canDynamax, true);
		assert(!req.canTerastallize, 'Tera type matching the primary type should fall through to Dynamax');
	});

	it('offers Gigantamax to a G-Max-capable species with gigantamax:true', () => {
		battle = common.mod('phnn').createBattle({ formatid: FORMAT }, [[
			{ species: 'Charizard', ability: 'Blaze', gigantamax: true, moves: ['flamethrower', 'airslash'], level: 100 },
		], [
			{ species: 'Pikachu', ability: 'Static', moves: ['thunderbolt'], level: 100 },
		]]);
		const req = reqFor(battle, 'p1', 'Charizard');
		assert.equal(req.canDynamax, true);
		assert.equal(req.maxMoves.gigantamax, 'G-Max Wildfire');
	});

	it('applies Dynamax: HP scaling, Max moves, once per battle, and a 3-turn duration', () => {
		battle = common.mod('phnn').createBattle({ formatid: FORMAT }, [[
			{ species: 'Snorlax', ability: 'Thick Fat', moves: ['bodyslam', 'rest'], level: 100 },
		], [
			{ species: 'Shuckle', ability: 'Sturdy', moves: ['recover', 'splash'], level: 100 },
		]]);
		startBattle(battle);
		const lax = battle.p1.active[0];
		const baseMax = lax.maxhp;

		battle.makeChoices('move 1 dynamax', 'move 1');
		assert(lax.volatiles['dynamax'], 'Dynamax volatile should be applied');
		assert.atLeast(lax.maxhp, baseMax + 1, 'Max HP should scale up while Dynamaxed');
		assert.equal(battle.p1.dynamaxUsed, true);
		assert(battle.log.join('\n').includes('Max Strike'), 'Body Slam should become Max Strike');

		for (let i = 0; i < 5 && lax.volatiles['dynamax']; i++) {
			battle.makeChoices('move 1', 'move 1');
		}
		assert(!lax.volatiles['dynamax'], 'Dynamax should wear off after its duration');
		assert.equal(lax.maxhp, baseMax, 'Max HP should return to its base value after Dynamax ends');
		assert(!lax.getMoveRequestData().canDynamax, 'Dynamax should only be available once per battle');
	});

	it('keeps Terastallization working in a normal PHNN battle (Tera type set)', () => {
		battle = common.mod('phnn').createBattle({ formatid: FORMAT }, [[
			{ species: 'Garchomp', ability: 'Rough Skin', teraType: 'Steel', moves: ['earthquake'], level: 100 },
		], [
			{ species: 'Shuckle', ability: 'Sturdy', moves: ['splash'], level: 100 },
		]]);
		startBattle(battle);
		const chomp = battle.p1.active[0];
		battle.makeChoices('move 1 terastallize', 'move 1');
		assert.equal(chomp.terastallized, 'Steel');
	});
});

describe('[Gen 9] Pure Hackmons No Nerfs - Tera type validation', () => {
	it('preserves an explicit Tera type and never defaults an unspecified one', () => {
		const validator = TeamValidator.get(FORMAT);
		const team = [
			{ species: 'Garchomp', ability: 'Rough Skin', moves: ['earthquake'], evs: {}, ivs: {}, level: 100, teraType: 'Steel' },
			{ species: 'Snorlax', ability: 'Thick Fat', moves: ['bodyslam'], evs: {}, ivs: {}, level: 100 },
		];
		const problems = validator.validateTeam(team);
		assert(!problems, `Unexpected validation problems: ${problems}`);
		assert.equal(team[0].teraType, 'Steel');
		assert(!team[1].teraType, 'An unspecified Tera type must stay empty so the Pokemon Dynamaxes instead');
	});

	it('still defaults Tera types in standard Gen 9 formats (regression)', () => {
		const validator = TeamValidator.get('gen9customgame');
		const team = [
			{ species: 'Snorlax', ability: 'Thick Fat', moves: ['bodyslam'], evs: {}, ivs: {}, level: 100 },
		];
		const problems = validator.validateTeam(team);
		assert(!problems, `Unexpected validation problems: ${problems}`);
		assert.equal(team[0].teraType, 'Normal');
	});
});
