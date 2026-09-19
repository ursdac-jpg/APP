# Corpus Lexique : Deuxième niveau de lecture (staging)

Document de travail, sur le modèle de `docs/CORPUS_LEXIQUE.md` : source éditoriale avant conversion en données (`data/lexique.js`, `LEXIQUE_SECOND_NIVEAU`). Doctrine complète : `docs/CHANTIER_LEXIQUE.md`, section 9 (étape 3, « Deuxième niveau de lecture »).

Rappel des règles, identiques au premier niveau : contenu intemporel, valeur pédagogique réelle, jamais une redite de la définition principale, pas de procédure administrative, pas de conseil personnalisé, priorité aux exemples et situations concrètes. Test de nécessité avant d'écrire : si sa suppression ne ferait perdre aucune compréhension, il est probablement inutile.

Chaque entrée cite la ou les fiches qui y donnent accès (`fichesEntree`), jamais l'inverse.

---

## Lot 1 : famille « Je prépare un entretien » (9 fiches)

Choix du lot : les 9 fiches du parcours `parcours-entretien` partagent toutes le même besoin identifié par Denis pour Autonomie, des mots d'attentes employeur qui gagnent à être illustrés par des situations concrètes plutôt que rallongés par du texte explicatif. Famille cohérente, déjà groupée dans une collection existante.

### 1. Ce que regarde un recruteur sur un CV
**Fiche cible** : `cv-lecture-recruteur`
**Titre du second niveau** : Exemples concrets
**Corps** :
Un recruteur qui passe quelques secondes sur un CV remarque plus facilement un intitulé de poste clair placé en début de ligne qu'une compétence citée seulement au milieu d'un paragraphe. Deux CV au contenu équivalent peuvent donc être lus très différemment selon que les informations clés sont immédiatement visibles ou noyées dans le texte.

### 2. Comment lire une lettre de motivation
**Fiche cible** : `lettre-motivation`
**Titre du second niveau** : Exemples concrets
**Corps** :
Une phrase comme « je suis motivé et sérieux » n'apporte pas d'information vérifiable : elle pourrait accompagner n'importe quelle candidature. Un élément concret du parcours qui explique l'intérêt pour ce poste précis, ou une observation sur l'entreprise elle-même, montre au contraire une recherche réelle plutôt qu'un envoi générique.

### 3. Pourquoi on vous demande "parlez-moi de vous" ?
**Fiche cible** : `parlez-moi-de-vous`
**Titre du second niveau** : Exemples concrets
**Corps** :
Concrètement, ça peut ressembler à relier en quelques phrases un ou deux éléments du parcours au poste visé, plutôt qu'à dérouler l'ensemble d'un CV dans l'ordre chronologique : le recruteur cherche justement à voir ce lien, pas à recevoir un résumé complet.

### 4. Que veut dire "autonomie" dans une offre d'emploi ?
**Fiche cible** : `autonomie`
**Titre du second niveau** : Exemples concrets
**Corps** :
Concrètement, l'autonomie recherchée par un employeur peut se traduire par plusieurs situations : réagir seul face à un imprévu mineur sans attendre l'accord d'un responsable, organiser l'ordre de ses tâches dans une journée de travail, ou reconnaître qu'une question dépasse son niveau de décision et savoir alors solliciter l'aide nécessaire. L'autonomie ne signifie donc pas travailler sans aucun encadrement : elle s'exerce toujours à l'intérieur d'un cadre déjà donné.

### 5. Que veut dire "savoir-être" ?
**Fiche cible** : `savoir-etre`
**Titre du second niveau** : Exemples concrets
**Corps** :
Le savoir-être se remarque surtout dans des situations concrètes : la façon de signaler un retard ou une erreur, la manière de recevoir une remarque sur son travail, ou le ton employé pour poser une question à un collègue. Deux personnes aux compétences techniques équivalentes peuvent donc être perçues très différemment selon leur savoir-être.

### 6. Que veut dire "savoir-faire" ?
**Fiche cible** : `savoir-faire`
**Titre du second niveau** : Exemples concrets
**Corps** :
Le savoir-faire se vérifie en général à travers des éléments concrets et démontrables : utiliser un logiciel métier précis, manier un outil spécifique, appliquer une méthode de travail propre à un secteur. Contrairement au savoir-être, il peut le plus souvent se prouver par une réalisation, un diplôme ou une mise en situation.

### 7. Que veut dire "esprit d'équipe" dans une offre d'emploi ?
**Fiche cible** : `esprit-equipe`
**Titre du second niveau** : Exemples concrets
**Corps** :
L'esprit d'équipe se traduit par des gestes simples : prévenir un collègue d'un retard qui l'affecte, transmettre une information utile sans attendre qu'on la demande, ou adapter son rythme lorsqu'une tâche dépend du travail d'un autre. Il ne s'oppose pas à l'autonomie : une personne autonome peut très bien avoir l'esprit d'équipe, les deux qualités portent sur des situations différentes.

### 8. Que veut dire "être force de proposition" ?
**Fiche cible** : `force-proposition`
**Titre du second niveau** : Exemples concrets
**Corps** :
Être force de proposition peut par exemple vouloir dire signaler qu'une tâche répétitive pourrait être simplifiée, ou suggérer une meilleure organisation après avoir observé le fonctionnement d'un poste pendant quelque temps. Cette qualité s'exprime rarement dès les premiers jours : elle suppose d'abord de connaître suffisamment le poste pour qu'une proposition soit pertinente.

### 9. Que veut dire "rigueur" dans une offre d'emploi ?
**Fiche cible** : `rigueur`
**Titre du second niveau** : Exemples concrets
**Corps** :
La rigueur se remarque dans des détails concrets : relire un document avant de l'envoyer, vérifier une mesure ou un calcul avant de le transmettre, suivre une procédure dans l'ordre même quand elle semble répétitive. Elle est particulièrement recherchée sur des tâches où une erreur non détectée peut avoir des conséquences importantes.

---

## Contrôle qualité du lot (avant conversion en données)

- [ ] Chaque entrée relue individuellement contre le test de nécessité (« sa suppression ferait-elle perdre une compréhension réelle ? »).
- [ ] Aucune redite de la définition principale de la fiche cible.
- [ ] Aucun conseil personnalisé, aucune procédure administrative.
- [ ] Contenu intemporel : rien qui dépende d'un montant, d'une règle datée ou d'un dispositif nommé susceptible d'évoluer.
- [ ] Ton homogène sur les 9 entrées (registre descriptif, jamais prescriptif : « ça peut vouloir dire », jamais « vous devez »).
- [ ] Une seule fiche cible par entrée dans ce lot (cas simple), cohérent avec `fichesEntree` qui accepte plusieurs cibles si un besoin réel apparaît plus tard.
