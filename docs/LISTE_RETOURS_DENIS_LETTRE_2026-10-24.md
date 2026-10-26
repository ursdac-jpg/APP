# Liste des retours de Denis après la maquette de la lettre (24/10/2026)

Source : messages de Denis du 24/10/2026 (fin de séance). Rien de ce qui suit n'est codé tant que la case n'est pas cochée. Chaque lot porte son effort conseillé ; Denis règle l'effort, dit « vas-y », puis on code un lot à la fois (Mode A : audit du code, maquette si doute d'interface).

État au moment de la liste : commit `0e05ef32` (aperçu entier et collé, Valider la lettre dans la barre, Exporter caché avant validation, en-tête avec code postal, liste unique de destinataires, bouton « Mise en page »). Voir la décision 69 du cahier `docs/CHANTIER_LETTRE_CV_DANS_LE_PROMPT_2026-10-23.md`.

## Lot A (FAIT le 24/10/2026, vérifié au navigateur) : retouches de l'écran « Vos documents » de la lettre `[effort : moyen]`

- [x] **A1** « Modifier le texte » aussi dans le **grand aperçu** (la personne préfère parfois modifier dans la grande page).
- [x] **A2** **Candidature générale (aucune entreprise)** : proposer la même liste de choix (service recrutement, ressources humaines, service technique, direction, gérant, responsable, « Autre ») : la personne peut savoir si l'entreprise a un service RH, ou si c'est une petite structure qui s'adresse au gérant. Aujourd'hui la liste n'est affichée qu'avec une entreprise.
- [x] **A3** « Mise en page » et « Revenir comme avant » : de **vrais boutons**, pas une ligne de texte.
- [x] **A4** **Un seul « Valider la lettre »** : celui de la barre du bas. Vérifier qu'il fait bien son travail (ouvre Exporter, aucun dysfonctionnement), puis retirer celui qui est sous l'aperçu.
- [x] **A5** **Code postal et commune de l'entreprise** (plutôt que l'adresse complète) : utile pour un service de recrutement commun à plusieurs magasins (l'envoi arrive au bon endroit). À imprimer dans le bloc du destinataire ; l'adresse complète reste facultative.
- [x] **A6** **Police de la lettre** (faite : Georgia par défaut, Arial, Times New Roman) : deux ou trois polices parmi les plus courantes (Georgia par défaut, celle d'aujourd'hui), au choix de la personne.
- [x] **A7** Parcours : après la validation, « Retour » = « Modifier la lettre », « Merci bien, j'ai fini » après un téléchargement ou une copie, carte entretien après récupération : **essai navigateur à faire** (codé le 24/10, pas encore essayé).

## Lot B (FAIT le 24/10/2026, vérifié au navigateur) : page « Préparer » du module « Écrire ma lettre avec l'assistant » `[effort : haut]`

- [x] **B1** **« Choisir mon assistant » seulement dans la barre du bas** (avec Retour et Accueil) : vérifier que ce bouton fait bien sa fonction, puis **retirer celui de la page** (redondant ; le but de la barre était d'alléger la page).
- [x] **B2** **« Répondre à une offre »** : les zones où la personne écrit (entreprise, offre) bien **démarquées**, **titres plus grands** et **petites icônes** pour montrer l'importance de chaque ligne.
- [x] **B3** **Candidature spontanée, « plusieurs métiers du même domaine »** : quand une proposition d'intitulé est choisie, elle doit être **bien visible**, comme le domaine choisi ; la barre « écrivez votre intitulé » ne doit **pas** rester affichée en même temps : elle devient un **choix « Écrivez votre intitulé »** sur la même ligne que les propositions, et la barre n'apparaît qu'au clic dessus. Jamais un titre choisi ET une barre de saisie.
- [x] **B4** **Coordonnées au retour de l'assistant** : supprimer la **fenêtre** et la **remarque** « mettre à jour mes coordonnées » (redondantes). Au clic sur « Importer », arriver **directement sur l'écran des coordonnées DANS la page**, **pré-rempli** avec ce qui a été repéré dans le CV anonymisé ; la personne vérifie et enregistre ; **la mise en page n'apparaît qu'une fois l'identité enregistrée**. Reproduire **à l'identique** le mécanisme et l'affichage du CV (à auditer : fenêtre à part ou dans la page ?).

## Lot C (C1, C2, C3 FAITS le 24/10/2026 ; reste C4 : message de rallonge et phrases proches ; le compteur de mots est déjà sous l'aperçu) : « Exporter » et PDF de la lettre `[effort : haut]`

- [x] **C1** Garder le **choix de la maquette** : trois boutons, dans cet ordre : **Enregistrer en PDF** (document de référence, en premier), **Télécharger le Word**, **Texte à copier** (toujours visible). Plus de téléchargement Word automatique unique.
- [x] **C2** **Le PDF est la référence** : l'affichage s'aligne sur le PDF, pas sur le Word. Si le Word s'écarte nettement du PDF, **message d'avertissement clair** conseillant le PDF (surtout avec des lettres de recommandation jointes).
- [x] **C3** **Jointure des lettres de recommandation au PDF** (aucune / seulement celle de référence / toutes) : essai de faisabilité réussi (décision 66) ; conserver le fichier d'origine pendant la séance.
- [x] **C4** FAIT le 24/10 (`controleTexteLettreCo.js`, conseil « lettre courte » sous 170 mots, phrases quasi identiques avec « Supprimer la seconde ») ; (compteur de mots fait) Compteur de mots avec message de rallonge, repérage des phrases quasi identiques (« supprimer cette phrase »).

## Lot D (FAIT le 24/10/2026 : cinq gabarits, couleur du CV, options de l'en-tête et filet ; vérifié au navigateur et à l'impression Edge) : gabarits de lettre `[effort : haut]` (nouveau chantier, maquette d'abord)

- [x] **D1** **Gabarits de lettre** comme pour le CV (jusqu'à une centaine à terme). Quatre exemples donnés par Denis : (1) en-tête avec nom et titre à gauche, entreprise à droite, icônes de coordonnées ; (2) colonne colorée à gauche avec les coordonnées ; (3) bandeau coloré en haut avec les coordonnées ; (4) titre en gras et colonne « Informations personnelles » à gauche.
- [x] **D2** **Reprendre la couleur du CV** dans la lettre (spécifique à l'application).
- [x] **D3** Franchise à donner avant de commencer : le Word se construit avec des tableaux et des fonds colorés (le CV le fait déjà) ; le PDF vient de l'impression de l'aperçu ; il faut une maquette et un modèle à la fois.

## Lot E : généralisation et audits `[effort : haut]` (matière des prochaines heures)

- [x] **E1** (AUDIT FAIT le 24/10/2026 : `docs/AUDIT_GENERALISATION_CARTES_OBJECTIF_2026-10-24.md`, plan E1.0 à E1.5, rien codé) **Audit des cartes d'objectif** : quels modules les utilisent, et y appliquer la logique de la lettre (offre sans offre = spontanée, spontanée explicite, domaine avec intitulé, changer de métier, formule d'appel). **Le CV** a encore l'ancienne architecture (amalgame offre / spontanée). Particularités CV et lettre à regarder ensemble.
- [ ] **E2** **Prompt de la lettre** : quels éléments (architecture, anti-doublons, qualité rédactionnelle, recommandations, questions) peuvent profiter au **parcours « Préparer ma lettre et mon entretien »** (lettre générée, pas construite ensemble) et à **« Un CV, plusieurs métiers »** (qui édite aussi des lettres).
- [ ] **E3** **Prompts de création de CV** : ce qui du travail de qualité rédactionnelle du prompt de la lettre peut leur servir.
- [ ] **E4** **CV sans assistant** (gabarits seulement, la personne a déjà son texte), avec une maquette déjà commencée. **Avis demandé à Claude** : ne PAS créer un module de plus ; mettre un **choix unique** (« avec l'aide de l'assistant » ou « j'ai déjà mon texte ») dans les parcours qui font un CV, branché sur **une seule** page nouvelle ; possibilité, à la fin, de passer par l'assistant pour enrichir.

## Ordre proposé

1. Lot A (rapide, tout visible) puis essai navigateur du parcours Valider / Exporter / Merci.
2. Lot B (page Préparer) ; B4 demande un audit de la fenêtre des coordonnées du CV avant tout code.
3. Lot C (PDF de la lettre, avertissement Word, jointure des recommandations).
4. Lot D (maquette des gabarits de lettre).
5. Lot E (audits), un sujet à la fois.

- [x] **E5** (FAIT le 24/10/2026 : panneau « Vos appuis » sur la page « Choisir mon assistant » du CV, stock commun avec la lettre, deux lettres au plus toutes deux envoyées, règle courte dans `cv.md` ; vérifié au navigateur ; essai de Denis à faire sur un vrai assistant) (demande de Denis, 24/10/2026) **Lettres de recommandation pour le CV** : deux au plus, comme pour la lettre (dépôt relu et masqué, une section dans le message), pour relever compétences, vocabulaire du métier et du poste. Avis de Claude donné le 24/10/2026 : oui, à faire après E1.3, avec un audit du prompt du CV.

- [x] **F1 FAIT le 24/10/2026** (balayage de `js/app.js`, `data/metiers.js` et des modules : textes affichés seulement ; commentaires, noms de classes, `niveau: 'facultatif'` et prompts laissés ; vérifié au navigateur sur « Votre objectif », « Mon projet » et la page de la lettre) **F1** (règle de Denis, 24/10/2026) **Plus jamais « facultatif » dans l'application : « à compléter » partout** (invitation à compléter pour plus de précision et de poids ; jamais bloquant). S'applique aux nouvelles mises en place (le panneau « Le poste que vous recherchez » et les placeholders « (facultatif) » que j'ai codés les 24/10 sont à passer en « à compléter ») et à un **balayage de l'existant** (environ 150 occurrences dans `js/app.js`, 16 dans `data/metiers.js`, une vingtaine de modules ; beaucoup sont des commentaires ou des noms de données à ne pas toucher : ne changer que les textes affichés). `[effort : moyen]`. Mémoire : `feedback_a_completer_jamais_facultatif.md`.

- [ ] **E6 (précision de Denis, 24/10/2026)** Disponibilité et horaires sur le CV, **côté code** : dans la rubrique « Autres informations », indiquer à la personne ce qu'elle peut y mettre (disponibilité immédiate, horaires décalés, tout type d'horaire, contraintes), et écrire ces lignes à partir de ce qu'elle a déjà choisi. `[effort : moyen]`
- [x] **G1 FAIT le 24/10/2026 (`definirRaisonSuivantBarre`, `.barre-raison-suivant` ; message au-dessus de « Continuer », à droite, largeur limitée pour ne jamais passer au-dessus d'« Accueil » ; branché sur la barre générique, la page de la lettre et « Votre objectif » ; vérifié au navigateur) (règle de Denis, 24/10/2026)** **Le message qui explique pourquoi « Continuer » est grisé s'affiche AU-DESSUS du bouton « Continuer »** (à droite), jamais au-dessus de « Accueil » ni centré : « Accueil » n'a rien à voir avec la condition. Vaut pour la maquette et pour la barre du bas de toute l'application (composant `barreNavigation`, message `suivantDesactiveMessage` aujourd'hui en info-bulle seulement, avec une phrase dans la page). Corriger les maquettes déjà faites. `[effort : moyen]`

- [ ] **E5 bis (question de Denis, 24/10/2026) : à quel moment les lettres de recommandation partent-elles ?** Aujourd'hui dans le message du 2e passage du CV (`cv.md`). À étudier : les envoyer au **1er passage** (`extraction-cv.md`, quand un CV est déposé : parcours « Mettre à jour » et « Préparer ma lettre et mon entretien ») pour extraire compétences, tâches et vocabulaire dans les données, que le 2e passage reçoit déjà distillées (donc un `cv.md` non alourdi) ; pour le parcours « Créer un CV » sans dépôt, pas de 1er passage : 2e passage. Audit de `extraction-cv.md` et de son format de sortie à faire avant.

## Lot F : retours de Denis de fin de séance (24/10/2026, notés sans vérification ni modification, à traiter AVANT E4)

Consigne de Denis : pendant qu'il donne ses retours, Claude note seulement. Ces points ne sont pas encore vérifiés dans le code.

- [ ] **F2 `[effort : bas]`** Grand aperçu de la lettre (clic sur l'aperçu) : un bandeau « Word téléchargé » apparaît en haut. À **enlever** : le grand aperçu n'est pas propre à Word ; c'est à la validation que la personne choisit son format (PDF, Word, texte).
- [ ] **F3 `[effort : haut]`** « Modifier le texte » : aujourd'hui une fenêtre à part. Question de Denis : peut-on modifier le texte **directement dans le grand aperçu** ? À étudier (faisabilité, maquette d'abord si oui). Lié à F2.
- [ ] **F4 `[effort : bas]`** Bouton « Mise en page » : en **bleu**, un peu **plus grand**, et il **pulse doucement** pour attirer l'attention, en particulier quand la personne change de gabarit et qu'une optimisation de la mise en page est possible.
- [ ] **F5 `[effort : bas]`** Bouton « Revenir comme avant » : le rendre **plus petit** que « Mise en page » (il est aussi grand, voire plus grand, alors qu'il est moins important).
- [ ] **F6 `[effort : haut]`** « Reformuler et présenter mon CV », après avoir écrit la lettre avec l'assistant : **mélange d'informations** entre les deux parcours, comme si le parcours était déjà validé ou fait. À **diagnostiquer** (état commun du dossier : `_origineCoLettre`, `dernierDocumentPrepare`, `modeCreation`, états de page de Reformuler) puis corriger, sans perdre de données. Peut relever de la même famille que `_origineReformuler`.
- [ ] **F7 `[effort : haut]`** **Cartes d'objectif du CV restées à l'ancienne** : sur la carte « Répondre à une offre », on voit encore « un métier précis ou plusieurs métiers » (ancienne logique). Denis l'avait demandé explicitement : la logique des cartes de « Écrire ma lettre avec l'assistant » est la **nouvelle base, généralisée partout**. L'écran « Votre objectif » du CV avait été passé en mode unifié (E1.3) : **il faut trouver quel chemin du CV affiche encore l'ancien rendu** (autre point d'entrée : « Reformuler », « Mettre à jour », « J'ai déjà un CV », « Créer un CV »...) et tous les basculer. À faire avec un grep de tous les appels de `contenuModeRecherche` et de `blocERIP(CONFIG_BLOC_CANDIDATURE)`.
