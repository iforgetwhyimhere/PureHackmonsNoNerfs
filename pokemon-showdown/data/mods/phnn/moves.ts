export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	// Power Changes
    nihillight: {
		inherit: true,
		basePower: 200, // 100 → 200 (corrected to match Bulbapedia)
        ignoreImmunity: { 'Dragon': true }
	},
	surf: {
		inherit: true,
		basePower: 95, // 90 → 95
		target: "allAdjacentFoes", // Hits all adjacent opponents, not teammates
	},
	thunderbolt: {
		inherit: true,
		basePower: 95, // 90 → 95
	},
	flamethrower: {
		inherit: true,
		basePower: 95, // 90 → 95
	},
	icebeam: {
		inherit: true,
		basePower: 95, // 90 → 95
	},
	psychic: {
		inherit: true,
		basePower: 90,
		secondary: {
			chance: 33.2,
			boosts: {
				spa: -1,
				spd: -1,
			},
		}, // 33.2% chance to lower Special Attack AND Special Defense
	},
	muddywater: {
		inherit: true,
		basePower: 95, // 90 → 95
	},
	blizzard: {
		inherit: true,
		basePower: 120, // 110 → 120
		accuracy: 90, // Accuracy nerf reversed
		secondary: {
			chance: 30,
			status: 'frz',
		}, // 30% chance to freeze
	},
	hydropump: {
		inherit: true,
		basePower: 120, // 110 → 120
	},
	thunder: {
		inherit: true,
		basePower: 120, // 110 → 120
	},
	fireblast: {
		inherit: true,
		basePower: 120, // 110 → 120
		secondary: {
			chance: 30,
			status: 'brn',
		}, // 30% chance to burn
	},
	hurricane: {
		inherit: true,
		basePower: 120, // 110 → 120
	},
	dracometeor: {
		inherit: true,
		basePower: 140, // 130 → 140
	},
	leafstorm: {
		inherit: true,
		basePower: 140, // 130 → 140
	},
	overheat: {
		inherit: true,
		basePower: 140, // 130 → 140
	},
	skyattack: {
		inherit: true,
		basePower: 200,
	},
	solarbeam: {
		inherit: true,
		basePower: 200,
	},
	magmastorm: {
		inherit: true,
		basePower: 120,
	},
	glaciallance: {
		inherit: true,
		basePower: 130, // 120 → 130
	},
	dig: {
		inherit: true,
		basePower: 100,
	},
	heatwave: {
		inherit: true,
		basePower: 100,
	},
	meteormash: {
		inherit: true,
		basePower: 100,
	},
	aurasphere: {
		inherit: true,
		basePower: 90,
	},
	dragonpulse: {
		inherit: true,
		basePower: 90,
	},
	suckerpunch: {
		inherit: true,
		basePower: 80,
	},
	wickedblow: {
		inherit: true,
		basePower: 80,
	},
	megadrain: {
		inherit: true,
		basePower: 75,
	},
	grassyglide: {
		inherit: true,
		basePower: 70,
	},
	tackle: {
		inherit: true,
		basePower: 50,
	},
	feint: {
		inherit: true,
		basePower: 50,
	},
	absorb: {
		inherit: true,
		basePower: 40,
	},
	
	// Accuracy Nerfs Reversed
	hypnosis: {
		inherit: true,
		accuracy: 70, // Reversed nerf
	},
	darkvoid: {
		inherit: true,
		accuracy: 80, // Reversed nerf
		// Remove species restriction - handled in onTryMove
	},
	swagger: {
		inherit: true,
		accuracy: 90, // Reversed nerf
	},
	willowisp: {
		inherit: true,
		accuracy: 100, // Reversed nerf
	},
	thunderwave: {
		inherit: true,
		accuracy: 100, // Reversed nerf
	},
	bide: {
		inherit: true,
		accuracy: true, // Never misses
	},
	memento: {
		inherit: true,
		accuracy: true, // Never misses
	},
	nightmare: {
		inherit: true,
		accuracy: true, // Never misses
	},
	
	// PP Restorations
	acidarmor: {
		inherit: true,
		pp: 40,
	},
	covet: {
		inherit: true,
		pp: 40,
	},
	growth: {
		inherit: true,
		pp: 40,
	},
	barrier: {
		inherit: true,
		pp: 30,
	},
	extrasensory: {
		inherit: true,
		pp: 30,
	},
	swordsdance: {
		inherit: true,
		pp: 30,
	},
	tailwind: {
		inherit: true,
		pp: 30,
	},
	jumpkick: {
		inherit: true,
		pp: 25,
	},
	submission: {
		inherit: true,
		pp: 25,
	},
	recover: {
		inherit: true,
		pp: 20,
	},
	hijumpkick: {
		inherit: true,
		pp: 20,
	},
	petaldance: {
		inherit: true,
		pp: 20,
	},
	thrash: {
		inherit: true,
		pp: 20,
	},
	airslash: {
		inherit: true,
		pp: 20,
	},
	minimize: {
		inherit: true,
		pp: 20,
	},
	sacredsword: {
		inherit: true,
		pp: 20,
	},
	futuresight: {
		inherit: true,
		pp: 15,
	},
	outrage: {
		inherit: true,
		pp: 15,
	},
	synchronoise: {
		inherit: true,
		pp: 15,
	},
	barbbarrage: {
		inherit: true,
		pp: 15,
	},
	bittermalice: {
		inherit: true,
		pp: 15,
	},
	triplearrows: {
		inherit: true,
		pp: 15,
	},
	lunarblessing: {
		inherit: true,
		pp: 10,
		boosts: {
			evasion: 1,
		}, // Increases evasion
	},
	milkdrink: {
		inherit: true,
		pp: 10,
	},
	rest: {
		inherit: true,
		pp: 10,
	},
	roost: {
		inherit: true,
		pp: 10,
	},
	shoreup: {
		inherit: true,
		pp: 10,
	},
	slackoff: {
		inherit: true,
		pp: 10,
	},
	softboiled: {
		inherit: true,
		pp: 10,
	},
	
	// Additional Effect Changes
	sludge: {
		inherit: true,
		secondary: {
			chance: 40,
			status: 'psn',
		}, // 40% chance to poison
	},
	acid: {
		inherit: true,
		secondary: {
			chance: 33.2,
			boosts: {
				def: -1,
			},
		}, // 33.2% chance to lower Defense
	},
	aurorabeam: {
		inherit: true,
		secondary: {
			chance: 33.2,
			boosts: {
				atk: -1,
			},
		}, // 33.2% chance to lower Attack
	},
	bubble: {
		inherit: true,
		secondary: {
			chance: 33.2,
			boosts: {
				spe: -1,
			},
		}, // 33.2% chance to lower Speed
	},
	bubblebeam: {
		inherit: true,
		secondary: {
			chance: 33.2,
			boosts: {
				spe: -1,
			},
		}, // 33.2% chance to lower Speed
	},
	constrict: {
		inherit: true,
		secondary: {
			chance: 33.2,
			boosts: {
				spe: -1,
			},
		}, // 33.2% chance to lower Speed
	},
	razorwind: {
		inherit: true,
		critRatio: 2, // Increased crit ratio
	},
	kingsshield: {
		inherit: true,
		condition: {
			duration: 1,
			onStart(target, source, move) {
				this.add('-singleturn', target, 'Protect');
			},
			onTryHitPriority: 3,
			onTryHit(target, source, move) {
				if (!move.flags['protect']) {
					if (['gmaxoneblow', 'gmaxrapidfire'].includes(move.id)) return;
					if (move.isZ || move.isMax) target.getMoveHitData(move).bypassProtect = true;
					return;
				}
				if (move.smartTarget) {
					move.smartTarget = false;
				} else {
					this.add('-activate', target, 'move: Protect');
				}
				const lockedmove = source.getVolatile('lockedmove');
				if (lockedmove) {
					// Outrage counter is reset
					if (source.volatiles['lockedmove'].duration === 2) {
						delete source.volatiles['lockedmove'];
					}
				}
				if (move.flags['contact']) {
					this.boost({atk: -2}, source, target, this.dex.getActiveMove("King's Shield")); // -2 Atk if attacker makes contact
				}
				return this.NOT_FAIL;
			},
			onHit(target, source, move) {
				if (move.isZOrMaxPowered && move.flags['contact']) {
					this.boost({atk: -2}, source, target, this.dex.getActiveMove("King's Shield"));
				}
			},
		},
	},
	amnesia: {
		inherit: true,
		boosts: {
			spa: 2,
			spd: 2,
		}, // Raises user's Special Defense AND Special Attack by two stages
	},
	doubleedge: {
		inherit: true,
		recoil: [1, 4], // Recoil ¼ damage instead of ⅓
	},
	firefang: {
		inherit: true,
		onEffectiveness(typeMod, target, type) {
			// Hits through Wonder Guard
			if (target?.hasAbility('wonderguard')) return 1;
		},
	},
	hyperbeam: {
		inherit: true,
		onAfterMove(pokemon, target, move) {
			if (target.fainted) return; // No recharge turn if target is KO'd
			pokemon.addVolatile('mustrecharge');
		},
	},
	sheercold: {
		inherit: true,
		onTryHit(target, source) {
			// Ice-types are no longer immune
			return this.randomChance(1, 1);
		},
	},
	superfang: {
	inherit: true,
	ignoreImmunity: {'Normal': true}, // Allows Super Fang to hit Ghost-types like in Gen 1
	},
	
	// Priority Changes
	roar: {
		inherit: true,
		priority: -1,
	},
	whirlwind: {
		inherit: true,
		priority: -1,
	},
	followme: {
		inherit: true,
		priority: 3,
	},
	ragepowder: {
		inherit: true,
		priority: 3,
	},
	
	// Restore Self-Destruct / Explosion mechanic
	selfdestruct: {
		inherit: true,
		// Damage calculated against the target's Special Defense (replaces removed `defensiveCategory`)
		overrideDefensiveStat: 'spd',
	},
	explosion: {
		inherit: true,
		// Damage calculated against the target's Special Defense (replaces removed `defensiveCategory`)
		overrideDefensiveStat: 'spd',
	},
	
	// Remove move restrictions - signature moves
	// These will be handled in the onTryMove function in scripts.ts
	
	// Hidden Power restoration
	hiddenpower: {
		inherit: true,
		basePower: 0,
		basePowerCallback(pokemon) {
			// Variable BP based on IVs (Gen 2-5 formula)
			const ivs = pokemon.set.ivs;
			const hpTypes = [
				'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel',
				'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark'
			];
			let hpIv = Math.floor(((ivs.atk % 2) + 2 * (ivs.def % 2) + 4 * (ivs.spe % 2) + 8 * (ivs.spa % 2) + 16 * (ivs.spd % 2) + 32 * (ivs.hp % 2)) * 15 / 63);
			return Math.floor(((Math.floor((ivs.atk % 4) / 2) + 2 * Math.floor((ivs.def % 4) / 2) + 4 * Math.floor((ivs.spe % 4) / 2) + 8 * Math.floor((ivs.spa % 4) / 2) + 16 * Math.floor((ivs.spd % 4) / 2) + 32 * Math.floor((ivs.hp % 4) / 2)) * 40 / 63) + 30);
		},
	},
	
	// Legends: Arceus Exclusive Moves
	ceaselessedge: {
		inherit: true,
		critRatio: 2, // High crit ratio
		// Damages target with Splinters handled in scripts
	},
	stoneaxe: {
		inherit: true,
		critRatio: 2, // High crit ratio
		// Damages target with Splinters handled in scripts
	},

clangoroussoulblaze: {
    inherit: true,
    onAfterMove(source, target, move) {
        // Special handling for Parental Bond - apply boosts on each hit
        if (source.hasAbility('parentalbond') && move.multihitType === 'parentalbond') {
            // Apply +1 to all stats on each hit (will happen twice total)
            this.boost({atk: 1, def: 1, spa: 1, spd: 1, spe: 1}, source, source, move);
        	}
    	},
	},

	// G-Max Moves - Fixed BP and ignore abilities
	gmaxdrumsolo: {
		inherit: true,
		basePower: 160,
		basePowerCallback(pokemon, target, move) {
			return 160; // Force 160 BP regardless of Max Move mechanics
		},
		pp: 5,
		ignoreAbility: true,
		isMax: false, // Don't treat as Max Move for damage calculation
		onTryHit(target, source, move) {
			// Break through Protect/Detect/etc. but NOT Max Guard
			if (target.volatiles['protect'] || target.volatiles['detect'] ||
			    target.volatiles['kingsshield'] || target.volatiles['spikyshield'] ||
			    target.volatiles['banefulbunker'] || target.volatiles['obstruct']) {
				// These protection moves get broken through
				target.getMoveHitData(move).bypassProtect = true;
			}
			// Max Guard blocks completely (no special handling, just let it block)
		},
	},
	gmaxfireball: {
		inherit: true,
		basePower: 160,
		basePowerCallback(pokemon, target, move) {
			return 160; // Force 160 BP regardless of Max Move mechanics
		},
		pp: 5,
		ignoreAbility: true,
		isMax: false, // Don't treat as Max Move for damage calculation
		onTryHit(target, source, move) {
			// Break through Protect/Detect/etc. but NOT Max Guard
			if (target.volatiles['protect'] || target.volatiles['detect'] ||
			    target.volatiles['kingsshield'] || target.volatiles['spikyshield'] ||
			    target.volatiles['banefulbunker'] || target.volatiles['obstruct']) {
				// These protection moves get broken through
				target.getMoveHitData(move).bypassProtect = true;
			}
			// Max Guard blocks completely (no special handling, just let it block)
		},
	},
	gmaxhydrosnipe: {
		inherit: true,
		basePower: 160,
		basePowerCallback(pokemon, target, move) {
			return 160; // Force 160 BP regardless of Max Move mechanics
		},
		pp: 5,
		ignoreAbility: true,
		isMax: false, // Don't treat as Max Move for damage calculation
		onTryHit(target, source, move) {
			// Break through Protect/Detect/etc. but NOT Max Guard
			if (target.volatiles['protect'] || target.volatiles['detect'] ||
			    target.volatiles['kingsshield'] || target.volatiles['spikyshield'] ||
			    target.volatiles['banefulbunker'] || target.volatiles['obstruct']) {
				// These protection moves get broken through
				target.getMoveHitData(move).bypassProtect = true;
			}
			// Max Guard blocks completely (no special handling, just let it block)
		},
	},

	// Max Guard - Make it usable as a regular move
	maxguard: {
		inherit: true,
		isMax: false, // Don't treat as Max Move for PP/usage
		pp: 5, // Give it reasonable PP
	},

	// Pokemon Champions buffs (BP)
	anchorshot: {
		inherit: true,
		basePower: 90, // 80 → 90
	},
	appleacid: {
		inherit: true,
		basePower: 90, // 80 → 90
	},
	beakblast: {
		inherit: true,
		basePower: 120, // 100 → 120
	},
	bonerush: {
		inherit: true,
		basePower: 30, // 25 → 30
	},
	dragonhammer: {
		inherit: true,
		basePower: 100, // 90 → 100
	},
	firelash: {
		inherit: true,
		basePower: 90, // 80 → 90
	},
	firstimpression: {
		inherit: true,
		basePower: 100, // 90 → 100 (BP buff only; keep vanilla turn-1 selection rules)
	},
	geargrind: {
		inherit: true,
		basePower: 60,  // 50 → 60
		accuracy: 90,   // 85 → 90
	},
	gravapple: {
		inherit: true,
		basePower: 90, // 80 → 90
	},
	hyperdrill: {
		inherit: true,
		basePower: 120, // 100 → 120
	},
	infernalparade: {
		inherit: true,
		basePower: 65, // 60 → 65
	},
	mountaingale: {
		inherit: true,
		basePower: 120, // 100 → 120
	},
	nightdaze: {
		inherit: true,
		basePower: 90, // vanilla 85 → 90 (Champions buff)
	},
	psyshieldbash: {
		inherit: true,
		basePower: 90, // 70 → 90
	},
	revelationdance: {
		inherit: true,
		basePower: 100, // 90 → 100
	},
	snipeshot: {
		inherit: true,
		basePower: 85, // 80 → 85
	},
	spiritshackle: {
		inherit: true,
		basePower: 90, // 80 → 90
	},
	tripledive: {
		inherit: true,
		basePower: 35, // 30 → 35
	},
	tropkick: {
		inherit: true,
		basePower: 85, // 70 → 85
	},

	// Pokemon Champions buffs (accuracy)
	crabhammer: {
		inherit: true,
		accuracy: 95, // 90 → 95
	},
	syrupbomb: {
		inherit: true,
		accuracy: 90, // 85 → 90
	},

	// Pokemon Champions buffs (slicing flag → benefits from Sharpness)
	crushclaw: {
		inherit: true,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1 },
	},
	dragonclaw: {
		inherit: true,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1 },
	},
	metalclaw: {
		inherit: true,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1 },
	},
	shadowclaw: {
		inherit: true,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1 },
	},
	direclaw: {
		// Flag-only buff; vanilla 50% status chance preserved
		inherit: true,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1 },
	},

	// Pokemon Champions buffs (misc)
	toxicthread: {
		inherit: true,
		boosts: {
			spe: -2, // -1 → -2
		},
		shortDesc: "100% chance to poison and lower the target's Speed by 2.",
		desc: "This move does not deal damage. Has a 100% chance to poison the target and lower its Speed stat by 2 stages.",
	},

	// Let's Go Partner Eevee Moves
	bouncybubble: {
		inherit: true,
		basePower: 90,
	},
	buzzybuzz: {
		inherit: true,
		basePower: 90,
	},
	sizzlyslide: {
		inherit: true,
		basePower: 90,
	},
	glitzyglow: {
		inherit: true,
		basePower: 90,
	},
	baddybad: {
		inherit: true,
		basePower: 90,
	},
	sappyseed: {
		inherit: true,
		basePower: 100,
		accuracy: 100,
	},
	freezyfrost: {
		inherit: true,
		basePower: 100,
		accuracy: 100,
	},
	sparklyswirl: {
		inherit: true,
		basePower: 120,
		accuracy: 100,
	},
};
