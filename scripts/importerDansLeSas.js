/* Range une reponse d'assistant dans le sas de « Qui fait quoi » (jamais public) ou la teste a blanc.
   Usage : node scripts/importerDansLeSas.js <fichier.txt> <lieux|employeurs|complements> [publier]
   - sans « publier » : analyse seulement (resume + lignes a corriger / deja connues / avertissements) ;
   - avec « publier » : importe les lignes pretes dans outils/sas/<fichier>.sas.txt (commit local, annulable) ;
   - le fichier texte est la reponse de l'assistant collee TELLE QUELLE (l'outil nettoie les blocs de code, puces, marques).
   Avant d'importer : corriger a la main ce que l'analyse refuse (commune hors liste, nature, doublon). Voir docs/ETAT_DES_CHANTIERS.md. */
const path=require('path'),fs=require('fs');
const R=require('path').resolve(__dirname,'..');
const {creerDepot}=require(R+'/outils/veilleDepot.js');
const d=creerDepot(R);
const texte=fs.readFileSync(process.argv[2],'utf8');
const a=d.analyserLot(process.argv[3]||'lieux',texte);
console.log(JSON.stringify(a.resume));
a.lignes.forEach(l=>{ if(l.statut!=='prete') console.log(l.numero,l.statut,l.nom,(l.problemes||[]).map(p=>p.message).join(' ; '),l.connue?JSON.stringify(l.connue):''); else if((l.avertissements||[]).length) console.log(l.numero,'avert',l.nom,l.avertissements.join(' ; '));});
if(process.argv[4]==='publier'){
  const prets=a.lignes.filter(l=>l.statut==='prete').map(l=>l.ligneFinale);
  const r=d.publier([{type:'sas',fichier:process.argv[3]||'lieux',actions:[{op:'importer',lignes:prets}]}]);
  console.log(JSON.stringify(r).slice(0,300));
}
