/* Enregistrement de l'écran de l'application pour la vidéo de présentation (version 2 du 02/11/2026 : trois documents d'abord, navigation accélérée).
   Joue le scénario plan par plan, cale chaque bloc de voix sur l'écran, note l'heure de départ de chaque bloc et les parties accélérées (timeline.json).
   Usage : VIDEO_TRAVAIL=<dossier de travail> node enregistrer.js   (serveur dev sur http://localhost:8123) */
const { chromium } = require('playwright');
const fs = require('fs');
const SP = process.env.VIDEO_TRAVAIL;
if (!SP) { console.error('Définir VIDEO_TRAVAIL (dossier de travail, voir LISEZMOI.md)'); process.exit(1); }
const URL_APP = process.env.URL_APP || 'http://localhost:8123';
const blocs = JSON.parse(fs.readFileSync(SP + '/blocs.json', 'utf8'));
const duree = {}; blocs.forEach(b => { duree[b.id] = b.duree; });

const dormir = s => new Promise(r => setTimeout(r, s * 1000));
let T0 = 0; const maint = () => (Date.now() - T0) / 1000;
const depart = {}; const accelerations = []; let finVoix = 0;
async function bloc(id) {
  const t = Math.max(maint(), finVoix + 0.4);
  if (t > maint()) await dormir(t - maint());
  depart[id] = maint(); finVoix = depart[id] + duree[id];
  console.log(`  [${maint().toFixed(1)}s] ${id}`);
}
async function jusqua(t) { if (t > maint()) await dormir(t - maint()); }
async function finDeVoix(marge = 0.4) { await jusqua(finVoix + marge); }

const CURSEUR = () => {
  let el;
  const fait = () => {
    if (el && el.isConnected) return el;
    el = document.createElement('div'); el.id = '__curseur';
    el.style.cssText = 'position:fixed;left:0;top:0;width:34px;height:34px;z-index:2147483647;pointer-events:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));';
    el.innerHTML = '<svg width="34" height="34" viewBox="0 0 30 30"><path d="M3 2 L3 23 L8.5 18 L12.5 27 L16 25.5 L12 16.5 L19.5 16.5 Z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.documentElement.appendChild(el); return el;
  };
  document.addEventListener('mousemove', e => { fait().style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; }, true);
  document.addEventListener('mousedown', e => {
    const o = document.createElement('div');
    o.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;border:4px solid rgba(11,94,215,.85);border-radius:50%;width:12px;height:12px;left:' + (e.clientX - 6) + 'px;top:' + (e.clientY - 6) + 'px;transition:all .5s ease-out;opacity:1;';
    document.documentElement.appendChild(o);
    requestAnimationFrame(() => { o.style.width = '64px'; o.style.height = '64px'; o.style.left = (e.clientX - 32) + 'px'; o.style.top = (e.clientY - 32) + 'px'; o.style.opacity = '0'; });
    setTimeout(() => o.remove(), 700);
  }, true);
};

let mx = 640, my = 600;
async function aller(p, x, y, ms = 750) {
  const n = Math.max(8, Math.round(ms / 28));
  const x0 = mx, y0 = my;
  for (let i = 1; i <= n; i++) {
    const u = i / n, e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    await p.mouse.move(x0 + (x - x0) * e, y0 + (y - y0) * e);
    await dormir(ms / 1000 / n);
  }
  mx = x; my = y;
}
async function centre(p, loc) {
  await loc.evaluate(e => { const r = e.getBoundingClientRect(); if (r.top < 100 || r.bottom > 630) e.scrollIntoView({ block: 'center', behavior: 'instant' }); }).catch(() => {});
  await dormir(0.35);
  const bb = await loc.boundingBox();
  if (!bb) throw new Error('élément sans boîte');
  return [bb.x + bb.width / 2, bb.y + bb.height / 2];
}
async function survol(p, loc, ms = 750) { const [x, y] = await centre(p, loc); await aller(p, x, y, ms); }
async function cliquer(p, loc, ms = 750) {
  const [x, y] = await centre(p, loc); await aller(p, x, y, ms); await dormir(0.2);
  await p.mouse.down(); await dormir(0.08); await p.mouse.up(); await dormir(0.4);
}
const parTexte = (p, t) => p.getByText(t, { exact: false }).first();
async function defiler(p, y, ms = 1000) {
  const y0 = await p.evaluate(() => window.scrollY); const n = Math.max(6, Math.round(ms / 40));
  for (let i = 1; i <= n; i++) { await p.evaluate(v => window.scrollTo(0, v), y0 + (y - y0) * (i / n)); await dormir(ms / 1000 / n); }
}
// Fait défiler la page jusqu'au bloc d'un chemin (.voie-presentation, numéro i) : les pages « Créer », « Reprendre » et « version rapide » ont le même composant.
async function versChemin(p, i) {
  const y = await p.evaluate(n => { const e = document.querySelectorAll('.voie-presentation')[n]; return e ? Math.max(0, e.getBoundingClientRect().top + window.scrollY - 90) : window.scrollY; }, i);
  await defiler(p, y, 1400); await dormir(0.8);
}
async function accueil(p) { await p.evaluate(() => { const x = document.getElementById('fenetreERIPFermerBtn'); if (x && x.offsetParent !== null) x.click(); naviguerVers('cv'); window.scrollTo(0, 0); }); await dormir(0.7); }
async function carteEtTuile(p, carte, tuile) { await cliquer(p, p.locator('[data-carte-accueil="' + carte + '"]'), 800); await dormir(0.6); await cliquer(p, tuile, 650); }

// Partie accélérée : sans voix, la mention « Accéléré » reste à l'écran, l'assemblage la passe à la vitesse x.
async function accel(p, x, fn) {
  await finDeVoix(0.2);
  await p.evaluate(() => { const b = document.createElement('div'); b.id = '__accel'; b.textContent = 'Accéléré'; b.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147483000;background:rgba(10,26,51,.92);color:#fff;font-size:22px;font-weight:700;padding:6px 18px;border-radius:999px;'; document.body.appendChild(b); });
  await dormir(0.15);
  const d = maint(); await fn(); const f = maint();
  await p.evaluate(() => { const b = document.getElementById('__accel'); if (b) b.remove(); });
  accelerations.push({ d, f, x }); console.log(`  accéléré x${x} de ${d.toFixed(1)}s à ${f.toFixed(1)}s`);
}

async function carteTitre(p) {
  await p.evaluate(() => {
    const d = document.createElement('div'); d.id = '__titre';
    d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;transition:opacity .9s;font-family:inherit;padding:0 60px;';
    d.innerHTML = '<div style="font-size:150px;font-weight:800;color:#0b5ed7;letter-spacing:.04em;line-height:1">APP</div><div style="font-size:46px;font-weight:700;color:#0a1a33;margin-top:18px">Accompagnement de Parcours Professionnel</div>';
    document.body.appendChild(d);
  });
}
async function enleverTitre(p) { await p.evaluate(() => { const d = document.getElementById('__titre'); if (d) { d.style.opacity = '0'; setTimeout(() => d.remove(), 1000); } }); }
async function etiquette(p, id, texte) {
  await p.evaluate(([i, t]) => {
    let c = document.getElementById('__etiquettes');
    if (!c) { c = document.createElement('div'); c.id = '__etiquettes'; c.style.cssText = 'position:fixed;left:40px;top:170px;z-index:2147483000;display:flex;flex-direction:column;gap:18px;'; document.body.appendChild(c); }
    const e = document.createElement('div'); e.id = i;
    e.style.cssText = 'background:rgba(10,26,51,.93);color:#fff;font-size:30px;font-weight:700;padding:16px 26px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.35);opacity:0;transform:translateX(-30px);transition:all .6s;max-width:520px;';
    e.textContent = t; c.appendChild(e); requestAnimationFrame(() => { e.style.opacity = '1'; e.style.transform = 'none'; });
  }, [id, texte]);
}
async function retirerEtiquettes(p) { await p.evaluate(() => { const c = document.getElementById('__etiquettes'); if (c) c.remove(); }); }
async function bandeau(p, id, texte, grand) {
  await p.evaluate(([i, t, g]) => {
    let c = document.getElementById('__bandeau');
    if (!c) { c = document.createElement('div'); c.id = '__bandeau'; c.style.cssText = 'position:fixed;left:50%;top:44%;transform:translate(-50%,-50%);z-index:2147483000;display:flex;flex-direction:column;align-items:center;gap:16px;'; document.body.appendChild(c); }
    const e = document.createElement('div'); e.id = i;
    e.style.cssText = 'background:rgba(10,26,51,.94);color:#fff;font-size:' + (g ? '54px' : '34px') + ';font-weight:' + (g ? '800' : '600') + ';padding:22px 40px;border-radius:18px;box-shadow:0 8px 28px rgba(0,0,0,.4);text-align:center;opacity:0;transition:opacity .7s;';
    e.textContent = t; c.appendChild(e); requestAnimationFrame(() => { e.style.opacity = '1'; });
  }, [id, texte, !!grand]);
}
async function retirerBandeau(p) { await p.evaluate(() => { const c = document.getElementById('__bandeau'); if (c) c.remove(); }); }
// Une vraie capture de l'application (images/introduction) montrée en grand, pour les écrans longs à atteindre.
async function imageEcran(p, nom) {
  await p.evaluate(([u]) => {
    const d = document.createElement('div'); d.id = '__image';
    d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:rgba(10,26,51,.55);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .6s;';
    d.innerHTML = '<img src="' + u + '" style="max-width:62%;max-height:88%;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.5);background:#fff">';
    document.body.appendChild(d); requestAnimationFrame(() => { d.style.opacity = '1'; });
  }, [URL_APP + '/images/introduction/' + nom + '.png']);
  await dormir(0.8);
}
async function retirerImage(p) { await p.evaluate(() => { const d = document.getElementById('__image'); if (d) d.remove(); }); }

(async () => {
  const b = await chromium.launch();
  T0 = Date.now();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: SP + '/video/brut', size: { width: 1280, height: 720 } } });
  await ctx.addInitScript(CURSEUR);
  const p = await ctx.newPage(); p.errs = []; global.PG = p;
  p.on('pageerror', e => p.errs.push(String(e).slice(0, 160)));
  p.on('dialog', d => { console.log('  DIALOGUE', d.message().slice(0, 100)); d.accept(); });
  await p.goto(URL_APP + '/index.html'); await dormir(2);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.reload(); await dormir(2.5);
  await p.mouse.move(mx, my); await dormir(0.4);

  // ----- Plan 1 : titre puis accueil
  const tDebut = maint(); console.log('début du film à', tDebut.toFixed(2));
  await carteTitre(p); await dormir(0.5);
  await bloc('p1_01'); await finDeVoix(0.3); await enleverTitre(p);
  await bloc('p1_02'); await bloc('p1_03'); await bloc('p1_04'); await bloc('p1_05'); await finDeVoix(1.0);

  // ----- Plan 2 : les grandes cartes
  await bloc('p2_01'); await survol(p, p.locator('[data-carte-accueil="mesdocuments"]'), 800);
  await bloc('p2_02'); await survol(p, p.locator('[data-carte-accueil="preparer"]'), 800); await survol(p, p.locator('[data-carte-accueil="boiteaoutils"]'), 800);
  await bloc('p2_03'); await finDeVoix(0.3);

  // ----- Plan 3 : le CV, les trois temps
  await bloc('p3_01');
  await carteEtTuile(p, 'mesdocuments', p.locator('#btnCarteAccueilCvNouveau')); await dormir(0.4);
  await bloc('p3_02'); await etiquette(p, 'e1', '1. Vous choisissez');
  await bloc('p3_03');
  await bloc('p3_04'); await etiquette(p, 'e2', '2. Vous collez chez l’assistant en ligne');
  await bloc('p3_05'); await etiquette(p, 'e3', '3. Vous revenez coller sa réponse');
  await bloc('p3_06'); await finDeVoix(0.3); await retirerEtiquettes(p);
  await bloc('p3_07'); await versChemin(p, 0); await versChemin(p, 2); await finDeVoix(0.3);

  // ----- Plan 4 : Camille crée son CV
  await bloc('p4_01');
  await cliquer(p, p.locator('#btnCreerCvSansAssistant'), 700); await dormir(0.4);   // départ direct sur « Votre objectif » (consigne 246)
  await bloc('p4_02');
  await cliquer(p, parTexte(p, 'Candidature spontanée'), 700);
  await cliquer(p, parTexte(p, 'Un métier précis'), 600);
  const inp = p.locator('#rechercheMetierCibleInput'); await cliquer(p, inp, 500);
  await inp.pressSequentially('agent d', { delay: 70 }); await dormir(1.2);
  const opt = p.locator('.option-metier-ajout-nom').first();
  const bo = await opt.boundingBox(); await aller(p, bo.x + bo.width / 2, bo.y + bo.height / 2, 500); await dormir(0.2); await opt.click(); await dormir(0.7);
  await cliquer(p, parTexte(p, 'Je me présente de façon générale'), 650);
  await accel(p, 4, async () => {
    await cliquer(p, p.locator('#btnSuivantNavigation'), 700); await dormir(0.5);
    await p.fill('#identitePrenom', 'Camille'); await p.fill('#identiteNom', 'Martin'); await p.fill('#identiteTelephone', '0612345678');
    await p.fill('#identiteEmail', 'camille.martin@exemple.fr'); await p.fill('#identiteCodePostal', '87000'); await p.fill('#identiteVille', 'Limoges'); await dormir(0.5);
    await cliquer(p, p.locator('#btnEnregistrerIdentite'), 600);
    // Depuis le 16/11/2026 l'expérience s'ajoute dans un panneau : poste, métier proposé, missions et compétences cochées, « Je valide ».
    await cliquer(p, p.locator('#btnExpProOuvrir'), 600);
    await cliquer(p, p.locator('#mcPanPoste'), 400); await p.keyboard.type('Agent d’entretien', { delay: 40 }); await dormir(0.9);
    if (await p.locator('[data-pan-sugg]').count()) { await cliquer(p, p.locator('[data-pan-sugg]').first(), 400); await dormir(0.7); }
    await cliquer(p, p.locator('[data-pan-mission]').nth(0), 350); await dormir(0.2);
    await cliquer(p, p.locator('[data-pan-mission]').nth(1), 350); await dormir(0.2);
    await cliquer(p, p.locator('[data-pan-comp]').nth(0), 350); await dormir(0.2);
    await cliquer(p, p.locator('#mcPanValider'), 400); await dormir(0.7);
    await cliquer(p, p.locator('#btnSuivantNavigation'), 700); await dormir(0.5);
  });
  await bloc('p4_03');
  for (const champ of ['activites', 'actions', 'environnement']) { await cliquer(p, p.locator('.vp-carte[data-vp-champ="' + champ + '"]').first(), 650); await dormir(0.25); }
  await cliquer(p, p.locator('#btnSuivantNavigation'), 700); await dormir(0.6);   // page « Vos missions et compétences »
  await bloc('p4_04'); await dormir(0.9);
  await cliquer(p, p.locator('#btnSuivantNavigation'), 600); await dormir(0.4);   // page « Votre profil »
  await bloc('p4_05');
  const toutes = p.locator('.pastille-etape-action:visible'); const nb = await toutes.count();
  if (nb) { await survol(p, toutes.first(), 900); for (let i = 1; i < Math.min(nb, 3); i++) { await survol(p, toutes.nth(i), 550); } }
  await finDeVoix(0.3);

  // ----- Plan 5 : Vos documents, les modèles
  await cliquer(p, p.locator('#btnSuivantNavigation'), 750); await dormir(1.6);
  await p.evaluate(() => window.scrollTo(0, 0)); await bloc('p5_01');
  const sobre = p.getByRole('button', { name: /Sobre/ }).first(); const creatif = p.getByRole('button', { name: /Créatif/ }).first();
  if (await sobre.count()) await cliquer(p, sobre, 800);
  await dormir(0.6); await defiler(p, 500, 1100);
  await bloc('p5_02');
  if (await creatif.count()) await cliquer(p, creatif, 800);
  await dormir(0.6); await defiler(p, 900, 1100);
  await bloc('p5_03');
  const apercu = p.getByRole('button', { name: /Aperçu en plein écran/ }).first();
  if (await apercu.count()) { await cliquer(p, apercu, 800); await dormir(1.0); }
  await bloc('p5_04'); await dormir(1.0);
  const retour = p.getByRole('button', { name: /Revenir aux réglages/ }).first(); if (await retour.count()) await cliquer(p, retour, 700);
  await finDeVoix(0.4);

  // ----- Plan 6 : la lettre de motivation
  await accueil(p);
  await bloc('p6_01');
  await carteEtTuile(p, 'preparer', p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'Écrire ma lettre' }).first()); await dormir(0.6);
  await bloc('p6_02'); await defiler(p, 260, 1500);
  await bloc('p6_03'); await imageEcran(p, 'i_lettre_2_mise_en_page'); await finDeVoix(0.9); await retirerImage(p);

  // ----- Plan 7 : l'entretien
  await accueil(p);
  await bloc('p7_01');
  await carteEtTuile(p, 'preparer', p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'entraîner à un entretien' }).first()); await dormir(0.6);
  await bloc('p7_02'); await defiler(p, 260, 1500);
  await bloc('p7_03'); await imageEcran(p, 'i_entretien_1_resultat'); await finDeVoix(0.9); await retirerImage(p);

  // ----- Plan 11 : Reprendre mon CV et la version rapide (chemins)
  await accueil(p);
  // Camille a déjà un CV en cours : « Reprendre » demanderait « Garder ce que vous avez déjà fait ? ». Pour la vidéo, on repart d'une session vide (comme une personne qui n'a rien commencé), sans montrer la question.
  await p.evaluate(() => { if (typeof viderContenuCVDossier === 'function') { viderContenuCVDossier(); } try { _prepLEEtat = null; dossier.cvAnalyse = false; } catch (e) {} });
  await bloc('p11_01');
  await carteEtTuile(p, 'mesdocuments', p.locator('#btnCarteAccueilCvReprendre')); await dormir(0.4);
  const oui = p.getByRole('button', { name: /Oui, le garder/ }); if (await oui.count() && await oui.first().isVisible()) { console.log('  question « Garder » encore présente : clic sur Oui'); await cliquer(p, oui.first(), 400); }
  await versChemin(p, 0);
  await bloc('p11_02'); await versChemin(p, 1); await versChemin(p, 2); await finDeVoix(0.4);
  await accueil(p);
  await bloc('p11_03');
  await carteEtTuile(p, 'mesdocuments', p.locator('#btnCarteAccueilCvPret')); await dormir(0.4);
  { const oui2 = p.getByRole('button', { name: /Oui, le garder/ }); if (await oui2.count() && await oui2.first().isVisible()) { console.log('  question « Garder » (version rapide) : clic sur Oui'); await cliquer(p, oui2.first(), 400); } }
  await versChemin(p, 0); await finDeVoix(0.4);

  // ----- Plan 12 : Explorer les métiers (quatre chemins)
  await accueil(p);
  await bloc('p12_01');
  await carteEtTuile(p, 'orientation', p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'Explorer les métiers' }).first()); await dormir(1.0);
  await bloc('p12_02'); await cliquer(p, p.locator('#btnCmlCommencer'), 700); await dormir(1.2);
  await bloc('p12_03'); await survol(p, p.locator('[data-cml="entrer"]').nth(0), 700); await survol(p, p.locator('[data-cml="entrer"]').nth(1), 800);
  await bloc('p12_04'); await survol(p, p.locator('[data-cml="entrer"]').nth(2), 800);
  await bloc('p12_05'); await survol(p, p.locator('[data-cml="entrer"]').nth(3), 800); await finDeVoix(0.3);

  // ----- Plan 13 : les deux espaces de la Boîte à outils (ouverts le 25/11/2026)
  await accueil(p);
  await bloc('p13_01'); await cliquer(p, p.locator('[data-carte-accueil="boiteaoutils"]'), 800); await dormir(0.8);
  await bloc('p13_02'); await survol(p, p.locator('#btnCarteAccueilCeQuiCompte'), 800);
  await bloc('p13_03'); await survol(p, p.locator('#btnCarteAccueilBienUtiliserIa'), 800); await finDeVoix(0.4);

  // ----- Plan 8 : les autres outils, et les professionnels
  await accueil(p);
  await bloc('p8_01'); await defiler(p, 460, 1100); await survol(p, p.locator('[data-carte-accueil="analyse"]'), 800);
  await bloc('p8_02'); await survol(p, p.locator('[data-carte-accueil="informe"]'), 900);
  await bloc('p8_03'); await survol(p, p.locator('[data-carte-accueil="orientation"]'), 900);
  await bloc('p8_04'); await defiler(p, 0, 1000); await finDeVoix(0.3);

  // ----- Plan 14 : aucun outil n'est obligatoire (demande de Denis du 25/11/2026)
  await bloc('p14_01'); await survol(p, p.locator('[data-carte-accueil="mesdocuments"]'), 900);
  await bloc('p14_02'); await bandeau(p, 'b0', 'Aucun outil n’est obligatoire'); await finDeVoix(0.4); await retirerBandeau(p);
  await bloc('p14_03'); await survol(p, p.locator('[data-carte-accueil="boiteaoutils"]'), 900); await finDeVoix(0.3);

  // ----- Plan 15 : l'application s'adapte à l'écran (demande de Denis du 25/11/2026)
  await bloc('p15_01'); await dormir(0.6); await imageEcran(p, 'i_appareils');
  await bloc('p15_02'); await bloc('p15_03'); await finDeVoix(0.9); await retirerImage(p);

  // ----- Plan 9 : la ligne du haut, les informations restent chez soi
  await bloc('p9_01'); await survol(p, p.locator('#btnAide'), 900);
  await bloc('p9_02'); await dormir(0.6);
  await bloc('p9_03'); const dq = p.locator('#btnSessionTransfert'); if (await dq.count()) await survol(p, dq, 800);
  await bloc('p9_04'); await bandeau(p, 'b1', 'Vos informations restent sur votre appareil'); await finDeVoix(0.4); await retirerBandeau(p);
  await bloc('p9_05'); await survol(p, p.locator('#btnIntroduction'), 900); await dormir(0.4);
  await cliquer(p, p.locator('#btnIntroduction'), 250); await dormir(1.6); await finDeVoix(0.4);

  // ----- Plan 10 : à vous de jouer
  await accueil(p);
  await bloc('p10_01'); await bandeau(p, 'b2', 'À vous de jouer.', true);
  await bloc('p10_02'); await dormir(1.2); await bandeau(p, 'b3', 'Vidéo réalisée en novembre 2026');
  await finDeVoix(1.5); await dormir(1.8);
  const fin = maint();
  console.log('erreurs de page :', p.errs);
  const video = p.video();
  await ctx.close();
  fs.writeFileSync(SP + '/video/timeline.json', JSON.stringify({ tDebut, fin, depart, accelerations, fichier: await video.path() }, null, 1));
  await b.close();
  console.log('fini, durée du film brute', (fin - tDebut).toFixed(1), 's');
})().catch(async e => {
  console.error('ERREUR', String(e).slice(0, 300));
  try { await global.PG.screenshot({ path: SP + '/video/erreur.png' }); console.log(await global.PG.evaluate(() => 'route=' + pageActuelle + ' | boutons=' + [...document.querySelectorAll('button')].filter(e => e.offsetParent !== null).map(e => (e.id || '-') + '«' + e.textContent.trim().slice(0, 28) + '»').slice(0, 22).join(' '))); } catch (x) {}
  process.exit(1);
});
