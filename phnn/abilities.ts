export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	// Contact Abilities - Restore Gen 3 activation rate (33% instead of 30%)
	cutecharm: {
		inherit: true,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(33, 100)) {
					source.trySetStatus('attract', target);
				}
			}
		},
		desc: "33% chance to infatuate the attacker on contact. Gen 3 value (30% in Gen 4+).",
	},
	effectspore: {
		inherit: true,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target) && !source.status && source.runStatusImmunity('powder')) {
				const r = this.random(300);
				if (r < 99) {
					source.setStatus('slp', target);
				} else if (r < 198) {
					source.setStatus('par', target);
				} else if (r < 297) {
					source.setStatus('psn', target);
				}
			}
		},
		desc: "33% chance to inflict sleep, paralysis, or poison on contact. Gen 3 value (30% in Gen 4+).",
	},
	flamebody: {
		inherit: true,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(33, 100)) {
					source.trySetStatus('brn', target);
				}
			}
		},
		desc: "33% chance to burn the attacker on contact. Gen 3 value (30% in Gen 4+).",
	},
	poisonpoint: {
		inherit: true,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(33, 100)) {
					source.trySetStatus('psn', target);
				}
			}
		},
		desc: "33% chance to poison the attacker on contact. Gen 3 value (30% in Gen 4+).",
	},
	static: {
		inherit: true,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(33, 100)) {
					source.trySetStatus('par', target);
				}
			}
		},
		desc: "33% chance to paralyze the attacker on contact. Gen 3 value (30% in Gen 4+).",
	},
	shedskin: {
		inherit: true,
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			if (pokemon.hp && pokemon.status && this.randomChance(33, 100)) {
				this.debug('shed skin');
				this.add('-activate', pokemon, 'ability: Shed Skin');
				pokemon.cureStatus();
			}
		},
		desc: "33% chance to cure status at the end of each turn. Gen 3 value (30% in Gen 4+).",
	},
	aerilate: {
		// Restore original 1.3x damage multiplier
		inherit: true,
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && !noModifyType.includes(move.id) && !(move.isZ && move.category !== 'Status')) {
				move.type = 'Flying';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([5325, 4096]);
		},
	},
	dauntlessshield: {
		// Activate on every switch-in		
		inherit: true,
		onStart(pokemon) {
			this.boost({def: 1}, pokemon);
		},
	},
	disguise: {
		// Remove Chip Damage on use
		inherit: true,
		onDamage(damage, target, source, effect) {
			if (
				effect && effect.effectType === 'Move' &&
				['mimikyu', 'mimikyutotem'].includes(target.species.id) && !target.transformed
			) {
				if (["rollout", "iceball"].includes(effect.id)) {
					source.volatiles[effect.id].contactHitCount--;
				}

				this.add("-activate", target, "ability: Disguise");
				this.effectState.busted = true;
				return 0;
			}
		},
		onUpdate(pokemon) {
			if (['mimikyu', 'mimikyutotem'].includes(pokemon.species.id) && this.effectState.busted) {
				const speciesid = pokemon.species.id === 'mimikyutotem' ? 'Mimikyu-Busted-Totem' : 'Mimikyu-Busted';
				pokemon.formeChange(speciesid, this.effect, true);
				pokemon.formeRegression = true;
			}
		},
	},
	galewings: {
		// Works at any HP
		inherit: true,
		onModifyPriority(priority, pokemon, target, move) {
			if (move && move.type === 'Flying') return priority + 1; 
		},
	},	
	intrepidsword: {
		// Activate on every switch-in		
		inherit: true,
		onStart(pokemon) {
			this.boost({atk: 1}, pokemon);
		},
	},
	libero: {
		// Remove once-per-switch limit - restore unlimited type changing		
		inherit: true,
		onPrepareHit(source, target, move) {
			if (move.hasBounced) return;
			const type = move.type;
			if (type && type !== '???') {
				if (!source.setType(type)) return;
				this.add('-start', source, 'typechange', type, '[from] ability: Libero');
			}
		},
	},	
	magicguard: {
		// Cannot be Poisoned by Toxic Spikes, or Fully Paralyzed
		inherit: true,
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: ' + effect.name);
				return false;
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id === 'par') return false;
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'toxicspikes') return null; 
		},
	},	
	moody: {
		// Allow accuracy and evasion		
		inherit: true,
		onResidual(pokemon) {
			let stats: BoostID[] = [];
			const boost: SparseBoostsTable = {};
			let statPlus: BoostID;
			for (statPlus in pokemon.boosts) {
				if (pokemon.boosts[statPlus] < 6) {
					stats.push(statPlus);
				}
			}
			let randomStat = stats.length ? this.sample(stats) : undefined;
			if (randomStat) boost[randomStat] = 2;

			stats = [];
			let statMinus: BoostID;
			for (statMinus in pokemon.boosts) {
				if (pokemon.boosts[statMinus] > -6 && statMinus !== randomStat) {
					stats.push(statMinus);
				}
			}
			randomStat = stats.length ? this.sample(stats) : undefined;
			if (randomStat) boost[randomStat] = -1;

			this.boost(boost, pokemon, pokemon);
		}, 
	},	
	parentalbond: {
		// No inherit: true - we're completely overriding to avoid base game's 0.25 modifier
		onPrepareHit(source, target, move) {
			if (['iceball', 'rollout'].includes(move.id)) return;
			if (move.category === 'Status') return;
			// Allow Z-moves to work with Parental Bond
			if (move.isZ) {
				// Z-moves are allowed - continue to make them hit twice
			} else if (move.selfdestruct || move.multihit) {
				// Non-Z-moves with these properties are still blocked
				return;
			}
			if (['endeavor', 'fling', 'flail', 'reversal'].includes(move.id)) return;
			if (move.flags['charge'] || move.flags['recharge'] || move.spreadHit) return;
			move.multihit = 2;
			move.multihitType = 'parentalbond';
		},
		// Damage modifier (0.5 for second hit) is handled in formats.ts only
	},	
	pixilate: {
		// Restore original 1.3x damage multiplier
		inherit: true,
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && !noModifyType.includes(move.id) && !(move.isZ && move.category !== 'Status')) {
				move.type = 'Fairy';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([5325, 4096]);
		},
	},
	protean: {
		// Remove once-per-switch limit - restore unlimited type changing
		inherit: true,
		onPrepareHit(source, target, move) {
			if (move.hasBounced) return;
			const type = move.type;
			if (type && type !== '???') {
				if (!source.setType(type)) return;
				this.add('-start', source, 'typechange', type, '[from] ability: Protean');
			}
		},
	},	
	refrigerate: {
		// Restore original 1.3x damage multiplier		
		inherit: true,
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && !noModifyType.includes(move.id) && !(move.isZ && move.category !== 'Status')) {
				move.type = 'Ice';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([5325, 4096]); // Restore original 1.3x damage multiplier
		},
	},		
	transistor: {
		// Restore 1.5x boost
		inherit: true,
		onBasePowerPriority: 30,
		onBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Electric') {
				this.debug('Transistor boost');
				return this.chainModify(1.5);
			}
		},
	},
	prankster: {
		// Remove Dark-type immunity (Gen 7 nerf) - restore Gen 6 behavior
		inherit: true,
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status') {
				move.pranksterBoosted = true;
				return priority + 1;
			}
		},
		desc: "Status moves gain +1 priority. Gen 6 value (Dark-types not immune).",
	},
	// Weather Abilities - Restore permanent weather (Gen 5) instead of 5-turn limit (Gen 6+)
	drizzle: {
		inherit: true,
		onStart(source) {
			this.field.setWeather('raindance');
		},
		desc: "On switch-in, summons permanent Rain Dance. Gen 5 value (5 turns in Gen 6+).",
	},
	drought: {
		inherit: true,
		onStart(source) {
			this.field.setWeather('sunnyday');
		},
		desc: "On switch-in, summons permanent Sunny Day. Gen 5 value (5 turns in Gen 6+).",
	},
	snowwarning: {
		inherit: true,
		onStart(source) {
			this.field.setWeather('snow');
		},
		desc: "On switch-in, summons permanent Snow. Gen 5 value (5 turns in Gen 6+).",
	},
	sandstream: {
		inherit: true,
		onStart(source) {
			this.field.setWeather('sandstorm');
		},
		desc: "On switch-in, summons permanent Sandstorm. Gen 5 value (5 turns in Gen 6+).",
	},
};
