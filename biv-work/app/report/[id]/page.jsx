'use client';
import {useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
import Link from 'next/link';
import {CRITERIA,getReport,setDone,inr} from '@/lib/core';
import {Gauge,Chip,Bar,Verdict} from '@/components/ui';
function List({a,fl}){const l=(a||[]).filter(i=>fl==='all'||i.evidence===fl);return l.length?<ul className='list'>{l.map((i,k)=><li key={k}><span>{i.text}</span><Chip t={i.evidence}/></li>)}</ul>:<p className='mut'>Nothing under this filter.</p>}
function Card({t,cls,children}){return <div className={'glass card rv '+(cls||'')}><h2>{t}</h2>{children}</div>}
export default function Report(){
 const {id}=useParams();const [r,setR]=useState(undefined);const [fl,setFl]=useState('all');const [done,setD]=useState({});
 useEffect(()=>{const g=getReport(id)||null;setR(g);setD(g?g.done||{}:{})},[id]);
 if(r===undefined)return <main className='wrap'><div className='glass'>Loading your report…</div></main>;
 if(!r)return <main className='wrap'><div className='glass center'><h1 style={{fontSize:32}}>Report not found</h1><p className='mut'>Reports are saved in the browser where you created them.</p><Link className='btn' href='/dashboard'>My reports</Link></div></main>;
 const x=r.result,c=x.startup_cost_estimate,lvl=['Easy','Moderate','Hard','Very Hard'].indexOf(x.difficulty_to_start)+1;
 const tick=(k,v)=>{setD(d=>({...d,[k]:v}));setDone(id,k,v)};
 const res=x.things_to_research||[],n=res.filter((_,i)=>done['r'+i]).length;
 return(<main className='wrap'>
 <div className='glass topr'><div style={{display:'grid',gap:12,justifyItems:'center',padding:14}}><Gauge score={r.total} size={210}/><Verdict score={r.total}/></div>
  <div><h1 style={{fontSize:'clamp(28px,5vw,46px)'}}>{x.title}</h1><p className='mut' style={{marginTop:10}}>{x.summary}</p>
  <div className='fl noprint' style={{marginTop:16}}><button className='btn ghost sm' onClick={()=>window.print()}>Download PDF</button><Link className='btn ghost sm' href={'/validate?idea='+encodeURIComponent(r.idea.slice(0,3000))}>Re-run with edits</Link></div></div></div>
 <div className='glass card fl noprint'><span className='mut'>Show:</span><button className={'f '+(fl==='all'?'on':'')} onClick={()=>setFl('all')}>Everything</button>{['fact','assumption','research'].map(t=><button key={t} className={'f '+(fl===t?'on':'')} onClick={()=>setFl(t)}><Chip t={t}/></button>)}</div>
 <Card t='Score breakdown'>{CRITERIA.map(c=>{const s=x.sub_scores[c.key];return(<details key={c.key}><summary><div className='row' style={{padding:0}}><b>{c.label} <small>· {Math.round(c.w*100)}%</small></b><b>{Math.round(s.score)}</b></div><Bar v={s.score}/></summary><p className='mut' style={{marginTop:10}}>{s.reasoning} <Chip t={s.evidence}/></p></details>)})}</Card>
 <div className='g2'><Card t='Pros' cls='good'><List a={x.pros} fl={fl}/></Card><Card t='Cons' cls='bad'><List a={x.cons} fl={fl}/></Card></div>
 <Card t='Risks and how to reduce them'><ul className='list'>{(x.risks||[]).filter(i=>fl==='all'||i.evidence===fl).map((i,k)=><li key={k} style={{display:'block'}}><div className='fl'><span className='chip' style={{color:i.severity==='high'?'#ff7b72':i.severity==='medium'?'#ffb020':'#A7FE2B',borderColor:'currentColor'}}>{i.severity}</span><Chip t={i.evidence}/></div><p style={{marginTop:6}}><b>{i.text}</b></p><p className='mut'>Fix: {i.mitigation}</p></li>)}</ul></Card>
 <div className='g2'><div className='glass card rv'><div className='row' style={{padding:0}}><h2 style={{margin:0}}>Startup cost</h2><Chip t={c.evidence}/></div><p className='grad' style={{fontSize:30,fontWeight:900,margin:'12px 0'}}>{inr(c.low)} – {inr(c.high)}</p><List a={c.breakdown} fl={fl}/></div>
 <div className='glass card rv'><h2>Difficulty to start</h2><p style={{fontSize:26,fontWeight:800}}>{x.difficulty_to_start}</p><div style={{display:'flex',gap:6,margin:'12px 0'}}>{[1,2,3,4].map(i=><span key={i} style={{flex:1,height:8,borderRadius:9,background:i<=lvl?'#A7FE2B':'rgba(255,255,255,.12)',boxShadow:i<=lvl?'0 0 10px rgba(167,254,43,.6)':'none'}}/>)}</div><p className='mut'>Time to launch: <b style={{color:'#fff'}}>{x.time_to_launch_estimate}</b></p></div></div>
 {res.length>0&&<Card t='What to research next'><p className='mut' style={{marginBottom:12}}>{n} of {res.length} done</p><ul className='list'>{res.map((i,k)=>(fl==='all'||i.evidence===fl)&&<li key={k}><label className='pick' style={{color:'#fff',alignItems:'flex-start',fontSize:16}}><input type='checkbox' checked={!!done['r'+k]} onChange={e=>tick('r'+k,e.target.checked)}/><span style={{textDecoration:done['r'+k]?'line-through':'none'}}>{i.text}<small style={{display:'block'}}>How: {i.how}</small></span></label><Chip t={i.evidence}/></li>)}</ul></Card>}
 <div className='g2'><Card t='Who it is for'><List a={x.target_customers} fl={fl}/></Card><Card t='Licences and legal'><List a={x.legal_and_licensing_checklist} fl={fl}/></Card></div>
 <Card t='Competitive landscape'><p>{x.competitive_landscape}</p></Card>
 <Card t='Key assumptions'><List a={x.key_assumptions} fl={fl}/></Card>
 <div className='g2'><Card t='Make it stronger'><List a={x.improvements} fl={fl}/></Card><Card t='Cheap validation tests'><List a={x.validation_experiments} fl={fl}/></Card></div>
 <Card t='Your 30-day plan'><ol className='steps'>{(x.next_steps||[]).map((w,i)=><li key={i}><b>{w.title}</b><ul style={{margin:'6px 0 0',paddingLeft:18}} className='mut'>{w.tasks.map((t,j)=><li key={j}>{t}</li>)}</ul></li>)}</ol></Card>
 <p className='glass card mut rv' style={{fontSize:14}}>This is a preliminary AI assessment, not a guarantee of business success or professional advice. Verify key facts locally before investing.</p>
 <div className='glass card center noprint rv'><span className='tag'>Next step</span><h2>Want to turn this idea into a brand?</h2><p className='mut' style={{maxWidth:480}}>Braand School teaches the marketing, branding and content skills new businesses need, on campus in Siliguri.</p><div className='fl' style={{justifyContent:'center'}}><a className='btn' href='https://braandschool.com/courses' target='_blank' rel='noopener'>Explore Braand courses ↗</a><a className='btn ghost' href='https://wa.me/919083596000' target='_blank' rel='noopener'>Talk to a counsellor</a></div></div>
 </main>)}