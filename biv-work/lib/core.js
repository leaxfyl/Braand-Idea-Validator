export const CRITERIA=[{key:'market_demand',label:'Market demand',w:0.25,hint:'Do enough local people want this and can they pay for it?'},{key:'startup_feasibility',label:'Startup feasibility',w:0.25,hint:'Can you realistically start with your skills, team and location?'},{key:'investment_requirements',label:'Investment requirements',w:0.15,hint:'Higher means cheaper and easier to fund.'},{key:'competition',label:'Competition',w:0.15,hint:'Higher means a more favourable competitive position.'},{key:'revenue_potential',label:'Revenue potential',w:0.1,hint:'Can it earn enough to be worth running?'},{key:'execution_complexity',label:'Execution complexity',w:0.1,hint:'Higher means simpler to run day to day.'}];
export const VERDICTS=[{min:80,range:'80–100',label:'Strong potential',c:'#A7FE2B'},{min:65,range:'65–79',label:'Promising, needs refinement',c:'#d4f55a'},{min:45,range:'45–64',label:'Risky, validate first',c:'#ffb020'},{min:0,range:'0–44',label:'Major concerns',c:'#ff5d5d'}];
export const verdictFor=s=>VERDICTS.find(v=>s>=v.min);
export const scoresOf=r=>Object.fromEntries(CRITERIA.map(c=>[c.key,r.sub_scores[c.key].score]));
export const computeTotal=sc=>Math.round(CRITERIA.reduce((a,c)=>a+c.w*(Number(sc[c.key])||0),0));
export const inr=n=>'₹'+Number(n||0).toLocaleString('en-IN');
const K='braand_reports_v1';
const read=()=>{try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}};
const write=a=>{try{localStorage.setItem(K,JSON.stringify(a))}catch{}};
export const listReports=()=>read();
export const getReport=id=>read().find(r=>r.id===id);
export const saveReport=r=>write([r,...read()]);
export const deleteReport=id=>write(read().filter(r=>r.id!==id));
export const setDone=(id,key,v)=>write(read().map(r=>r.id===id?{...r,done:{...r.done,[key]:v}}:r));
export function shrink(file,max=1000){return new Promise((res,rej)=>{const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{const s=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*s));c.height=Math.max(1,Math.round(img.height*s));const ctx=c.getContext('2d');if(!ctx){URL.revokeObjectURL(url);rej(new Error('Image processing unavailable'));return}ctx.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',0.82))};img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('Image could not be read'))};img.src=url})}