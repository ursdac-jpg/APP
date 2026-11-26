// Module « Bien utiliser l'IA », commit 5 : assemblage du modèle 4 « Comprendre un courrier reçu » (modeleLogique.js), son fichier de phrases
// (prompts/bien-utiliser-modele-4.md), les textes du chemin 2 (data/buiaModelesTextes.js) et un contrôle de l'écran (modelesUi.js, non chargé par les tests).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const M = require('../data/buiaModeles.js');
const T = require('../data/buiaModelesTextes.js');
const B = require('../modules/bien-utiliser-ia/blocs.js');
const L = require('../modules/bien-utiliser-ia/modeleLogique.js');
const P = require('../modules/bien-utiliser-ia/papierLogique.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8');
const def = L.buiaDefModele(4);
const lecture = B.buiaLireBlocs(lire(def.fichier));
const blocs = lecture.blocs;
const jour = new Date(2026, 10, 23, 10, 0, 0);
const COURRIER = M.BUIA_COURRIERS_FICTIFS.B.texte;
const complet = (surcharge) => {
  const s = L.buiaSaisieParDefaut(4);
  s.champs.situation = 'J’ai reçu ce courrier de l’agence et je ne sais pas quoi faire.';
  s.champs.courrier = COURRIER;
  return Object.assign(s, surcharge || {});
};
const assembler = (saisie, ctx) => L.buiaAssemblerModele(4, blocs, saisie, Object.assign({ aujourdhui: jour, alerte: P.buiaAlerteDates(COURRIER, jour), reprise: false }, ctx || {}));

// ---------------- Le fichier du modèle ----------------
test('le fichier du modèle 4 contient tous les blocs demandés, sans crochet ni tiret long, repères une seule fois', () => {
  assert.deepEqual(L.buiaVerifierBlocsModele(4, lecture), []);
  assert.ok(L.buiaNomsBlocsModele(4).length >= 14);
});

test('un fichier abîmé est détecté : bloc manquant, crochet, tiret long, repère en double', () => {
  const sans = Object.assign({}, blocs); delete sans.regles;
  assert.ok(L.buiaVerifierBlocsModele(4, { blocs: sans, doublons: [] }).some((p) => /regles/.test(p)));
  assert.ok(L.buiaVerifierBlocsModele(4, { blocs: Object.assign({}, blocs, { but: 'Un [crochet]' }), doublons: [] }).some((p) => /Crochet/.test(p)));
  assert.ok(L.buiaVerifierBlocsModele(4, { blocs: Object.assign({}, blocs, { but: 'Un — tiret' }), doublons: [] }).some((p) => /Tiret/.test(p)));
  assert.ok(L.buiaVerifierBlocsModele(4, { blocs: Object.assign({}, blocs, { but: '{{courrier}}' }), doublons: [] }).some((p) => /courrier/.test(p)));
  assert.ok(L.buiaVerifierBlocsModele(4, { blocs, doublons: ['but'] }).some((p) => /deux fois/.test(p)));
  assert.ok(L.buiaVerifierBlocsModele(99, lecture)[0].includes('inconnu'));
});

// ---------------- L'assemblage ----------------
test('assemblage par défaut : la situation et le courrier sont dans la demande, rien ne reste à compléter', () => {
  const r = assembler(complet());
  assert.equal(r.aCompleter, false);
  assert.deepEqual(r.manque, []);
  assert.ok(r.texte.includes('J’ai reçu ce courrier de l’agence'));
  assert.ok(r.texte.includes('convocation à un entretien de suivi'));
  assert.ok(!/[\[\]{}]/.test(r.texte), 'crochet ou accolade restés');
  assert.ok(!/\n\n\n/.test(r.texte), 'deux lignes vides de suite');
  assert.ok(!/[–—]/.test(r.texte));
});

test('la date du jour est ajoutée par le code, en français, sans année décalée', () => {
  const r = assembler(complet());
  assert.ok(r.texte.includes('Aujourd’hui, nous sommes le lundi 23 novembre 2026.') || r.texte.includes('23 novembre 2026'));
});

test('champ obligatoire vide : la demande reste à compléter, le message dit quoi, le repère est visible', () => {
  const s = complet(); s.champs.courrier = '   ';
  const r = assembler(s);
  assert.equal(r.aCompleter, true);
  assert.deepEqual(r.manque, ['le courrier']);
  assert.ok(r.texte.includes('[à compléter : coller le courrier ici]'));
  assert.equal(L.buiaMessageACompleter(r.manque), 'Pour copier votre demande, complétez : le courrier.');
  const s2 = complet(); s2.champs.situation = ''; s2.champs.courrier = '';
  assert.deepEqual(assembler(s2).manque, ['votre situation', 'le courrier']);
  assert.equal(L.buiaMessageACompleter([]), '');
});

test('la situation perd son point final (le bloc ajoute le sien) et les espaces autour', () => {
  const s = complet(); s.champs.situation = '  Je dois répondre vite...  ';
  const r = assembler(s);
  assert.ok(!/\.\.\./.test(r.texte.split('\n').filter((l) => l.includes('Je dois répondre vite'))[0] || ''));
});

test('un seul bloc par groupe de choix : changer un choix remplace la phrase, jamais deux phrases contradictoires', () => {
  def.groupes.forEach((g) => {
    const phrases = g.choix.map((c) => {
      const s = complet(); s.choix[g.id] = c.v;
      return assembler(s).texte;
    });
    assert.equal(new Set(phrases).size, g.choix.length, 'choix identiques dans ' + g.id);
    g.choix.forEach((c, i) => {
      g.choix.forEach((autre, j) => {
        if (i === j) { return; }
        const bloc = String(blocs[autre.bloc]).trim();
        if (bloc && !phrases[i].includes(bloc)) { return; }
        assert.ok(!phrases[i].includes(bloc), 'phrase de ' + autre.v + ' présente avec ' + c.v);
      });
      assert.ok(phrases[i].includes(String(blocs[c.bloc]).trim().split('\n')[0]), 'phrase de ' + c.v + ' absente');
    });
  });
});

test('une valeur de choix inconnue revient à la valeur par défaut (saisie nettoyée)', () => {
  const s = complet(); s.choix.longueur = 'énorme'; s.choix.zzz = 'x';
  assert.equal(L.buiaNettoyerSaisie(4, s).choix.longueur, 'moyen');
  assert.equal(L.buiaNettoyerSaisie(4, s).choix.zzz, undefined);
  assert.equal(assembler(s).texte, assembler(complet()).texte);
  assert.deepEqual(L.buiaNettoyerSaisie(4, null), L.buiaSaisieParDefaut(4));
});

test('ordre fixe : but, date, situation, courrier, choix, règles', () => {
  const r = assembler(complet());
  const el = r.lignes.map((l) => l.element);
  assert.equal(el[0], 1);
  assert.ok(el.indexOf(6) < el.indexOf(2) && el.indexOf(2) < el.indexOf(3) && el.indexOf(3) < el.indexOf(4));
  assert.equal(el[el.length - 1], 5);
  r.lignes.forEach((l) => { assert.ok(l.element >= 1 && l.element <= 6); });
});

test('la reprise de la date est ajoutée seulement si la personne la demande ET qu’une date est proche', () => {
  const sans = assembler(complet(), { reprise: false }).texte;
  const avec = assembler(complet(), { reprise: true }).texte;
  assert.ok(!sans.includes('Une date proche est écrite dans le courrier'));
  assert.ok(avec.includes('Une date proche est écrite dans le courrier : 24 novembre 2026'));
  const loin = assembler(complet(), { reprise: true, alerte: P.buiaAlerteDates('Rendez-vous le 3 mars 2027.', jour) }).texte;
  assert.ok(!loin.includes('Une date proche'));
  assert.ok(!/\n\n\n/.test(avec));
});

test('les trois courriers fictifs donnent une demande complète, sans repère restant', () => {
  ['A', 'B', 'C'].forEach((k) => {
    const s = complet(); s.champs.courrier = M.BUIA_COURRIERS_FICTIFS[k].texte;
    const r = assembler(s, { alerte: P.buiaAlerteDates(M.BUIA_COURRIERS_FICTIFS[k].texte, jour) });
    assert.equal(r.aCompleter, false, k);
    assert.ok(r.texte.includes(M.BUIA_COURRIERS_FICTIFS[k].texte.trim()), k);
  });
});

test('modèles codés : les treize ; un numéro inconnu est indiqué comme indisponible', () => {
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].forEach((id) => assert.equal(L.buiaModeleDisponible(id), true, String(id)));
  [0, 14].forEach((id) => assert.equal(L.buiaModeleDisponible(id), false, String(id)));
  assert.equal(L.buiaDefModele(14), null);
});

// ---------------- Les textes affichés ----------------
function collecter(o, sortie) {
  if (typeof o === 'string') { sortie.push(o); } else if (Array.isArray(o)) { o.forEach((x) => collecter(x, sortie)); } else if (o && typeof o === 'object') { Object.keys(o).forEach((k) => collecter(o[k], sortie)); }
  return sortie;
}

test('textes du chemin 2 : pas de tiret long, pas de « on », pas de « prompt », pas de mot IA, apostrophes typographiques', () => {
  const textes = collecter([T.BUIA_C2_TITRE, T.BUIA_C2_SOUS_TITRE, T.BUIA_C2_BIENTOT, T.BUIA_C2_BIENTOT_PASTILLE, T.BUIA_C2_E1, T.BUIA_C2_ALERTE, T.BUIA_C2_E2, T.BUIA_C2_E3,
    T.BUIA_C2_ETAPES.map((e) => e.label), M.BUIA_MODELES.map((m) => [m.nom, m.variantes]), M.BUIA_FAMILLES, M.BUIA_RAPPEL_PRO, def.champs.map((c) => [c.lib, c.aide, c.exemple, c.court]),
    def.groupes.map((g) => [g.titre, g.choix.map((c) => c.lib)])], []);
  assert.ok(textes.length > 60);
  textes.forEach((x) => {
    assert.ok(!/[–—]/.test(x), 'tiret long : ' + x);
    assert.ok(!/(^|[^\p{L}])[Oo]n([^\p{L}]|$)/u.test(x), '« on » : ' + x);
    assert.ok(!/prompt/i.test(x), 'prompt : ' + x);
    assert.ok(!/\bIA\b/.test(x), 'IA : ' + x);
    assert.ok(!/'/.test(x), 'apostrophe droite : ' + x);
  });
});

test('aucune durée annoncée, aucune félicitation dans les textes du chemin 2', () => {
  collecter([T.BUIA_C2_E1, T.BUIA_C2_E2, T.BUIA_C2_E3], []).forEach((x) => {
    assert.ok(!/\b\d+\s*(min|minutes|secondes)\b/i.test(x), x);
    assert.ok(!/bravo|félicitations/i.test(x), x);
  });
});

test('les trois étapes de la barre existent, avec une icône chacune', () => {
  assert.equal(T.BUIA_C2_ETAPES.length, 3);
  T.BUIA_C2_ETAPES.forEach((e) => { assert.ok(e.label && /bi-/.test(e.icone)); });
});

// ---------------- L'écran (non chargé par les tests : contrôle du fichier lui-même) ----------------
const source = lire('modules/bien-utiliser-ia/modelesUi.js');

test('modelesUi.js est un script valide', () => {
  assert.doesNotThrow(() => new vm.Script(source, { filename: 'modelesUi.js' }));
});

test('chaque action des boutons de l’écran est prise en charge par buiaC2Clic', () => {
  const dansHtml = new Set();
  const re = /data-buia-act="([a-z]+)"/g;
  let m; while ((m = re.exec(source))) { dansHtml.add(m[1]); }
  const corps = source.slice(source.indexOf('function buiaC2Clic'));
  dansHtml.forEach((a) => { assert.ok(new RegExp("act === '" + a + "'").test(corps), 'action non gérée : ' + a); });
  assert.ok(dansHtml.size >= 12);
  ['vu', 'reprise'].forEach((a) => assert.ok(new RegExp("act === '" + a + "'").test(corps), a));
});

test('l’écran n’écrit rien sur l’appareil et n’envoie rien : pas de stockage, pas de requête', () => {
  assert.ok(!/localStorage|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon/.test(source));
  assert.ok(!/fetch\(/.test(source));
  assert.ok(!/[–—]/.test(source), 'tiret long dans le code');
});

test('la page et la route existent : app.js, index.html, aide', () => {
  const app = lire('js/app.js'), html = lire('index.html');
  assert.ok(app.includes("'bien-utiliser-ia-modeles': typeof pageBienUtiliserIaModeles === 'function'"));
  assert.ok(app.includes("AIDE_PAGES['bien-utiliser-ia-modeles']"));
  const ordre = ['data/buiaModeles.js', 'data/buiaModelesTextes.js', 'modules/bien-utiliser-ia/papierLogique.js', 'modules/bien-utiliser-ia/modeleLogique.js', 'modules/bien-utiliser-ia/comprendreUi.js', 'modules/bien-utiliser-ia/modelesUi.js', 'modules/bien-utiliser-ia/index.js'];
  const pos = ordre.map((s) => html.indexOf('src="' + s + '"'));
  pos.forEach((p, i) => assert.ok(p > 0, 'balise absente : ' + ordre[i]));
  assert.deepEqual(pos.slice().sort((a, b) => a - b), pos, 'ordre des balises script');
});

test('« Aucun ne convient » : un seul chemin, vers « Écrire ma propre demande » ; plus de bouton « sur mesure » ni de message « sera ajoutée bientôt » (décision de Denis du 25/11/2026)', () => {
  assert.deepEqual(Object.keys(T.BUIA_C2_E1.aucunConvient).sort(), ['ecrire', 'texte', 'titre']);
  assert.ok(!('BUIA_C2_AIDE' in T), 'plus de message d’attente');
  const ui = lire('modules/bien-utiliser-ia/modelesUi.js').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/surmesure|surMesure|msgAucun|BUIA_C2_AIDE/.test(ui), 'aucune trace du bouton dans l’écran');
  assert.ok(!/sur mesure/.test(JSON.stringify(T.BUIA_C2_E1)), 'aucun texte « sur mesure »');
});
