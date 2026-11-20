import './globals.css';
import {Fx} from '@/components/Fx';

const SITE='https://braand-idea-validator.vercel.app';
const BS='https://braandschool.com';
export const metadata={
  metadataBase:new URL(SITE),
  title:{default:'Braand Idea Validator: free AI business idea validator by Braand School',template:'%s | Braand Idea Validator'},
  description:'Check if your business idea is realistic to start. Get a strict AI score, costs in INR, licences, risks and a 30-day plan. Free, by Braand School, Siliguri.',
  keywords:['Braand Idea Validator','business idea validator','validate business idea','startup idea checker India','Braand School','Siliguri'],
  alternates:{canonical:'/'},robots:{index:true,follow:true},
  openGraph:{title:'Braand Idea Validator: is your business idea ready?',description:'A candid AI business-consultant report with a 30-day plan. By Braand School.',url:SITE,siteName:'Braand Idea Validator',type:'website',locale:'en_IN'},
  twitter:{card:'summary_large_image',title:'Braand Idea Validator',description:'Is your business idea ready for the real world? Free AI report by Braand School.'}
};
export const viewport={width:'device-width',initialScale:1,themeColor:'#050505'};
const ld={'@context':'https://schema.org','@type':'WebApplication',name:'Braand Idea Validator',url:SITE,applicationCategory:'BusinessApplication',operatingSystem:'Web',description:'AI business idea validator that scores how realistic an idea is to start and gives a pros, cons and risk report.',offers:{'@type':'Offer',price:'0',priceCurrency:'INR'},publisher:{'@type':'EducationalOrganization',name:'Braand School',url:BS}};
export default function RootLayout({children}){
 return <html lang='en'><body>
  <div className='bg' aria-hidden='true'><i/><i/><i/></div><Fx/><div className='grain' aria-hidden='true'/>
  <script type='application/ld+json' dangerouslySetInnerHTML={{__html:JSON.stringify(ld)}}/>
  <header className='top noprint'><a href='/' className='logo'><img className='brand-logo-image' src='/bs-mark.svg?v=6' alt='Braand School Bs logo' width='80' height='81' /><b>Braand Idea Validator</b></a><nav><a href='/dashboard'>My reports</a><a href={BS+'/courses'} target='_blank' rel='noopener noreferrer'>Courses ↗</a><a href={BS} target='_blank' rel='noopener noreferrer'>braandschool.com ↗</a><a href='/validate' className='btn sm'>Validate an idea</a></nav></header>
  {children}
  <footer className='foot noprint'><div className='fgrid'><div><b>Braand School</b><p>A practical school for marketing, branding and design in Siliguri. Run by practitioners, built around real client work.</p><p style={{marginTop:10}}>2nd Floor, Pradhan Building, Rishi Aurobindo Rd, Ward 12, Hakim Para, Siliguri, West Bengal 734001</p></div><div><b>Learn with us</b><a href={BS} target='_blank' rel='noopener noreferrer'>Official website</a><a href={BS+'/courses'} target='_blank' rel='noopener noreferrer'>All courses</a><a href={BS+'/#apply'} target='_blank' rel='noopener noreferrer'>Apply for a seat</a><a href={BS+'/contact-us/'} target='_blank' rel='noopener noreferrer'>Contact</a></div><div><b>Get in touch</b><a href='tel:+919083596000'>+91 90835 96000</a><a href='mailto:hello@braandschool.com'>hello@braandschool.com</a><a href='https://wa.me/919083596000' target='_blank' rel='noopener noreferrer'>WhatsApp</a><a href='https://www.instagram.com/braandschool/' target='_blank' rel='noopener noreferrer'>Instagram</a><a href='https://www.linkedin.com/school/braandschool/' target='_blank' rel='noopener noreferrer'>LinkedIn</a><a href='https://www.youtube.com/@braandschool' target='_blank' rel='noopener noreferrer'>YouTube</a></div></div><p className='legal'>This is a preliminary AI assessment, not a guarantee of business success or professional advice. Verify key facts locally before investing. © 2026 Braand School.</p></footer>
 </body></html>
}
