// Extrait le texte d'un .docx dans l'ordre du corps du document (comme le ferait un logiciel de recrutement) et signale les zones de texte.
// Usage : node scripts/word/texte-docx.js fichier.docx
const JSZip = require('../../modules/cv-editor/jszip.min.js');
const fs = require('fs');
(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(process.argv[2]));
  const doc = await zip.file('word/document.xml').async('string');
  const paragraphes = [...doc.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)].map((m) => [...m[0].matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((t) => t[1]).join('').trim()).filter(Boolean);
  console.log(paragraphes.join('\n'));
  const tous = (await Promise.all(Object.keys(zip.files).filter((n) => /^word\/.*\.xml$/.test(n)).map((n) => zip.file(n).async('string')))).join('');
  console.error('\n[zones de texte : ' + (tous.match(/txbxContent/g) || []).length + ' ; texte cache : ' + (doc.match(/<w:vanish\/>/g) || []).length + ']');
})();
