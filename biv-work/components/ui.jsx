'use client';
import {useEffect,useState} from 'react';
import {verdictFor} from '@/lib/core';
export const EV={fact:['Fact','#A7FE2B'],assumption:['AI assumption','#ffb020'],research:['You need to research','#a78bfa']};
export function Chip({t}){const e=EV[t];if(!e)return null;return <span className='chip' style={{color:e[1],borderColor:e[1]+'66',background:e[1]+'1a'}}>{e[0]}</span>}
export function Verdict({score}){const v=verdictFor(score);return <span className='chip big' style={{color:v.c,borderColor:v.c+'88',background:v.c+'22'}}>{v.label}</span>}
export function Bar({v}){const c=verdictFor(v).c;return <div className='bar'><i style={{width:Math.min(100,v)+'%',background:'linear-gradient(90deg,'+c+'55,'+c+')',boxShadow:'0 0 12px '+c+'88'}}/></div>}
export function Gauge({score,size=200}){
 const [n,setN]=useState(0);
 useEffect(()=>{let f,t0=null;const run=t=>{if(t0===null)t0=t;const p=Math.min(1,(t-t0)/1100);setN(Math.round(score*(1-Math.pow(1-p,3))));if(p<1)f=requestAnimationFrame(run)};f=requestAnimationFrame(run);return()=>cancelAnimationFrame(f)},[score]);
 const r=size/2-14,C=2*Math.PI*r,v=verdictFor(score);
 return <div style={{position:'relative',width:size,height:size,filter:'drop-shadow(0 0 24px '+v.c+'77)'}}><div className='gring' style={{'--gc':v.c}}/><svg width={size} height={size} style={{transform:'rotate(-90deg)',position:'relative'}}><circle cx={size/2} cy={size/2} r={r} fill='none' stroke='rgba(255,255,255,.1)' strokeWidth='12'/><circle cx={size/2} cy={size/2} r={r} fill='none' stroke={v.c} strokeWidth='12' strokeLinecap='round' strokeDasharray={C} strokeDashoffset={C*(1-n/100)}/></svg><div className='gnum'><b style={{fontSize:size/3.4}}>{n}</b><small>out of 100</small></div></div>
}