const texts={
1:"Every morning brings a new opportunity to learn useful things. Good typing starts with patience and practice. Keep your hands relaxed and focus on each letter carefully. Do not worry about speed at the beginning. Accuracy should always come first. As you practice regularly, your fingers will become familiar with the keyboard and your typing will become smoother.",
2:"Technology has changed the way people communicate, study and work. Students write assignments, professionals prepare documents, and developers create software every day. Fast and accurate typing can save valuable time during these activities. The best way to improve is to practice regularly while maintaining a comfortable posture. Try to look at the screen instead of the keyboard and allow your fingers to remember the location of each key.",
3:"Learning a new skill requires consistency, patience and a willingness to make mistakes. Typing is no different. When you practice, concentrate on accuracy and develop a steady rhythm instead of rushing through every sentence. Over time, your hands will develop muscle memory and common words will become easier to type. Reading ahead while typing can also help you prepare for the next few words and maintain a smoother flow.",
4:"Modern workplaces depend heavily on computers, which makes efficient typing an important professional skill. People often write emails, reports, presentations, messages and documents throughout the day. Poor typing habits can slow down this work and create unnecessary errors. Developing touch typing skills allows you to concentrate on your ideas rather than searching for individual keys. Regular practice, correct finger placement and careful attention to accuracy can produce significant improvements.",
5:"Advanced typing requires more than simply pressing keys quickly. A skilled typist must maintain accuracy, rhythm, concentration and control while handling different types of text. Longer sentences, punctuation marks, unfamiliar words and changing sentence structures can make a typing exercise more challenging. The goal is to develop reliable muscle memory so that your fingers respond naturally while your eyes remain focused on the text. Consistent practice will gradually increase both confidence and performance."
};

const targetWpm={1:20,2:30,3:40,4:50,5:60};
let level=1,started=false,finished=false,timeLeft=900,startTime=0,timerId=null,graphId=null,mistakes=0,speedHistory=[];
const $=id=>document.getElementById(id);
const input=$("typingInput"),display=$("textDisplay"),timer=$("timer"),wpm=$("wpm"),accuracy=$("accuracy"),mistakesEl=$("mistakes"),characters=$("characters"),progressBar=$("progressBar"),progressText=$("progressText");
const resultModal=$("resultModal"),canvas=$("speedCanvas"),ctx=canvas.getContext("2d");
const keys=[...document.querySelectorAll("#liveKeyboard button")];

function loadText(){
  display.innerHTML="";
  [...texts[level]].forEach(ch=>{const s=document.createElement("span");s.textContent=ch;display.appendChild(s)});
  $("currentLevel").textContent=level;
  $("wordTarget").textContent=`${level*50} words`;
  updateCursor(); clearKeyHighlight();
}

function renderTimer(){
  const m=Math.floor(timeLeft/60),s=timeLeft%60;
  timer.textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function startTest(){
  if(started)return;
  started=true;finished=false;timeLeft=900;mistakes=0;startTime=Date.now();speedHistory=[];
  input.disabled=false;input.value="";input.focus();$("startBtn").hidden=true;$("nextBtn").hidden=true;
  $("guideMessage").textContent="Typing started. The highlighted key is your next key.";
  timerId=setInterval(()=>{timeLeft--;renderTimer();updateStats();if(timeLeft<=0)finishTest()},1000);
  graphId=setInterval(()=>{updateStats();speedHistory.push(Number(wpm.textContent)||0);drawGraph()},1000);
  highlightNextKey();drawGraph();
}

input.addEventListener("input",()=>{
  if(!started)return;
  const typed=input.value,original=texts[level];mistakes=0;
  [...original].forEach((ch,i)=>{
    const span=display.children[i];if(!span)return;
    span.className="";
    if(i<typed.length){
      if(typed[i]===ch)span.classList.add("correct");
      else{span.classList.add("wrong");mistakes++}
    }
  });
  updateCursor();updateStats();updateProgress();highlightNextKey();
  if(typed.length>=original.length)finishTest();
});

function updateCursor(){
  [...display.children].forEach(s=>s.classList.remove("current"));
  const i=input.value.length;
  if(display.children[i])display.children[i].classList.add("current");
}

function updateStats(){
  if(!startTime)return;
  const typed=input.value,elapsed=Math.max((Date.now()-startTime)/60000,.001);
  const val=Math.round((typed.length/5)/elapsed)||0;
  wpm.textContent=val;mistakesEl.textContent=mistakes;characters.textContent=typed.length;
  let correct=0;
  for(let i=0;i<typed.length;i++)if(typed[i]===texts[level][i])correct++;
  accuracy.textContent=(typed.length?Math.round(correct/typed.length*100):100)+"%";
}

function updateProgress(){
  const p=Math.min(100,Math.round(input.value.length/texts[level].length*100));
  progressBar.style.width=p+"%";progressText.textContent=p+"%";
}

function getKey(ch){return keys.find(k=>k.dataset.key===ch.toLowerCase())}
function highlightNextKey(){
  clearKeyHighlight();
  if(!started||finished)return;
  const next=texts[level][input.value.length];
  const key=getKey(next);
  if(key)key.classList.add("next-key");
}
function clearKeyHighlight(){keys.forEach(k=>k.classList.remove("next-key","pressed"))}

document.addEventListener("keydown",e=>{
  if(!started)return;
  const key=getKey(e.key===" "?" ":e.key);
  if(!key)return;
  key.classList.add("pressed");
  setTimeout(()=>key.classList.remove("pressed"),120);
});

function drawGraph(){
  const rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
  canvas.width=Math.max(600,rect.width*dpr);canvas.height=280*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const w=Math.max(600,rect.width),h=280;
  ctx.clearRect(0,0,w,h);
  ctx.strokeStyle="#252c40";ctx.lineWidth=1;
  for(let i=0;i<6;i++){const y=25+i*(h-55)/5;ctx.beginPath();ctx.moveTo(45,y);ctx.lineTo(w-20,y);ctx.stroke()}
  ctx.fillStyle="#788298";ctx.font="12px Arial";ctx.fillText("WPM",8,18);
  const max=Math.max(60,...speedHistory,20),left=45,right=20,top=25,bottom=30;
  if(speedHistory.length){
    ctx.strokeStyle="#756cff";ctx.lineWidth=3;ctx.beginPath();
    speedHistory.forEach((v,i)=>{const x=left+(i/Math.max(1,speedHistory.length-1))*(w-left-right);const y=top+(max-v)/max*(h-top-bottom);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
    ctx.stroke();
  }
}

function finishTest(){
  if(finished)return;
  finished=true;started=false;clearInterval(timerId);clearInterval(graphId);input.disabled=true;updateStats();
  const finalWpm=Number(wpm.textContent)||0,total=900-timeLeft;
  const mm=Math.floor(total/60),ss=total%60;
  let score=Math.min(100,Math.round(finalWpm/targetWpm[level]*100));
  $("finalWpm").textContent=finalWpm;$("finalAccuracy").textContent=accuracy.textContent;$("finalMistakes").textContent=mistakes;
  $("finalSpeed").textContent=score+"%";$("finalTime").textContent=`${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
  $("finalMessage").textContent=score>=90?"🔥 Excellent! Your typing speed is outstanding.":score>=75?"🚀 Great speed! Keep practicing to reach 100%.":score>=50?"👍 Good progress! Practice more to improve your speed.":"💪 Keep practicing. Accuracy first, speed will come.";
  if(level<5){localStorage.setItem("typingLevel",Math.max(Number(localStorage.getItem("typingLevel")||1),level+1));$("modalNext").hidden=false}
  else $("modalNext").hidden=true;
  resultModal.classList.add("show");resultModal.setAttribute("aria-hidden","false");clearKeyHighlight();drawGraph();
}

function closeResult(){resultModal.classList.remove("show");resultModal.setAttribute("aria-hidden","true")}

function nextLevel(){
  if(level>=5){closeResult();return}
  level++;resetTest();closeResult();
  document.querySelectorAll(".level").forEach(b=>b.classList.toggle("active",Number(b.dataset.level)===level));
}

function resetTest(){
  clearInterval(timerId);clearInterval(graphId);started=false;finished=false;timeLeft=900;mistakes=0;speedHistory=[];
  input.value="";input.disabled=true;$("startBtn").hidden=false;$("nextBtn").hidden=true;renderTimer();
  wpm.textContent="0";accuracy.textContent="100%";mistakesEl.textContent="0";characters.textContent="0";progressBar.style.width="0%";progressText.textContent="0%";
  $("guideMessage").textContent="Press Start Test to begin. The keyboard will show the next key.";
  loadText();drawGraph();
}

document.querySelectorAll(".level").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const chosen=Number(btn.dataset.level),unlocked=Number(localStorage.getItem("typingLevel")||1);
    if(chosen>unlocked){alert("🔒 Complete the previous level first.");return}
    level=chosen;resetTest();document.querySelectorAll(".level").forEach(b=>b.classList.toggle("active",Number(b.dataset.level)===level));
  });
});

$("startBtn").addEventListener("click",startTest);
$("nextBtn").addEventListener("click",nextLevel);
$("closeResult").addEventListener("click",closeResult);
$("modalContinue").addEventListener("click",closeResult);
$("modalNext").addEventListener("click",nextLevel);
resultModal.addEventListener("click",e=>{if(e.target===resultModal)closeResult()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&resultModal.classList.contains("show"))closeResult()});
window.addEventListener("resize",drawGraph);

loadText();renderTimer();drawGraph();
