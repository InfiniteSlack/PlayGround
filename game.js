
import * as THREE from 'https://esm.sh/three@0.161.0';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#174e5a');
scene.fog = new THREE.FogExp2('#174e5a', 0.012);
const camera = new THREE.PerspectiveCamera(43, innerWidth / innerHeight, .1, 150);
camera.position.set(0, 15, 19);
const clock = new THREE.Clock();
const hemi = new THREE.HemisphereLight('#b7e5d6', '#173b43', 2.2); scene.add(hemi);
const moon = new THREE.DirectionalLight('#e2e8cc', 3.2); moon.position.set(-8, 15, 7); moon.castShadow = true; moon.shadow.mapSize.set(1024,1024); scene.add(moon);
const fill = new THREE.PointLight('#4abac1', 18, 30, 2); fill.position.set(1,5,0); scene.add(fill);
const mat = (color, roughness=.8, extra={}) => new THREE.MeshStandardMaterial({color, roughness, ...extra});
const oceanMat = new THREE.MeshStandardMaterial({color:'#176375', roughness:.38, metalness:.15, transparent:true, opacity:.94, flatShading:true});
const oceanGeo = new THREE.PlaneGeometry(240,240,100,100); oceanGeo.rotateX(-Math.PI/2);
const ocean = new THREE.Mesh(oceanGeo,oceanMat); ocean.position.y=-.3; ocean.receiveShadow=true; scene.add(ocean);
const waterPositions=oceanGeo.attributes.position;
const waveBase=Float32Array.from(waterPositions.array);
const horizon = new THREE.Mesh(new THREE.SphereGeometry(110,32,20),new THREE.MeshBasicMaterial({color:'#123b49',side:THREE.BackSide}));
horizon.position.y=-13; scene.add(horizon);

const raft = new THREE.Group(); scene.add(raft);
const rubber=mat('#d1bd86',.72), rope=mat('#604b37'), wood=mat('#775c3e'), pale=mat('#e2d4a3'), red=mat('#b85d45');
const box=(parent,w,h,d,material,x,y,z,cast=true)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m;};
const rim=new THREE.Mesh(new THREE.CylinderGeometry(3.75,3.8,.56,12,1),rubber);rim.scale.set(1,.72,.68);rim.position.y=.05;rim.castShadow=true;rim.receiveShadow=true;raft.add(rim);
const deck=box(raft,4.7,.32,3.25,wood,0,.32,0);deck.rotation.y=.12;
for(let i=-2;i<=2;i++){const plank=box(raft,.08,.36,3.18,rope,i*.93,.32,0,false);plank.rotation.y=.12;}
for(let i=0;i<4;i++){const a=i*Math.PI/2+.18;const tube=new THREE.Mesh(new THREE.TorusGeometry(1.84,.22,8,32,Math.PI*.82),rubber);tube.rotation.x=Math.PI/2;tube.rotation.z=a;tube.scale.set(1,.86,1);tube.position.y=.35;raft.add(tube);}
const can=box(raft,.56,.45,.6,red,1.12,.7,-.85);can.rotation.y=.35;
box(raft,.6,.07,.63,pale,1.12,.96,-.85);
const beacon=new THREE.Group(); beacon.position.set(-1.55,.64,-.84);raft.add(beacon);
const beaconBase=new THREE.Mesh(new THREE.CylinderGeometry(.13,.18,.28,10),mat('#d9d4b8'));beaconBase.position.y=.1;beacon.add(beaconBase);
const beaconBulb=new THREE.Mesh(new THREE.SphereGeometry(.12,12,10),mat('#ffd89b',.2,{emissive:'#ff943f',emissiveIntensity:2}));beaconBulb.position.y=.29;beacon.add(beaconBulb);
const beaconLight=new THREE.PointLight('#ff9c54',3,6);beaconLight.position.y=.5;beacon.add(beaconLight);
const player=new THREE.Group(); raft.add(player); player.position.set(0,.62,.35);
const jacket=mat('#df704e'), skin=mat('#bd9072'), dark=mat('#253a3a'), life=mat('#ead89b');
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.48,5,9),jacket);body.position.y=.55;body.castShadow=true;player.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.21,14,12),skin);head.position.set(0,1.04,-.02);head.castShadow=true;player.add(head);
const hood=new THREE.Mesh(new THREE.SphereGeometry(.225,14,10,0,Math.PI*2,0,Math.PI*.53),life);hood.position.set(0,1.07,-.02);player.add(hood);
for(const side of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.34,4,8),jacket);arm.position.set(side*.31,.53,-.07);arm.rotation.z=side*.28;player.add(arm);}
const harpoon=new THREE.Group(); player.add(harpoon); harpoon.position.set(0,.78,-.31);
box(harpoon,.13,.14,.67,dark,0,0,-.17).rotation.x=-.06;
box(harpoon,.045,.045,.35,mat('#bac8b6',.3),0,.015,-.57);

const beast=new THREE.Group();scene.add(beast);
const hide=mat('#18343c',.34,{metalness:.2}), mantle=mat('#263f42',.42), belly=mat('#a15e4e',.58), glowMat=mat('#f2c573',.22,{emissive:'#e98b39',emissiveIntensity:2.4}), toothMat=mat('#e8d9ae',.4);
const bodyMesh=new THREE.Mesh(new THREE.SphereGeometry(1,24,18),hide);bodyMesh.scale.set(1.65,.78,2.4);bodyMesh.position.y=.18;bodyMesh.castShadow=true;beast.add(bodyMesh);
const hump=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),mantle);hump.scale.set(1.35,.76,1.55);hump.position.set(0,.67,.15);hump.castShadow=true;beast.add(hump);
const jaw=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),belly);jaw.scale.set(1.05,.35,.95);jaw.position.set(0,-.24,-1.95);beast.add(jaw);
const mouth=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),mat('#170e18',.6));mouth.scale.set(.94,.16,.68);mouth.position.set(0,-.03,-2.16);beast.add(mouth);
for(let s of [-1,1]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.18,14,12),glowMat);eye.position.set(s*.91,.42,-1.2);beast.add(eye);const eyeHalo=new THREE.PointLight('#e88c45',1.6,4);eyeHalo.position.copy(eye.position);beast.add(eyeHalo);for(let i=0;i<3;i++){const tentacle=new THREE.Group();beast.add(tentacle);const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(s*.7,-.05,-1.35),new THREE.Vector3(s*(1.15+i*.13),-.2,-.55),new THREE.Vector3(s*(1.45+i*.25),-.37,.45),new THREE.Vector3(s*(1.65+i*.37),-.52,1.55)]);const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,18,.12-i*.018,7,false),i===1?belly:hide);mesh.castShadow=true;tentacle.add(mesh);const tip=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),glowMat);tip.position.copy(curve.getPoint(1));tentacle.add(tip);beast.userData.tentacles??=[];beast.userData.tentacles.push({mesh,curve,side:s,index:i,tip});}}
for(let i=0;i<4;i++){const fin=new THREE.Mesh(new THREE.ConeGeometry(.28,.76,5),mat('#7b8871'));fin.position.set(0,.74,.15+i*.62);fin.rotation.x=-Math.PI*.47;beast.add(fin);}
// Irregular, glowing flank scars mark an old encounter with a harpoon.
for(let i=0;i<5;i++){const scar=new THREE.Mesh(new THREE.TorusGeometry(.23+i*.015,.035,5,12),mat('#708267',.65,{emissive:'#303f32',emissiveIntensity:.3}));scar.position.set(i%2?-.72:.72,.47,-.15+i*.48);scar.rotation.y=Math.PI/2;scar.rotation.x=.4+i*.16;scar.scale.set(1,.65,1);beast.add(scar);}
// Distinctive line of teeth inside the open jaw.
for(let i=0;i<7;i++){const tooth=new THREE.Mesh(new THREE.ConeGeometry(.075,.24,5),toothMat);tooth.position.set(-.68+i*.22,-.1,-2.36);tooth.rotation.z=Math.PI;beast.add(tooth);}
const ring=new THREE.Mesh(new THREE.TorusGeometry(2.45,.035,5,50),new THREE.MeshBasicMaterial({color:'#78d6c1',transparent:true,opacity:.38}));ring.rotation.x=Math.PI/2;ring.position.y=-.12;beast.add(ring);
const beastLight=new THREE.PointLight('#d87e45',3,8);beastLight.position.set(0,.3,-1.3);beast.add(beastLight);
const debris=[];const driftMat=mat('#9a8159');for(let i=0;i<18;i++){const g=new THREE.Group();const plank=box(g,1.1+Math.random()*1.5,.12,.25,driftMat,0,0,0,false);plank.rotation.y=Math.random()*2;g.position.set((Math.random()-.5)*60,-.12,(Math.random()-.5)*55);scene.add(g);debris.push(g);}
const crateGroup=new THREE.Group();scene.add(crateGroup);crateGroup.visible=false;
box(crateGroup,.9,.62,.85,mat('#b88a51'),0,0,0);for(let z of [-.44,.44])box(crateGroup,.1,.66,.08,pale,0,0,z);box(crateGroup,.24,.64,.04,red,0,0,-.46);
const sprayGeo=new THREE.BufferGeometry();const sprayCount=90;const sprayPos=new Float32Array(sprayCount*3);for(let i=0;i<sprayCount;i++){sprayPos[i*3]=(Math.random()-.5)*3;sprayPos[i*3+1]=Math.random()*.7;sprayPos[i*3+2]=(Math.random()-.5)*4;}sprayGeo.setAttribute('position',new THREE.BufferAttribute(sprayPos,3));
const spray=new THREE.Points(sprayGeo,new THREE.PointsMaterial({color:'#d2e8db',size:.07,transparent:true,opacity:.65}));beast.add(spray);

const ui={intro:document.querySelector('#intro'),start:document.querySelector('#start-button'),restart:document.querySelector('#restart-button'),hud:document.querySelector('#hud'),timer:document.querySelector('#timer'),progress:document.querySelector('#rescue-progress'),beacon:document.querySelector('#beacon'),threatState:document.querySelector('#threat-state'),threatBars:[...document.querySelectorAll('#threat-bars i')],hull:[...document.querySelectorAll('#hull-icons span')],ammo:document.querySelector('#ammo'),ammoTrack:document.querySelector('#ammo-track'),toast:document.querySelector('#toast'),crosshair:document.querySelector('#crosshair'),end:document.querySelector('#end-overlay'),endKicker:document.querySelector('#end-kicker'),endTitle:document.querySelector('#end-title'),endCopy:document.querySelector('#end-copy'),sound:document.querySelector('#sound-button'),stickZone:document.querySelector('#stick-zone'),stick:document.querySelector('#stick'),fire:document.querySelector('#fire-button')};
let running=false, elapsed=0, health=3, ammo=5, shots=0, phase=0, attackTimer=7, nextCrate=22, crateActive=false, crateLife=0, damageFlash=0, toastTimeout, audioCtx, muted=false;
const keys=new Set(), raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2(), plane=new THREE.Plane(new THREE.Vector3(0,1,0),0), aimPoint=new THREE.Vector3(0,0,0), raftTarget=new THREE.Vector3();
const mobileInput={x:0,z:0,pointer:false};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function beep(freq=360,duration=.08,type='sine',volume=.035){if(muted)return;try{audioCtx??=new AudioContext();if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(volume,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration);}catch{}}
function toast(text){ui.toast.textContent=text;ui.toast.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>ui.toast.classList.remove('visible'),1900);}
function refreshUI(){ui.hull.forEach((v,i)=>v.classList.toggle('damaged',i>=health));ui.ammo.textContent=String(ammo).padStart(2,'0');ui.ammoTrack.innerHTML='';for(let i=0;i<5;i++){const tick=document.createElement('i');if(i<ammo)tick.className='loaded';ui.ammoTrack.append(tick);}const level=health<=1?5:health===2?3:2;ui.threatBars.forEach((v,i)=>v.classList.toggle('active',i<level));}
function resetGame(){running=true;elapsed=0;health=3;ammo=5;shots=0;phase=0;attackTimer=6.5;nextCrate=18;crateActive=false;crateLife=0;raft.position.set(0,0,0);raft.rotation.set(0,0,0);beast.visible=true;ui.end.classList.add('hidden');ui.intro.classList.add('hidden');ui.hud.classList.remove('hidden');refreshUI();toast('BEACON FLARE SENT · STAY ON THE RAFT');beep(540,.15,'triangle');}
ui.start.addEventListener('click',resetGame);ui.restart.addEventListener('click',resetGame);
ui.sound.addEventListener('click',()=>{muted=!muted;ui.sound.innerHTML=muted?'♪ <span>SOUND OFF</span>':'♪ <span>SOUND ON</span>';if(!muted)beep(520,.07);});
function finish(won){running=false;ui.hud.classList.add('hidden');ui.end.classList.remove('hidden');ui.endKicker.textContent=won?'SIGNAL ACQUIRED':'LOST BELOW';ui.endTitle.textContent=won?'YOU MADE IT.':'THE DEEP TAKES YOU.';ui.endCopy.textContent=won?'The searchlight breaks through the dark. You’re going home.':'The beacon fades beneath the waves. The ocean keeps its secrets.';ui.beacon.textContent=won?'RESCUED':'SIGNAL LOST';beep(won?760:120,.45,won?'sine':'sawtooth',.045);}
function damage(){if(!running)return;health--;damageFlash=1;raft.position.y=.26;refreshUI();beep(90,.42,'sawtooth',.08);if(health<=0){toast('RAFT LOST');finish(false);}else toast('IMPACT! RAFT DAMAGED');}
function setAimFromEvent(e){const rect=canvas.getBoundingClientRect();pointer.x=(e.clientX-rect.left)/rect.width*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);raycaster.ray.intersectPlane(plane,aimPoint);aimPoint.y=0;}
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;setAimFromEvent(e);ui.crosshair.style.left=`${e.clientX}px`;ui.crosshair.style.top=`${e.clientY}px`;});
function fire(){if(!running)return;if(ammo<=0){beep(150,.08,'square');toast('NO BOLTS · FIND A SUPPLY CRATE');return;}ammo--;shots++;refreshUI();beep(240,.12,'square',.04);beep(700,.07,'triangle',.02);
  // Evaluate the aimed shot against the circling beast in the horizontal play plane.
  const forward=new THREE.Vector3(aimPoint.x-raft.position.x,0,aimPoint.z-raft.position.z);if(forward.length()<.1)forward.set(0,0,-1);forward.normalize();
  const toBeast=new THREE.Vector3().subVectors(beast.position,raft.position);toBeast.y=0;const dist=toBeast.length();const facing=forward.dot(toBeast.normalize());
  if(dist<13&&facing>.88){phase++;attackTimer=Math.max(attackTimer,4.2);beast.userData.stun=.85;ui.crosshair.classList.add('locked');setTimeout(()=>ui.crosshair.classList.remove('locked'),240);toast(phase>=3?'IT’S RETREATING! KEEP IT UP':'HIT! THE GLOAMJAW REELS');beep(phase>=3?180:115,.24,'sawtooth',.06);if(phase>=3){beast.userData.flee=2.3;phase=0;}}
  else{toast(dist>15?'TOO FAR — WAIT FOR IT TO CIRCLE CLOSER':'MISS — LEAD YOUR SHOT');}
}
canvas.addEventListener('pointerdown',e=>{if(!running||e.pointerType==='touch')return;setAimFromEvent(e);fire();});
ui.fire.addEventListener('pointerdown',e=>{e.preventDefault();fire();});
window.addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.code==='Space')fire();});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
// Simple, direct-touch virtual stick; dragging never steals browser page gestures.
let touchId=null;ui.stickZone.addEventListener('pointerdown',e=>{touchId=e.pointerId;ui.stickZone.setPointerCapture(touchId);moveStick(e);});ui.stickZone.addEventListener('pointermove',e=>{if(e.pointerId===touchId)moveStick(e);});function moveStick(e){const r=ui.stickZone.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),len=Math.hypot(dx,dy),scale=Math.min(1,43/(len||1));mobileInput.x=dx/43*scale;mobileInput.z=dy/43*scale;ui.stick.style.transform=`translate(${mobileInput.x*34}px,${mobileInput.z*34}px)`;}function releaseStick(){touchId=null;mobileInput.x=mobileInput.z=0;ui.stick.style.transform='';}ui.stickZone.addEventListener('pointerup',releaseStick);ui.stickZone.addEventListener('pointercancel',releaseStick);

const audioWave=()=>{};
function moveRaft(dt){let x=mobileInput.x,z=mobileInput.z;if(keys.has('a')||keys.has('arrowleft'))x-=1;if(keys.has('d')||keys.has('arrowright'))x+=1;if(keys.has('w')||keys.has('arrowup'))z-=1;if(keys.has('s')||keys.has('arrowdown'))z+=1;const l=Math.hypot(x,z);if(l>1){x/=l;z/=l;}
  raft.position.x=clamp(raft.position.x+x*dt*2.7,-3.3,3.3);raft.position.z=clamp(raft.position.z+z*dt*2.7,-2.5,2.5);
  raft.position.y=.08+Math.sin(elapsed*1.65)*.11+Math.sin(elapsed*.71+1.4)*.08+(damageFlash>0?damageFlash*.26:0);
  raft.rotation.z=-x*.045+Math.sin(elapsed*.85)*.025;raft.rotation.x=z*.04+Math.sin(elapsed*.73+1)*.025;raft.rotation.y=Math.sin(elapsed*.3)*.035-x*.025;
  player.rotation.y=Math.atan2(aimPoint.x-raft.position.x,-(aimPoint.z-raft.position.z))||0;
}
function updateWater(t){for(let i=0;i<waterPositions.count;i++){const x=waveBase[i*3],z=waveBase[i*3+2];waterPositions.array[i*3+1]=-.3+Math.sin(x*.11+t*.72)*.20+Math.cos(z*.13+t*.61)*.16+Math.sin((x+z)*.055+t*.4)*.13;}waterPositions.needsUpdate=true;oceanGeo.computeVertexNormals();}
function spawnCrate(){crateActive=true;crateGroup.visible=true;const a=Math.random()*6.28,r=9.7;crateGroup.position.set(raft.position.x+Math.cos(a)*r,-.15,raft.position.z+Math.sin(a)*r);crateGroup.rotation.set(0,Math.random()*6.28,0);crateLife=22;toast('SUPPLY CRATE IN THE WATER · MOVE TO IT');beep(620,.12,'sine');}
function updateCrate(dt){if(!crateActive){if(elapsed>nextCrate){spawnCrate();nextCrate+=33;}return;}crateLife-=dt;crateGroup.position.y=-.12+Math.sin(elapsed*2)*.14;crateGroup.rotation.z=Math.sin(elapsed*1.2)*.07;
  if(Math.hypot(crateGroup.position.x-raft.position.x,crateGroup.position.z-raft.position.z)<2.1){crateActive=false;crateGroup.visible=false;ammo=Math.min(5,ammo+3);health=Math.min(3,health+1);refreshUI();toast('SUPPLIES RECOVERED · +3 BOLTS / +1 HULL');beep(800,.16,'triangle');beep(980,.2,'sine');}
  else if(crateLife<=0){crateActive=false;crateGroup.visible=false;}
}
function updateBeast(dt){const flee=beast.userData.flee||0;if(flee>0){beast.userData.flee=flee-dt;beast.visible=true;const angle=elapsed*.49+Math.PI;beast.position.set(Math.sin(angle)*13,-.45,Math.cos(angle)*13);ui.threatState.textContent='REELING';return;}
  const base=(elapsed<34?9:elapsed<72?7.2:5.7);const speed=.37+Math.min(elapsed/240,.29);const angle=elapsed*speed+.6;const radius=base+Math.sin(elapsed*.56)*.55;beast.position.set(Math.cos(angle)*radius,-.34+Math.sin(elapsed*1.5)*.11,Math.sin(angle)*radius);
  const dx=raft.position.x-beast.position.x,dz=raft.position.z-beast.position.z;beast.rotation.y=Math.atan2(dx,dz)+Math.PI;
  const stun=beast.userData.stun||0;if(stun>0)beast.userData.stun=stun-dt;
  beast.scale.setScalar(stun>0?.94:1);beast.rotation.z=Math.sin(elapsed*2.1)*.045;beast.rotation.x=Math.sin(elapsed*1.45)*.035;
  for(const t of beast.userData.tentacles){const wave=Math.sin(elapsed*2.1+t.index*.9+t.side)*.17;t.mesh.rotation.x=wave;t.tip.position.y=-.48+Math.sin(elapsed*2+t.index+t.side)*.18;}
  const distance=Math.hypot(dx,dz);if(distance<4.2){ui.threatState.textContent='ATTACKING';attackTimer-=dt;if(attackTimer<=0){damage();attackTimer=6.8;}}else{ui.threatState.textContent=elapsed>85?'CLOSING IN':'CIRCLING';}
  // Sinister bioluminescent wake ring around its submerged body.
  beastLight.intensity=2.3+Math.sin(elapsed*4)*.65;
}
function updateHUD(dt){const left=Math.max(0,120-elapsed);ui.timer.textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(Math.floor(left%60)).padStart(2,'0')}`;ui.progress.style.width=`${elapsed/120*100}%`;ui.beacon.textContent=elapsed<35?'SEARCHING':elapsed<82?'SIGNAL FOUND':'INBOUND';if(damageFlash>0)damageFlash=Math.max(0,damageFlash-dt*1.4);}
function updateCamera(dt){raftTarget.set(raft.position.x*.44,0,raft.position.z*.44);camera.position.x+=(raft.position.x*.4-camera.position.x)*dt*.6;camera.position.z+=(19+raft.position.z*.22-camera.position.z)*dt*.55;camera.lookAt(raftTarget.x,0,raftTarget.z);}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;updateWater(t);
  for(const d of debris){d.position.y=-.12+Math.sin(t+d.position.x)*.11;d.rotation.z=Math.sin(t*.6+d.position.z)*.04;}
  beaconBulb.material.emissiveIntensity=1.6+Math.sin(t*5)*.8;beaconLight.intensity=2.5+Math.sin(t*5)*.9;
  if(running){elapsed+=dt;moveRaft(dt);updateBeast(dt);updateCrate(dt);updateHUD(dt);if(elapsed>=120)finish(true);}
  else{raft.position.y=.08+Math.sin(t*1.65)*.11;raft.rotation.z=Math.sin(t*.85)*.025;beast.position.set(Math.cos(t*.32)*8,-.4,Math.sin(t*.32)*8);beast.rotation.y=-t*.32+.8;for(const q of beast.userData.tentacles){q.mesh.rotation.x=Math.sin(t*2+q.index)*.13;}}
  updateCamera(dt);renderer.render(scene,camera);
}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));});
refreshUI();animate();
