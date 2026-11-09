const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// La veille de la semaine (onglet « Travailler avec Claude ») : plusieurs réponses côte à côte, sites que personne n'a pu lire
// (décision de Denis, 08/11/2026, consigne 180). Les fonctions sont reprises de outils/veille.html, qui n'est pas chargé par les tests.
const html = fs.readFileSync(path.join(__dirname, '..', 'outils', 'veille.html'), 'utf8');
function fn(nom) {
  const i = html.indexOf('function ' + nom + '('); assert.ok(i >= 0, nom);
  const j = html.indexOf('\n  function ', i + 10), k = html.indexOf('\n  /*', i + 10);
  const fin = [j, k].filter((x) => x > 0).sort((a, b) => a - b)[0];
  return html.slice(i, fin);
}
const iReg = html.indexOf('var SITES_VEILLE_SEMAINE = ['), fReg = html.indexOf('\n  ];', iReg) + 5;
assert.ok(iReg >= 0 && fReg > iReg, 'registre des sites de la semaine');
const REGISTRE = html.slice(iReg, fReg);
const S = new Function(REGISTRE + '\n' + ['deMd', 'semAvecAjout', 'semEstMain', 'semDom', 'semSiteDe', 'semCleDe', 'semLire', 'semCalculer', 'semSections', 'semAssembler', 'analyserReponse'].map(fn).join('\n')
  + '\nreturn { SITES_VEILLE_SEMAINE: SITES_VEILLE_SEMAINE, semAvecAjout: semAvecAjout, semEstMain: semEstMain, semCleDe: semCleDe, semSections: semSections, semAssembler: semAssembler, semLire: semLire, semCalculer: semCalculer, analyserReponse: analyserReponse };')();
const NL = String.fromCharCode(10);

const CHATGPT = [
  '[VEILLE-HEBDO]', 'signal: Le cumul entre l’AAH et l’ASS prendra fin en 2027.', 'rayon: handicap', '', 'signal: Non vérifié', '[/VEILLE-HEBDO]', '',
  '[SITES-NON-OUVERTS]',
  '[https://www.legifrance.gouv.fr/jorf/jo](https://www.legifrance.gouv.fr/jorf/jo) | bloqué ou contenu non à jour | JORF du 02 au 08/11/2026',
  'https://travail-emploi.gouv.fr/actualites | bloqué | lettre hebdomadaire',
  'https://www.unedic.org/actualites | non essayé | indemnisation chômage',
  'https://www.francetravail.org/actualites.html | non essayé | aides à l’emploi',
  'https://www.caf.fr/actualites | non essayé | RSA',
  'https://www.ameli.fr/actualites | non essayé | santé',
  'https://www.agefiph.fr/actualites | non essayé | handicap et emploi',
  'https://www.vie-publique.fr/ | non essayé | amendements',
  '[/SITES-NON-OUVERTS]'].join(NL);
const PERPLEXITY = [
  '[VEILLE-HEBDO]', 'signal: Durée maximale d’indemnisation après une rupture conventionnelle.', 'source: Unédic https://www.unedic.org/actualites/assurance-chomage-ce-qui-change-le-1er-septembre-2026',
  'signal: AAH et ESAT : déclaration trimestrielle.', 'source: Caf https://www.caf.fr/allocataires/actualites',
  'signal: Inscrits à France Travail.', 'source: https://www.francetravail.org/accueil/actualites.html',
  'signal: Ameli, rien de neuf.', 'source: https://www.ameli.fr/assure/actualites', '[/VEILLE-HEBDO]', '',
  '[SITES-NON-OUVERTS]', 'travail-emploi.gouv.fr | bloqué (protection anti-robot) | actualités du ministère', 'https://www.legifrance.gouv.fr/jorf/jo | copie ancienne affichée', 'https://www.agefiph.fr/actualites | page introuvable', '[/SITES-NON-OUVERTS]'].join(NL);

test('le registre des sites de la semaine : adresses https uniques, chaque adresse dans son domaine', () => {
  const urls = S.SITES_VEILLE_SEMAINE.map((s) => s.url);
  assert.strictEqual(new Set(urls).size, urls.length);
  S.SITES_VEILLE_SEMAINE.forEach((s) => { assert.ok(/^https:\/\//.test(s.url), s.cle); assert.ok(s.url.indexOf(s.domaine) !== -1, s.cle); });
});

test('plusieurs réponses : on les assemble et on les retrouve, rien n’est remplacé', () => {
  const secs = [{ auteur: 'ChatGPT', heure: '21:27', texte: CHATGPT }, { auteur: 'Perplexity', heure: '21:40', texte: PERPLEXITY }];
  const t = S.semAssembler(secs);
  assert.ok(t.indexOf('=== Réponse de ChatGPT (collée à 21:27) ===') === 0);
  const re = S.semSections(t);
  assert.deepStrictEqual(re.map((s) => s.auteur + '|' + s.heure), ['ChatGPT|21:27', 'Perplexity|21:40']);
  assert.strictEqual(re[1].texte, PERPLEXITY);
});

test('une ancienne réponse sans séparateur reste lisible, une case vide ne donne rien', () => {
  const re = S.semSections(CHATGPT);
  assert.strictEqual(re.length, 1); assert.strictEqual(re[0].texte, CHATGPT);
  assert.deepStrictEqual(S.semSections(''), []);
  assert.deepStrictEqual(S.semSections('   '), []);
  const mixte = S.semSections('Un texte avant' + NL + '=== Réponse de Perplexity (collée à 10:00) ===' + NL + 'Le suivant');
  assert.deepStrictEqual(mixte.map((s) => s.auteur), ['un assistant', 'Perplexity']);
});

test('lecture d’une réponse : signaux, sites non ouverts (liens cliquables et noms sans https), pages citées', () => {
  const c = S.semLire(CHATGPT);
  assert.strictEqual(c.signaux, 1, '« Non vérifié » ne compte pas');
  assert.strictEqual(c.aBloc, true);
  assert.strictEqual(c.sites.length, 8);
  assert.strictEqual(c.sites[0].domaine, 'legifrance.gouv.fr');
  assert.strictEqual(c.sites[1].raison, 'bloqué');
  const p = S.semLire(PERPLEXITY);
  assert.strictEqual(p.signaux, 4);
  assert.strictEqual(p.sites.length, 3);
  assert.strictEqual(p.sites[0].domaine, 'travail-emploi.gouv.fr', 'un site écrit sans https est reconnu par son nom de domaine');
  assert.ok(p.ouverts['unedic.org'] && p.ouverts['caf.fr'] && p.ouverts['ameli.fr'] && p.ouverts['francetravail.org']);
  assert.ok(!p.ouverts['agefiph.fr'], 'une adresse écrite dans [SITES-NON-OUVERTS] n’est pas une page lue');
});

test('texte brut sans le format : jamais refusé pour son format ; un refus est reconnu', () => {
  const brut = S.semLire('Cette semaine, la durée maximale est de 15 mois (https://www.unedic.org/actualites). Je n’ai pas pu ouvrir le ministère.');
  assert.strictEqual(brut.aBloc, false); assert.strictEqual(brut.refus, false); assert.ok(brut.ouverts['unedic.org']);
  assert.strictEqual(S.semLire('Je ne peux pas répondre à cette demande.').refus, true);
  const long = 'Voici ce que j’ai trouvé cette semaine. '.repeat(10) + 'https://www.unedic.org/actualites';
  assert.notStrictEqual(S.analyserReponse('hebdo', long).niveau, 'inutilisable');
  assert.strictEqual(S.analyserReponse('hebdo', 'Je ne peux pas répondre conformément à votre demande : la période n’est pas définie.').niveau, 'inutilisable');
  assert.strictEqual(S.analyserReponse('chiffres', long).niveau, 'inutilisable', 'les autres cartes gardent leur exigence de format');
});

test('sites que personne n’a pu lire : un site lu par un assistant disparaît, les adresses sont celles du registre', () => {
  const secs = [{ auteur: 'ChatGPT', heure: '21:27', texte: CHATGPT }, { auteur: 'Perplexity', heure: '21:40', texte: PERPLEXITY }];
  const seul = S.semCalculer(secs.slice(0, 1), {});
  assert.strictEqual(seul.liste.length, 8, 'avec ChatGPT seul : 8 sites à ouvrir');
  const deux = S.semCalculer(secs, {});
  assert.deepStrictEqual(deux.liste.map((v) => v.cle).sort(), ['agefiph', 'legifrance', 'travail', 'viepublique']);
  assert.deepStrictEqual(deux.lues.map((v) => v.cle).sort(), ['ameli', 'caf', 'francetravail', 'unedic']);
  const agefiph = deux.liste.filter((v) => v.cle === 'agefiph')[0];
  assert.strictEqual(agefiph.site.url, 'https://www.agefiph.fr/');
  assert.strictEqual(agefiph.avis.length, 2, 'les deux avis (ChatGPT et Perplexity) sont gardés');
  const caf = S.semCalculer(secs.slice(0, 1), {}).liste.filter((v) => v.cle === 'caf')[0];
  assert.ok(caf.urlAssistant.indexOf('caf.fr/actualites') !== -1 && caf.site.url === 'https://www.caf.fr/allocataires/actualites', 'l’adresse devinée par l’assistant est corrigée par celle du registre');
});

test('les boutons déjà utilisés passent au vert, et le bouton « Pas utile cette semaine » n’existe plus (décision de Denis, 08/11/2026)', () => {
  assert.ok(/\.btn\.fait-ok\s*\{[^}]*var\(--ok\)/.test(html), 'style du bouton utilisé');
  assert.ok(html.includes('✔ Texte collé : le voir'), 'le bouton collé devient vert et permet de voir le texte');
  assert.ok(html.includes("'✔ ' + plur(nb, 'réponse', 'réponses') + ' de '"), 'les boutons ChatGPT et Perplexity passent au vert une fois la réponse ajoutée');
  assert.ok(!/Pas utile cette semaine|semEcartes|data-sem-site="ecarter"/.test(html), 'plus de bouton « écarter » ni de mémoire des sites écartés');
});

test('une proposition versée le matin ne cache pas un nouveau fichier du même nom déposé le soir (essai de Denis, 08/11/2026)', () => {
  const mem = {};
  const stockage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = v; } };
  const ctx = new Function('localStorage', 'jourLocal', '_tc', 'var CLE_VERSEES = "cle";\n' + ['signatureProp', 'lireMemoireVersees', 'lireVersees', 'noterVersee'].map(fn).join('\n')
    + '\nreturn { lire: lireVersees, noter: noterVersee, sig: signatureProp };');
  const tc = { prop: { 'fiches-hebdo': { sig: '' } } };
  const A = ctx(stockage, () => '2026-11-08', tc);
  tc.prop['fiches-hebdo'].sig = A.sig('fiches du matin');
  A.noter('fiches-hebdo', 2);
  assert.strictEqual(A.lire()['fiches-hebdo'], 2, 'le matin : versée');
  tc.prop['fiches-hebdo'].sig = A.sig('fiches du soir');
  assert.strictEqual(A.lire()['fiches-hebdo'], undefined, 'le soir, un autre contenu sous le même nom redevient à verser');
  tc.prop['fiches-hebdo'].sig = A.sig('fiches du matin');
  assert.strictEqual(A.lire()['fiches-hebdo'], 2, 'le même contenu reste versé');
  mem.cle = JSON.stringify({ jour: '2026-11-08', ids: { 'fiches-hebdo': 2 } });
  assert.strictEqual(A.lire()['fiches-hebdo'], undefined, 'une ancienne mémoire sans empreinte ne cache plus rien');
  assert.ok(/data-tp-sas="1">Ouvrir le sas des fiches/.test(html), 'un bouton ouvre le sas des fiches depuis « Travailler avec Claude »');
});

test('le bouton « Sas à valider » (violet, avec le nombre) et la cohérence des propositions déjà versées (décision de Denis, 08/11/2026)', () => {
  assert.ok(/id="btnSas"[^>]*tcOuvrirSas\(\)/.test(html), 'le bouton existe sous celui de Claude');
  assert.ok(/--sas:#6d28d9[\s\S]*--sas:#a78bfa/.test(html), 'violet en clair et en sombre');
  assert.ok(/\.btn\.btn-sas\.a-sas\s*\{[^}]*var\(--sas\)/.test(html), 'violet quand il reste des propositions');
  assert.ok(html.includes("/api/fichessas/lister") && html.includes("/api/changements/lister") && html.includes('function compterSas('), 'le nombre compte les fiches ET les changements du sas');
  assert.ok(html.includes('if (!dans) { return \'\'; }'), 'une proposition versée dont tout est traité disparaît de la carte');
  assert.ok(html.includes('tcVerifierSas') && /chgFermer'\)\.addEventListener[^\n]*tcVerifierSas/.test(html), 'le compte se met à jour à la fermeture du sas');
});

test('un texte copié à la main reste affiché pour son site, même lu par un assistant', () => {
  const secs = [{ auteur: 'ChatGPT', heure: '21:27', texte: CHATGPT }, { auteur: 'Perplexity', heure: '21:40', texte: PERPLEXITY }];
  const r = S.semCalculer(secs, { unedic: 'texte copié' });
  assert.ok(r.liste.some((v) => v.cle === 'unedic'));
  assert.ok(!r.lues.some((v) => v.cle === 'unedic'));
});

// Scan du mois (décision de Denis, 09/11/2026) : les 10 messages reçoivent des réponses côte à côte, plusieurs de chaque assistant, comme la veille de la semaine.
const BRUT_MOIS = 'Ce qui a changé en octobre : le décret n° 2026-1001 du 26 octobre 2026 modifie le délai de décision de la préfecture (https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000000000000). '.repeat(4);
const BRUT_COUPE = 'Premier lot de changements, avec ses sources (https://www.unedic.org/actualites). '.repeat(6) + ' SUITE DISPONIBLE : voulez-vous la suite ?';

test('scan du mois : un texte brut est accepté, un refus ne l’est pas, les autres cartes gardent leur format', () => {
  assert.notStrictEqual(S.analyserReponse('balayage-3', BRUT_MOIS).niveau, 'inutilisable');
  assert.strictEqual(S.analyserReponse('balayage-3', 'Je ne peux pas répondre à cette demande : la période n’est pas définie.').niveau, 'inutilisable');
  assert.strictEqual(S.analyserReponse('chiffres', BRUT_MOIS).niveau, 'inutilisable');
});

test('scan du mois : plusieurs réponses du même assistant se lisent à la suite, la carte vaut le meilleur assistant', () => {
  // Une réponse coupée, puis sa suite collée avec le même bouton : plus coupée.
  const suite = S.semAssembler([{ auteur: 'ChatGPT', heure: '10:00', texte: BRUT_COUPE }, { auteur: 'ChatGPT', heure: '10:03', texte: 'Deuxième lot de changements (https://www.service-public.gouv.fr/actualites). '.repeat(6) }]);
  assert.strictEqual(S.analyserReponse('balayage-1', suite).coupee, false, 'la suite complète la réponse coupée du même assistant');
  assert.strictEqual(S.analyserReponse('balayage-1', BRUT_COUPE).coupee, true);
  // Un assistant qui refuse n’empêche pas l’autre de compter.
  const mixte = S.semAssembler([{ auteur: 'ChatGPT', heure: '10:00', texte: 'Je ne peux pas répondre à cette demande.' }, { auteur: 'Perplexity', heure: '10:05', texte: BRUT_MOIS }]);
  assert.notStrictEqual(S.analyserReponse('balayage-1', mixte).niveau, 'inutilisable');
  // Deux assistants qui refusent : inutilisable.
  const deux = S.semAssembler([{ auteur: 'ChatGPT', heure: '10:00', texte: 'Je ne peux pas répondre à cette demande.' }, { auteur: 'Perplexity', heure: '10:05', texte: 'Je suis désolé, je ne peux pas répondre.' }]);
  assert.strictEqual(S.analyserReponse('balayage-1', deux).niveau, 'inutilisable');
});

test('scan du mois : le bloc « Réponses reçues » est celui de la veille de la semaine, branché sur chaque message, et le message pour Claude demande le tri', () => {
  assert.ok(html.includes('function semAvecAjout(id)') && /balayage\|rayon/.test(fn('semAvecAjout')), 'les messages du scan utilisent le bloc d’ajout');
  assert.ok(html.includes("(semAvecAjout(x.id) ? semSquelette(x.id)"), 'chaque carte de message affiche « Ajouter la réponse de ChatGPT / Perplexity »');
  assert.ok(/data-card="' \+ card \+ '" data-auteur/.test(html) && html.includes("card = b.getAttribute('data-card') || 'hebdo'"), 'les boutons savent à quelle carte ils appartiennent');
  assert.ok(html.includes("var sections = semSections(_tc.rep[card]);"), 'une carte ne touche que ses propres réponses');
  assert.ok(html.includes("'fiches-mois-' + id.slice(9)"), 'les fiches proposées pour un message du mois s’affichent sous la carte de ce message');
  assert.ok(html.includes('MISE À JOUR de cette fiche') && html.includes('RETRAIT ou correction') && html.includes('NOUVELLE fiche'), 'le message pour Claude demande le tri : à jour, périmé, nouvelle');
  const ret = require('../outils/veilleRetours.js');
  assert.ok(fs.readFileSync(path.join(__dirname, '..', 'outils', 'veilleRetours.js'), 'utf8').includes('fiches-(?:hebdo|mois-[0-9]{1,2}|'), 'le serveur accepte fiches-mois.md');
  assert.ok(ret.creerRetours);
});

// Étape 2 (09/11/2026) : toutes les cartes qui reçoivent la réponse d'un assistant reçoivent aussi plusieurs réponses côte à côte.
test('étape 2 : rayons, chiffres, réseau, lexique, portrait et UE acceptent plusieurs réponses ; les tableaux copiés à la main et les sites lus à la main gardent la case unique', () => {
  ['hebdo', 'balayage-3', 'rayon-emploi', 'chiffres', 'reseau', 'lexique', 'portrait', 'ue'].forEach((id) => assert.strictEqual(S.semAvecAjout(id), true, id));
  ['profil-decoupes', 'medecins', 'main-legifrance', 'main-sem-service-public'].forEach((id) => assert.strictEqual(S.semAvecAjout(id), false, id));
  const NLL = String.fromCharCode(10);
  const bloc = (n, c) => '[' + n + ']' + NLL + c + NLL + '[/' + n + ']';
  // une réponse coupée de ChatGPT et sa suite se lisent à la suite ; l'autre assistant n'est pas mélangé
  const coupee = '[CHIFFRES periode: T1]' + NLL + 'indicateur: a' + NLL + 'preuve: https://www.insee.fr/fr/statistiques/1';
  const suite = NLL + 'indicateur: b' + NLL + '[/CHIFFRES]';
  const deux = S.semAssembler([{ auteur: 'ChatGPT', heure: '10:00', texte: coupee }, { auteur: 'ChatGPT', heure: '10:05', texte: suite }, { auteur: 'Perplexity', heure: '10:10', texte: bloc('CHIFFRES', 'indicateur: c' + NLL + 'preuve: https://www.insee.fr/fr/statistiques/2') }]);
  assert.strictEqual(S.analyserReponse('chiffres', deux).niveau, 'ok');
  // l'exigence de format des autres cartes reste : sans son bloc, une réponse longue est inutilisable
  assert.strictEqual(S.analyserReponse('rayon-emploi', S.semAssembler([{ auteur: 'ChatGPT', heure: '', texte: 'Voici un résumé. ' + 'x'.repeat(300) }])).niveau, 'inutilisable');
  assert.ok(html.includes('function semFormatLibre(id)'), 'le texte du bloc distingue les cartes à format libre');
  assert.ok(!/<textarea data-tc-rep="' \+ x\.id[^;]*semAvecAjout/.test(html));
});

// Sites que personne n'a pu lire, pour chaque carte (09/11/2026) : repérés dans les réponses, texte copié à la main = une section de la carte.
test('cartes autres que la veille de la semaine : sites non lus repérés sans rapprochement avec le registre, texte copié à la main ajouté aux réponses et jamais refusé', () => {
  const NLL = String.fromCharCode(10);
  const chat = '[CHIFFRES periode: T1]' + NLL + 'indicateur: a' + NLL + 'preuve: https://www.insee.fr/fr/statistiques/1' + NLL + '[/CHIFFRES]' + NLL + '[SITES-NON-OUVERTS]' + NLL + 'DARES | https://dares.travail-emploi.gouv.fr/ | bloqué par un robot | taux' + NLL + 'Pôle emploi | non essayé | trop long | stats' + NLL + '[/SITES-NON-OUVERTS]';
  const sections = [{ auteur: 'ChatGPT', heure: '10:00', texte: chat }];
  const libre = S.semCalculer(sections, {}, true);
  assert.strictEqual(libre.liste.length, 2, 'DARES et Pôle emploi : deux sites à ouvrir à la main');
  assert.strictEqual(libre.liste[0].site, null, 'un sous-domaine n’est pas rapproché d’un site de la semaine');
  assert.strictEqual(libre.liste[0].domaine, 'dares.travail-emploi.gouv.fr');
  assert.strictEqual(libre.liste[1].domaine, 'Pôle emploi', 'un site cité sans adresse garde son nom');
  const cle = S.semCleDe('dares.travail-emploi.gouv.fr', true);
  assert.notStrictEqual(cle, S.semCleDe('travail-emploi.gouv.fr', true));
  assert.strictEqual(S.semCalculer(sections, { [cle]: 'texte' }, true).liste.filter((v) => v.cle === cle).length, 1, 'un site dont le texte est collé reste dans la liste, marqué reçu');
  // le texte copié à la main est une section reconnue ; seule, elle n'est jamais refusée ; avec les réponses, elle ne change pas leur jugement
  const main = { auteur: 'texte copié à la main sur dares.travail-emploi.gouv.fr', heure: '10:30', texte: 'Taux de chômage : 7,4 %' };
  assert.strictEqual(S.semEstMain(main.auteur), true);
  assert.strictEqual(S.semEstMain('ChatGPT'), false);
  assert.strictEqual(S.analyserReponse('chiffres', S.semAssembler([main])).niveau, 'ok');
  assert.strictEqual(S.analyserReponse('chiffres', S.semAssembler(sections.concat([main]))).niveau, 'ok');
  assert.strictEqual(S.analyserReponse('chiffres', S.semAssembler([{ auteur: 'ChatGPT', heure: '', texte: 'Voici un résumé. ' + 'x'.repeat(300) }, main])).niveau, 'inutilisable');
  assert.ok(html.includes('function semSauverSite(cle, texte, card, dom)') && html.includes("semSquelettesSites(x.id)"), 'chaque carte affiche ses sites non lus et enregistre le texte collé dans ses réponses');
});
