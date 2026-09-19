# Audit de stabilisation : carte « Outils d'analyse » (3 parcours)

Audit en lecture seule (aucun fichier de code modifié), mené le 2026-09-13, quatrième carte du chantier de stabilisation générale après « Mes documents », « Me préparer à candidater » et « Boîte à outils ». Périmètre : les 3 parcours de la carte d'accueil « Outils d'analyse » : **Analyser ma candidature** (Bilan de candidature), **Cohérence de mon dossier** (Cohérence transversale), **Les mots de votre CV** (ATS).

Méthode identique aux audits précédents : passes indépendantes par lecture directe du code, écran par écran, avec vérification navigateur en direct pour ATS (construction réelle d'un prompt, test du parseur avec un extrait fabriqué pour vérifier le garde-fou anti-hallucination).

## Verdict d'ensemble

**Aucune anomalie bloquante trouvée sur les 3 parcours.** C'est la carte la mieux tenue des quatre auditées à ce jour : ce sont les trois modules les plus anciens et les plus repassés (Bilan « clos » depuis le 2026-08-30, Cohérence « terminée » depuis le 2026-08-25, ATS clos depuis le 2026-09-08), et ça se voit dans le code. Le Bilan en particulier a servi de patron pour corriger le bug de navigation Retour dans 8 autres modules du projet. Les 854 tests existants passent tous, `checkLexique.js` est propre.

7 écarts relevés, tous gênants ou mineurs.

---

## Analyser ma candidature (Bilan)

### 1. Couleurs de message figées sur les écrans les plus anciens du module (gênant, dette déjà connue)
- **Écrans** : génération de formulations en lot (Carte 2/3) et fenêtre d'amélioration 1:1.
- **Fichier** : `js/app.js:21754-21955` et alentours.
- Les écrans modernisés en 2026-08-30 (diagnostic) utilisent déjà `var(--danger)`/`var(--accent)`, theme-aware. Les écrans de génération en lot, plus anciens, gardent des couleurs hexadécimales en dur (`#b91c1c`, `#157347`, `#0d6efd`, `#FFF7ED`). Fait partie de la dette transverse **B.12** déjà consignée dans `BRIQUES_COMMUNES.md` (46 occurrences), pas corrigé au coup par coup ici.
- **Angle mort de comptage repéré** : le style inline statique posé directement dans un gabarit HTML (`style="display:none;color:#b91c1c;"`, `js/app.js:21760`) échappe au grep de comptage de B.12 (`\.style\.color\s*=\s*['"]#`), qui ne détecte que les affectations JS. À élargir le jour où cette dette est traitée.

### 2. Aide contextuelle : ne couvre qu'un tiers du parcours réel (mineur, déjà documenté comme optionnel)
- 3 entrées seulement (présentation, écrans de diagnostic, choix d'assistant) sur les 9 écrans du parcours réel. Rien sur l'écran « Preparer » (le plus dense en choix), le rapport, ni les écrans de correction/assistance/clôture.

### 3. `wireChoixAssistantBilanEtapes()` : fonction devenue no-op, conservée à dessein (mineur, sans impact)
- Commentaire explicite en tête de fonction : plus rien à câbler depuis une refonte visuelle. Vestige documenté, pas un bug.

---

## Cohérence de mon dossier

### 4. Aide contextuelle de l'écran de collecte : morte ET désynchronisée du DOM actuel (mineur)
- **Fichier** : `js/app.js:33966-33973` (`AIDE_FENETRES['coherence-transversale-collecte']`).
- Double défaut cumulé : le sélecteur `#ctChampLettre` référencé n'existe plus dans le DOM (la lettre se dépose désormais via un bouton qui ouvre `ouvrirAssistantDepotCV()`, depuis le chantier du 2026-09-04) **et** la clé `'coherence-transversale-collecte'` elle-même n'est jamais posée comme `dataset.aideContexte` nulle part dans le dépôt : cette entrée est structurellement injoignable, un mort-vivant dans `AIDE_FENETRES`.

### 5. Mêmes couleurs de message figées (gênant, dette déjà connue)
- 8 occurrences supplémentaires (`ui.js`, lignes 632, 1150, 1582, 2201, 2208, 2263, 2432, 2439, 2533) confirmées présentes, même dette B.12, même traitement différé.

### 6. `ctRevenirALaPresentation()` : fonction morte, conservée à dessein (mineur, sans impact)
- Jamais appelée depuis le correctif « boucle Retour » du 2026-09-09, remplacée par `ctRetour()`. Le code documente lui-même pourquoi elle est gardée (référence du mécanisme, jamais à réutiliser). Vestige, pas un bug.

---

## Les mots de votre CV (ATS)

### 7. Le bloc « La référence » se referme après chaque choix (gênant)
- **Écran** : Préparer.
- **Fichier** : `modules/ats/index.js:301` (état « ouvert » figé à `false`).
- **Reproduit en navigateur** : après avoir choisi « Je n'ai pas d'offre » ou une fiche métier, le bloc se referme (l'écran entier est reconstruit, sans jamais transmettre l'état ouvert/fermé précédent). Le bouton suivant qui vient d'apparaître (« Choisir une fiche métier ») reste invisible tant qu'on n'a pas recliqué sur l'en-tête. Pour le public cible, un clic « sans effet apparent » peut faire croire à un problème.

### 8. Trois tirets cadratins dans le texte produit par le module (gênant)
- **Fichiers** : `modules/ats/index.js:337` (gloss visible à l'écran en permanence), `:763` (texte envoyé à « Mes Repères »), `:949` (titre de la fiche copiée/imprimée, donc **exportée hors de l'application**).
- Confirmé localisé à ces 3 lignes seulement (rien dans `resultatParser.js`, `detectionTexteCache.js`, ni `pageIntroAts()`).

### 9. `.ats-num` sans aucune règle CSS (mineur)
- **Fichier** : `modules/ats/index.js:336`. Les numéros « 1 »/« 2 »/« 3 » des blocs dépliables de « Préparer » s'affichent en texte brut, sans la pastille dessinée qu'utilise le langage visuel commun pour les étapes numérotées ailleurs dans l'application.

### Documentation à corriger (hors code)
- `docs/BRIQUES_COMMUNES.md:95` dit encore « ATS et Regard recruteur pas encore construits (pages d'intro seules) », faux depuis la clôture du 2026-09-08.
- `CLAUDE.md` dit qu'ATS n'a pas d'aide contextuelle « comme ses modules frères » : en réalité `AIDE_PAGES.ats` existe (3 entrées génériques, même niveau que Regard recruteur/Comparer mes pistes), nuance à apporter plutôt qu'une vraie erreur.

---

## Ce qui a été vérifié en profondeur et confirmé sain

- **Aucun bouton mort** sur les 3 parcours (hors le cas particulier du finding 7, qui referme un bloc plutôt que de ne rien faire).
- **Navigation Retour** : saine sur les 3 modules. Le cas Bilan a même servi de patron (drapeau `_etatBilan.voirIntro` distinguant détour volontaire et vrai recul) repris dans 8 autres modules. Le cas Cohérence, encore noté « pas isolé précisément » dans `docs/ETAT_DES_CHANTIERS_2026-08-24.md` ligne 78, est en réalité corrigé depuis le 2026-09-09 (la ligne 84 du même document le confirme) : formulation orpheline, pas un reflet de l'état réel.
- **Fidélité prompt ↔ écrans ↔ parseur** : vérifiée placeholder par placeholder et champ de schéma par champ de schéma sur les 3 modules. Pour Cohérence, les deux prompts (1er diagnostic + entretien avancé) sont tous deux synchronisés avec leurs parseurs respectifs. Pour ATS, vérifié en construisant un vrai prompt à partir d'un état de session réel du navigateur : aucun placeholder résiduel.
- **Cœur de chaque module intact** : pour le Bilan, transmission complète du CV/offre/entreprise/situation, confirmée jusqu'au prompt. Pour Cohérence, les 3 documents (CV, lettre, entretien) sont bien tous les trois collectés et transmis, contrairement à ce qui s'était révélé cassé sur un autre module lors d'un audit précédent. Pour ATS, le garde-fou anti-hallucination du parseur a été testé en direct avec un extrait fabriqué non présent dans le CV soumis, correctement écarté.
- **Confidentialité** : le Bilan a une double protection (bouton désactivé + revérification indépendante côté construction du prompt) contre l'envoi d'un CV non relu.
- **Jamais un score, jamais un logiciel de tri** (ATS) : vérifié exhaustivement dans tous les textes d'écran et dans le prompt, règle absolue respectée partout, y compris une FAQ dédiée qui l'explique à la personne.
- **Mode sombre** : propre sur ATS (aucune couleur en dur, vérifié en navigateur sur les 6 écrans et la fenêtre de vérification/masquage partagée) ; propre sur Bilan et Cohérence en dehors du motif déjà connu B.12.
- **Français / non-négociables** : aucune icône à visage, jamais le mot « IA » visible, sur les 3 modules. Les tirets cadratins présents dans les 3 prompts (`bilan-v1.md`, `coherence-transversale*.md`) sont un texte technique adressé à un assistant externe, motif identique sur les 24 fichiers `prompts/*.md` du dépôt (y compris des prompts déjà relus et clos) : traité comme une convention établie du projet, pas une anomalie propre à ces modules.
- **Umami** : couverture dense et cohérente sur les 3 modules, aucun trou apparent.
- **Briques communes** : les 3 modules sont de bons consommateurs des briques communes (B.1, B.2, B.4, B.5). La seule dérogation documentée (Cohérence garde 2 pages séparées + une fenêtre au lieu du schéma « tout sur une page » de Reformuler-CV, dette B.10) est déjà connue et assumée « au fil de l'eau ».
- **Tests** : 38 fichiers dédiés au Bilan, 16 à Cohérence, 3 à ATS. `npm test` : 854/854 verts sur les 3 modules confondus avec le reste du dépôt.

## Recommandation de traitement

Comme pour les cartes précédentes, je propose de corriger dans la foulée les findings 4 (aide morte Cohérence, à réparer ou retirer), 7, 8 et 9 (ATS). Les findings 1/5 (couleurs de message, déjà comptés dans B.12) restent différés vers le passage dédié déjà planifié, avec la note sur l'angle mort de comptage ajoutée à B.12. Les findings 2, 3 et 6 (aide partielle, fonctions mortes documentées) sont des vestiges assumés : rien à corriger.
