const audioCtx = new(window.AudioContext || window.webkitAudioContext)();

var currentRoot = null;
var currentScale = null;

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MORE_NOTES = {
  'C': 0, 'Dbb': 0, 'B#': 12,
  'C#': 1, 'Db': 1, 'B##': 1,
  'D': 2, 'Ebb': 2, 'C##': 2,
  'D#': 3, 'Eb': 3, 'Fbb': 3,
  'E': 4, 'Fb': 4, 'D##': 4,
  'F': 5, 'E#': 5, 'Gbb': 5,
  'F#': 6, 'Gb': 6, 'E##': 6,
  'G': 7, 'Abb': 7, 'F##': 7,
  'G#': 8, 'Ab': 8,
  'A': 9, 'Bbb': 9, 'G##': 9,
  'A#': 10, 'Bb': 10, 'Cbb': 10,
  'B': 11, 'A##': 11, 'Cb': 11
}
const MAJOR_SCALES = {
  'Cb': ['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb'],
  'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'C#': ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'],
  'Db': ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
  'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  'D#': ['D#', 'E#', 'F##', 'G#', 'A#', 'B#', 'C##'],
  'Eb': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
  'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  'E#': ['E#', 'F##', 'G##', 'A#', 'B#', 'C##', 'D##'],
  'Fb': ['Fb', 'Gb', 'Ab', 'Bbb', 'Cb', 'Db', 'Eb'],
  'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
  'Gb': ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'],
  'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  'G#': ['G#', 'A#', 'B#', 'C#', 'D#', 'E#', 'F##'],
  'Ab': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
  'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  'A#': ['A#', 'B#', 'C##', 'D#', 'E#', 'F##', 'G##'],
  'Bb': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
  'B#': ['B#', 'C##', 'D##', 'E#', 'F##', 'G##', 'A##']
}

document.getElementById("root-select").addEventListener("change", (event) => {
  currentRoot = event.target.value;
  if (currentScale != null) updateScale(applySuite(currentRoot, currentScale));
});

document.getElementById("scale-select").addEventListener("change", (event) => {
  currentScale = event.target.value.split(',');
  if (currentRoot != null) updateScale(applySuite(currentRoot, currentScale));
});

/**
 * Applies a scale suite to a root note
 * @param {String} root 
 * @param {Array<String>} scale 
 */
function applySuite(root, scale){
  const result = [root];

  for (let i = 1; i < scale.length; i++) {
    let degree = /[2-7]/g.exec(scale[i]);
    result.push(
      shiftNote(
        MAJOR_SCALES[root][parseInt(degree?.[0]) - 1],
        ['bb', 'b', '', '#', '##'].indexOf((scale[i].match(/bb|##|b|#/) || [''])[0]) - 2
      )
    );
  }

  result.push(root);
  
  return result;
}

/**
 * Shifts a note by a certain number of semitones
 * @param {String} note 
 * @param {Number} semitones 
 */
function shiftNote(note, semitones) {
  let result = note;

  if (semitones < 0) {
         if (note.endsWith('b') && semitones == -2) result += 'bb';
    else if (note.endsWith('b') && semitones == -1) result += 'b';
    else if (note.endsWith('##') && semitones == -2) result = result.slice(0, -2);
    else if (note.endsWith('##') && semitones == -1) result = result.slice(0, -1);
    else if (note.endsWith('#') && semitones == -2) result = result.slice(0, -1) + 'b';
    else if (note.endsWith('#') && semitones == -1) result = result.slice(0, -1);
    else if (semitones == -2) result += 'bb';
    else if (semitones == -1) result += 'b';
  }
  else if (semitones > 0) {
         if (note.endsWith('#') && semitones == 2) result += '##';
    else if (note.endsWith('#') && semitones == 1) result += '#';
    else if (note.endsWith('bb') && semitones == 2) result = result.slice(0, -2);
    else if (note.endsWith('bb') && semitones == 1) result = result.slice(0, -1);
    else if (note.endsWith('b') && semitones == 2) result = result.slice(0, -1) + '#';
    else if (note.endsWith('b') && semitones == 1) result = result.slice(0, -1);
    else if (semitones == 2) result += '##';
    else if (semitones == 1) result += '#';
  }

  return result;
}

/**
 * Plays a piano note at desired pitch
 * @param {String} note 
 * @param {Boolean} octave 
 */
function pianoNote(note, octave) {
  let source = audioCtx.createBufferSource();
  fetch('./middlec.wav')
    .then(response => response.arrayBuffer())
    .then(res => {
      audioCtx.decodeAudioData(res, buffer => {
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.detune.value = 100 * NOTES.indexOf(simplifyNote(note)) + (octave ? 1200 : 0);
        source.start(0);
      });
      let key = document.getElementsByClassName('key')[NOTES.indexOf(simplifyNote(note)) + (octave ? 12 : 0)];
      key.classList.add('pressed');
      setTimeout(() => key.classList.remove('pressed'), 250);
    });
}

let playIndex = 1;
let playOctave = false;
/**
 * Plays a scale
 * @param {Array<String>} scale 
 * @param {String} prev
 */
function playScale(prev) {
  let suite = [currentRoot].concat(applySuite(currentRoot, currentScale));
  if (!playOctave && NOTES.indexOf(simplifyNote(suite[playIndex])) < NOTES.indexOf(simplifyNote(prev))) playOctave = true;
  pianoNote(suite[playIndex], playOctave);
  playIndex++;
  setTimeout(() => {
    if (playIndex < suite.length) playScale(suite[playIndex - 1]);
    else {
      playIndex = 1;
      playOctave = false;
      enableButtons();
    }
  }, 250);
}

/**
 * Plays a multiple notes at the same time
 * @param {Array<String>} notes 
 * @param {Boolean} octave
 */
function playNotes(notes) {
  let prev = null;
  for (let note of notes) {
    pianoNote(note, NOTES.indexOf(simplifyNote(note)) < NOTES.indexOf(simplifyNote(prev)));
    prev = note;
  }
}

/**
 * Plays a diatonic chord of a degree
 * @param {Array<String>} scale 
 * @param {Number} root 
 */
function playChord(scale, degree){
  let chord = [scale[degree]];
  for (let i = 2; i < 6; i += 2) chord.push(scale[(degree + i) % scale.length]);
  playNotes(chord);
}

let play251Index = 0;
/**
 * Plays a 2-5-1 progression
 */
function play251(){
  let suite = applySuite(currentRoot, currentScale);
  suite.pop();
  playChord(suite, play251Index == 0 ? 1 : (play251Index == 1 ? 4 : 0));
  play251Index++;
  setTimeout(() => {
    if (play251Index < 3) play251();
    else {
      play251Index = 0;
      enableButtons();
    }
  }, 1000);
}

/**
 * Returns simplest enharmonic
 * @param {String} note 
 * @returns 
 */
function simplifyNote(note) {
  return NOTES[MORE_NOTES[note] % 12];
}

/**
 * Disables all inputs
 */
function disableButtons(){
  document.getElementById('play').disabled = true;
  document.getElementById('play-2-5-1').disabled = true;
  document.getElementById('root-select').disabled = true;
  document.getElementById('scale-select').disabled = true;
}

/**
 * Enables all inputs
 */
function enableButtons(){
  document.getElementById('play').disabled = false;
  document.getElementById('play-2-5-1').disabled = false;
  document.getElementById('root-select').disabled = false;
  document.getElementById('scale-select').disabled = false;
}

/**
 * Updates the scale display and enables play buttons
 * @param {Array<String>} scale 
 */
function updateScale(scale){
  document.getElementById('play').disabled = false;
  document.getElementById('play-2-5-1').disabled = false;
  document.getElementById('output').textContent = scale.join(' - ').replaceAll('b', '♭').replaceAll('#', '♯');
  let keys = Array.from(document.getElementsByClassName('key'));
  for (let key of keys) {
    key.classList.remove('focus');
    key.classList.remove('focus-root');
    key.children[0].textContent = '';
  }
  let octave = false;
  let prev = null;
  let i = -1;
  for (let note of scale){
    i++;
    if (NOTES.indexOf(simplifyNote(note)) < NOTES.indexOf(simplifyNote(prev))) octave = true;
    let ind = NOTES.indexOf(simplifyNote(note)) + (octave ? 12 : 0);

    if (simplifyNote(currentRoot) == simplifyNote(note)){
      keys[ind].children[0].textContent = '1';
      keys[ind].classList.add('focus-root');
      checked = true;
      continue;
    }
    keys[ind].children[0].textContent = currentScale[i].replaceAll('b', '♭').replaceAll('#', '♯');
    keys[ind].classList.add('focus');
    prev = note;
  }
}
