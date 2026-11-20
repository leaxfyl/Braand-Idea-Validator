import {z} from 'zod';

const Evidence=z.enum(['fact','assumption','research']);
const Item=z.object({text:z.string().min(2).max(500),evidence:Evidence});
const Score=z.object({score:z.number().int().min(0).max(100),reasoning:z.string().min(5).max(700),evidence:Evidence});
const Result=z.object({
 title:z.string().min(2).max(100),summary:z.string().min(5).max(500),
 sub_scores:z.object({market_demand:Score,startup_feasibility:Score,investment_requirements:Score,competition:Score,revenue_potential:Score,execution_complexity:Score}),
 pros:z.array(Item).min(3).max(6),cons:z.array(Item).min(3).max(6),
 risks:z.array(z.object({text:z.string().min(3).max(500),severity:z.enum(['high','medium','low']),mitigation:z.string().min(3).max(500),evidence:Evidence})).min(2).max(6),
 startup_cost_estimate:z.object({low:z.number().nonnegative(),high:z.number().nonnegative(),breakdown:z.array(Item).min(1).max(10),evidence:Evidence}),
 time_to_launch_estimate:z.string().min(2).max(100),difficulty_to_start:z.enum(['Easy','Moderate','Hard','Very Hard']),
 target_customers:z.array(Item).min(1).max(8),competitive_landscape:z.string().min(5).max(700),
 legal_and_licensing_checklist:z.array(Item).min(1).max(10),key_assumptions:z.array(Item).min(1).max(10),
 things_to_research:z.array(z.object({text:z.string().min(3).max(500),how:z.string().min(3).max(500),evidence:Evidence})).min(1).max(10),
 improvements:z.array(Item).min(2).max(6),validation_experiments:z.array(Item).min(2).max(6),
 next_steps:z.array(z.object({title:z.string().min(2).max(60),tasks:z.array(z.string().min(2).max(300)).min(1).max(8)})).length(4)
});
const Input=z.object({
 idea:z.string().trim().min(20).max(3000),
 context:z.object({city:z.string().max(100).optional(),town_type:z.string().max(80).optional(),budget:z.string().max(100).optional(),experience:z.string().max(150).optional(),team:z.string().max(150).optional(),timeline:z.string().max(100).optional()}).default({}),
 images:z.array(z.string().max(5_000_000).regex(/^data:image\/(jpeg|png|webp);base64,/)).max(4).default([])
});
const SYSTEM=`You are a candid senior business consultant at Braand School, a business and branding institute in India. Judge how realistic it is to START this business now, not how big it could become. Be strict and do not flatter: most ideas should score between 35 and 75, and a vague idea must score low on startup_feasibility and say it needs clarity. Consider the real-world environment for the given location: local demand, demographics and purchasing power, local competition, regulations and licences (FSSAI, GST, trade licence and others where relevant), supply chain, hiring, seasonality, infrastructure, digital adoption and cultural fit. Tag EVERY item with evidence: fact (well-established general knowledge), assumption (your estimate or inference) or research (something the founder must verify locally, such as rent or the number of nearby competitors). Never invent statistics, named competitors or exact local data. Give ranges and label estimates assumption. If an image is unclear or irrelevant, say so. Keep every text field concise. If the idea is harmful or illegal, return only a JSON object with refused set to true and refusal_reason as a short polite reason. Otherwise return ONLY one JSON object, with no markdown and no code fences, with these keys. Scores are integers 0 to 100 where higher is always better for the founder (investment_requirements: higher means cheaper to fund; competition: higher means a more favourable position; execution_complexity: higher means simpler to run). Keys: title; summary; sub_scores with market_demand, startup_feasibility, investment_requirements, competition, revenue_potential, execution_complexity, each with score, reasoning and evidence; pros and cons (3 to 6 items each); risks (2 to 6 items, each with severity, mitigation and evidence); startup_cost_estimate (low and high as INR numbers, breakdown items and evidence); time_to_launch_estimate; difficulty_to_start (Easy, Moderate, Hard, Very Hard); target_customers; competitive_landscape (no named competitors); legal_and_licensing_checklist; key_assumptions; things_to_research (each with how); improvements; validation_experiments; next_steps (exactly 4 objects with title and tasks). An item is an object with text and evidence (fact, assumption or research).`;
const hits=new Map();
function cfg(req){
 if(process.env.OPENAI_API_KEY)return{url:'https://api.openai.com/v1/chat/completions',key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||'gpt-4o',json:true};
 const key=process.env.AI_GATEWAY_API_KEY||req.headers.get('x-vercel-oidc-token')||process.env.VERCEL_OIDC_TOKEN;
 return key?{url:'https://ai-gateway.vercel.sh/v1/chat/completions',key,model:process.env.AI_MODEL||'anthropic/claude-sonnet-5.5',json:false}:null;
}
async function ask(c,messages){
 const body={model:c.model,temperature:0.35,max_tokens:6000,messages};
 if(c.json)body.response_format={type:'json_object'};
 const response=await fetch(c.url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+c.key},body:JSON.stringify(body),signal:AbortSignal.timeout(55_000)});
 if(!response.ok)throw new Error('ai '+response.status);
 const payload=await response.json();
 const content=payload.choices?.[0]?.message?.content;
 const text=Array.isArray(content)?content.map(part=>part.text||'').join('\n'):String(content||'');
 const start=text.indexOf('{'),end=text.lastIndexOf('}');
 if(start<0||end<start)throw new Error('invalid json');
 return JSON.parse(text.slice(start,end+1));
}
export async function POST(req){
 const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
 const now=Date.now();const recent=(hits.get(ip)||[]).filter(t=>now-t<60*60*1000);recent.push(now);hits.set(ip,recent);
 if(recent.length>10)return Response.json({error:'Too many validations from this network. Please try again in an hour.'},{status:429});
 let body;try{body=Input.parse(await req.json())}catch{return Response.json({error:'Please enter at least 20 characters. Add up to four JPG, PNG or WebP images.'},{status:400})}
 const config=cfg(req);
 if(!config)return Response.json({error:'AI access is not configured. The site owner needs to connect an AI provider in Vercel.'},{status:503});
 const context=Object.entries(body.context).filter(([,value])=>value).map(([key,value])=>key+': '+value).join(' | ');
 const userContent=[{type:'text',text:'Founder context: '+(context||'not provided')+'\nBusiness idea: '+body.idea+(body.images.length?'\nReference images attached: '+body.images.length+'.':'')} ,...body.images.map(url=>({type:'image_url',image_url:{url}}))];
 const messages=[{role:'system',content:SYSTEM},{role:'user',content:userContent}];
 try{
  for(let attempt=0;attempt<2;attempt++){
   let raw;try{raw=await ask(config,messages)}catch(error){if(String(error.message).startsWith('ai '))throw error;raw=null}
   if(!raw){messages.push({role:'user',content:'Return one valid JSON object only. Do not use markdown.'});continue}
   if(raw.refused)return Response.json({refused:true,reason:String(raw.refusal_reason||'This idea cannot be assessed.')});
   const parsed=Result.safeParse(raw);
   if(parsed.success)return Response.json({result:parsed.data});
   messages.push({role:'assistant',content:JSON.stringify(raw)},{role:'user',content:'Correct the JSON to match this schema issue list and return the complete JSON only: '+parsed.error.issues.slice(0,8).map(issue=>issue.path.join('.')+' '+issue.message).join('; ')});
  }
  return Response.json({error:'The analysis came back incomplete. Please try again.'},{status:502});
 }catch(error){
  const message=String(error?.message||'');
  const status=/ai (401|402|403)/.test(message)?'AI access is not authorised or has run out of credits. Check the provider connection in Vercel.':'The AI service is busy or unavailable. Please try again in a minute.';
  return Response.json({error:status},{status:502});
 }
}
