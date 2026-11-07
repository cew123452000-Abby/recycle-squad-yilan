"use strict";

const STORAGE_KEY = "pressureContainerSafetyQuestV1";
const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const scoreEl = document.querySelector("#header-score");
let session = null;
let toastTimer = null;

const videos = [
  {id:1,title:"完｜確認使用完畢",file:"01-完-確認使用完畢.mp4",poster:"scene-01-01.png",summary:"先停手、通知成人；由成人確認是否已使用完畢。"},
  {id:2,title:"包｜獨立打包",file:"02-包-獨立打包.mp4",poster:"scene-02-02.png",summary:"已確認用完的高壓容器，與其他回收物分開放入透明袋。"},
  {id:3,title:"警｜標示警語",file:"03-警-標示警語.mp4",poster:"scene-03-03.png",summary:"袋外清楚標示「內有高壓瓶」，提醒回收人員。"},
  {id:4,title:"收｜交付資源回收",file:"04-收-交付資源回收.mp4",poster:"scene-04-02.png",summary:"由成人直接交給資源回收人員，不可丟入垃圾壓縮車。"}
];

const levels = [
  {id:1,title:"高壓容器辨識所",subtitle:"認識常見容器",goal:"判斷哪些物品可能是廢高壓容器。",pass:"12 題答對 10 題以上",image:"scene-01-02.png",videos:[1],points:20},
  {id:2,title:"「完」安全判斷",subtitle:"停手與找大人",goal:"面對高壓容器時，選出安全的處理方式。",pass:"8 題答對 6 題以上",image:"scene-01-03.png",videos:[1],points:20},
  {id:3,title:"包警任務室",subtitle:"透明袋與警示卡",goal:"完成獨立打包、正確標示與保持完整三項任務。",pass:"三項任務全部完成",image:"scene-03-02.png",videos:[2,3],points:20},
  {id:4,title:"資源回收交付站",subtitle:"找對車、交對人",goal:"在四個校園情境中選出正確交付方法。",pass:"4 個情境全部答對",image:"scene-04-02.png",videos:[4],points:20},
  {id:5,title:"60 秒安全總挑戰",subtitle:"完包警收綜合應用",goal:"在 60 秒內完成 10 題綜合挑戰。",pass:"答對 8 題以上",image:"scene-04-03.png",videos:[4],points:20}
];

const defaultState = () => ({watched:[false,false,false,false],unlocked:0,scores:[0,0,0,0,0],teacherMode:false,name:"安全回收小勇士"});
let state = loadState();
normalizeState();

function loadState(){
  try{return {...defaultState(),...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")};}
  catch{return defaultState();}
}
function normalizeState(){
  if(!Array.isArray(state.watched)||state.watched.length!==4)state.watched=[false,false,false,false];
  if(!Array.isArray(state.scores)||state.scores.length!==5)state.scores=[0,0,0,0,0];
  if(allVideosDone()&&state.unlocked<1)state.unlocked=1;
}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));updateHeader();}
function updateHeader(){scoreEl.textContent=state.scores.reduce((sum,n)=>sum+n,0);}
function allVideosDone(){return state.watched.every(Boolean);}
function allLevelsDone(){return state.scores.every(score=>score===20);}
function isUnlocked(id){return state.teacherMode||(allVideosDone()&&id<=state.unlocked);}
function notify(text){clearTimeout(toastTimer);toast.textContent=text;toast.classList.add("show");toastTimer=setTimeout(()=>toast.classList.remove("show"),2300);}
function shuffle(items){const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function goTop(){window.scrollTo({top:0,behavior:"smooth"});app.focus({preventScroll:true});}
function escapeHtml(text){const div=document.createElement("div");div.textContent=text;return div.innerHTML;}
function clearSession(){if(session?.timer)clearInterval(session.timer);session=null;}

function renderHome(){
  clearSession();
  normalizeState();
  const watched=state.watched.filter(Boolean).length;
  const passed=state.scores.filter(score=>score===20).length;
  const nextLevel=levels.find(level=>isUnlocked(level.id)&&state.scores[level.id-1]<20)?.id||1;
  app.innerHTML=`
    <section class="hero">
      <div class="hero-media"><img src="assets/scenes/scene-04-03.png" alt="安安、平安老師、守守盾與回收人員完成完包警收四步驟"></div>
      <div class="hero-copy">
        <p class="eyebrow">四段動畫・五關安全任務</p>
        <h1>高壓容器<br>完包警收大作戰</h1>
        <p class="lead">先看動畫，學會「完、包、警、收」；再跟著安安與守守盾完成五關挑戰，守護自己也守護回收人員。</p>
        <div class="action-row">
          <button class="btn btn-primary" data-action="learning">${allVideosDone()?"複習四段動畫":"開始影片學習"}</button>
          <button class="btn btn-secondary" data-action="map" ${allVideosDone()||state.teacherMode?"":"disabled"}>${passed?`繼續第 ${nextLevel} 關`:'前往闖關地圖'}</button>
          ${allLevelsDone()?'<button class="btn btn-secondary" data-action="certificate">查看達人證書</button>':""}
        </div>
      </div>
    </section>
    <section class="safety-strip" aria-label="安全原則">
      <div class="safety-note"><b>學生先停手</b><span>不拿取、不搖晃、不按壓，立即通知老師或其他成人。</span></div>
      <div class="safety-note"><b>成人負責處理</b><span>確認、獨立打包、標示警語與交付，都由成人完成。</span></div>
      <div class="safety-note"><b>保持容器完整</b><span>不可刺穿、敲擊、擠壓、壓扁或投入一般垃圾壓縮車。</span></div>
    </section>
    <section class="section panel">
      <div class="section-head"><div><p class="eyebrow" style="color:var(--orange)">學習進度</p><h2>先學習，再闖關</h2></div><p>影片完成 ${watched}/4・關卡通過 ${passed}/5・目前 ${state.scores.reduce((a,b)=>a+b,0)} 分</p></div>
      <div class="progress-track" aria-label="整體學習進度"><div class="progress-bar" style="width:${((watched+passed)/9)*100}%"></div></div>
      <div class="step-ribbon">
        ${[["完","確認使用完畢"],["包","透明袋獨立打包"],["警","寫上內有高壓瓶"],["收","交給回收人員"]].map((step,i)=>`<div class="step-chip"><b>${step[0]}</b><span>${step[1]}</span><small>${state.watched[i]?"已完成學習":"等待學習"}</small></div>`).join("")}
      </div>
    </section>
    <section class="teacher-tools no-print">
      <label class="switch-row"><input type="checkbox" id="teacher-mode" ${state.teacherMode?"checked":""}>教師快速預覽模式</label>
      <div class="action-row" style="margin:0"><button class="btn btn-secondary" data-action="guide">查看教學建議</button><button class="btn btn-danger" data-action="reset">清除本機進度</button></div>
    </section>`;
  goTop();
}

function renderLearning(){
  clearSession();
  const completed=state.watched.filter(Boolean).length;
  app.innerHTML=`
    <section class="level-hero"><img src="assets/scenes/scene-01-01.png" alt="安安發現高壓容器後停手並通知老師"><div class="level-hero-copy"><p class="eyebrow">第一站｜動畫學習</p><h1>四段影片學會<br>完、包、警、收</h1><p class="lead">請依序觀看。影片播放到九成或完整結束後，系統會記錄學習進度。</p></div></section>
    <section class="section">
      <div class="section-head"><div><h2>影片學習站</h2><p>已完成 ${completed}/4。影片包含中文配音與燒錄臺灣繁體中文字幕。</p></div><button class="btn btn-secondary" data-action="home">回首頁</button></div>
      <div class="video-grid">${videos.map((video,index)=>`
        <article class="video-card ${state.watched[index]?"watched":""}">
          <div class="video-frame"><video controls playsinline preload="metadata" poster="assets/scenes/${video.poster}" data-learning-video="${index}"><source src="videos/${video.file}" type="video/mp4">你的瀏覽器無法播放影片。</video></div>
          <div class="video-copy"><span class="video-status">${state.watched[index]?"已完成":"尚未完成"}</span><h3>${video.id}. ${video.title}</h3><p>${video.summary}</p></div>
        </article>`).join("")}</div>
      <div class="panel" style="margin-top:1.2rem;text-align:center"><p><b>${allVideosDone()?"四段動畫學習完成，可以開始五關挑戰！":"完成四段影片後，第一關會自動解鎖。"}</b></p><div class="action-row" style="justify-content:center"><button class="btn btn-primary" data-action="map" ${allVideosDone()||state.teacherMode?"":"disabled"}>前往闖關地圖</button>${state.teacherMode?'<button class="btn btn-secondary" data-action="mark-all-videos">教師：標記四段完成</button>':""}</div></div>
    </section>`;
  bindLearningVideos();
  goTop();
}

function bindLearningVideos(){
  document.querySelectorAll("[data-learning-video]").forEach(video=>{
    const index=Number(video.dataset.learningVideo);
    const complete=()=>markVideoComplete(index);
    video.addEventListener("ended",complete);
    video.addEventListener("timeupdate",()=>{if(video.duration&&video.currentTime/video.duration>=.9)complete();},{passive:true});
  });
}
function markVideoComplete(index){
  if(state.watched[index])return;
  state.watched[index]=true;
  if(allVideosDone())state.unlocked=Math.max(1,state.unlocked);
  saveState();
  notify(`第 ${index+1} 段影片學習完成！`);
  renderLearning();
}

function renderMap(){
  clearSession();
  const passed=state.scores.filter(score=>score===20).length;
  const finaleOpen=allLevelsDone()||state.teacherMode;
  app.innerHTML=`
    <section class="map-heading">
      <div><p class="eyebrow" style="color:var(--orange)">資源王國安全回收冒險島</p><h1>完包警收闖關地圖</h1><p>已通過 <b>${passed}/5</b>。沿著金色道路完成五個據點，中央安全回收城堡就會開門！</p></div>
      <div class="map-heading-actions"><button class="btn map-nav-video" data-action="learning">複習影片</button><button class="btn map-nav-home" data-action="home">回首頁</button></div>
    </section>
    <section class="adventure-map-shell" aria-label="高壓容器完包警收五關冒險地圖">
      <img class="adventure-map-bg" src="assets/map/adventure-map.png" alt="資源王國地圖，五個安全回收據點環繞中央城堡">
      <div class="adventure-map-overlay">
        ${levels.map(level=>{
        const open=isUnlocked(level.id),score=state.scores[level.id-1];
        const status=score===20?"已完成・20分":open?"點擊進入":"尚未解鎖";
        return `<button class="map-level-node node-${level.id} ${score===20?"done":""} ${open?"":"locked"}" data-level="${level.id}" ${open?"":"disabled"} aria-label="第${level.id}關 ${level.title}，${status}"><span class="map-level-thumb" style="background-image:url('assets/scenes/${level.image}')"><b>${score===20?"✓":level.id}</b></span><span class="map-level-copy"><small>LEVEL 0${level.id}</small><strong>${level.title}</strong><em>${status}</em></span></button>`;
      }).join("")}
        <button class="map-finale ${finaleOpen?"open":"locked"}" ${finaleOpen?'data-action="certificate"':"disabled"} aria-label="${finaleOpen?"進入中央城堡領取證書":"中央城堡尚未開啟"}"><span class="finale-shield">守</span><span><small>中央完成城堡</small><strong>${finaleOpen?"進入領取證書":"完成五關後開啟"}</strong></span></button>
      </div>
    </section>`;
  goTop();
}

function renderLevel(id){
  clearSession();
  const level=levels[id-1];
  if(!isUnlocked(id)){notify("這一關尚未解鎖。");renderMap();return;}
  const related=level.videos.map(videoId=>videos[videoId-1]);
  app.innerHTML=`
    <section class="level-hero"><img src="assets/scenes/${level.image}" alt="${level.title}動畫場景"><div class="level-hero-copy"><p class="eyebrow">LEVEL 0${id}｜${level.subtitle}</p><h1>${level.title}</h1><p class="lead">${level.goal}</p></div></section>
    <div class="level-layout">
      <section class="panel"><h2>任務前複習</h2><div class="video-stack">${related.map(video=>`<div><div class="video-box"><video controls playsinline preload="none" poster="assets/scenes/${video.poster}"><source src="videos/${video.file}" type="video/mp4"></video></div><p><b>${video.title}</b></p></div>`).join("")}</div></section>
      <aside class="panel lesson-card"><p class="eyebrow" style="color:var(--orange)">本關任務</p><h2>${level.goal}</h2><p><b>過關條件：</b>${level.pass}</p><ul><li>先讀完題目再作答。</li><li>答錯可從即時回饋學習。</li><li>實際處理一律交由成人。</li></ul><div class="action-row"><button class="btn btn-primary" data-action="start" data-level="${id}">開始任務</button><button class="btn btn-secondary" data-action="map">回闖關地圖</button></div></aside>
    </div>
    <section id="game-stage" class="panel game-stage hidden"></section>`;
  goTop();
}

function startGame(id){
  clearSession();
  const stage=document.querySelector("#game-stage");
  stage.classList.remove("hidden");
  stage.scrollIntoView({behavior:"smooth",block:"start"});
  if(id===1)startL1(stage);
  if(id===2)startL2(stage);
  if(id===3)startL3(stage);
  if(id===4)startL4(stage);
  if(id===5)startL5(stage);
}

const identifyQuestions=[
  {name:"卡式爐瓦斯罐",answer:true,why:"屬於常見高壓容器，應以完、包、警、收處理。",image:"scene-01-02.png"},
  {name:"噴漆高壓罐",answer:true,why:"罐內可能仍有壓力或殘留物。",image:"scene-01-02.png"},
  {name:"定型液噴霧罐",answer:true,why:"噴霧型定型液常使用高壓容器。",image:"scene-01-02.png"},
  {name:"防曬噴霧罐",answer:true,why:"噴霧式防曬產品可能是高壓容器。",image:"scene-01-02.png"},
  {name:"殺蟲劑噴霧罐",answer:true,why:"殺蟲噴霧是常見高壓容器。",image:"scene-01-02.png"},
  {name:"空氣清新噴霧罐",answer:true,why:"噴霧罐可能仍含壓力，應交由成人判斷。",image:"scene-01-02.png"},
  {name:"乾淨寶特瓶",answer:false,why:"寶特瓶是一般資源回收物，不是高壓容器。",image:"scene-02-01.png"},
  {name:"折好的紙箱",answer:false,why:"紙箱屬紙類，不是高壓容器。",image:"scene-02-01.png"},
  {name:"玻璃果醬罐",answer:false,why:"玻璃罐應依玻璃容器規定回收。",image:"scene-02-01.png"},
  {name:"塑膠飲料杯",answer:false,why:"塑膠飲料杯不是高壓容器。",image:"scene-02-01.png"},
  {name:"一般鋁製飲料罐",answer:false,why:"飲料鋁罐不是噴霧型高壓容器。",image:"scene-02-01.png"},
  {name:"牛奶紙盒",answer:false,why:"牛奶紙盒屬紙容器，不是高壓容器。",image:"scene-02-01.png"}
];
function startL1(stage){session={level:1,index:0,correct:0,questions:shuffle(identifyQuestions)};renderL1(stage);}
function renderL1(stage){
  const s=session;
  if(s.index>=s.questions.length){finishLevel(1,s.correct,12,10);return;}
  const q=s.questions[s.index];
  stage.innerHTML=`<div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">辨識挑戰</p><h2>這是廢高壓容器嗎？</h2></div><span class="status-chip">${s.index+1}/12・答對 ${s.correct}</span></div><div class="question-card"><div><span class="object-label">物品卡</span><h2>${q.name}</h2><p>請判斷是否要使用「完、包、警、收」的高壓容器回收方式。</p></div><div class="question-visual" style="background-image:url('assets/scenes/${q.image}')" role="img" aria-label="高壓容器辨識情境圖"></div></div><div class="choices"><button class="choice" data-identify="yes">是，高壓容器</button><button class="choice" data-identify="no">不是高壓容器</button></div><div id="feedback" class="feedback" aria-live="polite"></div>`;
}
function answerIdentify(value){
  const s=session,q=s.questions[s.index],answer=value==="yes",feedback=document.querySelector("#feedback");
  document.querySelectorAll("[data-identify]").forEach(button=>button.disabled=true);
  if(answer===q.answer){s.correct++;feedback.className="feedback good";feedback.textContent=`答對了！${q.why}`;}
  else{feedback.className="feedback bad";feedback.textContent=`正確答案是「${q.answer?"是":"不是"}」。${q.why}`;}
  setTimeout(()=>{s.index++;renderL1(document.querySelector("#game-stage"));},1050);
}

const safetyQuestions=[
  {q:"安安看到不明噴霧罐，停下來通知老師。",safe:true,e:"學生先停手、通知成人，是正確做法。"},
  {q:"小朋友拿起瓦斯罐搖一搖，想知道裡面還有沒有東西。",safe:false,e:"不可搖晃或自行檢查，應交由成人處理。"},
  {q:"平安老師把無法確認是否用完的容器另外放置。",safe:true,e:"不確定時先分開，避免與已確認用完者混放。"},
  {q:"為了讓罐子沒有壓力，用釘子刺一個洞。",safe:false,e:"不可刺穿高壓容器，可能造成洩漏、火災或受傷。"},
  {q:"成人依產品指示，在遠離火源、人群且通風的安全環境處理未用完內容物。",safe:true,e:"未用完者應由成人依產品指示安全處理。"},
  {q:"把高壓容器壓扁，可以節省回收空間。",safe:false,e:"高壓容器必須保持完整，不可擠壓或壓扁。"},
  {q:"老師發現容器外觀異常，先隔離並聯絡適當單位。",safe:true,e:"異常容器不應自行處理，應尋求專業協助。"},
  {q:"把不知道是否用完的噴霧罐直接丟入一般垃圾桶。",safe:false,e:"不可投入垃圾壓縮車，應先由成人確認並交付回收。"}
];
function startL2(stage){session={level:2,index:0,correct:0,questions:shuffle(safetyQuestions)};renderL2(stage);}
function renderL2(stage){
  const s=session;if(s.index>=s.questions.length){finishLevel(2,s.correct,8,6);return;}
  const q=s.questions[s.index];
  stage.innerHTML=`<div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">「完」安全判斷</p><h2>這個做法安全嗎？</h2></div><span class="status-chip">${s.index+1}/8・答對 ${s.correct}</span></div><div class="scene-card"><img src="assets/scenes/scene-01-03.png" alt="由成人確認高壓容器狀況"><div><span class="object-label">校園情境</span><h2>${q.q}</h2></div></div><div class="choices"><button class="choice" data-safety="safe">安全做法</button><button class="choice" data-safety="unsafe">不安全做法</button></div><div id="feedback" class="feedback" aria-live="polite"></div>`;
}
function answerSafety(value){
  const s=session,q=s.questions[s.index],answer=value==="safe",feedback=document.querySelector("#feedback");
  document.querySelectorAll("[data-safety]").forEach(button=>button.disabled=true);
  if(answer===q.safe){s.correct++;feedback.className="feedback good";feedback.textContent=`判斷正確！${q.e}`;}
  else{feedback.className="feedback bad";feedback.textContent=`再注意安全原則。${q.e}`;}
  setTimeout(()=>{s.index++;renderL2(document.querySelector("#game-stage"));},1100);
}

const packageMissions=[
  {title:"選擇正確包裝",q:"已確認用完的三個高壓容器，應該怎麼打包？",options:["與寶特瓶、紙類混成一袋","單獨放入透明袋並封好","直接散放在回收桶旁"],answer:1,e:"高壓容器應與其他回收物分開，單獨裝入透明袋。",image:"scene-02-02.png"},
  {title:"選擇正確警語",q:"透明袋外側應清楚寫上什麼？",options:["內有高壓瓶","一般垃圾，請壓縮","內容物不明，隨便處理"],answer:0,e:"醒目標示「內有高壓瓶」，讓回收人員提早注意。",image:"scene-03-03.png"},
  {title:"保持容器完整",q:"封好袋口後，哪一個做法正確？",options:["用腳踩扁節省空間","用尖銳物刺洞排壓","保持完整，不敲擊、不擠壓、不刺穿"],answer:2,e:"容器要保持完整，避免洩漏或其他危險。",image:"scene-02-03.png"}
];
function startL3(stage){session={level:3,index:0,correct:0};renderL3(stage);}
function renderL3(stage){
  const s=session;if(s.index>=packageMissions.length){finishLevel(3,s.correct,3,3);return;}
  const mission=packageMissions[s.index];
  stage.innerHTML=`<div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">包警任務室</p><h2>${mission.title}</h2></div><span class="status-chip">任務 ${s.index+1}/3</span></div><div class="mission-steps">${packageMissions.map((item,index)=>`<div class="mission-step ${index<s.index?"done":index===s.index?"active":""}">${index+1}. ${item.title}</div>`).join("")}</div><div class="scene-card"><img src="assets/scenes/${mission.image}" alt="${mission.title}情境圖"><div><span class="object-label">成人操作任務</span><h2>${mission.q}</h2><p>學生在安全線外觀察並說出正確方法。</p></div></div><div class="choices">${mission.options.map((option,index)=>`<button class="choice" data-package="${index}">${option}</button>`).join("")}</div><div id="feedback" class="feedback" aria-live="polite"></div>`;
}
function answerPackage(index){
  const s=session,mission=packageMissions[s.index],feedback=document.querySelector("#feedback");
  document.querySelectorAll("[data-package]").forEach(button=>button.disabled=true);
  if(index===mission.answer){s.correct++;feedback.className="feedback good";feedback.textContent=`任務完成！${mission.e}`;}
  else{feedback.className="feedback bad";feedback.textContent=`正確做法是「${mission.options[mission.answer]}」。${mission.e}`;}
  setTimeout(()=>{s.index++;renderL3(document.querySelector("#game-stage"));},1250);
}

const deliveryQuestions=[
  {q:"資源回收車與一般垃圾車同時到校，老師應將透明袋交給誰？",options:["資源回收人員","一般垃圾車司機","放在路邊即可"],answer:0,e:"應直接交給資源回收人員。",image:"scene-04-01.png"},
  {q:"交付透明袋時，老師還要做什麼？",options:["不必說明，轉身離開","口頭提醒袋內有高壓瓶","要求學生把袋子丟上車"],answer:1,e:"標示之外，再口頭提醒能讓回收人員更清楚。",image:"scene-04-02.png"},
  {q:"可以把高壓容器丟進一般垃圾壓縮車嗎？",options:["可以，車子會自動分類","不可以，壓縮可能造成危險","只要用黑袋裝就可以"],answer:1,e:"高壓容器不可進入垃圾壓縮車。",image:"scene-04-01.png"},
  {q:"小朋友在交付過程中的正確任務是什麼？",options:["自己搬運與投放","站在安全線後觀察並提醒大人","打開袋子再檢查一次"],answer:1,e:"學生以辨識、停手、通知及提醒為主，不自行搬運處理。",image:"scene-04-03.png"}
];
function startL4(stage){session={level:4,index:0,correct:0};renderL4(stage);}
function renderL4(stage){
  const s=session;if(s.index>=deliveryQuestions.length){finishLevel(4,s.correct,4,4);return;}
  const q=deliveryQuestions[s.index];
  stage.innerHTML=`<div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">資源回收交付站</p><h2>選出正確做法</h2></div><span class="status-chip">情境 ${s.index+1}/4</span></div><div class="scene-card"><img src="assets/scenes/${q.image}" alt="交付資源回收情境圖"><div><span class="object-label">情境判斷</span><h2>${q.q}</h2></div></div><div class="choices">${q.options.map((option,index)=>`<button class="choice" data-delivery="${index}">${option}</button>`).join("")}</div><div id="feedback" class="feedback" aria-live="polite"></div>`;
}
function answerDelivery(index){
  const s=session,q=deliveryQuestions[s.index],feedback=document.querySelector("#feedback");
  document.querySelectorAll("[data-delivery]").forEach(button=>button.disabled=true);
  if(index===q.answer){s.correct++;feedback.className="feedback good";feedback.textContent=`答對了！${q.e}`;}
  else{feedback.className="feedback bad";feedback.textContent=`正確做法是「${q.options[q.answer]}」。${q.e}`;}
  setTimeout(()=>{s.index++;renderL4(document.querySelector("#game-stage"));},1200);
}

const finalBank=[
  {q:"看到不明噴霧罐時，學生第一個動作是？",o:["停手並通知成人","拿起來搖一搖","丟進垃圾桶"],a:0,e:"先停手、找大人。"},
  {q:"「完」代表什麼？",o:["由成人確認使用完畢","把罐子壓扁","完成後丟垃圾車"],a:0,e:"先由成人確認是否使用完畢。"},
  {q:"高壓容器要和寶特瓶混在同一袋嗎？",o:["要，都是回收物","不要，應獨立打包","看袋子大小決定"],a:1,e:"高壓容器要單獨打包。"},
  {q:"「包」應使用哪種方式？",o:["透明袋獨立打包","黑袋混裝","不用袋子散放"],a:0,e:"透明袋方便辨識內容物。"},
  {q:"袋外正確警語是？",o:["內有高壓瓶","請用力壓扁","一般垃圾"],a:0,e:"清楚標示「內有高壓瓶」。"},
  {q:"下列哪個動作絕對不可以？",o:["保持完整","交給回收人員","刺穿容器"],a:2,e:"不可刺穿高壓容器。"},
  {q:"高壓容器應交給誰？",o:["資源回收人員","一般垃圾壓縮車","學生自己帶回家"],a:0,e:"由成人交給資源回收人員。"},
  {q:"正確順序是哪一個？",o:["完→包→警→收","包→收→完→警","警→完→收→包"],a:0,e:"正確順序是完、包、警、收。"},
  {q:"無法確認是否用完時，應該？",o:["先分開並請成人處理","直接丟垃圾桶","讓學生試噴"],a:0,e:"不確定時要分開並請成人處理。"},
  {q:"為了節省空間，可以踩扁高壓容器嗎？",o:["可以","不可以","只有老師可以"],a:1,e:"任何人都不應踩扁高壓容器。"},
  {q:"交付時只有警示卡就夠了嗎？",o:["最好再口頭提醒回收人員","不必讓人知道","應把卡片拿掉"],a:0,e:"標示加口頭提醒更安全。"},
  {q:"學生在本任務中最重要的角色是？",o:["辨識、停手、通知大人","自行排空內容物","刺洞檢查壓力"],a:0,e:"學生負責辨識、停手與通知成人。"},
  {q:"噴漆罐可能是高壓容器嗎？",o:["可能是","一定不是","只看顏色決定"],a:0,e:"噴漆罐是常見高壓容器。"},
  {q:"回收袋裡的容器應保持什麼狀態？",o:["完整、不變形","全部壓扁","全部刺洞"],a:0,e:"保持完整才能降低處理風險。"}
];
function startL5(stage){
  session={level:5,index:0,correct:0,questions:shuffle(finalBank).slice(0,10),seconds:60,timer:null,finished:false};
  session.timer=setInterval(()=>{if(!session||session.level!==5)return;session.seconds--;updateTimer();if(session.seconds<=0)finishTimed();},1000);
  renderL5(stage);
}
function updateTimer(){const label=document.querySelector("#timer-value"),wrap=document.querySelector(".timer");if(label)label.textContent=session.seconds;if(wrap)wrap.classList.toggle("urgent",session.seconds<=10);}
function renderL5(stage){
  const s=session;if(s.index>=s.questions.length){finishTimed();return;}
  const q=s.questions[s.index];
  stage.innerHTML=`<div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">終極安全挑戰</p><h2>${q.q}</h2></div><div class="timer"><span>剩餘時間</span><b id="timer-value">${s.seconds}</b></div></div><p class="instruction">第 ${s.index+1}/10 題・目前答對 ${s.correct} 題。答對 8 題即可過關。</p><div class="question-card"><div><span class="object-label">完包警收快問快答</span><h2>選出最安全、最正確的答案</h2></div><div class="question-visual" style="background-image:url('assets/scenes/scene-04-03.png')" role="img" aria-label="完包警收總結圖"></div></div><div class="choices">${q.o.map((option,index)=>`<button class="choice" data-final="${index}">${option}</button>`).join("")}</div><div id="feedback" class="feedback" aria-live="polite"></div>`;
}
function answerFinal(index){
  if(!session||session.finished)return;
  const s=session,q=s.questions[s.index],feedback=document.querySelector("#feedback");
  document.querySelectorAll("[data-final]").forEach(button=>button.disabled=true);
  if(index===q.a){s.correct++;feedback.className="feedback good";feedback.textContent=`答對了！${q.e}`;}
  else{feedback.className="feedback bad";feedback.textContent=`正確答案是「${q.o[q.a]}」。${q.e}`;}
  setTimeout(()=>{if(!session||session.finished)return;s.index++;renderL5(document.querySelector("#game-stage"));},650);
}
function finishTimed(){
  if(!session||session.finished)return;
  session.finished=true;clearInterval(session.timer);
  const correct=session.correct,total=10;
  finishLevel(5,correct,total,8);
}

function finishLevel(id,correct,total,passCount){
  if(session?.timer)clearInterval(session.timer);
  const level=levels[id-1],passed=correct>=passCount,score=passed?20:Math.round(correct/total*20);
  state.scores[id-1]=Math.max(state.scores[id-1],score);
  if(passed)state.unlocked=Math.max(state.unlocked,Math.min(5,id+1));
  saveState();
  const stage=document.querySelector("#game-stage");
  const certificateReady=allLevelsDone();
  const message=passed?(certificateReady?"五個安全關卡全部完成，你已通過完、包、警、收挑戰！":id===5?"第五關已通過！請回闖關地圖完成其餘關卡，才能取得證書。":"下一關已經解鎖。") : "先複習動畫與回饋，再挑戰一次。";
  stage.innerHTML=`<div class="result-card"><p class="eyebrow" style="color:var(--orange)">${passed?"任務成功":"再接再厲"}</p><div class="stars">${passed?"★ ★ ★":"★ ☆ ☆"}</div><h2>${passed?`第 ${id} 關過關！`:"差一點就成功！"}</h2><div class="result-score">${score}<small style="font-size:.25em"> / 20</small></div><p class="lead" style="margin-inline:auto">答對 ${correct}/${total}。${message}</p><div class="action-row" style="justify-content:center"><button class="btn btn-primary" data-action="${certificateReady?"certificate":"map"}">${certificateReady?"領取達人證書":"回闖關地圖"}</button><button class="btn btn-secondary" data-action="start" data-level="${id}">再玩一次</button></div></div>`;
}

function renderCertificate(){
  clearSession();
  if(!allLevelsDone()){notify("請先完成五個安全關卡並全部過關，才能取得證書。");return renderMap();}
  const total=state.scores.reduce((sum,n)=>sum+n,0);
  app.innerHTML=`<section class="certificate-shell">
    <article class="certificate pressure-certificate" aria-label="資源王國安全守護者證書">
      <header class="certificate-header"><p>資源王國・完包警收大冒險</p><h1>安全回收守護者證書</h1><span>完成四段動畫與五關安全任務</span></header>
      <div class="certificate-content">
        <p class="certificate-lead">茲證明</p>
        <div class="name-panel"><label for="hero-name">請輸入安全守護者姓名</label><input id="hero-name" class="name-input" maxlength="20" value="${escapeHtml(state.name)}" aria-label="學生姓名或暱稱"></div>
        <p class="certificate-story">完成資源王國五項挑戰，能辨識廢高壓容器，知道學生應先停手、通知成人，並能說出正確的安全回收口訣，特頒此證。</p>
        <div class="certificate-steps"><span><b>完</b>確認用完</span><span><b>包</b>獨立打包</span><span><b>警</b>標示警語</span><span><b>收</b>交付回收</span></div>
        <div class="certificate-award"><span>獲得稱號</span><strong>高壓容器安全回收達人</strong><em>總積分 ${total} / 100</em></div>
        <p class="certificate-slogan">完、包、警、收，安全回收一起守！</p>
      </div>
      <footer class="certificate-footer"><span>安全回收學習任務</span><b>守守盾認證</b><span id="certificate-date"></span></footer>
    </article>
    <div class="certificate-controls no-print"><p>下載時請在列印視窗選擇「儲存為 PDF」，紙張設為 A4、方向選擇橫向，背景圖形請保持開啟。</p><div class="action-row"><button class="btn certificate-download" data-action="print">下載單張 A4 證書</button><button class="btn map-nav-map" data-action="map">回闖關地圖</button><button class="btn map-nav-home" data-action="home">回首頁</button></div></div>
  </section>`;
  const input=document.querySelector("#hero-name");input.addEventListener("input",()=>{state.name=input.value;saveState();});
  document.querySelector("#certificate-date").textContent=new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"long",day:"numeric"}).format(new Date());
  goTop();
}

function renderGuide(){
  clearSession();
  app.innerHTML=`<section class="level-hero"><img src="assets/scenes/scene-01-02.png" alt="平安老師進行高壓容器安全教學"><div class="level-hero-copy"><p class="eyebrow">教師教學建議</p><h1>一節課即可操作</h1><p class="lead">建議 35～45 分鐘，以全班觀看、個人或小組闖關、口頭統整三階段進行。</p></div></section><section class="section panel"><h2>教具與網頁使用方式</h2><div class="step-ribbon"><div class="step-chip"><b>1</b><span>課前準備</span><small>投影設備、學生平板或電腦</small></div><div class="step-chip"><b>2</b><span>動畫學習</span><small>四段約 4 分鐘，可分段提問</small></div><div class="step-chip"><b>3</b><span>五關闖關</span><small>個人操作或兩人共用一機</small></div><div class="step-chip"><b>4</b><span>統整展示</span><small>證書、口訣與校園實踐</small></div></div><div class="safety-strip"><div class="safety-note"><b>教師引導語</b><span>「如果你看到不明噴霧罐，第一件事不是拿起來，而是停下來找大人。」</span></div><div class="safety-note"><b>學生任務</b><span>觀看、回答、辨識、說出口訣；不安排實物拆解或排空操作。</span></div><div class="safety-note"><b>評量方式</b><span>五關各 20 分；80 分以上能掌握核心概念，100 分可領取證書。</span></div></div><h2>建議教學流程</h2><div class="mission-steps"><div class="mission-step active">5 分鐘<br>導入與安全提醒</div><div class="mission-step active">10 分鐘<br>觀看四段影片</div><div class="mission-step active">20 分鐘<br>五關闖關</div></div><div class="mission-steps"><div class="mission-step active">5 分鐘<br>完包警收口訣</div><div class="mission-step active">5 分鐘<br>分享與證書展示</div><div class="mission-step active">延伸<br>檢視校園回收區</div></div><p class="instruction"><b>重要：</b>不要使用真實高壓容器讓學生進行刺穿、排空、壓扁或測試。若校園發現異常、膨脹、鏽蝕或洩漏容器，應隔離現場並聯絡專業人員。</p><div class="action-row"><button class="btn btn-primary" data-action="home">回首頁</button><button class="btn btn-secondary" data-action="learning">前往影片學習站</button></div></section>`;
  goTop();
}

document.addEventListener("click",event=>{
  const actionButton=event.target.closest("[data-action]");
  if(actionButton){
    const action=actionButton.dataset.action;
    if(action==="home")renderHome();
    if(action==="learning")renderLearning();
    if(action==="map")renderMap();
    if(action==="guide")renderGuide();
    if(action==="certificate")renderCertificate();
    if(action==="print")window.print();
    if(action==="start")startGame(Number(actionButton.dataset.level));
    if(action==="mark-all-videos"){state.watched=[true,true,true,true];state.unlocked=Math.max(1,state.unlocked);saveState();renderLearning();}
    if(action==="reset"&&confirm("確定要清除影片、關卡與證書進度嗎？")){state=defaultState();saveState();renderHome();notify("本機進度已清除。");}
    return;
  }
  const levelButton=event.target.closest("[data-level]");if(levelButton){renderLevel(Number(levelButton.dataset.level));return;}
  const identify=event.target.closest("[data-identify]");if(identify){answerIdentify(identify.dataset.identify);return;}
  const safety=event.target.closest("[data-safety]");if(safety){answerSafety(safety.dataset.safety);return;}
  const packageButton=event.target.closest("[data-package]");if(packageButton){answerPackage(Number(packageButton.dataset.package));return;}
  const delivery=event.target.closest("[data-delivery]");if(delivery){answerDelivery(Number(delivery.dataset.delivery));return;}
  const final=event.target.closest("[data-final]");if(final){answerFinal(Number(final.dataset.final));}
});

document.addEventListener("change",event=>{
  if(event.target.id==="teacher-mode"){state.teacherMode=event.target.checked;saveState();notify(state.teacherMode?"教師快速預覽已開啟。":"教師快速預覽已關閉。");renderHome();}
});

updateHeader();
renderHome();
