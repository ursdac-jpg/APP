const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { creerDepot } = require('../outils/veilleDepot.js');
const mots = require('../outils/veilleMots.js');

const SRC = { nom: 'service-public.fr', url: 'https://www.service-public.fr' };
const FICHES = [
  { id: 'cpf', titre: 'Les plafonds du CPF', details: { verifieLe: '2026-03-01', source: SRC, lignes: [
    { libelle: 'Plafond bilan de compétences', valeur: '1 600 €', categorie: 'montant', peutChanger: true },
    { libelle: 'Plafond permis légers', valeur: '900 €', categorie: 'montant', peutChanger: true },
    { libelle: 'Entrée en vigueur du décret', valeur: '26 février 2026', categorie: 'date', peutChanger: false }] } },
  { id: 'acre', titre: 'ACRE', details: { verifieLe: '', source: { nom: 'Urssaf', url: 'https://www.urssaf.fr' }, lignes: [{ libelle: 'Durée de la réduction', valeur: 'douze mois', categorie: 'duree', peutChanger: true }] } }
];

test('prompt de verification : la structure du complement qui marche, les lignes de chaque fiche, la date en francais, aucun tiret long', () => {
  const p = mots.promptVerificationChiffres(FICHES, '2026-10-20');
  assert.match(p, /^@Recherche sur le Web/);
  assert.match(p, /Nous sommes le 20\/10\/2026\./);
  assert.ok(p.indexOf('2026-10-20') === -1, 'jamais de date AAAA-MM-JJ dans le texte');
  assert.match(p, /UNIQUEMENT sur les sites OFFICIELS/);
  assert.match(p, /« non vérifiable »/); assert.match(p, /« confirmé »/); assert.match(p, /« corrigé »/);
  assert.match(p, /aucun forum, aucun blog, aucun comparateur/);
  assert.match(p, /PARTIE 2, PARTIE 3/);
  assert.match(p, /Ne fais aucun commentaire/);
  assert.match(p, /\[LEXIQUE-CHIFFRES\][\s\S]*\[\/LEXIQUE-CHIFFRES\]/);
  assert.match(p, /FICHE cpf \(Les plafonds du CPF\) ; source officielle attendue : service-public\.fr https:\/\/www\.service-public\.fr/);
  assert.match(p, / {2}- Plafond bilan de compétences : 1 600 €/);
  assert.match(p, /FICHE acre \(ACRE\)/);
  assert.ok(!/[–—]/.test(p), 'aucun tiret long');
  assert.ok(!/\bIA\b/.test(p), 'jamais le mot IA');
});

const REPONSE = [
  'Voici le résultat.',
  '[LEXIQUE-CHIFFRES]',
  'cpf | Plafond bilan de compétences | confirmé | 1 600 € | https://www.service-public.fr/page | page lue le 20/10',
  'cpf | Plafond permis légers | corrigé | 950 € | https://www.service-public.fr/autre | la page affiche 950 €',
  'ACRE | Durée de la réduction | non vérifiable | | | page inaccessible',
  'inconnu | Une ligne | confirmé | 1 | https://x.fr | y',
  'PARTIE 2',
  'cpf | Libellé qui n\'existe pas | confirmé | 1 | https://x.fr | y',
  '[/LEXIQUE-CHIFFRES]'
].join('\n');

test('lecture de la reponse : confirme, corrige, non verifiable ; la fiche se retrouve par son identifiant ou son titre ; les lignes inconnues sont signalees', () => {
  const r = mots.lireVerificationChiffres(REPONSE, FICHES);
  assert.deepStrictEqual(r.fiches.map((f) => f.id), ['cpf', 'acre']);
  const cpf = r.fiches[0];
  assert.deepStrictEqual(cpf.lignes.map((l) => [l.libelle, l.statut, l.nouvelle]), [['Plafond bilan de compétences', 'confirme', ''], ['Plafond permis légers', 'corrige', '950 €']]);
  assert.strictEqual(cpf.lignes[1].url, 'https://www.service-public.fr/autre');
  assert.strictEqual(cpf.lignes[1].actuelle, '900 €');
  assert.deepStrictEqual(cpf.manquantes, ['Entrée en vigueur du décret'], 'la ligne que l\'assistant n\'a pas traitee est signalee');
  assert.strictEqual(r.fiches[1].lignes[0].statut, 'introuvable');
  assert.strictEqual(r.inconnues.length, 2, 'fiche inconnue et libelle inconnu');
});

test('lecture de la reponse : tableau en markdown, en-tete recopiee, statuts varies, corrige sans changement, adresse non https, tiret long', () => {
  const t = [
    '| identifiant de la fiche | libellé | statut | valeur lue sur la page officielle | URL exacte de la page lue | ce que tu as lu |',
    '|---|---|---|---|---|---|',
    '| cpf | Plafond bilan de compétences | corrigé | 1 600 € | https://www.service-public.fr/x | pareil |',
    '| cpf | Plafond permis légers | Modifiée | 1 000 € | http://pas-https.fr | texte |',
    '| acre | Durée de la réduction | corrigé | douze – mois | https://www.urssaf.fr | tiret |'
  ].join('\n');
  const r = mots.lireVerificationChiffres(t, FICHES);
  const cpf = r.fiches.find((f) => f.id === 'cpf');
  assert.strictEqual(cpf.lignes[0].statut, 'confirme', 'corrige avec la meme valeur = confirme');
  assert.strictEqual(cpf.lignes[1].statut, 'corrige');
  assert.strictEqual(cpf.lignes[1].url, '', 'une adresse qui n\'est pas en https n\'est jamais gardee');
  assert.ok(!r.fiches.some((f) => f.id === 'acre'), 'une valeur avec un tiret long est refusee');
  assert.strictEqual(r.inconnues.length, 1);
  assert.deepStrictEqual(mots.lireVerificationChiffres('rien de reconnaissable', FICHES).fiches, []);
});

// ---------- les routes du depot ----------
function git(d, ...a) { return spawnSync('git', a, { cwd: d, encoding: 'utf8' }); }
function ecrire(d, c, t) { const p = path.join(d, c); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, t, 'utf8'); }
const LEX = ['var LEXIQUE_FICHES = [', '  {', "    id: 'cdi', titre: 'CDI', titreDeTri: 'CDI', type: 'terme',", "    univers: 'contrats-statuts-emploi', registres: ['langage-rh'],", "    variantesRecherche: [],", '    corps: "Un CDI est un contrat sans date de fin prevue. Il est la forme habituelle.",', "    detailsAJour: {", "      verifieLe: '2026-03-01',", "      source: { nom: 'service-public.fr', url: 'https://www.service-public.fr' },", "      lignes: [", "        { libelle: 'Periode d\\'essai', valeur: 'quatre mois', categorie: 'duree', peutChanger: true }", "      ]", "    },", "    relations: []", '  },', '  {', "    id: 'cdd', titre: 'CDD', titreDeTri: 'CDD', type: 'terme',", "    univers: 'contrats-statuts-emploi', registres: ['langage-rh'],", "    variantesRecherche: [],", '    corps: "Un CDD est un contrat qui a une date de fin. Il remplace une equipe.",', "    relations: []", '  }', '];', ''].join('\n');
test('routes : le prompt ne prend que les fiches a revérifier (jamais celles a jour ni sans bloc), la reponse se lit contre les vrais blocs', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-verif-'));
  try {
    git(d, 'init', '-q', '-b', 'master'); ecrire(d, 'data/lexique.js', LEX); ecrire(d, 'modules/lexique/index.js', 'var LEXIQUE_SEUIL_MOIS_DETAILS = 6;\n');
    const depot = creerDepot(d, { aujourdhui: () => '2026-10-20' });
    const p = depot.promptVerificationChiffres({});
    assert.ok(p.ok, JSON.stringify(p));
    assert.deepStrictEqual(p.fiches.map((f) => [f.id, f.etat, f.nbLignes]), [['cdi', 'perime', 1]]);
    assert.match(p.prompt, /FICHE cdi \(CDI\)/); assert.ok(p.prompt.indexOf('FICHE cdd') === -1);
    const aJour = creerDepot(d, { aujourdhui: () => '2026-03-02' }).promptVerificationChiffres({});
    assert.ok(!aJour.ok && /Aucune fiche à revérifier/.test(aJour.erreur));
    const r = depot.lireVerificationChiffres({ texte: '[LEXIQUE-CHIFFRES]\ncdi | Periode d\'essai | corrigé | trois mois | https://www.service-public.fr/p | page\n[/LEXIQUE-CHIFFRES]' });
    assert.ok(r.ok, JSON.stringify(r));
    assert.strictEqual(r.fiches[0].lignes[0].nouvelle, 'trois mois');
    assert.ok(!depot.lireVerificationChiffres({ texte: '  ' }).ok);
    assert.ok(!depot.lireVerificationChiffres({ texte: 'du texte sans format' }).ok);
  } finally { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } }
});
