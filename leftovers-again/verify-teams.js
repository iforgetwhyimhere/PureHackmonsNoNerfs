'use strict';
// Verifies that LO teams pack via the bot's Team class AND validate on the phnn server.
// Run from leftovers-again/: node verify-teams.js
const path = require('path');
const Team = require('./src/team.js');
const sim = require(path.resolve(__dirname, '../pokemon-showdown/dist/sim'));
const { TeamValidator } = require(path.resolve(__dirname, '../pokemon-showdown/dist/sim/team-validator'));

const FORMAT = 'gen9purehackmonsnonerfs';
const validator = TeamValidator.get(FORMAT);

// Candidate teams live in ./src/phnn-teams.js so bot.js can require the same source.
const TEAMS = require('./src/phnn-teams.js');

let allOk = true;
TEAMS.forEach((teamStr, i) => {
	const label = `Team ${i + 1}`;
	const parsed = new Team(teamStr);
	const arr = parsed.asArray();
	if (!arr) { console.log(`${label}: FAILED to parse (seemsValid false - check moves<=4 and blank lines)`); allOk = false; return; }
	if (arr.length !== 6) { console.log(`${label}: parsed ${arr.length} mons (expected 6)`); allOk = false; }
	const packed = parsed.asUtm();
	if (!packed) { console.log(`${label}: packed string EMPTY`); allOk = false; return; }
	let unpacked;
	try { unpacked = sim.Teams.unpack(packed); } catch (e) { console.log(`${label}: server unpack error: ${e.message}`); allOk = false; return; }
	if (!unpacked) { console.log(`${label}: server unpack returned null`); allOk = false; return; }
	const problems = validator.validateTeam(unpacked);
	if (problems) {
		console.log(`${label}: ${problems.length} VALIDATION PROBLEM(S):`);
		problems.forEach(p => console.log(`   - ${p}`));
		allOk = false;
	} else {
		console.log(`${label}: OK - ${unpacked.length} mons, packs & validates`);
	}
});

console.log(allOk ? '\nALL TEAMS OK' : '\nSOME TEAMS FAILED');
process.exitCode = allOk ? 0 : 1;
