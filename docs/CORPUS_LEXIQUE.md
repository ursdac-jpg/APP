# Corpus Lexique — contenu rédigé

> **PÉRIMÉ (constat 2026-09-06).** La source de vérité du Lexique est **`data/lexique.js`**
> (153 fiches, ce que le module lit). Ce document en est resté à **42 fiches** et à un format
> markdown : il a servi de cahier éditorial pendant la phase de rédaction, puis `data/lexique.js`
> a pris le relais et a grandi seul. **Ne rien y ajouter.** Conservé pour l'historique
> éditorial (règles de style `docs/CHANTIER_LEXIQUE.md` § 9, modèle de données
> `docs/MAQUETTE_LEXIQUE.md` § 3, logique des familles). Le circuit veille -> mots
> (`docs/VEILLE_PROMPTS.md` § 5quater) produit désormais des entrées **au format
> `data/lexique.js`**, pas au format de ce fichier. Régénérer ce doc depuis `data/lexique.js`
> (vue de relecture markdown) reste une option ouverte, non faite.

Contenu réel du module, en attente de sa forme technique définitive (fichier de données statique, sur le modèle de `data/metiers.js`, une fois `ARCHITECTURE_TECHNIQUE.md` écrit — voir `docs/MAQUETTE_LEXIQUE.md`, section 7). Ce document est la source de vérité éditoriale entre-temps : chaque fiche y est déjà conforme au modèle de données (`docs/MAQUETTE_LEXIQUE.md`, section 3) et aux règles de style (`docs/CHANTIER_LEXIQUE.md`, section 9).

Progression : voir `docs/CARNET_FICHES_LEXIQUE.md` — 42 fiches écrites, niveau 1 complet (dont 3 comparatifs), plus 2 regroupements (1 collection, 1 parcours). Réseau consolidé, variantes de recherche revues pour privilégier le langage naturel. Prêt pour le commit unique.

---

## Famille : Contrats et statuts d'emploi / Bulletin de salaire

### PMSMP
**Univers** Dispositifs · **Registres** langage CIP, langage France Travail · **Variantes** immersion en entreprise, essayer un métier

Une PMSMP (période de mise en situation en milieu professionnel) permet de passer du temps dans une entreprise pour découvrir un métier, confirmer un projet professionnel ou initier une démarche de recrutement, sans jamais constituer un contrat de travail. La personne reste suivie par la structure qui l'accompagne pendant toute l'immersion.

*À ne pas confondre avec* CDI, CDD · *Voir aussi* France Travail, Frein à l'emploi, Stage ou PMSMP ?

### CDI
**Univers** Contrats et statuts d'emploi · **Registres** langage RH, langage juridique · **Variantes** contrat fixe, poste stable

Un CDI (contrat à durée indéterminée) est un contrat de travail sans date de fin prévue à l'avance. Les autres formes de contrat (CDD, intérim...) se définissent souvent par comparaison avec lui.

*Voir aussi* CDD ou intérim ?, CDI ou CDD ?, Période d'essai

### CDD
**Univers** Contrats et statuts d'emploi · **Registres** langage RH, langage juridique · **Variantes** contrat court

Un CDD (contrat à durée déterminée) est un contrat de travail dont la fin est fixée à l'avance, généralement liée à un motif précis comme un remplacement ou un surcroît d'activité. Contrairement à l'intérim, l'employeur qui recrute est aussi celui qui emploie directement.

*À ne pas confondre avec* Intérim · *Voir aussi* CDI ou CDD ?, Période d'essai

### Intérim
**Univers** Contrats et statuts d'emploi · **Registres** langage RH, langage juridique · **Variantes** boîte d'intérim, mission d'intérim

L'intérim consiste à travailler pour une entreprise cliente tout en étant employé officiellement par une agence de travail temporaire. Chaque mission a une fin fixée à l'avance.

*À ne pas confondre avec* CDD · *Voir aussi* CDD ou intérim ?

### Alternance
**Univers** Contrats et statuts d'emploi · **Registres** langage RH, langage administratif · **Variantes** apprentissage, travailler et étudier en même temps

L'alternance associe une formation et une activité en entreprise, encadrées par un même contrat de travail. La personne partage son temps entre un organisme de formation et l'entreprise qui l'emploie.

*Voir aussi* Stage, Mission Locale

### Stage
**Univers** Contrats et statuts d'emploi · **Registres** langage administratif · **Variantes** stage obligatoire

Un stage permet de passer du temps en entreprise dans le cadre d'un cursus de formation, encadré par une convention plutôt que par un contrat de travail — même quand les tâches réalisées ressemblent à celles d'un salarié.

*À ne pas confondre avec* PMSMP · *Voir aussi* Stage ou PMSMP ?, Alternance

### Période d'essai
**Univers** Contrats et statuts d'emploi · **Registres** langage RH, langage juridique · **Variantes** temps d'essai, essai

La période d'essai est un temps, situé au début d'un contrat de travail, pendant lequel l'employeur et la personne recrutée vérifient que le poste correspond à ce qui était attendu de part et d'autre. Y mettre fin pendant cette période obéit à des règles différentes de celles d'un contrat déjà confirmé.

*Voir aussi* CDI, CDD

### Temps partiel
**Univers** Contrats et statuts d'emploi · **Registres** langage RH · **Variantes** mi-temps

Un contrat à temps partiel prévoit une durée de travail inférieure à celle d'un temps complet, répartie selon un rythme précisé dans le contrat. Il peut concerner aussi bien un CDI qu'un CDD.

*Voir aussi* CDI, CDD

### Salaire brut
**Univers** Bulletin de salaire · **Registres** langage administratif, langage RH · **Variantes** salaire avant impôts

Le salaire brut est le montant du salaire avant que les cotisations sociales et l'impôt ne soient retirés. C'est le montant qui apparaît généralement en premier sur un bulletin de salaire.

*À ne pas confondre avec* Salaire net · *Voir aussi* Bulletin de salaire (grille de lecture)

### Salaire net
**Univers** Bulletin de salaire · **Registres** langage administratif, langage RH · **Variantes** salaire reçu

Le salaire net est le montant du salaire une fois les cotisations sociales et l'impôt retirés — la plupart du temps, le montant réellement versé sur le compte bancaire.

*À ne pas confondre avec* Salaire brut · *Voir aussi* Bulletin de salaire (grille de lecture)

### Comment lire son bulletin de salaire
*(Notion — grille de lecture · titre de tri : Bulletin de salaire)*
**Univers** Bulletin de salaire · **Registres** langage administratif · **Variantes** fiche de paie

Un bulletin de salaire présente toujours, dans cet ordre logique : l'identité de l'employeur et du salarié, le poste occupé, le temps de travail sur la période, puis le détail du calcul entre salaire brut et salaire net. Certaines lignes, comme des primes, n'apparaissent que si elles concernent la situation de la personne.

*Voir aussi* Salaire brut, Salaire net

### CDD ou intérim ?
*(Notion — comparatif)*
**Univers** Contrats et statuts d'emploi

Ce qui les rapproche : dans les deux cas, le contrat a une fin prévue à l'avance, généralement liée à un motif précis. Ce qui les distingue : en CDD, l'employeur qui recrute est aussi celui qui emploie directement. En intérim, une agence de travail temporaire est l'employeur officiel, qui met la personne à disposition d'une entreprise cliente le temps de la mission.

*Voir aussi* CDI, CDD, Intérim

### CDI ou CDD ?
*(Notion — comparatif)*
**Univers** Contrats et statuts d'emploi

Ce qui les rapproche : dans les deux cas, un contrat de travail lie directement l'employeur et le salarié, avec les mêmes droits de base. Ce qui les distingue : un CDI n'a pas de date de fin prévue à l'avance, un CDD en a toujours une, liée à un motif précis.

*Voir aussi* CDD ou intérim ?

### Stage ou PMSMP ?
*(Notion — comparatif)*
**Univers** Contrats et statuts d'emploi

Ce qui les rapproche : dans les deux cas, la personne passe du temps dans une entreprise sans être liée par un contrat de travail avec elle. Ce qui les distingue : un stage s'inscrit dans un cursus de formation, encadré par une convention de stage. Une PMSMP s'inscrit dans un accompagnement vers l'emploi, encadrée par la structure qui suit la personne.

*Voir aussi* Stage, PMSMP

---

## Famille : Accompagnement et insertion

### Diagnostic partagé
**Univers** Accompagnement et insertion · **Registres** langage CIP · **Variantes** faire le point avec mon conseiller

Un diagnostic partagé est le moment où une personne accompagnée et son conseiller regardent ensemble sa situation — ce qui va, ce qui bloque, ce qui pourrait aider — pour construire une compréhension commune plutôt qu'un jugement porté par un seul des deux.

*Voir aussi* Frein à l'emploi, Plan d'action, SIAE

### Frein à l'emploi
**Univers** Accompagnement et insertion · **Registres** langage CIP · **Variantes** je suis bloqué, mes difficultés

Un frein à l'emploi est tout ce qui rend une recherche d'emploi plus difficile pour une personne précise — un frein de mobilité ou une contrainte de santé, par exemple, parmi bien d'autres possibles. En parler avec un conseiller ne signifie jamais qu'on est en tort : c'est reconnaître un obstacle réel pour mieux chercher comment le contourner.

*Voir aussi* Diagnostic partagé, RQTH, SIAE

### Plan d'action
**Univers** Accompagnement et insertion · **Registres** langage CIP · **Variantes** mes prochaines étapes, ce qu'on a décidé ensemble

Un plan d'action rassemble les étapes concrètes décidées avec un conseiller pour avancer vers un objectif professionnel, à partir de ce qui ressort d'un diagnostic partagé. Il peut évoluer au fil de l'accompagnement plutôt que rester figé.

*Voir aussi* Diagnostic partagé, Prescription, CPF

### Positionnement
**Univers** Accompagnement et insertion · **Registres** langage CIP · **Variantes** où j'en suis, ma situation par rapport au marché

Le positionnement désigne la manière dont une personne se situe par rapport à un métier, un secteur ou le marché du travail, en tenant compte de ses compétences, de son expérience et de ce qu'elle recherche. C'est un repère de travail, jamais un jugement de valeur.

*Voir aussi* Diagnostic partagé, Employabilité

### Prescription
**Univers** Accompagnement et insertion · **Registres** langage CIP · **Variantes** on m'a orienté vers, on m'a proposé

Une prescription est la proposition, par un conseiller, d'une action précise — une formation, un dispositif, un rendez-vous avec un partenaire — jugée utile pour le parcours de la personne. Elle reste une proposition à discuter, pas une obligation imposée sans échange.

*Voir aussi* Plan d'action

### Employabilité
**Univers** Accompagnement et insertion · **Registres** langage CIP, langage RH · **Variantes** mes chances de trouver un emploi

L'employabilité désigne la capacité d'une personne à trouver et à conserver un emploi, compte tenu de ses compétences, de son expérience et du contexte du marché du travail. Elle peut évoluer dans le temps : elle ne décrit jamais une qualité figée de la personne.

*Voir aussi* Positionnement, Reconversion

### Reconversion
**Univers** Accompagnement et insertion · **Registres** langage CIP, langage administratif · **Variantes** changer de métier, se reconvertir

La reconversion désigne le fait de changer de métier ou de secteur d'activité, en s'appuyant sur des compétences déjà acquises, une nouvelle formation, ou les deux à la fois. Elle peut concerner un changement complet de domaine ou un rapprochement vers un métier voisin.

*Voir aussi* Employabilité, Positionnement

---

## Famille : Emploi et recrutement

### Que veut dire "autonomie" dans une offre d'emploi ?
*(Notion — décryptage attentes employeurs · titre de tri : Autonomie)*
**Univers** Emploi et recrutement · **Registres** langage RH, langage employeur · **Variantes** travailler en autonomie

Quand un employeur recherche une personne "autonome", il veut dire qu'il n'aura pas la disponibilité pour donner des consignes détaillées à chaque tâche : il attend qu'elle sache organiser son travail et prendre de petites décisions seule, dans un cadre déjà donné.

*Voir aussi* Pourquoi "parlez-moi de vous" ?, Esprit d'équipe, Force de proposition

### Pourquoi on vous demande "parlez-moi de vous" ?
*(Notion — décryptage question d'entretien · titre de tri : Parlez-moi de vous)*
**Univers** Emploi et recrutement · **Registres** langage RH, langage employeur · **Variantes** présentez-vous

Cette question n'attend pas un résumé complet de votre vie : le recruteur cherche à comprendre ce que vous jugez important de mettre en avant, et si vous voyez le lien entre votre parcours et le poste visé.

*Voir aussi* Que veut dire "autonomie" ?

### Que veut dire "savoir-être" ?
*(Notion — décryptage · titre de tri : Savoir-être)*
**Univers** Emploi et recrutement · **Registres** langage RH · **Variantes** comportement au travail

Le savoir-être désigne la manière dont une personne se comporte et interagit dans un cadre professionnel — la façon de communiquer, de réagir à une consigne, de travailler avec d'autres. C'est ce qu'un employeur observe au-delà des compétences techniques précises.

*À ne pas confondre avec* Savoir-faire · *Voir aussi* Esprit d'équipe

### Que veut dire "savoir-faire" ?
*(Notion — décryptage · titre de tri : Savoir-faire)*
**Univers** Emploi et recrutement · **Registres** langage RH · **Variantes** compétences techniques

Le savoir-faire désigne les compétences techniques concrètes qu'une personne sait mettre en œuvre dans son métier, acquises par la formation ou l'expérience. C'est ce qu'un employeur cherche à vérifier à travers un CV ou une mise en situation.

*À ne pas confondre avec* Savoir-être · *Voir aussi* Rigueur

### Que veut dire "esprit d'équipe" dans une offre d'emploi ?
*(Notion — décryptage · titre de tri : Esprit d'équipe)*
**Univers** Emploi et recrutement · **Registres** langage RH, langage employeur · **Variantes** travailler en équipe

Quand un employeur mentionne l'esprit d'équipe, il veut dire qu'il attend une personne capable de collaborer, de partager des informations utiles et de s'ajuster aux autres membres d'un groupe de travail, plutôt que de fonctionner uniquement seule.

*Voir aussi* Savoir-être, Que veut dire "autonomie" ?

### Que veut dire "être force de proposition" ?
*(Notion — décryptage · titre de tri : Force de proposition)*
**Univers** Emploi et recrutement · **Registres** langage RH, langage employeur · **Variantes** avoir des idées

Être force de proposition signifie qu'un employeur attend qu'une personne suggère elle-même des idées ou des améliorations, plutôt que d'attendre uniquement des consignes avant d'agir. Ça suppose une certaine familiarité avec le poste, pas nécessairement dès le premier jour.

*Voir aussi* Que veut dire "autonomie" ?, Esprit d'équipe

### Que veut dire "rigueur" dans une offre d'emploi ?
*(Notion — décryptage · titre de tri : Rigueur)*
**Univers** Emploi et recrutement · **Registres** langage RH, langage employeur · **Variantes** faire attention aux détails

Quand un employeur recherche de la rigueur, il attend une personne qui respecte les procédures, vérifie son travail et limite les erreurs, en particulier sur des tâches répétitives ou précises.

*Voir aussi* Savoir-faire, Que veut dire "autonomie" ?

### Ce que regarde un recruteur sur un CV
*(Notion — décryptage · titre de tri : CV, lecture par un recruteur)*
**Univers** Emploi et recrutement · **Registres** langage RH · **Variantes** ce qui compte sur un CV

Un recruteur repère d'abord les informations qui lui permettent de vérifier rapidement l'adéquation avec le poste : intitulés de postes précédents, durée des expériences, compétences citées explicitement. Un CV mal structuré peut faire perdre ces informations même quand le contenu est solide.

*Voir aussi* Comment lire une lettre de motivation, Savoir-faire

### Comment lire une lettre de motivation
*(Notion — grille de lecture · titre de tri : Lettre de motivation)*
**Univers** Emploi et recrutement · **Registres** langage RH · **Variantes** lettre de motiv

Une lettre de motivation présente en général le lien entre la personne et le poste visé, une ou deux raisons concrètes de candidater, puis une ouverture vers un échange à venir. Elle complète le CV sans jamais le répéter à l'identique.

*Voir aussi* Ce que regarde un recruteur sur un CV

---

## Famille : Structures et organismes

### Le rôle de France Travail
*(Notion — rôle · titre de tri : France Travail)*
**Univers** Structures et organismes · **Registres** langage administratif · **Variantes** Pôle emploi

France Travail (anciennement Pôle emploi) est l'organisme chargé d'accompagner les personnes en recherche d'emploi, notamment en les mettant en lien avec des offres et des dispositifs comme la PMSMP. C'est aussi l'un des organismes pouvant verser des allocations aux personnes qui y ont droit.

*Voir aussi* PMSMP, Diagnostic partagé, SIAE

### Le rôle de la Mission Locale
*(Notion — rôle · titre de tri : Mission Locale)*
**Univers** Structures et organismes · **Registres** langage administratif · **Variantes** aide pour les jeunes

Une Mission Locale accompagne spécifiquement les jeunes dans leur insertion professionnelle et sociale, avec un accompagnement souvent plus large que la seule recherche d'emploi (logement, santé, mobilité...). Chaque Mission Locale couvre un territoire précis.

*À ne pas confondre avec* France Travail · *Voir aussi* Diagnostic partagé

### Le rôle de Cap Emploi
*(Notion — rôle · titre de tri : Cap Emploi)*
**Univers** Structures et organismes · **Registres** langage administratif · **Variantes** emploi et handicap

Cap Emploi accompagne spécifiquement les personnes en situation de handicap dans leur recherche d'emploi et leur maintien en poste, en lien avec les employeurs et les autres structures d'accompagnement.

*À ne pas confondre avec* France Travail · *Voir aussi* RQTH, Mission Locale

### CAF
**Univers** Structures et organismes · **Registres** langage administratif · **Variantes** Caisse d'allocations familiales

La CAF (Caisse d'allocations familiales) verse des aides liées à la famille, au logement ou à certaines situations de précarité, selon la situation de chaque personne. C'est un organisme distinct de ceux qui accompagnent la recherche d'emploi.

*Voir aussi* France Travail

---

## Famille : Insertion par l'activité économique (IAE / SIAE)

### Les structures de l'insertion par l'activité économique (SIAE)
*(Notion — rôle, fiche de synthèse · titre de tri : SIAE)*
**Univers** Structures et organismes · **Variantes** structure d'insertion

Une SIAE (structure de l'insertion par l'activité économique) propose un emploi encadré à des personnes qui rencontrent des difficultés particulières pour accéder au marché du travail classique, le temps de retrouver des repères professionnels. Ce terme regroupe plusieurs formes concrètes de structures, chacune avec son propre fonctionnement.

*Voir aussi* Chantier d'insertion (ACI), Entreprise d'insertion (EI)

### Chantier d'insertion (ACI)
**Univers** Structures et organismes

Un chantier d'insertion (ACI, atelier et chantier d'insertion) est une structure qui emploie des personnes en parcours d'insertion sur des activités concrètes — souvent liées à l'environnement ou au bâtiment — tout en les accompagnant vers un emploi durable. C'est l'une des formes de SIAE.

*À ne pas confondre avec* Entreprise d'insertion (EI) · *Voir aussi* SIAE

### Entreprise d'insertion (EI)
**Univers** Structures et organismes

Une entreprise d'insertion (EI) est une entreprise à part entière, qui produit et vend des biens ou des services comme n'importe quelle autre, tout en employant en priorité des personnes en parcours d'insertion. C'est l'une des formes de SIAE.

*À ne pas confondre avec* Chantier d'insertion (ACI) · *Voir aussi* SIAE

### Association intermédiaire (AI)
**Univers** Structures et organismes

Une association intermédiaire (AI) met à disposition de particuliers, d'associations ou d'entreprises des personnes en parcours d'insertion, pour des missions ponctuelles. C'est l'une des formes de SIAE, plus souple qu'un contrat classique.

*À ne pas confondre avec* ETTI · *Voir aussi* SIAE

### ETTI
**Univers** Structures et organismes · **Variantes** intérim d'insertion

Une ETTI (entreprise de travail temporaire d'insertion) fonctionne comme une agence d'intérim classique, mais met à disposition des entreprises clientes des personnes en parcours d'insertion. C'est l'une des formes de SIAE.

*À ne pas confondre avec* Association intermédiaire (AI), Intérim · *Voir aussi* SIAE

---

## Famille : Formation et dispositifs

### CPF
**Univers** Formation · **Registres** langage administratif · **Variantes** compte personnel de formation, financer ma formation

Le CPF (compte personnel de formation) permet de financer une formation à partir d'un compte associé à chaque personne active, alimenté au fil de sa vie professionnelle.

*Voir aussi* VAE, Plan d'action

### VAE
**Univers** Formation · **Registres** langage administratif, langage CIP · **Variantes** validation des acquis de l'expérience, diplôme sans formation

La VAE (validation des acquis de l'expérience) permet de faire reconnaître officiellement, sous forme d'un diplôme ou d'un titre, des compétences acquises par l'expérience professionnelle ou bénévole plutôt que par une formation classique.

*Voir aussi* CPF

### RQTH
**Univers** Santé au travail · **Registres** langage administratif · **Variantes** reconnaissance handicap

La RQTH (reconnaissance de la qualité de travailleur handicapé) est un statut administratif qui reconnaît une situation de handicap pouvant affecter l'accès ou le maintien dans l'emploi. Elle ouvre l'accès à des dispositifs d'accompagnement spécifiques, comme ceux proposés par Cap Emploi.

*Voir aussi* Cap Emploi, Frein à l'emploi

---

## Collections et parcours

### 📚 Comprendre l'insertion par l'activité économique
*(Collection)*

Fiches, dans un ordre qui va du général vers le particulier, puis des structures qui embauchent directement vers celles qui mettent à disposition — jamais un ordre imposé à la lecture, mais un classement qui a du sens :
1. Les structures de l'insertion par l'activité économique (SIAE) — le terme qui chapeaute tout le reste
2. Chantier d'insertion (ACI)
3. Entreprise d'insertion (EI)
4. Association intermédiaire (AI)
5. ETTI — la forme la plus proche de l'intérim classique, pour boucler sur un repère déjà connu

### 🧭 Je prépare un entretien
*(Parcours — accroche : "Comprendre ce qui se joue pendant un entretien, pas préparer des réponses toutes faites.")*

Fiches, dans l'ordre suggéré : ce qui se joue avant même l'entretien, puis son ouverture, puis les qualités décryptées une à une, dans l'ordre où elles reviennent le plus souvent dans une offre :
1. Ce que regarde un recruteur sur un CV
2. Comment lire une lettre de motivation
3. Pourquoi on vous demande "parlez-moi de vous"
4. Que veut dire "autonomie" dans une offre d'emploi ?
5. Que veut dire "savoir-être" ?
6. Que veut dire "savoir-faire" ?
7. Que veut dire "esprit d'équipe" dans une offre d'emploi ?
8. Que veut dire "être force de proposition" ?
9. Que veut dire "rigueur" dans une offre d'emploi ?
