process.env.CONTROLES = '0';
const { vers } = require('./vers_editeur.js');
(async () => {
  const { b, p } = await vers();
  console.log('route', await p.evaluate(() => pageActuelle));
  const info = await p.evaluate(() => {
    const vis = e => e.offsetParent !== null || e.getClientRects().length;
    return {
      iframe: !!document.querySelector('#zonePdfInlineCV iframe'),
      boutons: [...document.querySelectorAll('button')].filter(vis).map(x => (x.id ? '#' + x.id : '') + '|' + (x.getAttribute('data-mep-allure') || x.getAttribute('data-mep-modele') || '') + '|' + x.textContent.trim().slice(0, 30)).slice(0, 80),
      moveBefore: typeof document.body.moveBefore
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await p.screenshot({ path: process.env.CAPTURES + '/editeur.png' });
  await b.close();
})();
