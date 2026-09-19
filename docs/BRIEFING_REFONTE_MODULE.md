# Briefing réutilisable - refonte d'un module (APP)

**But de ce document** : reproduire, sur n'importe quel module, la démarche, la rigueur et les exigences appliquées à la refonte du Bilan / « Analyser ma candidature » (session du 2026-08-29/30). À coller au démarrage d'une session neuve. Denis choisit seulement le module dans le cadre en fin de document.

L'exemple de référence entièrement fait : `docs/CONSOLIDATION_BILAN_PLAN_2026-08-29.md` + `docs/MAQUETTE_BILAN_PARCOURS_CONSOLIDE_2026-08-29.html`.

---

## 1. Le but de la refonte

Consolider le module : **moins d'écrans, moins de charge cognitive, plus de cohérence et de compréhension**, sans jamais perdre une fonction ni un choix offert à la personne. Concrètement :

- **Une page d'introduction** sur le patron canonique (`docs/PAGES_INTRODUCTION_MODULES_RECUEIL.md` §2), qui se transforme en tableau de bord une fois qu'un résultat existe (« État 2 » = bandeau sur la même page, jamais un écran séparé).
- **Une barre d'étapes visuelle** dans le module (informative, non cliquable, jamais un temps estimé) : **une seule ligne**, une icône par pastille, chevrons `»`, halo sur l'étape courante, **pastille verte** sur les étapes faites, le chevron courant→suivant qui **clignote** (borné, sans changement de taille - `LECONS 1sexies`). Jamais de barre-en-barre : la position interne d'un sous-parcours est un petit repère « X sur N » dans le titre de l'écran.
- **Fusionner les écrans qui se ressemblent** et les états d'écran fragmentés en une seule machine à états, quand elle existe (`pageXxx()` re-rendu maître). Le nombre d'écrans du fil principal doit baisser nettement.
- **Réutiliser les composants partagés** existants (choix de l'assistant, écran de transition, collage instantané, relecture/masquage, panneau Candidature, barre de navigation) plutôt que réinventer. Si un composant existe en 2-3 exemplaires proches, viser un composant unique - mais **jamais toucher `blocERIP` / une fonction très partagée** sans mesurer l'impact sur tous ses appelants.
- **Tout écran de rapport / résultat = accordéons repliés par défaut** : icône + couleur + une pastille de compte/verdict + un message « cliquez pour ouvrir » qui disparaît à l'ouverture et revient à la fermeture. La personne dose la quantité d'information. Jamais un pavé déplié d'un coup. (Voir `LECONS` section 1, avant-dernière puce.)

## 2. Non-négociables (à vérifier à chaque écran)

- **Zéro régression de FONCTION et de CHOIX.** Aucune option retirée, aucun bouton perdu, aucune donnée redemandée. La règle ne s'applique **pas** au visuel : le visuel doit **s'améliorer** (`LECONS` Règle 11).
- **Jamais redemander ce qu'on sait déjà** : tout champ pré-rempli depuis `dossier` ; tout écran/alerte de saisie affiché **seulement si** l'info manque réellement ; jamais deux formulaires pour la même donnée.
- **Français impeccable** : tous les accents, partout, tout le temps (`LECONS §0bis`). **Aucun tiret cadratin** (—) nulle part, texte ni code : tiret court avec espaces.
- **Aucun mot « IA » visible**, aucune tête de robot 🤖. On dit « un assistant » / « l'assistant ». **Pas d'icône cervelle 🧠 ni yeux 👀** (demande Denis 2026-08-30).
- **Des boutons, jamais des liens texte cliquables** (sauf les renvois de vocabulaire internes au Lexique). Ni `btn-link`, ni une classe CSS dédiée sans règle CSS réelle (`LECONS` section 1).
- **Chaque fenêtre / panneau a une croix de fermeture visible** dès sa conception. Une fenêtre d'action ne se ferme jamais au clic extérieur (croix + Échap seulement).
- **Bouton « Retour » sur chaque écran et chaque fenêtre.**
- **Mode sombre** : tester chaque écran, aucun texte invisible ; jamais une teinte fixe en dur, toujours les variables CSS (`--success-*`, `--danger-*`, `--text-muted`… déjà adaptées sombre + daltonisme).
- **L'icône d'identité d'un module accompagne toujours son nom** partout où il est cité (texte, bouton, carte). Une référence à un autre module mise en avant va dans son propre encart, icône en tête (`LECONS` 9.9).
- **Animations/pulses** : `LECONS §1sexies` (jamais photosensible, intensité uniforme, borné ~10 s, `prefers-reduced-motion`, un seul pulse à la fois).
- **`npm test`** doit rester vert (compter les tests avant/après). **Tests navigateur obligatoires** : `js/app.js` et `modules/*/index.js` (code DOM) ne sont **pas** chargés par Node (`LECONS 9.23`).

## 3. Méthode, dans l'ordre

1. **Tracer le parcours réel COMPLET par lecture directe du code** - chaque écran, chaque bouton, chaque option, chaque champ, chaque cas limite, chaque garde-fou. Écran d'avant, écran d'après (`LECONS` Règle 2bis). Vérifier chaque affirmation dans le vrai code, jamais se fier à une note de session ou à un doc d'inventaire ancien (`LECONS 9.23`).
2. **Produire l'inventaire fonctionnel** : un tableau, une ligne par fonction, avec ce qu'elle fait pour la personne, où elle est aujourd'hui, et une **étiquette** : `GARDÉ` / `DÉPLACÉ` (même fonction, autre endroit) / `FUSIONNÉ` (même fonction, un seul code) / `ENRICHI` (on ajoute) / `RESTYLÉ`. **Jamais « RETIRÉ ».** Si une ligne ne peut recevoir aucune étiquette, ne rien toucher et le signaler à Denis.
3. **Produire une maquette HTML autonome** dans `docs/MAQUETTE_<MODULE>_<DATE>.html` : s'ouvre dans n'importe quel navigateur, clair + sombre, un menu « Aller à… » pour sauter entre écrans, un écran d'ouverture « Comparaison avant / après » (tableau : chaque moment, ce qui existe aujourd'hui avec les vrais noms de fonctions, ce qui est proposé, ce qui change - étiquettes couleur). Aux écrans qui demandent un assistant, un bouton « Simuler une réponse » avec un résultat fictif pour parcourir tout le flux. **La maquette proposée doit être visiblement meilleure que l'existant**, pas une photocopie annotée (`LECONS` Règle 11) : les notes de comparaison vivent dans la vue « Comparaison » ou un bandeau, jamais en italique dans l'écran proposé.
4. **Noter la charte actuelle sur 20 et la proposition sur 20** (charge cognitive, cohérence interne, cohérence inter-modules, clarté du parcours, friction/écrans, compréhension). La refonte doit dépasser l'existant, **cible ≥ 18/20**. En dessous, ajuster avant de coder.
5. **Produire le plan d'exécution** dans `docs/CONSOLIDATION_<MODULE>_PLAN_<DATE>.md` : décisions validées ; le plan **bloc par bloc**, en vagues (additif pur d'abord → briques communes → refonte des états/écrans en dernier) ; chaque bloc = un commit testé, point de retour arrière avant chaque vague risquée ; checklist de non-régression ; **une partie « points de fragilité »** relevés dans le code.
6. **Reporter les points de fragilité et les leçons de méthode dans `docs/LECONS_A_NE_PAS_REPRODUIRE.md`** (section dédiée au module + méthode si pertinent), avant de coder.
7. **Coder par blocs**, chacun testé (`npm test` + navigateur), commité avant le suivant. Jamais tout d'un coup. Si le temps manque, s'arrêter à un commit de fin de vague, jamais un état à moitié refondu.

## 4. Livrables attendus

- `docs/MAQUETTE_<MODULE>_<DATE>.html` (commité).
- `docs/CONSOLIDATION_<MODULE>_PLAN_<DATE>.md` (commité).
- Ajouts à `docs/LECONS_A_NE_PAS_REPRODUIRE.md`.
- Mise à jour de `docs/TACHES_VALIDEES.md` (statut du chantier : `MAQUETTE VALIDÉE` / `PLAN VALIDÉ` / `EN COURS` / `CLOS`).

## 5. Style d'échange avec Denis

- **Court et direct.** Voir `docs/TRAVAILLER_AVEC_DENIS.md`. Les jours de fatigue : une seule reco, trancher les évidences, signaler la décision douteuse (meilleure option en premier).
- **Maquette / questions AVANT code** dès qu'il y a un doute d'interface (`LECONS` section 10).
- **Décisions** : lister celles qui restent, avec pour chacune le contexte, l'importance, une recommandation. Analyser chaque solution, la critiquer, désigner la moins risquée. Si une seule solution répond vraiment, l'appliquer et faire un court retour.
- **Jamais de refus silencieux** (`LECONS` Règle 9) : dès qu'une demande semble entrer en conflit avec une décision/règle existante, le dire.
- **Tenir une liste explicite des engagements** dans une longue conversation (`LECONS` Règle 6).
- Répondre en **français uniquement**.

## 6. Fichiers de référence à lire d'abord

- `docs/LECONS_A_NE_PAS_REPRODUIRE.md` (intégral).
- `docs/TRAVAILLER_AVEC_DENIS.md`.
- `docs/TACHES_VALIDEES.md` (chercher le module et ses dépendances).
- `docs/PAGES_INTRODUCTION_MODULES_RECUEIL.md` (§2 structure canonique, §3 texte validé du module, §4 pour Repères / Cohérence).
- `docs/IDEES_A_RECLASSER.md` (idées de fonctions pour ce module - exploitables seulement, jamais des boutons vides ; toute idée reprise se montre à Denis avant, avec le pourquoi/comment).
- L'exemple fait : `docs/CONSOLIDATION_BILAN_PLAN_2026-08-29.md` + `docs/MAQUETTE_BILAN_PARCOURS_CONSOLIDE_2026-08-29.html`.
- Les 2 modules « modernes » de référence visuelle : « Cohérence de mon dossier » (`modules/coherence-transversale/ui.js`) et « Mes Repères » (`modules/reperes/index.js`).

---

## 7. LE MODULE À REFONDRE (à remplir par Denis)

> **Module : _______________________**
>
> (facultatif) Points d'attention particuliers pour ce module : _______________________

**Première action attendue de l'assistant** : lire les fichiers de référence, puis produire l'**inventaire fonctionnel complet du module par lecture directe du code** (étape 1 + 2 de la méthode), et le présenter avant toute maquette.
