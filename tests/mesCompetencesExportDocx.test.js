const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const F = require('../modules/mes-competences/filet.js');
const L = require('../modules/mes-competences/logique.js');
const X = require('../modules/mes-competences/exportDocx.js');
const docx = require('../modules/cv-editor/docx.umd.js');
const { PROFILS } = require('../scripts/essaiMesCompetences/profils.js');

const REP = path.join(__dirname, '..', 'docs', 'essais_mes_competences', 'reponses');

// Lit le texte de word/document.xml d'un .docx (zip) par son répertoire central, sans librairie de décompression.
function texteDuDocx(tampon) {
  const fin = tampon.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const nb = tampon.readUInt16LE(fin + 10);
  let p = tampon.readUInt32LE(fin + 16);
  for (let i = 0; i < nb; i++) {
    const methode = tampon.readUInt16LE(p + 10), tailleComp = tampon.readUInt32LE(p + 20);
    const lgNom = tampon.readUInt16LE(p + 28), lgExtra = tampon.readUInt16LE(p + 30), lgCom = tampon.readUInt16LE(p + 32);
    const decalage = tampon.readUInt32LE(p + 42);
    const nom = tampon.slice(p + 46, p + 46 + lgNom).toString('utf8');
    if (nom === 'word/document.xml') {
      const lgNomLocal = tampon.readUInt16LE(decalage + 26), lgExtraLocal = tampon.readUInt16LE(decalage + 28);
      const debut = decalage + 30 + lgNomLocal + lgExtraLocal;
      const brut = tampon.slice(debut, debut + tailleComp);
      return (methode === 8 ? zlib.inflateRawSync(brut) : brut).toString('utf8');
    }
    p += 46 + lgNom + lgExtra + lgCom;
  }
  throw new Error('word/document.xml introuvable');
}

function documentDEssai() {
  const profil = PROFILS.filter((x) => x.id === 'logistique_cv_seul')[0];
  const f = F.filtrerReponse(fs.readFileSync(path.join(REP, '01_chatgpt.txt'), 'utf8'), profil.documents);
  let e = L.mesCompIntegrerPremierPassage(L.mesCompEtatInitial(), f);
  e = L.mesCompBasculerGeste(e, 'c1', 'ok');
  e = L.mesCompBasculerGeste(e, 'c2', 'part', 'Mes mots à moi');
  e = L.mesCompBasculerGeste(e, 'c3', 'non');
  return { etat: e, doc: L.mesCompDocumentFinal(e) };
}

test('les blocs du document : titre, sections, lignes gardées seulement, pied daté', () => {
  const { etat, doc } = documentDEssai();
  const blocs = L.mesCompBlocsDocument(doc, '27/10/2026');
  assert.equal(blocs[0].t, 'titre');
  assert.equal(blocs[blocs.length - 1].texte, 'Document établi le 27/10/2026 à partir de mes documents.');
  const lignes = blocs.filter((b) => b.t === 'ligne').map((b) => b.libelle);
  assert.deepEqual(lignes, [etat.lignes[0].libelle, etat.lignes[1].libelle]);
  const ecrite = blocs.filter((b) => b.t === 'ligne')[1];
  assert.equal(ecrite.pourLeCV, 'Mes mots à moi');
  assert.ok(ecrite.notes.includes('écrit par moi'));
  assert.equal(L.mesCompDateFr(new Date(2026, 9, 5)), '05/10/2026');
});

test('« Pour mon CV » n’est pas répété quand il est identique à la citation du document', () => {
  const l = { pourLeCV: 'Filmage des palettes', ecritParMoi: false, preuves: [{ source: 'Mon CV', extrait: 'Filmage des palettes' }] };
  assert.equal(L.mesCompPourLeCVUtile(l), false);
  assert.equal(L.mesCompPourLeCVUtile(Object.assign({}, l, { ecritParMoi: true })), true);
  assert.equal(L.mesCompPourLeCVUtile(Object.assign({}, l, { pourLeCV: 'Autre formulation' })), true);
});

test('le Word contient les lignes gardées et leurs phrases, jamais une ligne retirée', async () => {
  const { etat, doc } = documentDEssai();
  const blocs = L.mesCompBlocsDocument(doc, '27/10/2026');
  const tampon = await docx.Packer.toBuffer(X.mesCompConstruireDocx(docx, blocs, { preuves: true, oral: true }));
  assert.equal(tampon.slice(0, 2).toString(), 'PK');
  const texte = texteDuDocx(tampon);
  assert.ok(texte.includes('Mes compétences') && texte.includes('Mes mots à moi'));
  assert.ok(texte.includes(etat.lignes[0].libelle.replace(/&/g, '&amp;').replace(/'/g, "'")) || texte.includes(etat.lignes[0].libelle));
  assert.ok(!texte.includes(etat.lignes[2].libelle), 'la ligne retirée n’est pas dans le Word');
  assert.ok(texte.includes('27/10/2026'));
  assert.ok(/À l’oral/.test(texte) && /Mon CV/.test(texte));
});

test('le Word suit les cases « phrases de mes documents » et « phrases pour l’oral »', async () => {
  const { doc } = documentDEssai();
  const blocs = L.mesCompBlocsDocument(doc, '27/10/2026');
  const sans = texteDuDocx(await docx.Packer.toBuffer(X.mesCompConstruireDocx(docx, blocs, { preuves: false, oral: false })));
  assert.ok(!/À l’oral/.test(sans) && !/Mon CV : «/.test(sans));
  assert.ok(sans.includes('Mes mots à moi'), 'le texte écrit par la personne reste');
});
