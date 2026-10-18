/* Partie « employeurs » du prompt de verification pour un autre assistant (voir genererPromptVerificationSas.js).
   Autre consigne, autre format de reponse (une colonne de plus : la page de recrutement). */
'use strict';

const TAILLE_LOT = 15;
const NOMS_SECTEURS = { 'commerce-vente': 'Commerce et vente', 'hotellerie-restauration': 'Hôtellerie et restauration', 'sante': 'Santé et médico-social', 'social-personne': 'Aide à la personne et action sociale', 'btp': 'Bâtiment et travaux publics', 'transport-logistique': 'Transport et logistique', 'industrie': 'Industrie', 'administration': 'Administration, collectivités et protection sociale', 'agriculture-nature': 'Agriculture, paysage et nature', 'proprete': 'Propreté et déchets', 'automobile': 'Automobile et contrôle technique', 'securite': 'Sécurité et gardiennage', 'banque-assurance-immobilier': 'Banque, assurance et immobilier', 'education-formation': 'Éducation et formation', 'sport-animation': 'Sport, animation et centres sociaux', 'numerique': 'Numérique et télécommunications', 'artisanat-bouche': 'Artisanat des métiers de bouche', 'artisanat': 'Artisanat (menuiserie, porcelaine, métiers d’art)', 'coiffure-esthetique': 'Coiffure et esthétique', 'communication-culture': 'Communication et culture', 'animalier': 'Métiers animaliers' };

const CONSIGNE = [
  'Tu vas m\'aider à VÉRIFIER des coordonnées d\'employeurs (magasins, hôtels, restaurants, campings) de Dordogne (24) et de Haute-Vienne (87), pour un annuaire destiné à des personnes qui cherchent un emploi. L\'exactitude compte plus que la quantité.',
  '',
  'RÈGLES STRICTES',
  '1. N\'invente RIEN. Si tu ne trouves pas l\'information sur une page officielle de l\'enseigne ou de l\'établissement, écris « introuvable ». C\'est une bonne réponse.',
  '2. Sources acceptées : site de l\'enseigne ou de l\'établissement, sa page « recrutement », « carrières » ou « nous rejoindre ». Pas de plateformes de réservation, pas d\'annuaires commerciaux, pas de réseaux sociaux.',
  '3. Pour chaque fiche, donne l\'adresse EXACTE de la page où tu as lu chaque information (colonne « page »). Sans page, pas de réponse.',
  '4. « page de recrutement » : la page où une personne peut candidater (page carrières de l\'enseigne, ou candidature spontanée de cet établissement). Pas une offre d\'emploi précise, qui disparaîtra. Si l\'enseigne n\'a qu\'un portail national, donne-le et écris « portail national » en remarque. Si rien : « introuvable ».',
  '5. Un téléphone doit être au format « 05 53 00 00 00 ». Donne le numéro du MAGASIN ou de l\'ÉTABLISSEMENT, jamais celui du siège ni un numéro surtaxé. Sinon « introuvable ».',
  '6. Vérifie que l\'établissement est bien dans le département indiqué et qu\'il existe encore. Sinon dis-le dans « remarque ».',
  '7. Écris en français correct, avec les accents. Pas de tiret long ni demi-cadratin (utilise un tiret simple), pas de lien en format Markdown, pas de balises de type « entity[...] » ni « utm_source ».',
  '8. Ne change pas les noms ni les identifiants.',
  '',
  'FORMAT DE RÉPONSE (obligatoire, un seul bloc de code, une ligne par fiche, colonnes séparées par « | », aucune autre ligne dans le bloc) :',
  'id | téléphone | site de l\'établissement | page de recrutement | page | état | remarque',
  '',
  '« état » : « confirmé », « corrigé », « ajouté » (la case était vide et tu l\'as trouvée), « introuvable » ou « fermé ».',
  'Après le bloc, ajoute une courte liste « Ce que je n\'ai pas pu vérifier » si besoin. Réponds seulement « Prêt » à ce message : je t\'enverrai ensuite les lots un par un.'
].join('\n');

function regrouper(rows, cle) {
  const m = {};
  rows.forEach(function (r) { if (r[cle]) { (m[r[cle]] = m[r[cle]] || []).push(r); } });
  return m;
}

// Une adresse manque si aucun etablissement n'est donne, ou si le premier n'a qu'une commune (« Limoges: »).
function adresseAbsente(etablissements) {
  const premier = String(etablissements || '').split(';').map(function (x) { return x.trim(); }).filter(Boolean)[0] || '';
  // Format « Commune:adresse:05 53 00 00 00 » : l'adresse est le deuxième morceau, le numéro du magasin ne compte pas.
  return !premier || premier.indexOf(':') === -1 || !(premier.split(':')[1] || '').trim();
}

function genererPartieEmployeurs(rowsEmp, debutNumero) {
  const tels = regrouper(rowsEmp, 'telephone');
  const aVerifier = [];
  rowsEmp.forEach(function (r) {
    const motifs = [];
    if (adresseAbsente(r.etablissements)) { motifs.push('adresse précise absente'); }
    if (!r.telephone) { motifs.push('téléphone absent'); }
    else if (tels[r.telephone].length > 1) { motifs.push('même téléphone que ' + (tels[r.telephone].length - 1) + ' autre(s) fiche(s)'); }
    if (!r.recrutement) { motifs.push('page de recrutement absente'); }
    if (motifs.length) { aVerifier.push({ r: r, motifs: motifs }); }
  });
  let h = '\n---\n\n# Partie 2 : les employeurs du sas (' + rowsEmp.length + ' fiches, ' + aVerifier.length + ' à vérifier)\n\n';
  h += 'Même méthode que pour les structures : ouvrir une conversation neuve, envoyer **la consigne ci-dessous une seule fois**, puis les lots un par un. La réponse a un autre format (une colonne de plus : la page de recrutement).\n\n';
  h += '## Consigne de départ pour les employeurs (à envoyer une seule fois)\n\n```\n' + CONSIGNE + '\n```\n\n';
  const parSecteur = {};
  aVerifier.forEach(function (x) { (parSecteur[x.r.secteur] = parSecteur[x.r.secteur] || []).push(x); });
  let n = debutNumero;
  Object.keys(parSecteur).sort().forEach(function (sec) {
    const liste = parSecteur[sec], lots = Math.ceil(liste.length / TAILLE_LOT), nom = NOMS_SECTEURS[sec] || sec;
    for (let i = 0; i < lots; i++) {
      n++;
      const part = liste.slice(i * TAILLE_LOT, (i + 1) * TAILLE_LOT);
      h += '## Lot ' + n + ' : employeurs, ' + nom + (lots > 1 ? ' (' + (i + 1) + ' sur ' + lots + ')' : '') + ', ' + part.length + ' fiche' + (part.length > 1 ? 's' : '') + '\n\n```\n';
      h += 'Lot ' + n + '. Vérifie ces ' + part.length + ' employeurs (secteur : ' + nom + '). Réponds au format demandé, dans un seul bloc de code.\n\n';
      part.forEach(function (x) {
        const r = x.r;
        h += r.id + ' | ' + r.nom + ' | ' + (r.etablissements || 'aucun établissement précisé') + ' | téléphone donné : ' + (r.telephone || 'aucun') + ' | site donné : ' + (r.site || 'aucun') + ' | page de recrutement donnée : ' + (r.recrutement || 'aucune') + ' | à vérifier : ' + x.motifs.join(', ') + '\n';
      });
      h += '```\n\n';
    }
  });
  return { texte: h, nbLots: n - debutNumero, nbAVerifier: aVerifier.length };
}

module.exports = { genererPartieEmployeurs: genererPartieEmployeurs };
