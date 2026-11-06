const fs=require('fs'),cp=require('child_process');
const sp=process.argv[2], ffp=process.argv[3];
const b=JSON.parse(fs.readFileSync(sp+'/blocs.json','utf8'));
for(const x of b){x.duree=+cp.execFileSync(ffp,['-v','error','-show_entries','format=duration','-of','csv=p=0',sp+'/voix/blocs/'+x.id+'.wav']).toString().trim();}
fs.writeFileSync(sp+'/blocs.json',JSON.stringify(b,null,1));
const par={};b.forEach(x=>par[x.plan]=(par[x.plan]||0)+x.duree+0.45);
console.log(Object.entries(par).map(([p,d])=>'plan'+p+': '+d.toFixed(1)+'s').join('  '),' total',Object.values(par).reduce((a,c)=>a+c,0).toFixed(0)+'s');
