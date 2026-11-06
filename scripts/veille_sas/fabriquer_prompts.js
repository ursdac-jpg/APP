// Fabrique les lots de prompts du cloud pour avancer le sas (employeurs et structures) à partir du contenu du sas et des deux tests automatiques.
// Usage : node scripts/veille_sas/fabriquer_prompts.js <resultat-test_massif.json> <resultat-test_lieux.json> <sortie.md> [taille-de-lot]
// Ne modifie aucun fichier du sas. Les fiches déjà vérifiées (source avec « Denis » ou « testés ») ne sont pas reprises.
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..', '..');
const [fEmp, fLieux, sortie, taille] = [process.argv[2], process.argv[3], process.argv[4], +process.argv[5] || 25];
const lire = f => fs.readFileSync(path.join(R, f), 'utf8').split(/\r?\n/).filter(l => l.trim() && l[0] !== '#').map(l => l.split('|').map(x => x.trim()));
const emp = lire('outils/sas/employeurs.sas.txt'), lieux = lire('outils/sas/lieux.sas.txt');
const tEmp = {}; JSON.parse(fs.readFileSync(fEmp, 'utf8')).forEach(x => { tEmp[x.id + '|' + x.champ] = x; });
const tLieux = {}; JSON.parse(fs.readFileSync(fLieux, 'utf8')).forEach(x => { tLieux[x.id] = x; });
const BLOQUE = [403, 406, 429, 503];
const classe = t => !t ? 'aucun' : (t.statut === 200 ? (t.nomPresent === false ? 'a-confirmer' : 'ok') : (BLOQUE.indexOf(t.statut) !== -1 ? 'bloque' : 'mort'));
const communes = p => { const o = []; String(p[4]).split(';').forEach(e => { const c = e.split(':')[0].trim(); if (c && o.indexOf(c) === -1) o.push(c); }); return o.slice(0, 3).join(', '); };
const verifie = p => /Denis|testés/.test(p[9]);

const groupes = { E1: [], E2: [], E4: [], EB: [], S1: [], S2: [], S3: [], SB: [] };
emp.forEach(p => {
  if (verifie(p)) return; const c = classe(tEmp[p[0] + '|site']);
  const ligne = { id: p[0], texte: p[2] + ' (' + p[3] + ' ; ' + communes(p) + ')' + (p[6] ? ' | site proposé : ' + p[6] : '') + (p[7] ? ' | recrutement proposé : ' + p[7] : ''), site: p[6], rec: p[7] };
  if (!p[6]) groupes.E1.push(ligne); else if (c === 'bloque') groupes.EB.push(ligne); else if (c === 'ok') groupes.E4.push(ligne); else groupes.E2.push(ligne);
});
lieux.forEach(p => {
  const c = classe(tLieux[p[0]]);
  const ligne = { id: p[0], texte: p[2] + ' (' + p[4] + (p[8] === 'national' || p[8] === 'region' ? ', portée ' + p[8] : '') + ')' + (p[7] ? ' | site proposé : ' + p[7] : '') + (p[6] ? ' | numéro de la fiche : ' + p[6] : ''), site: p[7] };
  if (!p[7]) groupes.S1.push(ligne); else if (c === 'bloque') groupes.SB.push(ligne); else if (c === 'ok') groupes.S3.push(ligne); else groupes.S2.push(ligne);
});

const REGLES_COMMUNES = 'Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l\'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.\n\nRègles strictes :\n- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.\n- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.\n- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.\n- Si tu n\'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).';
const FIN = '\n\nDernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s\'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).';
const ENTETE = 'Tu fais une recherche web pour une application d\'aide à la recherche d\'emploi et d\'accès aux démarches (Dordogne 24 et Haute-Vienne 87). ';
const SANS_COORD = '\n- Ne donne jamais d\'adresse ni de téléphone.';
const MODELES = {
  E1: ENTETE + 'Pour chaque employeur de la liste, trouve (1) son SITE OFFICIEL, (2) sa PAGE DE RECRUTEMENT si elle existe (offres, « nous rejoindre », candidature spontanée). Beaucoup sont de petites entreprises locales sans site : dans ce cas écris « pas de site trouvé », ce n\'est pas un échec. Ne cherche PAS d\'adresses de magasins ni de numéros de téléphone.\n\n' + REGLES_COMMUNES + SANS_COORD + '\n\nFormat de réponse : un tableau Markdown : Employeur | Site officiel | Page de recrutement | Preuve (la phrase lue, avec la commune ou le département) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».' + FIN,
  E2: ENTETE + 'Pour chaque employeur de la liste, le site proposé ne marche pas ou ne semble pas être le bon (erreur, certificat, nom absent de la page). Trouve le BON SITE OFFICIEL et, si elle existe, sa PAGE DE RECRUTEMENT. Ne cherche PAS d\'adresses de magasins ni de numéros de téléphone.\n\n' + REGLES_COMMUNES + SANS_COORD + '\n\nFormat de réponse : un tableau Markdown : Employeur | Bon site officiel | Page de recrutement | Pourquoi l\'ancien site ne convenait pas | Preuve (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».' + FIN,
  E4: ENTETE + 'Pour chaque employeur de la liste, un site est proposé et il répond. Vérifie que c\'est bien LE SITE OFFICIEL de CET employeur et qu\'il est actif dans la bonne zone (Dordogne 24 et/ou Haute-Vienne 87, ou ses communes citées). Si une page de recrutement est proposée, vérifie qu\'elle appartient à cet employeur et concerne la bonne région ; si aucune n\'est proposée, cherche-en une. Ne cherche PAS d\'adresses de magasins ni de numéros de téléphone.\n\n' + REGLES_COMMUNES + SANS_COORD + '\n\nFormat de réponse : un tableau Markdown : Employeur | Site confirmé (oui / non / autre adresse) | Page de recrutement confirmée ou trouvée | Présence 24 / 87 ou commune (la phrase lue) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».' + FIN,
  S1: ENTETE + 'Pour chaque structure de la liste (service public, association, organisme), trouve (1) son SITE OFFICIEL ou la page officielle qui la présente, (2) le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu\'il est AFFICHÉ sur cette page officielle, copié exactement, avec l\'adresse de la page où il figure et la phrase qui l\'entoure. Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : n\'en cherche jamais ailleurs que sur une page officielle, ne le devine jamais.\n\n' + REGLES_COMMUNES + '\n\nFormat de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Territoire confirmé (commune, 24 ou 87) | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».' + FIN
};
MODELES.S2 = MODELES.S1.replace('trouve (1) son SITE OFFICIEL', 'le site proposé ne marche pas ou ne semble pas être le bon (erreur, certificat, nom absent) : trouve (1) le BON SITE OFFICIEL');
MODELES.S3 = MODELES.S1.replace('trouve (1) son SITE OFFICIEL ou la page officielle qui la présente', 'un site est proposé et il répond : vérifie que c\'est bien le site officiel de CETTE structure dans le BON territoire, puis trouve (1) la page officielle qui la présente');
const TITRES = {
  E1: 'Employeurs sans site : trouver le site et la page de recrutement', E2: 'Employeurs dont le site proposé ne marche pas : trouver le bon', E4: 'Employeurs dont le site répond : confirmer que c\'est le bon et la bonne région',
  S1: 'Structures sans site : trouver la page officielle et le numéro affiché', S2: 'Structures dont le site proposé ne marche pas : trouver le bon', S3: 'Structures dont le site répond : confirmer le site, le territoire et relever le numéro affiché'
};
const ORDRE = ['S3', 'E4', 'S2', 'E2', 'S1', 'E1'];
let md = '# Prompts du cloud, lots du sas complet (31 octobre 2026)\n\nUn lot = un message à coller dans une session cloud. Résultat à recoller au Claude local. Voir `docs/CHANTIER_VERIFICATION_SAS_EMPLOYEURS.md`. Fabriqué par `scripts/veille_sas/fabriquer_prompts.js` (lots de ' + taille + ').\n\nOrdre conseillé : les lots qui CONFIRMENT (S3, E4) d\'abord, car ils fabriquent directement des fiches pré-validées ; ensuite ceux qui cherchent un site (S2, E2, S1, E1).\n\n## Sommaire\n\n| Groupe | Fiches | Lots |\n|---|---|---|\n';
const corps = []; let n = 0;
ORDRE.forEach(g => {
  const l = groupes[g], nb = Math.ceil(l.length / taille); md += '| ' + TITRES[g] + ' | ' + l.length + ' | ' + (nb ? (n + 1) + ' à ' + (n + nb) : 'aucun') + ' |\n';
  for (let k = 0; k < nb; k++) { n++; corps.push('\n---\n\n# Lot ' + n + ' (' + g + ', ' + (k + 1) + '/' + nb + ')\n\n' + MODELES[g] + '\n\nListe du lot :\n' + l.slice(k * taille, (k + 1) * taille).map((x, i) => (i + 1) + '. ' + x.texte).join('\n') + '\n'); }
});
md += '\nNon traités par un prompt : ' + groupes.EB.length + ' employeurs et ' + groupes.SB.length + ' structures dont le site refuse les robots (le cloud serait bloqué de la même façon) : la liste cliquable est dans `docs/A_OUVRIR_PAR_DENIS_2026-10-31.md`.\n' + corps.join('');
fs.writeFileSync(path.join(R, sortie), md);
// Liste cliquable des sites qui refusent les robots.
let ou = '# À ouvrir par Denis : sites qui refusent les robots (31 octobre 2026)\n\nPour chaque ligne, ouvrir le site, regarder si c\'est bien la bonne structure ou le bon employeur dans la bonne zone, puis me le dire (« bon » ou « pas bon »).\n\n## Employeurs\n\n';
groupes.EB.forEach(x => { ou += '- ' + x.texte.split(' | ')[0] + ' : [Site](' + x.site + ')' + (x.rec ? ' · [Recrutement](' + x.rec + ')' : '') + '\n'; });
ou += '\n## Structures\n\n'; groupes.SB.forEach(x => { ou += '- ' + x.texte.split(' | ')[0] + ' : [Site](' + x.site + ')\n'; });
fs.writeFileSync(path.join(R, 'docs/A_OUVRIR_PAR_DENIS_2026-10-31.md'), ou);
console.log(Object.keys(groupes).map(g => g + '=' + groupes[g].length).join(' ') + ' ; lots=' + n);
