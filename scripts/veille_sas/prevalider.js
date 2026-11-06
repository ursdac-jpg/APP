// Inscrit le repère « Pré-validée » de fiches du sas dans outils/sas/prevalidees.txt (le fichier que l'outil de veille lit pour afficher l'étoile).
// À n'utiliser que pour des fiches réellement contrôlées, avec l'accord de Denis. Ne publie rien, ne date rien, ne touche à aucune fiche du sas.
// Usage :
//   node scripts/veille_sas/prevalider.js <sas> <base> <id1,id2,...>     (base : texte-denis | denis-main | test-et-assistant | appel-denis)
//   node scripts/veille_sas/prevalider.js <sas> --amorcer                  (employeurs seulement : reprend la convention déjà en place, source avec « Denis » = texte-denis, source avec « testés » = test-et-assistant)
//   DRY=1 devant la commande : simule et affiche seulement le nombre de lignes.
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..', '..');
const sas = require(path.join(R, 'outils', 'veilleSas.js'));
const prev = require(path.join(R, 'outils', 'veillePrevalidees.js'));
// Fiches dont la source dit « Denis » ou « testés » mais dont le contrôle n'est PAS terminé (voir « Non résolus » de docs/CHANTIER_VERIFICATION_SAS_EMPLOYEURS.md) : jamais d'étoile.
const A_EXCLURE = ['derichebourg-proprete', 'mma', 'yelloh-village-dordogne', 'greta-cfa-aquitaine-dordogne', 'la-perigourdine', 'caisse-d-epargne-aquitaine-poitou-charentes'];
const [nomSas, arg2, arg3] = process.argv.slice(2);
if (prev.SAS.indexOf(nomSas) === -1 || !arg2) { console.error('Usage : voir l\'en-tête du script.'); process.exit(1); }
const lireOuVide = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
const cartes = sas.lister(nomSas, lireOuVide(path.join(R, sas.CHEMINS[nomSas])), {}).lignes;
const parId = {}; cartes.forEach(c => { parId[c.id] = c; });
let demandes = [];
if (arg2 === '--amorcer') {
  if (nomSas !== 'employeurs') { console.error('--amorcer ne vaut que pour les employeurs.'); process.exit(1); }
  cartes.forEach(c => { if (A_EXCLURE.indexOf(c.id) !== -1) { return; } const s = String((c.valeurs || {}).source || ''); if (/Denis/.test(s)) { demandes.push({ id: c.id, base: 'texte-denis', valeurs: c.valeurs }); } else if (/testés/.test(s)) { demandes.push({ id: c.id, base: 'test-et-assistant', valeurs: c.valeurs }); } });
} else {
  const inconnus = (arg3 || '').split(',').filter(Boolean).filter(id => !parId[id]);
  if (inconnus.length) { console.error('Fiches absentes du sas : ' + inconnus.join(', ')); process.exit(1); }
  demandes = (arg3 || '').split(',').filter(Boolean).map(id => ({ id, base: arg2, valeurs: parId[id].valeurs }));
}
const fichier = path.join(R, ...prev.CHEMIN);
const texte = prev.ecrire(lireOuVide(fichier), nomSas, demandes, cartes.map(c => c.id));
const nb = texte.split('\n').filter(l => l && l[0] !== '#').length;
if (process.env.DRY) { console.log('Simulation : ' + demandes.length + ' fiches ajoutées ou mises à jour, ' + nb + ' lignes au total.'); }
else { fs.writeFileSync(fichier, texte); console.log(demandes.length + ' fiches ajoutées ou mises à jour, ' + nb + ' lignes au total -> ' + path.relative(R, fichier)); }
