/* ============================================================
   data/competences.js
   ------------------------------------------------------------
   Referentiel des competences reconnues par l'application :
   categorieCompetence (nom -> Savoir-faire / Savoir-etre / Savoirs,
   utilise pour classer et colorer les pastilles de competence) et
   DESCRIPTIFS_COMPETENCES (mini-glossaire affiche au clic sur une
   pastille, ecran "Votre profil").

   Sorti de js/app.js le 2026-09-16 (meme geste que la fusion des
   fichiers metiers du 2026-09-15) : une seule source de verite,
   hors du fichier applicatif. Voir docs/CHANTIER_COMPETENCES.md et
   docs/PLAN_COMPETENCES_2026-09-15.md pour le detail du chantier.

   Toute competence absente de categorieCompetence est classee par
   defaut en "Savoir-faire" a l'affichage (comportement herite,
   voir js/app.js) -- l'ajouter ici la classe correctement.
   ============================================================ */

var categorieCompetence = {
  'Relation client': 'Savoir-etre', 'Communication': 'Savoir-etre', 'Écoute': 'Savoir-etre',
  'Technique': 'Savoir-faire', 'Maintenance': 'Savoir-faire', 'Précision': 'Savoir-faire',
  'Pédagogie': 'Savoir-etre', 'Patience': 'Savoir-etre', 'Bienveillance': 'Savoir-etre',
  'Empathie': 'Savoir-etre', 'Aide à la personne': 'Savoir-etre', 'Travail en équipe': 'Savoir-etre',
  'Coordination': 'Savoir-etre', 'Entraide': 'Savoir-etre', 'Autonomie': 'Savoir-etre',
  'Organisation': 'Savoir-etre', 'Responsabilité': 'Savoir-etre', 'Adaptabilité': 'Savoir-etre',
  'Endurance': 'Savoir-etre', 'Sécurité': 'Savoir-etre', 'Merchandising': 'Savoir-faire',
  'Accueil': 'Savoir-etre', 'Gestion des stocks': 'Savoir-faire', 'Bureautique': 'Savoir-faire',
  'Gestion administrative': 'Savoir-faire', 'Gestion du temps': 'Savoir-etre', 'Planification': 'Savoir-faire',
  'Diagnostic': 'Savoir-faire', 'Réparation': 'Savoir-faire', 'Conseil': 'Savoir-faire',
  'Négociation': 'Savoir-faire', 'Persuasion': 'Savoir-faire', 'Logistique': 'Savoir-faire',
  'Conduite': 'Savoir-faire', 'Respect des délais': 'Savoir-etre', 'Hygiène': 'Savoir-faire',
  'Entretien': 'Savoir-faire', 'Rigueur': 'Savoir-etre', 'Formation': 'Savoir-faire',
  'Transmission': 'Savoir-faire', 'Soins': 'Savoir-faire', 'Cuisine': 'Savoir-faire',
  'Créativité': 'Savoir-etre', 'Respect des normes': 'Savoir-etre', 'Bâtiment': 'Savoir-faire',
  'Lecture de plans': 'Savoir-faire', 'Travail manuel': 'Savoir-faire', 'Analyse de données': 'Savoir-faire',
  'Raisonnement logique': 'Savoir-faire', 'Rédaction': 'Savoir-faire', 'Innovation': 'Savoir-faire',
  'Expression artistique': 'Savoir-faire', 'Motivation': 'Savoir-etre', 'Apprentissage': 'Savoir-etre',
  'Esprit d\'équipe': 'Savoir-etre', 'Sens du service': 'Savoir-etre', 'Gestion de projet': 'Savoir-faire',
  'Gestion financière': 'Savoir-faire', 'Management': 'Savoir-faire', 'Leadership': 'Savoir-etre',
  'Stabilité': 'Savoir-etre', 'Fiabilité': 'Savoir-etre',
  // Etape 3 : nouveaux termes introduits par les exemples d'enrichissement loisirs
  'Persévérance': 'Savoir-etre', 'Respect des règles': 'Savoir-etre', 'Sens du détail': 'Savoir-faire',
  // Chantier competences 2026-09-16 : termes reels des fiches metier absents
  // jusqu'ici (audit docs/CHANTIER_COMPETENCES.md, section "Audit chiffre du
  // vocabulaire reel"). "Esprit d'équipe" existait deja (voir ci-dessus) :
  // une premiere passe d'audit l'avait signale a tort comme absent (bug
  // d'echappement d'apostrophe dans le script d'analyse), corrige.
  'Intervention': 'Savoir-faire', 'Rédaction de procédures': 'Savoir-faire', 'Secourisme': 'Savoir-faire',
  'Sang-froid': 'Savoir-etre', 'Sens du devoir': 'Savoir-etre', 'Discrétion': 'Savoir-etre',
  // Categorie "Savoirs" (absente jusqu'ici de categorieCompetence bien que
  // deja decrite plus bas pour 5 d'entre elles) : connaissances specifiques
  // plutot que gestes ou postures. On ne catalogue pas les 192 libelles
  // "savoirs" distincts releves dans les fiches metier (par nature propres
  // a chaque metier/secteur, non generalisables) -- seulement les plus
  // transverses, deja decrits ou frequents dans plusieurs secteurs.
  'Encaissement': 'Savoirs', 'Mise en rayon': 'Savoirs', 'Règles d\'hygiène': 'Savoirs',
  'Gamme de produits': 'Savoirs', 'Plan et sécurité du magasin': 'Savoirs',
  'Règles de sécurité': 'Savoirs', 'Gestes de premiers secours': 'Savoirs',
  'Anglais et langues étrangères': 'Savoirs',
  // Chantier competences, enrichissement des fiches metier a partir des
  // fiches officielles France Travail / Metierscope (2026-09-16, premier
  // lot de 9 metiers sous-decrits, docs/CHANTIER_COMPETENCES.md). Termes
  // reellement presents sur les fiches officielles, reformules en libelles
  // courts coherents avec le reste du referentiel.
  'Maquillage': 'Savoir-faire', 'Épilation': 'Savoir-faire', 'Brancardage': 'Savoir-faire',
  'Manutention': 'Savoir-faire', 'Accompagnement': 'Savoir-faire', 'Observation': 'Savoir-faire',
  'Soutien scolaire': 'Savoir-faire', 'Collaboration': 'Savoir-faire',
  'Gestion des réservations': 'Savoir-faire', 'Coaching': 'Savoir-faire', 'Animation': 'Savoir-faire',
  'Assistance': 'Savoir-faire', 'Collecte': 'Savoir-faire', 'Vigilance': 'Savoir-faire',
  'Réactivité': 'Savoir-etre',
  // Chantier competences, enrichissement (lot 2, 2026-09-16, 17 metiers).
  'Câblage': 'Savoir-faire', 'Installation': 'Savoir-faire', 'Finition': 'Savoir-faire',
  'Marqueterie': 'Savoir-faire', 'Assemblage': 'Savoir-faire', 'Déploiement': 'Savoir-faire',
  'Surveillance': 'Savoir-faire', 'Développement commercial': 'Savoir-faire', 'Levage': 'Savoir-faire',
  'Taille et élagage': 'Savoir-faire', 'Traitement phytosanitaire': 'Savoir-faire',
  'Extraction du miel': 'Savoir-faire', 'Manipulation des ruches': 'Savoir-faire',
  'Traçage de plans': 'Savoir-faire'
};

// TACHE (refonte parcours guide, etape 4, sous-etape 4.3, maquette
// MAQUETTE_VOTRE_PROFIL) : mini-glossaire des competences. Sur "Votre
// profil", cliquer sur une competence ouvre ce descriptif court (+ bouton
// "Garder comme Repere"). Si une competence n'a PAS d'entree ici, le clic
// garde le comportement actuel (ouvrir les metiers qui la recherchent) --
// aucune regression, le glossaire s'enrichit progressivement.
// Ton : simple, concret, rassurant (public cible). Une phrase courte.
var DESCRIPTIFS_COMPETENCES = {
  // --- Savoir-faire ---
  'Technique': 'Maîtriser les gestes et les outils propres à un métier, et savoir les appliquer correctement.',
  'Maintenance': 'Entretenir un matériel ou une installation pour qu\'ils restent en bon état de marche.',
  'Précision': 'Travailler avec exactitude, sans erreur ni approximation, quand chaque détail compte.',
  'Merchandising': 'Disposer les produits en rayon pour qu\'ils soient visibles, attractifs et faciles à trouver.',
  'Gestion des stocks': 'Suivre les quantités disponibles, commander à temps, éviter les ruptures et le gaspillage.',
  'Bureautique': 'Utiliser un ordinateur et les logiciels courants : traitement de texte, tableur, messagerie.',
  'Gestion administrative': 'Traiter les documents et les démarches : classer, remplir, suivre les échéances.',
  'Planification': 'Organiser les tâches dans le temps, prévoir les étapes et tenir un calendrier.',
  'Diagnostic': 'Repérer l\'origine d\'un problème ou d\'une panne pour savoir comment le résoudre.',
  'Réparation': 'Remettre en état un objet ou un équipement défectueux.',
  'Conseil': 'Écouter un besoin et orienter la personne vers la bonne solution ou le bon produit.',
  'Négociation': 'Trouver un accord qui convienne aux deux parties, en discutant les conditions.',
  'Persuasion': 'Convaincre quelqu\'un en présentant des arguments clairs et adaptés.',
  'Logistique': 'Organiser le transport, le stockage et la circulation des marchandises.',
  'Conduite': 'Conduire un véhicule en sécurité, en respectant le code de la route et les consignes.',
  'Hygiène': 'Appliquer les règles de propreté et de désinfection pour protéger la santé de chacun.',
  'Entretien': 'Nettoyer et maintenir en état des locaux, du matériel ou des espaces.',
  'Formation': 'Transmettre un savoir ou un geste professionnel à d\'autres personnes.',
  'Transmission': 'Partager son expérience et ses méthodes pour que d\'autres puissent les reprendre.',
  'Soins': 'Prendre soin d\'une personne : gestes de confort, d\'hygiène ou de santé.',
  'Cuisine': 'Préparer des plats en respectant les recettes, les quantités et les règles d\'hygiène.',
  'Bâtiment': 'Connaître les techniques de construction, de rénovation ou de second œuvre.',
  'Lecture de plans': 'Comprendre un plan ou un schéma technique pour réaliser un ouvrage.',
  'Travail manuel': 'Réaliser des tâches avec ses mains et des outils, avec soin et dextérité.',
  'Analyse de données': 'Lire des chiffres ou des tableaux pour en tirer des constats utiles.',
  'Raisonnement logique': 'Suivre un enchaînement d\'idées cohérent pour résoudre un problème.',
  'Rédaction': 'Écrire un texte clair et correct : courrier, compte rendu, note.',
  'Innovation': 'Proposer des idées ou des méthodes nouvelles pour améliorer une façon de faire.',
  'Expression artistique': 'Créer ou réaliser quelque chose de personnel : dessin, musique, mise en forme.',
  'Gestion de projet': 'Piloter une action du début à la fin : objectifs, étapes, moyens, suivi.',
  'Gestion financière': 'Suivre un budget : recettes, dépenses, équilibre des comptes.',
  'Management': 'Encadrer une équipe : organiser le travail, accompagner, faire le point.',
  'Sens du détail': 'Repérer les petites choses qui font la qualité d\'un travail fini.',
  'Intervention': 'Se déplacer et agir rapidement pour répondre à une situation ou une urgence.',
  'Rédaction de procédures': 'Écrire clairement les étapes à suivre pour qu\'une tâche soit faite correctement.',
  'Secourisme': 'Connaître les gestes qui sauvent en cas d\'accident ou de malaise.',
  // --- Savoir-être ---
  'Relation client': 'Accueillir, écouter, renseigner et rassurer une personne, même mécontente.',
  'Communication': 'Se faire comprendre et écouter les autres, à l\'oral comme à l\'écrit.',
  'Écoute': 'Prêter attention à ce que dit l\'autre sans l\'interrompre, pour bien comprendre son besoin.',
  'Pédagogie': 'Expliquer les choses simplement, avec patience, pour que l\'autre comprenne.',
  'Patience': 'Garder son calme et prendre le temps qu\'il faut, même quand c\'est long ou répétitif.',
  'Bienveillance': 'Se soucier du bien-être des autres, sans jugement.',
  'Empathie': 'Comprendre ce que ressent l\'autre et en tenir compte.',
  'Aide à la personne': 'Accompagner une personne dans les gestes du quotidien, avec respect.',
  'Travail en équipe': 'Coopérer avec les autres, partager l\'information, tenir sa part du travail.',
  'Coordination': 'Faire en sorte que chacun avance dans le même sens, au bon moment.',
  'Entraide': 'Aider ses collègues quand ils en ont besoin, et accepter d\'être aidé.',
  'Autonomie': 'Savoir s\'organiser et avancer seul, sans avoir besoin qu\'on vous guide en permanence.',
  'Organisation': 'Ranger, prioriser et planifier son travail pour ne rien oublier.',
  'Responsabilité': 'Assumer ses tâches et leurs conséquences, et tenir ses engagements.',
  'Adaptabilité': 'S\'ajuster à une situation nouvelle, à un imprévu ou à un changement.',
  'Endurance': 'Tenir la distance sur un effort physique ou une journée longue.',
  'Sécurité': 'Avoir le réflexe des consignes de sécurité, pour soi et pour les autres.',
  'Accueil': 'Recevoir une personne avec le sourire et l\'orienter vers le bon interlocuteur.',
  'Gestion du temps': 'Estimer la durée des tâches et s\'y tenir, sans se laisser déborder.',
  'Respect des délais': 'Rendre le travail à la date prévue.',
  'Rigueur': 'Faire les choses avec soin, méthode et régularité, en suivant les consignes.',
  'Créativité': 'Trouver des idées, des solutions ou des façons de faire originales.',
  'Respect des normes': 'Appliquer les règles et procédures en vigueur dans le métier.',
  'Motivation': 'Avoir l\'envie et l\'énergie de s\'investir dans son travail.',
  'Apprentissage': 'Aimer apprendre du nouveau et progresser.',
  'Esprit d\'équipe': 'Penser au collectif, encourager le groupe.',
  'Sens du service': 'Chercher à rendre service et à satisfaire la personne en face.',
  'Leadership': 'Entraîner un groupe, donner une direction, donner envie de suivre.',
  'Stabilité': 'Être présent et régulier dans la durée : une personne sur qui on peut compter.',
  'Fiabilité': 'Faire ce qu\'on a dit, de façon constante.',
  'Persévérance': 'Ne pas lâcher devant une difficulté, recommencer jusqu\'à réussir.',
  'Respect des règles': 'Suivre les consignes et le règlement, même sans contrôle.',
  'Sang-froid': 'Garder son calme et rester efficace, même dans une situation tendue ou imprévue.',
  'Sens du devoir': 'Faire ce qui doit être fait, avec sérieux, même quand c\'est difficile.',
  'Discrétion': 'Savoir garder pour soi une information sensible ou personnelle.',
  // --- Savoirs courants (issus des fiches metier) ---
  'Encaissement': 'Enregistrer les achats, rendre la monnaie, gérer sa caisse et la clôturer sans erreur.',
  'Mise en rayon': 'Installer les produits en rayon : réassort, rotation des dates, étiquetage.',
  'Règles d\'hygiène': 'Connaître les règles de propreté et de conservation : chaîne du froid, dates, nettoyage.',
  'Gamme de produits': 'Connaître les produits vendus : caractéristiques, usages, prix, différences.',
  'Plan et sécurité du magasin': 'Connaître les issues de secours, l\'emplacement des extincteurs, les consignes d\'évacuation.',
  'Règles de sécurité': 'Connaître et appliquer les consignes qui protègent des accidents sur son lieu de travail.',
  'Gestes de premiers secours': 'Savoir réagir face à un accident ou un malaise, en attendant les secours.',
  'Anglais et langues étrangères': 'Comprendre et se faire comprendre dans une autre langue que le français.',
  // --- Chantier competences, enrichissement fiches metier (2026-09-16) ---
  'Maquillage': 'Appliquer des produits de maquillage pour sublimer ou corriger un visage.',
  'Épilation': 'Retirer les poils avec les techniques et le matériel adaptés, en toute sécurité.',
  'Brancardage': 'Transporter une personne allongée en toute sécurité, avec les bons gestes.',
  'Manutention': 'Porter, déplacer ou installer des charges avec les bons gestes, sans se blesser.',
  'Accompagnement': 'Guider une personne dans une démarche ou un déplacement, à son rythme.',
  'Observation': 'Repérer les signes qui comptent chez une personne ou une situation, pour agir au bon moment.',
  'Soutien scolaire': 'Aider un élève à comprendre et à suivre les apprentissages de sa classe.',
  'Collaboration': 'Travailler main dans la main avec d\'autres professionnels autour d\'une même personne ou d\'un même projet.',
  'Gestion des réservations': 'Organiser les réservations et les disponibilités, sans erreur ni oubli.',
  'Coaching': 'Accompagner une personne pour qu\'elle progresse, avec des conseils adaptés à son niveau.',
  'Animation': 'Faire vivre un groupe ou un moment collectif, avec énergie et à l\'aise devant plusieurs personnes.',
  'Assistance': 'Seconder un professionnel dans ses gestes du quotidien, en anticipant ses besoins.',
  'Collecte': 'Ramasser et rassembler des éléments selon un circuit ou des consignes précises.',
  'Vigilance': 'Rester attentif aux risques et aux anomalies pour prévenir un accident.',
  'Réactivité': 'Répondre vite et bien face à un imprévu, sans se laisser déborder.',
  // --- Chantier competences, enrichissement fiches metier, lot 2 (2026-09-16) ---
  'Câblage': 'Installer et raccorder des câbles électriques ou informatiques selon les normes.',
  'Installation': 'Mettre en place et raccorder un équipement pour qu\'il soit prêt à fonctionner.',
  'Finition': 'Apporter les dernières touches qui rendent un ouvrage soigné et abouti.',
  'Marqueterie': 'Assembler de fines pièces de bois ou de matière pour créer un motif décoratif.',
  'Assemblage': 'Réunir plusieurs pièces pour former un ensemble solide et fonctionnel.',
  'Déploiement': 'Installer et mettre en service un système ou un réseau sur l\'ensemble d\'un site.',
  'Surveillance': 'Garder un œil attentif sur un lieu ou une situation pour prévenir un incident.',
  'Développement commercial': 'Aller chercher de nouveaux clients et faire grandir une activité.',
  'Levage': 'Soulever et déplacer des charges lourdes avec un engin adapté, en toute sécurité.',
  'Taille et élagage': 'Couper les branches d\'un arbre pour sa santé, sa forme ou sa production.',
  'Traitement phytosanitaire': 'Protéger une plante ou une culture contre les maladies et les parasites.',
  'Extraction du miel': 'Récolter le miel des ruches sans nuire aux abeilles.',
  'Manipulation des ruches': 'Ouvrir, inspecter et entretenir une ruche en toute sécurité.',
  'Traçage de plans': 'Reporter sur le terrain ou la matière les mesures indiquées sur un plan.'
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    categorieCompetence: categorieCompetence,
    DESCRIPTIFS_COMPETENCES: DESCRIPTIFS_COMPETENCES
  };
}
