// One native source selection: VP9 when supported, H.264 fallback otherwise.
const film=document.querySelector('#hero-film');
const toggle=document.querySelector('#film-toggle');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let loaded=false,userPaused=false,visible=true;
function load(){if(loaded)return;for(const source of film.querySelectorAll('source'))source.src=source.dataset.src;loaded=true;film.load();}
function sync(){const playing=!film.paused;const label=playing?'Pause background video':'Play background video';toggle.setAttribute('aria-label',label);toggle.setAttribute('aria-pressed',String(playing));toggle.textContent=label;}
function play(){load();film.play().catch(()=>sync());}
function auto(){if(!reduce.matches&&!userPaused&&visible&&!document.hidden){film.autoplay=true;play();}else{film.autoplay=false;film.pause();}}
toggle.addEventListener('click',()=>{if(film.paused){userPaused=false;play();}else{userPaused=true;film.pause();}});
film.addEventListener('play',sync);film.addEventListener('pause',sync);
film.addEventListener('error',()=>{sync();toggle.textContent='Video unavailable';});
reduce.addEventListener('change',auto);document.addEventListener('visibilitychange',auto);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;auto();},{threshold:.05}).observe(film);
// Reduced-motion and data-saving visitors see the poster until they choose play.
if(navigator.connection?.saveData)userPaused=true;
auto();
