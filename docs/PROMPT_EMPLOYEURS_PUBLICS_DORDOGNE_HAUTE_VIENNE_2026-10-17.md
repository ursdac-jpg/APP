# Prompt : pages de recrutement des employeurs publics qui manquent (Dordogne et Haute-Vienne)

> Écrit le 2026-10-17. Objectif : compléter le groupe « Fonction publique » de la rubrique « Employeurs qui publient leurs offres ». Déjà présents : Conseil départemental de la Dordogne, Grand Périgueux, Centre hospitalier de Belvès, Académie de Bordeaux, CROUS de Limoges, ministère de l'Intérieur zone Sud-Ouest, La Sécu recrute, ADEME, Agence de l'eau Adour-Garonne, Gendarmerie (CIR de Limoges), CDEF 87 (associatif). **Ma propre recherche sur le web n'a pas donné de pages officielles fiables** (elle renvoie surtout des portails d'offres) : il faut donc le second assistant avec la recherche web, comme pour les agences, puis mon contrôle automatique, puis ton ouverture à la main. Tout candidat part vide de date : rien n'est publié avant ta vérification.
> Pistes relevées par ma recherche, **à confirmer** (non vérifiées) : le portail de candidature du Département de la Haute-Vienne (`recrutement.haute-vienne.fr`), le site du centre de gestion de la Dordogne (`cdg24.fr`), le site du centre hospitalier de Périgueux (`ch-perigueux.fr`), le portail de candidature de la Ville de Limoges (logiciel Gestmax).

## Règle de choix de la page (à rappeler dans le prompt)
La page doit être celle de l'employeur lui-même, ou celle du logiciel de recrutement officiel vers lequel son propre site renvoie. **Pas** les portails généraux (Choisir le service public, emploi-territorial, emploi-collectivites, jobpublic, Indeed...).

## Le message à coller (avec le complément qui marche)

```
@Recherche sur le Web

Je vais te donner une liste d'employeurs PUBLICS de la Dordogne (24) et de la Haute-Vienne (87). Pour chacun, je veux l'adresse de SA page de recrutement (la page où il publie lui-même ses offres d'emploi).

Tu dois chercher UNIQUEMENT sur le site OFFICIEL de l'employeur. La page peut aussi être celle du logiciel de recrutement officiel (par exemple Gestmax, un portail « recrutement.xxx.fr ») SEULEMENT si le site officiel de l'employeur renvoie vers elle : dis alors sur quelle page du site officiel tu as vu ce renvoi.

Règles :
1. N'utilise aucun portail général : Choisir le service public, emploi-territorial, emploi-collectivites, jobpublic, France Travail, Indeed, PagesJaunes, etc.
2. N'invente jamais une adresse. Ouvre la page et lis-la.
3. Si le site officiel n'a pas de page de recrutement, écris "aucune page de recrutement".
4. Si tu ne peux pas ouvrir le site, écris "non vérifiable".
5. Dis si la page affiche des offres aujourd'hui (oui, non, ou "page d'accueil de la rubrique emploi seulement").

Réponds uniquement sous cette forme, une ligne par employeur, sans commentaire :

employeur | département (24 ou 87, ou national) | adresse (https) de la page de recrutement | statut (confirmé, aucune page de recrutement, non vérifiable) | offres visibles aujourd'hui | ce que tu as lu (une phrase)

Si tout ne tient pas dans une réponse, continue avec PARTIE 2, PARTIE 3... jusqu'à la fin de la liste. Ne t'arrête pas avant.

Liste :
DORDOGNE (24) : Centre de gestion de la Dordogne (CDG 24) ; Ville de Périgueux ; Ville de Bergerac ; Ville de Sarlat-la-Canéda ; Communauté d'agglomération Bergeracoise ; Centre hospitalier de Périgueux ; Centre hospitalier de Bergerac (Samuel Pozzi) ; Centre hospitalier de Sarlat ; Centre hospitalier Vauclaire (Montpon-Ménestérol) ; SDIS 24 (sapeurs-pompiers) ; Agence culturelle départementale Dordogne-Périgord ; Direction des services départementaux de l'Éducation nationale de la Dordogne ; Préfecture de la Dordogne ; Direction départementale des finances publiques de la Dordogne.
HAUTE-VIENNE (87) : Conseil départemental de la Haute-Vienne ; Centre de gestion de la Haute-Vienne (CDG 87) ; Ville de Limoges ; Limoges Métropole ; Centre hospitalier universitaire (CHU) de Limoges ; Centre hospitalier Esquirol (Limoges) ; Centre hospitalier de Saint-Junien ; Centre hospitalier de Saint-Yrieix-la-Perche ; SDIS 87 (sapeurs-pompiers) ; Université de Limoges ; Académie de Limoges et DSDEN de la Haute-Vienne ; Préfecture de la Haute-Vienne ; Direction départementale des finances publiques de la Haute-Vienne ; Région Nouvelle-Aquitaine (site de Limoges).
```

## Ensuite
1. Tu colles la réponse ici, telle quelle.
2. Je la contrôle (pages qui répondent, adresses interdites, doublons avec les 20 pages déjà publiées) avec un script du même type que `scripts/verifierRecruteursSas.js`, et je prépare les lignes dans `outils/sas/recruteurs.sas.txt`.
3. Tu ouvres chaque page à la main ; je les ajoute à `offres.txt` avec la date que tu me donnes (famille `portail-officiel`, groupe « Fonction publique »).

## Résultat du premier passage (2026-10-17) et relance Dordogne
- **Haute-Vienne : 8 pages proposées** (Département, CDG 87, Ville de Limoges via Gestmax, Limoges Métropole, Académie de Limoges, Préfecture et DDFiP via les portails des ministères, Région Nouvelle-Aquitaine) : dans `outils/sas/recruteurs_publics.sas.txt`. Contrôle automatique : 6 pages répondent, 1 refusée aux robots (Académie de Limoges), 1 introuvable (Limoges Métropole : adresse `/recrutement` fausse, le site existe). Rapport : `docs/VERIFICATION_RECRUTEURS_PUBLICS_2026-10-17.md`. CHU de Limoges, centre hospitalier Esquirol, Saint-Junien, Saint-Yrieix, SDIS 87 et Université de Limoges : « non vérifiable ».
- **Dordogne : les 14 employeurs ont répondu « non vérifiable »** : à relancer par petits lots (7 puis 7), en ajoutant au début du message : « Chaque employeur public a un site officiel : cherche son nom, ouvre son site, puis cherche une rubrique Emploi, Recrutement ou Nous rejoindre. Si le site renvoie vers un portail de recrutement (Gestmax, e-recrutement...), donne cette adresse en précisant la page du site officiel où tu as vu le renvoi. » Utiliser la même liste de 14 employeurs que ci-dessus.
