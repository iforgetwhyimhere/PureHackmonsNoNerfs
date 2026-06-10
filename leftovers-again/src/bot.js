/**
 * Multi-Format Bot with Random Team Selection
 * Supports multiple formats with complete 6v6 teams
 */
const { MOVE, SWITCH } = require('@la/decisions');
const PHNN_TEAMS = require('./phnn-teams.js');
const multibattle = require('./multibattle');

class MultiFormatBot {
  constructor() {
    this.meta = {
      accepts: 'ALL', // Accept all formats
      format: null,
      version: '2.0',
      nickname: process.env.BOT_NICKNAME || 'MultiBot',
    };
    
    // Store complete 6-Pokemon teams organized by format
    this.teamsByFormat = {
      // ============================================
      // PURE HACKMONS NO NERFS - 10 TEAMS
      // ============================================
      'gen9purehackmonsnonerfs': PHNN_TEAMS,

      // ============================================
      // GEN 9 OU - 3 TEAMS
      // ============================================
      'gen9ou': [
        `Kingambit @ Black Glasses
Ability: Supreme Overlord
EVs: 252 HP / 252 Atk / 4 SpD
Adamant Nature
- Swords Dance
- Sucker Punch
- Kowtow Cleave
- Iron Head

Great Tusk @ Leftovers
Ability: Protosynthesis
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Earthquake
- Ice Spinner
- Rapid Spin
- Stealth Rock

Gholdengo @ Choice Scarf
Ability: Good as Gold
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Shadow Ball
- Make It Rain
- Trick
- Focus Blast

Dragapult @ Life Orb
Ability: Infiltrator
EVs: 252 Atk / 4 SpA / 252 Spe
Naive Nature
- Dragon Darts
- Hex
- U-turn
- Will-O-Wisp

Iron Valiant @ Booster Energy
Ability: Quark Drive
EVs: 252 Atk / 4 SpA / 252 Spe
Naive Nature
- Close Combat
- Spirit Break
- Knock Off
- Moonblast

Clodsire @ Leftovers
Ability: Unaware
EVs: 252 HP / 4 Atk / 252 Def
Impish Nature
- Earthquake
- Recover
- Toxic Spikes
- Toxic`,

        `Roaring Moon @ Choice Band
Ability: Protosynthesis
EVs: 252 Atk / 4 Def / 252 Spe
Jolly Nature
- Crunch
- Dragon Claw
- Earthquake
- U-turn

Landorus-Therian @ Rocky Helmet
Ability: Intimidate
EVs: 252 HP / 200 Def / 56 Spe
Impish Nature
- Earthquake
- U-turn
- Stealth Rock
- Taunt

Heatran @ Air Balloon
Ability: Flash Fire
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
- Magma Storm
- Earth Power
- Flash Cannon
- Taunt

Tornadus-Therian @ Heavy-Duty Boots
Ability: Regenerator
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
- Hurricane
- Knock Off
- U-turn
- Heat Wave

Slowking-Galar @ Assault Vest
Ability: Regenerator
EVs: 248 HP / 8 Def / 252 SpD
Sassy Nature
- Future Sight
- Sludge Bomb
- Flamethrower
- Chilly Reception

Rillaboom @ Choice Band
Ability: Grassy Surge
EVs: 252 Atk / 4 SpD / 252 Spe
Adamant Nature
- Grassy Glide
- Wood Hammer
- Knock Off
- U-turn`,

        `Zamazenta @ Leftovers
Ability: Dauntless Shield
EVs: 252 HP / 4 Def / 252 Spe
Jolly Nature
- Body Press
- Crunch
- Iron Defense
- Substitute

Enamorus @ Choice Specs
Ability: Contrary
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Moonblast
- Earth Power
- Mystical Fire
- Healing Wish

Meowscarada @ Choice Band
Ability: Protean
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Flower Trick
- Knock Off
- U-turn
- Play Rough

Ting-Lu @ Leftovers
Ability: Vessel of Ruin
EVs: 252 HP / 4 Def / 252 SpD
Careful Nature
- Earthquake
- Ruination
- Spikes
- Whirlwind

Kilowattrel @ Heavy-Duty Boots
Ability: Volt Absorb
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Thunderbolt
- Volt Switch
- Hurricane
- Roost

Samurott-Hisui @ Choice Scarf
Ability: Sharpness
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Ceaseless Edge
- Razor Shell
- Aqua Cutter
- Sacred Sword`,
      ],

      // ============================================
      // GEN 9 UBERS - 2 TEAMS
      // ============================================
      'gen9ubers': [
        `Zacian-Crowned @ Rusted Sword
Ability: Intrepid Sword
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Swords Dance
- Behemoth Blade
- Play Rough
- Close Combat

Calyrex-Shadow @ Choice Specs
Ability: As One (Spectrier)
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Astral Barrage
- Psyshock
- Draining Kiss
- Trick

Eternatus @ Life Orb
Ability: Pressure
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Dynamax Cannon
- Sludge Bomb
- Flamethrower
- Recover

Ho-Oh @ Heavy-Duty Boots
Ability: Regenerator
EVs: 248 HP / 204 Def / 56 Spe
Impish Nature
- Sacred Fire
- Brave Bird
- Earthquake
- Recover

Arceus @ Silk Scarf
Ability: Multitype
EVs: 252 HP / 4 Def / 252 Spe
Timid Nature
- Judgment
- Recover
- Will-O-Wisp
- Stealth Rock

Groudon @ Red Orb
Ability: Drought
EVs: 252 Atk / 4 SpD / 252 Spe
Adamant Nature
- Precipice Blades
- Stone Edge
- Fire Punch
- Stealth Rock`,

        `Miraidon @ Choice Specs
Ability: Hadron Engine
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Electro Drift
- Draco Meteor
- Volt Switch
- U-turn

Koraidon @ Life Orb
Ability: Orichalcum Pulse
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Collision Course
- Flare Blitz
- U-turn
- Swords Dance

Necrozma-Dusk-Mane @ Power Herb
Ability: Prism Armor
EVs: 252 Atk / 4 SpD / 252 Spe
Adamant Nature
- Swords Dance
- Sunsteel Strike
- Earthquake
- Stone Edge

Giratina @ Leftovers
Ability: Pressure
EVs: 248 HP / 8 Def / 252 SpD
Careful Nature
- Dragon Tail
- Will-O-Wisp
- Rest
- Sleep Talk

Yveltal @ Heavy-Duty Boots
Ability: Dark Aura
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Dark Pulse
- Oblivion Wing
- Taunt
- U-turn

Ditto @ Choice Scarf
Ability: Imposter
EVs: 248 HP / 8 Def / 252 Spe
Relaxed Nature
IVs: 0 Atk
- Transform`,
      ],

      // ============================================
      // GEN 8 OU - 2 TEAMS
      // ============================================
      'gen8ou': [
        `Landorus-Therian @ Leftovers
Ability: Intimidate
EVs: 252 HP / 200 Def / 56 Spe
Impish Nature
- Stealth Rock
- Earthquake
- U-turn
- Defog

Dragapult @ Choice Specs
Ability: Infiltrator
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Shadow Ball
- Draco Meteor
- U-turn
- Fire Blast

Ferrothorn @ Leftovers
Ability: Iron Barbs
EVs: 252 HP / 88 Def / 168 SpD
Relaxed Nature
IVs: 0 Spe
- Spikes
- Leech Seed
- Power Whip
- Body Press

Clefable @ Leftovers
Ability: Magic Guard
EVs: 252 HP / 252 Def / 4 SpD
Bold Nature
- Moonblast
- Soft-Boiled
- Stealth Rock
- Teleport

Heatran @ Heavy-Duty Boots
Ability: Flash Fire
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Magma Storm
- Earth Power
- Taunt
- Stealth Rock

Urshifu-Rapid-Strike @ Choice Band
Ability: Unseen Fist
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Surging Strikes
- Close Combat
- Aqua Jet
- U-turn`,

        `Melmetal @ Assault Vest
Ability: Iron Fist
EVs: 252 HP / 252 Atk / 4 SpD
Adamant Nature
- Double Iron Bash
- Thunder Punch
- Earthquake
- Ice Punch

Tapu Lele @ Choice Scarf
Ability: Psychic Surge
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Psychic
- Moonblast
- Focus Blast
- Psyshock

Corviknight @ Leftovers
Ability: Pressure
EVs: 248 HP / 168 Def / 92 SpD
Impish Nature
- Brave Bird
- Defog
- Roost
- U-turn

Toxapex @ Black Sludge
Ability: Regenerator
EVs: 252 HP / 232 Def / 24 SpD
Bold Nature
- Scald
- Haze
- Recover
- Toxic Spikes

Weavile @ Heavy-Duty Boots
Ability: Pressure
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Triple Axel
- Knock Off
- Ice Shard
- Swords Dance

Volcarona @ Heavy-Duty Boots
Ability: Flame Body
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Quiver Dance
- Flamethrower
- Bug Buzz
- Roost`,
      ],

      // ============================================
      // GEN 7 OU - 2 TEAMS
      // ============================================
      'gen7ou': [
        `Landorus-Therian @ Rocky Helmet
Ability: Intimidate
EVs: 252 HP / 240 Def / 16 Spe
Impish Nature
- Earthquake
- Stealth Rock
- U-turn
- Hidden Power Ice

Heatran @ Leftovers
Ability: Flash Fire
EVs: 252 HP / 16 SpA / 240 SpD
Calm Nature
- Lava Plume
- Toxic
- Taunt
- Protect

Ash-Greninja @ Choice Specs
Ability: Battle Bond
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Hydro Pump
- Dark Pulse
- Water Shuriken
- Spikes

Toxapex @ Black Sludge
Ability: Regenerator
EVs: 252 HP / 252 Def / 4 SpD
Bold Nature
- Scald
- Recover
- Haze
- Toxic Spikes

Magearna @ Fairium Z
Ability: Soul-Heart
EVs: 248 HP / 8 Def / 252 SpA
Modest Nature
- Fleur Cannon
- Volt Switch
- Focus Blast
- Shift Gear

Tapu Koko @ Life Orb
Ability: Electric Surge
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Thunderbolt
- Dazzling Gleam
- Hidden Power Ice
- Volt Switch`,

        `Mega Alakazam @ Alakazite
Ability: Magic Guard
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Psychic
- Focus Blast
- Shadow Ball
- Encore

Clefable @ Leftovers
Ability: Magic Guard
EVs: 252 HP / 252 Def / 4 SpD
Bold Nature
- Moonblast
- Soft-Boiled
- Stealth Rock
- Thunder Wave

Ferrothorn @ Leftovers
Ability: Iron Barbs
EVs: 252 HP / 88 Def / 168 SpD
Sassy Nature
IVs: 0 Spe
- Spikes
- Leech Seed
- Gyro Ball
- Power Whip

Tapu Lele @ Choice Scarf
Ability: Psychic Surge
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Psychic
- Moonblast
- Focus Blast
- Psyshock

Kartana @ Grassium Z
Ability: Beast Boost
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Leaf Blade
- Sacred Sword
- Knock Off
- Swords Dance

Volcarona @ Heavy-Duty Boots
Ability: Flame Body
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Quiver Dance
- Flamethrower
- Bug Buzz
- Roost`,
      ],

      // ============================================
      // GEN 6 OU - 2 TEAMS
      // ============================================
      'gen6ou': [
        `Landorus-Therian @ Choice Scarf
Ability: Intimidate
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Earthquake
- U-turn
- Stone Edge
- Superpower

Mega Venusaur @ Venusaurite
Ability: Chlorophyll
EVs: 248 HP / 252 Def / 8 SpD
Bold Nature
- Giga Drain
- Sludge Bomb
- Synthesis
- Hidden Power Fire

Talonflame @ Sharp Beak
Ability: Gale Wings
EVs: 252 Atk / 4 Def / 252 Spe
Adamant Nature
- Brave Bird
- Flare Blitz
- Roost
- Swords Dance

Azumarill @ Sitrus Berry
Ability: Huge Power
EVs: 252 HP / 252 Atk / 4 SpD
Adamant Nature
- Aqua Jet
- Play Rough
- Belly Drum
- Knock Off

Latios @ Life Orb
Ability: Levitate
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Draco Meteor
- Psyshock
- Surf
- Defog

Heatran @ Leftovers
Ability: Flash Fire
EVs: 252 HP / 4 SpA / 252 SpD
Calm Nature
- Lava Plume
- Earth Power
- Taunt
- Stealth Rock`,

        `Mega Kangaskhan @ Kangaskhanite
Ability: Scrappy
EVs: 252 Atk / 4 Def / 252 Spe
Jolly Nature
- Fake Out
- Return
- Sucker Punch
- Power-Up Punch

Rotom-Wash @ Leftovers
Ability: Levitate
EVs: 248 HP / 216 Def / 44 Spe
Bold Nature
- Hydro Pump
- Volt Switch
- Will-O-Wisp
- Pain Split

Excadrill @ Life Orb
Ability: Mold Breaker
EVs: 252 Atk / 4 Def / 252 Spe
Adamant Nature
- Earthquake
- Iron Head
- Rock Slide
- Rapid Spin

Serperior @ Leftovers
Ability: Contrary
EVs: 56 HP / 200 SpA / 252 Spe
Timid Nature
- Leaf Storm
- Hidden Power Fire
- Glare
- Substitute

Thundurus @ Life Orb
Ability: Prankster
EVs: 4 Atk / 252 SpA / 252 Spe
Naive Nature
- Thunderbolt
- Hidden Power Ice
- Knock Off
- Thunder Wave

Clefable @ Leftovers
Ability: Magic Guard
EVs: 252 HP / 252 Def / 4 SpD
Bold Nature
- Moonblast
- Soft-Boiled
- Stealth Rock
- Thunder Wave`,
      ],

      // ============================================
      // GEN 5 OU - 2 TEAMS
      // ============================================
      'gen5ou': [
        `Politoed @ Leftovers
Ability: Drizzle
EVs: 252 HP / 252 Def / 4 SpD
Bold Nature
- Scald
- Toxic
- Perish Song
- Protect

Ferrothorn @ Leftovers
Ability: Iron Barbs
EVs: 252 HP / 88 Def / 168 SpD
Relaxed Nature
IVs: 0 Spe
- Spikes
- Leech Seed
- Power Whip
- Gyro Ball

Keldeo @ Life Orb
Ability: Justified
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Hydro Pump
- Secret Sword
- Icy Wind
- Hidden Power Bug

Latios @ Choice Specs
Ability: Levitate
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
- Draco Meteor
- Surf
- Psyshock
- Trick

Scizor @ Choice Band
Ability: Technician
EVs: 248 HP / 252 Atk / 8 SpD
Adamant Nature
- Bullet Punch
- U-turn
- Superpower
- Pursuit

Jellicent @ Leftovers
Ability: Water Absorb
EVs: 252 HP / 36 Def / 220 SpD
Calm Nature
- Scald
- Recover
- Will-O-Wisp
- Taunt`,

        `Tyranitar @ Choice Band
Ability: Sand Stream
EVs: 252 Atk / 4 Def / 252 Spe
Adamant Nature
- Stone Edge
- Crunch
- Pursuit
- Superpower

Landorus @ Life Orb
Ability: Sand Force
EVs: 76 Atk / 252 SpA / 180 Spe
Naive Nature
- Earth Power
- Rock Slide
- Hidden Power Ice
- U-turn

Reuniclus @ Life Orb
Ability: Magic Guard
EVs: 252 HP / 252 SpA / 4 SpD
Quiet Nature
IVs: 0 Atk / 0 Spe
- Trick Room
- Psychic
- Focus Blast
- Shadow Ball

Gliscor @ Toxic Orb
Ability: Poison Heal
EVs: 252 HP / 184 Def / 72 Spe
Impish Nature
- Earthquake
- Protect
- Substitute
- Toxic

Rotom-Wash @ Leftovers
Ability: Levitate
EVs: 252 HP / 4 SpA / 252 SpD
Calm Nature
- Volt Switch
- Hydro Pump
- Will-O-Wisp
- Pain Split

Breloom @ Toxic Orb
Ability: Poison Heal
EVs: 236 HP / 16 Atk / 4 Def / 252 Spe
Jolly Nature
- Spore
- Substitute
- Focus Punch
- Seed Bomb`,
      ],

      // ============================================
      // GEN 4 OU - 2 TEAMS
      // ============================================
      'gen4ou': [
        `Scizor @ Choice Band
Ability: Technician
EVs: 248 HP / 252 Atk / 8 SpD
Adamant Nature
- Bullet Punch
- U-turn
- Superpower
- Pursuit

Jirachi @ Leftovers
Ability: Serene Grace
EVs: 252 HP / 224 SpD / 32 Spe
Careful Nature
- Iron Head
- Body Slam
- Wish
- U-turn

Rotom-Heat @ Choice Scarf
Ability: Levitate
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
- Thunderbolt
- Overheat
- Shadow Ball
- Trick

Gyarados @ Leftovers
Ability: Intimidate
EVs: 156 HP / 72 Atk / 96 Def / 184 Spe
Jolly Nature
- Dragon Dance
- Waterfall
- Earthquake
- Taunt

Heatran @ Shuca Berry
Ability: Flash Fire
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
- Fire Blast
- Earth Power
- Stealth Rock
- Explosion

Blissey @ Leftovers
Ability: Natural Cure
EVs: 252 HP / 252 Def / 4 SpD
Bold Nature
- Seismic Toss
- Softboiled
- Stealth Rock
- Thunder Wave`,

        `Infernape @ Life Orb
Ability: Blaze
EVs: 64 Atk / 252 SpA / 192 Spe
Naive Nature
- Close Combat
- Fire Blast
- Grass Knot
- Stone Edge

Latias @ Choice Scarf
Ability: Levitate
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
- Draco Meteor
- Surf
- Trick
- Healing Wish

Metagross @ Leftovers
Ability: Clear Body
EVs: 252 HP / 252 Atk / 4 SpD
Adamant Nature
- Meteor Mash
- Bullet Punch
- Earthquake
- Stealth Rock

Skarmory @ Leftovers
Ability: Keen Eye
EVs: 252 HP / 252 Def / 4 SpD
Impish Nature
- Spikes
- Roost
- Whirlwind
- Brave Bird

Swampert @ Leftovers
Ability: Torrent
EVs: 240 HP / 216 Def / 52 SpD
Relaxed Nature
- Earthquake
- Waterfall
- Stealth Rock
- Roar

Celebi @ Life Orb
Ability: Natural Cure
EVs: 232 HP / 24 SpA / 252 Spe
Timid Nature
- Leaf Storm
- Earth Power
- Hidden Power Fire
- Recover`,
      ],

      // ============================================
      // GEN 3 OU - 2 TEAMS
      // ============================================
      'gen3ou': [
        `Tyranitar @ Leftovers
Ability: Sand Stream
EVs: 252 HP / 4 Atk / 252 SpD
Careful Nature
- Rock Slide
- Pursuit
- Taunt
- Rest

Swampert @ Leftovers
Ability: Torrent
EVs: 240 HP / 252 Def / 16 SpD
Relaxed Nature
- Earthquake
- Ice Beam
- Roar
- Protect

Gengar @ Leftovers
Ability: Levitate
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
- Thunderbolt
- Ice Punch
- Fire Punch
- Explosion

Skarmory @ Leftovers
Ability: Keen Eye
EVs: 252 HP / 252 Def / 4 SpD
Impish Nature
- Spikes
- Drill Peck
- Whirlwind
- Rest

Metagross @ Leftovers
Ability: Clear Body
EVs: 252 HP / 252 Atk / 4 SpD
Adamant Nature
- Meteor Mash
- Earthquake
- Explosion
- Pursuit

Blissey @ Leftovers
Ability: Natural Cure
EVs: 252 HP / 252 Def / 4 SpD
Bold Nature
- Seismic Toss
- Soft-Boiled
- Aromatherapy
- Thunder Wave`,

        `Salamence @ Leftovers
Ability: Intimidate
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Dragon Dance
- Hidden Power Flying
- Earthquake
- Fire Blast

Suicune @ Leftovers
Ability: Pressure
EVs: 252 HP / 252 Def / 4 SpD
Bold Nature
- Surf
- Calm Mind
- Rest
- Sleep Talk

Celebi @ Leftovers
Ability: Natural Cure
EVs: 252 HP / 240 SpD / 16 Spe
Careful Nature
- Leech Seed
- Recover
- Heal Bell
- Hidden Power Grass

Dugtrio @ Choice Band
Ability: Arena Trap
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Rock Slide
- Aerial Ace
- Beat Up

Zapdos @ Leftovers
Ability: Pressure
EVs: 252 HP / 4 Def / 252 Spe
Timid Nature
- Thunderbolt
- Hidden Power Ice
- Toxic
- Rest

Jirachi @ Leftovers
Ability: Serene Grace
EVs: 252 HP / 224 SpD / 32 Spe
Careful Nature
- Body Slam
- Wish
- Protect
- Thunder Wave`,
      ],

      // ============================================
      // GEN 2 OU - 2 TEAMS
      // ============================================
      'gen2ou': [
        `Snorlax @ Leftovers
Ability: Thick Fat
EVs: 144 HP / 188 Atk / 176 SpD
Adamant Nature
- Curse
- Body Slam
- Earthquake
- Rest

Zapdos @ Leftovers
Ability: Pressure
EVs: 252 HP / 4 Def / 252 SpA
Bold Nature
- Thunderbolt
- Hidden Power Ice
- Rest
- Sleep Talk

Tyranitar @ Leftovers
Ability: Sand Stream
EVs: 252 HP / 4 Atk / 252 SpD
Careful Nature
- Rock Slide
- Crunch
- Earthquake
- Curse

Skarmory @ Leftovers
Ability: Keen Eye
EVs: 252 HP / 252 Def / 4 SpD
Impish Nature
- Drill Peck
- Whirlwind
- Curse
- Rest

Exeggutor @ Leftovers
Ability: Chlorophyll
EVs: 252 HP / 4 Def / 252 SpA
Modest Nature
- Sleep Powder
- Psychic
- Giga Drain
- Explosion

Starmie @ Leftovers
Ability: Natural Cure
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
- Surf
- Thunderbolt
- Ice Beam
- Rapid Spin`,

        `Machamp @ Leftovers
Ability: Guts
EVs: 252 HP / 252 Atk / 4 SpD
Adamant Nature
- Cross Chop
- Curse
- Earthquake
- Rock Slide

Raikou @ Leftovers
Ability: Pressure
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
- Thunderbolt
- Hidden Power Ice
- Crunch
- Rest

Nidoking @ Leftovers
Ability: Poison Point
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
- Earthquake
- Ice Beam
- Thunderbolt
- Lovely Kiss

Suicune @ Leftovers
Ability: Pressure
EVs: 252 HP / 252 Def / 4 SpD
Bold Nature
- Surf
- Toxic
- Rest
- Sleep Talk

Forretress @ Leftovers
Ability: Sturdy
EVs: 252 HP / 252 Def / 4 SpD
Impish Nature
- Spikes
- Rapid Spin
- Earthquake
- Explosion

Gengar @ Leftovers
Ability: Levitate
EVs: 4 HP / 252 SpA / 252 Spe
Timid Nature
- Thunderbolt
- Ice Punch
- Fire Punch
- Explosion`,
      ],

      // ============================================
      // GEN 1 OU - 2 TEAMS
      // ============================================
      'gen1ou': [
        `Tauros @ No Item
Ability: No Ability
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe
Jolly Nature
- Body Slam
- Hyper Beam
- Earthquake
- Blizzard

Chansey @ No Item
Ability: No Ability
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe
Bold Nature
- Seismic Toss
- Soft-Boiled
- Thunder Wave
- Ice Beam

Exeggutor @ No Item
Ability: No Ability
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe
Modest Nature
- Psychic
- Sleep Powder
- Stun Spore
- Explosion

Snorlax @ No Item
Ability: No Ability
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe
Adamant Nature
- Body Slam
- Amnesia
- Rest
- Earthquake

Alakazam @ No Item
Ability: No Ability
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe
Timid Nature
- Psychic
- Recover
- Thunder Wave
- Seismic Toss

Starmie @ No Item
Ability: No Ability
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe
Timid Nature
- Blizzard
- Thunderbolt
- Recover
- Thunder Wave`,

        `Zapdos @ No Item
Ability: No Ability
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe
Timid Nature
- Thunderbolt
- Drill Peck
- Thunder Wave
- Agility

Rhydon @ No Item
Ability: No Ability
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe
Adamant Nature
- Earthquake
- Rock Slide
- Body Slam
- Substitute

Jynx @ No Item
Ability: No Ability
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe
Timid Nature
- Lovely Kiss
- Blizzard
- Psychic
- Body Slam

Lapras @ No Item
Ability: No Ability
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe
Modest Nature
- Blizzard
- Thunderbolt
- Body Slam
- Confuse Ray

Jolteon @ No Item
Ability: No Ability
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe
Timid Nature
- Thunderbolt
- Thunder Wave
- Pin Missile
- Double Kick

Golem @ No Item
Ability: No Ability
EVs: 252 HP / 252 Atk / 252 Def / 252 SpA / 252 SpD / 252 Spe
Adamant Nature
- Earthquake
- Rock Slide
- Explosion
- Body Slam`,
      ],

      // Add "All" category for formats that accept all
      'ALL': PHNN_TEAMS,
    };

    // For random battles, we don't provide teams since they're auto-generated
    this.randomFormats = [
      'gen9randombattle',
      'gen8randombattle',
      'gen7randombattle',
      'gen6randombattle',
      'gen5randombattle',
      'gen4randombattle',
      'gen3randombattle',
      'gen2randombattle',
      'gen1randombattle',
    ];

    this.request = null;
    this.lastRqid = null;
  }

  team(format) {
    console.log('=== TEAM METHOD CALLED ===');
    console.log('Format requested:', format);

    // Check if it's a random battle format
    const formatLower = (format || '').toLowerCase();
    if (this.randomFormats.includes(formatLower)) {
      console.log('Random battle format detected - no team needed');
      return null; // Let the server generate random team
    }

    // Get teams for this specific format
    let availableTeams = this.teamsByFormat[formatLower];

    // If no teams found for exact format, try 'ALL'
    if (!availableTeams || availableTeams.length === 0) {
      console.log(`No teams found for ${formatLower}, using ALL teams`);
      availableTeams = this.teamsByFormat['ALL'];
    }

    // Fallback to first available format if still nothing
    if (!availableTeams || availableTeams.length === 0) {
      console.log('No teams in ALL, using first available format');
      const firstFormat = Object.keys(this.teamsByFormat)[0];
      availableTeams = this.teamsByFormat[firstFormat];
    }

    // Select random team from available teams
    const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
    console.log('Returning random team from pool of', availableTeams.length, 'teams');
    return randomTeam;
  }

  handleRequest(requestData) {
    try {
      this.request = JSON.parse(requestData);
      console.log('Bot stored request data');
    } catch (e) {
      console.error('Failed to parse request data:', e);
      this.request = null;
    }
  }

  decide(state) {
    // Prevent duplicate decisions
    if (this.lastRqid === state.rqid) {
      console.log(`=== SKIPPING: Already handled rqid ${state.rqid} ===`);
      return;
    }
    this.lastRqid = state.rqid;

    console.log('=== DECIDE CALLED ===');
    console.log('Turn:', state.turn);

    // Handle team preview
    if ((state.teamPreview && state.turn === 0) || 
        (state.turn === 0 && state.self.active.length === 0 && state.self.reserve.length === 0)) {
      console.log('Team preview detected - choosing lead Pokemon');

      if (this.request && this.request.teamPreview && this.request.side && this.request.side.pokemon) {
        const pokemon = this.request.side.pokemon;
        console.log('Available Pokemon in team preview:', pokemon.length);

        // Find first alive Pokemon
        for (let i = 0; i < pokemon.length; i++) {
          const mon = pokemon[i];
          console.log(`Pokemon ${i}: ${mon.ident}, condition: ${mon.condition}`);

          if (mon.condition && !mon.condition.includes('fnt') && !mon.condition.includes('0 fnt')) {
            console.log(`Choosing Pokemon at position ${i + 1}: ${mon.ident}`);
            return new SWITCH(i);
          }
        }

        console.log('All Pokemon appear fainted, choosing first one as fallback');
        return new SWITCH(0);
      }

      console.log('No request data available, using fallback team selection');
      return new SWITCH(0);
    }

    // Handle force switch
    if (state.forceSwitch) {
      console.log('=== FORCE SWITCH BRANCH ===');

      // Doubles/Triples: the server forces one or more slots to switch and needs a
      // sub-choice per active slot. Build them all from the raw request.
      if (this.request && Array.isArray(this.request.forceSwitch) && this.request.forceSwitch.length > 1) {
        const pieces = multibattle.buildSwitchChoice(this.request);
        console.log('=== MULTI-ACTIVE FORCE SWITCH:', pieces.join(', '), '===');
        return pieces;
      }

      const availableIndices = [];
      for (let i = 0; i < (state.self.reserve || []).length; i++) {
        const mon = state.self.reserve[i];
        if (mon && !mon.active && !mon.dead) {
          availableIndices.push(i);
        }
      }

      console.log('Available Pokemon indices for switch:', availableIndices);

      if (availableIndices.length === 0) {
        console.log('No available Pokemon, defaulting to switch 0');
        return new SWITCH(0);
      }

      const chosenIndex = this.pickOne(availableIndices);
      console.log('Switching to Pokemon at index:', chosenIndex);
      return new SWITCH(chosenIndex);
    }

    // Handle normal battle moves
    console.log('=== NORMAL MOVE BRANCH ===');

    // Doubles/Triples: the store leaves state.self.active as an array (length > 1)
    // and the server needs one move sub-choice per active slot, each single-target
    // move carrying an explicit target. Build them from the raw request.
    if (Array.isArray(state.self.active) && state.self.active.length > 1) {
      const pieces = this.request && Array.isArray(this.request.active) && this.request.active.length > 1
        ? multibattle.buildMoveChoice(this.request, () => Math.random())
        : state.self.active.map(() => 'default');
      console.log('=== MULTI-ACTIVE MOVE:', pieces.join(', '), '===');
      return pieces;
    }

    if (!state.self.active || !state.self.active.moves) {
      console.log('No active Pokemon or moves, using struggle');
      return new MOVE('struggle');
    }

    const availableMoves = state.self.active.moves.filter(move => move && !move.disabled);
    console.log('Available moves:', availableMoves.map(m => m.name || m));

    if (availableMoves.length === 0) {
      console.log('No available moves, using struggle');
      return new MOVE('struggle');
    }

    const chosenMove = this.pickOne(availableMoves);
    console.log('=== CHOOSING MOVE:', chosenMove.name || chosenMove, '===');
    return new MOVE(chosenMove.id);
  }

  pickOne(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

module.exports = MultiFormatBot;
