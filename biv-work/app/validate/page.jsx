'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {computeTotal,saveReport,shrink,scoresOf} from '@/lib/core';
const initialContext={city:'',town_type:'',budget:'',experience:'',team:'',timeline:''};
export default function ValidatePage(){
 const router=useRouter();const fileRef=useRef(null);const [idea,setIdea]=useState('');const [context,setContext]=useState(initialContext);const [images,setImages]=useState([]);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{const q=new URLSearchParams(window.location.search);if(q.get('idea'))setIdea(q.get('idea').slice(0,3000))},[]);
 const update=(key,value)=>setContext(old=>({...old,[key]:value}));
 const addFiles=async files=>{const selected=Array.from(files||[]).filter(file=>['image/jpeg','image/png','image/webp'].includes(file.type)).slice(0,4-images.length);if(!selected.length)return;try{const added=await Promise.all(selected.map(async file=>({name:file.name,data:await shrink(file,1200)})));setImages(old=>[...old,...added].slice(0,4));setError('')}catch{setError('One of those images could not be read. Try a JPG, PNG or WebP file.')}if(fileRef.current)fileRef.current.value=''};
 const submit=async event=>{event.preventDefault();setError('');if(idea.trim().length<20){setError('Give the idea a little more detail (at least 20 characters).');return}setBusy(true);try{const response=await fetch('/api/analyse',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idea:idea.trim(),context,images:images.map(item=>item.data)})});const payload=await response.json();if(!response.ok)throw new Error(payload.error||'The analysis could not be completed.');if(payload.refused)throw new Error(payload.reason||'This idea cannot be assessed.');const result=payload.result;const total=computeTotal(scoresOf(result));const report={id:crypto.randomUUID(),created:new Date().toISOString(),idea:idea.trim(),context,total,result,done:{}};saveReport(report);router.push('/report/'+report.id)}catch(err){setError(err.message||'Something went wrong. Please try again.');setBusy(false)}};
 return <main className='wrap validate-page'>
  <div className='validate-intro'><Link href='/' className='mut back'>← Back to overview</Link><p className='tag' style={{marginTop:22}}>01 / Your business idea</p><h1 style={{marginTop:10}}>Give us the <span className='grad'>real details.</span></h1><p className='mut' style={{maxWidth:620,marginTop:14,fontSize:17}}>No pitch deck language needed. Tell us what you want to build, where you want to build it and what you can realistically invest.</p></div>
  <form className='validate-grid' onSubmit={submit}>
   <section className='glass form-panel'><div className='form-section-head'><span className='num small-num'>01</span><div><h2>The idea</h2><p className='mut'>What exactly are you planning to start?</p></div></div>
    <label className='field'>Business idea<textarea value={idea} onChange={e=>setIdea(e.target.value)} minLength={20} maxLength={3000} rows={7} required placeholder='Example: I want to start a small cloud kitchen in Siliguri focused on healthy, affordable momos and thukpa for college students and office workers. I will begin with delivery and a limited menu…'/><small>{idea.length}/3000 characters · Be specific about the product, customer and business model.</small></label>
    <div className='field'><span className='field-label'>Reference images <span className='mut'>(optional)</span></span><button type='button' className='drop upload-drop' onClick={()=>fileRef.current?.click()}><span className='upload-icon'>＋</span><b>Add sketches, menus or product photos</b><small>JPG, PNG or WebP · Up to 4 images</small></button><input ref={fileRef} type='file' accept='image/jpeg,image/png,image/webp' multiple hidden onChange={e=>addFiles(e.target.files)}/>{images.length>0&&<div className='thumbs'>{images.map((item,index)=><div key={item.name+index}><img src={item.data} alt={item.name}/><button type='button' aria-label={'Remove '+item.name} onClick={()=>setImages(old=>old.filter((_,i)=>i!==index))}>×</button></div>)}</div>}</div>
   </section>
   <section className='glass form-panel'><div className='form-section-head'><span className='num small-num'>02</span><div><h2>Your context</h2><p className='mut'>The same idea can work in one place and fail in another.</p></div></div>
    <div className='form-fields'>
     <label className='field'>Where will you start?<input value={context.city} onChange={e=>update('city',e.target.value)} placeholder='e.g. Siliguri, West Bengal'/></label>
     <label className='field'>What kind of market?<select value={context.town_type} onChange={e=>update('town_type',e.target.value)}><option value=''>Choose one</option><option>Metro city</option><option>Tier 1 city</option><option>Tier 2 city</option><option>Tier 3 city / small town</option><option>Rural / semi-urban</option><option>Online / pan-India</option></select></label>
     <label className='field'>Available starting budget<input value={context.budget} onChange={e=>update('budget',e.target.value)} placeholder='e.g. ₹1.5 lakh, savings + family support'/></label>
     <label className='field'>Your relevant experience<input value={context.experience} onChange={e=>update('experience',e.target.value)} placeholder='e.g. 2 years in food service, no business experience'/></label>
     <label className='field'>Who will run it?<input value={context.team} onChange={e=>update('team',e.target.value)} placeholder='e.g. Just me, 1 co-founder, 2 employees'/></label>
     <label className='field'>When do you want to start?<select value={context.timeline} onChange={e=>update('timeline',e.target.value)}><option value=''>Choose a timeline</option><option>As soon as possible</option><option>Within 1–3 months</option><option>Within 3–6 months</option><option>Within a year</option><option>Just exploring for now</option></select></label>
    </div>
   </section>
   <div className='validate-submit glass'><div><span className='tag'>03 / The assessment</span><h2>Ready for an honest answer?</h2><p className='mut'>Your report includes a weighted score, cost range, risks, legal checks and a practical 30-day plan.</p>{error&&<p className='err' role='alert'>{error}</p>}</div><button className='btn submit-btn' type='submit' disabled={busy}>{busy?'Assessing your idea…':'Validate my idea →'}</button><small className='mut'>Free · No sign-up · Reports stay in this browser</small></div>
  </form>
 </main>;
}
