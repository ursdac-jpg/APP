/* confirmerAction(titre, texte, libelleConfirmer, classeConfirmer, onConfirmer, ...) : le TROISIEME argument est le TEXTE du bouton de confirmation.
   Deux appels (modules ATS et Comparer mes pistes) passaient la fonction a la place : le bouton affichait le code de la fonction et « Recommencer » ne faisait rien
   (trouve le 12/11/2026 par le protocole de test des parcours). Ce test lit tout le code de l'application et refuse un troisieme argument qui n'est pas du texte. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');

function fichiers(dossier, sortie) {
  fs.readdirSync(dossier).forEach(function (nom) {
    var p = path.join(dossier, nom);
    if (/node_modules|A_envoyer|\.git|vendor/.test(p)) { return; }
    if (fs.statSync(p).isDirectory()) { fichiers(p, sortie); } else if (/\.js$/.test(nom)) { sortie.push(p); }
  });
  return sortie;
}

// Les arguments d'un appel, decoupes au niveau 0 (textes entre guillemets, parentheses, crochets et accolades respectes).
function argumentsDeLAppel(source, debut) {
  var profondeur = 0, courant = '', args = [], guillemet = null;
  for (var k = debut; k < source.length; k++) {
    var c = source[k];
    if (guillemet) {
      courant += c;
      if (c === '\\') { courant += source[++k]; } else if (c === guillemet) { guillemet = null; }
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { guillemet = c; courant += c; continue; }
    if (c === '(' || c === '[' || c === '{') { profondeur++; }
    if (c === ')' || c === ']' || c === '}') {
      if (profondeur === 0) { args.push(courant.trim()); return args; }
      profondeur--;
    }
    if (c === ',' && profondeur === 0) { args.push(courant.trim()); courant = ''; continue; }
    courant += c;
  }
  return args;
}

test('confirmerAction : le troisieme argument est toujours un texte (jamais une fonction ni des options)', function () {
  var fautes = [], examines = 0;
  ['js', 'modules', 'data'].forEach(function (dossier) {
    fichiers(path.join(RACINE, dossier), []).forEach(function (f) {
      var source = fs.readFileSync(f, 'utf8'), i = -1;
      while ((i = source.indexOf('confirmerAction(', i + 1)) >= 0) {
        if (/function\s+$/.test(source.slice(Math.max(0, i - 10), i))) { continue; }
        examines++;
        var args = argumentsDeLAppel(source, i + 'confirmerAction('.length);
        var a3 = args[2] || '';
        // Un texte entre guillemets, ou une variable / expression dont le nom annonce un texte (libelle, label, texte).
        if (args.length >= 3 && !/^['"`]/.test(a3) && !/^(lib|label|texte)/i.test(a3) && !/^[\w.]*\s*\+/.test(a3)) {
          fautes.push(path.relative(RACINE, f) + ' ligne ' + source.slice(0, i).split('\n').length + ' : 3e argument « ' + a3.slice(0, 40).replace(/\s+/g, ' ') + ' »');
        }
      }
    });
  });
  assert.ok(examines > 40, 'le test doit examiner les appels (examines : ' + examines + ')');
  assert.deepStrictEqual(fautes, [], 'confirmerAction mal appelee : ' + fautes.join(' | '));
});
