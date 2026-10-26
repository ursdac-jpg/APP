/* ============================================================
   modules/lettre-core/destinataireLettreCo.js
   ------------------------------------------------------------
   En-tete de la lettre : coordonnees de la personne (en haut a gauche) et
   bloc du destinataire (coin droit). Temps 3 du chantier lettre, 24/10/2026.
   Decisions de Denis (cahier, decisions 22, 26, 27, 28, 68) :
   - a gauche : nom, code postal et ville, telephone, e-mail (toujours) ; la
     rue est facultative, decochee au depart ;
   - sans entreprise visee (candidature generale), le bloc se limite a la ligne
     « A l'attention du service recrutement » (ou le choix fait) ;
   - UNE SEULE liste de choix pour « a qui je m'adresse » (services, puis
     responsable, direction, gerant, « Autre » ecrit a la main) ;
   - personne en charge du recrutement connue (civilite ET nom) : entreprise,
     adresse, service, « A l'attention de Madame Machin » ; la formule d'appel
     reste « Madame, » (le prompt s'en charge), jamais le nom ; la liste se
     limite alors aux services ;
   - personne inconnue : entreprise, adresse, « A l'attention du service
     recrutement » (ou le choix fait) ;
   - l'adresse de l'entreprise est facultative et saisie dans le panneau de
     mise en page ; elle n'est imprimee que s'il reste de la place (la mise en
     page la retire en premier : voir lignesSansAdresse).
   Donnees : dossier.lettreDestinataire = { choix, autre, adresse, pour, rue }
   (pour = entreprise pour laquelle l'adresse a ete saisie : une adresse n'est
   jamais reprise pour une autre entreprise ; rue = imprimer la rue de la
   personne).

   Fonctions pures, testees en Node (tests/lettreCoreDestinataire.test.js).
   ============================================================ */

// La liste unique des choix. service : propose aussi quand la personne en charge du recrutement est connue.
var CHOIX_DESTINATAIRE_LETTRE_CO = [
  { id: 'recrutement', lib: 'Service recrutement', ligne: 'du service recrutement', service: true },
  { id: 'rh', lib: 'Ressources humaines', ligne: 'du service des ressources humaines', service: true },
  { id: 'technique', lib: 'Service technique', ligne: 'du service technique', service: true },
  { id: 'commercial', lib: 'Service commercial', ligne: 'du service commercial', service: true },
  { id: 'compta', lib: 'Service comptabilité', ligne: 'du service comptabilité', service: true },
  { id: 'responsable', lib: 'Responsable du recrutement', ligne: 'du responsable du recrutement', service: false },
  { id: 'direction', lib: 'Direction', ligne: 'de la direction', service: false },
  { id: 'gerant', lib: 'Gérant', ligne: 'du gérant', service: false },
  { id: 'autre', lib: 'Autre…', ligne: '', service: true }
];

// Polices proposees pour la lettre (demande de Denis, 24/10/2026) : deux ou trois parmi les plus courantes ; Georgia (celle d'origine) par defaut.
var POLICES_LETTRE_CO = ['Georgia', 'Arial', 'Times New Roman'];
function policeLettreCo(nom) { return POLICES_LETTRE_CO.indexOf(nom) !== -1 ? nom : POLICES_LETTRE_CO[0]; }

// Gabarits de la lettre (lot D, maquette du 24/10/2026) : le Sobre d'aujourd'hui (g0) et quatre autres ; couleur par defaut propre a chaque gabarit
// (hex sans #). Decision de Denis : la couleur du CV est reprise par defaut quand elle existe (sauf pour le Sobre, resté neutre tant qu'on ne choisit rien).
var GABARITS_LETTRE_CO = [
  { id: 'g0', nom: 'Sobre', defaut: '1A1A1A', wordFidele: true },
  { id: 'g1', nom: 'En-tête et filet', defaut: '2C4A7A', wordFidele: true },
  { id: 'g2', nom: 'Colonne colorée', defaut: '0B3D6E', wordFidele: false },
  { id: 'g3', nom: 'Bandeau coloré', defaut: '0B3D6E', wordFidele: true },
  { id: 'g4', nom: 'Titre et informations', defaut: '14548F', wordFidele: true }
];
function gabaritLettreCo(id) { return GABARITS_LETTRE_CO.filter(function (g) { return g.id === id; })[0] || GABARITS_LETTRE_CO[0]; }
function hexSansDieseLettreCo(valeur) {
  var v = String(valeur || '').trim().replace(/^#/, '');
  return /^[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : '';
}
// Couleur d'une lettre : celle choisie, sinon (hors Sobre) celle du CV, sinon celle par defaut du gabarit.
function couleurLettreEffectiveCo(gabaritId, couleurChoisie, couleurCv) {
  var g = gabaritLettreCo(gabaritId);
  return hexSansDieseLettreCo(couleurChoisie) || (g.id !== 'g0' ? hexSansDieseLettreCo(couleurCv) : '') || g.defaut;
}

// Entreprise visee : le nouveau parcours (rechercheCandidature) d'abord, puis l'ancien circuit (dossier[objectif].structure).
// Source unique : entrepriseCibleActuelle() (js/app.js) la lit ici.
function entrepriseCibleDuDossierLettreCo(d) {
  var dossier = d || {};
  var rc = dossier.rechercheCandidature;
  var ent = rc && typeof rc.entreprise === 'string' ? rc.entreprise.trim() : '';
  if (ent) { return ent; }
  var obj = dossier.objectif && dossier[dossier.objectif];
  var ancien = obj && typeof obj.structure === 'string' ? obj.structure.trim() : '';
  return ancien || '';
}

function choixDestinataireLettreCo(id) {
  return CHOIX_DESTINATAIRE_LETTRE_CO.filter(function (c) { return c.id === id; })[0] || CHOIX_DESTINATAIRE_LETTRE_CO[0];
}

// « Madame Machin » si la civilite ET le nom sont connus ; sinon chaine vide (une civilite seule ne donne pas de nom a ecrire).
function lignePersonneConnueLettreCo(d) {
  var rc = (d && d.rechercheCandidature) || {};
  var civ = rc.civiliteRecruteur;
  var nom = typeof rc.nomRecruteur === 'string' ? rc.nomRecruteur.trim() : '';
  if ((civ === 'Madame' || civ === 'Monsieur') && nom) { return civ + ' ' + nom; }
  return '';
}

function debutLigneAttentionLettreCo() { return 'À l’attention '; }

// Choix des services proposes selon que la personne est connue ou non (connue : seulement les services).
function choixProposesLettreCo(personneConnue) {
  return CHOIX_DESTINATAIRE_LETTRE_CO.filter(function (c) { return !personneConnue || c.service; });
}

// { lignes, lignesSansAdresse, ligneAttention, personneConnue }. Sans entreprise visee (candidature generale), le bloc se limite a la ligne
// « A l'attention du service recrutement » (ou le choix fait) : une lettre n'est jamais adressee a personne (decision de Denis, 24/10/2026).
function blocDestinataireLettreCo(d) {
  var dossier = d || {};
  var entreprise = entrepriseCibleDuDossierLettreCo(dossier);
  var ld = dossier.lettreDestinataire || {};
  var choix = choixDestinataireLettreCo(ld.choix);
  var autre = typeof ld.autre === 'string' ? ld.autre.trim() : '';
  var adresse = (entreprise && typeof ld.adresse === 'string' && ld.adresse.trim() && (!ld.pour || ld.pour === entreprise)) ? ld.adresse.trim() : '';
  var connue = lignePersonneConnueLettreCo(dossier);
  var ligneAttention;
  var queue = [];
  if (connue) {
    // Un choix qui n'est pas un service (direction, gerant...) ne s'applique pas quand on connait la personne.
    var libService = !choix.service ? CHOIX_DESTINATAIRE_LETTRE_CO[0].lib : (choix.id === 'autre' ? (autre || CHOIX_DESTINATAIRE_LETTRE_CO[0].lib) : choix.lib);
    // Sans entreprise, la ligne du service ne dirait rien : seule la ligne « A l'attention de Madame Machin » reste.
    if (entreprise) { queue.push(libService.charAt(0).toUpperCase() + libService.slice(1)); }
    ligneAttention = debutLigneAttentionLettreCo() + 'de ' + connue;
  } else {
    ligneAttention = debutLigneAttentionLettreCo() + (choix.id === 'autre' && autre ? autre : (choix.id === 'autre' ? CHOIX_DESTINATAIRE_LETTRE_CO[0].ligne : choix.ligne));
  }
  queue.push(ligneAttention);
  var tete = entreprise ? [entreprise] : [];
  return {
    lignes: tete.concat(adresse ? [adresse] : [], queue),
    lignesSansAdresse: tete.concat(queue),
    ligneAttention: ligneAttention,
    personneConnue: !!connue,
    entreprise: entreprise
  };
}

// Place du bloc du destinataire (decision de Denis, 24/10/2026) : par defaut une ligne plus bas, sous les coordonnees (comme un courrier) ;
// quand la lettre est longue, il monte AU MEME NIVEAU que les coordonnees (a leur droite) pour gagner de la place. Une ligne du bloc vaut environ
// 90 caracteres de texte ; limiteCaracteres = ce que la page porte a la taille normale (voir PALIERS_TAILLE_LETTRE). La mesure reelle de la page
// (bouton « Mise en page ») remplacera cette estimation.
function destinataireCoteLettreCo(longueurTexte, nbLignesBloc, limiteCaracteres) {
  if (!nbLignesBloc) { return false; }
  return (longueurTexte || 0) + nbLignesBloc * 90 > (limiteCaracteres || 4200);
}

// Essais de mise en page de la lettre, du plus aere au plus serre (decisions de Denis, 24/10/2026 : « Mise en page » fait tenir la lettre sur une
// page, en agrandissant le texte d'une lettre courte comme en le reduisant, avec moins d'espace entre les paragraphes, pour une lettre longue ; le
// destinataire monte au niveau des coordonnees AVANT que le texte rapetisse). Tailles en demi-points Word ; espacement : large, normal, serre,
// tres-serre (voir exportDocxNatifLettre.js). L'apercu mesure la page reelle et descend la liste tant que la lettre deborde ; le Word et le PDF
// reprennent l'essai retenu. Sans clic sur « Mise en page », on part de l'essai par defaut (taille normale) et on ne descend que si ca deborde.
var CANDIDATS_MISE_EN_PAGE_LETTRE_CO = [
  { cote: false, tailleCorps: 24, tailleEnTete: 22, espacement: 'large' },
  { cote: false, tailleCorps: 24, tailleEnTete: 22, espacement: 'normal' },
  { cote: false, tailleCorps: 23, tailleEnTete: 21, espacement: 'normal' },
  { cote: false, tailleCorps: 22, tailleEnTete: 20, espacement: 'normal' },
  { cote: false, tailleCorps: 21, tailleEnTete: 20, espacement: 'normal' },
  { cote: true, tailleCorps: 21, tailleEnTete: 20, espacement: 'normal' },
  { cote: true, tailleCorps: 21, tailleEnTete: 20, espacement: 'serre' },
  { cote: true, tailleCorps: 20, tailleEnTete: 19, espacement: 'serre' },
  { cote: true, tailleCorps: 20, tailleEnTete: 19, espacement: 'tres-serre' },
  { cote: true, tailleCorps: 19, tailleEnTete: 18, espacement: 'tres-serre' },
  { cote: true, tailleCorps: 18, tailleEnTete: 17, espacement: 'tres-serre' }
];
var INDICE_MISE_EN_PAGE_DEFAUT_LETTRE_CO = 4;

// Empreinte de ce qui change la place prise par la lettre : un essai retenu ne vaut que pour la meme empreinte.
function signatureMiseEnPageLettreCo(objetLettre) {
  var o = objetLettre || {};
  var dest = (o.destinataire && o.destinataire.lignes) || [];
  return JSON.stringify([o.texte || '', o.objet || '', dest, !!o.inclureRue, o.police || '', o.gabarit || '', o.couleurChoisie || '', o.poste || '', JSON.stringify(o.optionsGabarit || {})]);
}

// Ligne « code postal ville » de la personne (« 24100 Bergerac »). Une ville deja ecrite avec son code postal n'est pas doublee.
function ligneCodePostalVilleLettreCo(identite) {
  var id = identite || {};
  var cp = typeof id.codePostal === 'string' ? id.codePostal.trim() : '';
  var ville = typeof id.ville === 'string' ? id.ville.trim() : '';
  if (cp && ville && /^\d{4,5}\b/.test(ville)) { return ville; }
  return [cp, ville].filter(Boolean).join(' ');
}

// Lignes de coordonnees imprimees en haut a gauche, dans l'ordre : [rue si choisie], « code postal ville ». (Nom, telephone et e-mail
// sont poses par le Word, qui grise ce qui manque.)
function ligneRueLettreCo(identite, inclureRue) {
  var rue = identite && typeof identite.adresse === 'string' ? identite.adresse.trim() : '';
  return (inclureRue && rue) ? rue : '';
}

if (typeof module !== 'undefined') {
  module.exports = {
    CHOIX_DESTINATAIRE_LETTRE_CO: CHOIX_DESTINATAIRE_LETTRE_CO,
    entrepriseCibleDuDossierLettreCo: entrepriseCibleDuDossierLettreCo,
    choixDestinataireLettreCo: choixDestinataireLettreCo,
    choixProposesLettreCo: choixProposesLettreCo,
    debutLigneAttentionLettreCo: debutLigneAttentionLettreCo,
    blocDestinataireLettreCo: blocDestinataireLettreCo,
    destinataireCoteLettreCo: destinataireCoteLettreCo,
    POLICES_LETTRE_CO: POLICES_LETTRE_CO,
    GABARITS_LETTRE_CO: GABARITS_LETTRE_CO,
    gabaritLettreCo: gabaritLettreCo,
    hexSansDieseLettreCo: hexSansDieseLettreCo,
    couleurLettreEffectiveCo: couleurLettreEffectiveCo,
    policeLettreCo: policeLettreCo,
    CANDIDATS_MISE_EN_PAGE_LETTRE_CO: CANDIDATS_MISE_EN_PAGE_LETTRE_CO,
    INDICE_MISE_EN_PAGE_DEFAUT_LETTRE_CO: INDICE_MISE_EN_PAGE_DEFAUT_LETTRE_CO,
    signatureMiseEnPageLettreCo: signatureMiseEnPageLettreCo,
    ligneCodePostalVilleLettreCo: ligneCodePostalVilleLettreCo,
    ligneRueLettreCo: ligneRueLettreCo
  };
}
