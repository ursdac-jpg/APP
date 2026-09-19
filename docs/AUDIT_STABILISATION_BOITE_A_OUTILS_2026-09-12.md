# Audit de stabilisation : carte « Boîte à outils » (4 parcours)

Audit en lecture seule (aucun fichier de code modifié), mené le 2026-09-12, troisième carte du chantier de stabilisation générale après « Mes documents » et « Me préparer à candidater ». Périmètre : les 4 parcours de la carte d'accueil « Boîte à outils » : **Découvrir mes compétences**, **Mes Repères**, **Mon Carnet**, **Lexique**.

Méthode identique aux deux audits précédents : passes indépendantes par lecture directe du code, écran par écran, croisées avec les documents de suivi existants et, pour le Lexique, une vérification en navigateur (clair et sombre).

## Verdict d'ensemble

**Aucune anomalie bloquante trouvée sur les 4 parcours.** C'est la première carte des trois auditées à ce jour sans aucun point bloquant. 15 écarts gênants ou mineurs relevés, tous des corrections locales et sûres.

Le point le plus intéressant (finding 1, Découvrir mes compétences) n'est pas un bug visible pour la personne : un mécanisme de questions ciblées « formation »/« engagement », construit et retouché sur plusieurs mois, s'est révélé être du code mort depuis sa toute première version, à cause d'une ligne de normalisation qui ramène silencieusement ces deux types à du texte libre. Rien n'est perdu (l'information atterrit quand même, en texte, dans le profil transmis à l'assistant), mais la structuration plus fine construite pour ces cas ne s'est jamais déclenchée.

---

## Découvrir mes compétences

### 1. ~~Les questions ciblées « formation »/« engagement » sont du code mort depuis l'origine~~ : CORRIGÉ EN COURS D'AUDIT, ce n'était pas un bug
- **Ce que l'agent d'audit avait vu** : `modules/decouverte-competences/decouverteParcours.js:1616-1623` ramène silencieusement tout type autre que `'date'` en `'texte'`, alors qu'une UI et une écriture structurée existent pour `formation`/`engagement` ailleurs dans le même fichier.
- **Ce que j'ai vérifié avant de corriger** (lecture complète de `prompts/decouverte-competences.md`, section « Questions ciblées », ligne 113) : le prompt actuel est explicite, **seuls deux types existent aujourd'hui** : « `"date"` pour toute question relevant de la condition 4... `"texte"` pour toutes les autres ». La section « Jamais de question sur un certificat, un diplôme ou une formation obtenue » (ligne 32-34) explique pourquoi : cette information est recueillie ailleurs dans le parcours (écran dédié « Informations complémentaires »), une question ciblée ferait doublon. Ce n'est pas un oubli, c'est une décision de simplification déjà actée et documentée.
- **Conclusion** : la ligne 1621 de `decouverteParcours.js` est donc **correcte**, pas un bug. J'ai testé une correction qui élargissait le type, l'ai vérifiée fausse avant de la committer, et je l'ai retirée. Le mécanisme dédié `formation`/`engagement` (UI + écriture structurée) reste bien du code mort, mais volontairement inatteignable par construction du prompt actuel, pas par accident : sa suppression est un nettoyage possible mais non urgent, pas une correction de bug.

### 2. Le prompt cite encore le type « formation » dans son exemple JSON, alors qu'il ne devrait plus jamais sortir (gênant, corrigé)
- **Fichier** : `prompts/decouverte-competences.md`, exemple JSON.
- **Problème réel** : l'exemple `{ "texte": "...", "fragmentIndex": null, "type": "formation" }` contredisait la règle du format (seuls `date`/`texte` valides, ligne 113) et la section « Jamais de question sur... une formation » (ligne 32-34). Risque que l'assistant suive l'exemple plutôt que la règle en prose. Ligne d'exemple retirée.

### 3. Le bouton « Je valide cette expérience » perd sa cohérence sombre dès la première interaction (gênant)
- **Fichier** : `modules/decouverte-competences/decouverteParcours.js:1857,1860` (`recalculerBoutonValider`).
- **Problème** : le rendu initial du bouton utilise bien les jetons de thème (correct en mode sombre), mais `recalculerBoutonValider()`, appelée à chaque interaction (case cochée, texte modifié), réécrit le style avec des couleurs figées (`#0d6efd`/`#CBD5E1`, `#FFFFFF`/`#475569`). Correct au chargement, cassé dès qu'on touche à l'écran : le genre de défaut qu'un simple contrôle visuel au chargement ne détecte pas.

### 4. Deux gabarits partagés de l'écran « Compléter mon CV » sans variante sombre (gênant)
- **Fichier** : `modules/decouverte-competences/decouverteParcours.js:2316,2324` (carte verte de confirmation, 4 catalogues) et `:2759` (bandeau « explorer un catalogue », 4 fois sur le même écran).
- Couleurs figées (`#F0FDF4`/`#86EFAC`, `#F0F6FF`/`#BFDBFE`), aucune règle `[data-theme="sombre"]`. Écran très fréquenté (dernière étape du parcours, avant chaque CV produit).
- Les couleurs de message figées de ce module (`#b91c1c`/`#157347`) relèvent déjà de la dette transverse B.12 consignée dans `BRIQUES_COMMUNES.md` : pas reprises séparément ici.

### 5. Logique pure du module intégralement non testée (gênant, en partie corrigé)
- 6 des 7 fichiers du module (`decouverteAnalyse.js`, `decouverteMapping.js`, `decouverteClassification.js`, `decouverteRaffinement.js`, `decouverteStrategie.js`, `decouverteMoteur.js`) sont des fonctions pures, sans aucune dépendance DOM, mais aucun test Node ne les couvre. Le plus gros module de l'application (5813 lignes), destiné au public le plus éloigné de l'emploi, roule entièrement sans filet.
- **21 tests ajoutés** (`tests/decouverteLogique.test.js`), ciblés sur la logique la plus critique plutôt qu'exhaustifs sur les 1476 lignes pures des 6 fichiers : parsing complet de la réponse assistant (`analyserReponseDecouverte`, y compris le repli automatique de question de date et le cas « saisie inexploitable »), validation d'une compétence (`competenceEstValide`, garde-fou « jamais sans preuve »), machine à états du raffinement (`_decouverteTransitionner`, vérifie qu'on ne peut jamais dépasser 2 tours ni revenir en arrière), choix du type de CV (`determinerTypeCV`/`calculerScoresStrategies`). `decouverteMapping.js` et `decouverteMoteur.js` restent non couverts (le premier dépend fortement de `dossier`, le second n'est qu'un orchestrateur try/catch autour des autres) : dette résiduelle assumée, pas oubliée.

### 6. ~~`etapePreparer` ignore le garde-fou de blocage de « Ce que vous visez »~~ : PAS UN BUG, vérifié avant correction
- **Fichier** : `modules/decouverte-competences/decouverteParcours.js:4179-4180, 4218-4222`.
- L'agent d'audit avait vu `acc.peutContinuer`/`acc.raisonBlocage` calculés mais jamais lus par `etapePreparer()`, et l'avait lu comme un oubli de la fusion du 2026-08-31. En relisant le rendu réel avant de corriger : la section 3 est explicitement étiquetée **« facultatif »** (ligne 4218) et porte un encart qui rassure la personne (« Vous ne savez pas encore quoi viser ? C'est très fréquent... Laissez cette partie de côté », ligne 4207). Rendre la section bloquante irait à l'encontre de ce texte, écrit et affiché volontairement. Rien à corriger.

### 7. Code mort issu de la fusion des écrans (mineur, reporté)
- 5 handlers `onContinuer` (`etapeAccueil`, `etapeIdentite`, `etapeRecit`, `etapeDecouverte`, `etapeQuestionsCiblees`) ne sont plus jamais invoqués depuis la fusion en 5 écrans du 2026-08-31 : `etapePreparer()`/`etapeCompetences()` ont leurs propres `onContinuer`.
- **Non corrigé volontairement** : nettoyage à faible valeur (mineur, aucun effet visible) dans un fichier de 5813 lignes sans filet de tests (voir finding 5). Je préfère ne pas toucher à cette partie tant que la couverture de tests n'existe pas, plutôt que de risquer une suppression mal ciblée dans un module que je ne maîtrise pas encore assez finement.

### Documentation à mettre à jour (pas de code)
- `docs/CONSOLIDATION_DECOUVERTE_PROPOSITION_2026-08-31.md` s'intitule encore « proposition à valider, pas une implémentation » alors qu'elle est entièrement implémentée depuis cette date. Le module n'apparaît non plus dans aucune liste « Chantiers clos » de `CLAUDE.md`, malgré un travail substantiel déjà terminé (consolidation, alignement IA, page Action adaptée).

---

## Mes Repères et Mon Carnet

### 8. Aide contextuelle « Mes Repères » décrit un mécanisme supprimé depuis le 2026-08-25 (gênant)
- **Fichier** : `js/app.js:33792-33793`.
- Le texte parle encore de marquer un Repère « prêt à en parler » ou « déjà discuté » avec le conseiller. Ce mécanisme (état privé/partagé + badge « Discuté ») a été retiré du code le 2026-08-25 (commentaire explicite dans `modules/reperes/index.js:613-622` : jugé un défaut de conception, aucun usage réel trouvé, retiré entièrement). L'aide promet un geste que l'écran ne propose plus.

### 9. Aide contextuelle « Mon Carnet » : même mécanisme fantôme + libellé de bouton périmé (gênant)
- **Fichier** : `js/app.js:33805, 33807`.
- Même phrase fantôme sur « prête à en parler avec votre conseiller » pour la transformation en Repère. Et le texte dit encore que le bouton de capture s'appelle « Garder », alors qu'il affiche « + Noter » depuis la refonte du 2026-09-09.

### 10. Logique pure des deux modules non testée et non exportable (gênant)
- Ni `modules/reperes/index.js` ni `modules/carnet/index.js` n'ont de `module.exports` ni de test dédié, alors que plusieurs de leurs fonctions sont pures et facilement testables (`_reperesExtraitPourTitre`, `_carnetTexteValide`, `_carnetDateRelative`...). Écart avec le patron déjà en place pour des modules voisins de complexité comparable (ATS, Regard recruteur).

### Point à trancher, pas une anomalie : tranché par défaut, à confirmer
- **Asymétrie de suppression entre les deux modules jumeaux** : Carnet offrait un filet de rattrapage de 10 secondes (« Note supprimée. Annuler ») après confirmation ; Repères non, seulement la confirmation. Tu n'as pas répondu explicitement à ma question : j'ai choisi par défaut d'harmoniser (ajouter le même filet à Repères), le sens le plus sûr pour le public de l'application (protection en plus, jamais en moins). Si tu préfères revenir à l'asymétrie d'origine, dis-le-moi.

---

## Lexique

### 11. Défilement jamais réinitialisé lors de la navigation interne (gênant)
- **Fichier** : `modules/lexique/index.js`, toutes les fonctions `_lexiqueAfficher*` sauf le Mode Livre.
- **Reproduit en navigateur** : ouvrir une fiche, défiler vers le bas, cliquer « Retour » : l'écran d'accueil se réaffiche à la même position de défilement que la fiche quittée, donc visuellement tronqué sous les icônes fixes du haut. Un défilement manuel répare l'affichage, mais rien ne le déclenche automatiquement. Par choix d'architecture, le Lexique change d'écran par remplacement direct du contenu plutôt que par `naviguerVers()` (qui, lui, réinitialise toujours le défilement), donc ce cas particulier y échappe.
- Pour un public en fragilité numérique, un écran qui semble coupé juste après un clic « Retour » peut faire croire à une erreur.

### 12. Aide contextuelle périmée depuis la refonte de l'accueil du 2026-09-09 (gênant)
- **Fichier** : `js/app.js:33819-33820`.
- Le texte parle encore du bouton « Voir les collections et parcours » (renommé « Voir tous les thèmes ») et d'un Mode Livre « classé par thème » (devenu une liste alphabétique A à Z depuis la refonte). Le nouvel écran « Parcourir par domaine », ajouté à la même refonte, n'a aucune entrée d'aide dédiée.

### 13. Un tiret cadratin dans le contenu d'une fiche (mineur)
- **Fichier** : `data/lexique.js:4244` (fiche « Aptitude ou inaptitude ? », accordéon « En savoir plus »).
- Seule occurrence dans les 4801 lignes du fichier.

### 14. Logique pure du Lexique non couverte par les tests Node (mineur)
- `_lexiqueRechercher` et les fonctions d'indexation sont pures, mais `modules/lexique/index.js` n'est chargé par aucun test. Écart avec le standard suivi par les modules plus récents.

---

## Ce qui a été vérifié en profondeur et confirmé sain

- **Aucun bouton mort** sur les 4 parcours.
- **Navigation Retour** : saine partout, y compris le piège documenté « boucle infinie » de Découverte (LECONS section 2, correctif du 2026-09-09 confirmé), et RC-03 reconfirmé réglé sur les 4 parcours.
- **Découvrir mes compétences** : respecte bien son rôle réel (construire un CV de zéro à partir d'un récit, jamais une exploration abstraite déconnectée) ; le récit est transmis en entier sans troncature ; la sortie écrit dans les mêmes champs que le parcours classique, donc Lettre/Entretien/Bilan fonctionnent normalement sur un CV issu de ce module ; confidentialité tenue (aucune coordonnée transmise à l'assistant).
- **Mes Repères** : point d'ancrage transversal (« Garder comme Repère ») utilisé par 8 autres modules, une seule vraie implémentation, aucune copie ; fonctionne dans les deux sens (créer depuis Repères, recevoir depuis un autre module, y compris le Carnet) ; persistance automatique via `dossier` (couverte par la disquette sans mécanisme dédié nécessaire).
- **Lexique** : le module le mieux tenu des quatre, architecture documentée et à jour ; recherche interne testée sur chaîne vide, espaces, caractères spéciaux, sans plantage ; recherche bidirectionnelle accueil ↔ Lexique vérifiée dans les deux sens en navigateur ; renvois cross-module récents (Comprendre le cadre) tous valides, aucun lien mort ; `node scripts/checkLexique.js` : 0 erreur, 0 avertissement (343 fiches) ; `npm test` : 809/809 verts.
- **Français / non-négociables** : aucun mot « IA » visible, aucune icône à visage en dehors de l'exception déjà actée par Denis (🧸 sur une collection précise), sur les 4 parcours.
- **Suivi Umami** : présent et cohérent à l'entrée des 4 parcours, événements en aval bien nommés, sans trou ni doublon repéré.
- **Briques communes** : les 4 parcours sont de bons consommateurs des briques communes (choix assistant, barre d'étapes, page d'intro, jetons), aucune ré-implémentation maison trouvée en dehors des écarts de test déjà notés.

## Déjà connu, toujours vrai

- Le pulse de découverte (Repères/Carnet/Lexique, signal visuel à la première visite) et le mécanisme de reprise fonctionnent sans interférer avec la navigation.
- L'exception assumée 🧸 (icône à visage tolérée sur une collection précise du Lexique, décision Denis du 2026-09-09) reste en place, à ne jamais « corriger » par erreur lors d'un futur balayage d'icônes.
- « Mes Repères » reste en attente de retour terrain (conception et implémentation V1 complètes depuis le 2026-08-15), rien à proposer ici sans retour réel.

## Recommandation de traitement

Comme pour les deux cartes précédentes, je propose de corriger dans la foulée les 14 findings de correction directe (1 à 14). Le point 10 (asymétrie de suppression Repères/Carnet) n'est pas une correction mais une vraie question de conception : je te la pose plutôt que de trancher à ta place.
