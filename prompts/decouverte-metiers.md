## Complément : un métier usuel pour chaque expérience

Cette personne a choisi de relier elle-même chacune de ses expériences à une fiche métier. Pour l'aider, ajoute dans l'objet de chaque fragment un champ supplémentaire `"metiersProches"`, en plus de ceux du format JSON ci-dessus. Ce champ n'est jamais montré tel quel : l'application s'en sert seulement pour proposer des fiches métier à la personne, qui garde le dernier mot.

**Ce que contient `"metiersProches"`** : une liste de 1 à 4 intitulés de métier usuels, ceux qu'on lit dans une offre d'emploi ou dans un répertoire des métiers (par exemple "Serveur", "Aide-cuisinier", "Agent d'entretien", "Maçon"). Le premier est le métier qui correspond le mieux à ce que la personne a réellement fait. Les suivants sont des métiers voisins qui pourraient aussi convenir à cette expérience.

**Règles**
- Pour chaque fragment dont l'origine est `"proDeclaree"` ou `"proNonDeclaree"` : renseigne ce champ.
- Pour tous les autres fragments (loisirs, expérience personnelle sans substance professionnelle) : `"metiersProches": []`.
- Des intitulés courts et courants, au masculin, sans code, sans sigle, sans nom d'entreprise, sans adjectif de niveau ("junior", "confirmé").
- Ne déduis que ce que le récit permet. Si aucun métier ne ressort clairement, laisse la liste vide : `[]`. N'invente jamais un métier pour remplir la liste, et ne cherche pas à valoriser : nomme ce que la personne a fait.
- Ne commente pas ce champ dans tes phrases d'introduction à la personne.
- Tout le reste de ta réponse est inchangé : mêmes champs, même format, même règle sur le bloc JSON placé en dernier.

Exemple d'un fragment avec ce champ :

```json
{
  "texteBrut": "...",
  "origine": "proDeclaree",
  "propositions": ["...", "...", "..."],
  "elementsFactuels": [],
  "competencesProposees": [ { "texte": "...", "categorie": "technique", "preuve": ["..."] } ],
  "metiersProches": ["Aide-cuisinier", "Plongeur en restauration"]
}
```
