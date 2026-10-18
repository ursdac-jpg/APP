# Mon territoire : proposition de chantier pour ouvrir avec la Dordogne ET la Haute-Vienne

> Préparée le 2026-10-12 après la demande de Denis : pas de message « spécifique à un département », pas une seule tuile, et un remplissage par des prompts.
> Cette proposition n'est **pas lancée** : elle attend le feu vert de Denis. Le module reste fermé au public.

---

## 1. Ce que dit le code réel (audit, pas supposition)

| Constat | Détail | Conséquence |
|---|---|---|
| Le module est écrit pour **un seul département** | `modules/mon-territoire/index.js` contient une vingtaine d'endroits qui disent « Dordogne » ou testent `'24'` (titres « en Dordogne », blocs « Dans la Dordogne, ces structures peuvent vous aider », choix de la commune, fiches du Lexique, bouton « Voir dans Mon territoire ») | Ajouter la Haute-Vienne n'est pas seulement ajouter des lignes de données |
| Un écran « territoire non couvert » existe pour la Haute-Vienne | `_mtHorsZone()` | C'est le message que Denis ne veut plus : à retirer pour la Haute-Vienne, à garder, avec une phrase neutre, pour les autres départements |
| **Pas de fichier des communes de la Haute-Vienne** | seul `communes-24.txt` existe (503 communes + intercommunalités) ; il sert au choix de la commune et au contrôle des adresses d'employeurs | À créer, de la même façon (API Géo, Licence Ouverte) |
| Haute-Vienne : **17 structures locales** connues contre **73** en Dordogne | elles sont encore dans les collectes de « Comprendre le cadre », pas dans le répertoire | À migrer avec l'outil existant, puis à compléter |
| Employeurs : **5 enseignes**, toutes à Bergerac, un seul secteur | 3 sans date | À remplir : c'est l'essentiel du travail |
| L'outil de veille n'accepte qu'**une fiche à la fois** | formulaire « Ajouter une fiche » | Intenable pour des centaines de lignes : il faut un import par lot |
| Aucun téléphone n'est saisi | colonne vide pour les 110 structures | Se règle avec le prompt 5 (lots de 15) puis la vérification |

---

## 2. Les lots de travail

| Lot | Contenu | Simple / risqué | Effort | Maquette nécessaire ? |
|---|---|---|---|---|
| **L1** | Communes et intercommunalités de la Haute-Vienne (API Géo) ; le contrôle des communes d'employeurs lit les deux fichiers | Simple : reprise de l'existant | bas | Non |
| **L2** | Migrer les 17 structures locales de la Haute-Vienne dans `lieux.txt` (outil de migration existant), avec essai navigateur | Simple | bas | Non |
| **L3** | **Import par lot** dans l'outil de veille : coller des lignes, voir pour chacune « acceptée » ou « refusée, pourquoi », rien n'est écrit si le lot est refusé, « Annuler la dernière publication » déjà existant | Moyen : nouvelle interface dans un outil que Denis a déjà eu du mal à utiliser | haut | **Oui** (maquette et questions avant code) |
| **L4** | **File « à vérifier »** : les lignes importées sans date, un bouton qui ouvre le site, « Valider » = date du jour (le bouton existe déjà, il manque le filtre et l'ordre de travail) | Simple | moyen | Courte |
| **L5** | **Rendre le module à deux départements** : retirer « territoire non couvert » pour la Dordogne et la Haute-Vienne, titres et blocs qui disent le département choisi, commune cherchée dans le bon fichier, blocs insérés dans les fenêtres et le Lexique pour les deux, phrase neutre pour les autres départements | **Risqué** : une vingtaine de points dans un fichier central, ils touchent aussi « Comprendre le cadre » et le Lexique. Couvert par les 18 essais navigateur existants, qu'il faudra adapter et doubler pour la Haute-Vienne | haut | Non (textes à faire valider) |
| **L6** | Seuil d'ouverture, geste d'ouverture et aide contextuelle | Simple | bas | Non |

**Ordre conseillé** : L1, L2 (rapides, utiles tout de suite) puis L3 (c'est lui qui débloque le remplissage), L4, enfin L5 (le plus risqué, mieux vaut le faire quand les données arrivent, pour tester avec du vrai contenu). L6 à la fin.

**Point bloquant potentiel** : si Denis veut tout ouvrir avant l'entretien du 15 octobre, ce n'est pas réaliste (L3 et L5 demandent chacun une séance complète, et les données ne sont pas là). Pour l'entretien, la solution est de montrer le module **en aperçu sur son poste**, fermé au public, avec ce qui est déjà rempli.

---

## 2bis. Avancement et principe « le discours s'adapte au département » (ajouté le 2026-10-12, nuit)

**Faits** : L1 (communes de la Haute-Vienne : 195 communes, `communes-87.txt`, l'outil de veille contrôle les communes de tous les départements) et L2 (les 17 structures de la Haute-Vienne migrées, avec la règle `mtLieuxVisibles` qui empêche qu'un département voie les structures d'un autre) sont **faits**.

**Principe de formulation, demandé par Denis, pour le lot L5** : le module ne doit jamais écrire « Dordogne » ou « Haute-Vienne » en dur, car d'autres départements suivront. Une **table des départements** dans `logique.js` (code, nom, article et formes toutes faites : « en Dordogne », « dans la Haute-Vienne », fichier des communes, `ouvert` oui ou non) sera la seule source de ces mots. Tous les titres, blocs et phrases sont **construits à partir de cette table** et du département choisi par la personne :
- « Logement, **{en Dordogne}** » devient « Logement, {dans la Haute-Vienne} » ;
- « {Dans la Dordogne}, ces structures peuvent vous aider » suit le département ;
- pour un département **sans liste**, une phrase neutre construite avec le nom du département choisi et la liste des départements ouverts : « Nous n'avons pas encore de liste pour {le département}. Elle existe pour : {Dordogne, Haute-Vienne}. » ; elle disparaît d'elle-même quand le département passe à `ouvert` ;
- **ajouter un département = ajouter une ligne à la table, un fichier de communes et les structures** (aucun changement de code).

Les formes grammaticales (« en », « dans le », « dans la », « dans l' ») sont saisies dans la table, jamais devinées, pour éviter les fautes (« en Haute-Vienne » est incorrect, « dans la Haute-Vienne » est juste).

---

## 3. Les options A, B, C de la liste de contrôle, expliquées simplement

La liste de contrôle posait une question : *le volet « employeurs » est presque vide (5 enseignes), faut-il ouvrir quand même ?*

- **A. Ouvrir tout de suite, avec ce qui existe** : la personne voit les 110 structures, et 20 secteurs d'employeurs « Pas encore de liste ».
- **B. Ouvrir en cachant la tuile « Emploi »** tant qu'elle est vide.
- **C. Attendre** que les employeurs soient remplis.

**Depuis que Denis a précisé qu'il remplira les deux départements et qu'il ne veut ni message « un seul département » ni une seule tuile visible, la réponse est : C, avec un seuil précis.** On n'ouvre pas à moitié ; on ouvre quand les deux départements sont remplis à un niveau décidé à l'avance. A et B n'ont plus de raison d'être.

### Seuil d'ouverture proposé (à valider par Denis)
Pour **chacun** des deux départements :
1. au moins **40 structures** vérifiées, qui couvrent au moins **12 des 17 rayons** ;
2. au moins **8 secteurs d'employeurs** avec au moins **5 fiches vérifiées** chacun, dans au moins un bassin ;
3. au moins **les 3 structures les plus demandées** (France Travail, Mission locale, CAF) avec adresse **et téléphone** vérifiés.

Tant que le seuil n'est pas atteint pour un département, le module reste fermé pour tous (pas de demi-mesure).

---

## 4. Ce que cela demande à Denis, concrètement

1. **Utiliser les prompts** (voir `PROMPTS_REMPLISSAGE_MON_TERRITOIRE_2026-10-12.md`) et me rapporter les réponses telles quelles.
2. **Photographier le carnet de sa tutrice**, après son accord et le retrait de tout nom de personne.
3. **Lors de l'entretien du 15 octobre** : demander aux partenaires de relire les listes de leur territoire et les zones des Missions locales.
4. **Valider** : le seuil, la maquette de l'import par lot, les textes qui changent (phrases de la tuile et de la présentation).

---

## 5. Franchise sur la faisabilité

- **Faisable et sans surprise** : L1, L2, L4, L6.
- **Faisable mais délicat** : L5 (modification d'un fichier central) et L3 (outil que Denis utilise seul). Ils seront livrés avec essais et avec un retour arrière simple (module fermé tant que l'ouverture n'est pas décidée).
- **Ce qu'on ne peut pas promettre** : que les assistants (ChatGPT, Perplexity) donnent des listes exactes. Ils produisent des candidats ; la vérification datée est le vrai travail, et c'est elle qui limite le volume.
- **Volume réaliste** : le plafond n'est pas un nombre par secteur mais ce que Denis sait revérifier chaque année (décision du 2026-10-01). Le seuil ci-dessus (8 secteurs x 5 fiches x 2 départements, soit environ 80 employeurs, plus une centaine de structures par département) représente plusieurs dizaines d'heures de vérification, à étaler.
