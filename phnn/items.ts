export const Items: {[itemid: string]: ModdedItemData} = {
	// Classic Items Return

	// Soul Dew - Pre-Gen 7 mechanics (50% boost to Latios/Latias SpAtk and SpDef)
	souldew: {
		inherit: true,
		onBasePowerPriority: 15,
		onBasePower(basePower, user, target, move) {
			if ((user.baseSpecies.num === 380 || user.baseSpecies.num === 381) && (move.type === 'Psychic' || move.type === 'Dragon')) {
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 1,
		onModifySpA(spa, pokemon) {
			if (pokemon.baseSpecies.num === 380 || pokemon.baseSpecies.num === 381) {
				return this.chainModify(1.5);
			}
		},
		onModifySpDPriority: 1,
		onModifySpD(spd, pokemon) {
			if (pokemon.baseSpecies.num === 380 || pokemon.baseSpecies.num === 381) {
				return this.chainModify(1.5);
			}
		},
		desc: "If held by a Latias or Latios, its Sp. Atk and Sp. Def are 1.5x.",
	},

	// Berserk Gene - Gen 2 item
	berserkgene: {
		inherit: true,
		onStart(pokemon) {
			this.boost({atk: 2}, pokemon);
			pokemon.addVolatile('confusion');
			pokemon.setItem('');
		},
		desc: "On switch-in, raises holder's Attack by 2 stages and confuses it. Single use.",
	},

	// Pink Bow - Boosts Normal-type moves by 10%
	pinkbow: {
		inherit: true,
		onBasePowerPriority: 15,
		onBasePower(basePower, user, target, move) {
			if (move.type === 'Normal') {
				return this.chainModify([4505, 4096]);
			}
		},
		desc: "Holder's Normal-type attacks have 1.1x power.",
	},

	// Polkadot Bow - Boosts Normal-type moves by 10% (redundancy for Item Clause)
	polkadotbow: {
		inherit: true,
		onBasePowerPriority: 15,
		onBasePower(basePower, user, target, move) {
			if (move.type === 'Normal') {
				return this.chainModify([4505, 4096]);
			}
		},
		desc: "Holder's Normal-type attacks have 1.1x power.",
	},
};
