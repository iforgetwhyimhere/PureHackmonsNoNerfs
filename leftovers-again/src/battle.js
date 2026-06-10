const BattleStore = require('./model/battlestore');
const Timer = require('./model/timer');

const Log = require('./log');
const { MOVE, SWITCH } = require('./decisions');
const report = require('./report');
const listener = require('./listener');
const Reporter = require('./reporters/matchstatus');
const util = require('./pokeutil');

const timer = new Timer();
// that's right...you're gonna forfeit if you don't decide in this amount of time
let forfeitTimeout;

/**
 * This class manages a single battle. It handles these tasks:
 * - maintaining battle state via its BattleStore
 * - managing the AI instance
 * - translating AI responses into server responses
 * - handling the end of the match
 */
class Battle {
  /**
   * Construct a Battle instance.
   * @param  {String} bid The battle ID; essential for server communication
   * @param  {Connection} connection The connection instance to use for
   * sending and receiving messages.
   * @param  {string} botpath The path to the bot JS file to use. The file it
   * grabs will be found at leftovers-again/bots/[botpath].js
   *
   */
  constructor(bid, bot, timeout = 0) {
    forfeitTimeout = timeout;
    // battle ID
    this.bid = bid;

    // Messages we want to handle, and their handlers.
    this.handlers = {
      // from the normal server
      teampreview: this.handleTeamPreview,
      request: this.handleRequest,
      start: this.handleStart,
      turn: this.handleTurn,
      win: this.handleWin,
      callback: this.handleCallback,
      cant: this.handleCant,

      // special function for auditing yrself.
      ask4help: this.getHelp
    };

    this.bot = bot;
    this.store = new BattleStore();

    this.prevStates = [];
  }

  /**
   * Getter for my bot instance
   * @return {object} An AI instance of the file located at the botpath
   */
  myBot() {
    return this.bot;
  }

  /**
   * Secret function for getting information, not just decisions, from your AI
   * instance. It sends a 'help' message to the server.
   *
   * This is very undocumented (and lazy!) so don't use it.
   */
  getHelp() {
    if (this.bot.getHelp) {
      listener.relay('_send', this.bid + '|' +
        JSON.stringify(this.bot.getHelp(this.store.data())));
    }
  }


  /**
   * Send all server messages through to your battle store, then handle them
   * within this class. See this.handlers to see what we're handling.
   * @param  {string} type    The type of message.
   * @param  {array} message  The parameters to this message.
   */
  handle(type, message) {
    // handle store stuff first!
    this.store.handle(type, message);

    if (this.handlers[type]) {
      this.handlers[type].apply(this, message);
    }
  }

  /**
   * Handles the 'team preview' message. This is the phase of matches where
   * you see your opponent's team and decide who you want to send out first.
   * Each bot must handle this message.
   *
   * @TODO is this necessary or should we do this in handleRequest?
   */
  handleTeamPreview() {
    //this.decide();
  }

/**
 * Handles a request.
 *
 * For certain requests, we want to immediately request a decision from our
 * bot. These situations are:
 * teamPreview: This is a team preview request
 * forceSwitch: Due to moves / feinting, we must switch our active mon
 * @param  {string} json The request JSON
 *
 * @return {Boolean}  True if we had to make a decision; false otherwise
 */
handleRequest(json) {
  if (!json) return;
  
  // NEW: Always pass request data to bot first
  if (this.bot && this.bot.handleRequest) {
    this.bot.handleRequest(json);
  }
  
  const data = JSON.parse(json);

  // this is not a request, just data.
  if (!data.rqid) {
    return false;
  }

  // do what it says.
  if (data.wait) {
    return false;
  }

  // NOTE: We intentionally do NOT skip a request whose rqid we've already seen.
  // When the server rejects a choice (ex. a move that's out of PP, or switching
  // a trapped Pokemon), it re-sends the SAME request with the SAME rqid so we can
  // try again. Skipping that retry left the bot silent until it timed out. The
  // bot's own per-rqid guard (see bot.js decide) returns nothing on a repeat, and
  // formatMessage turns that into a guaranteed-legal `/choose default`, so a
  // rejected choice escalates to a safe default instead of hanging.

  if (data.teamPreview) {
    this.decide();
    return true;
  }

  if (data.forceSwitch) {
    this.decide();
    return true;
  }

  if (data.active) {
    this.decide();
    return true;
  }

  return false;
}

  /**
   * Don't actually need to do anything here, but let's log what Pokemon are
   * around to make it clear to the user what's happening.
   *
   */
  handleStart() {
    const myMons = this.store.barn.all().map(mon => mon.nickname).join(', ');
    Log.log(`Match started! ${this.store.myNick} vs. ${this.store.yourNick}`);
    Log.log(`Your team is: ${myMons}`);
  }

  /**
 * On a turn message, we need to make a decision.
 *
 * @param that I'm ignoring: the turn number.
 */
handleTurn(turn) { // eslint-disable-line
  // DON'T call decide here - handleRequest already does it
  // this.decide();
  console.log(`=== Turn ${turn} started - decision already handled by handleRequest ===`);
}

  /**
   * Handle a win
   *
   * @param  {String} nick  The nickname of the winner.
   *
   */
  handleWin(nick) {
    timer.ping(); // don't worry about timeout anymore
    const winner = util.toId(nick);
    Log.log(`${winner} won. ${winner === this.store.myNick ? '(that\'s you!)' : ''}`);
    report.win(winner, this.store, this.bid);

    listener.relay('_battleReport', {
      winner,
      opponent: this.store.yourNick
    });
  }

  handleCallback(desc, code) {
    Log.error(`cb: ${desc} ${code}`);
    if (desc === 'trapped') {
      const state = this.store.data();
      state.self.reserve.forEach((mon) => {
        mon.dead = true; // this is kind of hacky...
        mon.disabled = true; // better
      });
      this.decide(state);
    } else {
      Log.error('Bailing');
      this.forfeit();
    }
  }


  /**
   * Handles the cant message.
   *
   * Sometimes we get this because the user chose an invalid option. This is
   * bad and we want to let the user know.
   *
   * Sometimes we get this because the move failed. For this, we just log to
   * events and do nothing. The server sends "reasons" and we keep a list of
   * reasons that we're expecting in the normal course of play.
   *
   * > The Pokémon `POKEMON` could not perform a move because of the indicated
   * > `REASON` (such as paralysis, Disable, etc). Sometimes, the move it was
   * > trying to use is given.
   *
   * @param  {String} target [description]
   * @param  {String} reason [description]
   * @param  {String} move [description]
   *
   */
  handleCant(target, reason, move) {
    Log.info(`got 'cant' msg back from server. target:${target} reason:${reason}`);
    // 'soft' cants; don't need to do anything
    if (['slp', 'par', 'flinch', 'frz', 'Truant'].indexOf(reason) >= 0) {
      Log.info('Normal-lookin reason');
      return;
    }

    const targetMon = this.store.barn.find(target);
    // Log.error('I think this guy was the target?');
    // Log.error(JSON.stringify(targetMon));

//  HEAD
//     if (!move && targetMon.disabled) {
//       Log.error(`You tried to switch into ${target} but 'disabled' was true.`);
//       Log.error('Check that property before you switch!');
//     } else if (!move && targetMon.dead) {
//       Log.error(`You tried to switch into ${target} but 'dead' was true.`);
//       Log.error('Check that property before you switch!');
//     } else if (move) {
//       Log.error(`Move ${move} was unusable by ${target}.`);
//       const targetMove = targetMon.moves.find(mv => mv.id.indexOf(move) >= 0);
//       if (targetMove) {
//         Log.error(JSON.stringify(targetMove));
//         // @TODO disabling
//       }
//     }
//     Log.error('forfeiting due to cant.');
//     this.forfeit();
// =======

    if (this.store.myId === targetMon.owner) {
      if (move) {
        Log.error(`Move ${move} was unusable by ${target}.`);
        const targetMove = targetMon.moves.find(mv => mv.id.indexOf(move) >= 0);
        if (targetMove) {
          Log.error(JSON.stringify(targetMove));
          // @TODO disabling
          // eh, just gonna forfeit.
          this.forfeit();
        }
      } else if (targetMon.disabled) {
        Log.error(`You tried to switch into ${target} but 'disabled' was true.`);
        Log.error('Check that property before you switch!');
        this.forfeit();
      } else if (targetMon.dead) {
        Log.error(`You tried to switch into ${target} but 'dead' was true.`);
        Log.error('Check that property before you switch!');
        this.forfeit();
      }
    }
    return;
  }


  /**
   * Asks the AI to make a decision, then sends it to the server.
   *
   */
  decide(state) {
    timer.ping();

    if (!state) {
      state = this.store.data();
    }

    Log.debug('STATE:');
    Log.debug(JSON.stringify(state));

    Reporter.report(state);

    Log.toFile(`lastknownstate-${this.bid}.log`, JSON.stringify(state) + '\n');

    // attach previous states
    state.prevStates = this.prevStates;

    // Find this section in your battle.js decide() method and add the console.log lines:

  try {
    const choice = this.myBot().decide(state);
    
    // ADD THESE DEBUG LOGS:
    console.log('=== DECISION MADE ===');
    console.log('Choice:', choice);
    console.log('Choice type:', typeof choice);
    console.log('Choice instanceof SWITCH:', choice instanceof SWITCH);
    console.log('State teamPreview:', state.teamPreview);

    if (choice instanceof Promise) {
      // wait for promises to resolve
      choice.then((resolved) => {
        const res = this.formatMessage(this.bid, resolved, state);
        // ADD THIS:
        console.log('Formatted message:', res);
        if (res) {
          Log.info(res);
          listener.relay('_send', res);
        }
        // saving this state for future reference
        this.prevStates.unshift(this.abbreviateState(state));
      }, (err) => {
        Log.err('I think there was an error here.');
        Log.err(err);
      });
    } else {
      // message is ready to go
      const res = this.formatMessage(this.bid, choice, state);
      // ADD THIS:
      console.log('Formatted message:', res);
      if (res) {
        Log.info(res);
        listener.relay('_send', res);
      }

      // saving this state for future reference
      this.prevStates.unshift(this.abbreviateState(state));
    }
      // only if user set a timeout
      if (forfeitTimeout) {
        timer.after(() => {
          // @TODO fuck this
          Log.error('Haven\'t heard from the server in forever! Cowardly bailing');
          this.forfeit();
          // process.exit();
        }, forfeitTimeout);
      }
    } catch (e) {
      // A bug while deciding shouldn't cost us the game: send the server's
      // guaranteed-legal default choice and keep playing.
      Log.error('Error while deciding; sending default choice instead:');
      Log.error(e);
      if (state && state.rqid) {
        listener.relay('_send', `${this.bid}|/choose default|${state.rqid}`);
      } else {
        this.forfeit();
      }
    }
  }

/**
 * Give up.
 */
forfeit() {
  console.log('=== FORFEIT CALLED ===');
  console.log('Stack trace:');
  console.trace();
  Log.log('Forfeiting this match:', this.bid);
  listener.relay('_send', this.bid + '|/forfeit');
}

  /**
   * The prevStates array that we send to the bots doesn't need a ton of detail.
   * Let's just send a couple important fields.
   *
   * @param  {Object} state  The state object sent to bots.
   * @return {[type]}        Fewer fields of that state object.
   */
  abbreviateState(state) {
    return {
      turn: state.turn,
      self: {
        active: {
          hp: state.self.active.hp,
          hppct: state.self.active.hppct,
          statuses: state.self.active.statuses
        }
      },
      opponent: {
        active: {
          hp: state.opponent.active.hp,
          hppct: state.opponent.active.hppct,
          statuses: state.opponent.active.statuses
        }
      }
    };
  }

  /**
   * Formats the message into something we can send to the server.
   *
   * @param  {string} bid    The battle ID
   * @param  {Choice} choice The choice we made. Choice must be an Object of
   * type MOVE or SWITCH.
   * @param  {BattleState} state  The current battle state.
   *
   * @return {string} The string to send to the server.
   *
   * @see __constructor
   */
  formatMessage(bid, choice, state) {
    Log.debug('choice: ' + JSON.stringify(choice));
    let verb;

    // A guaranteed-legal fallback: the server picks the first available move/switch
    // and target for us. We send this instead of forfeiting (or going silent)
    // whenever we can't turn the bot's choice into a valid command, so a rejected
    // or missing choice never costs us the game.
    const fallback = `${bid}|/choose default|${state.rqid}`;

    // No choice (ex. the bot's per-rqid guard fired on a retry): send default.
    if (!choice) {
      return fallback;
    }

    // Doubles/Triples: the bot returns an array of already-formatted per-slot
    // sub-choices (ex. ['move 1 2', 'switch 4', 'pass']). Join them into a single
    // /choose command, which is the multi-slot form the server expects.
    if (Array.isArray(choice)) {
      return `${bid}|/choose ${choice.join(', ')}|${state.rqid}`;
    }

    // in 0.7.7 and lower, you had to check instanceof. But that check doesn't work
    // so well when it comes to cross-compatibility. So I added the 'type' property
    // to 'choice' which is less error-prone.
    if (choice instanceof MOVE || choice.type === 'move') {
      const moveIdx = this.lookupMoveIdx(state.self.active.moves, choice.id);
      if (moveIdx < 0) {
        return fallback;
      }

      verb = `/move ${moveIdx + 1}`; // move indexes for the server are [1..4]

      if (state.self.active.canMegaEvo && choice.shouldMegaEvo) {
        verb += ' mega';
      // ex. "canZMove":["","Hydro Vortex","",""]
      } else if (state.self.active.moves[moveIdx].canZMove && choice.shouldZMove) {
        verb += ' zmove';
      }
    } else if (choice instanceof SWITCH || choice.type === 'switch') {
      verb = (state.teamPreview)
        ? '/team'
        : '/switch';
      const monIdx = this.lookupMonIdx(state.self.reserve, choice.id);
      if (monIdx < 0) {
        return fallback;
      }
      verb = `${verb} ${monIdx + 1}`; // switch indexes for the server are [1..6]
    } else {
      // Unrecognized choice shape: fall back rather than send a malformed command.
      return fallback;
    }
    return `${bid}|${verb}|${state.rqid}`;
  }

  /**
   * Helper function for translating a move into the move index, which is what
   * the server needs from the move. Move index is in [0..3].
   *
   * @param  {array} moves The array of Move objects from which we're drawing.
   * @param  {mixed} idx   The 0-indexed numeric index, the Move object, or the
   * move ID (lowercased, no spaces) of the move we're choosing.
   *
   * @return {number} The move index.
   */
  lookupMoveIdx(moves, idx) {
    Log.debug('moves:', moves);
    Log.debug('idx:', idx);

    let answer = -1;
    if (typeof (idx) === 'number') {
      answer = idx;
    } else if (typeof (idx) === 'object') {
      answer = moves.indexOf(idx);
    } else if (typeof (idx) === 'string') {
      answer = moves.findIndex(move => move.id === idx);
    }

    if (answer === -1) {
      Log.error(`Could not find that move! Looked for ${idx} in: ${JSON.stringify(moves)}`);
      return -1;
    }
    if (moves[answer].disabled) {
      Log.error(`You cant use the move ${moves[answer].id} because it is disabled!`);
      return -1;
    }
    return answer;
  }

  /**
   * Helper function for translating a switch into the switch index, which is
   * what the server needs from the switch. Switch index is in [0..5].
   *
   * @param  {array} mons The possible Pokemons.
   * @param  {mixed} idx  The numeric index, the Pokemon object, or the species
   * name (lowercased, no spaces) of the Pokemon we want to switch into.
   *
   * @return {number} The switch index.
   */
  lookupMonIdx(mons, idx) {
    let answer;
    switch (typeof (idx)) {
      case 'number':
        answer = idx;
        break;
      case 'object':
        answer = mons.indexOf(idx);
        break;

      case 'string':
        answer = mons.findIndex(mon => mon.species === idx || mon.id === idx);
        break;
      default:
        Log.error('looking up mon... not a valid choice!', idx, mons);
        return -1;
    }

    const storeGuy = mons[answer];

    if (storeGuy.dead) {
      Log.error('You cant pick a dead guy.');
      return -1;
    }
    if (storeGuy.disabled) {
      Log.error('You cant pick a disabled guy.');
      return -1;
    }
    if (storeGuy.active) {
      Log.error('You cant pick your active guy.');
      return -1;
    }
    return answer;
  }
}

module.exports = Battle;
