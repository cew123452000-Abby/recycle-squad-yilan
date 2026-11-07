"use strict";

const STORAGE = {
  paper: "paperAdventureProgressV1",
  tableware: "tablewareCleanSortStackV1",
  pressure: "pressureContainerSafetyQuestV1",
  teacher: "recycleSquadTeacherPreviewV1"
};

const missionLabels = {
  paper: { open: "前往頭城任務", done: "再次挑戰頭城任務" },
  tableware: { open: "前往五結任務", done: "再次挑戰五結任務" },
  pressure: { open: "前往蘇澳任務", done: "再次挑戰蘇澳任務" }
};

function readState(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); }
  catch { return {}; }
}

function scoresComplete(key, count, total) {
  const scores = readState(key).scores;
  return Array.isArray(scores) && scores.length === count && scores.reduce((sum, value) => sum + Number(value || 0), 0) >= total;
}

function getProgress() {
  return {
    paper: scoresComplete(STORAGE.paper, 5, 100),
    tableware: scoresComplete(STORAGE.tableware, 3, 100),
    pressure: scoresComplete(STORAGE.pressure, 5, 100)
  };
}

function setNode(name, isOpen, isDone, lockedText) {
  const node = document.querySelector(`[data-mission="${name}"]`);
  const status = document.querySelector(`[data-status="${name}"]`);
  const link = document.querySelector(`[data-link="${name}"]`);
  node.classList.toggle("locked", !isOpen);
  node.classList.toggle("completed", isDone);

  if (isDone) {
    status.textContent = "任務完成";
    link.textContent = missionLabels[name].done;
  } else if (isOpen) {
    status.textContent = name === "paper" ? "出發點" : "已解鎖";
    link.textContent = missionLabels[name].open;
  } else {
    status.textContent = "尚未解鎖";
    link.textContent = lockedText;
  }

  link.setAttribute("aria-disabled", String(!isOpen));
  if (isOpen) link.removeAttribute("tabindex");
  else link.setAttribute("tabindex", "-1");
}

function render() {
  const done = getProgress();
  const teacherMode = localStorage.getItem(STORAGE.teacher) === "true";
  const completedCount = Object.values(done).filter(Boolean).length;
  const tablewareOpen = teacherMode || done.paper;
  const pressureOpen = teacherMode || done.tableware;

  setNode("paper", true, done.paper, "");
  setNode("tableware", tablewareOpen, done.tableware, "完成頭城後解鎖");
  setNode("pressure", pressureOpen, done.pressure, "完成五結後解鎖");

  document.querySelector("#progress-text").textContent = `${completedCount} / 3`;
  document.querySelector("#progress-bar").style.width = `${completedCount / 3 * 100}%`;
  document.querySelector("#planet-message").hidden = completedCount !== 3;
  const teacherButton = document.querySelector("#teacher-toggle");
  teacherButton.setAttribute("aria-pressed", String(teacherMode));
  teacherButton.textContent = teacherMode ? "關閉教師預覽" : "教師快速預覽";
}

document.querySelector("#teacher-toggle").addEventListener("click", () => {
  const active = localStorage.getItem(STORAGE.teacher) === "true";
  localStorage.setItem(STORAGE.teacher, String(!active));
  render();
});

document.addEventListener("click", (event) => {
  const lockedLink = event.target.closest('.mission-button[aria-disabled="true"]');
  if (lockedLink) event.preventDefault();
});

window.addEventListener("pageshow", render);
window.addEventListener("storage", render);
render();
