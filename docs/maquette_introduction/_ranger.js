// Outil de travail : range les captures retenues sous leur nom définitif (prefixe i_) et supprime les dossiers de brouillon.
const fs = require('fs'); const path = require('path');
const D = __dirname;
const CHOIX = {
  i_cv_1_choix: 'p_01_choix_creer.png', i_cv_2_objectif: 'p_03_objectif.png', i_cv_3_parcours: 'p_05_parcours.png', i_cv_4_profil: 'p_06_profil.png',
  i_lettre_1_preparer: '_int/lettre_1_preparer.png', i_lettre_2_mise_en_page: '_int/lettre_4_resultat1.png', i_entretien_1_resultat: '_int/entretien_4_resultat0.png',
  i_bilan_1_collage: '_int/bilan_3_collage.png', i_bilan_2_resultat: '_int/bilan_4_resultat0.png', i_bilan_3_resultat: '_int/bilan_4_resultat1.png',
  i_ats_1_resultat: '_int/ats_4_resultat0.png', i_regard_1_preparer: '_brut/rr-2.png', i_coherence_1_collecte: '_expl/coherence_1.png', i_competences_1_documents: '_expl/competences_1.png',
  i_reperes_1_liste: '_lib2/reperes_1_liste.png', i_carnet_1_notes: '_brut/car-4.png', i_lexique_1_fiche: '_brut/lex-4.png',
  i_cadre_1_liste: '_brut/cad-5.png', i_cadre_2_fiche: '_brut/cad-6.png', i_chiffres_1_chomage: '_lib/chiffres_2_suite.png', i_chiffres_2_evolution: '_lib/chiffres_3_suite.png',
  i_comparer_1_pistes: '_brut/hes-comparer-2.png', i_ucpm_1_etape: '_brut/hes-ucpm-2.png',
  i_employeurs_1_domaines: '_lib2/employeurs_1_domaines.png', i_employeurs_2_liste: '_lib2/employeurs_3_liste_suite.png',
  i_qfq_1_departement: '_lib2/qfq_1_accueil.png', i_qfq_2_secteurs: '_lib2/qfq_3_emploi_suite.png'
};
let manque = 0;
Object.keys(CHOIX).forEach((nom) => {
  const src = path.join(D, CHOIX[nom]);
  if (!fs.existsSync(src)) { console.log('MANQUE', CHOIX[nom]); manque++; return; }
  fs.copyFileSync(src, path.join(D, nom + '.png'));
});
if (manque === 0 && process.argv[2] === 'nettoyer') {
  ['_brut', '_expl', '_expl2', '_expl3', '_int', '_lib', '_lib2', '_choix2', '_clip', '_tmp'].forEach((d) => { fs.rmSync(path.join(D, d), { recursive: true, force: true }); });
  ['p_01_choix_creer.png', 'p_03_objectif.png', 'p_05_parcours.png', 'p_06_profil.png', 'clip_accueil.webm', 'clip_accueil.js', '_explorer.js', '_explorer2.js', '_flux_bilan.js', '_planche.html', '_planche.png']
    .concat(fs.readdirSync(D).filter((f) => /^m_.*\.png$/.test(f))).forEach((f) => { fs.rmSync(path.join(D, f), { force: true }); });
}
console.log('copiées :', Object.keys(CHOIX).length - manque, '| manquantes :', manque);
