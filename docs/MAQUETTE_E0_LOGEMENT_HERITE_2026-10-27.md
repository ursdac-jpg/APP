# E0 : « J'ai hérité d'un logement sans pouvoir l'entretenir : à qui m'adresser » (maquette, 2026-10-27)

Mode A, `[effort : haut]`. **Rien n'est codé ni écrit dans l'application.** Cette maquette attend les décisions de Denis (section 4).

## 1. Audit (code lu, pages officielles ouvertes le 2026-10-27)

**Dans l'application aujourd'hui.** Aucune mention de l'Anah, de MaPrimeRénov', de MaPrimeAdapt' ni de France Rénov' dans `data/`, `modules/`, `js/` ni `prompts/` (recherche sur tout le dépôt). Existent déjà : `adil-dordogne` et `asso-soliha-dordogne` (SOLIHA : « rénover et adapter son logement ») dans le registre des structures ; `france-renov-national` et `action-logement-prets-salaries-national` dans le sas (date vide) ; huit fiches du rayon logement (Visale, aides CAF, DALO, expulsion...), aucune sur « propriétaire sans moyens d'entretenir ».

**Pages officielles lues.**

| Sujet | Page | Résultat |
|---|---|---|
| MaPrimeRénov' (propriétaires occupants) | service-public.gouv.fr, fiche F35083, « vérifiée le 1er septembre 2026 » | Lue en entier : conditions, plafonds, taux, démarche, numéro France Rénov' |
| Anah | anah.gouv.fr (accueil) | Lue : mission, quatre aides (MaPrimeRénov', MaPrimeAdapt', MaPrimeLogement Décent, Loc'Avantages), France Rénov' comme porte d'entrée |
| Prêt travaux Action Logement | actionlogement.fr/le-pret-travaux-amelioration | Lue en entier |
| Prêt accession Action Logement | actionlogement.fr/le-pret-accession | Lue en entier |
| ADIL | anil.org, réseau des ADIL | Lue : conseil gratuit et neutre, aides aux travaux citées |
| France Rénov' | france-renov.gouv.fr | **Non lue** : erreur de certificat du site. Le numéro et le rôle sont confirmés par la fiche de Service public |
| MaPrimeAdapt' | economie.gouv.fr, page dédiée | **Non lue** (accès refusé) ; seules des sources non officielles l'ont décrite |

**Deux écarts avec les diapositives remises.**
1. Le prêt accession : la page officielle **ne mentionne aucune garantie de rachat ni de relogement**, seulement l'assurance emprunteur. Je ne publie donc pas ces garanties.
2. L'ADIL : la page ne cite ni la succession ni l'indivision. Je n'écris pas que l'ADIL conseille sur l'héritage.

## 2. Verdict de faisabilité : GO AVEC RÉSERVES, NON APTE AU MODE NUIT

- **Simple (reprise de l'existant)** : le patron « à qui s'adresser » (`logement-sans-hebergement-urgence`), les fiches du Lexique avec bloc « Les chiffres à jour » (`detailsAJour`, contrôlé par `checkLexique`), les lignes du sas et du registre, les renvois automatiques entre fiches du Cadre et du Lexique.
- **Risqué** : (a) les fiches de « Comprendre le cadre » n'ont **pas** de bloc de chiffres : tout chiffre doit donc aller dans des fiches du Lexique, pas dans la fiche du Cadre ; (b) MaPrimeAdapt' n'est pas confirmée par une page officielle ; (c) le texte doit décrire qui fait quoi sans jamais dire à la personne quoi faire.
- **Bloquant** : rien de technique. Les décisions de la section 4 ouvrent la suite.

## 3. Maquette

**3.1 Fiche « Comprendre le cadre », rayon logement** (une seule, sans aucun chiffre).

> **J'ai hérité d'un logement sans pouvoir l'entretenir : à qui m'adresser**
> *Utile si vous êtes propriétaire de votre logement, par héritage ou autrement, et que vous n'avez pas les moyens de payer les travaux.*
>
> Quand on est propriétaire d'un logement et qu'il faut y faire des travaux, plusieurs acteurs existent, chacun pour un besoin différent.
>
> **France Rénov'** est le service public gratuit qui informe les propriétaires sur les travaux de rénovation et d'adaptation du logement. C'est la porte d'entrée vers les aides de l'Anah.
>
> **L'Anah** (Agence nationale de l'habitat) accorde des aides aux propriétaires qui occupent leur logement, selon leurs ressources : MaPrimeRénov' pour les travaux d'économie d'énergie, MaPrimeAdapt' pour adapter le logement, MaPrimeLogement Décent pour le mettre en sécurité. Ces aides se demandent en passant par France Rénov'.
>
> **Action Logement** propose, aux salariés de certaines entreprises du secteur privé, des prêts à conditions avantageuses pour des travaux ou pour acheter, et un service d'accompagnement social gratuit et confidentiel quand le logement est en difficulté.
>
> **L'ADIL** de votre département donne un conseil gratuit et neutre sur le logement, y compris sur les aides aux travaux. **SOLIHA** est une association qui accompagne la rénovation et l'adaptation des logements.
>
> Les conditions, les montants et les plafonds de chaque aide sont dans les fiches du Lexique ci-dessous.
>
> *Voir aussi (Lexique)* : MaPrimeRénov' · MaPrimeAdapt' · Prêts d'Action Logement pour les salariés propriétaires.
> *Qui fait quoi (Près de chez moi)* : ADIL de la Dordogne, SOLIHA Dordogne-Périgord, Action Logement, France Rénov'.

**3.2 Trois fiches du Lexique, avec bloc « Les chiffres à jour »** (le texte de fond sans chiffre, les chiffres dans le bloc daté).

| Fiche | Texte de fond | Bloc daté (valeurs lues) |
|---|---|---|
| **MaPrimeRénov'** | aide de l'Anah pour des travaux de rénovation énergétique, deux formules (rénovation d'ampleur, travaux par geste), accompagnement possible par un professionnel agréé | ancienneté du logement 15 ans ; résidence principale ; classe DPE E, F ou G pour la rénovation d'ampleur ; gain de 2 classes ; taux par catégorie de ressources (80 / 60 / 45 / 10 %) ; plafond de dépenses 30 000 € ; plafonds de ressources pour une personne ; numéro France Rénov' 0 808 800 700 ; source Service public, vérifiée le 1er septembre 2026. **Les 8 lignes au plus** (plafond du contrôle) : je choisis les plus utiles. |
| **MaPrimeAdapt'** | aide de l'Anah pour adapter le logement à l'âge ou au handicap | **Pas de bloc tant que la page officielle n'est pas lue** : à lire par Denis ou à rouvrir avec un autre accès |
| **Prêts d'Action Logement pour les salariés propriétaires** | prêt travaux et prêt accession, à conditions avantageuses, pour les salariés d'entreprises du secteur privé | travaux : jusqu'à 10 000 €, 1,5 %, 10 ans au plus ; accession : jusqu'à 30 000 €, 1 %, 25 ans au plus ; entreprise d'au moins 10 salariés ; plafonds de ressources ; source Action Logement, lue le 2026-10-27 |

**3.3 Registre des structures et sas** : ajouter le numéro 0 808 800 700 à la ligne `france-renov-national` du sas (date vide, à confirmer) ; aucune nouvelle ligne.

## 4. Décisions à prendre (une à la fois)

**D1. Où vit la fiche ?**
- **(Recommandé) Une fiche du Cadre sans chiffre + trois fiches du Lexique avec chiffres.** Bénéfice : respecte la doctrine (chiffres seulement dans un bloc daté, masqué automatiquement quand il est périmé) et chaque mot (MaPrimeRénov') est trouvable seul dans la recherche. Risque : quatre fiches à tenir à jour au lieu d'une.
- **Une seule fiche du Cadre avec les chiffres dans le texte.** Bénéfice : un seul endroit. Risque : contredit la règle « jamais de chiffre dans le texte » ; chiffres périmés visibles sans signal.
- **Une seule fiche du Lexique.** Bénéfice : le bloc daté existe, un seul endroit. Risque : le Lexique explique des mots, pas une situation (« j'ai hérité... ») : la personne ne trouverait pas la fiche par sa situation.

**D2. MaPrimeAdapt' sans bloc de chiffres pour l'instant ?** Recommandé : oui, fiche de fond seulement, bloc ajouté après lecture de la page officielle (Denis l'ouvre, ou nouvel essai de ma part). Risque : une fiche sans montant paraît incomplète ; elle reste exacte.

**D3. Succession et indivision.** Aucune page lue n'en parle. Recommandé : ne rien écrire. L'héritage est le contexte de la personne, pas le sujet des aides. Si tu veux un acteur sur ce point (un notaire, par exemple), il faut une page officielle à lire d'abord.

**D4. Le titre garde-t-il « j'ai hérité » ?** Recommandé : oui, ce sont tes mots et ceux de la personne. Risque : exclut en apparence le propriétaire non héritier, d'où la phrase « par héritage ou autrement » dans la ligne d'accroche.

## 5. Si Denis valide : plan en cases (rien n'est coché)

- [ ] `[effort : moyen]` Fiche du Cadre (rayon logement) : fichier `.md`, sources dans `liens-verifies.txt` (adresses ouvertes), README du rayon, base de l'outil de veille régénérée.
- [ ] `[effort : moyen]` Fiches du Lexique : MaPrimeRénov', Prêts d'Action Logement, MaPrimeAdapt' ; renvois régénérés, `checkLexique` à 0.
- [ ] `[effort : bas]` Numéro de France Rénov' dans le sas ; ligne au journal des changements ; test navigateur de la recherche.
