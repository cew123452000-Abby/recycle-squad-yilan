"use strict";

const STORAGE_KEY = "tablewareCleanSortStackV1";
const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const scoreEl = document.querySelector("#header-score");
const VIDEO_ROOT = "https://raw.githubusercontent.com/cew123452000-Abby/recycle-squad-yilan/main/games/tableware/videos/";
const videoUrl = file => VIDEO_ROOT + encodeURIComponent(file);
let session = null;

const levels = [
  { id:1, title:"清理小高手", subtitle:"清｜清理", image:"scene-01-03.png", video:"01-紙餐具先清理.mp4", goal:"把內容物清空、簡單清理並保持乾燥", pass:"8題答對6題以上", points:30 },
  { id:2, title:"分類快手", subtitle:"分｜分類", image:"scene-02-03.png", video:"02-紙餐具要分類.mp4", goal:"把紙餐具、其他資源與一般垃圾分開", pass:"12件答對10件以上", points:30 },
  { id:3, title:"堆疊達人", subtitle:"疊｜堆疊", image:"scene-03-03.png", video:"03-紙餐具同類堆疊.mp4", goal:"同類、同形狀的紙餐具整齊套疊", pass:"12件答對10件並完成流程排序", points:40 }
];

const defaultState = () => ({ unlocked:1, scores:[0,0,0], teacherMode:false, name:"回收小高手" });
let state = loadState();

function loadState(){ try{return {...defaultState(),...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")};}catch{return defaultState();} }
function saveState(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); updateHeader(); }
function updateHeader(){ scoreEl.textContent=state.scores.reduce((a,b)=>a+b,0); }
function isUnlocked(id){ return state.teacherMode||id<=state.unlocked; }
function allLevelsDone(){ return levels.every((level,index)=>state.scores[index]===level.points); }
function notify(text){ toast.textContent=text;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2200); }
function shuffle(items){ return [...items].sort(()=>Math.random()-.5); }
function goTop(){ window.scrollTo({top:0,behavior:"smooth"});app.focus({preventScroll:true}); }
function escapeHtml(text){const d=document.createElement("div");d.textContent=text;return d.innerHTML;}

function renderHome(){
  session=null; updateHeader();
  const total=state.scores.reduce((a,b)=>a+b,0),done=levels.filter((level,index)=>state.scores[index]===level.points).length;
  app.innerHTML=`
    <section class="hero">
      <img src="assets/scenes/scene-03-03.png" alt="小晴與疊疊龜完成紙餐具清理、分類與堆疊任務">
      <div class="hero-copy"><p class="eyebrow">三段動畫・三關任務</p><h1>紙餐具<br>清分疊大作戰</h1><p class="lead">跟著小晴和疊疊龜，學會「清理、分類、堆疊」三步驟，讓紙餐具回收整齊又省空間！</p><div class="action-row"><button class="btn btn-primary" data-action="continue">${done?"繼續闖關":"開始第一關"}</button>${allLevelsDone()?'<button class="btn btn-secondary" data-action="certificate">查看完成證書</button>':""}</div></div>
    </section>
    <section class="dashboard">
      <div class="panel"><div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">學習地圖</p><h2>清・分・疊三大關卡</h2></div><span class="status-chip">${done}/3 關完成</span></div><div class="progress-track" aria-label="總進度 ${total}%"><div class="progress-fill" style="width:${total}%"></div></div>
        <div class="level-grid">${levels.map(l=>{const open=isUnlocked(l.id),score=state.scores[l.id-1],completed=score===l.points;return `<article class="level-card ${completed?"done":""} ${open?"":"locked"}"><span class="level-no">LEVEL 0${l.id}</span><h3>${l.title}</h3><p>${l.subtitle}</p><button class="btn ${completed?"btn-secondary":"btn-primary"}" data-level="${l.id}" ${open?"":"disabled"}>${completed?`已完成・${score}分`:score?`再挑戰・目前${score}分`:open?"進入關卡":"尚未解鎖"}</button></article>`;}).join("")}</div>
      </div>
      <aside class="panel"><h2 style="font-size:1.5rem">老師與勇士提醒</h2><ul class="mini-list"><li>每關先看動畫，再開始任務。</li><li>第一、二關各30分，第三關40分。</li><li>完成三關可取得學習證書。</li></ul><p class="privacy-note"><b>隱私安全：</b>積分與暱稱只保存在這個瀏覽器，不會上傳。</p><div class="action-row no-print"><button class="btn btn-quiet" data-action="teacher">${state.teacherMode?"關閉教師預覽":"教師預覽：解鎖全部"}</button><button class="btn btn-danger" data-action="reset">重設學習進度</button></div></aside>
    </section>`;
  goTop();
}

function renderLevel(id){
  if(!isUnlocked(id)){notify("請先完成前一關喔！");return renderHome();}
  session=null;const l=levels[id-1];
  app.innerHTML=`<section class="level-hero"><img src="assets/scenes/${l.image}" alt="${l.title}教學動畫場景"><div class="level-hero-copy"><p class="eyebrow">LEVEL 0${id}｜${l.subtitle}</p><h1>${l.title}</h1><p class="lead">${l.goal}</p></div></section>
    <div class="level-layout"><section class="panel"><h2>先看任務動畫</h2><div class="video-box"><video controls playsinline preload="none" poster="assets/scenes/${l.image}"><source src="${videoUrl(l.video)}" type="video/mp4">你的瀏覽器無法播放影片。</video></div><p style="margin:.8rem 0 0;color:var(--muted)">影片已包含中文配音與臺灣繁體中文字幕。</p></section><aside class="panel lesson-card"><p class="eyebrow" style="color:var(--orange)">本關任務</p><h2 style="font-size:1.5rem">${l.goal}</h2><p><b>過關條件：</b>${l.pass}</p><div class="action-row"><button class="btn btn-primary" data-action="start" data-level="${id}">看完了，開始任務</button><button class="btn btn-secondary" data-action="home">回學習地圖</button></div></aside></div><section id="game-stage" class="panel game-stage hidden"></section>`;
  goTop();
}

const cleanQuestions=[
  {q:"紙杯裡還有半杯飲料，第一個動作是？",a:"把飲料倒空",o:["把飲料倒空","直接放入回收箱","和紙盤堆在一起"],e:"先清空液體，避免弄濕其他回收物。"},
  {q:"紙盤上有少量醬汁，應該怎麼做？",a:"簡單刮除或擦拭",o:["簡單刮除或擦拭","用大量清水沖洗很久","直接翻面藏起來"],e:"簡單清理即可，不需要浪費大量清水。"},
  {q:"紙碗中還有飯粒和菜渣，應該先？",a:"清除食物殘渣",o:["清除食物殘渣","壓到最扁","放進一般廢紙"],e:"先清除食物殘渣，再進行分類。"},
  {q:"已清空的紙杯仍然濕濕的，接著要？",a:"保持乾燥後再回收",o:["保持乾燥後再回收","裝滿清水","塞入衛生紙"],e:"紙餐具清理後應保持乾燥。"},
  {q:"乾淨、乾燥的紙盤需要再用大量水沖洗嗎？",a:"不需要",o:["不需要","需要沖洗十分鐘","要泡在水裡"],e:"已清理乾淨就不必浪費大量清水。"},
  {q:"有湯汁的紙碗可以直接和其他紙餐具放一起嗎？",a:"不可以，要先清空",o:["不可以，要先清空","可以，湯汁會自己乾","可以，只要蓋起來"],e:"殘留液體會污染其他回收物。"},
  {q:"紙餐具回收的「清」代表什麼？",a:"清空並簡單清理",o:["清空並簡單清理","只看顏色","全部剪碎"],e:"清，就是清空內容物並簡單清理。"},
  {q:"紙餐具清理完成後，下一個步驟是？",a:"依類別分類",o:["依類別分類","再次裝食物","全部混在一起"],e:"清理完成後，要進入第二步：分類。"}
];

function startGame(id){const stage=document.querySelector("#game-stage");stage.classList.remove("hidden");stage.scrollIntoView({behavior:"smooth",block:"start"});if(id===1)startL1(stage);if(id===2)startL2(stage);if(id===3)startL3(stage);}
function startL1(stage){session={level:1,index:0,correct:0,questions:shuffle(cleanQuestions)};renderL1(stage);}
function renderL1(stage){const s=session;if(s.index>=s.questions.length)return finishLevel(1,s.correct,8,6);const q=s.questions[s.index];stage.innerHTML=`<div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">清理判斷</p><h2>${q.q}</h2></div><span class="status-chip">${s.index+1}/8・答對${s.correct}</span></div><div class="choices">${shuffle(q.o).map(o=>`<button class="choice" data-clean="${o}">${o}</button>`).join("")}</div><div id="feedback" class="feedback"></div>`;}
function answerClean(ans){const s=session,q=s.questions[s.index],fb=document.querySelector("#feedback");document.querySelectorAll("[data-clean]").forEach(b=>b.disabled=true);if(ans===q.a){s.correct++;fb.className="feedback good";fb.textContent=`答對了！${q.e}`;}else{fb.className="feedback bad";fb.textContent=`正確做法是「${q.a}」。${q.e}`;}setTimeout(()=>{s.index++;renderL1(document.querySelector("#game-stage"));},850);}

const sortItems=[
  ["乾燥紙碗","🥣","paper"],["乾燥紙盤","🍽️","paper"],["空紙杯","🥤","paper"],["紙餐盒","▣","paper"],["紙湯碗","◡","paper"],["紙托盤","▭","paper"],
  ["寶特瓶","🧴","resource"],["塑膠杯","◯","resource"],["鋁罐","🥫","resource"],
  ["使用過的衛生紙","▧","trash"],["塑膠吸管","╱","trash"],["沾食物的餐巾紙","▨","trash"]
];
const sortZones={paper:"紙餐具回收區",resource:"其他資源回收區",trash:"一般垃圾"};
function startL2(stage){session={level:2,items:shuffle(sortItems.map(x=>[...x])),selected:null,answered:0,correct:0};renderL2(stage);}
function renderL2(stage){const s=session;stage.innerHTML=`<div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">先選物品，再點分類區</p><h2>幫每件物品找到正確的家</h2></div><span class="status-chip">完成${s.answered}/12・答對${s.correct}</span></div><p class="instruction">紙餐具要和其他資源回收物分開；使用過的衛生紙不能回收。</p><div class="items">${s.items.map((it,i)=>`<button class="item-card" data-sort-item="${i}"><span class="item-icon">${it[1]}</span>${it[0]}</button>`).join("")}</div><div class="zones">${Object.entries(sortZones).map(([k,v])=>`<button class="zone ${k==="paper"?"blue":k==="resource"?"green":"orange"}" data-sort-zone="${k}">${v}</button>`).join("")}</div><div id="feedback" class="feedback"></div>`;}
function selectSort(i){if(session.items[i][3])return;session.selected=i;document.querySelectorAll("[data-sort-item]").forEach((b,j)=>b.classList.toggle("selected",j===i));}
function answerSort(zone){const s=session,fb=document.querySelector("#feedback");if(s.selected===null){fb.className="feedback bad";fb.textContent="請先選一張物品卡。";return;}const item=s.items[s.selected],btn=document.querySelector(`[data-sort-item='${s.selected}']`);item[3]=true;btn.disabled=true;btn.classList.remove("selected");btn.classList.add("answered");s.answered++;if(zone===item[2]){s.correct++;fb.className="feedback good";fb.textContent=`答對了！${item[0]}放到「${sortZones[zone]}」。`;}else{fb.className="feedback bad";fb.textContent=`${item[0]}應放到「${sortZones[item[2]]}」。`;}s.selected=null;document.querySelector(".status-chip").textContent=`完成${s.answered}/12・答對${s.correct}`;if(s.answered===12)setTimeout(()=>finishLevel(2,s.correct,12,10),850);}

const stackItems=[
  ["紙碗1","🥣","bowl"],["紙杯1","🥤","cup"],["紙盤1","◯","plate"],["紙碗2","🥣","bowl"],["紙盤2","◯","plate"],["紙杯2","🥤","cup"],
  ["紙杯3","🥤","cup"],["紙碗3","🥣","bowl"],["紙盤3","◯","plate"],["紙盤4","◯","plate"],["紙杯4","🥤","cup"],["紙碗4","🥣","bowl"]
];
const stackZones={bowl:"紙碗套疊",plate:"紙盤平疊",cup:"紙杯同方向套疊"};
function startL3(stage){session={level:3,items:shuffle(stackItems.map(x=>[...x])),selected:null,answered:0,correct:0,order:[]};renderL3(stage);}
function renderL3(stage){const s=session;stage.innerHTML=`<div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">同類堆疊</p><h2>把同形狀紙餐具整理成三組</h2></div><span class="status-chip">完成${s.answered}/12・答對${s.correct}</span></div><p class="instruction">先選一件紙餐具，再點正確堆疊方式。不同形狀不要混疊。</p><div class="items">${s.items.map((it,i)=>`<button class="item-card" data-stack-item="${i}"><span class="item-icon">${it[1]}</span>${it[0]}</button>`).join("")}</div><div class="zones">${Object.entries(stackZones).map(([k,v])=>`<button class="zone ${k==="bowl"?"green":k==="plate"?"blue":"orange"}" data-stack-zone="${k}">${v}</button>`).join("")}</div><div id="feedback" class="feedback"></div>`;}
function selectStack(i){if(session.items[i][3])return;session.selected=i;document.querySelectorAll("[data-stack-item]").forEach((b,j)=>b.classList.toggle("selected",j===i));}
function answerStack(zone){const s=session,fb=document.querySelector("#feedback");if(s.selected===null){fb.className="feedback bad";fb.textContent="請先選一件紙餐具。";return;}const item=s.items[s.selected],btn=document.querySelector(`[data-stack-item='${s.selected}']`);item[3]=true;btn.disabled=true;btn.classList.remove("selected");btn.classList.add("answered");s.answered++;if(zone===item[2]){s.correct++;fb.className="feedback good";fb.textContent=`正確！${stackZones[zone]}，整齊又省空間。`;}else{fb.className="feedback bad";fb.textContent=`這一件應放到「${stackZones[item[2]]}」。`;}s.selected=null;document.querySelector(".status-chip").textContent=`完成${s.answered}/12・答對${s.correct}`;if(s.answered===12)setTimeout(()=>renderOrder(document.querySelector("#game-stage")),850);}
function renderOrder(stage){session.order=[];stage.innerHTML=`<div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">最後挑戰</p><h2>排出紙餐具回收三步驟</h2></div><span class="status-chip">清・分・疊</span></div><p class="instruction">依正確順序點選三張步驟卡。</p><div class="sequence"><div class="sequence-slot" id="order-0">1</div><div class="sequence-slot" id="order-1">2</div><div class="sequence-slot" id="order-2">3</div></div><div class="choices">${shuffle(["清理","分類","堆疊"]).map(x=>`<button class="choice" data-order="${x}">${x}</button>`).join("")}</div><div id="feedback" class="feedback"></div>`;}
function answerOrder(step,btn){const correct=["清理","分類","堆疊"],s=session,fb=document.querySelector("#feedback"),expected=correct[s.order.length];if(step!==expected){fb.className="feedback bad";fb.textContent=`再想想：第${s.order.length+1}步應該先做什麼？`;return;}s.order.push(step);btn.disabled=true;document.querySelector(`#order-${s.order.length-1}`).textContent=step;fb.className="feedback good";fb.textContent="順序正確！";if(s.order.length===3)setTimeout(()=>finishLevel(3,s.correct,12,10),700);}

function finishLevel(id,correct,total,passCount){const l=levels[id-1],passed=correct>=passCount,score=passed?l.points:Math.round(correct/total*l.points);state.scores[id-1]=Math.max(state.scores[id-1],score);if(passed)state.unlocked=Math.max(state.unlocked,Math.min(3,id+1));saveState();const certificateReady=allLevelsDone();const message=passed?(certificateReady?"三個關卡全部完成，你已學會紙餐具清、分、疊！":id===3?"第三關已通過！請回學習地圖完成其餘關卡，才能取得證書。":"下一關已經解鎖。") : "再看一次動畫提示，重新挑戰就會更進步。";const stage=document.querySelector("#game-stage");stage.innerHTML=`<div class="result-card"><p class="eyebrow" style="color:var(--orange)">${passed?"任務成功":"再接再厲"}</p><div class="stars">${passed?"★ ★ ★":"★ ☆ ☆"}</div><h2>${passed?`第${id}關過關！`:"差一點就成功！"}</h2><div class="result-score">${score}<small style="font-size:.25em"> / ${l.points}</small></div><p class="lead" style="margin-inline:auto">答對${correct}/${total}。${message}</p><div class="action-row" style="justify-content:center"><button class="btn btn-primary" data-action="${certificateReady?"certificate":"home"}">${certificateReady?"領取完成證書":"回學習地圖"}</button><button class="btn btn-secondary" data-action="start" data-level="${id}">再玩一次</button></div></div>`;}

function renderCertificate(){
  if(!allLevelsDone()){notify("請先完成清、分、疊三個關卡並全部過關，才能取得證書。");return renderHome();}
  const total=state.scores.reduce((a,b)=>a+b,0);
  app.innerHTML=`<section class="certificate-shell">
    <article class="certificate tableware-certificate" aria-label="紙餐具回收小高手證書">
      <header class="certificate-header"><p>清分疊任務完成</p><h1>紙餐具回收小高手證書</h1><span>完成三段動畫與三關回收挑戰</span></header>
      <div class="certificate-content">
        <p class="certificate-lead">茲證明</p>
        <div class="name-panel"><label for="hero-name">請輸入小高手姓名</label><input id="hero-name" class="name-input" maxlength="20" value="${escapeHtml(state.name)}" aria-label="學生姓名或暱稱"></div>
        <p class="certificate-story">完成紙餐具回收學習任務，能正確做到「清理、分類、堆疊」，讓回收物乾淨、整齊又節省空間，特頒此證。</p>
        <div class="certificate-steps"><span><b>清</b>清理乾淨</span><span><b>分</b>正確分類</span><span><b>疊</b>同類堆疊</span></div>
        <div class="certificate-award"><span>獲得稱號</span><strong>清分疊回收小高手</strong><em>總積分 ${total} / 100</em></div>
        <p class="certificate-slogan">紙餐具清、分、疊，回收整齊又省空間！</p>
      </div>
      <footer class="certificate-footer"><span>清分疊學習任務</span><b>疊疊龜認證</b><span id="certificate-date"></span></footer>
    </article>
    <div class="certificate-controls no-print"><p>下載時請在列印視窗選擇「儲存為 PDF」，紙張設為 A4、方向選擇橫向，背景圖形請保持開啟。</p><div class="action-row"><button class="btn btn-primary certificate-download" data-action="print">下載單張 A4 證書</button><button class="btn btn-secondary" data-action="home">回學習地圖</button></div></div>
  </section>`;
  document.querySelector("#certificate-date").textContent=new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"long",day:"numeric"}).format(new Date());
  goTop();
}

document.addEventListener("click",e=>{
  const act=e.target.closest("[data-action]")?.dataset.action;
  if(act==="home")renderHome();
  if(act==="continue"){const next=levels.findIndex((level,index)=>state.scores[index]!==level.points)+1;renderLevel(next||3);}
  if(act==="teacher"){state.teacherMode=!state.teacherMode;saveState();renderHome();notify(state.teacherMode?"教師預覽已解鎖全部關卡":"已恢復學生依序闖關模式");}
  if(act==="reset"&&confirm("確定要清除這台裝置上的所有闖關進度嗎？")){state=defaultState();saveState();renderHome();notify("學習進度已重設");}
  if(act==="start")startGame(Number(e.target.closest("[data-level]").dataset.level));
  if(act==="certificate")renderCertificate();
  if(act==="print"){const input=document.querySelector("#hero-name");state.name=input.value.trim()||"回收小高手";saveState();window.print();}
  const level=e.target.closest("[data-level]")?.dataset.level;if(level&&!act)renderLevel(Number(level));
  const clean=e.target.closest("[data-clean]")?.dataset.clean;if(clean)answerClean(clean);
  const si=e.target.closest("[data-sort-item]")?.dataset.sortItem;if(si!==undefined)selectSort(Number(si));
  const sz=e.target.closest("[data-sort-zone]")?.dataset.sortZone;if(sz)answerSort(sz);
  const ti=e.target.closest("[data-stack-item]")?.dataset.stackItem;if(ti!==undefined)selectStack(Number(ti));
  const tz=e.target.closest("[data-stack-zone]")?.dataset.stackZone;if(tz)answerStack(tz);
  const order=e.target.closest("[data-order]");if(order)answerOrder(order.dataset.order,order);
});
document.addEventListener("change",e=>{if(e.target.id==="hero-name"){state.name=e.target.value.trim()||"回收小高手";saveState();}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&session)renderHome();});

updateHeader();renderHome();
