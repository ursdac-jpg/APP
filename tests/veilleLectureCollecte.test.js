const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Charge les VRAIES fonctions de lecture de l'outil (outils/veille.html), sans navigateur : on en extrait seulement le texte des fonctions.
const HTML = fs.readFileSync(path.join(__dirname, '..', 'outils', 'veille.html'), 'utf8').replace(/\r\n/g, '\n');
function extraireFonction(nom) {
  const debut = HTML.indexOf('  function ' + nom + '(');
  assert.ok(debut !== -1, 'fonction introuvable : ' + nom);
  let i = HTML.indexOf('{', debut), niveau = 0;
  for (; i < HTML.length; i++) {
    if (HTML[i] === '{') { niveau++; } else if (HTML[i] === '}') { niveau--; if (niveau === 0) { break; } }
  }
  return HTML.slice(debut, i + 1);
}
const code = ['slug', 'nettoyerAdresse', 'parseSourceLigne', 'extraireListe'].map(extraireFonction).join('\n');
const outils = vm.runInNewContext(code + '\n({ slug, nettoyerAdresse, parseSourceLigne, extraireListe })', { URL, Array });
const lire = (ligne) => JSON.parse(JSON.stringify(outils.parseSourceLigne(ligne)));

test('collecte : une adresse nue (format demande) est lue comme avant', () => {
  const r = lire('service-public-periode-essai | Période d\'essai pour un salarié | https://www.service-public.fr/particuliers/vosdroits/F1643 | 2026-10-07');
  assert.strictEqual(r.url, 'https://www.service-public.fr/particuliers/vosdroits/F1643');
  assert.strictEqual(r.date, '2026-10-07');
  assert.strictEqual(r.titre, 'Période d\'essai pour un salarié');
});

test('collecte : une adresse rendue en lien cliquable [adresse](adresse) est lue (elle etait perdue)', () => {
  const r = lire('service-public-cdd-droits | Droits du salarié en contrat à durée déterminée | [https://www.service-public.fr/particuliers/vosdroits/F41](https://www.service-public.fr/particuliers/vosdroits/F41) | 2026-10-07');
  assert.strictEqual(r.url, 'https://www.service-public.fr/particuliers/vosdroits/F41');
  assert.strictEqual(r.date, '2026-10-07');
  assert.strictEqual(r.titre, 'Droits du salarié en contrat à durée déterminée');
});

test('collecte : un lien cliquable dont le texte n\'est pas une adresse donne l\'adresse, sans perdre le titre', () => {
  const r = lire('france-travail | [France Travail](https://www.francetravail.fr/) | 2026-10-07');
  assert.strictEqual(r.url, 'https://www.francetravail.fr/');
  assert.strictEqual(r.titre, 'France Travail');
});

test('collecte : les parametres de suivi et la langue forcee sont retires, le reste de l\'adresse est garde', () => {
  assert.strictEqual(outils.nettoyerAdresse('https://www.service-public.fr/particuliers/vosdroits/F2360?trk=public_post_comment-text'), 'https://www.service-public.fr/particuliers/vosdroits/F2360');
  assert.strictEqual(outils.nettoyerAdresse('https://www.service-public.fr/particuliers/vosdroits/F11215?lang=fr&rut=e909ffbb26c79913798696f3f1374e6a0e7f67c28f577a713ab1e39074f9cf49'), 'https://www.service-public.fr/particuliers/vosdroits/F11215');
  assert.strictEqual(outils.nettoyerAdresse('https://exemple.org/page?id=12&utm_source=x&utm_medium=y'), 'https://exemple.org/page?id=12');
  assert.strictEqual(outils.nettoyerAdresse('https://emplois.inclusion.beta.gouv.fr/search/employers/results?city=perigueux-24&distance=25&kinds=ACI'), 'https://emplois.inclusion.beta.gouv.fr/search/employers/results?city=perigueux-24&distance=25&kinds=ACI');
  assert.strictEqual(outils.nettoyerAdresse('pas une adresse'), 'pas une adresse');
});

test('collecte : une ligne « structures » avec description longue et lien cliquable garde bien son adresse', () => {
  const r = lire('ddetspp-dordogne | DDETSPP de la Dordogne : emploi, travail, insertion ; portée départementale ; accueil : 05 53 03 65 00 | [https://www.dordogne.gouv.fr/Services-de-l-Etat/Les-directions-interministerielles/Direction-de-l-Emploi-du-Travail-des-Solidarites-et-de-la-Protection-des-Populations-DDETSPP](https://www.dordogne.gouv.fr/Services-de-l-Etat/Les-directions-interministerielles/Direction-de-l-Emploi-du-Travail-des-Solidarites-et-de-la-Protection-des-Populations-DDETSPP) | 2026-10-07');
  assert.match(r.url, /^https:\/\/www\.dordogne\.gouv\.fr\/.*DDETSPP$/);
  assert.match(r.titre, /^DDETSPP de la Dordogne/);
});

test('collecte : le bloc « sources » et le bloc « structures » d\'une reponse de Perplexity sont separes correctement', () => {
  const bloc = [
    'sources:',
    '- a-un | Titre un | [https://exemple.org/un](https://exemple.org/un) | 2026-10-07',
    '- a-deux | Titre deux | [https://exemple.org/deux](https://exemple.org/deux) | 2026-10-07',
    '',
    'structures:',
    '- b-un | Description un | [https://exemple.org/s1](https://exemple.org/s1) | 2026-10-07',
    '',
    'texte_brut:',
    '## Un sujet',
    'Du texte.'
  ].join('\n');
  const sources = outils.extraireListe(bloc, 'sources').map(lire);
  const structures = outils.extraireListe(bloc, 'structures').map(lire);
  assert.strictEqual(JSON.stringify(sources.map((x) => x.url)), JSON.stringify(['https://exemple.org/un', 'https://exemple.org/deux']));
  assert.strictEqual(JSON.stringify(structures.map((x) => x.url)), JSON.stringify(['https://exemple.org/s1']));
});

test('outil : un seul bouton de lecture par zone « Coller ici », et chaque zone annonce son bloc [MARQUE] (necessaire a la lecture automatique)', () => {
  assert.ok(HTML.indexOf('si déjà collé') === -1, 'plus de deuxieme bouton « Lire (si déjà collé) »');
  const boutons = HTML.match(/collerDans\('(\w+)', this, '\w+'\)/g) || [];
  assert.ok(boutons.length >= 13, 'les zones de lecture existent : ' + boutons.length);
  boutons.forEach((b) => {
    const id = /collerDans\('(\w+)'/.exec(b)[1];
    const etiquette = new RegExp('<label for="' + id + '"[^>]*>([^<]*)</label>').exec(HTML);
    assert.ok(etiquette, 'etiquette de la zone ' + id);
    assert.match(etiquette[1], /\[[A-Z][A-Z0-9-]*\]/, 'la zone ' + id + ' annonce son bloc [MARQUE]');
  });
});

test('outil : « Ma base » dit clairement qu\'il n\'y a rien a faire, et le bouton inutile du parcours guide est cache', () => {
  assert.ok(HTML.indexOf('Rien à faire ici : vos ') !== -1);
  assert.ok(/<div class="btn-rangee bloc-select-classique"><button class="btn primaire" onclick="assemblerControle\(\)">/.test(HTML));
  assert.ok(/body\.focus-guide \.bloc-cycle, body\.focus-guide \.bloc-select-classique \{ display:none; \}/.test(HTML));
});

test('outil : le cadre de la reponse se replie apres une lecture reussie (il reapparait tout seul s\'il est vide) et la lecture automatique se regle dans « Réglages et gestion »', () => {
  assert.ok(/textarea\.reponse-repliee:not\(:placeholder-shown\):not\(\.reponse-ouverte\) \{ display:none !important; \}/.test(HTML), 'regle de repli : seulement quand le cadre contient du texte');
  const boutons = HTML.match(/collerDans\('(\w+)', this, '\w+'\)/g) || [];
  boutons.forEach((b) => {
    const id = /collerDans\('(\w+)'/.exec(b)[1];
    assert.ok(new RegExp('<textarea id="' + id + '"[^>]*placeholder="[^"]+"').test(HTML), 'la zone ' + id + ' a un texte d\'aide (necessaire au repli)');
  });
  assert.ok(HTML.indexOf('Réponse reçue et lue.') !== -1 && HTML.indexOf('est pas la bonne réponse : recommencer') !== -1);
  assert.ok(HTML.indexOf('Ne plus lire automatiquement') === -1, 'plus de bouton technique a cote de la reponse');
  assert.ok(/id="optLectureAuto"/.test(HTML) && /veille_lecture_auto/.test(HTML), 'case a cocher dans les reglages');
});

test('outil : le prompt de redaction contient le materiau de Perplexity, et l\'ecran le dit', () => {
  assert.ok(HTML.indexOf('=== MATÉRIAU ===') !== -1 && HTML.indexOf('+ _collecte.texte +') !== -1, 'le materiau collecte est dans le prompt');
  assert.ok(HTML.indexOf('Ce que Perplexity a trouvé (étape 2) est déjà à l\'intérieur de ce prompt') !== -1);
});

// Materiau de la collecte : cas reel de Perplexity (le texte est AVANT le bloc, le bloc ne contient qu'un renvoi)
const materiau = vm.runInNewContext(extraireFonction('materiauDeLaReponse') + '\n({ materiauDeLaReponse })', {}).materiauDeLaReponse;
const longTexte = (n) => ('L\'échange du permis étranger est payant depuis le 12 mai 2026. ').repeat(n);

test('collecte : le texte situe dans le bloc [COLLECTE] est utilise quand il est assez long', () => {
  const t = 'Introduction.\n[COLLECTE]\nsources:\n- a | b | https://x.org | 2026-10-07\ntexte_brut:\n' + longTexte(30) + '\n[/COLLECTE]';
  const r = materiau(t, longTexte(30));
  assert.strictEqual(r.origine, 'bloc');
  assert.ok(r.texte.indexOf('12 mai 2026') !== -1);
});

test('collecte : si le bloc ne contient qu\'un renvoi (« voir sections ci-dessus »), le texte situe AVANT le bloc est pris, citations retirees', () => {
  const avant = '1. Texte en vigueur\n' + longTexte(40).replace(/payant/g, 'payant.[[ants.gouv](https://permisdeconduire.ants.gouv.fr/x)][[service-public](https://www.service-public.gouv.fr/y)]');
  const t = avant + '\n[COLLECTE]\nsources:\n- a | b | https://x.org | 2026-10-07\ntexte_brut:\n(voir sections 1 à 10 ci-dessus)\n[/COLLECTE]';
  const r = materiau(t, '(voir sections 1 à 10 ci-dessus)');
  assert.strictEqual(r.origine, 'avant');
  assert.ok(r.texte.indexOf('12 mai 2026') !== -1);
  assert.ok(r.texte.indexOf('[[') === -1 && r.texte.indexOf('ants.gouv') === -1, 'les citations en double crochet sont retirees');
  assert.ok(r.texte.indexOf('voir sections') === -1, 'le renvoi n\'est pas le materiau');
});

test('collecte : sans champ texte_brut, toute la reponse sert de materiau ; deux textes courts : on garde le bloc', () => {
  assert.strictEqual(materiau('Un texte sans bloc.', null).origine, 'bloc');
  const r = materiau('Court.\n[COLLECTE]\ntexte_brut:\nTrès court aussi.\n[/COLLECTE]', 'Très court aussi.');
  assert.strictEqual(r.origine, 'bloc');
  assert.strictEqual(r.texte, 'Très court aussi.');
});

test('collecte : les citations [site.fr](adresse) de Perplexity sont retirees du materiau, les adresses citees dans le texte sont gardees', () => {
  const brut = 'Le timbre coûte 40 €. [permisdeconduire.ants.gouv](https://permisdeconduire.ants.gouv.fr/x)\nÀ compter du 12 mai 2026. [service-public.gouv](https://www.service-public.gouv.fr/y)\nLa demande se fait sur [https://permisdeconduire.ants.gouv.fr/](https://permisdeconduire.ants.gouv.fr/) uniquement.\nVoir le [guide complet](https://exemple.org/guide) pour le détail.';
  const r = materiau('[COLLECTE]\ntexte_brut:\n' + brut + '\n[/COLLECTE]', brut);
  assert.ok(r.texte.indexOf('permisdeconduire.ants.gouv](') === -1 && r.texte.indexOf('service-public.gouv](') === -1, 'citations retirees');
  assert.ok(r.texte.indexOf('Le timbre coûte 40 €.') !== -1 && r.texte.indexOf('12 mai 2026.') !== -1, 'le texte est intact');
  assert.ok(r.texte.indexOf('sur https://permisdeconduire.ants.gouv.fr/ uniquement') !== -1, 'adresse du texte gardee, une seule fois');
  assert.ok(r.texte.indexOf('[guide complet](https://exemple.org/guide)') !== -1, 'un vrai lien a texte libre est conserve');
});

const blocSources = vm.runInNewContext(extraireFonction('blocSourcesCollecte') + '\n({ blocSourcesCollecte })', {}).blocSourcesCollecte;

test('prompt de redaction : la liste des noms courts des sources est donnee a l\'assistant (sinon il les invente)', () => {
  const b = blocSources([{ nom: 'service-public-f1460', titre: 'Échange hors Europe', url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1460' }, { nom: 'ants-permis', titre: 'ANTS', url: '' }]);
  assert.match(b, /=== SOURCES DISPONIBLES/);
  assert.match(b, /- service-public-f1460  \|  Échange hors Europe  \|  https:\/\/www\.service-public\.gouv\.fr\/particuliers\/vosdroits\/F1460/);
  assert.match(b, /- ants-permis  \|  ANTS\n/);
  assert.strictEqual(blocSources([]), '');
  assert.ok(HTML.indexOf('+ blocSourcesCollecte(_collecte.detail)') !== -1, 'le bloc est branche dans le prompt');
});

test('outil : la carte d\'un rayon n\'a plus que « Contrôler ce rayon » (plus de doublons avec l\'accueil)', () => {
  assert.ok(HTML.indexOf('Contrôler ce rayon</button>') !== -1);
  assert.strictEqual(HTML.split('entrerFocusColleCollecteRayon').length - 1, 1, 'seule la definition de la fonction reste');
});

// ---------- Controle : sujets nouveaux et fiches retirees ----------
const sujetsNouveaux = vm.runInNewContext(extraireFonction('nouveauxSujetsDeLaReponse') + '\n({ nouveauxSujetsDeLaReponse })', {}).nouveauxSujetsDeLaReponse;
const ficheRetiree = vm.runInNewContext(extraireFonction('fabriquerFicheRetiree') + '\n({ fabriquerFicheRetiree })', {}).fabriquerFicheRetiree;
const lireJson = (o) => JSON.parse(JSON.stringify(o));

test('controle : le bloc [NOUVEAUX-SUJETS] est lu (sujet, resume, sources) ; « aucun » ou l\'absence de bloc donnent une liste vide', () => {
  const t = '[CONTROLE rayon: etranger]\nfiche: a\netat: A JOUR\n[/CONTROLE]\n[NOUVEAUX-SUJETS]\nsujet: Comment faire traduire mes documents officiellement ?\nresume: Aucune fiche ne parle de la traduction officielle des papiers.\nsources:\n* https://www.service-public.gouv.fr/x\n* https://exemple.org/y\n\n- sujet: Peut-on conduire un scooter avec un permis étranger ?\nresume: Cas fréquent non traité.\nsources:\n- https://exemple.org/z\n[/NOUVEAUX-SUJETS]\n';
  const r = lireJson(sujetsNouveaux(t));
  assert.strictEqual(r.length, 2);
  assert.strictEqual(r[0].sujet, 'Comment faire traduire mes documents officiellement ?');
  assert.strictEqual(r[0].resume, 'Aucune fiche ne parle de la traduction officielle des papiers.');
  assert.strictEqual(JSON.stringify(r[0].sources), JSON.stringify(['https://www.service-public.gouv.fr/x', 'https://exemple.org/y']));
  assert.strictEqual(r[1].sujet, 'Peut-on conduire un scooter avec un permis étranger ?');
  assert.strictEqual(lireJson(sujetsNouveaux('[NOUVEAUX-SUJETS]\naucun\n[/NOUVEAUX-SUJETS]')).length, 0);
  assert.strictEqual(lireJson(sujetsNouveaux('[CONTROLE rayon: x]\n[/CONTROLE]')).length, 0);
  const six = '[NOUVEAUX-SUJETS]\n' + [1, 2, 3, 4, 5, 6, 7].map((i) => 'sujet: Sujet ' + i + '\nresume: R\nsources:\n- https://e.org/' + i).join('\n') + '\n[/NOUVEAUX-SUJETS]';
  assert.strictEqual(lireJson(sujetsNouveaux(six)).length, 5, 'au plus 5 sujets');
});

test('controle : une fiche retiree garde son en-tete, passe en statut retire, porte la raison, et ne contient aucun tiret interdit', () => {
  const original = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'contenu', 'etranger', 'etranger-permis-de-conduire-etranger.md'), 'utf8');
  const md = ficheRetiree(original, 'Le dispositif a pris fin \u2013 remplacé par une démarche en ligne.', 'etranger-titre-de-sejour-et-travail', '2026-11', 'novembre 2026');
  assert.ok(md.startsWith('---\n'));
  assert.match(md, /\nstatut: retire\n/);
  assert.match(md, /\nverifie_le: 2026-11\n/);
  assert.match(md, /\nretire_le: 2026-11\n/);
  assert.match(md, /\nretire_raison: "Le dispositif a pris fin remplacé par une démarche en ligne\."\n/);
  assert.match(md, /\nremplace_par: etranger-titre-de-sejour-et-travail\n/);
  assert.match(md, /\nid: etranger-permis-de-conduire-etranger\n/);
  assert.ok(md.indexOf('retire_le') < md.indexOf('collecte:'), 'les champs de retrait sont places avant « collecte: »');
  assert.match(md, /---\n\nCette information a été retirée en novembre 2026\.\n\nLe dispositif a pris fin remplacé/);
  assert.ok(!/[\u2013\u2014]/.test(md), 'aucun tiret cadratin ou demi-cadratin');
  // le depot accepte ce fichier (meme controle que pour une fiche ordinaire)
  const { validerFichier } = require('../outils/veilleDepot.js');
  const v = validerFichier(path.join(__dirname, '..'), { type: 'fiche', rayon: 'etranger', nom: 'etranger-permis-de-conduire-etranger.md', texte: md }, ['etranger']);
  assert.ok(v.ok, JSON.stringify(v));
  // une fiche deja retiree n'accumule pas les champs de retrait
  const encore = ficheRetiree(md, 'Nouvelle raison', '', '2026-12', 'décembre 2026');
  assert.strictEqual((encore.match(/^retire_le:/gm) || []).length, 1);
  assert.strictEqual((encore.match(/^retire_raison:/gm) || []).length, 1);
  assert.ok(!/remplace_par/.test(encore), 'sans remplacement indique, l\'ancien est retire');
  assert.strictEqual(ficheRetiree('pas un en-tete', 'x', '', '2026-11', 'novembre 2026'), null);
});

test('controle : le prompt demande les sujets qui manquent, et l\'ecran propose les trois actions', () => {
  assert.ok(HTML.indexOf('[NOUVEAUX-SUJETS]') !== -1 && HTML.indexOf('que les fiches ci-dessus ne couvrent pas du tout') !== -1);
  ['Retirer cette fiche', 'Préparer la mise à jour de cette fiche', 'Préparer cette fiche', 'Nouveaux sujets possibles', 'Fiches qui ne sont plus d'].forEach((t) => {
    assert.ok(HTML.indexOf(t) !== -1, 'texte absent : ' + t);
  });
});
