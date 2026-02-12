const PROMPT = '>> ';
const BOOTLOG = [
  'INITIALIZING INTERFACE...',
  'LOCATION: SECTOR 5H32-W',
  'LOADING SECTOR_MAP...',
  '[LOADED]',
  'SIGNAL_DECAY: 16.1%',
  'CALIBRATING RADIATION METER...',
  'AUDIO_BUFFER_LOADED: ZONE_VOICE',
  'MONITORING ZONE ARTIFACTS',
  'PARSING LOGS...',
  '[DONE]',
  'WELCOME, OPERATOR. STAY NEAR THE LIGHT.',
];
const LOGS = [
  [
    'CAMERA 01: EXTERIOR',
    'STATUS: SECTOR NOMINAL. NO ANOMALIES. ',
    'LOOKING UP FROM HERE, THE SKY IS ALWAYS GREY. IT HAS BEEN THIS SHADE FOR DECADES.',
    'THE DIALS ON THE CONTROL PANEL STOPPED MOVING IN ’86, BUT THE SHADOWS BEHIND THE GLASS STILL SEEM TO SHIFT.',
    'NATURE IS AGGRESSIVELY RECLAIMING THE CONCRETE, BUT THE PLANTS HAVE A STRANGE GREEN COLOR.',
  ],
  [
    'CAMERA 02: TURBINE HALL',
    'STATUS: MARGINAL. LEVEL 2 VISUAL DISTORTION ACTIVE. ',
    'A LABYRINTH OF RUSTED IRON AND DEAD PRESSURE GAUGES.',
    'SENSORS PICK UP A LOW-FREQUENCY VIBRATION THAT DEFIES CATEGORIZATION. IT IS NOT MECHANICAL, BUT RHYTHMIC. LIKE RESPIRATION.',
    'THE FOG DOES NOT SHOW UP ON THE SCREEN.',
  ],
  [
    'CAMERA 03: CORE',
    'STATUS: CRITICAL. LEVEL 3 COGNITIVE HAZARD. ',
    'HEAVY CONCRETE AND A TANGLE OF DEAD PIPES. THESE STRUCTURES WERE DESIGNED TO CONTAIN POWER; NOW THEY ARE JUST HOLLOW RIBS HOLDING UP THE CEILING.',
    'A HIGH-FREQUENCY HISS IS BLEEDING THROUGH THE PIPES, A PHYSICAL RESONANCE THAT SHOULD NOT EXIST IN A DRY SYSTEM.',
    'RADIO FRAGMENTS DETECTED. SOUNDS LIKE A PRAYER, OR A WARNING.',
    'SIGNAL BLEED IS INTENSE. THE CORE IS NOT COLD. IT IS MERELY ',
  ],
];

export class Terminal {
  constructor(state, id) {
    this.el = document.getElementById(id);
    this.textEl = this.el.querySelector('.content');
    this.state = state;
    this.stream = 0;
    this.state.subscribe((newState) => this.onStateChange(newState));
    this.cursor = document.createElement('span');
    this.cursor.className = 'cursor';
    this.queue = [];
    this.isWriting = false;
    this.charDelay = 20;
  }

  runBootSequence() {
    this.displayLog(BOOTLOG, false, true);
  }

  async displayLog(lines, continuation = true, booting = false) {
    this.isWriting = true;
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    if (continuation) {
      this.textEl.lastChild?.remove();
    }

    let first = continuation;
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const lineEl = document.createElement('div');
      lineEl.classList.add('glitch', 'text');
      if (first) {
        lineEl.classList.add('title');
        first = false;
      }
      this.textEl.appendChild(lineEl);
      lineEl.appendChild(this.cursor);
      this.cursor.before(PROMPT);
      for (let i = 0; i < line.length; i++) {
        this.cursor.before(line[i]);
        lineEl.scrollIntoView(false);
        await delay(this.charDelay);
      }
      if (Math.random() > 0.95 && !booting) {
        this.textEl.removeChild(lineEl);
      } else {
        i++;
      }
      await delay(Math.random() * 300 + 100);
    }
    if (lines[0] === LOGS[2][0]) {
      this.cursor.before(this.garbleText());
      this.addCursorLine();
      this.cursor.before('ERR_CODE: MG-01.23.45');
    }
    this.addCursorLine();
    this.isWriting = false;
  }

  garbleText(intensity = 0.8) {
    const corruptionChars = '█▓▒░$@&%#!?/><^¿§∆01';
    return 'WAITING FOR THE RETURN'.split('').map(char => {
      if (char !== ' ' && Math.random() < intensity) {
        return corruptionChars[Math.floor(Math.random() * corruptionChars.length)];
      }
      return char;
    }).join('');
  }

  addCursorLine() {
    const line = document.createElement('div');
    line.classList.add('glitch', 'text');
    this.textEl.appendChild(line);
    line.appendChild(this.cursor);
    line.scrollIntoView(false);
    this.cursor.before(PROMPT);
  }

  clrscr() {
    this.textEl.innerHTML = '';
    this.addCursorLine();
  }

  onStateChange(state) {
    if (state.terminalStream === this.stream) return;

    this.el.style.setProperty(
      '--terminal-bg-opacity',
      0
    );
    setTimeout(() => {
      this.el.style.setProperty(
        '--terminal-bg-img',
        `url('../img/${state.terminalStream}.jpeg')`
      );
      this.el.style.setProperty(
        '--terminal-bg-opacity',
        1
      );
    }, 200);
    if (state.terminalStream === '3' && Math.random() > 0.8) {
      this.el.querySelector('.bg').style.setProperty(
        'animation', 'background-zoom 120s linear 1'
      );
    }
    this.stream = state.terminalStream;
    this.addQueue(LOGS[state.terminalStream - 1]);
  }

  addQueue(log) {
    this.queue.push(log);
  }

  update() {
    if (this.queue.length > 0 && !this.isWriting) {
      this.displayLog(this.queue.shift());
    }
  }
}