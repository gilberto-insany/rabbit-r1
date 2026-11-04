import { gsap } from 'gsap';
const examples={
 plan:{title:'make room for a little curiosity.',hint:'a creative afternoon, planned around you.',prompt:'Plan a creative afternoon around art, coffee and a little time outside.',reply:'A little room for curiosity. Here’s one way to spend it.',card:'<h3>your creative afternoon</h3><ul><li><span>01</span> discover a small gallery</li><li><span>02</span> take a coffee break, without the rush</li><li><span>03</span> go for a walk. notice something new.</li></ul>'},
 idea:{title:'give a small idea somewhere to go.',hint:'capture a thought. come back to it later.',prompt:'Capture an idea: a tiny gallery of the things I notice every day.',reply:'Small observations can be the start of something.',card:'<h3>everyday discoveries</h3><ul><li><span>01</span> an idea: collect what catches your eye</li><li><span>02</span> a next step: give each discovery a name</li><li><span>03</span> a little context: come back and connect them</li></ul>'},
 create:{title:'what would you like to make?',hint:'start with a pocket-sized color palette.',prompt:'Make a small color palette tool for my r1.',reply:'A little tool, made around an idea. Try a swatch.',card:'<h3>a pocket palette</h3><div class="os-palette" role="group" aria-label="Palette colors"><button type="button" style="background:#ff5c00" data-color="#FF5C00" aria-label="Orange" aria-pressed="true"></button><button type="button" style="background:#f0f0eb" data-color="#F0F0EB" aria-label="Paper" aria-pressed="false"></button><button type="button" style="background:#745cff" data-color="#745CFF" aria-label="Violet" aria-pressed="false"></button><button type="button" style="background:#00d5cf" data-color="#00D5CF" aria-label="Turquoise" aria-pressed="false"></button></div><p class="os-palette-readout" aria-live="polite">orange / #FF5C00</p>'}
};
export function setupOSDemo(){
 const panel=document.querySelector('.os-workspace'),idle=panel.querySelector('.os-idle'),user=panel.querySelector('.os-user'),working=panel.querySelector('.os-working'),result=panel.querySelector('.os-result');
 const button=panel.querySelector('.os-run'),status=document.querySelector('#os-status'),input=document.querySelector('#os-input-label');
 let selected='plan',timeline=null;
 function reset(){
  timeline?.kill();gsap.killTweensOf(result);gsap.set(result,{clearProps:'all'});
  panel.dataset.state='ready';panel.setAttribute('aria-busy','false');idle.hidden=false;user.hidden=true;working.hidden=true;result.hidden=true;result.replaceChildren();button.disabled=false;
  idle.querySelector('p').textContent=examples[selected].title;
  idle.querySelector('span').textContent=examples[selected].hint;
  input.textContent=examples[selected].prompt;
  status.textContent='Play this example to see how the conversation unfolds.';
  button.setAttribute('aria-label','Play the example request');
  panel.querySelector('.os-conversation').scrollTop=0;
 }
 function showRequest(){idle.hidden=true;user.hidden=false;user.querySelector('p').textContent=examples[selected].prompt;panel.dataset.state='working';input.textContent='connecting the next steps.';}
 function showResult(){
  working.hidden=true;result.innerHTML=`<span class="os-agent">rabbit OS3</span><p>${examples[selected].reply}</p><div class="os-result-card">${examples[selected].card}</div>`;result.hidden=false;
  panel.dataset.state='complete';panel.setAttribute('aria-busy','false');button.disabled=false;button.setAttribute('aria-label','Replay the example request');input.textContent='one thought. a little further.';status.textContent='Example ready. Try another thought, or replay.';
  result.querySelectorAll('[data-color]').forEach(swatch=>swatch.addEventListener('click',()=>{
   result.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b===swatch)));
   result.querySelector('.os-palette-readout').textContent=`${swatch.getAttribute('aria-label').toLowerCase()} / ${swatch.dataset.color}`;
  }));
  const conversation=panel.querySelector('.os-conversation');
  requestAnimationFrame(()=>{conversation.scrollTop=conversation.scrollHeight;});
 }
 function run(){
  reset();panel.setAttribute('aria-busy','true');button.disabled=true;status.textContent='Playing an example interaction.';
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){showRequest();showResult();return;}
  panel.dataset.state='listening';input.textContent='playing the example request…';
  timeline=gsap.timeline().to({},{duration:.65}).call(showRequest).to({},{duration:.45}).call(()=>working.hidden=false).to({},{duration:1.25}).call(showResult).from(result,{y:10,autoAlpha:0,duration:.25,ease:'power1.out',immediateRender:false});
 }
 document.querySelectorAll('[data-os-example]').forEach(option=>option.addEventListener('click',()=>{
  selected=option.dataset.osExample;
  document.querySelectorAll('[data-os-example]').forEach(b=>{b.classList.toggle('selected',b===option);b.setAttribute('aria-pressed',String(b===option));});reset();
 }));
 button.addEventListener('click',run);document.querySelector('.os-replay').addEventListener('click',run);
 reset();
}
