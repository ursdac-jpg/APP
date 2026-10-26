# Un CV, plusieurs métiers : les lettres (N2 et gabarit partagé), cadrage du 24/10/2026

Statut : **CODÉ le 24/10/2026** (cinq modèles, couleur et police du CV, lettres par groupes de 5 avec réception de la suite, prompt V8, recommandation transmise, pas d'objet). Reste : essais de Denis sur un vrai assistant (prompt V8, lettre de recommandation) et dans Word (cinq modèles), vraie impression de plusieurs lettres.
Maquette cliquable : `docs/MAQUETTE_UCPM_LETTRES_2026-10-24.html` (4 écrans : demande, collage en deux fois, relecture avec choix du modèle, téléchargement).

## Ce que l'audit a trouvé

- `prompts/ucpm-lettres.md` (version 7) est déjà exigeant : VOUS / JE / NOUS, pas de qualité inventée, ouvertures variées, objectif repris, destinataire nommé si connu. Il génère tout d'un coup, sans échange.
- Les lettres sont mises en page par `ucpmHtmlLettre` (`modules/un-cv-plusieurs-metiers/logiqueDocuments.js`) : un seul modèle classique, aucun choix de gabarit ni de couleur. C'est une **copie** du système de gabarits de la lettre (dette à inscrire dans `BRIQUES_COMMUNES.md`).
- Les générateurs de gabarits (`GENERATEURS_DOCX_NATIFS_LETTRE`) prennent déjà un objet lettre en entrée ; seul `construireObjetLettrePourExportFormat` lit le dossier global. Réutilisation faisable : donner à chaque lettre son objet (identité, texte, destinataire, couleur et police de son CV), produire son Word, l'afficher par docx-preview, puis la placer dans son compartiment du document imprimé (une lettre par page). **À confirmer par un essai avant tout le reste** (une lettre, puis sept).
- Plusieurs lettres dans un message : le code sait déjà recevoir des lettres manquantes et fusionner (`ucpmFusionnerLettres`, `lettresManquantes`) ; il manque la consigne « tapez oui » dans le prompt, le message sur la page et la zone de collage de la suite.

## Ce que la maquette propose

1. **Les cinq modèles de la lettre seule, pour toutes les lettres du module** (décision de Denis, 24/10) : Sobre, En-tête et filet, Colonne colorée, Bandeau coloré, Titre et informations. Choix unique, appliqué à toutes les lettres, aperçu fidèle, mêmes avertissements Word que la lettre seule (Colonne colorée : Word peut différer).
2. **Couleur et police de chaque lettre = celles de son CV** (cohérence d'ensemble voulue par Denis).
3. **Plus de 5 lettres : deux envois.** Le prompt demande les 5 premières, finit par « pour recevoir la suite, écrivez oui », la page annonce « 5 lettres reçues sur 7 » et ouvre une zone pour coller la suite.
4. Téléchargement : un seul PDF de toutes les lettres (modèle choisi), un CV avec sa lettre (même modèle), Word en un fichier par lettre.

## Enrichissement du prompt (N2), proposition

À reprendre de `lettre-co.md`, sans dialogue et sans exemple de rendu (la V5 a montré qu'un exemple est recopié) :
- **Plan silencieux avant d'écrire** : pour chaque lettre, choisir 3 ou 4 faits du profil, chacun placé dans un seul paragraphe (« un fait, un seul paragraphe »).
- **Recette en phrases** : phrases de 15 à 25 mots, un fait par phrase, quatre paragraphes (accroche, VOUS, JE, NOUS et clôture), longueurs selon l'objectif déjà fixées.
- **Contrôle avant de répondre** : pas de répétition d'idée ni de groupe de trois mots d'un paragraphe à l'autre ; le VOUS est concret ou sobre ; le NOUS est à double sens ; rien d'inventé (« où est-ce écrit ? ») ; formule de politesse complète.
- **Objet** : à décider (aujourd'hui le module n'en a pas ; la lettre seule en a un).
- **Lettre de recommandation** : à décider si la lettre de référence du stock commun est aussi transmise ici.
- Découpage par 5 (voir ci-dessus).

## Précision de Denis (24/10) : colonne et bandeau portent les informations

Dans « Colonne colorée », « Bandeau coloré » et « Titre et informations », la zone colorée n'est pas décorative : elle contient le nom, le poste visé et les informations de la personne, disposés autrement pour gagner de la place. Les vrais gabarits de la lettre le font déjà (colonne : nom, poste, « Informations de contact » ; bandeau : nom, poste, lignes de contact). La première maquette montrait des aperçus vides : corrigée, les aperçus sont maintenant de vraies lettres réduites. Pour ce module, le poste affiché est le titre du CV de chaque lettre (à vérifier au codage : `poste` vient de `metierCible` ou `titreCV` du dossier prêté à chaque CV).

## Essai de faisabilité (24/10/2026) : réussi

Dans l'application, avec un dossier d'essai dont le CV a la couleur #9B2C3D : les cinq gabarits produisent chacun un Word d'une page, rendu par docx-preview ; pour En-tête et filet et Bandeau coloré, la couleur du CV se retrouve dans le rendu. Le module sait déjà prêter à chaque CV son propre dossier (`ucpmAvecDossier`), donc la couleur et la police de chaque CV seront lues au bon endroit. Reste à écrire : le rendu de la lettre par ce chemin, son placement dans le document imprimé, le choix du modèle, le prompt, la page de collage en deux fois, les tests.

## Décisions à prendre par Denis

1. ~~Les modèles retenus~~ : TRANCHÉ, les cinq, avec la couleur du CV.
2. L'objet de la lettre : l'ajouter ou non (recommandation : non, comme aujourd'hui).
3. La recommandation : transmise ou non dans ce module (recommandation : oui, la lettre de référence déjà déposée, sans nouveau panneau).
4. Effort et ordre : essai de faisabilité (une lettre rendue par un gabarit dans le module), puis prompt, puis page, puis tests. Effort haut.

## Ce qui a été codé (24/10/2026)

- `construireFeuilleLettreGabarit` / `sectionsLettreDepuisDocx` (`js/app.js`) : rendu partagé avec la lettre seule, mise en page mesurée pour une page.
- `ucpmRendreLettre` (`dossierEchange.js`), `ucpmPreparerDossierLettre` et `ucpmPoliceLettreDepuisCv` (`logiqueDocuments.js`, testés).
- Page 6 : choix du modèle (cinq aperçus réels de la lettre en cours), avertissement Word pour la colonne colorée.
- Page 7 : le PDF des lettres et « un CV avec sa lettre » utilisent le modèle choisi.
- Découpage par 5 : `UCPM_LETTRES_PAR_REPONSE`, `ucpmIdsEnAttenteDeSuite` (testés) ; au-delà de 5 CV, un message « Allez sur la page de l'assistant pour récupérer la suite » et une zone de collage de la suite ; jusqu'à 5 CV, aucun message. Les lettres déjà reçues ne sont jamais remplacées.
- Prompt `ucpm-lettres.md` version 8 : plan silencieux, un fait dans un seul paragraphe, phrases de 15 à 25 mots, contrôle avant de répondre, lettre de recommandation (section ajoutée en fin de message), livraison par 5.
- Non fait : Word par lettre (un fichier par lettre), noté dans la maquette seulement.
