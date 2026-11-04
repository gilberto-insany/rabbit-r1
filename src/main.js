import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createViews } from './viewer.js';
import { setupOSDemo } from './os-demo.js';
gsap.registerPlugin(ScrollTrigger);
const {fan,hardware}=createViews();
const mm=gsap.matchMedia();
setupOSDemo();

const nav=document.querySelector('.nav');
const navToggle=document.querySelector('.nav-toggle');
const navShell=document.querySelector('.nav-shell');
let navFrame=0;
function updateNav(){navShell.classList.toggle('is-floating',window.scrollY>48);navFrame=0;}
window.addEventListener('scroll',()=>{if(!navFrame)navFrame=requestAnimationFrame(updateNav);},{passive:true});
updateNav();
function closeNav(returnFocus=false){nav.classList.remove('open');navToggle.setAttribute('aria-expanded','false');navToggle.setAttribute('aria-label','Open navigation');if(returnFocus)navToggle.focus();}
navToggle.addEventListener('click',()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);navToggle.setAttribute('aria-expanded',String(open));navToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');if(open)nav.querySelector('nav a').focus();});
nav.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>closeNav()));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open'))closeNav(true);});
document.addEventListener('click',e=>{if(!e.target.closest('.nav-shell'))closeNav();});

// Like the reference, each deliberate click leaves a bounded, decorative rabbit.
const hero=document.querySelector('.hero-media');
const stamps=hero.querySelector('.hero-stamps');
let clickStart=null,stampCount=0;
function addRabbit(clientX,clientY){
 const r=hero.getBoundingClientRect(),mobile=innerWidth<600;
 const sx=r.width/hero.offsetWidth,sy=r.height/hero.offsetHeight;
 const w=mobile?64:82,h=mobile?93:119;
 const x=Math.max(w/2,Math.min(hero.offsetWidth-w/2,(clientX-r.left)/sx));
 const y=Math.max(h/2,Math.min(hero.offsetHeight-h/2,(clientY-r.top)/sy));
 if(stamps.children.length>=12){const old=stamps.firstElementChild;gsap.killTweensOf(old);old.remove();}
 const img=document.createElement('img');img.src='assets/rabbit-screen.svg';img.alt='';img.className='hero-stamp';img.width=w;img.height=h;img.style.left=`${x-w/2}px`;img.style.top=`${y-h/2}px`;stamps.append(img);
 const rotation=((stampCount++%5)-2)*11;
 if(matchMedia('(prefers-reduced-motion:reduce)').matches){gsap.set(img,{rotation});return;}
 gsap.fromTo(img,{scale:.35,rotation:rotation-12,autoAlpha:0},{scale:1,rotation,autoAlpha:1,duration:.42,ease:'back.out(1.8)'});
}
hero.addEventListener('pointerdown',e=>{if(e.target.closest('button,a'))return;clickStart={x:e.clientX,y:e.clientY,id:e.pointerId};});
hero.addEventListener('pointerup',e=>{if(!clickStart||e.pointerId!==clickStart.id)return;const start=clickStart;clickStart=null;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)<8&&!e.target.closest('button,a'))addRabbit(e.clientX,e.clientY);});
hero.addEventListener('pointercancel',()=>clickStart=null);
document.querySelector('.rabbit-trigger').addEventListener('click',()=>{const r=hero.getBoundingClientRect();addRabbit(r.left+r.width*(.56+(stampCount%4)*.09),r.top+r.height*(.27+(stampCount%3)*.13));});

function setupMotion(){mm.add({desktop:'(min-width:901px)',mobile:'(max-width:900px)',reduce:'(prefers-reduced-motion:reduce)'},context=>{
 const {reduce}=context.conditions;
 if(reduce){fan.setSpread(1);hardware.setProgress(0);return;}
 const track=document.querySelector('.marquee-track'),slot=document.querySelector('.marquee-slot'),frame=document.querySelector('.hero-pin');
 // Measure the real word-space after the brand font loads. Subtract the track's
 // translation so the film and phrase arrive at their final positions together.
 const dock=()=>{
  const a=slot.getBoundingClientRect(),b=frame.getBoundingClientRect();
  const tx=Number(gsap.getProperty(track,'x'))||0,scale=a.width/b.width;
  const inset=Math.max(0,(b.height-a.height/scale)/2/b.height*100);
  return {scale,x:a.left+a.width/2-tx-b.left-b.width/2,y:a.top+a.height/2-b.top-b.height/2,clip:`inset(${inset}% 0% ${inset}% 0% round ${12/scale}px)`};
 };
 const entrance=gsap.timeline({scrollTrigger:{id:'hero-dock',trigger:'.hero',start:'top top',end:'bottom bottom',scrub:.45,invalidateOnRefresh:true}});
 entrance.fromTo('.hero-media',{scale:1,x:0,y:0,clipPath:'inset(0% 0% 0% 0% round 0px)'},{scale:()=>dock().scale,x:()=>dock().x,y:()=>dock().y,clipPath:()=>dock().clip,ease:'power1.inOut',duration:.78},0)
  .fromTo(track,{x:()=>innerWidth*.6},{x:0,ease:'power1.inOut',duration:.78},0)
  .to('.hero-caption,.hero-meta,.hero-stamps',{autoAlpha:0,ease:'none',duration:.22},0)
  .to('.hero-shade',{autoAlpha:0,ease:'none',duration:.4},0)
  .to({},{duration:.22});
 const fanState={value:0};
 gsap.to(fanState,{value:1,ease:'power2.out',onUpdate:()=>fan.setSpread(fanState.value),scrollTrigger:{trigger:'.meet',start:'top 80%',end:'center center',scrub:.65}});
 const rotation={value:0};
 gsap.to(rotation,{value:1,ease:'none',onUpdate:()=>{hardware.setProgress(rotation.value);document.querySelector('.explore-count').textContent=`${String(Math.round(rotation.value*360)).padStart(3,'0')}° / 360°`;},scrollTrigger:{trigger:'.explore',start:'top top',end:'bottom bottom',scrub:.6}});
 gsap.from('.details-heading',{y:28,autoAlpha:0,duration:.7,scrollTrigger:{trigger:'.details-heading',start:'top 90%',once:true}});
 gsap.from('.detail-card',{y:35,autoAlpha:0,duration:.7,stagger:.12,scrollTrigger:{trigger:'.detail-grid',start:'top 88%',once:true}});
});}

document.querySelectorAll('[data-screen]').forEach(button=>button.addEventListener('click',()=>{
 hardware.setScreen(button.dataset.screen);
 document.querySelectorAll('[data-screen]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});
}));
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
 hardware.setView(button.dataset.view);
 document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('selected',b===button);if(b.dataset.view!=='reset')b.setAttribute('aria-pressed',String(b===button));});
}));
document.fonts.ready.then(()=>{setupMotion();ScrollTrigger.refresh();});
window.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
