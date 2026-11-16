/* ============================================================
   Missions proposées pour les certifications (cases à cocher) : « Citer ou développer », consignes 355 à 357 de Denis.
   Relues et validées par Denis le 2026-11-15 (docs/RELECTURE_MISSIONS_CERTIFICATIONS_2026-11-15.md).
   La personne coche seulement ce qu'elle a réellement fait ; l'assistant ne fait que reformuler et accorder ce qui est coché.
   Source unique : ce fichier (le panneau des certifications de js/app.js s'y réfère). Aucune dépendance au DOM.
   ============================================================ */

var CD_MISSIONS_CERTIFS = {
  'SST': [
    'Protéger une victime et les personnes présentes en supprimant ou en écartant le danger',
    'Examiner une victime pour repérer ce qui menace sa vie',
    'Alerter ou faire alerter les secours (15, 18 ou 112) en donnant les informations utiles',
    'Arrêter un saignement abondant par compression',
    'Dégager les voies aériennes d\'une personne qui s\'étouffe',
    'Installer une personne inconsciente qui respire en position latérale de sécurité',
    'Pratiquer une réanimation cardio-pulmonaire en cas d\'arrêt cardiaque',
    'Utiliser un défibrillateur automatisé externe',
    'Prendre en charge une personne victime d\'un malaise, d\'une brûlure ou d\'une plaie',
    'Accueillir et guider les secours à leur arrivée sur le lieu de l\'accident',
    'Signaler à son responsable les situations dangereuses repérées dans l\'entreprise',
    'Participer à la prévention en proposant des améliorations de sécurité'
  ],
  'PSC1': [
    'Protéger une victime et son entourage d\'un danger',
    'Alerter les secours en donnant des informations claires',
    'Arrêter un saignement abondant',
    'Dégager les voies aériennes d\'une personne qui s\'étouffe',
    'Mettre une personne inconsciente qui respire en position latérale de sécurité',
    'Pratiquer une réanimation cardio-pulmonaire chez l\'adulte, l\'enfant et le nourrisson',
    'Utiliser un défibrillateur automatisé externe',
    'Prendre en charge une personne victime d\'un malaise',
    'Prendre en charge une victime de brûlure, de plaie ou de traumatisme',
    'Rester auprès de la victime en surveillant son état jusqu\'à l\'arrivée des secours'
  ],
  'AFGSU': [
    'Identifier une urgence vitale chez un patient, un résident ou un collègue',
    'Alerter le service d\'urgence ou la personne désignée dans la structure',
    'Pratiquer une réanimation cardio-pulmonaire avec un défibrillateur',
    'Arrêter une hémorragie',
    'Dégager les voies aériennes d\'une personne qui s\'étouffe',
    'Installer une personne inconsciente en position latérale de sécurité',
    'Surveiller un patient en détresse jusqu\'à la prise en charge par l\'équipe soignante',
    'Utiliser le matériel d\'urgence de la structure (chariot, oxygène, aspirateur de mucosités)',
    'Appliquer les règles d\'hygiène et de protection lors d\'un geste d\'urgence',
    'Participer à un plan d\'urgence ou à une évacuation de patients'
  ],
  'SSIAP': [
    'Prévenir les incendies par des rondes et le contrôle des consignes de sécurité',
    'Sensibiliser le personnel et les occupants à la sécurité incendie',
    'Entretenir au premier niveau les moyens de secours (extincteurs, alarmes, éclairages de sécurité)',
    'Donner l\'alerte et accueillir les secours à leur arrivée',
    'Évacuer le public vers l\'extérieur en cas de sinistre',
    'Intervenir précocement sur un début d\'incendie avec les moyens à disposition',
    'Porter assistance aux personnes au sein de l\'établissement',
    'Exploiter le poste central de sécurité incendie (surveiller le tableau, traiter les alarmes)',
    'Tenir la main courante et rédiger les comptes rendus de ronde',
    'Contrôler les accès et les issues de secours'
  ],
  'H0B0': [
    'Réaliser des travaux non électriques (nettoyage, peinture, maçonnerie, manutention) à proximité d\'installations électriques',
    'Respecter les distances de sécurité et les zones de danger autour des installations',
    'Identifier les installations et les ouvrages électriques de son environnement de travail',
    'Lire et respecter les consignes et les balisages posés par le responsable',
    'Appliquer les règles de sécurité de l\'entreprise avant de commencer un travail',
    'Alerter son responsable en cas d\'anomalie sur une installation électrique',
    'Réagir correctement en cas d\'accident d\'origine électrique (couper, alerter, secourir)',
    'Utiliser les équipements de protection individuelle adaptés',
    'Diriger une équipe de travaux non électriques en tant que chargé de chantier'
  ],
  'BS': [
    'Remplacer à l\'identique des fusibles',
    'Remplacer à l\'identique des lampes et des voyants',
    'Remplacer à l\'identique des prises et des interrupteurs',
    'Raccorder un matériel à un circuit en attente, hors tension, dans la limite de 400 V et 32 A',
    'Mettre hors tension, séparer et condamner le circuit avant d\'intervenir',
    'Vérifier l\'absence de tension avant et après l\'opération',
    'Utiliser des outils isolés et les équipements de protection adaptés',
    'Respecter les zones et les distances de sécurité en basse tension',
    'Rendre compte à son responsable d\'une opération réalisée ou d\'une anomalie constatée',
    'Réagir en cas d\'accident électrique ou de début d\'incendie sur un équipement basse tension'
  ],
  'BE Manœuvre': [
    'Réenclencher un disjoncteur après un déclenchement',
    'Réarmer un relais thermique après un défaut',
    'Manœuvrer un sectionneur, un interrupteur ou tout organe conçu pour cet usage, en basse tension',
    'Effectuer des manœuvres d\'exploitation sur ordre du responsable',
    'Respecter les zones et les distances de sécurité en basse tension',
    'Appliquer les consignes d\'exploitation de l\'installation',
    'Utiliser les équipements de protection adaptés',
    'Rendre compte des manœuvres effectuées et des anomalies constatées',
    'Réagir en cas d\'accident électrique ou de feu sur un équipement basse tension'
  ],
  'R482': [
    'Conduire un engin de chantier (pelle, chargeuse, tracteur, compacteur, selon la catégorie)',
    'Réaliser les vérifications et l\'entretien de premier niveau avant la prise de poste',
    'Terrasser, creuser ou niveler selon les consignes du chef de chantier',
    'Charger et décharger des matériaux (terre, gravats, granulats)',
    'Déplacer un engin sur un chantier en respectant le plan de circulation',
    'Transporter ou porter un engin sur un camion porte-engins',
    'Respecter les règles de sécurité à proximité des personnes, des réseaux et des talus',
    'Caler et stabiliser un engin avant son utilisation',
    'Signaler un risque ou une panne à son responsable',
    'Stationner et sécuriser un engin en fin de journée'
  ],
  'R485': [
    'Conduire un transpalette ou un gerbeur à conducteur accompagnant',
    'Réaliser les vérifications avant la prise de poste',
    'Prendre et déposer des palettes au sol',
    'Gerber et dégerber des palettes en rayonnage',
    'Charger et décharger des palettes dans un camion',
    'Préparer des commandes en déplaçant les charges',
    'Lire la plaque de charge et respecter la capacité de l\'appareil',
    'Circuler en respectant le plan de circulation et les piétons',
    'Brancher et surveiller la recharge de la batterie de l\'engin',
    'Signaler une panne ou une anomalie à son responsable'
  ],
  'R486': [
    'Conduire une plateforme élévatrice mobile de personnes',
    'Réaliser le contrôle journalier avant la prise de poste',
    'Choisir la machine adaptée à la hauteur et à la configuration du travail',
    'Mettre en place le balisage de la zone de travail',
    'Vérifier le sol, le vent et la proximité de lignes électriques avant d\'élever la nacelle',
    'Porter le harnais antichute et respecter les règles d\'utilisation',
    'Déplacer la nacelle repliée ou en position de travail selon la catégorie',
    'Élever des personnes ou du matériel pour des travaux en hauteur',
    'Appliquer la procédure de sauvetage en cas de panne ou de suspension dans le harnais',
    'Stationner et sécuriser la machine en fin de journée'
  ],
  'R489': [
    'Conduire un chariot élévateur à conducteur porté',
    'Réaliser les vérifications journalières avant la prise de poste',
    'Prendre et déposer des charges au sol',
    'Gerber et dégerber des palettes en rayonnage',
    'Charger et décharger des camions et des remorques',
    'Réaliser des déplacements de charges d\'un poste à un autre',
    'Lire la plaque de charge et l\'abaque pour respecter la capacité du chariot',
    'Circuler en respectant le plan de circulation, la signalisation et les piétons',
    'Stationner et sécuriser le chariot, couper le contact et abaisser les fourches',
    'Signaler une panne ou un incident à son responsable'
  ],
  'R490': [
    'Conduire une grue de chargement portée sur un camion',
    'Réaliser les vérifications avant la prise de poste',
    'Installer et stabiliser le camion avec les stabilisateurs sur un sol adapté',
    'Charger et décharger des matériaux ou des palettes avec la grue',
    'Choisir les accessoires d\'élingage adaptés à la charge',
    'Guider la charge en respectant la zone de sécurité et les personnes présentes',
    'Lire le diagramme de charge pour respecter la capacité de la grue',
    'Vérifier l\'environnement (sol, vent, lignes électriques) avant d\'élever une charge',
    'Replier la grue et sécuriser le camion avant de reprendre la route',
    'Signaler une panne ou un incident à son responsable'
  ],
  'AIPR': [
    'Consulter le guichet unique pour repérer les réseaux avant des travaux',
    'Lire les plans de réseaux et les déclarations de travaux',
    'Repérer les réseaux sur le terrain (marquage, piquetage)',
    'Adapter la méthode de travail à la présence de réseaux (fouilles à la main, distances de sécurité)',
    'Conduire un engin de terrassement à proximité de réseaux enterrés ou aériens',
    'Transmettre aux équipes les consignes de sécurité liées aux réseaux',
    'Vérifier que les consignes de sécurité sont respectées sur le chantier',
    'Réagir en cas d\'endommagement d\'un réseau (arrêt des travaux, mise en sécurité, alerte)',
    'Rendre compte des anomalies constatées à son responsable ou au maître d\'ouvrage'
  ],
  'Travail en hauteur': [
    'Contrôler et mettre en place le harnais antichute avant de monter',
    'Choisir le bon point d\'ancrage et le bon dispositif de liaison',
    'Travailler en hauteur sur une échelle, un escabeau ou une plateforme',
    'Utiliser un échafaudage ou une nacelle en respectant ses règles d\'usage',
    'Installer des protections collectives (garde-corps, filets) lorsque c\'est prévu',
    'Vérifier l\'état du matériel avant chaque utilisation',
    'Se déplacer et se positionner en sécurité sur une toiture ou une structure',
    'Signaler les situations dangereuses à son responsable',
    'Appliquer la procédure de secours en cas de chute ou de suspension dans le harnais'
  ],
  'Échafaudage': [
    'Monter un échafaudage fixe ou roulant selon la notice du fabricant',
    'Démonter un échafaudage en respectant la procédure',
    'Vérifier l\'état des éléments avant le montage',
    'Installer les garde-corps, les plinthes et les planchers',
    'Stabiliser l\'échafaudage (calage, ancrages, haubanage)',
    'Vérifier l\'échafaudage avant la prise de poste et après un événement climatique',
    'Respecter les règles de charge et de circulation sur l\'échafaudage',
    'Utiliser un échafaudage roulant en sécurité (freinage, déplacement à vide)',
    'Porter le harnais antichute pendant le montage et le démontage',
    'Signaler une anomalie à son responsable'
  ],
  'Amiante': [
    'Repérer les matériaux susceptibles de contenir de l\'amiante à partir des diagnostics',
    'Appliquer le mode opératoire fixé par l\'entreprise pour une intervention concernée',
    'Mettre en place le balisage et le confinement d\'une zone de travail',
    'Porter les équipements de protection individuelle adaptés (combinaison, masque)',
    'Utiliser les procédures de décontamination avant de quitter la zone',
    'Conditionner et étiqueter les déchets contenant de l\'amiante',
    'Évacuer les déchets vers une filière adaptée',
    'Contrôler le respect du mode opératoire par l\'équipe',
    'Rendre compte des anomalies et des incidents à son responsable'
  ],
  'FIMO': [
    'Conduire un véhicule de transport de marchandises (ou de voyageurs) sur route',
    'Préparer sa tournée et son itinéraire',
    'Contrôler son véhicule avant le départ (pneus, freins, feux, niveaux)',
    'Respecter la durée de conduite, les pauses et les temps de repos',
    'Utiliser le chronotachygraphe et renseigner les documents de bord',
    'Charger, arrimer et caler la marchandise pour éviter tout déplacement',
    'Décharger et remettre les marchandises au destinataire',
    'Appliquer le code de la route et les règles de sécurité routière',
    'Réagir à un accident ou à une panne (alerter, signaler, sécuriser)',
    'Rendre compte au responsable d\'exploitation des anomalies et des livraisons'
  ],
  'FCO': [
    'Conduire un véhicule de transport de marchandises (ou de voyageurs) sur route',
    'Pratiquer une conduite rationnelle pour limiter la consommation de carburant',
    'Appliquer les règles sociales et la réglementation des temps de conduite et de repos',
    'Contrôler son véhicule avant le départ',
    'Arrimer et caler les chargements selon la réglementation',
    'Appliquer les règles de sécurité routière lors des trajets',
    'Réagir à une panne ou à un accident (alerter, sécuriser, secourir)',
    'Utiliser les documents de transport et le chronotachygraphe',
    'Accueillir les clients et représenter l\'entreprise lors des livraisons'
  ],
  'ADR': [
    'Transporter des marchandises dangereuses (colis, citerne, selon la spécialité)',
    'Vérifier les documents de transport (document de transport, consignes écrites, certificat)',
    'Contrôler la signalisation du véhicule (plaques orange, panneaux de danger)',
    'Vérifier le matériel de sécurité exigé à bord (extincteurs, équipements de protection)',
    'Identifier les dangers d\'un produit à partir de sa classe et de ses étiquettes',
    'Respecter les règles de chargement, de calage et de séparation des marchandises',
    'Respecter les règles de stationnement et de surveillance du véhicule',
    'Appliquer les consignes écrites en cas d\'accident ou de fuite',
    'Alerter les secours en donnant les informations sur le produit transporté',
    'Rendre compte de toute anomalie à son responsable'
  ],
  'Habilitations électriques': [
    'Réaliser des travaux d\'ordre électrique en basse tension selon son habilitation',
    'Exécuter des opérations sous les ordres d\'un chargé de travaux',
    'Dépanner ou rechercher une panne sur une installation basse tension',
    'Réaliser des mesures et des essais sur une installation électrique',
    'Effectuer une consignation avant de travailler',
    'Vérifier l\'absence de tension avant toute intervention',
    'Utiliser les outils isolés et les équipements de protection adaptés',
    'Respecter les zones et les distances de sécurité',
    'Remplacer du matériel électrique défectueux',
    'Rendre compte au responsable des travaux réalisés et des anomalies'
  ],
  'Pont roulant': [
    'Conduire un pont roulant ou un portique depuis le sol ou depuis la cabine',
    'Réaliser les vérifications avant la prise de poste',
    'Prendre et déplacer des charges en atelier ou en entrepôt',
    'Choisir les accessoires de levage adaptés à la charge',
    'Élinguer une charge de manière équilibrée',
    'Déplacer une charge en respectant les personnes et les obstacles',
    'Lire les capacités de l\'appareil et respecter la charge maximale',
    'Guider ou être guidé par un équipier pendant le levage',
    'Ranger l\'appareil en fin de journée',
    'Signaler une panne ou un incident à son responsable'
  ],
  'Élingage': [
    'Choisir les élingues, les crochets et les accessoires adaptés à la charge',
    'Contrôler l\'état du matériel d\'élingage avant chaque utilisation',
    'Estimer le poids et repérer le centre de gravité d\'une charge',
    'Élinguer une charge en l\'équilibrant',
    'Guider le grutier ou le pontier par des gestes ou par radio',
    'Accompagner une charge pendant son déplacement sans se placer dessous',
    'Poser et décrocher une charge en sécurité',
    'Respecter les zones de sécurité autour d\'une charge levée',
    'Ranger et stocker le matériel d\'élingage',
    'Signaler un matériel défectueux à son responsable'
  ],
  'Soudure': [
    'Souder des pièces métalliques selon un plan ou une consigne',
    'Préparer les pièces (découpe, chanfreinage, meulage, nettoyage)',
    'Régler le poste à souder selon le métal et l\'épaisseur',
    'Assembler et pointer les pièces avant la soudure',
    'Réaliser des soudures à l\'arc, sous gaz ou à la baguette',
    'Contrôler visuellement la qualité des soudures',
    'Reprendre ou corriger une soudure défectueuse',
    'Porter les équipements de protection individuelle adaptés (masque, gants, tablier)',
    'Appliquer les règles de prévention des incendies et des fumées',
    'Entretenir le poste et le matériel de soudage'
  ]
};

// Missions proposées pour un élément (liste vide si aucune : la personne écrit alors avec ses propres mots).
// rubrique : 'certifications' (par défaut), ou 'engagements' / 'experiencesPerso' (liste CD_MISSIONS_ELEMENTS, missionsEngagementsExperiences.js).
function cdMissionsProposees(valeur, rubrique) {
  var table = CD_MISSIONS_CERTIFS;
  if (rubrique === 'engagements' || rubrique === 'experiencesPerso') {
    table = (typeof CD_MISSIONS_ELEMENTS !== 'undefined') ? CD_MISSIONS_ELEMENTS : {};
  }
  var v = (typeof cdNormaliser === 'function') ? cdNormaliser(valeur) : String(valeur || '').toLowerCase();
  var trouve = [];
  Object.keys(table).forEach(function (cle) {
    var k = (typeof cdNormaliser === 'function') ? cdNormaliser(cle) : cle.toLowerCase();
    if (k === v) { trouve = table[cle]; }
  });
  return trouve.slice();
}

// Une seule zone de texte (une mission par ligne) garde tout ce que la personne a choisi ou écrit. Les cases cochées sont les lignes de ce texte
// qui sont des missions proposées ; les autres lignes sont ses propres mots. Ces trois fonctions font le va-et-vient entre le texte et l'écran.
function _cdLignes(texte) { return String(texte == null ? '' : texte).split(/\r?\n/).map(function (m) { return m.trim(); }).filter(Boolean); }
function _cdClef(t) { return (typeof cdNormaliser === 'function') ? cdNormaliser(t) : String(t || '').toLowerCase().trim(); }
// Missions proposées déjà présentes dans le texte (dans l'ordre de la liste proposée).
function cdMissionsCochees(texte, propositions) {
  var presentes = _cdLignes(texte).map(_cdClef);
  return (propositions || []).filter(function (p) { return presentes.indexOf(_cdClef(p)) !== -1; });
}
// Lignes du texte qui ne sont pas une mission proposée : les mots de la personne.
function cdMissionsLibres(texte, propositions) {
  var clefs = (propositions || []).map(_cdClef);
  return _cdLignes(texte).filter(function (l) { return clefs.indexOf(_cdClef(l)) === -1; });
}
// Texte à enregistrer : les missions cochées (dans l'ordre de la liste), puis les lignes libres. Une ligne n'est jamais enregistrée deux fois.
function cdAssemblerMissions(cochees, libres) {
  var vues = [];
  return (cochees || []).concat(libres || []).filter(function (l) {
    var k = _cdClef(l);
    if (!k || vues.indexOf(k) !== -1) { return false; }
    vues.push(k);
    return true;
  }).join('\n');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CD_MISSIONS_CERTIFS: CD_MISSIONS_CERTIFS, cdMissionsProposees: cdMissionsProposees, cdMissionsCochees: cdMissionsCochees, cdMissionsLibres: cdMissionsLibres, cdAssemblerMissions: cdAssemblerMissions };
}
