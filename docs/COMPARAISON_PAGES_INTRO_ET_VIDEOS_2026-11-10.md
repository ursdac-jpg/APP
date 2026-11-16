# Comparaison des pages de présentation et des vidéos de présentation (10/11/2026)

> Tâche B.1 du plan de reprise (`docs/PLAN_DE_REPRISE_SECOND_COMPTE_2026-11-10.md`). Faite après le retour des pages `-intro` à une seule colonne (consigne 190). Rien n'a été refait : ce document dit ce qui diffère et propose.

## Méthode (et sa limite)

1. Pour chaque vidéo de `videos/modules/` : date de sa fabrication (dernier commit du fichier), puis liste des commits qui ont touché les dossiers du module concerné depuis cette date. Les commits qui ne changent pas un écran (mise à jour de contenu de la veille, bouton « Voir la présentation en vidéo », branchement d'autres vidéos) sont écartés.
2. Pour les vidéos restantes : une planche de six images prise dans la vidéo, comparée à l'écran actuel de l'application (navigateur de test, 1300 px).
3. **Limite** : j'ai regardé les planches de 7 vidéos sur 24 (chiffres, creer-recit, cadre, creer-assistant, reprendre-garder, lettre, competences). Les autres ont été jugées par la liste des commits. Les vidéos sont jouées à 1280 px de large : l'écran qu'elles montrent est celui d'un ordinateur.
4. Les pages `-intro` elles-mêmes (le texte et les cartes) sont en une seule colonne, comme dans les premières images des vidéos : pas d'écart de disposition à ce niveau.

## Écarts réels (à refaire en rejouant le scénario, jamais à la main)

| Vidéo | Écart constaté | Gravité |
|---|---|---|
| `chiffres.mp4` | La vidéo montre l'ancienne disposition : cartes du Smic et de l'inflation côte à côte, petits liens « À lire avec : le mot Smic du Lexique » (retirés le 10/11, consigne 240), bouton « Mots de cette page » en haut. Depuis : nouvelle disposition sur écran d'ordinateur (trimestres par année, six repères du chômage, rubrique « Salaire moyen et salaire médian », textes « Ce que cela veut dire, concrètement », carte inflation à flèches colorées). La voix reste juste (« chaque chiffre est écrit en gros, expliqué, daté, comparé »). | Haute : l'écran n'a plus rien à voir |
| `creer-recit.mp4` | Le bouton « Continuer » est dans la carte, sous le choix de l'objectif ; il est maintenant dans la barre du bas (consigne 208). Les étapes suivantes du parcours ont aussi changé (étape 12 sans doublon, complément, « Quelques précisions » numérotées avec boutons ovales, « Vos appuis »), mais la vidéo s'arrête avant (la voix annonce « l'assistant en tire des expériences et compétences »). Le texte de la page de présentation reste vrai. | Moyenne |

## Écart commun à beaucoup de vidéos

Le bouton « Mots de cette page expliqués dans le Lexique » est en haut de la page dans les vidéos ; il est en bas de page depuis le 10/11 (consigne 218, vérifié : en bas de « Comprendre les chiffres »). Vu sur les planches de : `cadre`, `chiffres`, `creer-assistant`, `creer-recit`. Probablement aussi sur les autres vidéos qui montrent une page de module. Détail visuel sans effet sur ce que dit la voix.

## Vidéos jugées à jour

- `cadre.mp4` : écrans des rayons inchangés ; seules les Nouveautés ont changé, la vidéo ne les montre pas. Seul écart : le bouton « Mots de cette page ».
- `competences.mp4` (module « Découvrir mes compétences », partie documents) : écrans inchangés ; les commits récents concernent le parcours « À partir de mon récit », pas ce module.
- `lettre.mp4`, `reprendre-garder.mp4`, `creer-assistant.mp4` : écrans vus identiques (le « Continuer » est déjà dans la barre du bas) ; seul écart possible : le bouton « Mots de cette page ».
- `employeurs.mp4`, `quifaitquoi.mp4` : seulement des mises à jour de fiches (contenu), pas d'écran changé.
- `lexique.mp4` : deux commits du 10/11 ont touché le Lexique (zone « Mots de cette page », déplacée en bas) ; la vidéo présente ce bouton, **à regarder en premier** si on rejoue les vidéos : l'écart peut être plus visible ici que dans les autres.
- `ats`, `bilan`, `coherence`, `entretien`, `pistes`, `regard`, `ucpm`, `carnet`, `reperes`, `creer-main`, `reprendre-sans`, `reprendre-reformuler`, `pret-lettre`, `pret-entretien` : aucun commit visuel depuis leur fabrication (pas regardées image par image).

## Recommandation (choix à faire par Denis)

1. **Refaire `chiffres.mp4` et `creer-recit.mp4`** en rejouant leurs scénarios (`docs/video_presentation/court/scenarios/module-chiffres.js` et `parcours-creer-recit.js`, procédure dans `docs/video_presentation/court/LISEZMOI.md`). Plus un contrôle du scénario `module-chiffres` : il clique sur les boutons « Vue simple » et « Barres » (sélecteurs à vérifier après les changements d'aujourd'hui).
2. **Ne pas refaire les autres vidéos pour le seul bouton « Mots de cette page »** : c'est un détail, la voix reste exacte. Si Denis y tient : rejouer tous les scénarios (chaque vidéo se refait seule, mais 22 passages d'environ une minute chacun).
3. Attendre la fin des chantiers A.2 et A.3 (page commune de « Créer un nouveau CV », page propre de « Reprendre mon CV » voie 3) avant de toucher aux vidéos `creer-*` et `reprendre-*`, qui seront peut-être déplacées dans ces nouvelles pages.

## Suite faite le 10/11/2026

- `chiffres.mp4` et `creer-recit.mp4` refaites en rejouant leur scénario et remplacées dans `videos/modules/`. Images vérifiées : nouvelle disposition des chiffres ; « Continuer » dans la barre du bas.
- Le scénario `parcours-creer-recit.js` visait l'ancien bouton `#btnContinuerDecouverte` (maintenant caché, recopié dans la barre du bas) : il vise `#btnSuivantNavigation`. Aucune autre vidéo n'a été touchée.
- Reste : les autres vidéos (écart du bouton « Mots de cette page » seulement), `creer-*` et `reprendre-*` après A.2 et A.3.
