export const Items: {[itemid: string]: ModdedItemData} = {
	// Pinch Berries - Activation threshold restored to 50% HP (Gen 6) from 25% HP (Gen 7+)
	liechiberry: {
		inherit: true,
		onUpdate(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.abilityState.gluttony) {
				pokemon.eatItem();
			}
		},
		onTryEatItem(item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat(pokemon) {
			this.boost({atk: 1}, pokemon);
		},
		desc: "Raises holder's Attack by 1 stage when at 1/2 max HP or less. Single use.",
	},
	ganlonberry: {
		inherit: true,
		onUpdate(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.abilityState.gluttony) {
				pokemon.eatItem();
			}
		},
		onTryEatItem(item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat(pokemon) {
			this.boost({def: 1}, pokemon);
		},
		desc: "Raises holder's Defense by 1 stage when at 1/2 max HP or less. Single use.",
	},
	salacberry: {
		inherit: true,
		onUpdate(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.abilityState.gluttony) {
				pokemon.eatItem();
			}
		},
		onTryEatItem(item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat(pokemon) {
			this.boost({spe: 1}, pokemon);
		},
		desc: "Raises holder's Speed by 1 stage when at 1/2 max HP or less. Single use.",
	},
	petayaberry: {
		inherit: true,
		onUpdate(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.abilityState.gluttony) {
				pokemon.eatItem();
			}
		},
		onTryEatItem(item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat(pokemon) {
			this.boost({spa: 1}, pokemon);
		},
		desc: "Raises holder's Sp. Atk by 1 stage when at 1/2 max HP or less. Single use.",
	},
	apicotberry: {
		inherit: true,
		onUpdate(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.abilityState.gluttony) {
				pokemon.eatItem();
			}
		},
		onTryEatItem(item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat(pokemon) {
			this.boost({spd: 1}, pokemon);
		},
		desc: "Raises holder's Sp. Def by 1 stage when at 1/2 max HP or less. Single use.",
	},
	lansatberry: {
		inherit: true,
		onUpdate(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.abilityState.gluttony) {
				pokemon.eatItem();
			}
		},
		onTryEatItem(item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat(pokemon) {
			pokemon.addVolatile('focusenergy');
		},
		desc: "Holder gains the Focus Energy effect when at 1/2 max HP or less. Single use.",
	},
	starfberry: {
		inherit: true,
		onUpdate(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.abilityState.gluttony) {
				pokemon.eatItem();
			}
		},
		onTryEatItem(item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat(pokemon) {
			const stats: BoostID[] = [];
			let stat: BoostID;
			for (stat in pokemon.boosts) {
				if (stat !== 'accuracy' && stat !== 'evasion' && pokemon.boosts[stat] < 6) {
					stats.push(stat);
				}
			}
			if (stats.length) {
				const randomStat = this.sample(stats);
				const boost: SparseBoostsTable = {};
				boost[randomStat] = 2;
				this.boost(boost, pokemon);
			}
		},
		desc: "Raises a random stat by 2 stages (except accuracy/evasion) when at 1/2 max HP or less. Single use.",
	},
	micleberry: {
		inherit: true,
		onUpdate(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.abilityState.gluttony) {
				pokemon.eatItem();
			}
		},
		onTryEatItem(item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat(pokemon) {
			pokemon.addVolatile('micleberry');
		},
		condition: {
			duration: 2,
			onSourceModifyAccuracyPriority: -1,
			onSourceModifyAccuracy(accuracy, target, source, move) {
				if (move.category !== 'Status') {
					this.add('-enditem', source, 'Micle Berry');
					source.removeVolatile('micleberry');
					return this.chainModify([6144, 4096]);
				}
			},
		},
		desc: "Holder's next move has 1.2x accuracy when at 1/2 max HP or less. Single use.",
	},
	custapberry: {
		inherit: true,
		onUpdate(pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.abilityState.gluttony) {
				pokemon.eatItem();
			}
		},
		onTryEatItem(item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat(pokemon) {
			pokemon.addVolatile('custapberry');
		},
		condition: {
			duration: 2,
			onFractionalPriorityPriority: -1,
			onFractionalPriority(priority, pokemon, target, move) {
				this.add('-enditem', pokemon, 'Custap Berry');
				pokemon.removeVolatile('custapberry');
				return 0.1;
			},
		},
		desc: "Holder moves first in its priority bracket when at 1/2 max HP or less. Single use.",
	},
};
