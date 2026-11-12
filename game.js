(() => {
  'use strict';
  const canvas = document.querySelector('#world');
  const ctx = canvas.getContext('2d');
  const TILE = 32, COLS = 25, ROWS = 17;
  const colors = {
    Aristotle: {accent:'#d7a862', pale:'#f5e6c6', icon:'📜', tag:'THE OBSERVER'},
    Hypatia: {accent:'#8996bf', pale:'#e2e6f4', icon:'✦', tag:'THE STAR-GAZER'},
    Confucius: {accent:'#b67860', pale:'#f2ddd1', icon:'☯', tag:'THE HARMONIZER'},
    Socrates: {accent:'#ca8d64', pale:'#f4dfcf', icon:'☼', tag:'THE QUESTIONER'},
    Epicurus: {accent:'#75a27b', pale:'#dcebdd', icon:'❋', tag:'THE PLEASURE-SEEKER'},
    Diogenes: {accent:'#aa8f68', pale:'#ebe4d2', icon:'⌁', tag:'THE CYNIC'},
    Nietzsche: {accent:'#bd7273', pale:'#f1d9d9', icon:'ϟ', tag:'THE WILLFUL'},
    Plato: {accent:'#807ca4', pale:'#e2dfef', icon:'◉', tag:'THE IDEALIST'}
  };
  const thinkers = {
    Aristotle:{name:'Aristotle',philosopher:'The Observer',hp:100,attack:15,desc:'Finds truth in what we can see.',color:'#d7a862',moves:['Observation','Syllogism','Golden Mean','Contemplate']},
    Hypatia:{name:'Hypatia',philosopher:'The Star-Gazer',hp:88,attack:18,desc:'Maps the universe with reason.',color:'#8996bf',moves:['Axiom','Celestial Proof','Parallax','Contemplate']},
    Confucius:{name:'Confucius',philosopher:'The Harmonizer',hp:112,attack:13,desc:'Builds strength through virtue.',color:'#b67860',moves:['Kindness','Ritual','The Golden Rule','Contemplate']},
    Socrates:{name:'Socrates',philosopher:'The Questioner',hp:98,attack:15,desc:'Knows that he knows nothing.',color:'#ca8d64',moves:['Why?','Elenchus','Ironic Turn','Contemplate']},
    Epicurus:{name:'Epicurus',philosopher:'The Pleasure-Seeker',hp:90,attack:15,desc:'The good life is a life of ease.',color:'#75a27b',moves:['Simple Joy','Garden Wisdom','Ataraxia','Contemplate']},
    Diogenes:{name:'Diogenes',philosopher:'The Cynic',hp:105,attack:16,desc:'Needs nothing. Fears nothing.',color:'#aa8f68',moves:['Bare Truth','Cynic’s Bark','Discard All','Contemplate']},
    Nietzsche:{name:'Nietzsche',philosopher:'The Willful',hp:100,attack:18,desc:'Becoming is better than being.',color:'#bd7273',moves:['Übermensch','Will to Power','Revaluation','Contemplate']},
    Plato:{name:'Plato',philosopher:'The Idealist',hp:95,attack:16,desc:'The truest things cannot be seen.',color:'#807ca4',moves:['Forms','Allegory','The Cave','Contemplate']}
  };
  const starterKeys = ['Aristotle','Hypatia','Confucius'];
  const trainers = [
    {key:'Socrates',x:5,y:5,done:false,line:'I know one thing: this will be a good conversation.'},
    {key:'Epicurus',x:19,y:5,done:false,line:'Come, let us see which idea brings the most delight.'},
    {key:'Nietzsche',x:20,y:12,done:false,line:'You have come to test your will. Excellent.'},
    {key:'Diogenes',x:6,y:12,done:false,line:'Bah. Another person with a map. Prove you need it.'}
  ];
  const palette = ['#e7ebd8','#e0e8d2','#e6ead6','#dce5ce'];
  let tiles = [], player = {x:12,y:14,dir:'down',moving:false,frame:0};
  let party = [], activeIndex = 0, selectedStarter = null, battle = null, toastTimer, lastMove=0;
  let gameStarted = false, encounterCount = 0, insight = 0, audioOn=false, ac=null, gameWon=false;
  const $ = s => document.querySelector(s);
  function seedMap(){
    tiles = Array.from({length:ROWS},(_,y)=>Array.from({length:COLS},(_,x)=>{
      const n=(x*17+y*31+x*y*7)%13;
      return (x===0||y===0||x===COLS-1||y===ROWS-1)?'tree':(n<3?'flower':(n<6?'mottled':'grass'));
    }));
    // Winding stone paths, a little pond, and sheltered grass patches.
    const path = [[12,16],[12,15],[12,14],[12,13],[12,12],[12,11],[11,10],[10,9],[9,8],[8,7],[7,7],[6,7],[5,7],[4,7],[3,7],[13,11],[14,10],[15,9],[16,8],[17,7],[18,7],[19,7],[20,7],[12,10],[12,9],[12,8],[12,7],[12,6],[12,5],[12,4],[12,3],[12,2],[13,12],[14,12],[15,12],[16,12],[17,12],[18,12],[19,12],[20,12],[21,12],[11,12],[10,12],[9,12],[8,12],[7,12],[6,12],[5,12],[4,12],[3,12],[2,12],[11,6],[10,6],[9,6],[8,6],[7,6],[6,6],[5,6],[4,6],[3,6],[13,5],[14,5],[15,5],[16,5],[17,5],[18,5],[19,5],[20,5],[21,5]];
    path.forEach(([x,y])=>{if(tiles[y]&&tiles[y][x]!=='tree')tiles[y][x]='path'});
    for(let y=2;y<6;y++)for(let x=14;x<17;x++)tiles[y][x]='pond';
    [[2,3],[3,3],[4,3],[2,4],[3,4],[22,3],[22,4],[3,9],[4,9],[5,9],[16,10],[17,10],[18,10],[20,9],[21,9],[22,9],[8,3],[9,3],[20,3],[21,3],[2,14],[3,14],[18,14],[19,14],[21,14],[22,14],[8,15],[9,15],[16,3],[17,3]].forEach(([x,y])=>{if(tiles[y][x]!=='pond')tiles[y][x]='flower'});
    // Colorful tall grass is an optional invitation to a wild debate.
    [[8,4],[9,4],[8,5],[9,5],[16,14],[17,14],[16,15],[17,15],[22,7],[22,8],[2,8],[2,9]].forEach(([x,y])=>tiles[y][x]='tall');
  }
  function drawTile(x,y,t){
    const px=x*TILE, py=y*TILE;
    ctx.fillStyle= t==='path'?'#d7cba8':t==='pond'?'#8fb8b1':t==='tree'?'#587755':palette[(x*7+y*11)%palette.length];
    ctx.fillRect(px,py,TILE,TILE);
    if(t==='mottled'){ctx.fillStyle='#ced9bf';ctx.fillRect(px+5,py+8,2,2);ctx.fillRect(px+22,py+22,2,2)}
    if(t==='flower'){
      ctx.fillStyle='#91a77e';ctx.fillRect(px+15,py+13,2,8);ctx.fillStyle=(x+y)%3===0?'#e1a98a':(x%2?'#f0d47d':'#d69ab1');ctx.fillRect(px+12,py+12,3,3);ctx.fillRect(px+17,py+12,3,3);ctx.fillRect(px+14,py+10,3,3);ctx.fillRect(px+14,py+15,3,3);ctx.fillStyle='#e7d8a0';ctx.fillRect(px+15,py+13,2,2);
    }
    if(t==='tall'){
      ctx.fillStyle='#789567';for(let i=0;i<5;i++){const bx=px+4+i*6, h=10+(i*7+x+y)%9;ctx.beginPath();ctx.moveTo(bx-3,py+28);ctx.quadraticCurveTo(bx-2,py+16-h,bx+2,py+27);ctx.lineTo(bx+1,py+29);ctx.fill();ctx.fillRect(bx,py+20,1,7)}
      ctx.fillStyle='#a5b789';ctx.fillRect(px+6,py+19,2,2);ctx.fillRect(px+24,py+14,2,2);
    }
    if(t==='pond'){
      ctx.fillStyle='#a8cbc0';ctx.fillRect(px+4,py+9,9,2);ctx.fillRect(px+19,py+21,7,2);ctx.fillStyle='#82aaa3';ctx.fillRect(px+1,py+30,30,2);
    }
    if(t==='path'){
      ctx.fillStyle='#c9bb99';ctx.fillRect(px+4,py+5,2,2);ctx.fillRect(px+23,py+21,3,2);ctx.fillStyle='#e2d7bb';ctx.fillRect(px+13,py+14,2,1);
    }
    if(t==='tree'){
      ctx.fillStyle='#3f6049';ctx.fillRect(px,py+23,TILE,9);ctx.fillStyle='#587755';ctx.beginPath();ctx.arc(px+15,py+17,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#698966';ctx.beginPath();ctx.arc(px+10,py+12,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#7d9a73';ctx.fillRect(px+5,py+8,3,2);ctx.fillRect(px+21,py+15,3,2);ctx.fillStyle='#4b684d';ctx.fillRect(px+13,py+23,5,9);
    }
    // Soft gridless checker-like grass grain.
    if(t==='grass'||t==='mottled'){ctx.fillStyle='#c8d6bb';ctx.fillRect(px+25,py+6,2,1);ctx.fillRect(px+7,py+25,1,2)}
  }
  function drawPerson(x,y,key,isPlayer=false){
    const px=x*TILE+16, py=y*TILE+16, info=colors[key]||colors.Aristotle;
    // shadow
    ctx.fillStyle='#344a3230';ctx.beginPath();ctx.ellipse(px,py+11,10,4,0,0,Math.PI*2);ctx.fill();
    const tint=isPlayer?'#3f684c':info.accent;
    // coat/body
    ctx.fillStyle=tint;ctx.beginPath();ctx.moveTo(px-7,py+1);ctx.quadraticCurveTo(px-9,py+8,px-8,py+12);ctx.lineTo(px+8,py+12);ctx.quadraticCurveTo(px+9,py+4,px+7,py+1);ctx.closePath();ctx.fill();
    ctx.fillStyle=isPlayer?'#e8c99a':'#dcb995';ctx.beginPath();ctx.arc(px,py-5,6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=isPlayer?'#344d3a':(key==='Nietzsche'?'#493b3b':'#555343');ctx.beginPath();ctx.arc(px,py-8,7,Math.PI,Math.PI*2);ctx.lineTo(px+6,py-5);ctx.lineTo(px-6,py-5);ctx.fill();
    ctx.fillStyle='#f0ead4';ctx.fillRect(px-5,py+3,10,2);
    if(!isPlayer){ctx.fillStyle='#fff9df';ctx.beginPath();ctx.arc(px+10,py-14,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#839568';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText('!',px+10,py-11)}
  }
  function renderWorld(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)drawTile(x,y,tiles[y][x]);
    // An old stone circle, a thought-tree and fallen leaves.
    ctx.strokeStyle='#c4b998';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(12*TILE+16,3*TILE+16,48,18,0,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#b8ad8d';[[11,3],[13,3],[12,2],[12,4]].forEach(([x,y])=>{ctx.beginPath();ctx.ellipse(x*TILE+16,y*TILE+16,8,4,.5,0,Math.PI*2);ctx.fill()});
    // Berry-colored mushrooms along the grass edge.
    [[6,4],[18,9],[9,13],[21,3]].forEach(([x,y])=>{ctx.fillStyle='#eee4c9';ctx.fillRect(x*TILE+14,y*TILE+20,3,6);ctx.fillStyle='#c97865';ctx.beginPath();ctx.arc(x*TILE+15,y*TILE+19,5,Math.PI,Math.PI*2);ctx.fill()});
    trainers.forEach(t=>{if(!t.done)drawPerson(t.x,t.y,t.key)});
    drawPerson(player.x,player.y,party[activeIndex]?.key||'Aristotle',true);
    // interaction marker if a nearby thinker is ready
    const near=nearbyTrainer(); if(gameStarted&&!battle&&near){ctx.fillStyle='#fff8dc';ctx.beginPath();ctx.arc(near.x*TILE+16,near.y*TILE+1+Math.sin(Date.now()/180)*2,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#708461';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('E',near.x*TILE+16,near.y*TILE+4)}
    requestAnimationFrame(renderWorld);
  }
  function nearbyTrainer(){return trainers.find(t=>!t.done&&Math.abs(t.x-player.x)+Math.abs(t.y-player.y)<=1)}
  function passable(x,y){return x>=0&&y>=0&&x<COLS&&y<ROWS&&tiles[y][x]!=='tree'&&tiles[y][x]!=='pond'&&!trainers.some(t=>!t.done&&t.x===x&&t.y===y)}
  function move(dir){if(!gameStarted||battle||Date.now()-lastMove<135)return;lastMove=Date.now();let [dx,dy]=dir==='up'?[0,-1]:dir==='down'?[0,1]:dir==='left'?[-1,0]:[1,0];player.dir=dir;let nx=player.x+dx,ny=player.y+dy;if(passable(nx,ny)){player.x=nx;player.y=ny;player.frame++;
      if(tiles[ny][nx]==='tall'&&Math.random()<.055){const pool=['Plato','Diogenes','Epicurus'];const foe=pool[Math.floor(Math.random()*pool.length)];showToast('A wild thought is taking shape…');setTimeout(()=>{if(!battle)startBattle(foe,null,true)},650)}
    } else {player.frame++} }
  function showToast(text){const el=$('#toast');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),1900)}
  function interact(){if(!gameStarted||battle)return;const t=nearbyTrainer();if(t){showToast(t.line);setTimeout(()=>{if(!battle)startBattle(t.key,t)},320);return}if(tiles[player.y][player.x]==='tall'){startBattle(['Plato','Diogenes','Epicurus'][Math.floor(Math.random()*3)],null,true);return}showToast('A quiet meadow. Wander until a thinker catches your eye.')}
  function initStarterOptions(){const root=$('#starterOptions');root.innerHTML='';starterKeys.forEach(key=>{const t=thinkers[key],c=colors[key];const button=document.createElement('button');button.className='starter-option';button.type='button';button.innerHTML=`<span class="starter-emoji" style="background:${c.pale};color:${c.accent}">${c.icon}</span><span class="starter-desc"><span class="starter-name">${t.name}</span><span class="starter-phil">${c.tag} · ${t.desc}</span></span><span class="starter-glyph">↗</span>`;button.addEventListener('click',()=>{selectedStarter=key;document.querySelectorAll('.starter-option').forEach(b=>b.classList.remove('selected'));button.classList.add('selected');$('#beginButton').disabled=false});root.appendChild(button)})}
  function startGame(){if(!selectedStarter)return;gameStarted=true;party=[{key:selectedStarter,hp:thinkers[selectedStarter].hp,maxHp:thinkers[selectedStarter].hp,xp:0}];$('#introOverlay').hidden=true;updateSidebar();showToast(`${selectedStarter} joins your expedition. Find the thinkers marked !`);}
  function updateSidebar(){
    $('#partyCount').textContent=party.length?String(party.length).padStart(2,'0')+' / 04':'—';
    $('#partyList').innerHTML=party.length?party.map((member,i)=>{const t=thinkers[member.key],c=colors[member.key],hp=Math.max(0,member.hp);return `<button class="party-member ${i===activeIndex?'active-member':''}" data-index="${i}" style="width:100%;text-align:left;cursor:pointer"><span class="thinker-icon" style="background:${c.pale};color:${c.accent}">${c.icon}</span><span class="thinker-info"><span class="thinker-name">${t.name}${i===activeIndex?' · ACTIVE':''}</span><span class="thinker-tag">${c.tag} · LV. ${1+Math.floor(member.xp/2)}</span><span class="mini-hp"><span style="width:${100*hp/member.maxHp}%;background:${hp<30?'#cf8373':'#91a87a'}"></span></span></span><span class="member-level">${hp}/${member.maxHp}</span></button>`}).join(''):'<div class="party-empty">Your ideas are waiting<br>to take shape.</div>';
    document.querySelectorAll('.party-member').forEach(el=>el.addEventListener('click',()=>{activeIndex=Number(el.dataset.index);updateSidebar();showToast(`${party[activeIndex].key} is ready to think.`)}));
    const wins=trainers.filter(t=>t.done).length;$('#questCount').textContent=`${wins} / 3`;$('#questProgress').style.width=`${Math.min(100,wins/3*100)}%`;$('#questCheck').textContent=wins>=3?'✓':'○';$('#questText').textContent=wins>=3?'Bring three thinkers together':party.length?'Meet the thinkers of the meadow':'Choose your first philosopher';$('#insightCount').textContent=`${insight} INSIGHT${insight===1?'':'S'}`;
    if(wins>=3&&!gameWon){gameWon=true}
  }
  function startBattle(key,trainer,wild=false){if(!party.length)return;const foe=thinkers[key];battle={key,trainer,wild,foeHp:foe.hp,foeMax:foe.hp,hero:party[activeIndex],guard:0,healed:false,turn:0,done:false};$('#battleTitle').textContent=trainer?`A meeting with ${foe.name}`:'A wild idea appears';$('#foeName').textContent=foe.name.toUpperCase();$('#heroName').textContent=battle.hero.key.toUpperCase();$('#foeSprite').textContent=colors[key].icon;$('#foeSprite').style.background=colors[key].pale;$('#foeSprite').style.color=colors[key].accent;const heroStyle=colors[battle.hero.key];$('#heroSprite').textContent=heroStyle.icon;$('#heroSprite').style.background=heroStyle.pale;$('#heroSprite').style.color=heroStyle.accent;$('#battleMessage').textContent=trainer?trainer.line:`A wild ${foe.name} has a question for you.`;$('#battleOverlay').hidden=false;renderBattle();sound(440,.07)}
  const moveMeta=[{name:'Logos',icon:'⌁',detail:'A clear, reasoned argument',power:'STEADY'},{name:'Dialectic',icon:'⇄',detail:'Guard, then turn the question',power:'COUNTER'},{name:'Paradox',icon:'✳',detail:'Risk everything for a bold idea',power:'RISKY'},{name:'Meditate',icon:'◌',detail:'Restore a little composure',power:'RESTORE'}];
  function renderBattle(){if(!battle)return;const hero=battle.hero;$('#heroHp').style.width=`${Math.max(0,100*hero.hp/hero.maxHp)}%`;$('#foeHp').style.width=`${Math.max(0,100*battle.foeHp/battle.foeMax)}%`;$('#heroHpText').textContent=`${Math.max(0,hero.hp)} / ${hero.maxHp}`;$('#foeHpText').textContent=`${Math.max(0,battle.foeHp)} / ${battle.foeMax}`;$('#heroHp').style.background=hero.hp<30?'#d17f70':'#719366';const content=$('#battleContent');if(battle.done){content.innerHTML=`<div class="result-panel"><p>${battle.resultText}</p><button class="primary-button" id="battleContinue">${battle.won?'CONTINUE':'TRY ANOTHER THINKER'} <span>↗</span></button></div>`;$('#battleContinue').onclick=finishBattle;return}
    content.innerHTML=`<div class="move-grid">${moveMeta.map((m,i)=>`<button class="move-button" data-move="${i}" ${i===3&&battle.healed?'disabled':''}><span class="move-symbol">${m.icon}</span><span class="move-meta"><span class="move-name">${m.name}</span><span class="move-detail">${i===0?thinkers[hero.key].moves[0]+': '+m.detail:m.detail}</span></span><span class="move-power">${i===3&&battle.healed?'USED':m.power}</span></button>`).join('')}</div>`;
    document.querySelectorAll('.move-button').forEach(btn=>{btn.addEventListener('click',()=>playMove(Number(btn.dataset.move)))});
  }
  function playMove(index){if(!battle||battle.done)return;const b=battle,hero=thinkers[b.hero.key],foe=thinkers[b.key];let damage=0,message='';
    if(index===0){damage=Math.round(hero.attack*(.85+Math.random()*.32));message=`${hero.name} makes a ${hero.moves[0]} argument. It lands for ${damage} insight!`;}
    if(index===1){damage=Math.round(hero.attack*(.5+Math.random()*.18));b.guard=1;message=`${hero.name} turns the question around with ${hero.moves[1]}. A counter is ready.`}
    if(index===2){if(Math.random()<.75){damage=Math.round(hero.attack*(1.9+Math.random()*.45));message=`A daring ${hero.moves[2]}! ${damage} insight of impact.`}else{b.hero.hp=Math.max(1,b.hero.hp-10);damage=Math.round(hero.attack*.3);message=`The paradox collapses in on itself. ${hero.name} loses 10 composure.`}}
    if(index===3){if(b.healed)return;b.healed=true;const healed=Math.min(24,b.hero.maxHp-b.hero.hp);b.hero.hp+=healed;message=`${hero.name} finds stillness and restores ${healed} composure.`}
    b.foeHp=Math.max(0,b.foeHp-damage);$('#battleMessage').textContent=message;renderBattle();sound(index===2?260:500,.09);
    if(b.foeHp<=0){setTimeout(()=>winBattle(),450);return}
    setTimeout(()=>enemyTurn(),600);
  }
  function enemyTurn(){if(!battle||battle.done)return;const b=battle,foe=thinkers[b.key],hero=thinkers[b.hero.key];let damage=Math.round(foe.attack*(.7+Math.random()*.43));if(b.guard){damage=Math.max(3,Math.round(damage*.42));b.guard=0;$('#battleMessage').textContent=`${foe.name} presses the point — but ${hero.name} turns it aside! ${damage} composure lost.`}else $('#battleMessage').textContent=`${foe.name} offers a counterargument. ${damage} composure lost.`;b.hero.hp=Math.max(0,b.hero.hp-damage);renderBattle();sound(190,.08);if(b.hero.hp<=0){setTimeout(()=>{b.hero.hp=1;const backup=party.findIndex((m,i)=>i!==activeIndex&&m.hp>0);if(backup>=0){activeIndex=backup;b.hero=party[backup];b.guard=0;b.healed=false;$('#heroName').textContent=b.hero.key.toUpperCase();const c=colors[b.hero.key];$('#heroSprite').textContent=c.icon;$('#heroSprite').style.background=c.pale;$('#heroSprite').style.color=c.accent;$('#battleMessage').textContent=`${hero.name} needs a moment. ${b.hero.key} takes up the question!`;renderBattle()}else{b.done=true;b.won=false;b.resultText=`${hero.name} needs to rest. A good debate can wait.`;$('#battleMessage').textContent='Every question can be revisited.';renderBattle();updateSidebar()}},450)}else updateSidebar()}
  function winBattle(){if(!battle)return;const b=battle;b.done=true;b.won=true;b.hero.xp++;insight+=20;if(b.trainer){b.trainer.done=true;if(!party.some(m=>m.key===b.key)&&party.length<4)party.push({key:b.key,hp:thinkers[b.key].hp,maxHp:thinkers[b.key].hp,xp:0});b.resultText=`${b.key} was persuaded by your curiosity. They join your party! +20 insight.`}else b.resultText=`A lively debate! You earned 20 insight. The meadow's ideas grow clearer.`;$('#battleMessage').textContent=`A new understanding blooms. ${b.key} concedes the point.`;sound(680,.13);renderBattle();updateSidebar()}
  function finishBattle(){if(!battle)return;const won=battle.won,trainer=battle.trainer;$('#battleOverlay').hidden=true;battle=null;if(won&&trainer&&trainers.filter(t=>t.done).length>=3){showToast('Three thinkers have joined your journey!')}else if(!won)showToast('Your thinker is recovering. Choose another from your party.');if(won)party.forEach(m=>{m.hp=m.maxHp});updateSidebar();if(gameWon&&won)showEnding()}
  function showEnding(){$('#endingStats').innerHTML=`<span><b>${trainers.filter(t=>t.done).length}</b>GREAT MINDS</span><span><b>${party.length}</b>IN YOUR PARTY</span><span><b>${insight}</b>INSIGHT</span>`;$('#endingOverlay').hidden=false}
  function sound(freq,duration){if(!audioOn)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const osc=ac.createOscillator(),gain=ac.createGain();osc.frequency.value=freq;osc.type='sine';gain.gain.setValueAtTime(.035,ac.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ac.currentTime+duration);osc.connect(gain);gain.connect(ac.destination);osc.start();osc.stop(ac.currentTime+duration)}catch(_){}}
  document.addEventListener('keydown',e=>{if($('#introOverlay').hidden===false){if(e.key==='Enter'&&!$('#beginButton').disabled)startGame();return}if(battle){if(['1','2','3','4'].includes(e.key))playMove(Number(e.key)-1);if(e.key==='Escape'&&battle.done)finishBattle();return}const key=e.key.toLowerCase();if(['arrowup','w'].includes(key)){e.preventDefault();move('up')}else if(['arrowdown','s'].includes(key)){e.preventDefault();move('down')}else if(['arrowleft','a'].includes(key)){e.preventDefault();move('left')}else if(['arrowright','d'].includes(key)){e.preventDefault();move('right')}else if(key==='e'||key===' '){e.preventDefault();interact()}});
  document.querySelectorAll('.touch-controls button').forEach(btn=>{const dir=btn.dataset.dir;btn.addEventListener('pointerdown',e=>{e.preventDefault();move(dir)});btn.addEventListener('touchstart',e=>{e.preventDefault();move(dir)},{passive:false})});
  $('#beginButton').addEventListener('click',startGame);$('#battleClose').addEventListener('click',()=>{if(battle?.done)finishBattle();else showToast('Finish the debate before you go.')});$('#continueButton').addEventListener('click',()=>{$('#endingOverlay').hidden=true;showToast('The meadow still has more questions.')});$('#soundToggle').addEventListener('click',()=>{audioOn=!audioOn;$('#soundToggle').innerHTML=`♫ <span>SOUND ${audioOn?'ON':'OFF'}</span>`;if(audioOn)sound(540,.11)});
  seedMap();initStarterOptions();renderWorld();
})();
