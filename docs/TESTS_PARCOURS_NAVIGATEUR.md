# Essais de parcours rejouables (navigateur intégré)

Écrit le 2026-09-30. Outil de développement : **Claude le lance lui-même avant de livrer une correction**, pour que Denis n'ait plus à rejouer à la main les mêmes parcours.

## Lancer

Serveur de dev démarré (`site-v2-python-server`), page fraîchement rechargée, dans le navigateur intégré :

```js
eval(await (await fetch('/scripts/parcours/parcours_smoke.js')).text());
window.__fin = null; window.__parcours().then(r => window.__fin = r);   // ~40 s, attend seul que l'application soit chargée
// puis lire window.__fin : { ok, nbOk, nbEchecs, echecs, tout }
```

Un seul parcours : `window.__parcours(['bilan'])` (identifiants : `bilan`, `comparer`, `decouverte`, `prompts`).

## Ce qui est couvert (70 vérifications au 2026-09-30)

- **Bilan, écran « Préparer »** : plus de bloc « Relire et masquer », un texte collé ouvre la relecture, validation, annulation, CV de l'application non relu, CV déjà relu venant de Cohérence.
- **Comparer mes pistes** : les cinq envois (Collecter, Détection, Côte à côte affiné, Dans le temps, Aller plus loin) avec assistant simulé : choix, confirmation, « chez l'assistant », retour, collage, réponse invalide puis valide, « Retour » pas à pas, bouton Perplexity.
- **Découverte** : l'import applique les propositions et termine le parcours.
- **Prompts** : ligne directrice des 7 situations dans le profil (CV, lettre, entretien) et dans Reformuler ; fragment « voix humaine » chargé partout.

## Ce qui n'est PAS couvert (reste à un vrai essai)

Le vrai presse-papiers, la vraie ouverture de l'assistant, le contenu réel des réponses, le rendu à l'œil (CV, mode sombre), la vraie souris dans le grand aperçu.

## Règles

- Les parcours **modifient le dossier en cours** (données de test) : jamais sur une vraie session de Denis.
- **Un défaut corrigé = un essai ajouté** dans `scripts/parcours/parcours_smoke.js` (fonction `cas(nom, condition, détail)`), dans le même commit.
- Pour le rendu du CV, l'outil de non-régression est le **banc de rendu** `scripts/rendu/banc.js` (registre : `scripts/rendu/registre.json`, mode d'emploi en tête du fichier, essai `banc` de la suite). L'ancien `scripts/word/banc_b7.js` est périmé.

## Banc de rendu du CV : un piège (2026-10-01)

Les empreintes **Word** du banc (`scripts/word/banc_b7.js`) dépendent de la **largeur de la fenêtre du navigateur intégré** : après un `resize_window`, ou si la fenêtre a changé de taille, tous les modèles changent côté Word alors que les empreintes PDF restent identiques. Toujours comparer **dans la même taille de fenêtre** ; en cas de doute, comparer le plan Word d'un modèle avant et après (`git stash`) sur une page neuve, avec la même suite d'actions (l'état d'un modèle précédent se propage sinon).

## Inventaire « bouton x modèle » du panneau « La mise en page » : rejoué le 2026-10-01

Rejoué sur 25 modèles, 2 259 réglages cliqués (`scripts/word/matrice_options.js`, ~100 minutes) : **0 erreur JavaScript**, taux de « dérive » identique à celui du 2026-09-29 (25 %, artefact de mesure : un deuxième clic ne remet pas toujours la page à l'octet près). 19 réglages cliquables sans effet trouvés, tous **grisés depuis** (`cvPdfOptionsParModele.js`) : « Blocs courts » sur les 12 modèles à deux colonnes propres, « Dates à la même place » sur 5 modèles qui placent eux-mêmes leurs dates, « Couleur du texte » et « Dégradé du bandeau » sur Sobre Rectangles. Résultat brut : `scripts/word/resultats_matrice/matrice_2026-10-01.json`.
Un inventaire fait APRÈS le grisage ne voit plus les réglages déjà grisés : le fichier de données ne se régénère donc plus depuis zéro, il se **fusionne** (`node scripts/word/matrice_fusion.js <nouveau.js>`).
Vérifiés aussi le même jour : retour au modèle de départ (7 modèles, revient à l'octet près), aller-retour sauvegarde puis restauration d'une session (4 modèles, identique), mode sombre (393 textes, 0 contraste insuffisant), largeur de téléphone (aucun débordement du panneau).

## Suite complète par lots (2026-10-11)

La suite complète (`__parcours()` sans argument, 96 essais) ne se lance pas d'un bloc : l'état du panneau et du stockage d'un essai fausse le suivant, et la durée dépasse la limite d'un appel. **Procédure** : fenêtre de 738 x 698, puis pour chaque lot de 5 ou 6 essais : vider `localStorage` et `sessionStorage`, recharger la page, attendre `typeof dossier !== 'undefined'`, charger `parcours_smoke.js`, lancer le lot, suivre l'avancement avec `window.__parcoursCourant` et attendre `window.__fini`. Les essais lents (60 s chacun) : `dispoComp`, `carteComp`, `carteForm`, `infosEntete`, `enteteDecale`, `coordEnLigne`, `tirageStandard`. L'essai `banc` se lance seul. Premier passage complet réussi le 2026-10-11 (hors `banc`).

**Défaut connu corrigé le 2026-10-11** : `enteteDecale` échouait sur deux contrôles (Ruban diagonal et Diagonales contrastées avec photo : 35,5 % pour un plafond de 35 %). Le plafond datait d'avant l'agrandissement voulu des en-têtes (2026-10-07) ; il est maintenant de 36 %. Plus aucun défaut connu dans la suite.

**Pièges constatés le 2026-10-11** : (1) l'onglet de test doit être AU PREMIER PLAN (`tabs_select`) : si une autre page (une maquette) a été ouverte au premier plan, `window.scrollTo` ne défile plus et l'essai `annulerCouleur` (« l'écran ne remonte pas ») échoue à tort ; (2) un essai qui clique « Voir tous les modèles » doit remettre `_mepGalerieTous = false` et `_mepGalerieChoix = null` à la fin, sinon `looksFamilles` échoue (les essais bordColonne, bordBandeau, autresCouleurs et repriseCouleurs le font).
