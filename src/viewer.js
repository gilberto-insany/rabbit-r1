import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
RectAreaLightUniformsLib.init();

const draco=new DRACOLoader();
draco.setDecoderPath(new URL('draco/',document.baseURI).href);
const loader=new GLTFLoader().setDRACOLoader(draco);
let sourcePromise;
const image=new Image();image.src=new URL('assets/rabbit-screen.svg',document.baseURI).href;
let iconReady=new Promise(resolve=>{image.onload=resolve;image.onerror=resolve;});
const model=()=>sourcePromise??=(loader.loadAsync(new URL('assets/rabbit-r1-hq.glb',document.baseURI).href,e=>{
 document.querySelectorAll('.model-host').forEach(h=>h.dataset.assetBytes=String(e.total||e.loaded));
}));
const clamp=(v,a,b)=>Math.max(a,Math.min(v,b));

function screenTexture(mode){
 const c=document.createElement('canvas');c.width=1536;c.height=2043;
 const x=c.getContext('2d');x.scale(c.width/660,c.height/878);x.fillStyle='#050505';x.fillRect(0,0,660,878);
 x.textBaseline='top';
 if(mode==='hello'){
  if(image.complete&&image.naturalWidth)x.drawImage(image,230,165,170,247);
  x.fillStyle='#ededeb';x.font='52px Power,Arial';x.fillText('hello,',55,560);x.fillText('friend',55,615);
 }else{
  x.fillStyle='#fff';x.font='32px Power,Arial';x.fillText('12:21',246,20);
  x.beginPath();x.roundRect(527,31,42,19,6);x.fill();x.fillRect(571,37,4,7);
  const rows=[['camera','#ff008e','camera'],['magic gallery','#00e7eb','spark'],['timers','#7158ff','clock'],['translator','#41ed00','translate'],['recorder','#ff1515','record'],['r-cade','#ff6900','game'],['reminders','#079dff','remind'],['alarms','#e667ff','alarm']];
  rows.forEach(([name,color,icon],i)=>{
   const y=242+i*68;x.fillStyle='#050505';x.beginPath();x.roundRect(77,y-7,512,138,23);x.fill();
   x.fillStyle=color;x.beginPath();x.roundRect(77,y,512,133,22);x.fill();
   x.fillStyle='#050505';x.strokeStyle='#050505';x.lineWidth=5;x.lineCap='round';x.lineJoin='round';
   x.font='40px Power,Arial';x.textAlign='right';x.fillText(name,568,y+18);x.textAlign='left';
   const cx=116,cy=y+40;x.save();
   if(icon==='camera'){x.beginPath();x.roundRect(cx-20,cy-20,40,34,8);x.stroke();x.beginPath();x.arc(cx,cy-3,8,0,Math.PI*2);x.stroke();}
   else if(icon==='spark'){x.strokeRect(cx-17,cy-18,34,36);x.beginPath();x.moveTo(cx,cy-11);x.lineTo(cx+4,cy-3);x.lineTo(cx+12,cy);x.lineTo(cx+4,cy+4);x.lineTo(cx,cy+12);x.lineTo(cx-4,cy+4);x.lineTo(cx-12,cy);x.lineTo(cx-4,cy-3);x.closePath();x.fill();}
   else if(icon==='clock'||icon==='alarm'){x.beginPath();x.arc(cx,cy,19,0,Math.PI*2);x.stroke();x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+8,cy-10);x.stroke();}
   else if(icon==='translate'){x.font='bold 30px Power,Arial';x.fillText('A',cx-18,cy-19);x.font='22px Power,Arial';x.fillText('↔',cx+2,cy-1);}
   else if(icon==='record'){for(let k=0;k<3;k++){const a=k*Math.PI*2/3-Math.PI/2;x.beginPath();x.ellipse(cx+Math.cos(a)*10,cy+Math.sin(a)*10,7,12,a+Math.PI/2,0,Math.PI*2);x.fill();}}
   else{ x.fillRect(cx-17,cy-9,12,25);x.fillRect(cx,cy-18,11,34);x.fillRect(cx+17,cy+1,8,15);}
   x.restore();
  });
 }
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=16;return texture;
}

function prepare(source,mode){
 const object=source.clone(true);
 const materials=new Map();
 object.traverse(o=>{
  if(!o.isMesh)return;
  const rebuild=m=>{
   if(materials.has(m))return materials.get(m);
   let n=m.clone();
   const name=m.name.toLowerCase();
   if(name.includes('finish | r1')){
    n=new THREE.MeshPhysicalMaterial({name:m.name,color:new THREE.Color().setRGB(.85,.065,.0013),metalness:0,roughness:.24,clearcoat:1,clearcoatRoughness:.085,ior:1.53,envMapIntensity:1});
   }else if(name.includes('continuous clear cover glass')||name.includes('solid optical cover')){
    n=new THREE.MeshPhysicalMaterial({name:m.name,color:0xffffff,metalness:0,roughness:.005,transmission:1,thickness:0,ior:1.47,envMapIntensity:1});
   }else if(name.includes('convex coated lens')){
    n=new THREE.MeshPhysicalMaterial({name:m.name,color:0xffffff,roughness:.025,metalness:0,transmission:1,thickness:.0003/.078,ior:1.52,iridescence:.18,iridescenceIOR:1.3,iridescenceThicknessRange:[180,320],envMapIntensity:.75});
   }else if(name.includes('machined baffles')){
    n=new THREE.MeshStandardMaterial({name:m.name,color:0x17191c,metalness:.55,roughness:.25,envMapIntensity:.65});
   }else if(name.includes('retaining ring graphite')){
    n=new THREE.MeshStandardMaterial({name:m.name,color:0x797d83,metalness:.8,roughness:.2,envMapIntensity:.8});
   }else if(name.includes('black perimeter backing')){
    n=new THREE.MeshPhysicalMaterial({name:m.name,color:0x030405,roughness:.27,metalness:0,ior:1.5,envMapIntensity:.6});
   }
   n.side=THREE.FrontSide;
   materials.set(m,n);return n;
  };
  o.material=Array.isArray(o.material)?o.material.map(rebuild):rebuild(o.material);
  const surface=Array.isArray(o.material)?o.material:[o.material];
  o.castShadow=!surface.some(m=>m.transmission>0);o.receiveShadow=o.castShadow;
 });
 const lcd=new THREE.Mesh(new THREE.PlaneGeometry(.044,.0585),new THREE.MeshBasicMaterial({map:screenTexture(mode),toneMapped:false}));
 lcd.position.set(-.009,0,.006445);lcd.name='Browser | editable LCD artwork';object.add(lcd);
 object.scale.setScalar(1/.078);
 return {object,lcd};
}

function studio(renderer){
 const room=new THREE.Scene();room.background=new THREE.Color(.035,.035,.035);
 const sources=[];
 const c=document.createElement('canvas');c.width=64;c.height=256;
 const ctx=c.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,256);
 for(const [stop,color] of [[0,'#111'],[.16,'#888'],[.46,'#fff'],[.78,'#ccc'],[1,'#222']])gradient.addColorStop(stop,color);
 ctx.fillStyle=gradient;ctx.fillRect(0,0,64,256);
 const diffuser=new THREE.CanvasTexture(c);diffuser.colorSpace=THREE.SRGBColorSpace;
 for(const [width,height,position,power] of [[3.5,2.8,[-3,3,3],4],[.5,4,[3,0,1.5],8],[3,.5,[-1,-3,2],2],[2.8,2,[-2,2,-3],3]]){
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:diffuser,color:new THREE.Color().setRGB(power,power,power),side:THREE.DoubleSide}));
  panel.position.set(...position);panel.lookAt(0,0,0);room.add(panel);sources.push(panel);
 }
 const pmrem=new THREE.PMREMGenerator(renderer);
 const map=pmrem.fromScene(room,0,.1,20,{size:512}).texture;
 sources.forEach(o=>{o.geometry.dispose();o.material.dispose();});diffuser.dispose();pmrem.dispose();return map;
}

class ProductView{
 constructor(host,kind){
  this.host=host;this.kind=kind;this.visible=false;this.dirty=true;this.pending=false;
  this.spread=0;this.progress=0;this.dragYaw=0;this.dragPitch=0;this.screen='launcher';this.selected='';this.viewYaw=null;
  try{
   this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  }catch(e){host.classList.add('unavailable');return;}
  const r=this.renderer;r.setPixelRatio(this.pixelRatio());r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.NeutralToneMapping;r.toneMappingExposure=1;r.setClearColor(0,0);
  r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
  r.info.autoReset=false;
  this.host.dataset.depthBits=String(r.getContext().getParameter(r.getContext().DEPTH_BITS));
  host.prepend(r.domElement);r.domElement.setAttribute('aria-hidden','true');
  this.scene=new THREE.Scene();this.scene.environment=studio(r);
  this.camera=new THREE.OrthographicCamera(-1,1,1,-1,2.5,5.5);this.camera.position.set(0,.07,4);this.camera.lookAt(0,0,0);
  const key=new THREE.DirectionalLight(0xffffff,.6);key.position.set(-3,4,5);key.castShadow=true;
  key.shadow.mapSize.set(4096,4096);key.shadow.camera.left=-1.2;key.shadow.camera.right=1.2;key.shadow.camera.top=1.2;key.shadow.camera.bottom=-1.2;key.shadow.camera.near=5.6;key.shadow.camera.far=8.6;key.shadow.bias=-.00005;key.shadow.normalBias=.0007;
  this.scene.add(key);
  const softbox=new THREE.RectAreaLight(0xffffff,7,1.5,2.5);softbox.position.set(-1.1,1.5,2);softbox.lookAt(0,0,0);this.scene.add(softbox);
  const rim=new THREE.DirectionalLight(0xffffff,1.2);rim.position.set(3,1,-2);this.scene.add(rim);
  const fill=new THREE.HemisphereLight(0xffffff,0x19191b,.3);this.scene.add(fill);
  this.pivot=new THREE.Group();this.scene.add(this.pivot);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);
  this.observer=new IntersectionObserver(es=>{this.visible=es[0].isIntersecting;if(this.visible)this.invalidate();},{rootMargin:'250px'});this.observer.observe(host);
  r.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.add('unavailable');});
  this.load();
  if(kind==='hardware')this.interactions();
 }
 async load(){
  try{
   const [glb]=await Promise.all([model(),document.fonts.ready,iconReady]);
   const main=prepare(glb.scene,this.kind==='fan'?'hello':'launcher');this.device=main.object;this.lcd=main.lcd;this.pivot.add(main.object);
   if(this.kind==='fan'){
    this.left=main.object.clone(true);this.right=main.object.clone(true);
    this.pivot.add(this.left,this.right);
   }else{this.makeHotspots();this.preparePicking();}
   this.host.classList.add('ready');
   this.host.dataset.source='Blender v27';this.host.dataset.sourceTriangles='462052';this.host.dataset.screenResolution='1536 × 2043';
   this.resize();this.invalidate();
  }catch(error){console.error('Rabbit model:',error);this.host.classList.add('unavailable');}
 }
 pixelRatio(){return Math.min(Math.max(window.devicePixelRatio||1,this.kind==='hardware'?3:2.5),3);}
 resize(){
  const rect=this.host.getBoundingClientRect();if(!rect.width||!rect.height)return;
  this.width=rect.width;this.height=rect.height;this.renderer.setPixelRatio(this.pixelRatio());this.renderer.setSize(rect.width,rect.height,false);
  const aspect=rect.width/rect.height;
  const span=this.kind==='fan'?(aspect<1?2.2:1.75):(aspect<.9?1.86:1.65);
  this.camera.left=-span*aspect/2;this.camera.right=span*aspect/2;this.camera.top=span/2;this.camera.bottom=-span/2;this.camera.updateProjectionMatrix();
  this.invalidate();
 }
 setSpread(p){this.spread=p;this.invalidate();}
 setProgress(p){if(Math.abs(this.progress-p)>.001)this.revealPart(null);this.progress=p;this.invalidate();}
 setScreen(mode){
  this.screen=mode;if(!this.lcd)return;const old=this.lcd.material.map;this.lcd.material.map=screenTexture(mode);old?.dispose();this.lcd.material.needsUpdate=true;this.invalidate();
 }
 setView(mode){
  this.viewYaw=mode==='back'?Math.PI:mode==='reset'?-.22:0;this.dragYaw=0;this.dragPitch=0;this.invalidate();
 }
 resumeScroll(){
  if(this.viewYaw===null)return;
  this.dragYaw+=this.viewYaw-(this.progress*Math.PI*2-.22);this.viewYaw=null;
 }
 invalidate(){
  this.dirty=true;if(this.pending||!this.visible)return;this.pending=true;
  requestAnimationFrame(()=>{this.pending=false;if(this.visible&&this.dirty)this.render();});
 }
 render(){
  this.dirty=false;if(!this.device)return;
  if(this.kind==='fan'){
   const p=this.spread;
   this.device.rotation.set(.08,-.18,-.04);this.device.position.set(0,.02,.22);this.device.scale.setScalar(1/.078*.86);
   const spread=this.width<500?.35:.40;
   this.left.position.set(-spread*p,-.03*p,-.11);this.left.rotation.set(.10,.28,.34*p);this.left.scale.setScalar(1/.078*.86);
   this.right.position.set(spread*p,-.03*p,-.14);this.right.rotation.set(.10,-.28,-.34*p);this.right.scale.setScalar(1/.078*.86);
   this.host.dataset.spread=p.toFixed(2);
  }else{
   this.pivot.rotation.set(.04+this.dragPitch,(this.viewYaw??(this.progress*Math.PI*2-.22))+this.dragYaw,-.025);
   this.hardwareScale=this.width<500?Math.min(1.18,this.width/this.height*(this.camera.top-this.camera.bottom)*.9/1.05):1.38;
   this.device.scale.setScalar(1/.078*this.hardwareScale);
   this.scene.updateMatrixWorld(true);this.camera.updateMatrixWorld(true);this.positionHotspots();
   this.host.dataset.rotation=this.pivot.rotation.y.toFixed(3);
  }
  this.renderer.info.reset();this.renderer.render(this.scene,this.camera);
  this.host.dataset.renderResolution=`${this.renderer.domElement.width} × ${this.renderer.domElement.height}`;
  this.host.dataset.drawTriangles=this.renderer.info.render.triangles;
  this.host.dataset.drawCalls=this.renderer.info.render.calls;
 }
 interactions(){
  let startX=0,startY=0,lastX=0,lastY=0,drag=false;
  window.addEventListener('wheel',()=>this.resumeScroll(),{passive:true});
  window.addEventListener('touchmove',()=>this.resumeScroll(),{passive:true});
  this.host.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;startX=lastX=e.clientX;startY=lastY=e.clientY;drag=true;});
  this.host.addEventListener('pointermove',e=>{
   if(e.target.closest('button'))return;
   if(!drag){this.hoverAt(e.clientX,e.clientY);return;}const dx=e.clientX-lastX,dy=e.clientY-lastY;
   if(e.pointerType==='touch'&&Math.abs(e.clientY-startY)>Math.abs(e.clientX-startX)){drag=false;return;}
   if(Math.abs(e.clientX-startX)>5){this.resumeScroll();this.host.setPointerCapture?.(e.pointerId);}
   this.dragYaw+=dx*.009;this.dragPitch=clamp(this.dragPitch+dy*.003,-.25,.25);lastX=e.clientX;lastY=e.clientY;this.invalidate();
  });
  const end=e=>{if(drag&&Math.hypot(e.clientX-startX,e.clientY-startY)<7)this.hoverAt(e.clientX,e.clientY);drag=false;};this.host.addEventListener('pointerup',end);this.host.addEventListener('pointercancel',()=>drag=false);
  this.host.addEventListener('pointerleave',()=>{if(!drag)this.revealPart(null);});
  this.host.addEventListener('keydown',e=>{if(e.target!==this.host)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')this.dragYaw-=.22;if(e.key==='ArrowRight')this.dragYaw+=.22;if(e.key==='ArrowUp')this.dragPitch=clamp(this.dragPitch-.08,-.25,.25);if(e.key==='ArrowDown')this.dragPitch=clamp(this.dragPitch+.08,-.25,.25);this.invalidate();}});
 }
 makeHotspots(){
  const items=[
   {id:'mic',icon:'mic',label:'microphones',point:[0,37.8,0],offset:[-20,-55],face:'front',title:'a conversation starts here.',copy:'Built-in microphones pick up your voice. Press the side button and say what’s on your mind.'},
   {id:'camera',icon:'camera',label:'rotating camera',point:[28,27.1,6.7],offset:[94,-35],face:'front',title:'your eyes. a new angle.',copy:'The rabbit eye rotates to face you or the world. A physical camera, with more than one point of view.'},
   {id:'talk',icon:'talk',label:'push-to-talk',point:[40,7.5,0],offset:[100,0],face:'front',title:'press. talk. go.',copy:'One dedicated side button starts the conversation. No need to type your question.'},
   {id:'wheel',icon:'wheel',label:'scroll wheel',point:[28,7.5,6.6],offset:[90,65],face:'front',title:'a satisfying little scroll.',copy:'A tactile wheel for moving through the interface. Turn to browse, without covering the screen.'},
   {id:'usb',icon:'usb',label:'USB-C port',point:[-39,6,0],offset:[-84,-20],face:'front',title:'plug into the everyday.',copy:'USB-C charging, tucked into the side. Simple, familiar, and ready for your next outing.'},
   {id:'sim',icon:'sim',label:'SIM card slot',point:[-39,-17,0],offset:[-82,28],face:'front',title:'room to stay connected.',copy:'A physical SIM card slot sits along the side of r1, alongside its USB-C port.'},
   {id:'speaker',icon:'speaker',label:'speaker grille',point:[28,-20.6,-6.7],offset:[85,60],face:'back',title:'personality, from every side.',copy:'A recessed hexagonal speaker grille brings a precise, tactile finish to the back of r1.'},
   {id:'back-camera',icon:'camera',label:'rabbit eye',point:[28,27.1,-6.7],offset:[85,-35],face:'back',title:'the same eye. another view.',copy:'The camera drum sits behind protective glass, with a window on each side of the enclosure.'}
  ];
  this.hotspots=items.map(item=>{
   const root=this.host.querySelector('.hotspots');
   const b=document.createElement('button');b.className='hotspot';b.type='button';b.dataset.component=item.id;b.innerHTML=`<svg aria-hidden="true"><use href="#i-${item.icon}"/></svg><span>${item.label}</span>`;
   const dot=document.createElement('span');dot.className='hotspot-dot';dot.setAttribute('aria-hidden','true');const wire=document.createElement('span');wire.className='hotspot-wire';wire.setAttribute('aria-hidden','true');
   root.append(wire,dot,b);
   b.addEventListener('click',()=>{this.selected=item.id;this.revealPart(item.id);});
   b.addEventListener('focus',()=>this.revealPart(item.id));b.addEventListener('blur',()=>this.revealPart(null));
   return {...item,button:b,dot,wire};
  });
 }
 preparePicking(){
  this.raycaster=new THREE.Raycaster();this.pickMeshes=[];
  this.device.traverse(o=>{
   if(!o.isMesh)return;
   const name=o.name.toLowerCase().replace(/[^a-z0-9]/g,'');
   let id='';
   if(name.includes('scrollwheel'))id='wheel';
   else if(name.includes('pushtotalk'))id='talk';
   else if(name.includes('usbc'))id='usb';
   else if(name.startsWith('sim'))id='sim';
   else if(name.startsWith('speaker'))id='speaker';
   else if(name.includes('camera')||name.includes('frontcontinuousglass')||name.includes('rearcontinuousglass')||name.includes('perimeterglassseat')||name.includes('windowshoulder'))id='camera';
   if(id){o.userData.part=id;this.pickMeshes.push(o);}
  });
 }
 hoverAt(clientX,clientY){
  if(!this.raycaster||!this.visible||!this.hotspots)return;
  const r=this.host.getBoundingClientRect();
  const mouse=new THREE.Vector2((clientX-r.left)/r.width*2-1,-(clientY-r.top)/r.height*2+1);
  this.raycaster.setFromCamera(mouse,this.camera);
  const front=Math.cos(this.pivot.rotation.y)>0;
  const candidates=this.pickMeshes.filter(o=>o.userData.part!=='speaker'||!front);
  const hit=this.raycaster.intersectObjects(candidates,false)[0];
  let id=hit?.object.userData.part||null;
  if(id==='camera'&&!front)id='back-camera';
  if(!id&&front){const mic=this.hotspots.find(h=>h.id==='mic');const mx=parseFloat(mic.dot.style.left),my=parseFloat(mic.dot.style.top);if(Math.hypot(clientX-r.left-mx,clientY-r.top-my)<20)id='mic';}
  this.revealPart(id);
 }
 revealPart(id){
  if(!this.hotspots||this.hovered===id)return;this.hovered=id;
  this.hotspots.forEach(h=>{for(const e of [h.button,h.dot,h.wire])e.classList.toggle('revealed',h.id===id);h.button.classList.toggle('active',h.id===id);});
  const part=this.hotspots.find(h=>h.id===id);
  if(part){document.querySelector('#component-name').textContent=part.title;document.querySelector('#component-description').textContent=part.copy;}
 }
 positionHotspots(){
  const front=Math.cos(this.pivot.rotation.y)>0;
  const mobile=this.width<500;
  this.hotspots?.forEach(h=>{
   const visible=h.face===(front?'front':'back');
   for(const el of [h.button,h.dot,h.wire])el.style.display=visible?'':'none';
   if(!visible)return;
   const point=new THREE.Vector3(h.point[0]/78,h.point[1]/78,h.point[2]/78).multiplyScalar(this.hardwareScale);
   point.applyMatrix4(this.pivot.matrixWorld).project(this.camera);
   const px=(point.x+1)*this.width/2,py=(1-point.y)*this.height/2;
   const ox=h.offset[0]*(mobile?.55:1),oy=h.offset[1]*(mobile?.78:1);
   const bx=clamp(px+ox,mobile?62:85,this.width-(mobile?62:85));const by=clamp(py+oy,25,this.height-25);
   h.button.style.left=bx+'px';h.button.style.top=by+'px';h.dot.style.left=px+'px';h.dot.style.top=py+'px';
   const dx=bx-px,dy=by-py;h.wire.style.left=px+'px';h.wire.style.top=py+'px';h.wire.style.width=Math.hypot(dx,dy)+'px';h.wire.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;
  });
 }
}

export function createViews(){
 const fan=new ProductView(document.querySelector('#fan-model'),'fan');
 const hardware=new ProductView(document.querySelector('#hardware-model'),'hardware');
 return {fan,hardware};
}
