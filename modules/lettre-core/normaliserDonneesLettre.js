/* ============================================================
   modules/lettre-core/normaliserDonneesLettre.js
   ------------------------------------------------------------
   normaliserDonneesLettre(dossier) : transforme "dossier" en un objet
   pret pour le rendu de la lettre. Beaucoup plus simple que
   normaliserDonneesCV() : la lettre n'a pas besoin d'extraire des
   dizaines de champs de dossier -- l'essentiel du contenu (objet, texte)
   provient deja tout fait de dossier.ia.lettre.lettre (produit par le
   prompt Lettre V2, voir prompts/lettre.md). Ici, on ne fait qu'assembler
   ce contenu avec l'identite (pour l'en-tete expediteur) et la date du
   jour.

   "dossier" reste l'unique source de verite : cette fonction ne le
   modifie jamais.

   IMPORTANT (meme principe que pour le CV) : aucune logique de
   presentation ici (pas de mise en forme, pas de decoupage en
   paragraphes) -- uniquement des donnees propres, completes, pretes a
   etre inserees dans un template par rendreTemplate() (deja generique,
   reutilise tel quel, aucune modification necessaire).
   ============================================================ */

function normaliserDonneesLettre(dossierSource) {
  var d = dossierSource || {};
  var id = d.identite || {};
  var lettreIA = (d.ia && d.ia.lettre && d.ia.lettre.lettre) || { objet: '', texte: '' };

  var dateAujourdhui = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  // Bloc du destinataire (temps 3) : calcule par destinataireLettreCo.js, jamais ici. Charge par <script> avant l'appel ; require en Node.
  var blocDest = (typeof blocDestinataireLettreCo === 'function') ? blocDestinataireLettreCo
    : ((typeof require === 'function') ? require('./destinataireLettreCo.js').blocDestinataireLettreCo : null);

  return {
    destinataire: blocDest ? blocDest(d) : { lignes: [], lignesSansAdresse: [], ligneAttention: '', personneConnue: false },
    // La rue de la personne n'est imprimee que si elle l'a demande (case du panneau de mise en page) ; le code postal l'est toujours.
    inclureRue: !!(d.lettreDestinataire && d.lettreDestinataire.rue),
    // Gabarit, couleur choisie (hex ou vide) et titre du poste (sous le nom dans certains gabarits) : lot D.
    gabarit: (typeof gabaritLettreCo === 'function') ? gabaritLettreCo(d.lettreDestinataire && d.lettreDestinataire.gabarit).id
      : (typeof require === 'function' ? require('./destinataireLettreCo.js').gabaritLettreCo(d.lettreDestinataire && d.lettreDestinataire.gabarit).id : 'g0'),
    optionsGabarit: { icones: !(d.lettreDestinataire && d.lettreDestinataire.icones === false), coordLigne: !!(d.lettreDestinataire && d.lettreDestinataire.coordLigne) },
    couleurChoisie: (d.lettreDestinataire && typeof d.lettreDestinataire.couleur === 'string') ? d.lettreDestinataire.couleur : '',
    poste: String(d.metierCible || d.titreCV || (d.intituleDomaine && d.intituleDomaine.intitule) || '').trim(),
    police: (typeof policeLettreCo === 'function') ? policeLettreCo(d.lettreDestinataire && d.lettreDestinataire.police)
      : (typeof require === 'function' ? require('./destinataireLettreCo.js').policeLettreCo(d.lettreDestinataire && d.lettreDestinataire.police) : 'Georgia'),
    identite: {
      civilite: id.civilite || null,
      nom: id.nom || '',
      prenom: id.prenom || '',
      adresse: id.adresse || '',
      codePostal: id.codePostal || '',
      ville: id.ville || '',
      telephone: (typeof formaterTelephone === 'function') ? formaterTelephone(id.telephone) : (id.telephone || ''),   // 06.12.34.56.78 (retour Denis 2026-10-01)
      email: id.email || ''
    },
    date: dateAujourdhui,
    objet: lettreIA.objet || '',
    // TACHE (retour utilisateur : grand vide dans l'apercu) : le style.css
    // du modele utilise "white-space: pre-wrap" (deliberement, pour
    // respecter les retours a la ligne voulus par l'IA) -- il affiche donc
    // AUSSI, telles quelles, d'eventuelles lignes vides en exces renvoyees
    // par l'IA (3 sauts de ligne ou plus d'affilee), ce qui produisait un
    // grand espace blanc au milieu de la lettre. Normalise ici (jamais plus
    // de 2 sauts de ligne consecutifs = 1 ligne vide entre paragraphes),
    // sans toucher au template ni au style -- les deux etaient corrects.
    texte: (lettreIA.texte || '').replace(/\n{3,}/g, '\n\n').trim(),
    // TACHE (retour utilisateur : "A4 Essentiel" avec un vrai texte court
    // rédigé par l'IA, pas une coupure) : transporté tel quel, vide si
    // absent (réponses IA antérieures à ce champ, ou édition manuelle
    // n'ayant jamais touché la version courte) -- voir
    // construireObjetLettrePourExportFormat() (formatsLettreEntretien.js),
    // qui l'utilise à la place de la troncature quand il est disponible.
    texteCourt: lettreIA.texteCourt || ''
  };
}

// Export CommonJS protege -- tests/lettreCoreNormaliserDonnees.test.js
// (Node), aucun effet sur le chargement navigateur classique (balise
// <script>, ou `module` n'est jamais defini).
if (typeof module !== 'undefined') {
  module.exports = { normaliserDonneesLettre: normaliserDonneesLettre };
}