// Module « Bien utiliser l'IA » : page de présentation enrichie (décision de Denis du 25/11/2026, maquette docs/maquettes/maquette-bien-utiliser-ia-presentation-2026-11-25.html).
// Les textes vivent dans data/buiaEntree.js (BUIA_PRESENTATION) ; index.js les assemble avec les chemins, les familles et le plafond lus dans leurs sources.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const D = require('../data/buiaEntree.js');
const M = require('../data/buiaModeles.js');
const G = require('../modules/bien-utiliser-ia/gardeLogique.js');

const lire = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const P = D.BUIA_PRESENTATION;
const familles = M.BUIA_FAMILLES.map((f) => f.charAt(0).toLowerCase() + f.slice(1));

// Tous les textes affichables, les fonctions étant appelées avec les valeurs réelles.
function textes() {
  const t = [P.accroche, P.cta, P.ceSert.titre, ...P.ceSert.paragraphes, P.chemins.titre, P.chemins.niveaux.titre, P.chemins.niveaux.texte, P.trouve.titre];
  P.trouve.items.forEach((i) => t.push(i.titre, typeof i.texte === 'function' ? i.texte(familles) : i.texte));
  t.push(P.garde.titre);
  P.garde.paragraphes.forEach((p) => t.push(typeof p === 'function' ? p(G.BUIA_GARDE_MAX) : p));
  t.push(P.pro.titre, P.pro.intro);
  P.pro.items.forEach((i) => t.push(i.titre, i.texte));
  t.push(P.sources.titre, ...P.sources.paragraphes, P.nePasFaire.titre, ...P.nePasFaire.items);
  return t.map((x) => x.replace(/<[^>]+>/g, '').replace(/&#8594;/g, '→'));
}

test('présentation : sept rubriques en plus de l\'accroche, dans l\'ordre de la maquette', () => {
  const src = lire('modules/bien-utiliser-ia/index.js');
  const ordre = ['P.ceSert.titre', 'P.chemins.titre', 'P.trouve.titre', 'P.garde.titre', 'P.pro.titre', 'P.sources.titre', 'P.nePasFaire.titre'];
  let pos = -1;
  ordre.forEach((o) => { const i = src.indexOf(o, pos + 1); assert.ok(i > pos, o + ' absent ou dans le désordre'); pos = i; });
  ['bi-compass', 'bi-signpost-split', 'bi-collection', 'bi-floppy', 'bi-people', 'bi-patch-question', 'bi-slash-circle'].forEach((ic) => assert.ok(src.includes(ic), ic));
  assert.ok(src.includes('ctaLabel: BUIA_PRESENTATION.cta'));
});

test('présentation : chemins, familles de modèles et plafond viennent de leurs sources, jamais recopiés', () => {
  const src = lire('modules/bien-utiliser-ia/index.js');
  assert.ok(src.includes('buiaChemins().map'));
  assert.ok(src.includes('buiaFamilles()'));
  assert.ok(src.includes('BUIA_GARDE_MAX'));
  const phrase = P.trouve.items[1].texte(familles);
  M.BUIA_FAMILLES.forEach((f) => assert.ok(phrase.toLowerCase().includes(f.toLowerCase()), f));
  assert.match(phrase, /quatre familles/);
  assert.match(P.garde.paragraphes[0](G.BUIA_GARDE_MAX), /\(vingt au plus\)/);
  assert.equal(G.BUIA_GARDE_MAX, 20, 'le plafond a changé : relire la phrase de la présentation');
  assert.equal(D.buiaNombreEnLettres(M.BUIA_FAMILLES.length), 'quatre');
});

test('présentation : les lignes ajoutées à « Ce que ce module ne fait pas » sont là, les quatre anciennes aussi', () => {
  assert.equal(P.nePasFaire.items.length, 6);
  assert.ok(P.nePasFaire.items.some((t) => /ne classe pas les assistants et ne recommande aucun abonnement payant/.test(t)));
  assert.ok(P.nePasFaire.items.some((t) => /ne dit jamais si une réponse est juste/.test(t)));
  assert.ok(P.nePasFaire.items[0].startsWith('Il n’envoie rien'));
});

test('présentation : règles de texte (tiret long, « on », facultatif, prompt, robot, nom d\'outil, mot « IA », apostrophe droite, durée)', () => {
  textes().forEach((t) => {
    assert.ok(t.length > 0);
    assert.ok(!/[–—]/.test(t), 'tiret long : ' + t);
    assert.ok(!/(^|[^\p{L}])[Oo]n([^\p{L}]|$)/u.test(t), 'mot « on » : ' + t);
    assert.ok(!/facultatif/i.test(t), 'facultatif : ' + t);
    assert.ok(!/prompt/i.test(t), 'prompt : ' + t);
    assert.ok(!/robot/i.test(t), 'robot : ' + t);
    assert.ok(!/ChatGPT|Mistral|Gemini|Copilot|Perplexity|Claude|OpenAI|Anthropic/.test(t), 'nom d\'outil : ' + t);
    assert.ok(!/\bIA\b/.test(t), 'mot IA : ' + t);
    assert.ok(!/'/.test(t), 'apostrophe droite : ' + t);
    assert.ok(!/\b\d+\s*(minutes?|min|heures?|secondes?)\b/i.test(t), 'durée annoncée : ' + t);
  });
});

test('présentation : aucun chiffre qui vieillit (prix, quotas, pourcentages, années)', () => {
  textes().forEach((t) => {
    assert.ok(!/[0-9]/.test(t), 'chiffre dans : ' + t);
    assert.ok(!/€|\$|%/.test(t), 'prix ou pourcentage : ' + t);
  });
});

test('les textes qui renvoient vers « Mes demandes » citent le vrai titre du chemin (J’ai un papier ou une situation)', () => {
  const titre = D.BUIA_CHEMINS.find((c) => c.id === 'modeles').titre;
  assert.equal(titre, 'J’ai un papier ou une situation');
  const libre = fs.readFileSync(path.join(__dirname, '..', 'data', 'buiaLibreTextes.js'), 'utf8');
  assert.ok(libre.includes('au chemin « ' + titre + ' »'), 'le texte de l’écran « Garder mes demandes » doit citer le titre du chemin');
  assert.ok(!/au chemin « Mes modèles »/.test(libre));
});
