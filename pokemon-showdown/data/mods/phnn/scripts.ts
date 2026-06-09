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

		// Gen 8 Dynamax support for PHNN, gated by the transformation priority:
		//   Ultra Burst / Mega Evolution  >  Dynamax (Stellar Tera type)  >  Terastallization (other types)
		// Dynamax and Terastallization are mutually exclusive per Pokemon, and the player picks between
		// them through the Tera type: choosing the Stellar Tera type is the signal to Dynamax instead of
		// Terastallizing. Every other Tera type Terastallizes as normal, so same-type Tera works again
		// (e.g. Groudon can Tera into Ground). Terapagos is the lone exception: it keeps its natural
		// Stellar Terastallization and therefore can never Dynamax. The actual Max-move list is built by
		// the base implementation (called with skipChecks=true); we only customize the eligibility gate.
		getDynamaxRequest(skipChecks?: boolean) {
			if (!skipChecks) {
				if (!this.side.canDynamaxNow()) return;
				// Mega Evolution and Ultra Burst take priority over Dynamax.
				if (
					this.species.isMega || this.species.isPrimal || this.species.forme === 'Ultra' ||
					this.getItem().zMove || this.canMegaEvo || this.canUltraBurst
				) {
					return;
				}
				// Only a Stellar Tera type Dynamaxes; any other Tera type Terastallizes instead (see
				// canTerastallize for the matching gate). Terapagos keeps its Stellar Tera, so it is
				// excluded here and can never Dynamax.
				if (this.set.teraType !== 'Stellar' || this.species.baseSpecies === 'Terapagos') return;
				// No Nerfs: the base game's `cannotDynamax` species restriction is intentionally ignored,
				// so even box legendaries (Zacian, Eternatus, etc.) may Dynamax here.
			}
			return Object.getPrototypeOf(this).getDynamaxRequest.call(this, true);
		},
	},

	side: {
		// PHNN enables Dynamax in this Gen 9 mod. Mirror the base check but drop the `gen === 8` guard.
		// `dynamaxUsed` starts false for phnn (see sim/side.ts) and is set true once a side Dynamaxes,
		// which preserves the standard "once per battle" rule. In multi battles teammates alternate turns.
		canDynamaxNow(this: Side) {
			if (this.battle.gameType === 'multi' && this.battle.turn % 2 !== [1, 1, 0, 0][this.n]) return false;
			return !this.dynamaxUsed;
		},
	},

	actions: {
		// Terastallization is offered for every Tera type EXCEPT Stellar, which is reserved as the
		// Dynamax signal (see getDynamaxRequest above) — this keeps Tera and Dynamax mutually exclusive
		// per Pokemon while letting a Pokemon Tera into its own primary type again. Terapagos is the lone
		// exception: it keeps its natural Stellar Terastallization instead of Dynamaxing. Ultra Burst and
		// Mega Evolution still take priority over Terastallization.
		canTerastallize(pokemon: Pokemon) {
			if (pokemon.getItem().zMove || pokemon.canMegaEvo || pokemon.canUltraBurst) return null;
			if (pokemon.set.teraType === 'Stellar' && pokemon.species.baseSpecies !== 'Terapagos') return null;
			return pokemon.teraType;
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

			if (move.isZOrMaxPowered && target.getMoveHitData(move).bypassProtect) {
				baseDamage = this.battle.modify(baseDamage, 0.25);
				this.battle.add('-zbroken', target);
			}

			// Generation 6-7 moves the check for minimum 1 damage after the final modifier...
			if (this.battle.gen !== 5 && !baseDamage) return 1;

			// ...but 16-bit truncation happens even later, and can truncate to 0
			return tr(baseDamage, 16);
		},

		// Move modifications (runMove lives on BattleActions; delegate to the base via the prototype)
		runMove(this: BattleActions, moveOrMoveName: Move | string, pokemon: Pokemon, targetLoc: number, options?: {
			sourceEffect?: Effect | null, zMove?: string, externalMove?: boolean, maxMove?: string, originalTarget?: Pokemon,
		}) {
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
					duration: this.battle.random(2, 6), // 2-5 turns
					onStart(this: Battle, target: Pokemon, source: Pokemon, move: Effect) {
						this.add('-activate', target, `move: ${move.name}`, `[of] ${source}`);
						this.effectState.boundDamage = Math.floor(target.maxhp / (move.id === 'firespin' ? 8 : 16));
					},
					onResidualOrder: 13,
					onResidual(this: Battle, pokemon: Pokemon) {
						const source = this.effectState.source;
						if (source && (!source.isActive || source.hp <= 0)) {
							pokemon.removeVolatile('partiallytrapped');
							return;
						}
						this.damage(this.effectState.boundDamage, pokemon, source);
					},
					onTrapPokemon(this: Battle, pokemon: Pokemon) {
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
				move.onTryHit = function (this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
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
					onStart(this: Battle, target: Pokemon, source: Pokemon, move: Effect) {
						this.add('-start', target, 'Substitute');
						this.effectState.hp = Math.floor(target.maxhp / 4);
						if (target.volatiles['partiallytrapped']) {
							delete target.volatiles['partiallytrapped'];
						}
					},
					onTryPrimaryHitPriority: -1,
					onTryPrimaryHit(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
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
					onTryHit(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
						if (move.id === 'curse') return false;
						if (['gigadrain', 'megadrain', 'absorb', 'dreameater'].includes(move.id)) {
							return false;
						}
					},
				};
			}

			return Object.getPrototypeOf(this).runMove.call(this, move, pokemon, targetLoc, options);
		},

		// Psywave damage calculation (Gen 1)
		getDamage(this: BattleActions, source: Pokemon, target: Pokemon, move: string | number | ActiveMove, suppressMessages = false) {
			if (typeof move !== 'string' && typeof move !== 'number' && move.id === 'psywave') {
				// Deals damage between 100-150% of level
				const minDamage = source.level;
				const maxDamage = Math.floor(source.level * 1.5);
				return this.battle.random(minDamage, maxDamage + 1);
			}

			return Object.getPrototypeOf(this).getDamage.call(this, source, target, move, suppressMessages);
		},

		// Seismic Toss/Night Shade/SonicBoom/Counter/Bide hit immunities
		tryMoveHit(this: BattleActions, target: Pokemon, pokemon: Pokemon, move: ActiveMove) {
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

			return Object.getPrototypeOf(this).tryMoveHit.call(this, target, pokemon, move);
		},
	},
};
