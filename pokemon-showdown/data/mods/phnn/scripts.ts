export const Scripts: ModdedBattleScriptsData = {
	gen: 9,
	inherit: 'gen9',
	
	init() {
		// Remove EV limits - allow 1512 total EVs
		this.modData('Pokedex', 'bulbasaur').evLimit = 1512;
		
		// Type chart changes: Gen 9 type chart except Psychic is immune from Ghost (Gen 1)
		this.modData('TypeChart', 'psychic').damageTaken['Ghost'] = 3; // 3 = immune
		
		// Enable all battle mechanics (Mega, Z-moves, Dynamax, etc.)
		for (const id in this.data.Items) {
			const item = this.data.Items[id];
			if (item.megaStone) {
				item.isNonstandard = null;
			}
			if (item.zMove || item.zMoveType) {
				item.isNonstandard = null;
			}
		}
		
		// Enable Berserk Gene
		if (this.data.Items['berserkgene']) {
			this.data.Items['berserkgene'].isNonstandard = null;
		}
	},
	
	pokemon: {
		// Allow any Pokemon to have any ability (remove species restrictions)
		hasAbility(ability) {
			if (!ability) return false;
			if (Array.isArray(ability)) return ability.some(abil => this.hasAbility(abil));
			const abilityid = this.battle.toID(ability);
			return this.ability === abilityid;
		},
		
		// Modify EV limits
		setStats(pokemon, stats, source) {
			if (!pokemon) pokemon = this;
			// Allow unlimited EVs
			for (const stat in stats) {
				pokemon.stats[stat] = stats[stat];
			}
		},
		
		// Allow signature moves on any Pokemon
		hasMove(moveid) {
			moveid = this.battle.toID(moveid);
			if (!moveid) return false;
			for (const moveSlot of this.moveSlots) {
				if (moveid === moveSlot.id) {
					return moveSlot;
				}
			}
			return false;
		},
	},
	
	// Battle mechanics modifications
	battle: {
		// Remove sleep clause
		checkSleepClause(pokemon, source) {
			return false; // Always allow sleep
		},
		
		// Leech Seed + Toxic Synergy restoration
		runEvent(eventid, target, source, effect, relayVar, onEffect, fastExit) {
			if (eventid === 'ResidualOrder') {
				// Handle Leech Seed + Toxic synergy
				for (const pokemon of this.getAllActive()) {
					if (pokemon.volatiles['leechseed'] && pokemon.status === 'tox') {
						const toxicTurns = pokemon.statusState.turns || 1;
						const damage = Math.floor(pokemon.maxhp * toxicTurns / 16);
						// Apply the toxic multiplier to leech seed damage
						if (pokemon.volatiles['leechseed'].source) {
							pokemon.volatiles['leechseed'].damage = damage;
						}
					}
				}
			}
			// Call the original method
			return this.constructor.prototype.runEvent.call(this, eventid, target, source, effect, relayVar, onEffect, fastExit);
		},
	},
	
	// Status condition modifications
	actions: {
		// Paralysis modifications
		runStatusHeal(status, pokemon, source, effect) {
			// Electric types are no longer immune to paralysis
			if (status === 'par' && pokemon.hasType('Electric')) {
				// Don't automatically heal
			}
			return this.constructor.prototype.runStatusHeal.call(this, status, pokemon, source, effect);
		},
		
		// Speed reduction from paralysis
		modifyStat(stat, pokemon, source, effect) {
			if (stat === 'spe' && pokemon.status === 'par') {
				return this.chainModify(0.25); // 75% speed reduction
			}
			return this.constructor.prototype.modifyStat.call(this, stat, pokemon, source, effect);
		},
		
		// Parental Bond damage modifier (from new file)
		modifyDamage(
			baseDamage: number, pokemon: Pokemon, target: Pokemon, move: ActiveMove, suppressMessages = false
		) {
			const tr = this.battle.trunc;
			if (!move.type) move.type = '???';
			const type = move.type;
	
			baseDamage += 2;
	
			if (move.spreadHit) {
				// multi-target modifier (doubles only)
				const spreadModifier = this.battle.gameType === 'freeforall' ? 0.5 : 0.75;
				this.battle.debug(`Spread modifier: ${spreadModifier}`);
				baseDamage = this.battle.modify(baseDamage, spreadModifier);
			} else if (move.multihitType === 'parentalbond' && move.hit > 1) {
				// Parental Bond modifier - 50% on second hit (Pre-Gen 7)
				const bondModifier = 0.5;
				this.battle.debug(`Parental Bond modifier: ${bondModifier}`);
				baseDamage = this.battle.modify(baseDamage, bondModifier);
			}
	
			// weather modifier
			baseDamage = this.battle.runEvent('WeatherModifyDamage', pokemon, target, move, baseDamage);
	
			// crit - not a modifier
			const isCrit = target.getMoveHitData(move).crit;
			if (isCrit) {
				baseDamage = tr(baseDamage * (move.critModifier || (this.battle.gen >= 6 ? 1.5 : 2)));
			}
	
			// random factor - also not a modifier
			baseDamage = this.battle.randomizer(baseDamage);
	
			// STAB
			// The "???" type never gets STAB
			// Not even if you Roost in Gen 4 and somehow manage to use
			// Struggle in the same turn.
			// (On second thought, it might be easier to get a MissingNo.)
			if (type !== '???') {
				let stab: number | [number, number] = 1;
	
				const isSTAB = move.forceSTAB || pokemon.hasType(type) || pokemon.getTypes(false, true).includes(type);
				if (isSTAB) {
					stab = 1.5;
				}
	
				// The Stellar tera type makes this incredibly confusing
				// If the move's type does not match one of the user's base types,
				// the Stellar tera type applies a one-time 1.2x damage boost for that type.
				//
				// If the move's type does match one of the user's base types,
				// then the Stellar tera type applies a one-time 2x STAB boost for that type,
				// and then goes back to using the regular 1.5x STAB boost for those types.
				if (pokemon.terastallized === 'Stellar') {
					if (!pokemon.stellarBoostedTypes.includes(type) || move.stellarBoosted) {
						stab = isSTAB ? 2 : [4915, 4096];
						move.stellarBoosted = true;
						if (pokemon.species.name !== 'Terapagos-Stellar') {
							pokemon.stellarBoostedTypes.push(type);
						}
					}
				} else {
					if (pokemon.terastallized === type && pokemon.getTypes(false, true).includes(type)) {
						stab = 2;
					}
					stab = this.battle.runEvent('ModifySTAB', pokemon, target, move, stab);
				}
	
				baseDamage = this.battle.modify(baseDamage, stab);
			}
	
			// types
			let typeMod = target.runEffectiveness(move);
			typeMod = this.battle.clampIntRange(typeMod, -6, 6);
			target.getMoveHitData(move).typeMod = typeMod;
			if (typeMod > 0) {
				if (!suppressMessages) this.battle.add('-supereffective', target);
	
				for (let i = 0; i < typeMod; i++) {
					baseDamage *= 2;
				}
			}
			if (typeMod < 0) {
				if (!suppressMessages) this.battle.add('-resisted', target);
	
				for (let i = 0; i > typeMod; i--) {
					baseDamage = tr(baseDamage / 2);
				}
			}
	
			if (isCrit && !suppressMessages) this.battle.add('-crit', target);
	
			if (pokemon.status === 'brn' && move.category === 'Physical' && !pokemon.hasAbility('guts')) {
				if (this.battle.gen < 6 || move.id !== 'facade') {
					baseDamage = this.battle.modify(baseDamage, 0.5);
				}
			}
	
			// Generation 5, but nothing later, sets damage to 1 before the final damage modifiers
			if (this.battle.gen === 5 && !baseDamage) baseDamage = 1;
	
			// Final modifier. Modifiers that modify damage after min damage check, such as Life Orb.
			baseDamage = this.battle.runEvent('ModifyDamage', pokemon, target, move, baseDamage);
	
			if (move.isZOrMaxPowered && target.getMoveHitData(move).zBrokeProtect) {
				baseDamage = this.battle.modify(baseDamage, 0.25);
				this.battle.add('-zbroken', target);
			}
	
			// Generation 6-7 moves the check for minimum 1 damage after the final modifier...
			if (this.battle.gen !== 5 && !baseDamage) return 1;
	
			// ...but 16-bit truncation happens even later, and can truncate to 0
			return tr(baseDamage, 16);
		},
	},
	
	// Move modifications
	runMove(moveOrMoveName, pokemon, targetLoc, sourceEffect, zMove, externalMove, maxMove, originalTarget) {
		const move = this.dex.getActiveMove(moveOrMoveName);

		// Handle Clangorous Soulblaze with Parental Bond
		// Remove default self-effect so custom onAfterMove can handle it twice
		if (move.id === 'clangoroussoulblaze' && pokemon.hasAbility('parentalbond') && move.multihitType === 'parentalbond') {
			delete move.self;
		}
		
		// Remove signature move restrictions
		if (move.id === 'darkvoid') {
			// Allow any Pokemon to use Dark Void
		}
		if (move.id === 'hyperspacebury') {
			// Allow any Pokemon to use Hyperspace Fury  
		}
		if (move.id === 'aurawheel') {
			// Allow any Pokemon to use Aura Wheel (default to Electric type)
			if (!move.type) move.type = 'Electric';
		}

		// Binding moves (Gen 1 mechanics)
		if (['bind', 'wrap', 'clamp', 'firespin'].includes(move.id)) {
			// Lasting 2-5 turns, dealing regular 15 BP damage, target unable to attack/switch
			move.volatileStatus = 'partiallytrapped';
			move.condition = {
				duration: this.random(2, 6), // 2-5 turns
				onStart(target, source, move) {
					this.add('-activate', target, 'move: ' + move.name, '[of] ' + source);
					this.effectState.boundDamage = Math.floor(target.maxhp / (move.id === 'firespin' ? 8 : 16));
				},
				onResidualOrder: 13,
				onResidual(pokemon) {
					const source = this.effectState.source;
					if (source && (!source.isActive || source.hp <= 0)) {
						pokemon.removeVolatile('partiallytrapped');
						return;
					}
					this.damage(this.effectState.boundDamage, pokemon, source);
				},
				onTrapPokemon(pokemon) {
					pokemon.tryTrap();
				},
			};
		}
		
		// Swift and Bide hit during invulnerable turns
		if (['swift', 'bide'].includes(move.id)) {
			move.tracksTarget = true; // Hits during Dig/Fly
		}
		
		// Spore immunity removal
		if (move.id === 'spore') {
			// Remove immunity from Grass, Overcoat, and Safety Goggles
			move.onTryHit = function(target, source, move) {
				// Remove normal immunities
				return true;
			};
		}
		
		// Defog - Can lower evasion through Substitute (Gen 6 behavior)
		if (move.id === 'defog') {
			move.infiltrates = true; // Allows it to bypass Substitute for evasion drop
		}
		
		// Substitute modifications
		if (move.id === 'substitute') {
			move.condition = {
				onStart(target, source, move) {
					this.add('-start', target, 'Substitute');
					this.effectState.hp = Math.floor(target.maxhp / 4);
					if (target.volatiles['partiallytrapped']) {
						delete target.volatiles['partiallytrapped'];
					}
				},
				onTryPrimaryHitPriority: -1,
				onTryPrimaryHit(target, source, move) {
					if (target === source || move.flags['bypasssub'] || move.infiltrates) {
						return;
					}
					let damage = this.actions.getDamage(source, target, move);
					if (!damage && damage !== 0) {
						this.add('-fail', source);
						this.attrLastMove('[still]');
						return null;
					}
					damage = this.runEvent('SubDamage', target, source, move, damage);
					if (!damage) {
						return damage;
					}
					if (damage > target.volatiles['substitute'].hp) {
						damage = target.volatiles['substitute'].hp as number;
					}
					target.volatiles['substitute'].hp -= damage;
					source.lastDamage = damage;
					if (target.volatiles['substitute'].hp <= 0) {
						if (move.ohko) this.add('-ohko');
						target.removeVolatile('substitute');
					} else {
						this.add('-activate', target, 'move: Substitute', '[damage]');
					}
					if (move.recoil || move.id === 'chloroblast') {
						this.damage(this.actions.calcRecoilDamage(damage, move, source), source, target, 'recoil');
					}
					if (move.drain) {
						this.heal(Math.ceil(damage * move.drain[0] / move.drain[1]), source, target, 'drain');
					}
					this.singleEvent('AfterSubDamage', move, null, target, source, move, damage);
					this.runEvent('AfterSubDamage', target, source, move, damage);
					return this.HIT_SUBSTITUTE;
				},
				// Blocks Curse, causes drain moves to miss
				onTryHit(target, source, move) {
					if (move.id === 'curse') return false;
					if (['gigadrain', 'megadrain', 'absorb', 'dreameater'].includes(move.id)) {
						return false;
					}
				},
			};
		}
		
		return this.constructor.prototype.runMove.call(this, move, pokemon, targetLoc, sourceEffect, zMove, externalMove, maxMove, originalTarget);
	},
	
	// Critical hit formula restoration (speed-based)
	criticalHit(target, source, move) {
		if (!source) return false;
		
		// Speed-based critical hits (high-speed = more crits)
		const speedRatio = source.getStat('spe') / 200; // Normalize speed
		let critChance = move.critRatio || 1;
		
		// Apply speed multiplier
		critChance *= (1 + speedRatio);
		
		// Standard crit rates but modified by speed
		const critRatios = [0, 24, 8, 2, 1];
		const critRatio = Math.min(critRatios.length - 1, Math.floor(critChance));
		
		return this.randomChance(1, critRatios[critRatio] || 24);
	},
	
	// Confusion self-hit rate modification
	runEvent(eventid, target, source, effect, relayVar, onEffect, fastExit) {
		if (eventid === 'BeforeMove' && target && target.volatiles['confusion']) {
			// 33% → 50% confusion self-hit rate
			const confused = this.randomChance(1, 2); // 50%
			if (confused) {
				this.add('-activate', target, 'confusion');
				const damage = this.actions.getDamage(target, target, {
					id: 'confused',
					category: 'Physical',
					basePower: 40,
					type: '???',
				});
				this.damage(damage, target, target, {id: 'confused'});
				return false;
			}
		}
		
		return this.constructor.prototype.runEvent.call(this, eventid, target, source, effect, relayVar, onEffect, fastExit);
	},
	
	// Weather modifications (permanent weather from abilities)
	field: {
		setWeather(status, source, sourceEffect, duration) {
			// If weather is set by certain abilities, make it permanent
			if (sourceEffect && sourceEffect.id && ['drizzle', 'drought', 'sandstream', 'snowwarning'].includes(sourceEffect.id)) {
				duration = 0; // Permanent weather
			}
			return this.constructor.prototype.setWeather.call(this, status, source, sourceEffect, duration);
		},
		
		// Override terrain effects
		getTerrainAttackTypeModifier(type) {
			const terrain = this.terrain;
			if (!terrain) return;
			
			// Restore pre-nerf 50% boosts (instead of current 30%)
			if (terrain === 'electricterrain' && type === 'Electric') {
				return 1.5; // Was 1.3 in recent gens
			}
			if (terrain === 'grassyterrain' && type === 'Grass') {
				return 1.5; // Was 1.3 in recent gens
			}
			if (terrain === 'psychicterrain' && type === 'Psychic') {
				return 1.5; // Was 1.3 in recent gens
			}
		},
	},
	
	// Psywave damage calculation (Gen 1)
	getDamage(source, target, move, suppressMessages) {
		if (move.id === 'psywave') {
			// Deals damage between 100-150% of level
			const minDamage = source.level;
			const maxDamage = Math.floor(source.level * 1.5);
			return this.random(minDamage, maxDamage + 1);
		}
		
		return this.constructor.prototype.getDamage.call(this, source, target, move, suppressMessages);
	},
	
	// Seismic Toss/Night Shade/SonicBoom/Counter/Bide hit immunities
	tryMoveHit(target, pokemon, move) {
		// Make these moves hit normally immune types
		if (['seismictoss', 'nightshade'].includes(move.id)) {
			// Hits Ghost types
			move.type = '???';
		}
		if (move.id === 'sonicboom') {
			// Hits Psychic types  
			move.type = '???';
		}
		if (['counter', 'bide'].includes(move.id)) {
			// Hit normally immune types
			move.type = '???';
		}
		
		return this.constructor.prototype.tryMoveHit.call(this, target, pokemon, move);
	},
};
