# Pont entre la rubrique « Employeurs qui publient leurs offres », l'outil de veille et l'outil de prospection

> Écrit le 2026-10-17 d'après les demandes de Denis. Conception seulement, rien n'est codé. Les trois décisions sur les textes de la rubrique sont validées (pastille « Vérifié le » gardée, groupe « Fonction publique et grands organismes » en deuxième position, titre de tuile « Employeurs qui publient leurs offres »).

## Demandes de Denis
1. **Veille** : la pastille « Vérifié le [date] » oblige à revérifier les pages régulièrement (environ tous les six mois) pour montrer qu'elles existent toujours. L'outil de veille doit porter ces vérifications.
2. **Pont prospection vers rubrique** : l'outil de prospection doit pouvoir nourrir la rubrique des employeurs. Une fois une entrée actée, l'outil de veille la tient à jour.
3. **Prospection en deux parties** : une partie **publique** (aider les personnes à faire leur propre prospection) et une partie **personnelle, pour Denis seul**, avec des informations privées jamais publiées (contact direct, mail personnel de l'employeur, notes d'échange).
4. **Valeur ajoutée** : quand un employeur répertorié dans la rubrique s'est montré favorable aux stages d'immersion ou de découverte métier (après échange avec Denis), la rubrique peut l'indiquer.

## Points de conception à garder
- **Deux niveaux de date, jamais mélangés** : « vérifié à la main le [date] » (Denis a ouvert la page) et un contrôle automatique d'accessibilité (la page répond encore). Seul le premier donne la pastille verte ; le second sert à repérer les pages mortes à rouvrir à la main. Le script `scripts/verifierRecruteursSas.js` fait déjà le contrôle automatique.
- **Échéance** : une page sans vérification à la main depuis 6 mois est signalée dans la veille « à revérifier » ; passé un délai à fixer, elle perd sa pastille (jamais d'affichage trompeur).
- **Une seule source de données** pour la rubrique et les fiches, alimentée par la prospection (cases à cocher « ajouter à la rubrique ») et mise à jour par la veille. Les champs privés restent dans un fichier à part, hors dépôt et jamais lu par l'application publique.
- **Mention « ouvert aux stages d'immersion »** : à n'afficher qu'avec l'accord explicite de l'employeur (champ « accord obtenu le [date] »), sans nom de personne, et en respectant la règle « aucun partenariat, aucune recommandation, aucun classement » : formulation neutre du type « a indiqué être ouvert aux stages d'observation », jamais un label ni un tri qui avantage. À valider avec Denis avant tout code.
- **Vie privée** : nom, mail et téléphone de personnes physiques restent uniquement dans la partie personnelle, locale, de Denis.

## Ordre proposé
1. Rubrique option 2 (Mode B, effort moyen), avec dans le fichier de données les champs prévus pour la suite : date de vérification à la main, date de contrôle automatique, mention stages (vide au départ).
2. Outil de veille : liste « à revérifier » (Mode A puis B).
3. Outil de prospection, parties publique et personnelle (Mode A, effort haut, maquette d'abord).

## Précision de Denis (2026-10-17) : ordre de la prospection
- **D'abord la partie publique seule.** Denis s'en sert lui-même pour la vérifier (filtres, utilité des informations).
- **La partie privée n'est construite qu'au moment de prendre contact avec les entreprises** : notes par entreprise contactée, jamais publiées.
- **Seule la mention « favorable aux stagiaires » apparaîtra côté public** (avec l'accord de l'employeur, voir plus haut).
- Conséquence : la prospection publique est la prochaine grande conception après la rubrique, la partie personnelle vient plus tard et ne bloque rien.
