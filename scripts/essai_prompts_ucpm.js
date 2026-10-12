#!/usr/bin/env node
/* ============================================================
   scripts/essai_prompts_ucpm.js
   Banc d'essai des prompts du module « Un CV, plusieurs métiers » (2026-10-08).

   Deux usages, sans aucune dépendance :
     node scripts/essai_prompts_ucpm.js generer
        -> écrit dans docs/essais_prompts_ucpm/ des fichiers .txt PRÊTS À COLLER
           dans un assistant en ligne (un fichier = une demande complète).
     node scripts/essai_prompts_ucpm.js verifier <metiers|accroches|lettres> <fichier_reponse.txt> [nombre_attendu]
        -> lit la réponse collée dans un fichier texte et contrôle ce qu'une machine
           peut contrôler : JSON valide ou coupé, nombre d'éléments, longueurs,
           formules interdites, tirets longs, ressemblance entre les lettres, mots
           d'invention probables, présence de l'objectif.
   Rien de ce que dit l'assistant n'est jamais jugé « bon » par ce script : il signale
   seulement ce qui doit être relu par une personne.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..');

/* ---------- Données d'essai (CV fictif, déjà masqué) ---------- */
const CV_TEST = [
  '[NOM MASQUÉ]',
  '[TÉLÉPHONE MASQUÉ] - [COURRIEL MASQUÉ] - [ADRESSE MASQUÉE]',
  'Permis B - Véhicule personnel',
  '',
  'AGENT D’ENTRETIEN DES BÂTIMENTS',
  'Agent d’entretien expérimenté (dix ans) en résidences collectives, en collectivité et en entreprise de peinture. Autonome, ponctuel, attentif aux consignes de sécurité. Sait travailler seul comme en équipe, et rendre compte au gestionnaire ou au responsable.',
  '',
  'EXPÉRIENCES PROFESSIONNELLES',
  '2019 - 2024 | Agent d’entretien en résidence (bailleur social), Limoges (87)',
  '- Entretien courant de 120 logements et des parties communes (halls, escaliers, caves, locaux poubelles)',
  '- Petits dépannages : plomberie (robinets, siphons, joints, chasses d’eau), remplacement de prises, d’interrupteurs et d’ampoules',
  '- Peinture de cages d’escalier et remise en état des logements libérés (état des lieux de sortie, petites réparations, nettoyage)',
  '- Relation avec les locataires, signalement des pannes au gestionnaire, suivi des interventions des entreprises extérieures',
  '- Gestion d’un stock de produits et de petit matériel, commandes mensuelles',
  '2016 - 2019 | Agent polyvalent des services techniques, commune de 6 000 habitants (87)',
  '- Entretien des bâtiments communaux (école, salle des fêtes, mairie) et des espaces verts (tonte, taille de haies, désherbage)',
  '- Petits travaux de maçonnerie (rebouchage, joints de carrelage) et de menuiserie (serrures, portes, étagères)',
  '- Montage et démontage de barnums, tables et scènes pour les fêtes locales ; déneigement et salage en hiver',
  '- Respect des consignes de sécurité, port des équipements de protection, entretien des outils',
  '2014 - 2016 | Aide-peintre, entreprise de peinture en bâtiment, Limoges',
  '- Préparation des supports (ponçage, enduit, rebouchage), peinture intérieure, pose de revêtements muraux, finitions',
  '- Chargement et rangement du matériel, protection des sols et du mobilier',
  '2012 - 2014 | Employé de libre-service, supermarché (CDD et intérim)',
  '- Mise en rayon, réassort, contrôle des dates, étiquetage',
  '- Accueil et renseignement des clients, aide en caisse en renfort',
  '',
  'FORMATIONS ET HABILITATIONS',
  '2014 | CAP Peintre applicateur de revêtements',
  '2018 | SST (sauveteur secouriste du travail), recyclage en 2022',
  '2021 | Habilitation électrique BS (électricité de base)',
  '2022 | Gestes et postures, prévention des risques (1 jour)',
  '',
  'COMPÉTENCES',
  'Petite plomberie - Peinture et finitions - Électricité de base (BS) - Entretien des espaces verts - Petite maçonnerie et menuiserie - Gestion de stock - Lecture de consignes et d’états des lieux - Relation avec le public - Travail en équipe',
  'Outils numériques : messagerie, tableur simple (suivi de stock)',
  '',
  'LANGUES : français (langue maternelle) ; anglais (notions)',
  'ENGAGEMENT : bénévole à la banque alimentaire (tri et distribution, deux samedis par mois) depuis 2020',
  'LOISIRS : bricolage, pêche, potager'
].join('\n');

const PROFIL_VALIDE = [
  'Titre du CV de référence : Agent d’entretien des bâtiments',
  'Accroche retenue : Agent d’entretien des bâtiments, autonome et ponctuel, avec dix ans d’expérience en résidences collectives et en collectivité.',
  'Compétences clés : petite plomberie, peinture et finitions, électricité de base (habilitation BS), entretien des espaces verts, petite maçonnerie et menuiserie, gestion de stock, travail en équipe.',
  'Expériences :',
  '- 2019-2024, agent d’entretien en résidence : 120 logements et parties communes, dépannages en plomberie et électricité de base, peinture des cages d’escalier, remise en état des logements libérés, relation avec les locataires, gestion d’un stock de produits.',
  '- 2016-2019, agent polyvalent des services techniques d’une commune : bâtiments communaux et espaces verts, petits travaux de maçonnerie et de menuiserie, montage de barnums, déneigement.',
  '- 2014-2016, aide-peintre : préparation des supports, peinture intérieure, revêtements muraux, finitions.',
  '- 2012-2014, employé de libre-service : mise en rayon, réassort, accueil des clients.',
  'Formations : CAP Peintre applicateur de revêtements (2014) ; SST (2018, recyclage 2022) ; habilitation électrique BS (2021) ; gestes et postures (2022).',
  'Engagement : bénévole à la banque alimentaire depuis 2020. Permis B.'
].join('\n');

const LIGNES = {
  offre: 'la motivation et l’intérêt de la personne pour ce poste et cette offre.',
  spontanee: 'le courage, la curiosité et l’affirmation de soi : la personne ose aller vers l’entreprise sans offre.',
  reconversion: 'les compétences transversales : ce que la personne peut apporter au nouveau métier grâce à ses acquis des autres métiers.',
  stage: 'l’engagement, l’assiduité et l’investissement (parfois au-delà des heures de formation, sur le temps libre) ; un stage de formation permet d’affiner et de concrétiser sur le terrain les théories vues en formation : la personne bâtit son expérience.',
  pmsmp: 'la découverte du métier : la personne veut le voir de près, le comprendre et tester son projet.',
  alternance: 'l’engagement dans la durée et l’assiduité, la capacité à faire le lien entre la formation et l’entreprise, la motivation pour apprendre un métier en situation de travail.',
  formation: 'ce qui prépare à la formation visée (expériences, diplômes, prérequis) et la motivation et le projet quand le CV les montre.'
};
const OBJECTIFS_PREMIER = [
  { k: 'spontanee', details: 'type de structure : entreprise privée ou collectivité ; secteur : entretien et maintenance des bâtiments ; contrat : CDI ; temps plein' },
  { k: 'alternance', details: 'type de structure : entreprise privée ; secteur : bâtiment ; durée : 2 ans ; objectif : apprendre un second métier du bâtiment' },
  { k: 'formation', details: 'organisme de formation ; durée : environ 6 mois ; la personne cherche une formation qui complète ses compétences en électricité' }
];
const NOM_OBJECTIF = { offre: 'Réponse à une offre', spontanee: 'Candidature spontanée', reconversion: 'Changement de métier', stage: 'Stage de formation', pmsmp: 'Stage d’immersion (PMSMP)', alternance: 'Alternance', formation: 'Entrée en formation' };
// Les dix CV d'essai (le premier est le CV de référence : pas d'accroche à écrire pour lui).
const METIERS = [
  { metier: 'Agent d’entretien des bâtiments', k: 'spontanee', details: 'type de structure : entreprise privée ou collectivité ; secteur : entretien et maintenance des bâtiments ; contrat : CDI ; temps plein' },
  { metier: 'Peintre en bâtiment', k: 'alternance', details: 'type de structure : entreprise privée ; secteur : bâtiment ; durée : 2 ans ; début souhaité : septembre prochain ; disponibilités : horaires de journée, à temps plein en entreprise', employeur: 'Lacroix Peinture (entreprise fictive pour l’essai)', poste: 'Peintre en bâtiment en alternance' },
  { metier: 'Électricien d’entretien', k: 'formation', details: 'formation visée : électricité du bâtiment ; organisme de formation ; durée : environ 6 mois ; début souhaité : prochaine session ; disponible à temps plein' },
  { metier: 'Plombier', k: 'alternance', details: 'type de structure : entreprise privée ; secteur : bâtiment ; durée : 2 ans' },
  { metier: 'Ouvrier paysagiste', k: 'spontanee', details: 'type de structure : collectivité ou entreprise privée ; secteur : espaces verts ; contrat : CDI' },
  { metier: 'Poseur de revêtements muraux', k: 'alternance', details: 'type de structure : entreprise privée ; secteur : bâtiment ; durée : 2 ans' },
  { metier: 'Agent de propreté', k: 'spontanee', details: 'type de structure : entreprise privée ou collectivité ; secteur : propreté et entretien ; contrat : CDI ; temps plein' },
  { metier: 'Agent de service en collectivité', k: 'spontanee', details: 'type de structure : collectivité ; secteur : services en collectivité ; contrat : CDI' },
  { metier: 'Agent logistique', k: 'spontanee', details: 'type de structure : entreprise privée ; secteur : logistique ; contrat : CDI ; temps plein ; disponible immédiatement ; mobilité dans un rayon de 40 km' },
  { metier: 'Gardien d’immeuble', k: 'offre', details: 'type de structure : entreprise privée ; secteur : immobilier ; contrat : CDI ; disponible dans un mois', employeur: 'Résidences des Tilleuls (entreprise fictive pour l’essai)', recruteur: 'Madame Claire Martin', poste: 'Gardien d’immeuble (H/F)', offre: 'Poste en CDI dans une résidence de 90 logements. Missions : entretien des parties communes, petits dépannages, relation avec les locataires, suivi des interventions des entreprises extérieures. Profil attendu : sens du contact, autonomie, notions de plomberie et d’électricité, rigueur dans le suivi.' }
];

/* ---------- Génération des textes à coller ---------- */
function lire(f) { return fs.readFileSync(path.join(RACINE, f), 'utf8').replace(/\r\n/g, '\n'); }
function voix() { return lire('prompts/_voix-humaine.md').trim(); }
const FORME_F = { 'Électricien d’entretien': 'Électricienne d’entretien', 'Plombier': 'Plombière', 'Ouvrier paysagiste': 'Ouvrière paysagiste', 'Poseur de revêtements muraux': 'Poseuse de revêtements muraux', 'Gardien d’immeuble': 'Gardienne d’immeuble' };
function nomMetier(m, g) { return g === 'f' ? (FORME_F[m.metier] || m.metier) : m.metier; }
function blocMetiers(liste, g) {
  return liste.map((m, i) => (i + 1) + '. Métier : ' + nomMetier(m, g) + '\n   Objectif : ' + NOM_OBJECTIF[m.k] + '\n   Ligne directrice de cet objectif : ' + LIGNES[m.k] + '\n   Détails : ' + m.details).join('\n\n');
}
// Les accroches retenues (première de chaque métier, essai des accroches V3 au féminin du 2026-10-08) : les lettres partent de ce que l'application aurait réellement.
const ACCROCHES_F = {
  'Agent d’entretien des bâtiments': 'Agent d’entretien des bâtiments, autonome et ponctuel, avec dix ans d’expérience en résidences collectives et en collectivité.',
  'Peintre en bâtiment': 'CAP Peintre applicateur de revêtements et expérience en peinture intérieure, avec préparation des supports, revêtements muraux et finitions.',
  'Électricien d’entretien': 'Habilitation électrique BS et expérience des dépannages en électricité de base en résidence, pour préparer une formation en électricité du bâtiment.',
  'Plombier': 'Pratique des dépannages en plomberie en résidence, sur 120 logements, avec expérience de l’entretien courant et de la remise en état.',
  'Ouvrier paysagiste': 'Expérience des espaces verts dans les services techniques d’une commune, avec entretien des extérieurs et travaux réalisés sur les bâtiments communaux.',
  'Poseur de revêtements muraux': 'CAP Peintre applicateur de revêtements et pratique des revêtements muraux, de la préparation des supports et des finitions.',
  'Agent de propreté': 'Expérience de l’entretien de parties communes et de 120 logements en résidence, avec remise en état des logements libérés.',
  'Agent de service en collectivité': 'Expérience d’agent polyvalent des services techniques d’une commune, sur les bâtiments communaux, les espaces verts et les petits travaux.',
  'Agent logistique': 'Expérience de la gestion d’un stock de produits en résidence, complétée par la mise en rayon et le réassort en libre-service.',
  'Gardien d’immeuble': 'Expérience de 2019 à 2024 dans une résidence de 120 logements, avec entretien des parties communes, dépannages et relation avec les locataires.'
};
function blocCvLettres(liste, g) {
  return liste.map((m, i) => (i + 1) + '. Titre du CV : ' + nomMetier(m, g || 'f') + '\n   Accroche retenue : ' + (ACCROCHES_F[m.metier] || m.accroche || '') + '\n   Objectif : ' + NOM_OBJECTIF[m.k] + '\n   Ligne directrice de cet objectif : ' + LIGNES[m.k] + '\n   Détails : ' + m.details + (m.employeur ? '\n   Employeur : ' + m.employeur : '') + (m.recruteur ? '\n   Recruteur : ' + m.recruteur : '') + (m.poste ? '\n   Poste visé : ' + m.poste : '') + (m.offre ? '\n   Extrait de l’offre : ' + m.offre : '')).join('\n\n');
}
function genreTexte(g) { return g === 'f' ? 'Féminin : la personne est une femme. Accorde tous les adjectifs et participes au féminin (habituée, motivée...).' : (g === 'm' ? 'Masculin : la personne est un homme. Accorde tous les adjectifs et participes au masculin (habitué, motivé...).' : 'Non précisé : n’emploie aucun mot qui s’accorde au masculin ou au féminin ; tourne les phrases avec des noms.'); }
function demandeOffres(liste, dept) {
  const nomObj = { spontanee: 'candidature spontanée', offre: 'emploi', reconversion: 'emploi dans un nouveau métier', stage: 'stage de formation', pmsmp: 'stage d’immersion (PMSMP)', alternance: 'alternance', formation: 'entrée en formation' };
  const lignes = liste.map((m, i) => (i + 1) + '. ' + m.metier + ' : ' + nomObj[m.k]).join('\n');
  const texte = lire('prompts/ucpm-offres.md').replace(/<!--[\s\S]*?-->\s*/, '');
  return texte.replace('{DATE}', '8 octobre 2026').replace('{DEPARTEMENT}', dept).replace('{METIERS}', lignes).trim() + '\n';
}
function generer() {
  const dossier = path.join(RACINE, 'docs', 'essais_prompts_ucpm');
  fs.mkdirSync(dossier, { recursive: true });
  const ecrire = (nom, texte) => { fs.writeFileSync(path.join(dossier, nom), texte, 'utf8'); console.log('écrit : docs/essais_prompts_ucpm/' + nom + ' (' + texte.length + ' signes)'); };
  const pm = lire('prompts/ucpm-metiers.md'), pa = lire('prompts/ucpm-accroches.md').replace('{{VOIX_HUMAINE}}', voix()), pl = lire('prompts/ucpm-lettres.md').replace('{{VOIX_HUMAINE}}', voix());
  const blocObjectifs = OBJECTIFS_PREMIER.map((o, i) => (i + 1) + '. ' + NOM_OBJECTIF[o.k] + '\n   Ligne directrice : ' + LIGNES[o.k] + '\n   Détails : ' + o.details).join('\n\n');
  ecrire('01_metiers_V5.txt', pm.replace('{INTITULE}', 'Agent d’entretien des bâtiments').replace('{OBJECTIFS}', blocObjectifs).replace('{CV}', CV_TEST));
  const autres = METIERS.slice(1);
  [['02_accroches_V3_9_feminin.txt', autres, 'f'], ['02_accroches_V3_9_masculin.txt', autres, 'm'], ['02_accroches_V3_9_neutre.txt', autres, 'n']].forEach(([nom, liste, g]) => {
    ecrire(nom, pa.replace('{GENRE}', genreTexte(g)).replace('{PROFIL}', PROFIL_VALIDE).replace('{METIERS}', blocMetiers(liste, g)));
  });
  [[3, '03_lettres_V6_3.txt'], [5, '03_lettres_V6_5.txt'], [10, '03_lettres_V6_10.txt']].forEach(([n, nom]) => {
    ecrire(nom, pl.replace('{GENRE}', genreTexte('f')).replace('{PROFIL}', PROFIL_VALIDE).replace('{CVS}', blocCvLettres(METIERS.slice(0, n))));
  });
  ecrire('03_lettres_V6_10_masculin.txt', pl.replace('{GENRE}', genreTexte('m')).replace('{PROFIL}', PROFIL_VALIDE).replace('{CVS}', blocCvLettres(METIERS.slice(0, 10), 'm')));
  ecrire('04_offres_V4_2.txt', demandeOffres(METIERS.slice(2, 4), 'Haute-Vienne (87)'));
  ecrire('04_offres_V4_6.txt', demandeOffres(METIERS.slice(0, 6), 'Haute-Vienne (87)'));
}

/* ---------- Vérification d'une réponse ---------- */
const INTERDITES = ['passionné', 'fort de', 'forte de', 'riche de', 'dynamique et motivé', 'véritable atout', 'riche expérience', 'au sein de', 'force de proposition', 'n’hésitez pas', 'n\'hésitez pas', 'exceptionnel', 'incontournable', 'remarquable', 'métier d’avenir'];
const PIEGES = ['BTS', 'licence', 'master', 'ingénieur', 'CACES', 'bac pro', 'DUT', 'H0V', 'permis poids lourd', 'permis C1', 'brevet pro', 'DEUST', 'titre professionnel'];
const MOTS_OBJECTIF = { offre: /offre|annonce|poste/i, spontanee: /spontan|sans offre|sans attendre|sans annonce|candidature|initiative|d’offre|d'offre|absence d|aucune offre|offre publiée|offre soit|poste soit publié|publication d/i, reconversion: /transf|nouveau métier|reconversion|changer|changement|autres métiers|acquis/i, stage: /stage/i, pmsmp: /immersion|découvr/i, alternance: /alternance|apprentissage/i, formation: /formation/i };
function mots(s) { return String(s || '').toLowerCase().replace(/[^a-zàâäçéèêëîïôöùûüœ0-9’' -]/g, ' ').split(/\s+/).filter(Boolean); }
function jaccard(a, b) { const A = new Set(a), B = new Set(b); let i = 0; A.forEach(x => { if (B.has(x)) { i++; } }); return i / ((A.size + B.size - i) || 1); }
// La lecture de la réponse est celle de l'application (une seule source : modules/un-cv-plusieurs-metiers/logique.js).
const LOGIQUE_UCPM = require('../modules/un-cv-plusieurs-metiers/logique.js');
function extraireJson(texte) {
  const r = LOGIQUE_UCPM.ucpmExtraireJson(texte);
  if (!r.erreur) { return r; }
  return { erreur: r.erreur + (r.coupe ? ' : probablement COUPÉE avant la fin. Fin reçue : « ' + String(texte).trim().slice(-120).replace(/\n/g, ' ') + ' »' : '') };
}
function verifier(type, fichier, attendu, genre) {
  const sortie = []; let alertes = 0;
  const ok = m => sortie.push('OK        : ' + m), att = m => { alertes++; sortie.push('ATTENTION : ' + m); };
  const brut = fs.readFileSync(fichier, 'utf8');
  const r = extraireJson(brut);
  if (r.erreur) { att(r.erreur); console.log(sortie.join('\n')); console.log('\nRésultat : ' + alertes + ' point(s) à voir.'); return; }
  ok('JSON valide');
  if (r.echappes) { att('la réponse contient ' + r.echappes + ' caractère(s) d’échappement Markdown (barre oblique inverse avant un crochet) venant de la copie : l’application devra les retirer avant de lire le JSON'); }
  if (/[–—]/.test(brut)) { att('la réponse contient un tiret long (interdit)'); } else { ok('aucun tiret long'); }
  if (/\bIA\b/.test(brut)) { att('le mot « IA » apparaît dans la réponse'); }
  const bas = brut.toLowerCase();
  const trouvees = INTERDITES.filter(f => bas.includes(f.toLowerCase()));
  if (trouvees.length) { att('formules d’assistant repérées : ' + trouvees.join(', ')); } else { ok('aucune formule d’assistant de la liste'); }
  const cvBas = CV_TEST.toLowerCase();
  const texteSansVerif = type === 'metiers' ? JSON.stringify({ s: r.json.synthese, m: r.json.intitulesMemeMetier, a: (r.json.autresMetiers || []).map(x => x.retrouveDansLeCV) }) : brut;
  const motEntier = (texte, mot) => new RegExp('(^|[^a-zàâäçéèêëîïôöùûüœ])' + mot.toLowerCase() + '($|[^a-zàâäçéèêëîïôöùûüœ])').test(texte.toLowerCase());
  const inventes = PIEGES.filter(p => motEntier(texteSansVerif, p) && !motEntier(CV_TEST, p));
  if (inventes.length) { att('mots absents du CV mais présents dans la réponse (invention possible, à relire) : ' + inventes.join(', ')); } else { ok('aucun diplôme ou titre « piège » ajouté'); }
  if (type === 'metiers') {
    const j = r.json, s = j.synthese || {};
    // Le sexe n'est pas connu à ce stade : chaque intitulé doit exister sous ses deux formes (champs ...Masculin et ...Feminin).
    const sansDeuxFormes = []; const identiques = [];
    (j.autresMetiers || []).forEach(x => { if (!x.metierMasculin || !x.metierFeminin) { sansDeuxFormes.push(x.metier || x.metierMasculin || '?'); } else if (x.metierMasculin === x.metierFeminin && /(ien|ier|eur|teur|gnon)$/i.test(x.metierMasculin.split(' ')[0])) { identiques.push(x.metierMasculin); } x.metier = x.metier || x.metierMasculin; });
    (j.intitulesMemeMetier || []).forEach(x => { if (!x.intituleMasculin || !x.intituleFeminin) { sansDeuxFormes.push(x.intitule || x.intituleMasculin || '?'); } else if (x.intituleMasculin === x.intituleFeminin && /(ien|ier|eur|teur|gnon)$/i.test(x.intituleMasculin.split(' ')[0])) { identiques.push(x.intituleMasculin); } x.intitule = x.intitule || x.intituleMasculin; });
    if (sansDeuxFormes.length) { att('intitulés sans les deux formes (masculin et féminin) : ' + sansDeuxFormes.join(', ')); } else { ok('tous les intitulés ont leurs deux formes, masculine et féminine'); }
    if (identiques.length) { att('forme féminine identique à la masculine, probablement fausse : ' + identiques.join(', ')); }
    s.metier ? ok('métier du CV : ' + s.metier) : att('synthèse sans métier');
    const nc = (s.competencesCles || []).length; (nc >= 4 && nc <= 8) ? ok(nc + ' compétences clés') : att(nc + ' compétences clés (4 à 8 attendues)');
    const ne = (s.experiences || []).length; (ne >= 4 && ne <= 5) ? ok(ne + ' expériences retrouvées') : att(ne + ' expériences (4 attendues pour ce CV, 5 avec le bénévolat)');
    const im = (j.intitulesMemeMetier || []).length; (im >= 3 && im <= 6) ? ok(im + ' autres intitulés du même métier') : att(im + ' autres intitulés du même métier (3 à 6 attendus)');
    const am = j.autresMetiers || []; (am.length >= 5 && am.length <= 10) ? ok(am.length + ' autres métiers') : att(am.length + ' autres métiers (5 à 10 attendus)');
    am.forEach(x => { const n = (x.retrouveDansLeCV || []).length; if (n < 1 || n > 2) { att('« ' + x.metier + ' » : ' + n + ' élément(s) du CV cité(s) (1 ou 2 attendus)'); } });
    const dernier = am.map(x => (x.retrouveDansLeCV || []).join('|')); if (new Set(dernier).size < dernier.length) { att('des métiers citent exactement les mêmes éléments du CV'); }
    const regl = am.filter(x => /pharmac|infirmi|médecin|avocat|conducteur|grutier/i.test(x.metier)); if (regl.length) { att('métier réglementé proposé : ' + regl.map(x => x.metier).join(', ')); } else { ok('aucun métier réglementé proposé'); }
    const av = am.filter(x => x.aVerifier).map(x => x.metier + ' (' + x.aVerifier + ')'); sortie.push('INFO      : métiers marqués « À vérifier » : ' + (av.join(' ; ') || 'aucun') + '  (à confirmer : « électricien » devrait l’être)');
    const dup = (j.intitulesMemeMetier || []).filter(x => am.some(y => mots(y.metier).join(' ') === mots(x.intitule).join(' '))); if (dup.length) { att('un même intitulé apparaît dans les deux colonnes'); }
  } else {
    const liste = Array.isArray(r.json) ? r.json : [];
    if (attendu) { liste.length === attendu ? ok(attendu + ' éléments rendus, comme demandé') : att(liste.length + ' élément(s) rendu(s) au lieu de ' + attendu); }
    liste.forEach((x, i) => { if (x.id !== i + 1) { att('l’élément ' + (i + 1) + ' porte l’id ' + x.id); } });
    if (type === 'accroches') {
      liste.forEach(x => {
        const a = x.accroches || []; if (a.length !== 2) { att('« ' + x.metier + ' » : ' + a.length + ' accroche(s) au lieu de 2'); }
        a.forEach((t, i) => { const n = mots(t).length; if (n < 15 || n > 28) { att('« ' + x.metier + ' » accroche ' + (i + 1) + ' : ' + n + ' mots (15 à 28 attendus)'); } if (/\bje\b|\bj’|\bj'/i.test(t)) { att('« ' + x.metier + ' » accroche ' + (i + 1) + ' : emploie « je » (style CV attendu, sans « je »)'); } });
        if (a.length === 2 && jaccard(mots(a[0]), mots(a[1])) > 0.6) { att('« ' + x.metier + ' » : ses deux accroches sont presque identiques'); }
      });
      for (let i = 0; i < liste.length; i++) { for (let k = i + 1; k < liste.length; k++) { const s1 = jaccard(mots((liste[i].accroches || [])[0]), mots((liste[k].accroches || [])[0])); if (s1 > 0.6) { att('« ' + liste[i].metier + ' » et « ' + liste[k].metier + ' » ont des accroches presque identiques'); } } }
    }
    if (type === 'accroches' || type === 'lettres') {
      // Expressions qui reviennent trop souvent d'un texte à l'autre (suites de 4 mots répétées dans au moins 4 textes).
      const textes = liste.map(x => type === 'accroches' ? (x.accroches || []) : [String(x.lettre || '')]).reduce((a, b) => a.concat(b), []);
      const compte = {};
      textes.forEach(t => { const w = mots(t), vus = new Set(); for (let i = 0; i + 4 <= w.length; i++) { const k = w.slice(i, i + 4).join(' '); if (!vus.has(k)) { vus.add(k); compte[k] = (compte[k] || 0) + 1; } } });
      const seuil = type === 'accroches' ? 4 : 3;
      const repetees = Object.keys(compte).filter(k => compte[k] >= seuil).sort((a, b) => compte[b] - compte[a]).slice(0, 4);
      if (repetees.length) { att('expressions répétées dans plusieurs textes : ' + repetees.map(k => '« ' + k + ' » (' + compte[k] + ' fois)').join(' ; ')); } else { ok('pas d’expression répétée d’un texte à l’autre'); }
      const debuts = {}; textes.forEach(t => { const d = mots(type === 'lettres' ? t.replace(/^\s*(Madame|Monsieur)[^\n]*\n+/i, '') : t).slice(0, 1).join(' '); debuts[d] = (debuts[d] || 0) + 1; });
      const frequent = Object.keys(debuts).filter(d => debuts[d] >= Math.max(3, Math.ceil(textes.length / 4))).map(d => '« ' + d + ' » (' + debuts[d] + ' fois sur ' + textes.length + ')');
      if (frequent.length) { att('débuts de phrase qui se répètent : ' + frequent.join(' ; ')); }
      const g = genre || 'n', avant = alertes;
      const MASC = ['habitué', 'expérimenté', 'motivé', 'qualifié', 'formé', 'diplômé', 'attentif', 'rigoureux', 'sérieux', 'impliqué', 'investi', 'ponctuel', 'prêt', 'convaincu', 'heureux', 'ravi', 'content', 'reconnaissant', 'curieux'];
      const FEM = ['habituée', 'expérimentée', 'motivée', 'qualifiée', 'formée', 'diplômée', 'attentive', 'rigoureuse', 'sérieuse', 'impliquée', 'investie', 'ponctuelle', 'prête', 'convaincue', 'heureuse', 'ravie', 'contente', 'reconnaissante', 'curieuse'];
      const lettres = 'a-zàâäçéèêëîïôöùûüœ';
      liste.forEach(x => {
        const bas = (type === 'accroches' ? (x.accroches || []).join(' ') : String(x.lettre || '')).toLowerCase();
        const trouve = mot => { let i = bas.indexOf(mot); while (i >= 0) { const av = i === 0 ? ' ' : bas[i - 1], ap = bas[i + mot.length] || ' '; if (!/[a-zàâäçéèêëîïôöùûüœ]/.test(av) && !/[a-zàâäçéèêëîïôöùûüœ]/.test(ap) && bas.slice(i + mot.length, i + mot.length + 2) !== '(e') { return true; } i = bas.indexOf(mot, i + 1); } return false; };
        const m = MASC.filter(trouve), f = FEM.filter(trouve);
        if (g === 'f' && m.length) { att('« ' + x.metier + ' » : forme masculine alors que la personne est une femme : ' + m.join(', ')); }
        if (g === 'm' && f.length) { att('« ' + x.metier + ' » : forme féminine alors que la personne est un homme : ' + f.join(', ')); }
        if (g === 'n' && (m.length || f.length)) { att('« ' + x.metier + ' » : forme accordée (' + m.concat(f).join(', ') + ') alors que le sexe n’est pas précisé : formulation neutre attendue'); }
      });
      if (alertes === avant) { ok('accords conformes au sexe indiqué (' + ({ f: 'féminin', m: 'masculin', n: 'non précisé' })[g] + ')'); }
    }
    if (type === 'lettres') {
      const ordre = METIERS.map(m => m.k);
      liste.forEach((x, i) => {
        const t = String(x.lettre || ''), n = mots(t).length;
        if (n < 140 || n > 270) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : ' + n + ' mots (140 à 270 attendus selon l’objectif)'); }
        const att_ = METIERS[i] || {};
        if (att_.recruteur) { const nomR = att_.recruteur.split(' ').slice(-1)[0]; if (!new RegExp('^\\s*(Madame|Monsieur) ' + nomR, 'i').test(t)) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : le recruteur est nommé (' + att_.recruteur + ') : la lettre doit commencer par « ' + att_.recruteur.split(' ')[0] + ' ' + nomR + ', »'); } }
        else if (!/^\s*Madame, Monsieur/i.test(t)) { att('lettre ' + (i + 1) + ' : ne commence pas par « Madame, Monsieur, »'); }
        if (att_.employeur) { const nomE = att_.employeur.split(' (')[0]; if (t.indexOf(nomE) < 0) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : l’employeur « ' + nomE + ' » n’est pas cité'); } }
        if (att_.offre && !/offre|annonce|poste (de|proposé|publié)/i.test(t)) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : une offre est fournie mais la lettre n’en parle pas'); }
        if (/[\[\]]/.test(t)) { att('lettre ' + (i + 1) + ' : contient des crochets (texte à compléter)'); }
        const k = ordre[i]; if (k && !MOTS_OBJECTIF[k].test(t)) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : ne semble pas parler de son objectif (' + NOM_OBJECTIF[k] + ')'); }
        if ((t.match(/\n\n/g) || []).length < 2) { att('lettre ' + (i + 1) + ' : moins de 3 paragraphes'); }
        const corps = t.replace(/^\s*Madame, Monsieur,?\s*/i, '');
        if (/^(je|j’|j')/i.test(corps)) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : commence par « je » (interdit : VOUS d’abord)'); }
        const phrases = corps.split(/[.!?]\s+/).filter(z => z.trim().length > 10), enJe = phrases.filter(z => /^(je|j’|j')/i.test(z.trim())).length;
        if (phrases.length && enJe / phrases.length > 0.5) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : ' + enJe + ' phrases sur ' + phrases.length + ' commencent par « je »'); }
      });
      const ouvertures = liste.map(x => mots(String(x.lettre || '').replace(/^\s*Madame, Monsieur,?/i, '')).slice(0, 8).join(' '));
      if (new Set(ouvertures).size < ouvertures.length) { att('des lettres ont la même ouverture'); } else if (liste.length) { ok('ouvertures toutes différentes'); }
      let max = 0, paire = '';
      for (let i = 0; i < liste.length; i++) { for (let k = i + 1; k < liste.length; k++) { const s2 = jaccard(mots(liste[i].lettre), mots(liste[k].lettre)); if (s2 > max) { max = s2; paire = (i + 1) + ' et ' + (k + 1); } } }
      if (liste.length > 1) { max > 0.55 ? att('lettres ' + paire + ' très proches (ressemblance ' + Math.round(max * 100) + ' %)') : ok('lettres bien distinctes (ressemblance maximale ' + Math.round(max * 100) + ' %)'); }
      const longueurs = liste.map(x => mots(x.lettre).length); if (longueurs.length > 2) { sortie.push('INFO      : longueur des lettres, dans l’ordre : ' + longueurs.join(', ') + ' mots (si elles raccourcissent vers la fin, l’assistant s’essouffle)'); }
    }
  }
  console.log(sortie.join('\n'));
  console.log('\nRésultat : ' + (alertes ? alertes + ' point(s) à voir (voir ATTENTION ci-dessus), puis RELIRE à la main.' : 'aucune alerte automatique, mais RELIRE à la main (le script ne juge pas la qualité).'));
}

const [, , commande, a1, a2, a3, a4] = process.argv;
if (commande === 'generer') { generer(); }
else if (commande === 'verifier' && a1 && a2) { verifier(a1, a2, a3 ? parseInt(a3, 10) : null, a4 || 'n'); }
else { console.log('Usage :\n  node scripts/essai_prompts_ucpm.js generer\n  node scripts/essai_prompts_ucpm.js verifier <metiers|accroches|lettres> <fichier_reponse.txt> [nombre_attendu]'); }
