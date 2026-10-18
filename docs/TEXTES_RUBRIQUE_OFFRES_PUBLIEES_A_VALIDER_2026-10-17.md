# Textes de la rubrique « Employeurs qui publient leurs offres » (option 2) : À VALIDER PAR DENIS avant le code

> Écrit le 2026-10-17. Rien n'est codé. Ton : simple, rassurant, jamais de diagnostic sur la personne, jamais le mot « IA », aucun tiret long. Principe : on indique où l'employeur publie lui-même ses offres, on ne les recopie pas, et on ne dit **jamais** qu'un employeur recrute chez la personne (seulement « regardez »). Les mots entre crochets sont remplacés par l'application : [département] = « en Dordogne » ou « en Haute-Vienne », [nombre] = le vrai nombre.
> Décision de conception associée : **seules les pages vérifiées à la main** (date de vérification présente) s'affichent, comme pour les fiches d'employeurs.

## 1. La tuile, sur l'écran des secteurs (en tête, avant les secteurs)
- **Titre** : Employeurs qui publient leurs offres
- **Sous-titre** : [nombre] pages d'offres d'emploi à consulter vous-même
- **Pastille** (quand le nombre est petit) : Liste qui grandit petit à petit

## 2. L'écran de la rubrique
- **Titre** : Où voir les offres d'emploi [département]
- **Sous-titre** : Des employeurs publient eux-mêmes leurs offres sur leur propre site. Voici où les trouver.
- **Encart en haut (toujours visible)** : Nous ne recopions pas les offres : elles changent tous les jours. Ouvrez la page de l'employeur et regardez ce qui est publié aujourd'hui. Si rien ne vous convient, vous pouvez aussi lui écrire en candidature spontanée.
- **Filtre par secteur** : première puce « Tous les secteurs », puis une puce par secteur avec son nombre (exemple : Santé (9)).

### Les quatre groupes (décision de Denis, 2026-10-17 : fonction publique et grands employeurs séparés, ordre ci-dessous)
**Groupe 1 : Près de chez vous** (employeurs privés et associations installés dans le département)
- Phrase sous le titre du groupe : Ces employeurs sont installés [département].

**Groupe 2 : Grands employeurs**
- Phrase sous le titre du groupe : Ces entreprises recrutent dans toute la France. Regardez si une offre se trouve près de chez vous.

**Groupe 3 : Fonction publique**
- Phrase sous le titre du groupe : Mairies, département, hôpitaux publics, éducation, sécurité... Il existe des postes à plusieurs niveaux : regardez ce qui est indiqué dans chaque offre.
- Les employeurs publics du département (Conseil départemental, hôpital, intercommunalité...) sont rangés ici, une seule fois, avec leur territoire (département) sous le nom.

**Groupe 4 : Groupements d'employeurs et chambres**
- Phrase sous le titre du groupe : Ces structures publient les offres de plusieurs entreprises à la fois.

Règle de classement (le code lit la famille notée dans le fichier, il ne devine pas) : `employeur` local = groupe 1 ; `employeur` national = groupe 2 ; `portail-officiel` = groupe 3 ; `groupement` et `federation` = groupe 4.

### Une ligne (un employeur)
- Nom de l'employeur ; secteur en petit ; commune ou « Toute la France » en petit.
- **Pastille** : Vérifié le 17 octobre 2026 (la date de la dernière vérification faite à la main).
- **Bouton** : Ouvrir la page des offres
- **Phrase sous le bouton** : Vous quittez l'application.

### Quand il n'y a rien à montrer
- Secteur sans page : Pas encore de page pour ce secteur. Ce n'est ni une erreur ni un oubli de votre part : la liste grandit petit à petit.
- Département non couvert : Cette rubrique n'a pas encore de liste pour votre département.
- Bouton de secours (toujours proposé en bas) : La Bonne Boîte, pour chercher par vous-même (vous quittez l'application)
- Erreur de chargement : Impossible de charger la liste pour le moment. Vérifiez votre connexion puis réessayez. [bouton : Réessayer]

### Bas de page
- Liste non exhaustive. Aucun partenariat, aucune rémunération, aucun classement : les employeurs sont rangés par ordre alphabétique dans chaque groupe.
- Bouton : Comment les pages sont choisies (ouvre l'écran des critères, voir 5)

## 3. La fiche d'un employeur (déjà existante) : le bouton ajouté
- **Bouton** : Ses offres publiées
- **Phrase sous le bouton** : L'employeur publie lui-même ses offres sur cette page. Vous quittez l'application.
- Ce bouton n'apparaît que si l'employeur figure aussi dans la rubrique.

## 4. Les changements dans les textes existants
- **Présentation « Employeurs près de chez moi », bloc « Ce que cette page ne fait pas »**, première puce, remplacée par : Elle ne recopie pas les offres d'emploi : elles changent trop vite. Elle vous indique les pages où les employeurs les publient eux-mêmes (rubrique « Employeurs qui publient leurs offres »), pour que vous les consultiez vous-même.
- **Même présentation, bloc « Ce qui va se passer »**, une puce ajoutée : Si vous préférez voir les offres publiées, ouvrez la rubrique « Employeurs qui publient leurs offres ».
- **Accroche de la présentation** : inchangée (« Beaucoup d'emplois ne sont jamais annoncés... »).
- **Aide (ampoule) de l'écran des secteurs**, une phrase ajoutée : La case « Employeurs qui publient leurs offres » vous mène aux pages d'offres des employeurs, à consulter vous-même.
- **Aide (ampoule) de la rubrique** : Chaque ligne ouvre la page où l'employeur publie ses offres. Choisissez un secteur avec les puces pour réduire la liste. La date indique quand cette page a été vérifiée à la main pour la dernière fois.
- **Recherche de l'accueil** : un mot comme « offres », « recrutement » ou le nom d'un employeur de la liste propose « Qui fait quoi : où voir les offres d'emploi ».

## 5. L'écran « Comment les pages sont choisies » (remplace le texte actuel de `_mtRenduCriteres` pour cette rubrique)
**Ce que nous vérifions**
- La page appartient à l'employeur lui-même (ou au logiciel de recrutement officiel vers lequel son site renvoie).
- Elle a été ouverte à la main, et on y a vu une liste d'offres. La date de cette vérification est affichée.

**Ce que nous ne faisons pas**
- Pas d'intermédiaire ni de site qui recopie des offres venues d'ailleurs, pas d'agence d'intérim.
- Pas de classement, pas de recommandation, pas de garantie qu'un employeur recrute près de chez vous.
- Aucun partenariat, aucune rémunération des employeurs.

**Mise à jour**
- Une page est revérifiée régulièrement ; si elle ne répond plus, elle est retirée de la liste.

## Décisions de Denis : TOUTES VALIDÉES (2026-10-17)
1. Pastille « Vérifié le [date] » gardée.
2. Quatre groupes : près de chez vous, grands employeurs, fonction publique (employeurs publics locaux inclus, sans doublon), groupements et chambres. Les grands employeurs passent avant la fonction publique.
3. Titre de tuile « Employeurs qui publient leurs offres » gardé.
