const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let frequencies = [];

document.getElementById("output-container").style.visibility = "hidden";

document.getElementById("intonation-select").addEventListener("change", u);
document.getElementById("root-select").addEventListener("change", u);

function u() {
  let root = document.getElementById("root-select");

  frequencies = [];
  let start = -1;
  switch (document.getElementById("intonation-select").value) {
    case "12tet":
      for (let i = 0; i < 13; i++)
        frequencies.push(440 * Math.pow(2, (i - 9) / 12));
      f(
        "f(n)=440\\times 2^{\\frac{n}{12}}\\\\\\\\" +
          "\\large \\text{Where } n\\text{ is the note in distance of semitones to } A440",
      );
      break;

    case "5just":
      if (!root.value) return h();
      start = parseInt(root.value) + 9;
      for (let i = 0; i < 13; i++)
        frequencies.push(
          440 *
            Math.pow(2, parseInt(root.value) / 12) *
            Math.pow(2, Math.floor(i / 12)) *
            [
              1,
              16 / 15,
              9 / 8,
              6 / 5,
              5 / 4,
              4 / 3,
              45 / 32,
              3 / 2,
              8 / 5,
              5 / 3,
              9 / 5,
              15 / 8,
            ][Math.floor(i % 12)],
        );

      f(
        "f(n)=440\\cdot2^{\\frac{a}{12}}\\cdot2^{\\Big\\lfloor\\frac{n}{12}\\Big\\rfloor}\\cdot " +
          "\\rm{R}\\Big[\\left\\lfloor n+1\\right\\rfloor\\bmod{|\\,\\rm{R}\\,|}\\Big]\\\\\\\\" +
          "\\large \\text{Where } a \\text{ is the root in distance of semitones to } A440 \\text{,}\\\\" +
          "\\large n\\text{ is the note in distance of semitones to the root,}\\\\" +
          "\\large \\rm{R}\\text{ is the ratios from the root to each scale degree:}\\\\" +
          "\\Large \\rm{R}=\\left[1,\\frac{16}{15},\\frac{9}{8},\\frac{6}{5},\\frac{5}{4},\\frac{4}{3}," +
          "\\frac{45}{32},\\frac{3}{2},\\frac{8}{5},\\frac{5}{3},\\frac{9}{5},\\frac{15}{8}\\right]",
      );
      break;

    case "pythagorean":
      if (!root.value) return h();
      start = parseInt(root.value) + 9;
      for (let i = 0; i < 13; i++) {
        let k = ((7 * (Math.floor(i) % 12) + 6) % 12) - 6;
        frequencies.push(
          440 *
            Math.pow(
              2,
              parseInt(root.value) / 12 +
                Math.floor(i / 12) -
                Math.floor(k * Math.log2(3 / 2)),
            ) *
            Math.pow(3 / 2, k),
        );
      }
      f(
        "f(x)=440\\times2^{\\frac{a}{12}+\\Big\\lfloor \\frac{x}{12} \\Big\\rfloor-\\Big\\lfloor k \\log_2{\\frac{3}{2}} \\Big\\rfloor}\\times" +
          "\\left(\\frac{3}{2}\\right)^k\\\\\\\\" +
          "\\large \\text{Where } a \\text{ is the root in distance of semitones to } A440 \\text{,}\\\\" +
          "\\large n\\text{ is the note in distance of semitones to the root,}\\\\" +
          "\\large k\\text{ is the calculated ratio:}\\\\" +
          "\\Large k=\\bigg( \\Big( 7\\big( \\lfloor x \\rfloor \\bmod{12} \\big)+6 \\Big) \\bmod{12} \\bigg)-6",
      );
      break;

    default:
      return;
  }

  document.getElementById("output-container").style.visibility = "visible";
  for (let c_ of document.getElementById("output").children[0].children)
    for (let c of c_.children) if (c.nodeName == "TD") c.remove();

  if (start >= 0) {
    let c = document.getElementById("output").children[0];
    while (c.childNodes.length > 1) c.removeChild(c.lastChild);

    for (let i = 0; i < 12; i++) {
      let tr = document.createElement("tr");
      let th = document.createElement("th");
      tr.append(th);
      th.classList.add("no-select");
      th.textContent = [
        "C",
        "C♯/D♭",
        "D",
        "D♯/E♭",
        "E",
        "F",
        "F♯/G♭",
        "G",
        "G♯/A♭",
        "A",
        "A♯/B♭",
        "B",
      ][(start + i) % 12];
      c.append(tr);
    }
  }

  for (let i = 0; i < frequencies.length; i++) {
    let td = document.createElement("td");
    td.textContent = Math.round((frequencies[i] + Number.EPSILON) * 100) / 100;
    document.getElementById("output").children[0].children[i + 1]?.append(td);
  }
}

function h() {
  document.getElementById("output-container").style.visibility = "hidden";
}

function f(t) {
  document.getElementById("output-latex").innerText = `$$\\Huge ${t}$$`;
  MathJax.typeset();
}

/**
 *
 * @param {Array<Number>} notes
 * @returns {void}
 */
function playScale(notes) {
  if (notes.length <= 0) return;

  var oscillator = audioCtx.createOscillator();
  oscillator.type = "sine";
  oscillator.connect(audioCtx.destination);
  oscillator.frequency.value = notes[0];
  oscillator.start();

  setTimeout(() => {
    notes.shift();
    oscillator.stop();
    oscillator.disconnect(audioCtx.destination);
    playScale(notes);
  }, 250);
}
