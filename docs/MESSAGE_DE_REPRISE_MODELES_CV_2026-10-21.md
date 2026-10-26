# Message de reprise pour un autre compte Claude (2026-10-21)

À coller tel quel au début de la nouvelle session. Il est aussi enregistré ici pour que tout compte retrouve la même consigne.

---

/app Reprise du chantier « modèles de CV, options et formes » (séances du 2026-10-20 et 2026-10-21, autres comptes et autre PC). Cette session est sur le GRAND PC : Denis peut y ouvrir les fichiers (maquettes HTML comprises).

Lis d'abord `docs/PASSATION_MODELES_CV_2026-10-20.md`, en commençant par le paragraphe « ÉTAT DE FIN DE SÉANCE (2026-10-21, suite) : LIRE EN PREMIER » (le plus récent, dans la section « ÉTAT À LA FIN DE LA SÉANCE DU 2026-10-21 »), puis les « Décisions de Denis, fin de la reprise » (ne rien redemander de ce qui est tranché). `git log` doit afficher le commit « Passation : état de fin de séance » ou plus récent (le dernier commit de code est `ba5c9dd9`) ; lance `npm test` (1823 verts attendus ou plus). Serveur de dev : `site-v2-python-server` (port 8123, parfois 8124 ou 8125). Essais navigateur : `docs/TESTS_PARCOURS_NAVIGATEUR.md` ; fenêtre 738 x 698 pour le banc, 1043 px pour `grandsBoutons`. Banc de rendu complet à chaque étape qui touche le gabarit (attendre que `window.dossier` existe avant de charger `banc.js`).

ÉTAT : tous les modèles de CV sont faits (dernier : Frise sobre et Bandeaux noirs), ainsi que bandeau, colonne et formes sur tous les modèles qui le permettent, la phrase en bas de page sous l'aperçu, et quatre options simples (casse des titres, lettres espacées, séparateur entre expériences, puce rond creux). Rien n'est poussé.

À FAIRE, dans l'ordre fixé par Denis :
1. **Panneau « Personnaliser l'en-tête » dans le petit aperçu** (effort `high`, mode A) : maquette avec Denis (il peut l'ouvrir sur ce PC, et il aime qu'on lui montre aussi des captures), puis code. Le détail de l'idée et des points techniques est dans la passation.
2. **Essai d'impression d'un vrai PDF** (formes, bandeau doux, colonne douce) : faire l'essai avec Denis.
3. **Message Word final** : un seul message pour tout ce que le Word ne reproduit pas (liste dans la passation ; `modules/cv-word/limitesWord.js` n'inscrit que ce qui a été VU dans un vrai Word).
4. **Chantier à part** : le module « remplir un gabarit de CV sans assistant » (`docs/IDEES_A_RECLASSER.md`), à concevoir dans de meilleures conditions.

RÈGLES DE DENIS (impératives) : tout CV à deux colonnes a le choix de la colonne, seuls les CV à une colonne n'ont que « Bandeau » et « Formes » ; PDF d'abord ; jamais d'option impossible proposée (masquée, pas grisée) ; aucune phrase ni bouton sur le CV lui-même (la phrase d'aide est SOUS l'aperçu, en bas de page, sans deuxième barre de défilement) ; boutons du même aspect que les autres ; français impeccable, aucun tiret long, jamais le mot « IA » visible ; maquette et questions avant code en cas de doute d'interface ; recommandation + bénéfices et risques de chaque option ; principe : mettre les options partout où ça ne crée pas de bug, sinon laisser le modèle tel quel ; à la fin de chaque point, s'arrêter et annoncer le niveau d'effort du suivant ; jamais `git add -A`, jamais de `git push` sans demande ; mettre à jour la passation en fin de séance.
