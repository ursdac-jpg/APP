/* Lanceur du protocole de test des parcours : node scripts/parcours/protocole/lancer.js creerAssistant [largeur]
   Écrit le journal dans scripts/parcours/protocole/sorties/<nom>.json et affiche les ÉCARTS. */
const fs = require('fs');
const path = require('path');
const { Journal, ouvrirPage, pilote } = require('./outils.js');
(async () => {
  const nom = process.argv[2];
  const largeur = Number(process.argv[3]) || 1280;
  if (!nom) { console.log('Parcours disponibles : ' + fs.readdirSync(__dirname).filter((f) => /\.js$/.test(f) && !/^(lancer|outils)\.js$/.test(f)).map((f) => f.replace('.js', '')).join(', ')); return; }
  const parcours = require('./' + nom + '.js');
  const j = new Journal(nom);
  const { b, p, erreurs } = await ouvrirPage(largeur);
  const a = pilote(p, j);
  try { await parcours.jouer(a, j); } catch (e) { j.ko('ARRÊT du protocole : ' + e.message.slice(0, 300)); }
  erreurs.forEach((x) => j.ko('erreur navigateur : ' + x));
  fs.mkdirSync(path.join(__dirname, 'sorties'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'sorties', nom + '_' + largeur + '.json'), JSON.stringify({ nom, largeur, lignes: j.lignes, ecrans: j.ecrans }, null, 1));
  console.log('\n' + nom + ' (' + largeur + ' px) : ' + j.ecrans.length + ' écrans contrôlés, ' + j.lignes.filter((l) => l.n === 'ECART').length + ' écart(s)');
  j.lignes.filter((l) => l.n !== 'ECART').forEach((l) => console.log('  ' + l.n + ' : ' + l.t));
  await b.close();
})();
