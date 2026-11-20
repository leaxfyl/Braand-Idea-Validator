'use client';
import {useEffect,useRef,useState} from 'react';
export function Fx(){
 const cv=useRef(null),glow=useRef(null),bar=useRef(null);
 useEffect(()=>{
  const root=document.documentElement;root.classList.add('js');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let tk=false;
  const onScroll=()=>{if(tk)return;tk=true;requestAnimationFrame(()=>{const y=scrollY,h=document.body.scrollHeight-innerHeight;root.style.setProperty('--sy',y);if(bar.current)bar.current.style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')';tk=false})};
  const onMove=e=>{
   if(!reduce){root.style.setProperty('--px',(e.clientX/innerWidth-0.5).toFixed(3));root.style.setProperty('--py',(e.clientY/innerHeight-0.5).toFixed(3));if(glow.current)glow.current.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)'}
   const g=e.target&&e.target.closest?e.target.closest('.glass'):null;
   if(g){const r=g.getBoundingClientRect();g.style.setProperty('--mx',(e.clientX-r.left)+'px');g.style.setProperty('--my',(e.clientY-r.top)+'px')}
  };
  addEventListener('scroll',onScroll,{passive:true});addEventListener('pointermove',onMove,{passive:true});onScroll();
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:0.1});
  const scan=()=>document.querySelectorAll('.rv:not(.in)').forEach(n=>io.observe(n));
  scan();const mo=new MutationObserver(scan);mo.observe(document.body,{childList:true,subtree:true});
  let raf=0,size=null,pm=null;const c=cv.current;
  if(c&&!reduce){
   const ctx=c.getContext('2d');let w=0,h=0;const dpr=Math.min(devicePixelRatio||1,2);
   size=()=>{w=innerWidth;h=innerHeight;c.width=w*dpr;c.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};size();addEventListener('resize',size);
   const N=innerWidth<700?26:58,P=[];
   for(let i=0;i<N;i++)P.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.35,vy:(Math.random()-0.5)*0.35,r:Math.random()*1.6+0.6});
   let mx=-999,my=-999;pm=e=>{mx=e.clientX;my=e.clientY};addEventListener('pointermove',pm,{passive:true});
   const tick=()=>{
    if(!document.hidden){
     ctx.clearRect(0,0,w,h);
     for(const p of P){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;const dx=p.x-mx,dy=p.y-my,d=dx*dx+dy*dy;if(d<14000){const f=(1-d/14000)*0.08;p.x+=dx*f;p.y+=dy*f}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fillStyle='rgba(167,254,43,0.75)';ctx.fill()}
     for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){const a=P[i],b=P[j],dx=a.x-b.x,dy=a.y-b.y,d=dx*dx+dy*dy;if(d<13000){ctx.strokeStyle='rgba(167,254,43,'+(0.22*(1-d/13000))+')';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}
    }
    raf=requestAnimationFrame(tick)};
   tick();
  }
  return()=>{removeEventListener('scroll',onScroll);removeEventListener('pointermove',onMove);if(size)removeEventListener('resize',size);if(pm)removeEventListener('pointermove',pm);io.disconnect();mo.disconnect();cancelAnimationFrame(raf)}
 },[]);
 return(<><div ref={bar} className='prog'/><div ref={glow} className='cglow'/><canvas ref={cv} className='cv'/></>)
}
export function Tilt({children,className='',max=10,style}){
 const r=useRef(null);
 const mv=e=>{const el=r.current,b=el.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-0.5,y=(e.clientY-b.top)/b.height-0.5;el.style.transform='perspective(900px) rotateY('+(x*max)+'deg) rotateX('+(-y*max)+'deg)'};
 const lv=()=>{if(r.current)r.current.style.transform=''};
 return <div ref={r} className={'tilt '+className} style={style} onMouseMove={mv} onMouseLeave={lv}>{children}</div>
}
export function Count({to,suffix='',prefix=''}){
 const [n,setN]=useState(0);const r=useRef(null);
 useEffect(()=>{const io=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;io.disconnect();let t0=null;const f=t=>{if(t0===null)t0=t;const p=Math.min(1,(t-t0)/1400);setN(Math.round(to*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)});io.observe(r.current);return()=>io.disconnect()},[to]);
 return <span ref={r}>{prefix}{n}{suffix}</span>
}