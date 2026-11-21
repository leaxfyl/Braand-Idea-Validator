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

function configs(){
 const providers=[];
 const openRouterKey=process.env.OPEN_ROUTER_API_KEY||process.env.OPENROUTER_API_KEY;
 const groqKey=process.env.GROQ_API_KEY;
 if(openRouterKey)providers.push({provider:'OpenRouter',url:'https://openrouter.ai/api/v1/chat/completions',key:openRouterKey,model:process.env.OPENROUTER_MODEL||'openrouter/free',timeout:22_000});
 if(groqKey)providers.push({provider:'Groq',url:'https://api.groq.com/openai/v1/chat/completions',key:groqKey,model:process.env.GROQ_MODEL||'qwen/qwen3.8-27b',timeout:28_000});
 return providers;
}

async function ask(config,messages){
 const response=await fetch(config.url,{
  method:'POST',
  headers:{'Content-Type':'application/json',Authorization:'Bearer '+config.key},
  body:JSON.stringify({model:config.model,temperature:0.1,max_tokens:6500,response_format:{type:'json_object'},messages}),
  signal:AbortSignal.timeout(config.timeout)
 });
 if(!response.ok){
  const detail=(await response.text()).slice(0,500);
  console.error('[idea-validator] provider request failed',JSON.stringify({provider:config.provider,model:config.model,status:response.status,detail}));
  throw new Error(config.provider.toLowerCase()+' '+response.status);
 }
 const payload=await response.json();
 const choice=payload.choices?.[0];
 const content=choice?.message?.content;
 const output=Array.isArray(content)?content.map(part=>part.text||'').join('\\n'):String(content||'');
 console.info('[idea-validator] provider response',JSON.stringify({provider:config.provider,model:payload.model||config.model,finish_reason:choice?.finish_reason||'unknown',content_length:output.length}));
 const start=output.indexOf('{'),end=output.lastIndexOf('}');
 if(start<0||end<start)throw new Error('invalid json');
 try{return JSON.parse(output.slice(start,end+1))}catch{throw new Error('invalid json')}
}

async function ask(config,messages){
 const response=await fetch(config.url,{
  method:'POST',
  headers:{'Content-Type':'application/json',Authorization:'Bearer '+config.key},
  body:JSON.stringify({model:config.model,temperature:0.2,max_tokens:5000,response_format:{type:'json_object'},messages}),
  signal:AbortSignal.timeout(40_000)
 });
 if(!response.ok){
  const detail=(await response.text()).slice(0,1000);
  console.error('[idea-validator] '+config.provider+' API error',response.status,detail);
  if(response.status===429){const retry=response.headers.get('retry-after')||response.headers.get('x-ratelimit-reset-tokens')||'';throw new Error(config.provider.toLowerCase()+' 429 '+retry+' '+detail)} throw new Error(config.provider.toLowerCase()+' '+response.status);
 }
 const payload=await response.json();
 const content=payload.choices?.[0]?.message?.content;
 const output=Array.isArray(content)?content.map(part=>part.text||'').join('\n'):String(content||'');
 const start=output.indexOf('{'),end=output.lastIndexOf('}');
 if(start<0||end<start)throw new Error('invalid json');
 try{return JSON.parse(output.slice(start,end+1))}catch{throw new Error('invalid json')}
}

export async function POST(req){
 const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
 const now=Date.now();const recent=(hits.get(ip)||[]).filter(t=>now-t<60*60*1000);recent.push(now);hits.set(ip,recent);
 if(recent.length>10)return Response.json({error:'Too many validations from this network. Please try again in an hour.'},{status:429});
 let body;try{body=Input.parse(await req.json())}catch{return Response.json({error:'Please enter at least 20 characters. Add up to four JPG, PNG or WebP images.'},{status:400})}
 const providerConfigs=configs();
 if(!providerConfigs.length)return Response.json({error:'AI provider is not configured. Add an OpenRouter or Groq API key in Vercel Production environment variables.'},{status:503});
 const context=Object.entries(body.context).filter(([,value])=>value).map(([key,value])=>key+': '+value).join(' | ');
 const userContent=[{type:'text',text:'Founder context: '+(context||'not provided')+'\\nBusiness idea: '+body.idea+(body.images.length?'\\nReference images attached: '+body.images.length+'.':'')},...body.images.map(url=>({type:'image_url',image_url:{url}}))];
 const baseMessages=[{role:'system',content:SYSTEM},{role:'user',content:userContent}];
 let lastError;
 for(const config of providerConfigs){
  const messages=[...baseMessages];
  try{
   let raw;
   try{raw=await ask(config,messages)}catch(error){
    lastError=error;
    console.warn('[idea-validator] switching provider after request failure',JSON.stringify({provider:config.provider,reason:String(error.message||error)}));
    continue;
   }
   if(raw?.refused)return Response.json({refused:true,reason:String(raw.refusal_reason||'This idea cannot be assessed.')});
   let parsed=Result.safeParse(raw);
   if(!parsed.success){
    messages.push({role:'assistant',content:JSON.stringify(raw)},{role:'user',content:'Fix this object to satisfy the required response structure. Return one complete valid JSON object only. Keep every field concise. Issues: '+parsed.error.issues.slice(0,10).map(issue=>issue.path.join('.')+' '+issue.message).join('; ')});
    try{
     raw=await ask(config,messages);
     if(raw?.refused)return Response.json({refused:true,reason:String(raw.refusal_reason||'This idea cannot be assessed.')});
     parsed=Result.safeParse(raw);
    }catch(error){lastError=error;continue}
   }
   if(parsed.success)return Response.json({result:parsed.data});
   lastError=new Error('invalid response schema');
   console.warn('[idea-validator] provider returned invalid schema',JSON.stringify({provider:config.provider,issues:parsed.error.issues.slice(0,8).map(issue=>({path:issue.path.join('.'),code:issue.code}))}));
  }catch(error){lastError=error}
 }
 const message=String(lastError?.message||'');
 let errorMessage='Both AI providers failed to return a usable analysis. Please try again shortly.';
 if(message.startsWith('openrouter 401')||message.startsWith('openrouter 403'))errorMessage='OpenRouter rejected its API key. Check the OpenRouter key in Vercel.';
 else if(message.startsWith('groq 401')||message.startsWith('groq 403'))errorMessage='Groq rejected its API key. Check the Groq key in Vercel.';
 else if(message.startsWith('openrouter 429')&&providerConfigs.length===1)errorMessage='OpenRouter free-model rate limit reached. Wait for the limit to reset or add a Groq key in Vercel.';
 else if(message.startsWith('groq 429')&&providerConfigs.length===1)errorMessage='Groq rate limit reached. Wait for the quota to reset.';
 else if(message==='invalid response schema')errorMessage='The AI providers responded, but the analysis format was incomplete. Please try again.';
 else if(message==='invalid json')errorMessage='The AI providers returned an unreadable response. Please try again; no credits or idea data were changed.';
 console.error('[idea-validator] all providers failed',JSON.stringify({reason:message,providers:providerConfigs.map(p=>p.provider)}));
 return Response.json({error:errorMessage},{status:502});
}
