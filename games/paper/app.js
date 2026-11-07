"use strict";

const STORAGE_KEY = "paperAdventureProgressV1";
const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const scoreEl = document.querySelector("#header-score");
const VIDEO_ROOT = "https://raw.githubusercontent.com/cew123452000-Abby/recycle-squad-yilan/main/games/paper/videos/";
const videoUrl = file => VIDEO_ROOT + encodeURIComponent(file);
let levelSession = null;
let timerId = null;

const levels = [
  { id: 1, title: "紙類偵探社", subtitle: "認識與辨識", image: "scene-01-06.png", video: "01-紙類家族大集合.mp4", goal: "分清一般廢紙、廢紙容器與其他物品", pass: "10 題答對 8 題以上" },
  { id: 2, title: "髒髒紙杯變乾淨", subtitle: "清潔與整理", image: "scene-02-07.png", video: "02-紙容器洗澡大作戰.mp4", goal: "依序完成清空、清潔、瀝乾與分類", pass: "完成 3 種紙容器流程" },
  { id: 3, title: "回收桶大作戰", subtitle: "分類與貯放", image: "scene-03-07.png", video: "03-回收物找新家.mp4", goal: "把紙類、紙容器和其他資源分開貯放", pass: "12 件答對 10 件以上" },
  { id: 4, title: "校園回收糾察隊", subtitle: "情境判斷", image: "scene-04-06.png", video: "04-校園回收糾察隊.mp4", goal: "找出校園中的回收錯誤並提出改善方法", pass: "找出 3 個錯誤並正確改善" },
  { id: 5, title: "終極回收王", subtitle: "綜合應用", image: "scene-05-08.png", video: "05-拯救資源王國.mp4", goal: "在 60 秒內完成綜合回收任務", pass: "正確率達 80%" }
];

const defaultState = () => ({ unlocked: 1, scores: [0,0,0,0,0], attempts: [0,0,0,0,0], teacherMode: false, name: "回收小勇士" });
let state = loadState();

function loadState() {
  try { return { ...defaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return defaultState(); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); updateHeader(); }
function updateHeader() { scoreEl.textContent = state.scores.reduce((a,b) => a+b, 0); }
function notify(message) { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2200); }
function clearTimer() { if (timerId) clearInterval(timerId); timerId = null; }
function shuffle(items) { return [...items].sort(() => Math.random() - .5); }
function isUnlocked(id) { return state.teacherMode || id <= state.unlocked; }
function allLevelsDone() { return state.scores.length === levels.length && state.scores.every(score => score === 20); }
function scrollTop() { window.scrollTo({ top: 0, behavior: "smooth" }); app.focus({ preventScroll: true }); }

function renderHome() {
  clearTimer(); levelSession = null; updateHeader();
  const total = state.scores.reduce((a,b) => a+b, 0);
  const done = state.scores.filter(score => score === 20).length;
  app.innerHTML = `
    <section class="hero">
      <img src="assets/scenes/scene-05-07.png" alt="小紙與回收博士在恢復綠意的資源王國前慶祝">
      <div class="hero-copy">
        <p class="eyebrow">五關互動學習任務</p>
        <h1>拯救資源王國</h1>
        <p class="lead">跟著回收小勇士看動畫、解任務，把紙類和紙容器送回正確的家！</p>
        <div class="action-row">
          <button class="btn btn-primary" data-action="continue">${done ? "繼續冒險" : "開始第一關"}</button>
          ${allLevelsDone() ? '<button class="btn btn-secondary" data-action="certificate">查看達人證書</button>' : ""}
        </div>
      </div>
    </section>
    <section class="dashboard">
      <div class="panel">
        <div class="stage-head">
          <div><p class="eyebrow" style="color:var(--orange)">冒險地圖</p><h2>五大互動關卡</h2></div>
          <span class="status-chip">${done}/5 關完成</span>
        </div>
        <div class="progress-track" aria-label="總進度 ${total}%"><div class="progress-fill" style="width:${total}%"></div></div>
        <div class="level-grid">
          ${levels.map(level => {
            const unlocked = isUnlocked(level.id); const score = state.scores[level.id-1]; const completed = score === 20;
            return `<article class="level-card ${completed ? "done" : ""} ${unlocked ? "" : "locked"}">
              <span class="level-no">LEVEL 0${level.id}</span><h3>${level.title}</h3><p>${level.subtitle}</p>
              <button class="btn ${completed ? "btn-secondary" : "btn-primary"}" data-level="${level.id}" ${unlocked ? "" : "disabled aria-label='尚未解鎖'"}>${completed ? `已完成・${score}分` : score ? `再挑戰・目前${score}分` : unlocked ? "進入關卡" : "尚未解鎖"}</button>
            </article>`;
          }).join("")}
        </div>
      </div>
      <aside class="panel">
        <h2 style="font-size:1.5rem">勇士小提醒</h2>
        <ul class="mini-list"><li>先看動畫，再開始任務。</li><li>答錯別擔心，回饋會告訴你原因。</li><li>每關滿分 20 分，共 100 分。</li></ul>
        <p class="privacy-note"><b>隱私安全：</b>進度與暱稱只保存在這個瀏覽器，不會上傳。</p>
        <div class="action-row no-print">
          <button class="btn btn-quiet" data-action="teacher">${state.teacherMode ? "關閉教師預覽" : "教師預覽：解鎖全部"}</button>
          <button class="btn btn-danger" data-action="reset">重設學習進度</button>
        </div>
      </aside>
    </section>`;
  scrollTop();
}

function renderLevel(id) {
  if (!isUnlocked(id)) { notify("請先完成前一關喔！"); return renderHome(); }
  clearTimer(); levelSession = null;
  const level = levels[id-1];
  app.innerHTML = `
    <section class="level-hero">
      <img src="assets/scenes/${level.image}" alt="${level.title}動畫場景">
      <div class="level-hero-copy"><p class="eyebrow">LEVEL 0${id}｜${level.subtitle}</p><h1>${level.title}</h1><p class="lead">${level.goal}</p></div>
    </section>
    <div class="level-layout">
      <section class="panel"><h2>任務動畫</h2><div class="video-box"><video controls playsinline preload="none" poster="assets/scenes/${level.image}"><source src="${videoUrl(level.video)}" type="video/mp4">你的瀏覽器無法播放影片。</video></div><p style="margin:.8rem 0 0;color:var(--muted)">影片已包含中文配音與繁體中文字幕。</p></section>
      <aside class="panel lesson-card"><p class="eyebrow" style="color:var(--orange)">本關任務</p><h2 style="font-size:1.5rem">${level.goal}</h2><p><b>過關條件：</b>${level.pass}</p><div class="action-row"><button class="btn btn-primary" data-action="start-game" data-level="${id}">看完了，開始任務</button><button class="btn btn-secondary" data-action="home">回冒險地圖</button></div></aside>
    </div>
    <section id="game-stage" class="panel game-stage hidden"></section>`;
  scrollTop();
}

function startGame(id) {
  const stage = document.querySelector("#game-stage"); stage.classList.remove("hidden"); stage.scrollIntoView({ behavior: "smooth", block: "start" });
  state.attempts[id-1] += 1; saveState();
  if (id === 1) startLevel1(stage); if (id === 2) startLevel2(stage); if (id === 3) startLevel3(stage); if (id === 4) startLevel4(stage); if (id === 5) startLevel5(stage);
}

const level1Items = [
  ["報紙","📰","paper"],["影印紙","📄","paper"],["紙箱","📦","paper"],["筆記本紙張","📃","paper"],
  ["紙杯","🥤","container"],["紙餐盒","🍱","container"],["牛奶鋁箔包","🧃","container"],
  ["塑膠杯","🥛","other"],["寶特瓶","🧴","other"],["使用過的衛生紙","🧻","other"]
];
const categoryNames = { paper:"一般廢紙", container:"廢紙容器", other:"其他類" };

function startLevel1(stage) {
  levelSession = { level:1, index:0, correct:0, items:shuffle(level1Items) };
  renderL1(stage);
}
function renderL1(stage) {
  const s = levelSession;
  if (s.index >= s.items.length) return finishLevel(1, s.correct, 10, 8);
  const [name, icon] = s.items[s.index];
  stage.innerHTML = `<div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">點擊分類</p><h2>誰才是真正的紙類家族？</h2></div><span class="status-chip">${s.index+1}/10・答對 ${s.correct}</span></div>
    <p class="instruction">請判斷「${name}」應該分到哪一類。</p><div class="item-card" style="font-size:1.25rem"><span class="item-icon">${icon}</span>${name}</div>
    <div class="category-buttons">${Object.entries(categoryNames).map(([key,label]) => `<button class="zone ${key === "paper" ? "green" : key === "container" ? "blue" : "orange"}" data-l1-answer="${key}">${label}</button>`).join("")}</div><div class="feedback" id="feedback"></div>`;
}
function answerL1(answer) {
  const s = levelSession; const correct = s.items[s.index][2]; const fb = document.querySelector("#feedback");
  document.querySelectorAll("[data-l1-answer]").forEach(b => b.disabled = true);
  if (answer === correct) { s.correct++; fb.className="feedback good"; fb.textContent="答對了！分類清楚，回收才有效率。"; }
  else { fb.className="feedback bad"; fb.textContent=`再記一次：${s.items[s.index][0]}屬於「${categoryNames[correct]}」。`; }
  setTimeout(() => { s.index++; renderL1(document.querySelector("#game-stage")); }, 950);
}

const processRounds = ["紙杯", "紙餐盒", "牛奶鋁箔包"];
const correctSteps = ["清空內容物", "簡易清潔", "瀝乾水分", "分類回收"];
const wrongSteps = ["沒喝完就回收", "油膩直接堆疊"];
function startLevel2(stage) { levelSession={level:2,round:0,selected:[],mistakes:0}; renderL2(stage); }
function renderL2(stage) {
  const s=levelSession;
  if (s.round >= 3) return finishLevel(2, 3, 3, 3);
  const cards=shuffle([...correctSteps,...wrongSteps]);
  stage.innerHTML=`<div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">步驟排序</p><h2>幫${processRounds[s.round]}做好回收準備</h2></div><span class="status-chip">第 ${s.round+1}/3 種</span></div>
    <p class="instruction">依正確順序點選 4 個步驟。選到錯誤做法時，請換一張。</p>
    <div class="sequence">${[0,1,2,3].map(i=>`<div class="sequence-slot" id="slot-${i}">${i+1}</div>`).join("")}</div>
    <div class="step-pool">${cards.map(step=>`<button class="step-card ${wrongSteps.includes(step)?"wrong":""}" data-step="${step}">${step}</button>`).join("")}</div><div class="feedback" id="feedback"></div>`;
}
function pickStep(step, button) {
  const s=levelSession; const fb=document.querySelector("#feedback"); const expected=correctSteps[s.selected.length];
  if (wrongSteps.includes(step)) { s.mistakes++; fb.className="feedback bad"; fb.textContent="這是錯誤做法！紙容器要先清空並簡易清潔。"; button.disabled=true; return; }
  if (step !== expected) { s.mistakes++; fb.className="feedback bad"; fb.textContent=`順序還要調整：第 ${s.selected.length+1} 步應該先「${expected}」。`; return; }
  s.selected.push(step); button.disabled=true; document.querySelector(`#slot-${s.selected.length-1}`).textContent=step; fb.className="feedback good"; fb.textContent="順序正確，繼續！";
  if (s.selected.length===4) setTimeout(()=>{s.round++;s.selected=[];renderL2(document.querySelector("#game-stage"));},900);
}

const level3Items = [
  ["報紙","📰","paper"],["影印紙","📄","paper"],["紙箱","📦","paper"],["筆記本紙張","📃","paper"],
  ["紙杯","🥤","container"],["紙便當盒","🍱","container"],["牛奶鋁箔包","🧃","container"],["紙碗","🥣","container"],
  ["寶特瓶","🧴","resource"],["塑膠杯","🥛","resource"],["鋁罐","🥫","resource"],["玻璃瓶","🍶","resource"]
];
const zoneNames={paper:"一般廢紙區",container:"廢紙容器區",resource:"其他資源回收區"};
function startLevel3(stage){levelSession={level:3,items:shuffle(level3Items),selected:null,answered:0,correct:0};renderL3(stage);}
function renderL3(stage){const s=levelSession;stage.innerHTML=`<div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">選物品，再點回收區</p><h2>送每件物品回正確的家</h2></div><span class="status-chip">完成 ${s.answered}/12・答對 ${s.correct}</span></div>
  <p class="instruction">先點一張物品卡，再點下方正確的貯放區。紙杯和紙餐盒不能混入一般廢紙喔！</p>
  <div class="items">${s.items.map((it,i)=>`<button class="item-card" data-item="${i}"><span class="item-icon">${it[1]}</span>${it[0]}</button>`).join("")}</div>
  <div class="zones">${Object.entries(zoneNames).map(([k,v])=>`<button class="zone ${k==="paper"?"green":k==="container"?"blue":"orange"}" data-zone="${k}">${v}</button>`).join("")}</div><div class="feedback" id="feedback"></div>`;}
function selectL3Item(i){const s=levelSession;if(s.items[i][3])return;s.selected=i;document.querySelectorAll("[data-item]").forEach((b,j)=>b.classList.toggle("selected",j===i));}
function answerL3(zone){const s=levelSession,fb=document.querySelector("#feedback");if(s.selected===null){fb.className="feedback bad";fb.textContent="請先選一張物品卡。";return;}const item=s.items[s.selected];const btn=document.querySelector(`[data-item='${s.selected}']`);item[3]=true;btn.classList.remove("selected");btn.classList.add("answered");btn.disabled=true;s.answered++;if(zone===item[2]){s.correct++;fb.className="feedback good";fb.textContent=`答對了！${item[0]}回到「${zoneNames[zone]}」。`;}else{fb.className="feedback bad";fb.textContent=`${item[0]}應該放在「${zoneNames[item[2]]}」。`;}s.selected=null;document.querySelector(".status-chip").textContent=`完成 ${s.answered}/12・答對 ${s.correct}`;if(s.answered===12)setTimeout(()=>finishLevel(3,s.correct,12,10),900);}

const scenarios=[
  {img:"scene-04-02.png",text:"小明把沒喝完的牛奶鋁箔包直接丟進回收桶。",error:true,fix:"先清空、簡易清潔並瀝乾",options:["先清空、簡易清潔並瀝乾","直接壓扁就好","和報紙綁在一起"]},
  {img:"scene-04-03.png",text:"小華把乾淨影印紙與紙餐盒混在一起。",error:true,fix:"一般廢紙和紙容器分開貯放",options:["一般廢紙和紙容器分開貯放","全部丟一般垃圾","只要乾淨就能混放"]},
  {img:"scene-04-04.png",text:"小美將清潔瀝乾的紙杯放入紙容器回收區。",error:false,fix:"這個做法正確",options:["這個做法正確","應改放一般廢紙區","應倒入水後再回收"]},
  {img:"scene-04-05.png",text:"小安把沾有食物的衛生紙丟入一般廢紙區。",error:true,fix:"依規定放入一般垃圾，不混入廢紙",options:["依規定放入一般垃圾，不混入廢紙","擦乾後放入廢紙區","放入紙容器區"]}
];
function startLevel4(stage){levelSession={level:4,solved:new Set(),errorsFound:0,correct:0};renderL4(stage);}
function renderL4(stage){const s=levelSession;stage.innerHTML=`<div class="stage-head"><div><p class="eyebrow" style="color:var(--orange)">圖片找錯</p><h2>校園回收糾察隊</h2></div><span class="status-chip">完成 ${s.solved.size}/4</span></div><p class="instruction">閱讀四個情境，選出正確的改善方法。其中有一個人的做法本來就是正確的。</p><div class="scenario-grid">${scenarios.map((sc,i)=>`<article class="scenario-card ${s.solved.has(i)?"solved":""}"><img src="assets/scenes/${sc.img}" alt="校園回收情境 ${i+1}"><div class="scenario-copy"><b>${sc.text}</b><div class="fix-options">${shuffle(sc.options).map(opt=>`<button class="choice" data-scenario="${i}" data-fix="${opt}" ${s.solved.has(i)?"disabled":""}>${opt}</button>`).join("")}</div></div></article>`).join("")}</div><div class="feedback" id="feedback"></div>`;}
function answerScenario(i,fix){const s=levelSession,sc=scenarios[i],fb=document.querySelector("#feedback");if(s.solved.has(i))return;if(fix===sc.fix){s.solved.add(i);s.correct++;if(sc.error)s.errorsFound++;fb.className="feedback good";fb.textContent=sc.error?"找到了！這個錯誤已經正確改善。":"判斷正確！清潔瀝乾後放入紙容器區。";renderL4(document.querySelector("#game-stage"));const newFb=document.querySelector("#feedback");newFb.className="feedback good";newFb.textContent=fb.textContent;if(s.solved.size===4)setTimeout(()=>finishLevel(4,s.correct,4,4),900);}else{fb.className="feedback bad";fb.textContent="這個改善方法不適合，再想想影片中的回收原則。";}}

const quizBank=[
  {q:"喝完並清潔瀝乾的牛奶鋁箔包，應放哪裡？",a:"廢紙容器回收區",o:["一般廢紙區","廢紙容器回收區","一般垃圾桶"]},
  {q:"紙容器回收前的第一步是什麼？",a:"清空內容物",o:["清空內容物","直接壓平","和報紙混放"]},
  {q:"下列哪一項屬於一般廢紙？",a:"乾淨影印紙",o:["乾淨影印紙","用過的紙杯","使用過的衛生紙"]},
  {q:"清潔紙容器後，下一個重要步驟是什麼？",a:"瀝乾水分",o:["裝滿水","瀝乾水分","沾上油漬"]},
  {q:"紙杯上有「紙」字，應和報紙放一起嗎？",a:"不應該，要放紙容器區",o:["應該，都是紙","不應該，要放紙容器區","隨便一區都可以"]},
  {q:"沾有食物的使用過衛生紙，應怎麼處理？",a:"依規定放一般垃圾",o:["放一般廢紙區","放紙容器區","依規定放一般垃圾"]},
  {q:"小華把紙餐盒和影印紙混放，正確改善是？",a:"分開貯放",o:["分開貯放","用水泡在一起","全部丟垃圾"]},
  {q:"下列哪一項屬於其他資源回收？",a:"寶特瓶",o:["寶特瓶","報紙","紙餐盒"]},
  {q:"油膩餐盒可以直接堆進回收桶嗎？",a:"不可以，要先清空並簡易清潔",o:["可以，越快越好","不可以，要先清空並簡易清潔","只要蓋起來就好"]},
  {q:"回收物分類後，還要做到什麼？",a:"依類別分開貯放",o:["全部混在大袋子","依類別分開貯放","帶回教室堆放"]},
  {q:"乾淨紙箱應放哪裡？",a:"一般廢紙區",o:["一般廢紙區","紙容器區","廚餘桶"]},
  {q:"完成紙容器整理的正確順序是？",a:"清空、清潔、瀝乾、分類",o:["分類、裝水、堆疊、丟棄","清空、清潔、瀝乾、分類","瀝乾、裝滿、混放、清空"]}
];
function startLevel5(stage){levelSession={level:5,questions:shuffle(quizBank).slice(0,10),index:0,correct:0,time:60};renderL5(stage);timerId=setInterval(()=>{levelSession.time--;const el=document.querySelector("#timer");if(el){el.textContent=levelSession.time;el.classList.toggle("urgent",levelSession.time<=10);}if(levelSession.time<=0){clearTimer();finishLevel(5,levelSession.correct,10,8,true);}},1000);}
function renderL5(stage){const s=levelSession;if(s.index>=10){clearTimer();return finishLevel(5,s.correct,10,8);}const item=s.questions[s.index];stage.innerHTML=`<div class="quiz-top"><div><p class="eyebrow" style="color:var(--orange)">60 秒綜合挑戰</p><h2>第 ${s.index+1} 題：${item.q}</h2><p>目前答對 ${s.correct} 題</p></div><div id="timer" class="timer ${s.time<=10?"urgent":""}" aria-label="剩餘秒數">${s.time}</div></div><div class="choices">${shuffle(item.o).map(opt=>`<button class="choice" data-quiz="${opt}">${opt}</button>`).join("")}</div><div class="feedback" id="feedback"></div>`;}
function answerQuiz(answer){const s=levelSession,item=s.questions[s.index],fb=document.querySelector("#feedback");document.querySelectorAll("[data-quiz]").forEach(b=>b.disabled=true);if(answer===item.a){s.correct++;fb.className="feedback good";fb.textContent="答對了！終極回收王向前衝！";}else{fb.className="feedback bad";fb.textContent=`正確答案是：「${item.a}」。`;}setTimeout(()=>{s.index++;renderL5(document.querySelector("#game-stage"));},650);}

function finishLevel(id, correct, total, passCount, timedOut=false) {
  clearTimer(); const passed=correct>=passCount; const score=passed?20:Math.round(correct/total*20); state.scores[id-1]=Math.max(state.scores[id-1],score);
  if(passed) state.unlocked=Math.max(state.unlocked,Math.min(5,id+1)); saveState();
  const stage=document.querySelector("#game-stage"); if(!stage)return;
  const certificateReady=allLevelsDone();
  const resultMessage=passed?(certificateReady?"五大任務全部完成，資源王國恢復光彩！":id===5?"第五關已通過！請回冒險地圖完成其餘關卡，才能取得證書。":"下一關已經解鎖。") : "再看一次動畫提示，重新挑戰就會更進步。";
  stage.innerHTML=`<div class="result-card"><p class="eyebrow" style="color:var(--orange)">${passed?"任務成功":"再接再厲"}</p><div class="stars" aria-hidden="true">${passed?"★ ★ ★":"★ ☆ ☆"}</div><h2>${passed?`第 ${id} 關過關！`:timedOut?"時間到！":"差一點就成功！"}</h2><div class="result-score">${score}<small style="font-size:.25em"> / 20</small></div><p class="lead" style="margin-inline:auto">答對 ${correct}/${total}。${resultMessage}</p><div class="action-row" style="justify-content:center"><button class="btn btn-primary" data-action="${certificateReady?"certificate":"home"}">${certificateReady?"領取達人證書":"回冒險地圖"}</button><button class="btn btn-secondary" data-action="start-game" data-level="${id}">再玩一次</button></div></div>`;
}

function renderCertificate() {
  clearTimer();
  if(!allLevelsDone()){notify("請先完成五個關卡並全部過關，才能取得證書。");return renderHome();}
  const total=state.scores.reduce((a,b)=>a+b,0);
  app.innerHTML=`<section class="certificate-shell">
    <article class="certificate paper-certificate" aria-label="紙類回收達人證書">
      <header class="certificate-header"><p>資源王國榮譽頒發</p><h1>紙類回收達人證書</h1><span>完成五段動畫與五大回收任務</span></header>
      <div class="certificate-content">
        <p class="certificate-lead">茲證明</p>
        <div class="name-panel"><label for="hero-name">請輸入勇士姓名</label><input id="hero-name" class="name-input" maxlength="20" value="${escapeHtml(state.name)}" aria-label="勇士姓名或暱稱"></div>
        <p class="certificate-story">完成「紙類回收大冒險」五大關卡，能正確辨識一般廢紙與紙容器，並做到整理、分類及分開貯放，特頒此證。</p>
        <p class="stars" aria-label="五顆星">★ ★ ★ ★ ★</p>
        <div class="certificate-award"><span>獲得稱號</span><strong>資源王國紙類回收達人</strong><em>總積分 ${total} / 100</em></div>
        <p class="certificate-slogan">紙類辨清楚，容器先整理，分類分開放，回收我最棒！</p>
      </div>
      <footer class="certificate-footer"><span>紙類回收學習任務</span><b>回收博士認證</b><span id="certificate-date"></span></footer>
    </article>
    <div class="certificate-controls no-print"><p>下載時請在列印視窗選擇「儲存為 PDF」，紙張設為 A4、方向選擇橫向，背景圖形請保持開啟。</p><div class="action-row"><button class="btn btn-primary certificate-download" data-action="print">下載單張 A4 證書</button><button class="btn btn-secondary" data-action="home">回冒險地圖</button></div></div>
  </section>`;
  document.querySelector("#certificate-date").textContent=new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"long",day:"numeric"}).format(new Date());
  scrollTop();
}
function escapeHtml(text){const d=document.createElement("div");d.textContent=text;return d.innerHTML;}

document.addEventListener("click", e => {
  const action=e.target.closest("[data-action]")?.dataset.action;
  if(action==="home")renderHome();
  if(action==="continue"){const next=state.scores.findIndex(v=>v!==20)+1;renderLevel(next||5);}
  if(action==="teacher"){state.teacherMode=!state.teacherMode;saveState();notify(state.teacherMode?"教師預覽已解鎖全部關卡":"已恢復學生依序闖關模式");renderHome();}
  if(action==="reset"&&confirm("確定要清除這台裝置上的所有闖關進度嗎？")){state=defaultState();saveState();renderHome();notify("學習進度已重設");}
  if(action==="start-game")startGame(Number(e.target.closest("[data-level]").dataset.level));
  if(action==="certificate")renderCertificate();
  if(action==="print"){const input=document.querySelector("#hero-name");state.name=input.value.trim()||"回收小勇士";saveState();window.print();}
  const level=e.target.closest("[data-level]")?.dataset.level;if(level&&!action)renderLevel(Number(level));
  const l1=e.target.closest("[data-l1-answer]")?.dataset.l1Answer;if(l1)answerL1(l1);
  const step=e.target.closest("[data-step]");if(step)pickStep(step.dataset.step,step);
  const item=e.target.closest("[data-item]")?.dataset.item;if(item!==undefined)selectL3Item(Number(item));
  const zone=e.target.closest("[data-zone]")?.dataset.zone;if(zone)answerL3(zone);
  const scenario=e.target.closest("[data-scenario]");if(scenario)answerScenario(Number(scenario.dataset.scenario),scenario.dataset.fix);
  const quiz=e.target.closest("[data-quiz]")?.dataset.quiz;if(quiz)answerQuiz(quiz);
});
document.addEventListener("change",e=>{if(e.target.id==="hero-name"){state.name=e.target.value.trim()||"回收小勇士";saveState();}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&levelSession)renderHome();});

updateHeader(); renderHome();
