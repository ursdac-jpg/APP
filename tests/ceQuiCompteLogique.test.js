const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const L = require('../modules/ce-qui-compte/logique.js');
const V = require('../data/cqcpmValeurs.js');
const C = require('../data/cqcpmConditions.js');
const D = require('../data/cqcpmCartes.js');

// Les conditions du ROME : le fichier généré est un script classique (variable globale), on le relit sans le modifier.
const conditionsRome = (() => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'data', 'conditionsRome.js'), 'utf8');
  return new Function(src + '; return CONDITIONS_ROME;')();
})();

// ---------- Données ----------
test('les dix-neuf valeurs, en cinq groupes, sans identifiant en double', () => {
  assert.equal(V.CQCPM_VALEURS_GROUPES.length, 5);
  assert.equal(V.CQCPM_VALEURS.length, 19);
  const ids = V.CQCPM_VALEURS.map((v) => v.id);
  assert.equal(new Set(ids).size, 19);
  assert.deepEqual(V.CQCPM_PILES.map((p) => p.id), ['ess', 'imp', 'moins']);
});

test('sept thèmes de conditions, aucun identifiant en double, trois réponses', () => {
  assert.equal(C.CQCPM_CONDITIONS_THEMES.length, 7);
  const ids = [];
  C.CQCPM_CONDITIONS_THEMES.forEach((t) => t.conds.forEach((c) => ids.push(c.id)));
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.length >= 45 && ids.length <= 60, 'une cinquantaine de conditions : ' + ids.length);
  assert.deepEqual(C.CQCPM_REPONSES_CONDITIONS.map((r) => r.id), ['veux', 'adapte', 'evite']);
  assert.equal(C.CQCPM_ENERGIE_SITUATIONS.length, 4);
});

test('chaque lien vers le ROME désigne une condition qui existe dans data/conditionsRome.js', () => {
  let nb = 0;
  C.CQCPM_CONDITIONS_THEMES.forEach((t) => t.conds.forEach((c) => {
    if (c.rome) { nb++; assert.ok(conditionsRome.libelles[c.rome], c.id + ' -> ' + c.rome); }
  }));
  assert.ok(nb >= 15, 'une quinzaine de conditions sont reliées au ROME : ' + nb);
});

test('huit cartes en quatre thèmes, chaque carte rangée dans un thème connu', () => {
  assert.equal(D.CQCPM_CARTES.length, 8);
  assert.equal(D.CQCPM_THEMES_ACCUEIL.length, 4);
  const themes = D.CQCPM_THEMES_ACCUEIL.map((t) => t.id);
  D.CQCPM_CARTES.forEach((c) => assert.ok(themes.includes(c.theme), c.id));
  assert.equal(new Set(D.CQCPM_CARTES.map((c) => c.id)).size, 8);
  assert.deepEqual(L.cqcpmCartesDuTheme('aimerais').map((c) => c.id), ['envies', 'inspirent', 'journee']);
  assert.deepEqual(L.cqcpmCartesDuTheme('suite').map((c) => c.id), ['pas']);
});

test('chaque section de résultat renvoie à un champ qui existe', () => {
  D.CQCPM_CARTES.forEach((c) => {
    const ids = L.cqcpmChampsDeCarte(c).map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, 'identifiants de champ en double dans ' + c.id);
    c.resultat.forEach((s) => {
      if (s.champ) { assert.ok(ids.includes(s.champ), c.id + ' : ' + s.champ); }
      (s.champs || []).forEach((x) => assert.ok(ids.includes(x), c.id + ' : ' + x));
    });
  });
});

test('règles d’écriture : aucun tiret long, aucun « facultatif », aucun mot de type, de score ou de diagnostic dans les textes', () => {
  const tout = JSON.stringify([V, C, D]);
  assert.ok(!/[–—]/.test(tout), 'tiret cadratin ou demi-cadratin');
  assert.ok(!/facultatif/i.test(tout));
  assert.ok(!/introverti|extraverti|extravertie|introvertie|mbti|faiblesse|diagnostic/i.test(tout));
  assert.ok(!/\bIA\b/.test(tout), 'le mot IA ne doit jamais être visible');
  assert.ok(!/\b\d+\s*(minutes?|min)\b/i.test(JSON.stringify(D)), 'aucune durée annoncée en minutes');
});

test('aucune icône de visage ni de tête dans les cartes et les conditions', () => {
  const tout = JSON.stringify([V, C, D]);
  ['bi-emoji', 'bi-person-', 'bi-robot', 'bi-brain', 'bi-eye'].forEach((x) => assert.ok(!tout.includes(x), x));
});

// ---------- Contrôle des réponses ----------
test('un texte est coupé à sa longueur maximale et les signes de commande sont retirés', () => {
  const champ = { type: 'texte', id: 'x' };
  const long = 'a'.repeat(L.CQCPM_MAX_TEXTE + 50);
  assert.equal(L.cqcpmNettoyerChamp(champ, long).length, L.CQCPM_MAX_TEXTE);
  assert.equal(L.cqcpmNettoyerChamp({ type: 'texte', id: 'y', court: true }, long).length, L.CQCPM_MAX_TEXTE_COURT);
  assert.equal(L.cqcpmNettoyerChamp(champ, 'bon\u0000jour'), 'bonjour');
  assert.equal(L.cqcpmNettoyerChamp(champ, 42), '');
});

test('une liste d’envies garde de trois à dix phrases non vides, coupées', () => {
  const champ = L.cqcpmChamp(L.cqcpmCarte('envies'), 'envies');
  const entree = Array.from({ length: 14 }, (_, i) => 'envie ' + i);
  assert.equal(L.cqcpmNettoyerChamp(champ, entree).length, 10);
  assert.deepEqual(L.cqcpmNettoyerChamp(champ, ['  a  ', '', '   ', 'b']), ['a', 'b']);
  assert.deepEqual(L.cqcpmNettoyerChamp(champ, 'pas une liste'), []);
});

test('un choix de valeurs ne garde que les identifiants connus, sans doublon, dans la limite de trois', () => {
  const champ = { type: 'choix', id: 'v', max: 3, options: 'valeurs' };
  assert.deepEqual(L.cqcpmNettoyerChamp(champ, ['aider', 'aider', 'inconnu', 'equipe', 'creer', 'stable']), ['aider', 'equipe', 'creer']);
  assert.deepEqual(L.cqcpmNettoyerChamp(champ, 'aider'), []);
});

test('les trois piles et les trois réponses : seules les lignes et les réponses connues passent', () => {
  const piles = L.cqcpmChamp(L.cqcpmCarte('valeurs'), 'piles');
  assert.deepEqual(L.cqcpmNettoyerChamp(piles, { aider: 'ess', creer: 'pile_inconnue', inconnu: 'ess', stable: 'moins' }), { aider: 'ess', stable: 'moins' });
  const cond = L.cqcpmChamp(L.cqcpmCarte('conditions'), 'conditions');
  assert.deepEqual(L.cqcpmNettoyerChamp(cond, { h_nuit: 'evite', h_weekend: 'adapte', zzz: 'veux', l_ext: 'peut-etre' }), { h_nuit: 'evite', h_weekend: 'adapte' });
  assert.deepEqual(L.cqcpmNettoyerChamp(cond, [1, 2]), {});
});

test('poser une réponse recontrôle toute la carte : retirer une envie retire sa fiche', () => {
  const etat = L.cqcpmEtatInitial();
  L.cqcpmPoserReponse(etat, 'envies', 'envies', ['Apprendre le pain', 'Voir la mer', 'Aider un voisin', 'Créer un jardin']);
  L.cqcpmPoserReponse(etat, 'envies', 'retenues', ['Apprendre le pain', 'Aider un voisin', 'Inconnue']);
  assert.deepEqual(L.cqcpmReponsesDe(etat, 'envies').retenues, ['Apprendre le pain', 'Aider un voisin']);
  L.cqcpmPoserReponse(etat, 'envies', 'fiches', [
    { cle: 'Apprendre le pain', attire: 'Faire de mes mains', valeurs: ['creer'], petite: 'Demander une recette' },
    { cle: 'Aider un voisin', attire: 'Rendre service', petite: 'Proposer mon aide samedi' },
    { cle: 'Voir la mer', attire: 'pas retenue' }
  ]);
  assert.equal(L.cqcpmReponsesDe(etat, 'envies').fiches.length, 2, 'la fiche d’une envie non retenue est ignorée');
  L.cqcpmPoserReponse(etat, 'envies', 'envies', ['Voir la mer', 'Créer un jardin', 'Aider un voisin']);
  const r = L.cqcpmReponsesDe(etat, 'envies');
  assert.deepEqual(r.retenues, ['Aider un voisin']);
  assert.deepEqual(r.fiches.map((f) => f.cle), ['Aider un voisin']);
});

test('« Mon prochain petit pas » propose les petites actions écrites dans « Si rien ne m’arrêtait »', () => {
  const etat = L.cqcpmEtatInitial();
  assert.deepEqual(L.cqcpmPetitesActions(etat), []);
  L.cqcpmPoserReponse(etat, 'envies', 'envies', ['a', 'b', 'c']);
  L.cqcpmPoserReponse(etat, 'envies', 'retenues', ['a', 'b']);
  L.cqcpmPoserReponse(etat, 'envies', 'fiches', [{ cle: 'a', petite: 'Appeler un voisin' }, { cle: 'b', petite: '  ' }]);
  assert.deepEqual(L.cqcpmPetitesActions(etat), ['Appeler un voisin']);
  assert.equal(L.cqcpmPoserReponse(etat, 'pas', 'action', ['Appeler un voisin']), true);
  assert.deepEqual(L.cqcpmReponsesDe(etat, 'pas').action, ['Appeler un voisin']);
});

test('une carte ou un champ inconnu ne change rien', () => {
  const etat = L.cqcpmEtatInitial();
  assert.equal(L.cqcpmPoserReponse(etat, 'nexistepas', 'x', 'y'), false);
  assert.equal(L.cqcpmPoserReponse(etat, 'journee', 'nexistepas', 'y'), false);
  assert.deepEqual(etat, L.cqcpmEtatInitial());
});

// ---------- Résultats ----------
function etatConditions() {
  const etat = L.cqcpmEtatInitial();
  L.cqcpmPoserReponse(etat, 'conditions', 'conditions', { h_nuit: 'evite', h_weekend: 'adapte', l_ext: 'veux', c_public: 'veux' });
  L.cqcpmPoserReponse(etat, 'conditions', 'energie', { reflechir: 'seul', difficile: 'depend' });
  L.cqcpmPoserReponse(etat, 'conditions', 'salaire', 'Le Smic, un peu plus');
  return etat;
}
test('résultat de « Comment je veux travailler » : trois listes, énergie, salaire', () => {
  const etat = etatConditions();
  const r = L.cqcpmResultat('conditions', L.cqcpmReponsesDe(etat, 'conditions'), etat);
  const parTitre = (t) => r.sections.filter((s) => s.titre === t)[0];
  assert.deepEqual(parTitre('Ce que je veux').items, ['Travailler à l’extérieur', 'Être en contact avec le public']);
  assert.deepEqual(parTitre('Ce à quoi je peux m’adapter').items, ['Travailler le week-end']);
  assert.deepEqual(parTitre('Ce que je préfère éviter').items, ['Travailler de nuit']);
  assert.deepEqual(parTitre('Mon énergie').items.map((x) => x.reponse), ['seul(e)', 'ça dépend']);
  assert.equal(parTitre('Mon salaire minimum').texte, 'Le Smic, un peu plus');
  assert.equal(r.vide, false);
});
test('« Comment je veux travailler » : le salaire se masque s’il est vide, et le thème « cadre de vie » renvoie vers « Qui fait quoi »', () => {
  const etat = L.cqcpmEtatInitial();
  L.cqcpmPoserReponse(etat, 'conditions', 'conditions', { l_ext: 'veux' });
  const r = L.cqcpmResultat('conditions', L.cqcpmReponsesDe(etat, 'conditions'), etat);
  const salaire = r.sections.filter((s) => s.titre === 'Mon salaire minimum')[0];
  assert.equal(salaire.vide, true);
  assert.equal(salaire.masquerSiVide, true);
  const champ = L.cqcpmChamp(L.cqcpmCarte('conditions'), 'conditions');
  const groupes = L.cqcpmGroupesDe(champ);
  assert.equal(groupes.filter((g) => g.renvoi === 'territoire').map((g) => g.id).join(), 'vie');
});
test('les sept autres cartes : titres de bloc, intitulés de résultat, boutons « passer » et nom des entrées sont dans les données', () => {
  const carte = (id) => L.cqcpmCarte(id);
  assert.equal(carte('journee').ecrans[0].titreBloc, 'Une journée de travail qui me ferait du bien');
  assert.equal(carte('aide').ecrans[0].titreBloc, 'Un moment difficile que vous avez traversé');
  assert.equal(carte('pas').ecrans[0].titreBloc, 'Un petit pas, cette semaine');
  assert.equal(L.cqcpmChamp(carte('experiences'), 'experiences').nomEntree, 'expérience');
  assert.equal(L.cqcpmChamp(carte('inspirent'), 'inspirations').libPasser, 'Rien à ajouter pour l’instant');
  assert.equal(L.cqcpmChamp(carte('envies'), 'envies').libPasser, 'Je ne sais pas pour l’instant');
  assert.equal(L.cqcpmChamp(carte('valeurs'), 'piles').compact, true);
  assert.equal(V.CQCPM_PILES[2].court, 'Moins');
  const etat = L.cqcpmEtatInitial();
  L.cqcpmPoserReponse(etat, 'pas', 'action', ['Demander une recette']);
  L.cqcpmPoserReponse(etat, 'pas', 'qui', ['conseiller']);
  L.cqcpmPoserReponse(etat, 'pas', 'question', 'Un stage de découverte ?');
  const r = L.cqcpmResultat('pas', L.cqcpmReponsesDe(etat, 'pas'), etat);
  const libs = r.sections[0].lignes.map((x) => x.lib);
  assert.ok(libs.includes('Qui peut m’aider') && libs.includes('Ce dont j’aimerais parler avec la personne qui m’accompagne'), libs.join('|'));
});
test('un résultat sans réponse est vide : l’écran affiche « À compléter »', () => {
  D.CQCPM_CARTES.forEach((c) => {
    const r = L.cqcpmResultat(c.id, {}, L.cqcpmEtatInitial());
    assert.equal(r.vide, true, c.id);
    r.sections.forEach((s) => assert.equal(s.vide, true, c.id + ' / ' + s.titre));
  });
  assert.equal(L.cqcpmResultat('nexistepas', {}), null);
});
test('résultat de « Ce qui compte au travail » : trois colonnes dans l’ordre des piles', () => {
  const etat = L.cqcpmEtatInitial();
  L.cqcpmPoserReponse(etat, 'valeurs', 'piles', { apprendre: 'ess', aider: 'ess', stable: 'imp', creer: 'moins' });
  L.cqcpmPoserReponse(etat, 'valeurs', 'moins_parle', ['collectif']);
  const r = L.cqcpmResultat('valeurs', L.cqcpmReponsesDe(etat, 'valeurs'), etat);
  const col = r.sections[0].colonnes;
  assert.deepEqual(col.map((c) => c.id), ['ess', 'imp', 'moins']);
  assert.deepEqual(col[0].items, ['Apprendre et comprendre', 'Aider']);
  assert.deepEqual(r.sections[1].lignes[0].texte, 'Contribuer à un projet collectif');
});
test('résultat d’une carte à entrées : un titre avec la sorte entre parenthèses, des lignes sans les champs vides', () => {
  const etat = L.cqcpmEtatInitial();
  L.cqcpmPoserReponse(etat, 'inspirent', 'inspirations', [{ sorte: ['connue'], nom: 'Ma grand-mère', admire: 'Elle trouvait toujours une solution', apprendre: '', valeurs: ['aider', 'resoudre'] }]);
  const r = L.cqcpmResultat('inspirent', L.cqcpmReponsesDe(etat, 'inspirent'), etat);
  const e = r.sections[0].items[0];
  assert.equal(e.titre, 'Ma grand-mère (une personne que je connais)');
  assert.deepEqual(e.lignes.map((x) => x.lib), ['Ce que j’admire', 'Valeurs']);
  assert.equal(e.lignes[1].texte, 'Aider, Résoudre des problèmes');
});

// ---------- Garder, effacer, disquette ----------
test('une carte vide ne se garde pas ; garder met une copie datée, et marque la carte terminée', () => {
  const etat = L.cqcpmEtatInitial();
  assert.equal(L.cqcpmGarder(etat, 'journee', '2026-11-22'), false);
  L.cqcpmPoserReponse(etat, 'journee', 'matin', 'Je me lève sans me presser.');
  assert.equal(L.cqcpmEstTerminee(etat, 'journee'), false);
  assert.equal(L.cqcpmGarder(etat, 'journee', '2026-11-22'), true);
  assert.equal(L.cqcpmEstGardee(etat, 'journee'), true);
  assert.equal(L.cqcpmEstTerminee(etat, 'journee'), true);
  L.cqcpmPoserReponse(etat, 'journee', 'matin', 'Texte modifié après.');
  assert.equal(etat.gardees.journee.reponses.matin, 'Je me lève sans me presser.', 'ce qui est gardé reste une copie');
  assert.equal(L.cqcpmDateFr('2026-11-22'), '22 novembre 2026');
  assert.equal(L.cqcpmDateFr('2026-12-01'), '1er décembre 2026');
  assert.equal(L.cqcpmDateFr('nimporte quoi'), '');
});
test('« Marquer terminée » exige une réponse ; « ne plus garder » et « effacer » défont ce qui est gardé', () => {
  const etat = etatConditions();
  assert.equal(L.cqcpmMarquerTerminee(etat, 'journee'), false);
  assert.equal(L.cqcpmMarquerTerminee(etat, 'conditions'), true);
  L.cqcpmGarder(etat, 'conditions', '2026-11-22');
  assert.equal(L.cqcpmNombreGardees(etat), 1);
  assert.equal(L.cqcpmNePlusGarder(etat, 'conditions'), true);
  assert.equal(L.cqcpmNombreGardees(etat), 0);
  assert.equal(L.cqcpmCarteCommencee(etat, 'conditions'), true, 'les réponses de la séance restent');
  L.cqcpmGarder(etat, 'conditions', '2026-11-22');
  L.cqcpmEffacerCarte(etat, 'conditions');
  assert.equal(L.cqcpmCarteCommencee(etat, 'conditions'), false);
  assert.equal(L.cqcpmNombreGardees(etat), 0);
  L.cqcpmGarder(L.cqcpmEtatInitial(), 'conditions');
  L.cqcpmToutEffacer(etat);
  assert.deepEqual(etat, L.cqcpmEtatInitial());
});
test('la disquette ne reçoit QUE les cartes gardées, jamais le brouillon de la séance', () => {
  const etat = etatConditions();
  assert.equal(L.cqcpmPourFichier(etat), null, 'rien n’est gardé : rien dans le fichier');
  L.cqcpmPoserReponse(etat, 'journee', 'matin', 'Un brouillon que je ne garde pas.');
  L.cqcpmGarder(etat, 'conditions', '2026-11-22');
  const f = L.cqcpmPourFichier(etat);
  assert.deepEqual(Object.keys(f.cartes), ['conditions']);
  assert.equal(f.version, 1);
  assert.equal(f.cartes.conditions.date, '2026-11-22');
  assert.ok(!JSON.stringify(f).includes('brouillon'));
});
test('ce qui part sur la disquette revient à l’identique, et la carte est alors terminée et gardée', () => {
  const etat = etatConditions();
  L.cqcpmPoserReponse(etat, 'envies', 'envies', ['a', 'b', 'c']);
  L.cqcpmPoserReponse(etat, 'envies', 'retenues', ['a', 'c']);
  L.cqcpmPoserReponse(etat, 'envies', 'fiches', [{ cle: 'a', attire: 'x', valeurs: ['aider'], petite: 'y' }]);
  L.cqcpmGarder(etat, 'conditions', '2026-11-22');
  L.cqcpmGarder(etat, 'envies', '2026-11-21');
  const fichier = JSON.parse(JSON.stringify(L.cqcpmPourFichier(etat)));
  const rel = L.cqcpmDepuisFichier(fichier);
  assert.equal(L.cqcpmNombreGardees(rel), 2);
  assert.deepEqual(rel.gardees.conditions.reponses, etat.gardees.conditions.reponses);
  assert.deepEqual(rel.gardees.envies.reponses, etat.gardees.envies.reponses);
  assert.equal(rel.gardees.envies.date, '2026-11-21');
  assert.equal(L.cqcpmEstTerminee(rel, 'conditions'), true);
  assert.deepEqual(L.cqcpmPourFichier(rel), fichier, 'aller-retour sans perte');
});
test('un fichier abîmé ou malveillant est relu avec méfiance', () => {
  [null, undefined, 'texte', 12, [], {}, { cartes: null }, { cartes: [] }, { cartes: 'x' }].forEach((brut) => {
    const e = L.cqcpmDepuisFichier(brut);
    assert.equal(L.cqcpmNombreGardees(e), 0);
  });
  const hostile = { version: 99, cartes: {
    inconnue: { date: '2026-11-22', reponses: { a: 'b' } },
    journee: { date: 'hier', reponses: { matin: 'x'.repeat(5000), inconnu: 'y', trajet: { piege: 1 } } },
    conditions: { date: '2026-02-30x', reponses: { conditions: { h_nuit: 'evite', faux: 'evite' }, energie: 'pas un objet' } },
    valeurs: { date: '2026-11-22', reponses: { piles: { aider: '<script>' } } },
    envies: 'pas un objet',
    pas: { date: '2026-11-22', reponses: { action: ['y'.repeat(500), 'bonne action'], qui: ['conseiller', 'inconnu', 'conseiller'] } }
  } };
  const e = L.cqcpmDepuisFichier(hostile);
  assert.deepEqual(Object.keys(e.gardees).sort(), ['conditions', 'journee', 'pas']);
  assert.equal(e.gardees.journee.date, '', 'une date invalide est écartée');
  assert.equal(e.gardees.journee.reponses.matin.length, L.CQCPM_MAX_TEXTE);
  assert.equal(e.gardees.journee.reponses.inconnu, undefined);
  assert.equal(e.gardees.journee.reponses.trajet, undefined);
  assert.deepEqual(e.gardees.conditions.reponses.conditions, { h_nuit: 'evite' });
  assert.deepEqual(e.gardees.pas.reponses.action, ['bonne action']);
  assert.deepEqual(e.gardees.pas.reponses.qui, ['conseiller']);
  assert.equal(e.gardees.valeurs, undefined, 'une carte sans réponse valable n’est pas gardée');
});
test('l’aperçu d’une carte gardée tient en une courte ligne', () => {
  const etat = etatConditions();
  const a = L.cqcpmApercu('conditions', L.cqcpmReponsesDe(etat, 'conditions'), etat);
  assert.ok(a.startsWith('Travailler à l’extérieur'));
  assert.ok(a.length <= 160);
  assert.equal(L.cqcpmApercu('conditions', {}, etat), '');
});
test('le point d’entrée de l’espace expose l’interrupteur ouvert, les routes et le contrat de la disquette', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'ce-qui-compte', 'index.js'), 'utf8');
  assert.match(src, /var CQCPM_OUVERT = true;/, 'l’espace est ouvert au public depuis le 25/11/2026');
  assert.ok(/module: 'Ce qui compte pour moi'/.test(fs.readFileSync(path.join(__dirname, '..', 'data', 'nouveautes.js'), 'utf8')), 'une ligne « Nouveautés » pour l’espace ouvert');
  assert.match(src, /function cqcpmExporterEtatPourSauvegarde\(/);
  assert.match(src, /function cqcpmRestaurerEtatDepuisSauvegarde\(/);
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  assert.match(app, /ceQuiCompte: typeof cqcpmExporterEtatPourSauvegarde/);
  assert.match(app, /cqcpmRestaurerEtatDepuisSauvegarde\(modulesEtat\.ceQuiCompte/);
});

// ---------- Lien avec « Ma synthèse » (consigne 565) ----------
test('lien avec Ma synthèse : rien ne part tant qu’une carte n’est pas gardée, puis une carte gardée part par défaut', () => {
  const etat = etatConditions();
  assert.deepEqual(L.cqcpmPourSynthese(etat), [], 'une carte non gardée ne part jamais, même remplie');
  assert.equal(L.cqcpmEnvoiCoche(etat, 'conditions'), false, 'pas de case pour une carte non gardée');
  L.cqcpmGarder(etat, 'conditions', '2026-11-22');
  assert.equal(L.cqcpmEnvoiCoche(etat, 'conditions'), true);
  const l = L.cqcpmPourSynthese(etat);
  assert.equal(l.length, 1);
  assert.ok(l[0].startsWith('Comment je veux travailler : '));
  assert.ok(l[0].includes('Travailler à l’extérieur'));
  assert.ok(l[0].includes('Le Smic, un peu plus'));
  assert.equal(/—|–/.test(l[0]), false, 'aucun tiret long');
});
test('lien avec Ma synthèse : la case se décoche, se recoche, et la carte très personnelle n’est pas cochée d’avance', () => {
  const etat = etatConditions();
  L.cqcpmGarder(etat, 'conditions', '2026-11-22');
  assert.equal(L.cqcpmChoisirEnvoi(etat, 'conditions', false), true);
  assert.deepEqual(L.cqcpmPourSynthese(etat), []);
  assert.deepEqual(L.cqcpmCartesPourEnvoi(etat), [{ id: 'conditions', nom: 'Comment je veux travailler', coche: false }]);
  L.cqcpmChoisirEnvoi(etat, 'conditions', true);
  assert.equal(L.cqcpmPourSynthese(etat).length, 1);
  assert.equal(L.cqcpmChoisirEnvoi(etat, 'inconnue', true), false);
  // la carte « Ce qui m'a aidé » : gardée mais non cochée d'avance
  L.cqcpmPoserReponse(etat, 'aide', 'aide', 'Ma sœur m’a beaucoup aidée.');
  assert.equal(L.cqcpmGarder(etat, 'aide', '2026-11-22'), true);
  assert.equal(L.cqcpmEnvoiCoche(etat, 'aide'), false);
  assert.equal(L.cqcpmPourSynthese(etat).some((x) => x.includes('Ma sœur')), false, 'la carte très personnelle ne part que si la personne la coche');
  L.cqcpmChoisirEnvoi(etat, 'aide', true);
  assert.equal(L.cqcpmPourSynthese(etat).some((x) => x.includes('Ma sœur')), true);
  // retirer une carte gardée efface aussi sa case
  L.cqcpmNePlusGarder(etat, 'aide');
  assert.equal(L.cqcpmEnvoiCoche(etat, 'aide'), false);
  assert.equal((etat.envoi || {}).aide, undefined);
});
test('lien avec Ma synthèse : les textes sont raccourcis, une carte tient dans son plafond, rien d’une carte vide', () => {
  const etat = L.cqcpmEtatInitial();
  L.cqcpmPoserReponse(etat, 'journee', 'matin', 'mot '.repeat(400));
  assert.equal(L.cqcpmGarder(etat, 'journee', '2026-11-22'), true);
  const l = L.cqcpmPourSynthese(etat);
  assert.equal(l.length, 1);
  assert.ok(l[0].length <= 900, 'longueur d’une carte : ' + l[0].length);
  assert.equal(/\n/.test(l[0]), false, 'une carte tient sur une seule ligne');
  assert.equal(L.cqcpmPourSynthese(null).length, 0);
  assert.equal(L.cqcpmPourSynthese({}).length, 0);
});

// ---------- Fin de rubrique de l'accueil (consigne 601) ----------
test('chaque rubrique de l\'accueil a son texte de fin (ce qu\'elle cherche + le complément), en français simple et sans mot interdit', () => {
  assert.equal(D.CQCPM_THEMES_ACCUEIL.length, 4);
  D.CQCPM_THEMES_ACCUEIL.forEach((t) => {
    assert.ok(t.fin && t.fin.cherche && t.fin.aide, 'texte de fin absent : ' + t.id);
    const texte = t.fin.cherche + ' ' + t.fin.aide;
    assert.ok(!/[\u2013\u2014]/.test(texte), 'tiret long : ' + t.id);
    assert.ok(!/\bIA\b|\bon\b|facultatif|minutes?\b/i.test(texte), 'mot à éviter : ' + t.id);
    assert.ok(L.cqcpmCartes().some((c) => c.theme === t.id), 'rubrique sans carte : ' + t.id);
  });
});
