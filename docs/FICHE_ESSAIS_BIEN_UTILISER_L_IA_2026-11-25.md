# Fiche d'essais : « Bien utiliser l'IA », les modèles jamais essayés (25/11/2026)

Pour Denis. Objectif : essayer chaque modèle jamais essayé avec une vraie réponse d'un assistant en ligne, juger la réponse, et noter ce qui doit être corrigé dans la demande. Vous jugez et vous corrigez les phrases vous-même (consigne 532) : je ne touche pas aux demandes sans votre accord.

Chaque essai se note en trois mots : **OK** (rien à changer), **À CORRIGER** (une phrase à changer, notez laquelle), **À REVOIR** (le modèle ne fait pas ce qu'on attend).

## 0. Préparer (une fois)

1. Ouvrez l'application sur le serveur de test (port 8123), page d'accueil, puis la tuile « Bien utiliser l'IA » de la Boîte à outils. Le module est ouvert : aucune ligne à coller dans la console.
2. Ouvrez un assistant en ligne dans un autre onglet (ChatGPT sans compte, ou celui que vous voulez comparer).
3. Pour chaque essai : choisissez le modèle, remplissez avec les **textes fictifs** ci-dessous (jamais de vraies données de personne), copiez la demande avec le bouton « Copier », collez-la dans l'assistant, lisez la réponse.
4. Pendant vos essais, je n'écris rien dans le dépôt : vos remarques, dites-les-moi dans le chat.

## Ce qui se vérifie à chaque essai

- La demande copiée est-elle claire et complète, sans phrase qui vous gêne ?
- La réponse reste-t-elle dans ce qui a été collé, sans rien inventer (dates, noms, chiffres, diplômes) ?
- Le ton est-il simple et rassurant, sans jargon ?
- Le résultat est-il utilisable tel quel, ou presque ?
- Pour les modèles « professionnels » : aucun nom, aucune donnée personnelle dans la réponse.

## Les essais, dans l'ordre conseillé

### 1. Modèle 1, variante « Demander un stage ou une immersion » (nouvelle)

Texte fictif : « Je m'appelle Camille. Je cherche une immersion de deux semaines dans une boulangerie pour voir si le métier me convient. Je suis disponible à partir du 5 janvier. J'ai déjà travaillé en rayon boulangerie dans un supermarché. »
À regarder : le mail demande bien une immersion (et non un emploi), propose les dates, ne promet rien qui n'est pas écrit.

### 2. Modèle 2, « Relire mon CV face à une offre »

Texte fictif : un CV de quelques lignes (deux expériences, une formation) et une offre d'agent d'entretien. À regarder : points forts et points à améliorer, sans note, sans phrase du type « vous n'avez aucune chance ».

### 3. Modèle 3, « Préparer un entretien » (deux variantes)

Essayez « m'entraîner aux questions », puis « expliquer un trou dans mon parcours » (par exemple deux ans sans emploi pour garder un proche). À regarder : la réponse propose des formulations honnêtes, sans inventer d'activité.

### 4. Modèle 4, « Comprendre un courrier reçu » (courriers A et B)

Reprenez les deux courriers fictifs déjà préparés pour ce modèle (A puis B). À regarder : « ce que je dois faire » et « pour quand » sont bien séparés, aucune date inventée, rien de juridique ni de conseil de recours.

### 5. Modèle 6, « Écrire un mail clair et poli » (variantes répondre, relancer, refuser, s'excuser d'un retard)

Un essai au moins avec « refuser » et un avec « s'excuser d'un retard ». À regarder : poli sans être plat, court, aucun fait inventé.

### 6. Modèle 7, « Reformuler ou résumer un texte » (plus simple, plus court, plus posé)

Collez un paragraphe administratif fictif de huit à dix lignes. À regarder : le sens ne change pas, aucun chiffre ni date n'est modifié.

### 7. Modèle 8, « Me faire expliquer un mot ou un document », variante « Un formulaire, case par case » (nouvelle)

Texte fictif : le titre et les intitulés d'un formulaire **vide** (nom, date, situation, revenus). Ne collez jamais un formulaire déjà rempli. À regarder : chaque case est expliquée, rien n'est rempli à votre place, aucune information personnelle n'est recopiée.

### 8. Modèle 10, « Synthèse de notes d'entretien » (pour les professionnels)

Notes fictives de dix lignes, sans nom. Essayez « sans noms » puis « fidèle au texte ». À regarder : aucune interprétation sur la personne, aucun diagnostic, rien d'ajouté.

### 9. Modèle 11, « Compte rendu ou bilan »

Notes fictives et, pour la variante « gabarit de la structure », un gabarit fictif de trois titres. À regarder : le gabarit est respecté, ton neutre, pas de jugement.

### 10. Modèle 12, « Passer un document en langage simple »

Un texte fictif de type règlement intérieur ou convention. À regarder : phrases courtes, mots courants, aucun sens perdu ni ajouté.

### 11. Modèle 13, « Préparer un atelier » (nouveau)

Thème fictif : « Préparer un entretien d'embauche », public : six personnes en recherche d'emploi, durée : 2 h. Essayez « le déroulé » puis « des exercices à faire en groupe ». À regarder : durées cohérentes avec 2 h, exercices réalisables sans matériel particulier, aucun nom, case « noms retirés » bien présente.

## Après vos essais

Dites-moi dans le chat, pour chaque modèle : OK, À CORRIGER (avec la phrase) ou À REVOIR. Je corrige ce que vous validez, je relance `npm test`, et je note les résultats dans le dépôt une fois vos essais terminés.
