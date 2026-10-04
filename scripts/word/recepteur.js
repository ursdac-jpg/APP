// Recepteur local de banc d'essai (developpement seulement) : recoit du navigateur de test des fichiers .docx (base64) et des JSON,
// pour les donner a Word. Usage : node scripts/word/recepteur.js <dossier de sortie> [port 8124]
const http = require('http'), fs = require('fs'), path = require('path');
const dossier = process.argv[2], port = parseInt(process.argv[3] || '8124', 10);
fs.mkdirSync(dossier, { recursive: true });
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', '*'); res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.end(); return; }
  const m = /^\/(docx|json)\/([\w.-]+)$/.exec(req.url);
  if (req.method !== 'POST' || !m) { res.statusCode = 400; res.end('bad'); return; }
  const morceaux = [];
  req.on('data', (c) => morceaux.push(c));
  req.on('end', () => {
    const corps = Buffer.concat(morceaux);
    const f = path.join(dossier, m[2]);
    fs.writeFileSync(f, m[1] === 'docx' ? Buffer.from(corps.toString('utf8'), 'base64') : corps);
    res.end('ok ' + f);
  });
}).listen(port, () => console.log('recepteur sur', port, '->', dossier));
