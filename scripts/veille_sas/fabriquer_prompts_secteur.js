// Fabrique les messages du cloud RANGÉS PAR SECTEUR pour tout ce qui reste à vérifier dans le sas : employeurs (par secteur) et structures (par catégorie).
// Usage : node scripts/veille_sas/fabriquer_prompts_secteur.js <sortie.md> [taille-de-lot]
// Teste d'abord les sites (réponse, nom présent), puis écrit un message par lot. Ne modifie aucun fichier du sas. Les fiches déjà pré-validées ne sont pas reprises.
// Dernière section de chaque message : « À OUVRIR PAR MOI » (liens cliquables des sites qui refusent les robots).
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..', '..');
const sortie = process.argv[2] || 'docs/PROMPTS_CLOUD_PAR_SECTEUR.md', MAX = +process.argv[3] || 25;
const lire = f => fs.readFileSync(path.join(R, f), 'utf8').split(/\r?\n/).filter(l => l.trim() && l[0] !== '#').map(l => l.split('|').map(x => x.trim()));
const emp = lire('outils/sas/employeurs.sas.txt'), lieux = lire('outils/sas/lieux.sas.txt');
const prev = {}; lire('outils/sas/prevalidees.txt').forEach(p => { prev[p[0] + ':' + p[1]] = true; });
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const MOTS_VIDES = ['groupe', 'etablissements', 'ets', 'entreprise', 'societe', 'cabinet', 'agence', 'maison', 'association', 'centre', 'service', 'services', 'departement', 'departemental', 'haute', 'vienne', 'dordogne', 'limoges', 'perigueux', 'nationale', 'social'];
const mots = nom => norm(nom).split(' ').filter(w => w.length > 3 && MOTS_VIDES.indexOf(w) === -1);
const BLOQUE = [403, 406, 429, 503];

async function tester(url, nom) {
  try {
    const r = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(12000) });
    const t = (await r.text()).slice(0, 60000), m = t.match(/<title[^>]*>([^<]*)/i), ws = mots(nom), corps = norm((m ? m[1] : '') + ' ' + t.slice(0, 30000));
    if (r.status === 200) { return ws.length && !ws.some(w => corps.includes(w)) ? 'nom absent' : 'répond'; }
    return BLOQUE.indexOf(r.status) !== -1 ? 'bloque les robots' : 'erreur ' + r.status;
  } catch (e) { return 'ne répond pas (' + ((e.cause && e.cause.code) || 'connexion') + ')'; }
}
const communes = p => { const o = []; String(p[4]).split(';').forEach(e => { const c = e.split(':')[0].trim(); if (c && o.indexOf(c) === -1) o.push(c); }); return o.slice(0, 3).join(', '); };

const ENTETE = 'Tu fais une recherche web pour une application d\'aide à la recherche d\'emploi et d\'accès aux démarches (Dordogne 24 et Haute-Vienne 87). ';
const REGLES = 'Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l\'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.\n\nRègles strictes :\n- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.\n- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.\n- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.\n- Si tu n\'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).';
const FIN = '\n\nDernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s\'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).';
const PRESENCE = '\n\nPRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l\'agence, le point d\'accueil, le magasin, l\'usine ou la commune (ou qui montre qu\'il n\'y en a pas). Si, après lecture de la page des implantations, il n\'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c\'est une réponse attendue et utile, pas un échec. N\'écris « non lisible » que si tu n\'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.';
const DEBLOCAGE = '\n\nÀ la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M\'AUTORISER » : liste précisément ce qui t\'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s\'est passé normalement.';
const MODELE_E = ENTETE + 'Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l\'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n\'est pas un échec.\n\n' + REGLES + '\n- Ne donne jamais d\'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.' + PRESENCE + '\n\nFormat de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».' + DEBLOCAGE + FIN;
const MODELE_S = ENTETE + 'Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l\'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu\'il est AFFICHÉ sur cette page officielle, copié exactement, avec l\'adresse de la page où il figure et la phrase qui l\'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.\n\n' + REGLES + PRESENCE + '\n\nFormat de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».' + DEBLOCAGE + FIN;
const MODELE_A = ENTETE + 'Voici des CAS DOUTEUX d\'un registre d\'employeurs et de structures. Pour chaque ligne, réponds à la question précise posée, puis établis la présence en Dordogne 24 et en Haute-Vienne 87. Si l\'organisme existe mais n\'a ni agence ni point dans ces deux départements, écris clairement « pas de présence sur le territoire » : la fiche sera alors retirée, c\'est une bonne réponse. Donne aussi, quand tu les trouves, le site officiel et la page de recrutement de l\'organisme lui-même (jamais un site d\'offres tiers ni un agrégateur).\n\n' + REGLES + '\n- Ne donne jamais d\'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.' + PRESENCE + '\n\nFormat de réponse : un tableau Markdown : Cas | Réponse à la question posée | Site officiel | Page de recrutement officielle | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».' + DEBLOCAGE + FIN;
const CAS_A = [
  'CDR Environnement (fiche : Limoges, 26 rue de Tourcoing) : le site que j\'ai reçu est cdr-environnement-correze.com, une société de Corrèze. Est-ce la même entreprise que celle de Limoges ? A-t-elle une agence ou un site en Haute-Vienne ou en Dordogne ?',
  'AGC Dordogne (fiche : Coulounieix-Chamiers) : quelle est cette structure exactement (association de gestion et de comptabilité, autre chose) ? Quel est son site officiel ? Ne la confonds pas avec « AGC Contractant » (agc-contractant.fr, téléphone en 05 56, Gironde) : dis si c\'est la même société ou non.',
  'Savencia (groupe laitier) : possède-t-il un site, une usine, une laiterie ou un bureau en Dordogne ou en Haute-Vienne ? Si oui, lesquels, avec la phrase de la page ; sinon « pas de présence sur le territoire ».',
  'Groupe Nicollin (propreté, déchets) : a-t-il une agence en Dordogne (la fiche dit Périgueux) ou en Haute-Vienne ? Page des implantations ou des agences.',
  'Protectim Security Group (fiche : Limoges) : a-t-il une agence en Haute-Vienne ou en Dordogne ? Page des agences.',
  'Esthetic Center (instituts de beauté) : quels instituts existent en Haute-Vienne et en Dordogne ? La fiche dit « Le Vigen, centre commercial Carrefour Boisseuil » ; j\'ai noté « Limoges uniquement ». Donne les communes citées par la page officielle des instituts, sans adresse complète.',
  'Arquus (fiche : Limoges, 72 route du Palais) : quelle est la page de recrutement officielle sur le site de l\'entreprise elle-même (pas Welcome to the Jungle) ? L\'entreprise a-t-elle changé de nom ou de propriétaire, et le site de Limoges existe-t-il toujours ?',
  'Centre hospitalier de Périgueux : son site était en maintenance. Quelle est sa page de recrutement officielle (offres d\'emploi, concours) ? Le site répond-il maintenant ?',
  'GRETA-CFA Limousin (greta-du-limousin.fr) : quelle est la page de recrutement officielle (offres de postes, formateurs) ? Même question pour GRETA-CFA Aquitaine, agence Dordogne.',
  'Banque Populaire Aquitaine Centre Atlantique et Caisse d\'Épargne Aquitaine Poitou-Charentes : page de recrutement de la BONNE région (pas Bourgogne Franche-Comté ni Provence-Alpes-Corse), et présence d\'agences en Dordogne et en Haute-Vienne.',
  'ASSAD Dordogne, Éveil Aides et Services, Weesure, Provençale, Boulangerie Sylvain Chatenet, Clara Automobiles, Yelloh Pomport Beach (un cas par organisme) : site officiel, page de recrutement, présence en Dordogne ou en Haute-Vienne. Leurs sites ont refusé les robots lors de mes essais : si c\'est ton cas, dis-le et donne les liens dans « À OUVRIR PAR MOI ».'
];
const CAS_B = [
  'Senior Compagnie (agences Saint-Astier en Dordogne et Limoges) : la page https://recrutement.groupe-zephyr.fr/fr/annonces?brands=2689 est celle du Groupe Zephyr. Le filtre brands=2689 correspond-il bien à Senior Compagnie ? Quelles agences Senior Compagnie existent en Dordogne et en Haute-Vienne (page des agences) ?',
  'Petits-fils (aide à domicile) : agences en Dordogne (Périgueux) et en Haute-Vienne (Limoges) : quelles agences la page officielle liste-t-elle exactement, dans chaque département ?',
  'Hermès, ganterie de Saint-Junien : le site de Saint-Junien est-il cité sur le site officiel d\'Hermès ? La page https://talents.hermes.com/fr/sites/CX est-elle bien la page de recrutement des sites de production en France ?',
  'Centrale Auto Marché (fiche : Saint-Médard-de-Mussidan, Dordogne) : le site centraleautomarche.fr cite-t-il ce point de vente et sa commune ?',
  'Solune (éditeur de logiciels, fiche : Limoges) : le site solune.com cite-t-il Limoges ? Existe-t-il une page de recrutement sur solune.com ?',
  'Veolia (trois fiches : Boulazac-Isle-Manoire en Dordogne ; Limoges, rue de Solignac ; unité de valorisation énergétique de Limoges) : quelles implantations Veolia les pages officielles (veolia.com ou veolia.fr) citent-elles en Dordogne et en Haute-Vienne ? La page d\'offres jobs.veolia.com (filtre France) est-elle la bonne page de recrutement ?',
  'Celio, Maisons du Monde, Besson Chaussures, Weldom, Chronopost, Monoprix, Cultura, H&M : ces sites refusent souvent les robots. Si tu ne peux pas ouvrir leur page « nos magasins », dis-le et donne les liens dans « À OUVRIR PAR MOI » ; sinon, liste les magasins ou points de dépôt en Dordogne et en Haute-Vienne (communes seulement).'
];

module.exports = { lire, tester, ENTETE, REGLES, FIN, PRESENCE, DEBLOCAGE };
if (require.main === module) (async () => {
  const E = emp.filter(p => !prev['employeurs:' + p[0]]).map(p => ({ id: p[0], cle: p[3], nom: p[2], communes: communes(p), site: p[6], rec: p[7] }));
  const S = lieux.filter(p => !prev['lieux:' + p[0]]).map(p => ({ id: p[0], cle: p[1], nom: p[2], communes: p[4], site: p[7], tel: p[6], portee: p[8] }));
  const taches = []; E.concat(S).forEach(x => { if (/^https:\/\//.test(x.site)) { taches.push(x); } });
  let i = 0; await Promise.all(Array.from({ length: 14 }, async () => { while (i < taches.length) { const x = taches[i++]; x.etat = await tester(x.site, x.nom); } }));
  const ligne = (x, estS) => x.nom + ' (' + (estS ? x.communes + (x.portee === 'national' || x.portee === 'region' ? ', portée ' + x.portee : '') : x.communes) + ')'
    + (x.site ? ' | site proposé : ' + x.site + ' [' + (x.etat || 'non testé') + ']' : ' | pas de site proposé')
    + (!estS && x.rec ? ' | recrutement proposé : ' + x.rec : '') + (estS && x.tel ? ' | numéro de la fiche : ' + x.tel : '');
  const parCle = l => { const o = {}; l.forEach(x => { (o[x.cle] = o[x.cle] || []).push(x); }); return o; };
  let md = '# Messages du cloud rangés par secteur (' + new Date().toISOString().slice(0, 10) + ')\n\nUn message = un lot à coller dans une session cloud ; le résultat revient ensuite au Claude local, qui teste chaque adresse avant de l\'inscrire. Fabriqué par `scripts/veille_sas/fabriquer_prompts_secteur.js` (lots de ' + MAX + ' au plus). Les fiches déjà pré-validées ne sont pas reprises.\n\n';
  const lots = []; let n = 0;
  [['Employeurs', E, MODELE_E, false], ['Structures', S, MODELE_S, true]].forEach(([titre, liste, modele, estS]) => {
    const g = parCle(liste);
    Object.keys(g).sort().forEach(cle => {
      const l = g[cle], nb = Math.ceil(l.length / MAX), t = Math.ceil(l.length / nb);
      for (let k = 0; k < nb; k++) { n++; lots.push({ n, titre, cle, k: k + 1, nb, modele, estS, lignes: l.slice(k * t, (k + 1) * t) }); }
    });
  });
  const aPart = (nom, titre, modele, cas) => '\n---\n\n# Lot ' + nom + ' : ' + titre + '\n\n' + modele + '\n\nListe du lot :\n' + cas.map((x, j) => (j + 1) + '. ' + x).join('\n') + '\n';
  md += '## Lots à part (à lancer en premier)\n\n- Lot A : les cas douteux qui restent à trancher.\n- Lot B : les fiches à moitié confirmées.\n\n## Sommaire\n\n| Lot | Type | Secteur ou catégorie | Fiches |\n|---|---|---|---|\n' + lots.map(l => '| ' + l.n + ' | ' + l.titre + ' | ' + l.cle + (l.nb > 1 ? ' (' + l.k + '/' + l.nb + ')' : '') + ' | ' + l.lignes.length + ' |').join('\n') + '\n';
  md += aPart('A', 'les cas douteux à trancher', MODELE_A, CAS_A) + aPart('B', 'les fiches à moitié confirmées', MODELE_A.replace('CAS DOUTEUX', 'FICHES À MOITIÉ CONFIRMÉES'), CAS_B);
  lots.forEach(l => { md += '\n---\n\n# Lot ' + l.n + ' : ' + l.titre.toLowerCase() + ', ' + l.cle + (l.nb > 1 ? ' (' + l.k + '/' + l.nb + ')' : '') + '\n\n' + l.modele + '\n\nListe du lot :\n' + l.lignes.map((x, j) => (j + 1) + '. ' + ligne(x, l.estS)).join('\n') + '\n'; });
  // La partie 2 (« Se tenir informé », ajoutée à la main depuis l'onglet de l'outil de veille) est conservée si le fichier existe déjà.
  try { const ancien = fs.readFileSync(path.join(R, sortie), 'utf8').replace(/\r\n/g, '\n'), k = ancien.indexOf('\n\n# PARTIE 2 :'); if (k >= 0) { md = md.replace(/\n+$/, '') + ancien.slice(k); } } catch (e) { /* premier passage : rien à conserver */ }
  fs.writeFileSync(path.join(R, sortie), md);
  console.log(E.length + ' employeurs et ' + S.length + ' structures restantes, ' + lots.length + ' lots -> ' + sortie);
})();
