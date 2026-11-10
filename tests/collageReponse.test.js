const { test } = require('node:test');
const assert = require('node:assert/strict');
const C = require('../modules/collage-reponse/logique.js');

const JSON_COMPLET = '{"titresProposes":["Agent d’accueil"],"pointsForts":["Rigueur"]}';
const AS = String.fromCharCode(92);

// ---------------- analyserCompletude ----------------
test('texte vide : statut vide', () => {
  assert.equal(C.analyserCompletude('').statut, 'vide');
  assert.equal(C.analyserCompletude('   \n ').statut, 'vide');
  assert.equal(C.analyserCompletude(null).statut, 'vide');
});

test('une phrase sans bloc de données : inutilisable', () => {
  const r = C.analyserCompletude('Bonjour, voici mon avis sur votre CV.');
  assert.equal(r.statut, 'inutilisable');
});

test('une accolade dans une phrase ne fait pas un bloc de données', () => {
  assert.equal(C.analyserCompletude('Voici { mon avis } sur le CV').statut, 'inutilisable');
});

test('un bloc de données refermé : complet', () => {
  assert.equal(C.analyserCompletude(JSON_COMPLET).statut, 'complete');
  assert.equal(C.analyserCompletude('Voici :\n```json\n' + JSON_COMPLET + '\n```\nVoulez-vous le complément de CV ?').statut, 'complete');
});

test('un bloc coupé en plein milieu : coupé en silence', () => {
  const r = C.analyserCompletude('{"titresProposes":["Agent d’accueil"],"pointsForts":["Rigu');
  assert.equal(r.statut, 'coupee');
  assert.equal(r.silencieuse, true);
  assert.equal(r.raison, 'bloc_non_termine');
});

test('un bloc coupé entre deux accolades imbriquées : coupé en silence', () => {
  assert.equal(C.analyserCompletude('{"a":{"b":[1,2,3]}').statut, 'coupee');
  assert.equal(C.analyserCompletude('```json\n{"a":[{"b":1},{"c":2}').statut, 'coupee');
});

test('les accolades et guillemets dans les textes ne comptent pas', () => {
  assert.equal(C.analyserCompletude('{"a":"une accolade } dans le texte et \\" un guillemet","b":"{"}').statut, 'complete');
  assert.equal(C.analyserCompletude('{"a":"fin de texte avec { ouvrante"').statut, 'coupee');
});

test('guillemets typographiques copiés par l’assistant : lus comme des guillemets', () => {
  assert.equal(C.analyserCompletude('{\u201Ca\u201D:\u201Cb\u201D}').statut, 'complete');
});

test('copie avec antislashs devant les crochets (affichage mis en forme) : lue sans erreur', () => {
  const t = '{' + AS + '\n "a": ' + AS + '[' + AS + '\n "x' + AS + '_y"' + AS + '\n ' + AS + ']' + AS + '\n}';
  assert.equal(C.analyserCompletude(t).statut, 'complete');
});

test('la ligne [SUITE] : coupé, signalé par l’assistant', () => {
  const r = C.analyserCompletude('{"titresProposes":["A"],\n[SUITE]');
  assert.equal(r.statut, 'coupee');
  assert.equal(r.silencieuse, false);
  assert.equal(r.raison, 'marqueur_suite');
  assert.equal(C.analyserCompletude(JSON_COMPLET + '\n[suite]').statut, 'coupee');
  assert.equal(C.analyserCompletude(JSON_COMPLET + ' [ SUITE ]').silencieuse, false);
});

test('champ de fin : exigé seulement si le texte envoyé le demande', () => {
  assert.equal(C.analyserCompletude(JSON_COMPLET, { exigerFin: false }).statut, 'complete');
  const sans = C.analyserCompletude(JSON_COMPLET, { exigerFin: true });
  assert.equal(sans.statut, 'coupee');
  assert.equal(sans.raison, 'fin_absente');
  assert.equal(C.analyserCompletude('{"titresProposes":["A"],"fin":"complet"}', { exigerFin: true }).statut, 'complete');
  assert.equal(C.analyserCompletude('{"titresProposes":["A"],"fin": "complet"}', { exigerFin: true }).statut, 'complete');
});

// ---------------- assemblerMorceaux ----------------
test('un seul morceau : inchangé (espaces de fin retirés)', () => {
  assert.equal(C.assemblerMorceaux(['{"a":1}\n\n']).texte, '{"a":1}');
  assert.equal(C.assemblerMorceaux([]).texte, '');
});

test('la suite d’un bloc coupé se colle bout à bout, sans ligne vide', () => {
  const r = C.assemblerMorceaux(['```json\n{"a":["un","deu', 'x","trois"],"b":1}\n```']);
  assert.equal(r.texte, '```json\n{"a":["un","deux","trois"],"b":1}\n```');
  assert.equal(C.analyserCompletude(r.texte).statut, 'complete');
  assert.deepEqual(JSON.parse(C.collageLireBloc(r.texte) && r.texte.slice(r.texte.indexOf('{'), r.texte.lastIndexOf('}') + 1)), { a: ['un', 'deux', 'trois'], b: 1 });
});

test('la clôture de code du premier morceau et l’ouverture du second disparaissent', () => {
  const r = C.assemblerMorceaux(['```json\n{"a":["un",\n```', '```json\n"deux"],"b":1}\n```']);
  assert.equal(r.texte.indexOf('```json\n{"a":["un",'), 0);
  assert.equal(r.texte.split('```').length, 3);
  assert.equal(C.analyserCompletude(r.texte).statut, 'complete');
});

test('la ligne [SUITE] est retirée', () => {
  const r = C.assemblerMorceaux(['{"a":["un",\n[SUITE]', '"deux"]}']);
  assert.ok(r.texte.indexOf('[SUITE]') === -1);
  assert.equal(C.analyserCompletude(r.texte).statut, 'complete');
});

test('deux morceaux dont le premier est déjà un bloc complet : séparés par une ligne vide', () => {
  const r = C.assemblerMorceaux([JSON_COMPLET, 'Voulez-vous le complément de CV ?']);
  assert.equal(r.texte, JSON_COMPLET + '\n\nVoulez-vous le complément de CV ?');
});

test('trois morceaux', () => {
  const r = C.assemblerMorceaux(['{"a":["un",', '"deux",', '"trois"]}']);
  assert.equal(r.texte, '{"a":["un","deux","trois"]}');
  assert.equal(r.repete, false);
});

test('l’assistant a recommencé au début au lieu de continuer : repéré', () => {
  const debut = '{"titresProposes":["Agent d’accueil","Hôte d’accueil"],"accrochesProposees":["Une accroche qui commence"';
  const r = C.assemblerMorceaux([debut, debut + ',"une autre"]}']);
  assert.equal(r.repete, true);
  const ok = C.assemblerMorceaux([debut, ',"une autre"]}']);
  assert.equal(ok.repete, false);
});

// ---------------- modeleFenetreCollage : les règles de la maquette ----------------
const MODULE_CV = { nom: 'Vos documents', libelleSuite: 'Ajouter à mon CV', quoi: 'L’assistant a préparé votre CV.', differe: 'Le texte à envoyer est nouveau.', verif: 'en ouvrant votre CV, regardez que tout ce que vous avez indiqué y figure et que rien n’est répété.', conseil: '' };
const base = (o) => C.modeleFenetreCollage(Object.assign({ etat: 'ouvert', nomAssistant: 'ChatGPT', module: MODULE_CV, pieces: 0 }, o));

test('chez l’assistant : bandeau avec « Je suis de retour » et « Rouvrir », gros bouton grisé, rien d’autre', () => {
  const m = base({ etat: 'ouvert' });
  assert.deepEqual(m.bandeau.boutons.map(b => b.id), ['retour', 'rouvrir']);
  assert.equal(m.bandeau.boutons[0].fort, true);
  assert.equal(m.zoneAction.visible, true);
  assert.equal(m.zoneAction.desactive, true);
  assert.equal(m.pied.visible, true);
  assert.equal(m.pied.avecVideo, false);
  assert.equal(m.continuer.actif, false);
  assert.equal(m.recu.visible || m.coupe.visible || m.echec.visible, false);
});

test('prête à coller : gros bouton actif, bloc « à la main » avec sa question', () => {
  const m = base({ etat: 'pret' });
  assert.equal(m.zoneAction.desactive, false);
  assert.equal(m.zoneAction.libelle, 'Coller la réponse');
  assert.equal(m.zoneAction.automatique, '(opération automatique)');
  assert.ok(/Autoriser/.test(m.zoneAction.autorisation) && /coller à la main/.test(m.zoneAction.autorisation), 'la personne est prévenue de la question d’autorisation du navigateur');
  assert.equal(m.blocMain.question, 'Le bouton ci-dessus ne marche pas ?');
  assert.equal(m.pied.visible, true);
});

test('« Changer d’assistant » dès l’écran du retour ; la démonstration seulement après un échec', () => {
  ['main', 'recu', 'coupe'].forEach(etat => assert.equal(base({ etat, pieces: 1 }).pied.visible, false, etat));
  // « Changer d'assistant » dès l'écran du retour (assistant ouvert, prêt à coller), sans la démonstration ; la vidéo reste pour l'échec
  ['ouvert', 'pret'].forEach(etat => { const p = base({ etat }).pied; assert.equal(p.visible, true, etat); assert.equal(p.avecVideo, false, etat); });
  assert.equal(base({ etat: 'echec' }).pied.avecVideo, true);
  assert.equal(base({ etat: 'echec' }).pied.visible, true);
  assert.equal(C.modeleFenetreCollage({ mode: 'complement', etat: 'pret' }).pied.visible, false);
});

test('réponse bien reçue : aucun bouton à lire, « Continuer » dit l’action, deux lignes de vérification', () => {
  const m = base({ etat: 'recu', pieces: 1 });
  assert.equal(m.recu.visible, true);
  assert.equal(m.zoneAction.visible, false);
  assert.equal(m.continuer.actif, true);
  assert.equal(m.continuer.libelle, 'Ajouter à mon CV');
  assert.equal(m.recu.lignes.length, 2);
  assert.equal(m.recu.lignes[0].texte.indexOf('toutes les rubriques attendues sont là') > 0, true);
  assert.equal(m.recu.lignes[1].type, 'info');
  assert.ok(m.recu.lignes[1].texte.indexOf('<strong>À vérifier :</strong>') === 0);
  assert.equal(m.recu.morceaux, '');
  assert.ok(base({ etat: 'recu', pieces: 2 }).recu.morceaux.indexOf('<strong>2 morceaux</strong>') !== -1);
});

test('« À vérifier » : phrase du module, sinon phrase générale sans mot de métier', () => {
  const sans = base({ etat: 'recu', module: { nom: 'x', libelleSuite: 'Voir' } });
  assert.ok(/regardez qu’il correspond/.test(sans.recu.lignes[1].texte));
});

test('réponse coupée : cadre jaune, gros bouton « Coller la suite », compteur, trois étapes, pas de « Recommencer »', () => {
  const m = base({ etat: 'coupe', pieces: 1, silencieux: false });
  assert.equal(m.titre.texte, 'La suite de la réponse');
  assert.equal(m.coupe.visible, true);
  assert.equal(m.coupe.etapes.length, 3);
  assert.equal(m.zoneAction.visible, true);
  assert.equal(m.zoneAction.libelle, 'Coller la suite');
  assert.equal(m.zoneAction.desactive, false);
  assert.ok(/prévenu/.test(m.coupe.texte));
  assert.ok(/1 morceau</.test(m.coupe.texte));
  assert.equal(m.echec.visible, false);
  assert.equal(m.continuer.actif, false);
  const s = base({ etat: 'coupe', pieces: 2, silencieux: true });
  assert.ok(/sans vous prévenir/.test(s.coupe.texte));
  assert.ok(/2 morceaux</.test(s.coupe.texte));
  assert.equal(m.quoi, '');
});

test('réponse inutilisable : message doux, deux étapes, sortie « Recommencer », pied visible', () => {
  const m = base({ etat: 'echec' });
  assert.equal(m.echec.visible, true);
  assert.equal(m.echec.etapes.length, 2);
  assert.equal(m.echec.apresSuite, false);
  assert.ok(/Rien n’a été ajouté/.test(m.echec.texte));
  assert.equal(m.zoneAction.visible, false);
  assert.equal(m.quoi, '');
  const apres = base({ etat: 'echec', echecApresSuite: true, pieces: 1 });
  assert.equal(apres.echec.apresSuite, true);
  assert.equal(base({ etat: 'echec', echecApresSuite: true, pieces: 0 }).echec.apresSuite, false);
});

test('deux passages : pastille et explication de la différence seulement au deuxième passage, avant la réponse', () => {
  assert.equal(base({ passage: '' }).pastille, '');
  assert.ok(/Premier passage/.test(base({ passage: '1/2' }).pastille));
  assert.ok(/Deuxième passage/.test(base({ passage: '2/2' }).pastille));
  assert.equal(base({ passage: '1/2' }).differe, '');
  assert.equal(base({ passage: '2/2' }).differe, 'Le texte à envoyer est nouveau.');
  assert.equal(base({ passage: '2/2', etat: 'recu' }).differe, '');
  assert.equal(base({ passage: '2/2', etat: 'coupe', pieces: 1 }).differe, '');
});

test('les deux passages ont exactement la même fenêtre (mêmes boutons)', () => {
  ['ouvert', 'pret', 'main', 'recu', 'coupe', 'echec'].forEach(etat => {
    const a = base({ etat, passage: '1/2', pieces: 1 }), b = base({ etat, passage: '2/2', pieces: 1 });
    ['zoneAction', 'blocMain', 'zoneMain', 'recu', 'coupe', 'echec', 'pied', 'continuer', 'bandeau', 'titre'].forEach(k => assert.deepEqual(a[k], b[k], etat + ' / ' + k));
  });
});

test('complément de CV : un seul bouton pour continuer sans, un bouton qui montre ce qu’il ajoute, trois étapes, rappel « plus tard »', () => {
  const m = C.modeleFenetreCollage({ mode: 'complement', etat: 'pret', module: MODULE_CV, nomAssistant: 'ChatGPT' });
  assert.equal(m.titre.texte, 'Le complément de votre CV');
  assert.equal(m.complement.visible, true);
  assert.equal(m.complement.etapes.length, 3);
  assert.equal(m.complement.exemples.length, 4);
  assert.equal(m.zoneAction.libelle, 'Coller le complément');
  assert.equal(m.bandeau, null);
  assert.equal(m.pastille, '');
  assert.equal(m.continuer.libelle, 'Continuer sans le complément');
  assert.equal(m.continuer.actif, true);
  assert.equal(m.continuer.discret, true, '« Continuer sans le complément » est discret : on n’encourage pas à s’en passer');
  assert.ok(/plus tard/.test(m.complement.plusTard));
  const recu = C.modeleFenetreCollage({ mode: 'complement', etat: 'recu', module: MODULE_CV, pieces: 1 });
  assert.equal(recu.continuer.libelle, 'Ajouter le complément');
  assert.equal(recu.complement.visible, false);
});

test('conseil : celui du module puis celui de l’assistant', () => {
  assert.equal(base({ conseilAssistant: 'Gemini demande un compte.', module: Object.assign({}, MODULE_CV, { conseil: 'Dites-lui X.' }) }).conseil, 'Dites-lui X. Gemini demande un compte.');
  assert.equal(base({}).conseil, '');
});

// ---------------- Règles de langue : tout ce que la personne lit ----------------
function tousLesTextes(o, sortie) {
  if (typeof o === 'string') { sortie.push(o); }
  else if (typeof o === 'function') { sortie.push(o('Un assistant')); sortie.push(o(2)); }
  else if (Array.isArray(o)) { o.forEach(x => tousLesTextes(x, sortie)); }
  else if (o && typeof o === 'object') { Object.keys(o).forEach(k => tousLesTextes(o[k], sortie)); }
  return sortie;
}
test('aucun tiret long, aucun mot « IA », aucun mot de métier dans les textes communs', () => {
  const textes = tousLesTextes(C.COLLAGE_TEXTES, []);
  assert.ok(textes.length > 40);
  textes.forEach(t => {
    assert.ok(!/[\u2013\u2014]/.test(t), 'tiret long : ' + t);
    assert.ok(!/\bIA\b/.test(t), 'mot IA : ' + t);
    assert.ok(!/mission|exp[ée]rience\b|bloc de donn[ée]es|JSON/i.test(t.replace(/vos emplois/gi, '')), 'mot de métier : ' + t);
  });
});

test('les textes à envoyer à l’assistant (mot « suite », « oui ») sont ceux de la maquette', () => {
  const T = C.COLLAGE_TEXTES;
  assert.ok(/<strong>suite<\/strong>/.test(T.coupe.etapes[1]));
  assert.ok(/<strong>(« )?oui( »)?<\/strong>/.test(T.complement.etapes[1]));
  // Consigne 205 (10/11/2026) : le texte du complément dit où retourner, quoi répondre, et comment ne pas le prendre.
  assert.ok(/même fenêtre de discussion, avec le même assistant/.test(T.complement.etapes[0]));
  assert.ok(/Continuer sans le complément/.test(T.complement.sans));
  assert.equal(C.COLLAGE_MARQUEUR_SUITE, '[SUITE]');
});

// ---------------- réponse en tableau d'objets (correction par lot) ----------------
test('tableau d’objets : coupé au milieu du deuxième objet, la réponse est jugée coupée', () => {
  const coupe = '[{"id":"dem-1","proposition":"Texte un","justification":"Parce que"},{"id":"dem-2","proposition":"Tex';
  assert.equal(C.analyserCompletude(coupe).statut, 'coupee');
  const entier = coupe + 'te deux","justification":"Aussi"}]';
  assert.equal(C.analyserCompletude(entier).statut, 'complete');
});
test('tableau d’objets : les morceaux se collent bout à bout, sans ligne vide au milieu', () => {
  const a = '[{"id":"dem-1","proposition":"Un"},{"id":"dem-2","proposition":"De';
  const b = 'ux"}]';
  const r = C.assemblerMorceaux([a, b]);
  assert.equal(r.texte, a + b);
  assert.equal(C.analyserCompletude(r.texte).statut, 'complete');
});

// ---------------- échec expliqué par le module ----------------
test('échec personnalisé : le texte et le bouton du module remplacent la phrase commune et les étapes', () => {
  const perso = { texte: 'Le document déposé n’était pas un CV.', bouton: { libelle: 'Revenir au dépôt du CV' } };
  const m = C.modeleFenetreCollage({ etat: 'echec', echecPersonnalise: perso, module: {} });
  assert.equal(m.echec.texte, perso.texte);
  assert.equal(m.echec.etapes.length, 0);
  assert.equal(m.echec.personnalise.bouton.libelle, 'Revenir au dépôt du CV');
  const commun = C.modeleFenetreCollage({ etat: 'echec', module: {} });
  assert.equal(commun.echec.personnalise, null);
  assert.equal(commun.echec.etapes.length, 2);
});

test('« Pourquoi c’est utile » : la phrase du module suit « Ce qui se passe » et disparaît avec lui', () => {
  const avec = Object.assign({}, MODULE_CV, { pourquoi: 'Vous gardez la main.' });
  assert.equal(base({ etat: 'ouvert', module: avec }).pourquoi, 'Vous gardez la main.');
  assert.equal(base({ etat: 'echec', module: avec }).pourquoi, '');
  assert.equal(base({ etat: 'coupe', module: avec }).pourquoi, '');
  assert.equal(base({ etat: 'ouvert' }).pourquoi, '');   // module sans phrase : rien d'affiché
});
