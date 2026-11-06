# Message de reprise pour l'autre compte (état au 03/11/2026)

> Denis colle le texte ci-dessous (entre les deux traits) dans la première conversation de l'autre compte. Jamais deux comptes en même temps.

---

Reprise du chantier « intégration du dossier Cloud » dans le dépôt APP (dossier `Site_V2`). Un autre compte Claude vient de travailler dessus ; sa séance est terminée, je prends le relais.

**Avant tout, dans cet ordre** :
1. Lire `CLAUDE.md` (protocole du projet), puis `docs/TRAVAILLER_AVEC_DENIS.md`.
2. Lire `docs/PLAN_DE_REPRISE_DOSSIER_CLOUD_2026-11-03.md` EN ENTIER (sections 1 à 4) : c'est le plan et le point d'arrêt exact.
3. Lire la ligne « [EN COURS 03/11/2026] CHANTIER : intégration du dossier Cloud » de `docs/ETAT_DES_CHANTIERS.md`.
4. Lire `docs/CONSIGNES_DE_DENIS_A_SUIVRE.md` (consignes 88 à 108 pour ce chantier).
5. Lancer `git log -15` et `git status`. Le dernier commit de l'autre compte doit être `efa6ebec` (sas des employeurs vérifiés par Denis). Le seul fichier non suivi doit être `outils/passages.json` : il appartient à Denis, ne pas y toucher. Ne jamais `git add -A`. Ne jamais de `push` sans demande de Denis. Le dossier `Cloud/` est exclu de Git : ne jamais l'ajouter.

**Ce qui est fait** (détail dans le plan, section 1 et 3) :
- Fiches de « Comprendre le cadre » : 16 nouvelles fiches de la partie B, lots de la partie L (congé supplémentaire de naissance, assistante maternelle, inaptitude, carrière longue, retraite et enfants, QuiForme, apprentissage sans employeur), adresses de la partie F datées, partie G (navigateur) faite.
- Lexique : 35 entrées de la partie C, K.1 (24 entrées « En savoir plus »), K.2, points de pénibilité, Qualiopi et FEM. Contrôle `node scripts/checkLexique.js` : 0 erreur, 0 avertissement.
- Quatre rayons dans « Qui fait quoi » : Armées, S'installer en agriculture, Parents séparés (fonction publique n'a pas de structure locale).
- Sas préremplis et pré-validés : employeurs (893 fiches) et structures (723 fiches), 497 lignes pré-validées. Doublons de l'analyse A4 fusionnés (11 nettoyés, 2 enrichis). 190 institutions créées (N.2), structures de N.3 et N.4 créées. Employeurs vérifiés par Denis intégrés, MEDIA6 retiré (pas de présence en 24 ni 87, consigne 109) (Veolia, LG, Sécuritest, Autosécurité, Meilleurtaux, Feuillette, Grand Frais, Les Francophonies, Interspray, CEVA, Papillons Blancs, CCAS de Panazol).
- Fiche structure avec adresse cliquable (colonne `adresse`, lien Google Maps, numéro qui compose seulement sur téléphone), maquette dans `docs/maquettes/`.
- Outils de vérification du dossier installés dans `outils/verification_sites/` (rien branché).
- Avis sur la partie O rédigé, analyse des blocages d'ouverture des deux modules rédigée. RIEN n'est ouvert au public : `MT_OUVERT` reste à `false` tant que Denis n'a pas donné son feu vert écrit.

**Ce qui n'est PAS fait** (liste complète dans le plan, section 3) :
- Attend Denis : la relecture du sas dans l'outil de veille et les « C'est bon » ; la vérification des 59 groupes de doublons et des 168 lignes absentes du sas (consigne 108 : il fournit les sites, je les intègre ensuite en un seul exemplaire ; présent dans un des deux départements suffit) ; la relecture des descriptions des six établissements des Papillons Blancs (écrites par Claude) ; la commune de Creysse ; une phrase de conseil dans la fiche « apprentissage sans employeur » ; l'adresse de Grand Frais Bergerac (extrait de recherche contre page officielle) ; la page « Employeurs qui accueillent » (reportée jusqu'à la fin de sa prospection).
- À faire sans attendre Denis (consigne 106 : faire tout ce qui est faisable, ne s'arrêter que sur un vrai choix de Denis ou un manque de matière, et le dire) :
  - Partie L : ouvrir avant d'écrire OPCO, taxe d'apprentissage, contrôle et taxation forfaitaire de l'Agefiph, activité partielle (A18869, A17907), versement mobilité, heures creuses, DIAV et chiffres de la Justice. Ne jamais écrire à partir d'un simple titre.
  - Partie N : syndicats (aucune page officielle locale ouverte : attendre les sites que Denis donnera), Compagnons Bâtisseurs de la Haute-Vienne (rien trouvé), adresse de la sous-préfecture de Sarlat, Crous Bordeaux-Aquitaine, DDFiP missions nationales à Limoges, N.5 types absents, listes plafonnées à 20 (France Services, CCAS…).
  - Partie J : SDIS 24, page « devenir sapeur-pompier » du SDIS 87, noms de J.4 (Legrand, Catalent, Arquus, Cofel, Cofidur, Sotech, Inovelec Industrie, Papeteries de Condat) à vérifier un par un, J.6 (lancement complet de Sirene depuis l'ordinateur de Denis).
  - Fiches « à rédiger » des quatre nouveaux rayons (MSA, BPREA, Tesa, Aripa, résidence alternée et CMG, concours, PACTE, contractuels, service militaire volontaire…), mots du Lexique « à ajouter », bloc européen (I.3.2), entrées courtes (I.1.4), K.3 (liste à donner à Denis), renvoi vers la fiche fonction publique depuis le rayon Handicap.
  - Page « Délais à ne pas rater » et alertes arnaques, bouton « signaler » (ouvre le formulaire de retours existant, prérempli) : MAQUETTE D'ABORD, Denis décide.
- Tout à la fin (plan, section 3.8, dans cet ordre) : consignes 95/96 (phrase générale après 6 mois pour les fiches), 100 (recherche par synonymes), 101 (fiches dans la recherche de l'accueil), 93 (barre « Vous êtes ici »), 97 (lignes `data/nouveautes.js`), fiches « INCERTAIN » (environ 100), contrôle des adresses dans la veille (consigne 92), puis le message de confirmation pour l'autre compte (consigne 89).

**Règles à ne pas oublier** (détail dans `CLAUDE.md` et le plan, section 0) :
- Français impeccable avec accents ; jamais de tiret cadratin ni demi-cadratin (vérifier avec une recherche des caractères U+2013 et U+2014) ; jamais le mot « IA » visible dans l'application ; jamais d'icône avec un visage ; toute variable de couleur a sa valeur mode sombre.
- Ouvrir chaque page avant d'écrire ; ne jamais deviner une adresse web ; ne jamais contourner un CAPTCHA ; bandeau de cookies : « Continuer sans consentement » ; ne rien supprimer ; une adresse n'est cliquable qu'une fois datée (la date du sas = le « C'est bon » de Denis : la laisser vide) ; numéros seulement s'ils sont copiés d'une page officielle, sans ambiguïté, jamais ceux d'une personne ; aucun nom de personne ; les mentions « à confirmer » restent marquées.
- Jamais de doublon (consigne 107) : un seul exemplaire avec les informations des deux entrées.
- `npm test` entièrement vert avant chaque commit (2342 tests aujourd'hui) ; `node scripts/checkLexique.js` si le Lexique change ; une ligne dans `docs/JOURNAL_DES_CHANGEMENTS.md` par changement visible, dans le même commit ; commit direct sur `master` après vérification, avec le pied de page « Co-Authored-By » du compte qui travaille ; vérifier la date système réelle avant d'écrire une date.
- Dans la même séance : annoncer le mode (A/B/C/D/Nuit) et le niveau d'effort, tenir la liste de tâches, corriger tout défaut trouvé en passant, noter toute nouvelle consigne de Denis dans `docs/CONSIGNES_DE_DENIS_A_SUIVRE.md` AVANT de coder, noter les erreurs dans `docs/LECONS_A_NE_PAS_REPRODUIRE.md`.
- Fin de séance : mettre à jour le plan (sections 2, 3 et 4) et la ligne de l'état des chantiers, puis commiter.

**Première action** : après les lectures, dire à Denis en quelques lignes où en est le chantier et enchaîner sur la partie L (pages à ouvrir), sauf si Denis donne une autre priorité.

---
