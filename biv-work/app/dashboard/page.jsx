'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {listReports,deleteReport} from '@/lib/core';
import {Verdict} from '@/components/ui';
export default function Dash(){
 const [rows,setRows]=useState(null);const [pick,setPick]=useState([]);
 useEffect(()=>{setRows(listReports())},[]);
 const tog=id=>setPick(p=>p.includes(id)?p.filter(x=>x!==id):p.length>=2?[p[1],id]:[...p,id]);
 const del=r=>{if(confirm('Delete this report? This cannot be undone.')){deleteReport(r.id);setRows(listReports());setPick(p=>p.filter(x=>x!==r.id))}};
 return(<main className='wrap'>
  <div className='row' style={{padding:0}}><div><p className='tag'>// Dashboard</p><h1 style={{fontSize:'clamp(30px,5vw,48px)',marginTop:8}}>My reports</h1><p className='mut' style={{marginTop:8}}>Saved in this browser. Tick two reports to compare them.</p></div><Link className='btn' href='/validate'>New idea</Link></div>
  {rows===null&&<div className='glass' style={{marginTop:24}}>Loading…</div>}
  {rows&&rows.length===0&&<div className='glass center' style={{marginTop:24}}><h2 style={{fontSize:24}}>No reports yet</h2><p className='mut'>Describe your first idea and get a strict readiness score.</p><Link className='btn' href='/validate'>Validate an idea</Link></div>}
  {rows&&rows.length>0&&<div className='grid' style={{marginTop:24}}>{rows.map(r=><div key={r.id} className='glass lift' style={pick.includes(r.id)?{boxShadow:'0 0 0 2px #A7FE2B,0 0 40px rgba(167,254,43,.3)'}:null}>
   <div className='row' style={{padding:0}}><label className='pick'><input type='checkbox' checked={pick.includes(r.id)} onChange={()=>tog(r.id)}/>Compare</label><button className='btn ghost sm' onClick={()=>del(r)}>Delete</button></div>
   <Link href={'/report/'+r.id} style={{display:'block',marginTop:12}}><div style={{display:'flex',gap:14,alignItems:'center'}}><span className='grad' style={{fontSize:48,fontWeight:900}}>{r.total}</span><div><b>{r.result.title}</b><br/><small>{new Date(r.created).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</small></div></div><div style={{marginTop:12}}><Verdict score={r.total}/></div></Link></div>)}</div>}
  {pick.length>0&&<div className='glass row' style={{position:'fixed',bottom:16,left:'50%',transform:'translateX(-50%)',width:'min(420px,92vw)',zIndex:20}}><span>{pick.length===1?'Pick one more':'2 selected'}</span>{pick.length===2?<Link className='btn sm' href={'/compare?a='+pick[0]+'&b='+pick[1]}>Compare</Link>:<button className='btn sm' disabled>Compare</button>}</div>}
 </main>)}