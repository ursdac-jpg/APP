// Fabrique les messages pour Perplexity (structures ou employeurs) à partir du sas actuel, avec le tableau de correspondance numéro -> identifiant.
// Usage : node scripts/veille_sas/fabriquer_message_perplexity.js <structures|employeurs> [taille=25] [depuis=0 | tous]
//   taille : nombre de fiches par message (une réponse de Perplexity ne peut pas en traiter des centaines).
//   tous   : fabrique TOUS les messages d'un coup, dans un seul fichier (messages de <taille> fiches).
//   depuis : un seul message, en sautant les N premières fiches de l'ordre de priorité.
// Ne modifie aucun fichier du sas. Écrit docs/MESSAGES_PERPLEXITY_<TYPE>_<date>.md (messages à copier + correspondance).
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..', '..');
const { creerDepot } = require(path.join(R, 'outils', 'veilleDepot.js'));
const T = require(path.join(R, 'outils', 'veilleTerritoire.js'));

const type = process.argv[2];
if (type !== 'structures' && type !== 'employeurs') { console.error('Usage : structures ou employeurs'); process.exit(1); }
const taille = +process.argv[3] || 25;
const mode = process.argv[4] === 'tous', depuis = mode ? 0 : (+process.argv[4] || 0);
const fichier = type === 'structures' ? 'lieux' : 'employeurs';
const aujourdhui = new Date().toISOString().slice(0, 10);

const depot = creerDepot(R);
const lignes = depot.listerSas(fichier, true).lignes;
const publies = T.analyser(fs.readFileSync(path.join(R, 'modules', 'mon-territoire', 'contenu', fichier + '.txt'), 'utf8'), T.FICHIERS[fichier].colonnes).lignes.filter(r => r.id).map(r => r.valeurs);
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const nomsPublies = {}; publies.forEach(v => { nomsPublies[norm(v.nom)] = v; });

// Rang de priorité : les fiches qui n'ont AUCUN contrôle d'abord, puis celles que le dossier Cloud a lues avec réserve, puis celles modifiées depuis leur contrôle.
// Les fiches déjà « Prêtes » (contrôlées à la main, prévalidées, lues par le dossier Cloud) ne sont pas reprises.
function rang(l) {
  const s = String((l.valeurs && l.valeurs.source) || '');
  if (l.prevalidee && l.prevalidee.valide) { return -1; }
  if (l.prevalidee) { return 8; }
  if (s.indexOf('À contrôler par le responsable') !== -1) { return 7; }
  if (s.indexOf('Vérifié en ligne le 02/11/2026 (Claude en ligne et Claude Code)') !== -1) { return -1; }
  if (/^Annuaire de l.administration \(Service-Public\.fr\), fiche/.test(s)) { return -1; }
  if (/Dossier Cloud|dossier Cloud/.test(s)) { return 6; }
  if (/^proposée par un assistant, source non donnée/.test(s)) { return 1; }
  if (/^https?:\/\/\S+\s*$/.test(s)) { return 3; }
  if (/complété.{0,12} depuis la fiche de l.annuaire|Annuaire du ministère/.test(s)) { return 4; }
  if (/Denis/.test(s)) { return 5; }
  return 2;
}
// Fiches que Denis a déjà regardées à la main (outils/sas/deja-regardees.txt) : on ne les redemande pas à Perplexity.
const fDeja = path.join(R, 'outils', 'sas', 'deja-regardees.txt');
const deja = new Set(fs.existsSync(fDeja) ? fs.readFileSync(fDeja, 'utf8').split(/\r?\n/).filter(l => l && l[0] !== '#').map(l => l.split(' | ')[0]) : []);
const retenues = lignes.filter(l => !l.doublon && !deja.has(l.id)).map(l => ({ l, r: (type === 'employeurs' && nomsPublies[norm(l.valeurs.nom)] && rang(l) >= 0) ? 0 : rang(l) })).filter(x => x.r >= 0).sort((a, b) => a.r - b.r);

const terr = l => { const p = (l.valeurs.portee || '').trim(); return p === '24' ? 'Dordogne (24)' : p === '87' ? 'Haute-Vienne (87)' : p === 'region' ? 'région Nouvelle-Aquitaine' : p === 'national' ? 'national' : p; };
function ligneStructure(x, n) {
  const v = x.l.valeurs;
  return n + ' | ' + v.nom + ' | ' + (v.commune || 'commune non précisée') + ' | ' + terr(x.l) + ' | site proposé : ' + (v.site || 'aucun') + ' | numéro proposé : ' + (v.telephone || 'aucun');
}
function ligneEmployeur(x, n) {
  const v = x.l.valeurs, pub = nomsPublies[norm(v.nom)];
  const coms = String(v.etablissements || '').split(';').map(e => e.split(':')[0].trim()).filter(Boolean);
  const dep = pub ? ' | ENSEIGNE DÉJÀ PUBLIÉE POUR LA DORDOGNE : ne traite que la Haute-Vienne (87)' : '';
  return n + ' | ' + v.nom + ' | ' + (v.nature === 'enseigne' ? 'enseigne à plusieurs magasins' : 'un seul établissement') + ' | ' + (v.secteur || 'secteur non précisé') + ' | lieux proposés : ' + (coms.slice(0, 4).join(', ') || 'aucun') + ' | site proposé : ' + (v.site || 'aucun') + ' | recrutement proposé : ' + (v.recrutement || 'aucun') + dep;
}
const fabr = type === 'structures' ? ligneStructure : ligneEmployeur;

// Consigne de longueur (04/11/2026) : lots de 25, aucun total imposé, aucun plafond de recherches (leçon 9.101).
// On lui demande donc TOUTES les lignes dans une seule réponse, sans lui parler d'un second passage, et on borne l'effort par ligne pour que ce soit tenable.
function finCommune(n, d) {
  return [
    'Longueur et méthode : la liste est courte (' + n + ' lignes, numéros ' + (d + 1) + ' à ' + (d + n) + ') pour que tu puisses OUVRIR RÉELLEMENT la page de chaque ligne. Traite-les toutes dans l\'ordre, en une seule réponse, sans en sauter aucune, sans proposer de suite, sans demander si tu dois continuer, sans question, sans commentaire, sans introduction ni conclusion.',
    'Honnêteté avant tout : n\'écris « non vérifiable » ou « introuvable » qu\'après avoir réellement essayé d\'ouvrir la page ou de chercher son site officiel. Une ligne exacte vaut mieux qu\'une ligne remplie pour la forme. Ne remplis jamais une ligne sans avoir regardé.',
    'Dernière ligne de ta réponse, après la dernière ligne de résultat : « PAGES RÉELLEMENT OUVERTES : N sur ' + n + ' ».',
    'Dernière section, intitulée « À OUVRIR PAR MOI » : pour chaque site qui t\'a refusé l\'accès ou que tu n\'as pas pu ouvrir (403, Access Denied, Just a moment, erreur), un lien cliquable au format Markdown vers le site, avec le numéro de la ligne concernée.'
  ].join('\n\n');
}

// Le texte du message (consignes + liste) pour un paquet de fiches ; d = nombre de fiches des messages précédents (les numéros continuent).
function messageDe(choisies, d) {
  const plage = 'numérotées de ' + (d + 1) + ' à ' + (d + choisies.length);
  if (type === 'structures') {
    return [
      '@Recherche sur le Web',
      '',
      'Je te donne une liste de ' + choisies.length + ' structures (services publics, associations, organismes) de la Dordogne (24) et de la Haute-Vienne (87), ' + plage + '. Pour chacune, un site et un numéro de téléphone ont été proposés, mais ils n\'ont jamais été vérifiés. Tu dois vérifier UNIQUEMENT sur les sites OFFICIELS et me rapporter ce qui y est AFFICHÉ.',
      '',
      'Règles :',
      '1. Pour chaque structure, ouvre sa page officielle : son propre site, ou à défaut la page d\'une administration (commune, département, préfecture, ministère) qui la présente. Le site que je propose est une INDICATION, souvent fausse : vérifie-le, et cherche le bon s\'il est faux ou absent.',
      '2. N\'utilise aucun annuaire privé, PagesJaunes, comparateur, site d\'offres d\'emploi ni réseau social.',
      '3. Lis uniquement ce qui est affiché sur la page. N\'invente rien, ne complète rien de mémoire.',
      '4. Le territoire compte : la structure doit être celle du territoire indiqué (24, 87, région ou national). Méfie-toi des homonymes d\'un autre département.',
      '5. Le statut est un seul mot : « confirmé » (le site et le numéro proposés correspondent à la page officielle), « corrigé » (une valeur diffère : donne celle que tu as lue), « introuvable » (aucune page officielle trouvée), « fermée » (la structure n\'existe plus ou n\'est plus dans ce territoire).',
      '6. Le téléphone est copié exactement tel qu\'affiché ; s\'il n\'y en a pas, écris « pas de numéro vu ». L\'adresse est copiée telle qu\'affichée (rue, code postal, commune) ; sinon « pas d\'adresse vue ».',
      '',
      'Réponds uniquement avec une ligne par structure, sans tableau, sous cette forme exacte :',
      'numéro | statut | téléphone affiché | adresse affichée | URL exacte de la page où tu les as lus | site officiel de la structure (si différent)',
      '',
      finCommune(choisies.length, d),
      '',
      'LISTE (numéro | nom | commune | territoire | site proposé | numéro proposé) :'
    ].join('\n');
  }
  return [
    '@Recherche sur le Web',
    '',
    'Je te donne une liste de ' + choisies.length + ' employeurs (entreprises, enseignes, établissements publics) de la Dordogne (24) et de la Haute-Vienne (87), ' + plage + '. Pour chacun, un site et parfois une page de recrutement ont été proposés, mais ils n\'ont jamais été vérifiés. Tu dois vérifier UNIQUEMENT sur les sites OFFICIELS et me rapporter ce qui y est AFFICHÉ.',
    '',
    'Règles :',
    '1. Pour chaque employeur, ouvre son site officiel. Le site que je propose est une INDICATION, souvent fausse : vérifie-le, et cherche le bon s\'il est faux ou absent.',
    '2. Cherche ensuite sa PAGE DE RECRUTEMENT officielle (offres, « nous rejoindre », candidature spontanée). Si le recrutement passe par un site de groupe ou de réseau, donne cette page. Si elle n\'existe pas, écris « pas de page recrutement ».',
    '3. N\'utilise aucun annuaire privé, PagesJaunes, comparateur ni site d\'offres d\'emploi (Indeed, Hellowork, France Travail, etc.) comme source de l\'adresse ou du numéro.',
    '4. Lis uniquement ce qui est affiché sur la page. N\'invente rien, ne complète rien de mémoire.',
    '5. Établissements : pour une « enseigne à plusieurs magasins », relève dans le localisateur officiel de la marque jusqu\'à 3 magasins de la Dordogne ET jusqu\'à 3 de la Haute-Vienne, sous la forme commune:adresse:téléphone, séparés par « ; ». Pour un « établissement unique », relève son adresse et son téléphone.' + (choisies.some(x => nomsPublies[norm(x.l.valeurs.nom)]) ? ' Pour une enseigne marquée « DÉJÀ PUBLIÉE POUR LA DORDOGNE », ne relève QUE la Haute-Vienne.' : ''),
    '6. Le statut est un seul mot : « confirmé » (le site proposé est le bon et l\'employeur est présent dans le territoire), « corrigé » (une valeur diffère : donne celle que tu as lue), « introuvable » (aucun site officiel trouvé), « absent » (l\'employeur n\'a aucun établissement en Dordogne ni en Haute-Vienne).',
    '',
    'Réponds uniquement avec une ligne par employeur, sans tableau, sous cette forme exacte :',
    'numéro | statut | site officiel | page de recrutement officielle | établissements relevés (commune:adresse:téléphone ; ...) | URL exacte de la page où tu as lu les établissements',
    '',
    finCommune(choisies.length, d),
    '',
    'LISTE (numéro | nom | type | secteur | lieux proposés | site proposé | recrutement proposé) :'
  ].join('\n');
}

const paquets = [];
if (mode) { for (let d = 0; d < retenues.length; d += taille) { paquets.push({ d: d, c: retenues.slice(d, d + taille) }); } } if (mode && paquets.length > 1 && paquets[paquets.length - 1].c.length < 8) { const dernier = paquets.pop(); paquets[paquets.length - 1].c = paquets[paquets.length - 1].c.concat(dernier.c); } else { paquets.push({ d: depuis, c: retenues.slice(depuis, depuis + taille) }); }
const nomFichier = 'docs/MESSAGE' + (mode ? 'S' : '') + '_PERPLEXITY_' + type.toUpperCase() + '_' + aujourdhui + (!mode && depuis ? '_depuis' + depuis : '') + '.md';
const commande = 'node scripts/veille_sas/fabriquer_message_perplexity.js ' + type + ' ' + taille + (mode ? ' tous' : (depuis ? ' ' + depuis : ''));
let md = '# ' + (mode ? 'Messages' : 'Message') + ' pour Perplexity : ' + type + ' (' + aujourdhui + ')\n\n';
md += 'Fabriqué par `' + commande + '`. ' + retenues.length + ' fiches à vérifier au total' + (mode ? ', en ' + paquets.length + ' messages de ' + taille + ' fiches au plus' : '') + '.\n\n';
md += 'Un message = un bloc à copier en entier (liste comprise), à envoyer à Perplexity quand vous avez de l\'usage, dans l\'ordre. Les numéros sont ceux de la liste générale : ils ne changent pas d\'un message à l\'autre. Réponse à recoller dans la conversation avec Claude, qui la compare aux fiches avant toute modification. Le tableau de correspondance numéro, identifiant est à la fin du fichier (ne pas le coller).\n\n';
paquets.forEach((p, k) => {
  const liste = p.c.map((x, i) => fabr(x, p.d + i + 1)).join('\n');
  md += '---\n\n## ' + (mode ? 'Message ' + (k + 1) + ' sur ' + paquets.length + ' : ' : '') + 'numéros ' + (p.d + 1) + ' à ' + (p.d + p.c.length) + '\n\n';
  md += '```\n' + messageDe(p.c, p.d) + '\n' + liste + '\n```\n\n';
});
md += '---\n\n## Correspondance numéro, identifiant (ne pas coller)\n\n';
paquets.forEach(p => { md += p.c.map((x, i) => (p.d + i + 1) + ' | ' + x.l.id).join('\n') + '\n'; });
fs.writeFileSync(path.join(R, nomFichier), md, 'utf8');
console.log(nomFichier + ' : ' + paquets.length + ' message(s), ' + retenues.length + ' fiches au total');
