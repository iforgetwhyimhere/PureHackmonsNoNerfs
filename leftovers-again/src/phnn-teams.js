'use strict';
/**
 * Clean, server-validated teams for "[Gen 9] Pure Hackmons No Nerfs" (gen9purehackmonsnonerfs).
 *
 * FORMAT RULES (important - the bot's team parser splits Pokemon on BLANK LINES):
 *   - Separate every Pokemon with exactly ONE blank line.
 *   - Each Pokemon may have AT MOST 4 moves (the parser rejects the whole team otherwise).
 *   - Keep the standard Showdown export format (Species @ Item / Ability: / EVs: / Nature / - move).
 *
 * Verify after editing:  node verify-teams.js
 */
module.exports = [
	// Team 1: Paradox Hyper Offense
	`Koraidon @ Life Orb
Ability: Orichalcum Pulse
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Collision Course
- Flare Blitz
- Close Combat
- Swords Dance

Miraidon @ Choice Specs
Ability: Hadron Engine
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Electro Drift
- Draco Meteor
- Volt Switch
- Overheat

Flutter Mane @ Booster Energy
Ability: Protosynthesis
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Moonblast
- Shadow Ball
- Mystical Fire
- Calm Mind

Chien-Pao @ Heavy-Duty Boots
Ability: Sword of Ruin
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Icicle Crash
- Crunch
- Sacred Sword
- Swords Dance

Iron Valiant @ Booster Energy
Ability: Quark Drive
EVs: 252 Atk / 4 SpD / 252 Spe
Naive Nature
- Moonblast
- Close Combat
- Knock Off
- Encore

Roaring Moon @ Booster Energy
Ability: Protosynthesis
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Dragon Dance
- Acrobatics
- Knock Off
- Earthquake`,

	// Team 2: Box Legendaries
	`Mewtwo @ Life Orb
Ability: Unnerve
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Psystrike
- Aura Sphere
- Ice Beam
- Nasty Plot

Rayquaza @ Life Orb
Ability: Air Lock
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Dragon Ascent
- Earthquake
- Extreme Speed
- Dragon Dance

Kyogre @ Choice Scarf
Ability: Drizzle
EVs: 252 SpA / 4 SpD / 252 Spe
Modest Nature
- Water Spout
- Origin Pulse
- Thunder
- Ice Beam

Groudon @ Leftovers
Ability: Drought
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Precipice Blades
- Stone Edge
- Swords Dance
- Heat Crash

Giratina @ Leftovers
Ability: Levitate
EVs: 252 HP / 252 Atk / 4 SpD
Adamant Nature
- Shadow Force
- Dragon Tail
- Earthquake
- Will-O-Wisp

Dialga @ Leftovers
Ability: Pressure
EVs: 252 HP / 252 SpA / 4 SpD
Modest Nature
- Draco Meteor
- Flash Cannon
- Thunder
- Calm Mind`,

	// Team 3: Weather Abuse
	`Torkoal @ Heat Rock
Ability: Drought
EVs: 252 HP / 252 SpA / 4 SpD
Quiet Nature
- Eruption
- Fire Blast
- Solar Beam
- Earth Power

Walking Wake @ Choice Specs
Ability: Protosynthesis
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Hydro Steam
- Draco Meteor
- Flamethrower
- Flip Turn

Gouging Fire @ Booster Energy
Ability: Protosynthesis
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Raging Fury
- Earthquake
- Dragon Dance
- Morning Sun

Raging Bolt @ Booster Energy
Ability: Protosynthesis
EVs: 252 HP / 252 SpA / 4 Spe
Modest Nature
- Thunderclap
- Draco Meteor
- Thunderbolt
- Calm Mind

Great Tusk @ Heavy-Duty Boots
Ability: Protosynthesis
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Headlong Rush
- Close Combat
- Rapid Spin
- Bulk Up

Koraidon @ Clear Amulet
Ability: Orichalcum Pulse
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Flare Blitz
- Collision Course
- Drain Punch
- Bulk Up`,

	// Team 4: Treasures of Ruin
	`Chi-Yu @ Choice Specs
Ability: Beads of Ruin
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Overheat
- Dark Pulse
- Flamethrower
- Psychic

Ting-Lu @ Leftovers
Ability: Vessel of Ruin
EVs: 252 HP / 252 Def / 4 SpD
Impish Nature
- Earthquake
- Stealth Rock
- Whirlwind
- Spikes

Wo-Chien @ Leftovers
Ability: Tablets of Ruin
EVs: 252 HP / 4 Def / 252 SpD
Calm Nature
- Giga Drain
- Foul Play
- Leech Seed
- Protect

Chien-Pao @ Focus Sash
Ability: Sword of Ruin
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Icicle Crash
- Crunch
- Sacred Sword
- Ice Shard

Kingambit @ Leftovers
Ability: Supreme Overlord
EVs: 252 Atk / 4 SpD / 252 Spe
Adamant Nature
- Kowtow Cleave
- Iron Head
- Sucker Punch
- Swords Dance

Gholdengo @ Air Balloon
Ability: Good as Gold
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Make It Rain
- Shadow Ball
- Thunderbolt
- Nasty Plot`,

	// Team 5: Calyrex Cores
	`Calyrex-Shadow @ Life Orb
Ability: As One (Spectrier)
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Astral Barrage
- Psyshock
- Draining Kiss
- Nasty Plot

Calyrex-Ice @ Leftovers
Ability: As One (Glastrier)
EVs: 252 HP / 252 Atk / 4 SpD
Adamant Nature
- Glacial Lance
- High Horsepower
- Trick Room
- Swords Dance

Zacian @ Leftovers
Ability: Intrepid Sword
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Behemoth Blade
- Play Rough
- Close Combat
- Swords Dance

Zamazenta @ Leftovers
Ability: Dauntless Shield
EVs: 252 HP / 4 Atk / 252 Spe
Jolly Nature
- Behemoth Bash
- Body Press
- Crunch
- Iron Defense

Ho-Oh @ Heavy-Duty Boots
Ability: Regenerator
EVs: 252 HP / 252 Atk / 4 SpD
Adamant Nature
- Sacred Fire
- Brave Bird
- Earthquake
- Recover

Lugia @ Heavy-Duty Boots
Ability: Multiscale
EVs: 252 HP / 4 Atk / 252 Def
Bold Nature
- Aeroblast
- Earthquake
- Toxic
- Roost`,

	// Team 6: Dragon Showcase
	`Koraidon @ Life Orb
Ability: Orichalcum Pulse
EVs: 252 Atk / 4 SpD / 252 Spe
Adamant Nature
- Collision Course
- Flare Blitz
- Outrage
- Swords Dance

Dragonite @ Heavy-Duty Boots
Ability: Multiscale
EVs: 252 Atk / 4 SpD / 252 Spe
Adamant Nature
- Dragon Dance
- Outrage
- Earthquake
- Extreme Speed

Garchomp @ Rocky Helmet
Ability: Rough Skin
EVs: 252 HP / 4 Atk / 252 Def
Impish Nature
- Earthquake
- Dragon Tail
- Stealth Rock
- Spikes

Baxcalibur @ Loaded Dice
Ability: Thermal Exchange
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Icicle Spear
- Glaive Rush
- Earthquake
- Dragon Dance

Palkia @ Choice Specs
Ability: Pressure
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Hydro Pump
- Draco Meteor
- Fire Blast
- Thunder

Reshiram @ Choice Scarf
Ability: Turboblaze
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Blue Flare
- Draco Meteor
- Earth Power
- Flamethrower`,
];
