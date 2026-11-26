// Module « Bien utiliser l'IA » : assemblage du modèle 5 « Répondre à l'administration » (modeleLogique.js), son fichier de phrases (prompts/bien-utiliser-modele-5.md),
// l'enchaînement depuis le modèle 4 et l'écran générique (modelesUi.js, non chargé par les tests).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const M = require('../data/buiaModeles.js');
const B = require('../modules/bien-utiliser-ia/blocs.js');
const L = require('../modules/bien-utiliser-ia/modeleLogique.js');
const G = require('../modules/bien-utiliser-ia/gardeLogique.js');

const racine = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(racine, p), 'utf8');
const def = L.buiaDefModele(5);
const lecture = B.buiaLireBlocs(lire(def.fichier));
const blocs = lecture.blocs;
const jour = new Date(2026, 10, 24, 10, 0, 0);
const COURRIER = M.BUIA_COURRIERS_FICTIFS.A.texte;
const complet = (surcharge) => {
  const s = L.buiaSaisieParDefaut(5);
  s.champs.message = 'Je vous envoie les trois pièces demandées et je voudrais savoir où les envoyer.';
  s.champs.courrier = COURRIER;
  if (surcharge) { Object.keys(surcharge).forEach((k) => { s.choix[k] = surcharge[k]; }); }
  return s;
};
const assembler = (saisie) => L.buiaAssemblerModele(5, blocs, saisie, { aujourdhui: jour, alerte: null, reprise: false });

test('le fichier du modèle 5 contient tous les blocs demandés et ne contient que les crochets que le modèle permet', () => {
  assert.deepEqual(L.buiaVerifierBlocsModele(5, lecture), []);
  assert.deepEqual(def.crochetsPermis, ['[à compléter]', '[mon nom]', '[mon adresse]', '[mon téléphone]']);
});

test('un crochet imprévu ou un bloc absent est refusé', () => {
  const abime = B.buiaLireBlocs(lire(def.fichier).replace(/(## temps\r?\n)/, '$1[une note] '));
  assert.ok(L.buiaVerifierBlocsModele(5, abime).some((p) => /temps/.test(p)));
  const sansBloc = B.buiaLireBlocs(lire(def.fichier).replace('## regles', '## autre'));
  assert.ok(L.buiaVerifierBlocsModele(5, sansBloc).some((p) => /regles/.test(p)));
});

test('assemblage par défaut : message et courrier présents, signature à trois repères conservée, rien à compléter', () => {
  const r = assembler(complet());
  assert.equal(r.aCompleter, false);
  assert.deepEqual(r.manque, []);
  assert.ok(r.texte.includes('Mon but : je fournis des pièces.'));
  assert.ok(r.texte.includes('Voici ce que je veux dire, avec mes mots : Je vous envoie les trois pièces demandées et je voudrais savoir où les envoyer. Ce message'));
  assert.ok(r.texte.includes('===== DÉBUT DU COURRIER =====\n' + COURRIER + '\n===== FIN DU COURRIER ====='));
  assert.ok(r.texte.includes('[mon nom], [mon adresse], [mon téléphone]'));
  assert.ok(r.texte.includes('écris exactement [à compléter]'));
  assert.ok(!/\{\{|\}\}/.test(r.texte));
});

test('champ obligatoire vide : la demande reste à compléter', () => {
  const s = complet(); s.champs.message = ''; s.champs.courrier = '   ';
  const r = assembler(s);
  assert.equal(r.aCompleter, true);
  assert.equal(r.manque.length, 2);
});

test('le message perd son point final : le bloc ajoute le sien', () => {
  const s = complet(); s.champs.message = '  Je demande un délai...  ';
  assert.ok(!/\.\.\. ?Ce message/.test(assembler(s).texte));
  assert.ok(/Je demande un délai\. Ce message/.test(assembler(s).texte));
});

test('un seul bloc par groupe : cinq buts, trois longueurs, deux langages, deux réglages de questions', () => {
  const buts = { pieces: 'je fournis des pièces', explication: 'je demande une explication', delai: 'je demande un délai', rendezvous: 'je demande un rendez-vous', changement: 'je signale un changement de situation' };
  Object.keys(buts).forEach((v) => {
    const t = assembler(complet({ objectif: v })).texte;
    assert.ok(t.includes('Mon but : ' + buts[v] + '.'), v);
    assert.equal(t.split('Mon but :').length, 2, 'un seul but : ' + v);
  });
  assert.ok(assembler(complet({ longueur: 'court' })).texte.includes('de 3 à 4 phrases'));
  assert.ok(assembler(complet({ longueur: 'detaille' })).texte.includes('Écris un courrier complet'));
  assert.ok(!assembler(complet({ longueur: 'detaille' })).texte.includes('5 à 8 phrases'));
  assert.ok(assembler(complet({ langage: 'soigne' })).texte.includes('vocabulaire correct'));
  assert.ok(!assembler(complet({ langage: 'soigne' })).texte.includes('mots de tous les jours'));
  assert.ok(assembler(complet({ questions: 'oui' })).texte.includes('pose-moi tes questions avant de répondre'));
});

test('« même conversation » : le courrier n’est plus exigé ni envoyé, la phrase d’ouverture change', () => {
  const s = complet({ conversation: 'oui' }); s.champs.courrier = '';
  const r = assembler(s);
  assert.equal(r.aCompleter, false);
  assert.ok(r.texte.startsWith('Aide-moi à écrire une réponse au courrier de l’administration dont nous venons de parler.'));
  assert.ok(!r.texte.includes('DÉBUT DU COURRIER'));
  assert.ok(!r.texte.includes('demande-le-moi simplement'));
  assert.ok(assembler(complet()).texte.includes('demande-le-moi simplement'));
});

test('ordre fixe des blocs et aucune ligne vide en double', () => {
  const t = assembler(complet()).texte;
  const reperes = ['Aide-moi à écrire', 'Aujourd’hui, nous sommes', 'Mon but', 'Voici ce que je veux dire', 'Voici le courrier reçu', 'Écris ma réponse sous forme de courrier', 'Écris un courrier de 5', 'mots de tous les jours',
    'Le ton est courtois', 'Respecte le temps de mes verbes', 'Écris le courrier en texte simple', 'Pose-moi une question seulement', 'Règles pour ta réponse'];
  const pos = reperes.map((x) => t.indexOf(x));
  pos.forEach((p, i) => assert.ok(p >= 0, reperes[i]));
  assert.deepEqual(pos.slice().sort((a, b) => a - b), pos);
  assert.ok(!/\n\n\n/.test(t));
});

test('le modèle 5 n’a pas de ligne « Ajouter cette date » : le délai proche est traité dans ses règles', () => {
  assert.ok(!def.ordre.some((o) => o.code === 'repriseDate'));
  assert.ok(assembler(complet()).texte.includes('Si un délai du courrier est proche de la date d’aujourd’hui'));
});

test('les trois courriers fictifs donnent une demande complète', () => {
  ['A', 'B', 'C'].forEach((k) => {
    const s = complet(); s.champs.courrier = M.BUIA_COURRIERS_FICTIFS[k].texte;
    const r = assembler(s);
    assert.equal(r.aCompleter, false, k);
    assert.ok(r.texte.includes(M.BUIA_COURRIERS_FICTIFS[k].texte), k);
  });
});

test('le modèle 4 reste complet après la généralisation', () => {
  const def4 = L.buiaDefModele(4);
  const bl4 = B.buiaLireBlocs(lire(def4.fichier)).blocs;
  const s = L.buiaSaisieParDefaut(4); s.champs.situation = 'J’ai reçu ce courrier.'; s.champs.courrier = M.BUIA_COURRIERS_FICTIFS.B.texte;
  const r = L.buiaAssemblerModele(4, bl4, s, { aujourdhui: jour, alerte: null, reprise: false });
  assert.equal(r.aCompleter, false);
  assert.ok(r.texte.includes('J’ai reçu ce courrier'));
});

test('l’écran est générique : chaque modèle codé cite dans son ordre d’écran tous ses champs et tous ses groupes', () => {
  [4, 5].forEach((id) => {
    const d = L.buiaDefModele(id), vus = new Set();
    d.ecran.forEach((e) => { if (e.groupe) { vus.add('g:' + e.groupe); } if (e.champ) { vus.add('c:' + e.champ); } (e.groupes || []).forEach((g) => vus.add('g:' + g)); });
    d.champs.forEach((c) => assert.ok(vus.has('c:' + c.id), id + ' champ ' + c.id));
    d.groupes.forEach((g) => assert.ok(vus.has('g:' + g.id), id + ' groupe ' + g.id));
  });
});

test('l’enchaînement du modèle 4 vers le 5 existe et les boutons de l’étape 3 dépendent du modèle', () => {
  const ui = lire('modules/bien-utiliser-ia/modelesUi.js');
  assert.ok(ui.includes('function _buiaC2EnchainerVers('));
  assert.ok(ui.includes('buiaModeleDisponible'));
});

test('garder une demande du modèle 5 : le courrier n’est jamais gardé, le reste oui, et le tout revient de la disquette', () => {
  const s = complet({ objectif: 'delai', conversation: 'non' });
  const g = L.buiaSaisiePourGarde(5, s);
  assert.equal(g.champs.courrier, '');
  assert.equal(g.choix.objectif, 'delai');
  assert.ok(g.champs.message.includes('trois pièces'));
  const r = G.buiaGardeAjouterModele(G.buiaGardeVide(), 'Réponse caisse', 5, s);
  assert.ok(!r.refuse);
  const exporte = JSON.stringify(G.buiaGardeExporter(r.etat));
  assert.ok(!exporte.includes(COURRIER.split(String.fromCharCode(10))[0]), 'le courrier ne part pas sur la disquette');
  assert.ok(exporte.includes('trois pièces demandées'));
});
