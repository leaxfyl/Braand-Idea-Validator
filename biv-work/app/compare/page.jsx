'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {CRITERIA,getReport,inr} from '@/lib/core';
import {Gauge,Verdict,Bar} from '@/components/ui';
export default function Compare(){
 const [p,setP]=useState(undefined);
 useEffect(()=>{const q=new URLSearchParams(location.search);const a=getReport(q.get('a')),b=getReport(q.get('b'));setP(a&&b&&a.id!==b.id?[a,b]:null)},[]);
 if(p===undefined)return <main className='wrap'><div className='glass'>Loading…</div></main>;
 if(!p)return <main className='wrap'><div className='glass center'><h1 style={{fontSize:30}}>Can’t compare these</h1><p className='mut'>Pick two different reports saved in this browser.</p><Link className='btn' href='/dashboard'>My reports</Link></div></main>;
 const [A,B]=p;const win=A.total===B.total?null:A.total>B.total?A:B;
 return(<main className='wrap'>
  <Link href='/dashboard' className='mut'>← My reports</Link>
  <h1 style={{fontSize:'clamp(30px,5vw,48px)',margin:'12px 0'}}>Idea vs idea</h1>
  <p className='mut'>{win?'The stronger starting position is '+win.result.title+', but read the details before choosing.':'Both ideas score the same overall. The details break the tie.'}</p>
  <div className='g2'>{p.map(r=><Link key={r.id} href={'/report/'+r.id} className='glass lift center' style={win&&win.id===r.id?{boxShadow:'0 0 0 2px #A7FE2B,0 0 40px rgba(167,254,43,.3)',padding:30}:{padding:30}}><Gauge score={r.total} size={150}/><h3>{r.result.title}</h3><Verdict score={r.total}/></Link>)}</div>
  <div className='glass card'><h2>Criterion by criterion</h2>{CRITERIA.map(c=><div key={c.key} style={{marginBottom:18}}><b>{c.label} <small>· {Math.round(c.w*100)}%</small></b>{p.map(r=><div key={r.id} style={{display:'grid',gridTemplateColumns:'110px 1fr 32px',gap:10,alignItems:'center',marginTop:6,fontSize:13}}><span className='mut' style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.result.title}</span><Bar v={r.result.sub_scores[c.key].score}/><b>{Math.round(r.result.sub_scores[c.key].score)}</b></div>)}</div>)}</div>
  <div className='glass card' style={{overflowX:'auto'}}><h2>At a glance</h2><table style={{width:'100%',minWidth:420,textAlign:'left',borderCollapse:'collapse'}}><thead><tr><th/>{p.map(r=><th key={r.id} style={{padding:8}}>{r.result.title}</th>)}</tr></thead><tbody>{[['Startup cost',r=>inr(r.result.startup_cost_estimate.low)+' – '+inr(r.result.startup_cost_estimate.high)],['Time to launch',r=>r.result.time_to_launch_estimate],['Difficulty',r=>r.result.difficulty_to_start],['High-severity risks',r=>String((r.result.risks||[]).filter(i=>i.severity==='high').length)]].map(row=><tr key={row[0]} style={{borderTop:'1px solid rgba(255,255,255,.1)'}}><th className='mut' style={{padding:8,fontWeight:400}}>{row[0]}</th>{p.map(r=><td key={r.id} style={{padding:8}}>{row[1](r)}</td>)}</tr>)}</tbody></table></div>
  <p className='glass card mut' style={{fontSize:14}}>Preliminary AI assessments, not a guarantee of business success. Verify key facts locally before investing.</p>
 </main>)}