# Cadrage etape 5 : « Assistant » + « Vos documents »

> Refonte du parcours guide, etape 5 (la derniere page). Etat des lieux + decoupage
> propose, AVANT code. Reference : `docs/PLAN_CONSOLIDE_REFONTE_PARCOURS_GUIDE_2026-09-02.md`
> section 5 + section 10, `docs/ENQUETE_VOS_DOCUMENTS_2026-09-02.md`.
> Maquettes validees Denis 2026-09-02 : `MAQUETTE_VOS_DOCUMENTS` v3, `MAQUETTE_ASSISTANT`
> v5, `MAQUETTE_COORDONNEES` v1, `MAQUETTE_MISE_EN_PAGE` v6.

---

## 1. Ce que devient l'etape 5

Aujourd'hui `pageResultats()` (route `resultats`, ~870 lignes) fait 4 metiers a la
fois sur une seule route : preparer l'envoi a l'assistant, choisir/importer la
reponse, mettre en forme le CV, exporter. La barre affiche un jalon « Assistant »
qui ne mene a **aucune page** (`_creerCvNavIndex` ne renvoie jamais 4).

**Decision Denis (option B, tranchee) : on coupe en 2 routes.**

| Route | Fonction | Contenu |
|---|---|---|
| **`assistant`** (nouvelle) | `pageAssistant()` (nouvelle) | 4 rectangles depliables : Reglez le style · Choisissez votre assistant · Importer la reponse · Choisir ce qui ira sur le CV |
| **`resultats`** = « Vos documents » | `pageResultats()` (fortement allegee) | Le format · La mise en page · Exporter · « Et maintenant ? ». **Plus aucun verrou** : tout accessible des l'arrivee. |

Barre 6 reperes (deja ecrite dans `CREER_CV_NAV_ETAPES`) :
Votre objectif · Votre parcours · Vos informations · Votre profil · **Assistant** ·
Vos documents.

---

## 2. La frontiere : ce qu'on touche / ce qu'on reutilise tel quel

### On refond (structure, en-tete, vocabulaire, enchainement, lecture)
- Le decoupage en 2 routes + la nouvelle `pageAssistant()`.
- L'en-tete et le titre unique (fin du « Creer mon CV » en h1, la barre dit deja
  « Vos documents »).
- Le relogement des 4 blocs assistant dans les rectangles de `pageAssistant`.
- « Vos documents » format-first (3 rectangles) + retrait des verrous.
- La carte Coordonnees : plus de formulaire, bandeau de renvoi seulement si vide.
- Retrait du pave « Resume de votre candidature » (recoupe « Votre profil en bref »).
- Retrait de `boutonRessourcesFin` (« ateliers / formations / immersions »), un seul
  bouton cible.

### On reutilise SANS reecrire (machinerie interne, deja auditee/close ailleurs)
- `etatAccordeon` / `etatAccordeonValide` / `accordeonPourType` / `avancerEtape`
  (moteur d'etapes) : reste la source de verite commune aux 2 routes.
- La cascade assistant : `ouvrirFenetreAssistantIA`, `_etatTransitionIA`,
  `htmlBanniereTransitionIA`, **`ouvrirAssistantDepotCV` jamais modifie**.
- L'import : `htmlCollageInstantane`, `analyserReponseIACV/Lettre/Entretien`,
  `genererResumeImportCV`.
- L'ecran a 9 onglets : `ouvrirEcranChoixReponseIACV` + `GROUPES_ONGLETS_CHOIX_IA_CV`
  + `contenuListeRecommandationsIA` + famille. **Re-loge dans un rectangle**, pas
  reecrit.
- Le Composeur / l'Apercu / les panneaux perso PDF & Word :
  `construireContenuApercuFinalisation`, `etatApercuInline`,
  `genererCartesSelecteurModeles`, `cvPdfPanneauReglages.js`, « Projet XXL »…
  Reemployes tels quels. Leur refonte en 3 niveaux = chantier separe deja
  audite (`AUDIT_PANNEAUX_PERSONNALISATION_CV_2026-09-01.html`).
- L'export : `construireContenuExportDocument`, `marquerDocumentEnregistre`,
  `genererCSVCanva` (Canva = deja la, via CSV « Bulk Create »).
- `texteProfil()` / `texteProfilEffectif()` / `dossier.profilTexteManuel` : le
  bouton « relire le texte exact » devient discret (§10.5) mais garde ce moteur.

### Nouveau code hors squelette
- **ODT** : l'export `.odt` (LibreOffice) n'existe pas aujourd'hui. A chiffrer.
- **`dossier.situationActuelle`** : le champ « Votre situation en ce moment »
  (facultatif, jamais un diagnostic, transmis seulement si rempli) n'est pas
  cable. Petit ajout dans le rectangle « Reglez le style » + dans `texteProfil`.

---

## 3. Deja fait dans les etapes precedentes (a ne pas refaire)
- **Bloc « Vos experiences professionnelles »** deplace sur « Vos informations »
  (`CONFIG_BLOC_EXPERIENCES_PRO`, etape 3.2/3.3). Donc `sectionExperiences` de
  `pageResultats` **disparait** (elle etait deja restreinte a Decouverte).
- **Barre 6 reperes** : `CREER_CV_NAV_ETAPES` a deja 6 entrees. Il manque juste
  `_creerCvNavIndex` : `case 'assistant': return 4;`.

---

## 4. Decoupage propose (a valider)

| # | Sous-etape | Contenu | Risque |
|---|---|---|---|
| **5.1** | Route `assistant` + squelette `pageAssistant()` | route dans `routes`, `_creerCvNavIndex` (`assistant`→4), navigation `revelation` → `assistant` → `resultats`, 4 rectangles depliables (contenu stub), barre 6 reperes branchee. Variantes : ne se branche que pour `nouveau` d'abord. | moyen |
| **5.2** | Rectangle 1 « Reglez le style d'ecriture » | reloger `accordeonAdaptation` allege : 5 reglages avec valeurs par defaut (jamais « facultatif »), **niveau du poste a choisir**, **situation facultative** (`dossier.situationActuelle`), bouton « Ces reglages me conviennent ». Ecrit `dossier.preferencesIAParType`. | moyen |
| **5.3** | Rectangle 2 « Choisissez votre assistant » | reloger `accordeonChoixIA` (pastilles sans compte / avec compte, « ce qui va se passer », confidentialite, declencheur video) + **bouton discret** « Voir ou modifier le texte transmis a l'assistant » (= ex-« Verifier les informations » : `texteProfil` / `profilTexteManuel` / bandeau version personnalisee). | moyen |
| **5.4** | Rectangle 3 « Importer la reponse » | reloger `accordeonImportIA` (banniere retour, `htmlCollageInstantane`, parsing, « effacer et recoller », cas `echec_parsing` sans cul-de-sac). | faible |
| **5.5** | Rectangle 4 « Choisir ce qui ira sur le CV » | reloger l'ecran a **9 onglets** DANS la page (jamais une fenetre) : `ouvrirEcranChoixReponseIACV` & famille, ouvert auto apres import, « Je valide ces choix » -> « Continuer vers Vos documents ». Icone onglets, jamais de visage. | eleve |
| **5.6** | `pageResultats` = « Vos documents » squelette | titre unique, retrait des 4 accordeons partis (adaptation / infos-ia / choix-ia / import-ia), retrait des verrous (« valider chaque rectangle », « telecharger avant de continuer »), retrait `sectionExperiences` + « Resume de votre candidature » + `boutonRessourcesFin`. Coordonnees -> bandeau si `identiteEntierementVide()` sinon rien. 3 rectangles : Le format · La mise en page · Exporter + « Et maintenant ? » garde. | eleve |
| **5.7** | Rectangle « Le format » | « Word ou PDF ? » + 1 phrase honnete (Word se retouche / PDF fige mais travaille) + « emporter le contenu ». Une fois choisi : rectangle replie « Format : PDF - Changer ». Pose `dossier` (format cible). | faible |
| **5.8** | Rectangle « La mise en page » | **Version courte pour ce chantier** : rappel des reglages actuels + apercu + bouton « Regler la mise en page » qui ouvre le Composeur / panneau perso EXISTANT du format choisi (reutilise tel quel), retour ici ensuite. Aucune option grisee « dispo en PDF » cote Word. **La maquette 3 niveaux (`MAQUETTE_MISE_EN_PAGE`, 67 reglages) = sous-chantier a part** (voir Q3). | moyen |
| **5.9** | Rectangle « Exporter » | le **format deja choisi** (un seul bouton de telechargement) + « Copier le texte » + « Envoyer vers Canva » (`genererCSVCanva` existant) + « Telecharger en ODT » (**nouveau code**) + « Faire aussi une version [autre format] » (report des reglages transposables). | moyen (ODT) |
| **5.10** | Variantes + passe finale | `maj` / `pret` / Decouverte re-cables sur les 2 routes (paramMetres, jamais forkes), Umami repere/conserve, passe navigateur bout-en-bout des 4 contextes, `npm test`. | eleve |

---

## 5. Questions a trancher avec Denis avant 5.1 — TRANCHEES 2026-09-03

- **Q1 (maj/pret)** : `pageAssistant()` sert **`nouveau` seulement**. `maj` et `pret`
  gardent leur wizard `ouvrirAssistantDepotCV` tel quel (deja teste, hors perimetre).
- **Q2 (ODT)** : le bouton « ODT » **renvoie au « Copier le texte »** + explication
  « collez dans LibreOffice / Google Docs, enregistrez en .odt ». Le vrai fichier
  .odt genere = tache separee ulterieure.
- **Q3 (mise en page)** : le rectangle « La mise en page » **reloge le Composeur /
  panneau perso EXISTANT** (bouton « Regler » qui l'ouvre, retour ici). L'implementation
  de `MAQUETTE_MISE_EN_PAGE` (3 niveaux) = chantier suivant distinct.
- **Q4 (Choisir ce metier)** : reste masque (`_choixMetierCibleMasque`), coherent
  avec « le metier se change a Votre objectif ».

### Detail des questions (historique)

1. **`maj` et `pret` et la route `assistant`.** Ces 2 parcours ont deja leur
   propre cascade assistant (`ouvrirAssistantDepotCV`, wizard de fenetres, jamais
   modifie) et leurs barres `MAJ_CV_NAV_ETAPES` / `PREPARER_LETTRE_ENTRETIEN_NAV_ETAPES`
   ont « Assistant » a l'index 1, AVANT d'atterrir sur les pages. Est-ce que la
   nouvelle `pageAssistant()` remplace ce wizard pour `maj`/`pret` aussi, ou est-ce
   qu'elle ne sert QUE le parcours `nouveau` (les 2 autres gardent leur cascade
   telle quelle) ? **Ma reco : `pageAssistant` pour `nouveau` seulement dans un
   premier temps** ; `maj`/`pret` gardent leur wizard (deja teste, hors perimetre),
   on verra ensuite si on les aligne. Sinon 5.1 devient beaucoup plus lourd.

2. **ODT.** L'export `.odt` n'existe pas. Options : (a) vrai fichier ODT genere
   (LibreOffice = XML zippe, ~1 journee de code + tests) ; (b) pour l'instant, le
   bouton « ODT » renvoie vers « Copier le texte » + une explication « collez dans
   LibreOffice / Google Docs » ; (c) on repousse ODT a plus tard, on livre 5.9
   avec PDF + Word + Copier + Canva seulement. **Ma reco : (b) maintenant, (a) en
   tache separee.**

3. **« La mise en page » (rectangle 5.8).** La maquette `MAQUETTE_MISE_EN_PAGE` v6
   (67 reglages, 3 niveaux : rapide / ajuster / details) est validee, mais la
   decision §10.6 dit que la refonte du Composeur en 3 niveaux « reste le chantier
   separe deja audite ». Deux lectures possibles :
   - **(A, ma reco)** : etape 5 se contente de **reloger le Composeur / panneau
     perso EXISTANT** dans le rectangle « La mise en page » (bouton « Regler » qui
     l'ouvre, retour ici ensuite). L'implementation de la maquette 3 niveaux =
     chantier suivant, distinct.
   - **(B)** : on implemente `MAQUETTE_MISE_EN_PAGE` dans cette etape 5 (gros
     travail supplementaire, ~la moitie de l'etape a lui seul).

4. **« Choisir ce metier » dans « Pourquoi ces metiers ? »** (reste de l'etape 4) :
   il est masque par `_choixMetierCibleMasque`. Coherent avec « le metier se
   change a Votre objectif ». A confirmer ou revenir dessus.

---

## 6. Non-negociables rappeles pour cette etape
- Jamais le mot « IA » visible, jamais d'icone visage (l'ecran a onglets = icone
  onglets 📑).
- Mode sombre sur tout nouveau composant.
- Variantes `nouveau` / `maj` / `pret` + Decouverte a l'identique (comportements
  listes enquete section 6).
- `js/app.js` non couvert par les tests Node -> test navigateur obligatoire, les
  4 contextes, bout en bout.
- Un commit par sous-etape, `npm test` + navigateur avant la suivante.
