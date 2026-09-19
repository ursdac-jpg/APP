# Chantier « Lexique » — Fiche de conception

**Statut** : conception fonctionnelle et logique de navigation figées après une longue phase d'exploration. **Mise à jour (2026-08-18, audit de cohérence documentaire)** : implémenté depuis, voir `modules/lexique/index.js` et `modules/lexique/ARCHITECTURE_TECHNIQUE.md` (référence technique à jour) — le contenu de conception ci-dessous reste la trace du raisonnement qui a mené à cette implémentation, mais ne décrit plus un travail restant à faire.
**Rattachement** : ce document décline `docs/DOCTRINE_LEXIQUE.md`. Il ne peut la contredire ; en cas de tension, la doctrine l'emporte. Tout ce qui est ici — noms, écrans, listes — peut évoluer sans jamais rouvrir la doctrine.

---

## 1. Identité du concept

**Nom provisoire** : *Lexique*. « Base de connaissances » a été explicitement écarté : ce nom désigne déjà, dans le code (`data/baseConnaissancesERIP.js`, fonction `rechercherBaseConnaissances()`), le moteur de recherche métiers/compétences déjà branché sur l'accueil d'ERIP. Le réutiliser créerait une confusion directe. Nom à revalider avant tout code.

**Phrase de définition** : un espace où une personne comprend un mot, une notion ou une pratique du monde professionnel qu'elle ne maîtrise pas encore — qu'elle arrive avec un mot précis, une question posée avec ses propres mots, ou simplement une situation qu'elle vit.

**Problème résolu** : le vocabulaire professionnel (CIP, RH, juridique, administratif) est partout dans le parcours d'une personne en insertion, jamais expliqué nulle part dans ERIP, et rarement demandé à voix haute.

**Promesse principale** : contrairement à une recherche web générique, chaque réponse est bornée, stable dans le temps, neutre, courte, et reliée au reste d'ERIP — jamais un résultat isolé qui laisse la personne repartir seule avec sa question suivante.

---

## 2. Utilisateurs et portes d'entrée naturelles

| Profil | Porte naturelle |
|---|---|
| Cherche une définition précise | Recherche |
| Découvre le monde du travail | Parcours guidés |
| Prépare un entretien, vit un moment précis | Parcours ou Collection, indifféremment |
| Veut une vue d'ensemble d'un sujet (fiche de paie, contrat) | Collection |
| CIP cherchant vite une explication à montrer | Recherche, presque exclusivement |
| Formateur préparant un atelier | Mode Livre, par univers |
| CIP débutant, stagiaire CIP, partenaire découvrant le secteur (périmètre élargi 2026-08-17) | Recherche ou Mode Livre selon le besoin — mêmes portes que les autres profils |

Une seule définition sert tous ces profils (doctrine, principe 5) — aucun mode de lecture différent selon qui consulte.

---

## 3. Logique de navigation

**Trois niveaux d'accès** (doctrine, principe 3), qui convergent toujours vers le même point d'arrivée — une fiche déjà écrite :
- **Situation** : « je viens de signer un contrat » → un Parcours.
- **Question** : « puis-je quitter mon emploi pendant ma période d'essai ? » → une variante de recherche qui pointe vers une fiche.
- **Terme** : « période d'essai » → recherche directe.

**Quatre portes d'entrée** sur l'écran d'accueil, dans cet ordre de priorité visuelle :
1. **Recherche** — la plus grande zone de l'écran, mode principal.
2. **Parcours guidés** — cartes situationnelles, très visibles, juste sous la recherche.
3. **Collections** — grille de sujets, juste en dessous, second filet de découverte.
4. **Mode Livre** (par univers ou ordre alphabétique) — un simple lien texte, le plus discret de l'écran, pensé pour les CIP/formateurs qui veulent voir l'étendue d'un sujet.

**Parcours et Collections partagent un seul mécanisme technique** : un regroupement nommé de fiches, avec un titre et une icône. Un Parcours ajoute un ordre de lecture suggéré et une accroche à la première personne (« Je prépare un entretien »). Une Collection n'a pas d'ordre, présentée par sujet (« 📚 Comprendre un contrat de travail »). Une même fiche peut appartenir à plusieurs regroupements — et peut tout aussi bien n'en avoir aucun, ce qui n'est jamais une anomalie à corriger. Aucune collection ne doit être créée dans le seul but de « ranger » une fiche qui n'en aurait sinon aucune.

**Chaque fiche se termine par trois blocs, jamais plus** (choix délibéré pour éviter la surcharge) :
1. **À ne pas confondre avec** — distinctions sémantiques importantes.
2. **Voir aussi** — concepts liés, mouvement latéral.
3. **Vous retrouverez cette fiche dans** — collections et parcours contenant cette fiche, mouvement ascendant vers le contexte plus large.

**Fil d'apprentissage** : après lecture d'une fiche, suggestion douce de 2-3 fiches suivantes, non imposée. Ne crée aucun contenu nouveau — dérivé automatiquement des collections auxquelles la fiche appartient, croisées avec l'historique de consultation (favoris + déjà-vu). Si la fiche n'appartient encore à aucune collection (corpus jeune), repli silencieux sur les liens « Voir aussi ».

> **Note (2026-08-18, audit de cohérence documentaire)** : ce mécanisme n'existe pas dans l'implémentation réelle (`modules/lexique/index.js`) et n'est mentionné dans aucun document de conception postérieur (`MAQUETTE_LEXIQUE.md`, `ARCHITECTURE_TECHNIQUE.md`) — abandonné en cours de route sans trace explicite de cette décision. À ne plus considérer comme une fonctionnalité actée sans vérifier d'abord si l'idée reste pertinente.

---

## 4. Types de contenu et formats

**Termes** — définition courte (2-3 phrases maximum). Exemples : PMSMP, CPF, préavis, ARE.

**Notions** — plus développées, un seul type mais plusieurs gabarits reconnus, jamais un type de contenu séparé pour chacun :
- Explication libre d'un concept (« ce qu'est une culture d'entreprise »).
- Comparaison entre deux notions proches (« faute grave ou faute lourde ? »).
- Décryptage d'une formulation d'offre d'emploi (« que veut dire "force de proposition" ? »).
- Décryptage d'une question d'entretien (« pourquoi on vous demande "parlez-moi de vous" »).
- Grille de lecture d'un document (structure d'un bulletin de paie, d'un contrat — jamais son contenu chiffré).
- Déroulé d'une démarche (étapes génériques d'une VAE, d'une rupture conventionnelle).
- Rôle d'une structure ou d'un professionnel (France Travail, un CIP, un chargé de recrutement).

Règle transversale (doctrine, principe 4) : chaque décryptage explique un *pourquoi*, jamais un *comment se conformer* — en particulier pour les attentes des employeurs et les questions d'entretien.

---

## 5. Univers et registres

**Univers** (navigation, un par fiche) : Accompagnement et insertion · Emploi et recrutement · Ressources humaines · Organisation du travail et management · Droit du travail · Contrats et statuts d'emploi · Formation · Bulletin de salaire · Protection sociale · Santé au travail · Structures et organismes · Dispositifs · Mobilité et budget lié à l'emploi · Entrepreneuriat et indépendance · Démarches administratives et numériques · Conditions de travail (manquait dans cette liste, corrigé le 2026-09-13).

**Ajouté le 2026-09-13** : Accès aux soins (`acces-aux-soins`) - accès général aux professionnels et structures de santé (désert médical, trouver un médecin...), distinct de « Santé au travail » (`sante-travail`) qui reste réservé au lien entre santé et emploi (RQTH, médecine du travail, aptitude, accident du travail).

« Droit social » a été délibérément écarté : il recouvre déjà Droit du travail et Protection sociale, le garder créerait des hésitations de classement sans rien apporter.

Cette liste reste volontairement souple : certains univers proches (Droit du travail, Contrats et statuts d'emploi, Ressources humaines, Organisation du travail et management) pourraient se recouper une fois un premier corpus écrit. Elle ne sera considérée comme définitivement validée qu'après l'écriture des 30-40 premières fiches (section 10) — jamais figée avant d'avoir été confrontée à du contenu réel.

**Structures nommées** (France Travail, Mission Locale, CAF, Cap Emploi, PLIE, FranceConnect, ERIP...) ne sont pas des univers : ce sont des fiches à l'intérieur de l'univers Structures et organismes.

**Registres** (métadonnée, pas de navigation dédiée) : langage CIP, langage RH, langage juridique, langage employeur, langage administratif, langage France Travail. Répond à « qui parle comme ça » sans multiplier les rubriques.

**Sous-thème** : champ optionnel, vide au départ, prévu dans le modèle dès la première fiche. Sert uniquement le jour où un univers devient trop volumineux pour une liste plate — jamais rempli par anticipation.

---

## 6. Modèle de fiche (champs)

- Titre (formulation naturelle) et titre de tri (distinct, pour l'ordre alphabétique — évite que les Notions-questions encombrent une seule lettre).
- Type (Terme / Notion) et gabarit si Notion.
- Univers (un seul, obligatoire) et sous-thème (optionnel).
- Registre(s) (tags, zéro ou plusieurs).
- Corps du contenu, selon le gabarit du format.
- Variantes de recherche : 2-3 maximum à la création (synonymes, sigle développé, ancien nom, une formulation erronée mais fréquente — par exemple « Pôle emploi » ou « contrat aidé » —, une question naturelle). Jamais plus par anticipation — l'enrichissement se pilote ensuite par la donnée réelle (recherches sans résultat), pas par un effort d'imagination a priori.
- Liens : « à ne pas confondre avec », « voir aussi » (au moins un des deux obligatoire avant publication — doctrine, principe 7).
- Appartenance à des collections/parcours (zéro ou plusieurs).
- Date de dernière relecture (optionnelle, jamais une obligation de veille).

---

## 7. Rapport avec l'existant

**Recherche** : réutilise le patron déjà éprouvé sur l'accueil d'ERIP (`rechercheERIPInput` / `resultatsRechercheERIP` / `overlayRechercheERIP`, TACHE 33A) — frappe en direct, overlay qui ferme au clic extérieur, suivi Umami déjà instrumenté (`recherche_utilisee`, `recherche_sans_resultat`). Ce patron cherche aujourd'hui dans `data/baseConnaissancesERIP.js` (métiers/compétences) ; le Lexique aura son propre jeu de données et sa propre fonction de recherche, sur le même patron d'interaction, jamais le même moteur.

**Ancrage vers Repères** : `docs/CONTRAT_ANCRAGE_ERIP.md` réutilisé sans aucune modification. Bouton « Garder comme Repère » sur chaque fiche, deuxième vrai appelant du contrat après le Bilan CV.

**Favoris** : mécanisme entièrement nouveau et séparé de l'ancrage — retrouver rapidement une fiche n'est pas la même intention que la faire vivre dans sa réflexion personnelle (doctrine, principe 9). Stockage à définir dans `dossier`, hors périmètre de ce document.

**Nom à ne jamais réutiliser** : « Base de connaissances » reste réservé au composant technique existant (`data/baseConnaissancesERIP.js`) — le rappeler ici évite qu'un futur document ou une future session le reprenne par erreur.

---

## 8. Différenciation

- **vs un dictionnaire** : un dictionnaire répond et s'arrête ; ici, aucune fiche ne se referme sur elle-même (doctrine, principe 7).
- **vs une FAQ** : les questions ne sont jamais un contenu en tant que tel, seulement une porte d'entrée vers une fiche déjà écrite (doctrine, principe 3 et clarifications) — le module ne doit jamais devenir une liste de questions/réponses qui s'accumule.
- **vs une bibliothèque juridique** : jamais de veille permanente, jamais de montant, durée ou condition susceptible d'évoluer (doctrine, principe 1).
- **vs Repères** : le Lexique porte un contenu écrit à l'avance, neutre, identique pour tout le monde. Repères porte la réflexion propre de la personne, privée par défaut. Le premier alimente parfois le second par ancrage volontaire, jamais l'inverse.

---

## 9. Méthode de fabrication d'une fiche

1. **Naissance** — un terme apparaît sans explication dans une sortie ERIP déjà produite (Bilan CV, Regard extérieur, Repères), un retour terrain direct, un manque découvert en écrivant une autre fiche, ou une relecture volontaire d'un univers. Suivi dans un carnet des fiches à écrire, même patron que `docs/EVOLUTIONS_REPERES.md` (voir `docs/CARNET_FICHES_LEXIQUE.md`).

   Les comparatifs forment une famille éditoriale à part entière, pas une exception ponctuelle : chaque fois que deux notions sont régulièrement confondues sur le terrain, se demander explicitement si un comparatif s'impose, en plus des fiches individuelles.

   Chaque candidat reçoit un **score de priorité** (1 à 5), calculé à partir de trois critères : fréquence d'apparition dans les écrans/sorties d'ERIP, fréquence en accompagnement CIP réel, potentiel de confusion pour un bénéficiaire. Ce score départage l'ordre d'écriture dans le temps, jamais l'envie du moment — un outil de gouvernance destiné à durer des années, pas seulement à trier le corpus de lancement. Il n'appartient qu'au carnet des fiches à écrire ; une fois la fiche rédigée, le score disparaît, il n'a jamais sa place dans le modèle de données (`docs/MAQUETTE_LEXIQUE.md`, section 3).
2. **Vérification anti-doublon** — recherche du terme et de ses variantes avant d'écrire. Si une fiche proche existe déjà : facette du même concept (l'enrichir) ou concept réellement différent (fiche à part) ? Même discipline avant de créer une collection ou un parcours : vérifier qu'aucun regroupement existant ne couvre déjà sensiblement le même ensemble de fiches, pour éviter deux collections qui se recouvrent sans que personne ne le remarque.
3. **Rédaction** — gabarit fixe du format concerné, une fiche-exemple canonique par format comme modèle littéral. Règle anti-contradiction : un terme déjà défini ailleurs n'est jamais réexpliqué dans ses propres mots, seulement nommé et lié.

   Quatre règles de style, apprises sur le premier lot réel et valables pour toutes les suivantes — l'homogénéité du ton compte autant que l'exactitude de chaque fiche prise isolément :
   - Préférer une formulation structurelle à une formulation qui sonne comme une règle ou un fait d'aujourd'hui (« les autres contrats se définissent par comparaison avec lui » plutôt que « c'est le contrat le plus courant »).
   - Deux à trois exemples au maximum, jamais une énumération qui prend autant de place que la définition elle-même.
   - Rester sur le mécanisme et le pourquoi, jamais glisser vers un conseil de posture même implicite — y compris dans une phrase de clarification qui semble anodine.
   - Prévoir systématiquement des variantes de recherche informelles et approximatives, pas seulement les sigles et synonymes formels (« boîte d'intérim », « salaire avant impôts », « rupture à l'amiable »).
   - Densité maximale, jamais dépassée : 2 à 3 variantes de recherche, 3 liens « voir aussi », 2 liens « à ne pas confondre avec ». Au-delà, la lisibilité de la fiche se dégrade plus qu'elle ne s'enrichit. Ce plafond porte uniquement sur ce que le rédacteur choisit d'écrire (les liens sortants) — jamais sur le total affiché une fois les renvois symétriques calculés. Une fiche très centrale peut légitimement afficher plus de 3 renvois entrants : ce n'est pas une anomalie à corriger, c'est le reflet honnête de son importance dans le réseau.

   Ce que le rédacteur choisit s'arrête là : les retours symétriques d'un « voir aussi »/« à ne pas confondre », et l'affichage « vous retrouverez cette fiche dans » (quelles collections/parcours la citent), sont entièrement calculés à la lecture, jamais saisis à la main (`docs/MAQUETTE_LEXIQUE.md`, section 3). Une nouvelle fiche n'oblige donc jamais à rouvrir des dizaines d'anciennes.

   **Deuxième niveau de lecture (doctrine élargie 2026-08-17, remplace l'ancienne notion d'« approfondissement optionnel » réservé à quelques notions — voir section 11 pour l'historique).** Partie intégrante de la conception d'une fiche complète, pas une réponse à un besoin utilisateur observé après coup : décidé au moment même de la rédaction, pour chaque fiche. Question à se poser systématiquement : *cette fiche apporte-t-elle une vraie valeur pédagogique à être prolongée par une seconde couche de compréhension ?* Si sa suppression ne ferait perdre aucune compréhension, elle est probablement inutile — jamais ajoutée par défaut, jamais sur toutes les fiches. Sa forme dépend de la nature de la fiche, jamais d'un gabarit unique : exemples concrets, mises en situation, cas d'usage, illustrations, nuances utiles ou, lorsque c'est réellement pertinent, un approfondissement. Mêmes exigences que le premier niveau : contenu intemporel, aucune information susceptible de devenir obsolète rapidement, pas de procédure administrative détaillée, pas de conseil personnalisé, jamais une redite de la définition principale — priorité aux exemples et situations concrètes lorsqu'ils apportent plus de compréhension qu'un texte explicatif plus long. Le mécanisme technique est déjà construit et vérifié (`modules/lexique/ARCHITECTURE_TECHNIQUE.md`, étape 10) ; ce paragraphe ne couvre que la méthode d'écriture du contenu, qui s'applique lot par lot comme le premier niveau (section 10, « Extension progressive du corpus »). Corpus éditorial complet le 2026-08-17 : les 42 fiches de lancement disposent chacune d'au moins une entrée de second niveau.

   **Note datée (2026-08-19).** Le corpus s'est étoffé au-delà des 42 fiches de lancement (121 fiches au total) sans que les entrées de second niveau suivent au même rythme — 66 fiches en étaient dépourvues, constaté par Denis en usage réel. Complété en un lot, avec la même méthode et les mêmes gabarits de titre. Le corpus est désormais couvert à 100% (121/121), pas seulement les fiches de lancement. Détail : `modules/lexique/ARCHITECTURE_TECHNIQUE.md`, étape 10.

   **Niveau d'exigence du corpus, précisé 2026-08-17 : un Lexique riche plutôt que minimaliste, sur toutes les familles sans exception.** Un sujet qui mérite d'être développé doit l'être ; un exemple qui rend une notion concrète doit être ajouté ; une nuance qui évite une mauvaise compréhension mérite sa place — au premier niveau comme au second. Toute information ajoutée doit cependant répondre à au moins un critère réel : elle améliore la compréhension, répond à une question réellement fréquente, relie la notion à une situation concrète, évite une confusion fréquente, ou aide à comprendre le parcours, les droits, le monde du travail ou les attentes employeur. L'objectif n'est jamais la fiche la plus longue possible, mais la plus utile possible — la richesse ne remplace jamais la discipline déjà posée plus haut (test de stabilité, densité maximale, anti-remplissage). Si une notion s'avère trop large pour une seule fiche, la découper en plusieurs fiches reliées (mini-guide, comme envisagé pour la famille Bulletin de salaire) est préférable à une fiche généraliste qui perd en précision.
4. **Liaison** — poser « à ne pas confondre avec » / « voir aussi » oblige à relire les fiches connexes, moment naturel pour repérer une contradiction (notée dans un carnet si non bloquante, jamais corrigée dans l'urgence).
5. **Relecture qualité** — checklist courte et fixe : test de stabilité phrase par phrase, titre de tri distinct, univers et registre renseignés, pourquoi jamais comment si décryptage d'attentes employeurs, décrire le mécanisme jamais le qualifier (« obéit à des règles différentes » plutôt que « peut être rompue plus simplement »). Quand c'est pertinent, la fiche ouvre au moins deux portes de nature différente (un sujet proche, un sujet complémentaire) plutôt qu'une seule direction. Test final : en retirant mentalement le titre, le contenu reste-t-il assez spécifique pour qu'on reconnaisse le sujet ? Sinon, la définition est probablement encore trop générique.
6. **Publication** — aucun circuit de validation lourd, cohérent avec un module porté par une personne.
7. **Contrôle qualité du réseau** — pas une relecture de fiche, une relecture du corpus dans son ensemble, à faire périodiquement une fois qu'il grandit. Un outil automatique (à spécifier avec `ARCHITECTURE_TECHNIQUE.md` le moment venu, un simple script suffit) doit pouvoir signaler : une fiche sans aucun lien entrant ni sortant (probable oubli de liaison) ; une fiche dépassant la densité maximale (probable sur-liaison) ; une fiche jamais citée par aucune autre ni par aucune collection (orpheline côté réseau, même si elle a elle-même des liens sortants) ; deux collections dont l'ensemble de fiches se recoupe fortement ; un comparatif dont l'une des deux fiches comparées n'existe pas encore. Une anomalie détectée ne se corrige pas dans l'urgence, elle rejoint le carnet comme le reste.
8. **Vie dans le temps** — jamais de révision sur calendrier, seulement sur déclencheur réel (renommage officiel d'un dispositif, contradiction repérée, signalement d'une confusion).

---

## 10. MVP

Corpus de départ volontairement restreint : 30 à 40 fiches, choisies selon un critère précis, pas au hasard : *est-ce qu'un utilisateur a de fortes chances de rencontrer cette notion dès ses premières utilisations d'ERIP* — jamais « est-ce que cette notion est importante », un critère plus large qui aurait fait dériver le corpus de lancement vers une couverture de tous les domaines plutôt que vers la suppression des incompréhensions les plus immédiates. Le corpus de lancement ne cherche pas à représenter tous les univers, il cherche à répondre aux confusions rencontrées le plus tôt. Liste concrète et scores de priorité : `docs/CARNET_FICHES_LEXIQUE.md`.

Le module ne doit jamais attendre d'être « complet » pour être utile (doctrine, principe 6) — il grandit fiche après fiche, jamais par accumulation programmée.

**Extension progressive du corpus, au-delà du lancement (précisé 2026-08-17).** Les 42 fiches de lancement valident l'architecture technique et éditoriale du module, elles n'en représentent qu'une première partie. L'objectif reste d'étendre le Lexique jusqu'à couvrir l'ensemble des notions utiles rencontrées dans ERIP, sans jamais modifier les principes établis pendant ce chantier : mêmes gabarits éditoriaux, même niveau de langage, même discipline sur les relations et les comparatifs, mêmes règles de navigation, mêmes contrôles qualité automatiques (`scripts/checkLexique.js`), mêmes critères de stabilité. L'enrichissement se fait par lots cohérents (par domaine ou par famille), chacun relu et validé avant de poursuivre, pour ne jamais laisser la qualité se dégrader entre les premières fiches et les suivantes. L'ordre de priorité reste piloté par `docs/CARNET_FICHES_LEXIQUE.md` et par les usages réels d'ERIP (recherches sans résultat, nouveaux modules, retours de terrain, nouveaux dispositifs, évolutions réglementaires) — jamais par anticipation (doctrine, principe 6).

**Périmètre du « besoin réel » élargi (2026-08-17, voir `docs/DOCTRINE_LEXIQUE.md`, clarifications).** Le Lexique ne se limite plus au seul vocabulaire qu'un bénéficiaire croise dans un écran d'ERIP. Il a vocation à devenir une culture commune de l'accompagnement vers l'emploi : utile à un bénéficiaire, mais aussi à un CIP débutant, un stagiaire CIP, un conseiller débutant, un partenaire qui découvre le secteur, ou toute personne curieuse de comprendre cet écosystème. Concrètement, une notion, une méthode ou un outil professionnel (ex. les méthodes d'entretien et d'accompagnement) peut désormais recevoir une fiche si comprendre cette notion aide réellement à comprendre le monde de l'insertion, de l'accompagnement ou de l'emploi — même si un bénéficiaire ne la rencontre jamais directement dans ERIP. Ce n'est toujours pas une couverture systématique : chaque ajout continue de répondre au même test de nécessité (une vraie valeur de compréhension, jamais l'exhaustivité pour elle-même). Le module ne devient pas un manuel de formation des CIP — l'ambition reste une référence de compréhension, avec plusieurs profils de lecteurs possibles, jamais une doctrine pédagogique séparée pour chacun (doctrine, principe 5 : une seule définition sert tous les publics). Un débutant peut toujours s'arrêter à la définition principale ; qui veut aller plus loin le fait via le second niveau de lecture (étape 10) ou des fiches dédiées plus spécialisées, jamais via une fiche réécrite différemment selon le lecteur.

Le corpus n'est jamais considéré comme « terminé ». L'architecture est figée ; le contenu, lui, est conçu pour s'enrichir continuellement, au rythme des besoins réels des utilisateurs et de l'évolution du monde de l'emploi, de la formation et de l'insertion — le module peut être techniquement fini pendant que son corpus continue de grandir pendant des années, exactement comme une encyclopédie ou un dictionnaire.

---

## 11. V2 / plus tard

- Renvoi contextuel automatique depuis un mot rencontré ailleurs dans ERIP (analyse Regard extérieur, rapport Bilan CV) — techniquement fragile aujourd'hui (détecter fiablement un mot dans du texte généré librement par une IA externe), à reconsidérer si l'usage réel le justifie.
- Schémas ou diagrammes visuels (ex. qui fait quoi entre France Travail, Mission Locale, CAF) — coût de production différent, pas prioritaire.
- Traduction en d'autres langues — besoin probable, mais hors de portée d'un développeur seul pour l'instant.
- Export/impression d'une fiche ou d'une collection, pour un usage en atelier collectif CIP/formateur.
- Historique des dernières fiches consultées.
- Activation réelle du champ sous-thème, si un univers déborde en volume.
- Le registre affiché comme une petite aide pédagogique sur la fiche elle-même (« vous entendrez souvent ce terme dans le langage RH », « cette expression est surtout utilisée par France Travail »), au-delà de son rôle actuel de simple tag de classement.
- Une collection permanente « Comprendre le point de vue de l'employeur », regroupant nativement questions d'entretien, décryptages d'offres, attentes implicites et déroulé du recrutement — candidate naturelle vu l'importance déjà pressentie de ce domaine (section 4).
- ~~Second niveau de lecture~~ — **retiré de cette liste V2 (2026-08-17, changement de périmètre, pas un simple assouplissement)**. Proposé ici le 2026-08-17 sous le nom « approfondissement optionnel », c'est-à-dire un contenu plus long et spécialisé, réservé aux notions qui le justifieraient, gated par 3 conditions d'ouverture (MVP terminé, corpus à l'échelle, besoin utilisateur observé). En avançant sur le chantier, Denis a reconnu que ce n'était plus l'objectif réel : le second niveau n'est plus un chantier d'approfondissements optionnels répondant à un besoin observé après coup, mais une partie intégrante de la conception d'une fiche complète, dont la forme (exemples, mises en situation, cas d'usage, nuances, approfondissement si pertinent) dépend de la nature de la fiche. Les 3 anciennes conditions d'ouverture ne s'appliquent plus à cette définition élargie — elles portaient sur un chantier plus étroit qui n'est plus celui qu'on construit. Doctrine complète déplacée en section 9, « Méthode de fabrication d'une fiche », étape 3 (Rédaction) : ce n'est plus une idée à part, c'est une question que chaque fiche se pose au moment de son écriture.

---

## 12. Exclusions définitives

- Aucun appel à une IA en temps réel pour répondre à une recherche ou composer une explication (doctrine, principe 2).
- Aucun montant, durée, condition d'accès ou procédure susceptible d'évoluer (doctrine, principe 1).
- Aucun quiz, score ou auto-évaluation — contredit le principe déjà posé pour Repères de ne jamais classer ou noter la personne.
- Aucun portrait-type ou persona fictif (« Sophie, 34 ans... ») — risque narratif et infantilisant, hors du registre factuel du module.
- Aucun compteur « fiches les plus consultées » affiché à l'utilisateur — nécessiterait un backend qu'ERIP n'a pas ; Umami peut servir en coulisses à Denis pour prioriser l'écriture, jamais affiché dans l'application.
- Aucun mode de lecture différent selon le public (doctrine, principe 5).
- Aucune veille permanente ni obligation de relecture périodique (doctrine, principe 1 et section 6 ci-dessus).
- Aucune visibilité employeur/RH sur ce qu'un candidat a consulté — ERIP n'a pas de comptes, ne collecte aucune donnée de consultation individuelle, et ce serait une dérive de surveillance contraire à la Constitution d'ERIP.

---

## 13. Critères de réussite

- Le taux de recherches sans résultat diminue avec le temps, signe que les variantes de recherche s'enrichissent au bon endroit.
- Des CIP ou formateurs rapportent utiliser une fiche ou une collection en rendez-vous ou en atelier.
- Des fiches sont favorisées et d'autres envoyées vers Repères de façon organique, sans qu'on ait eu à l'expliquer.
- Un univers qui reste peu rempli plusieurs mois n'est jamais traité comme un échec — c'est la croissance organique qui fonctionne comme prévu (doctrine, principe 6).

La plus grande réussite attendue de cette architecture n'est ni la recherche, ni les parcours, ni les collections : c'est qu'un tout petit corpus (30 à 40 fiches bien choisies) apporte déjà une vraie valeur, et que chaque fiche suivante enrichisse l'ensemble sans jamais donner l'impression que le module est inachevé. Cette propriété est rare et doit être préservée à chaque décision future — jamais sacrifiée au nom d'une couverture plus large ou plus rapide.
