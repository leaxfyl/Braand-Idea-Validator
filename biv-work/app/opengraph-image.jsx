import {ImageResponse} from 'next/og';
export const alt='Braand Idea Validator by Braand School';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',padding:80,background:'linear-gradient(135deg,#050505 45%,#22350a)',color:'#ffffff'}}><div style={{display:'flex',fontSize:30,color:'#A7FE2B'}}>BRAAND SCHOOL</div><div style={{display:'flex',fontSize:82,fontWeight:800,marginTop:24,lineHeight:1.05}}>Is your business idea ready for the real world?</div><div style={{display:'flex',fontSize:32,color:'#a3a3ad',marginTop:28}}>Free AI Business Idea Validator</div></div>,size)}