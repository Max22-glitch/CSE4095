import {useEffect,useRef,useState} from 'react';
import type {MathOperation,DifficultyLevel,Question} from '../types/question';
import type {AppSettings} from '../types/settings';
import {DEFAULT_APP_SETTINGS} from '../types/settings';
import {generateQuestion,operations,labels,icons} from '../services/questions';
import '../index.css';
type Attempt={id:string;operation:MathOperation;difficulty:DifficultyLevel;firstOperand:number;secondOperand:number;correctAnswer:number;selectedAnswer:number;correct:boolean;date:string;source:string};
type Pattern={id:string;operation:MathOperation;firstOperand:number;secondOperand:number;difficulty:DifficultyLevel;incorrectCount:number;similarCorrectCount:number;mastered:boolean};
type Screen='home'|'setup'|'practice'|'summary'|'statistics'|'mistakes'|'settings';
const read=<T,>(key:string,fallback:T):T=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback}catch{return fallback}};
const save=(key:string,value:unknown)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
function App(){
 const [screen,setScreen]=useState<Screen>('home');
 const [settings,setSettings]=useState<AppSettings>(()=>read('math-settings',DEFAULT_APP_SETTINGS));
 const [history,setHistory]=useState<Attempt[]>(()=>read('math-history',[]));
 const [patterns,setPatterns]=useState<Pattern[]>(()=>read('math-patterns',[]));
 const [ops,setOps]=useState<MathOperation[]>(settings.defaultOperations);
 const [difficulty,setDifficulty]=useState<DifficultyLevel>(settings.defaultDifficulty);
 const [length,setLength]=useState<number|'continuous'>(settings.defaultSessionLength);
 const [review,setReview]=useState(false);
 const [reviewPatternId,setReviewPatternId]=useState<string|null>(null);
 const [question,setQuestion]=useState<Question|null>(null);
 const [selected,setSelected]=useState<number|null>(null);
 const [flipped,setFlipped]=useState(false);
 const [session,setSession]=useState<Attempt[]>([]);
 const [showReset,setShowReset]=useState(false);
 const soundContext=useRef<AudioContext|null>(null);
 const playSound=(success:boolean)=>{if(!settings.soundEffectsEnabled)return;try{const ctx=soundContext.current??new AudioContext();soundContext.current=ctx;const osc=ctx.createOscillator();const gain=ctx.createGain();osc.type='sine';osc.frequency.value=success?660:260;gain.gain.value=.035;osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.12)}catch{}};
 useEffect(()=>save('math-settings',settings),[settings]);
 useEffect(()=>save('math-history',history),[history]);
 useEffect(()=>save('math-patterns',patterns),[patterns]);
 const pending=patterns.filter(p=>!p.mastered);
 // Review questions stay linked to the selected original mistake, not a random saved mistake.
 const chooseQuestion=(reviewMode:boolean,available:MathOperation[],level:DifficultyLevel,target?:Pattern):Question=>{
  if(reviewMode&&target)return generateQuestion(target.operation,target.difficulty,'mistake-review',target);
  const op=available[Math.floor(Math.random()*available.length)];return generateQuestion(op,level);
 };
 const start=(reviewMode=false,targetId?:string)=>{
  const target=reviewMode?(pending.find(p=>p.id===targetId)??pending[0]):undefined;
  if(reviewMode&&!target)return;
  if(!reviewMode&&!ops.length)return;
  setReview(reviewMode);setReviewPatternId(target?.id??null);setSession([]);setSelected(null);setFlipped(false);
  setQuestion(chooseQuestion(reviewMode,ops,difficulty,target));setScreen('practice');
 };
 const record=(correct:boolean)=>{
  if(!question||selected===null)return;
  playSound(correct);
  const attempt:Attempt={id:crypto.randomUUID(),operation:question.operation,difficulty:question.difficulty,firstOperand:question.firstOperand,secondOperand:question.secondOperand,correctAnswer:question.correctAnswer,selectedAnswer:selected,correct,date:new Date().toISOString(),source:question.source};
  const updatedPatterns=patterns.map(p=>({...p}));
  if(!correct){
   const old=updatedPatterns.find(p=>p.id===question.mistakePatternId)??updatedPatterns.find(p=>p.operation===question.operation&&p.firstOperand===question.firstOperand&&p.secondOperand===question.secondOperand);
   if(old){old.incorrectCount++;old.similarCorrectCount=0;old.mastered=false;}
   else updatedPatterns.push({id:crypto.randomUUID(),operation:question.operation,firstOperand:question.firstOperand,secondOperand:question.secondOperand,difficulty:question.difficulty,incorrectCount:1,similarCorrectCount:0,mastered:false});
  }else if(question.source==='mistake-review'){
   const target=updatedPatterns.find(p=>p.id===question.mistakePatternId&&!p.mastered);
   if(target){target.similarCorrectCount++;target.mastered=target.similarCorrectCount>=settings.masteryThreshold;}
  }
  const updatedSession=[...session,attempt];
  setHistory(h=>[...h,attempt]);setSession(updatedSession);setPatterns(updatedPatterns);
  if(length!=='continuous'&&updatedSession.length>=length){setScreen('summary');return;}
  if(review){
   // Keep practicing the same original pattern until mastered, then return to the review list.
   const target=updatedPatterns.find(p=>p.id===reviewPatternId);
   if(!target||target.mastered){setScreen('mistakes');setSelected(null);setFlipped(false);return;}
   setQuestion(chooseQuestion(true,ops,difficulty,target));
  }else setQuestion(chooseQuestion(false,ops,difficulty));
  setSelected(null);setFlipped(false);
 };
 useEffect(()=>{if(screen!=='practice'||flipped)return;const handler=(e:KeyboardEvent)=>{if(['1','2','3','4'].includes(e.key)&&question)setSelected(question.choices[Number(e.key)-1]);if(e.key==='Enter'&&selected!==null)setFlipped(true)};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[screen,flipped,question,selected]);
 const count=history.length;const correct=history.filter(a=>a.correct).length;const percent=(n:number,d:number)=>d?Math.round(n/d*100):0;
 const nav=(name:Screen)=>{setScreen(name);setShowReset(false)};
 const action=(name:Screen,label:string)=> <button className="back" onClick={()=>nav(name)}>← {label}</button>;
 return <div className="shell"><div className="ambient one"/><div className="ambient two"/><div className="container">
 <header className="top"><button className="brand" onClick={()=>nav('home')}><span className="brand-icon">✦</span> Math Practice</button><span className="tag">Ages 7–12</span></header>
 {screen==='home'&&<><section className="hero"><div className="mascot">🧮</div><div className="eyebrow">LET'S LEARN TOGETHER</div><h1>Ready to become a <span>math star?</span></h1><p>Practice your math skills, celebrate every win, and grow your confidence one question at a time!</p><div className="symbol-row"><span>+</span><span>−</span><span>×</span><span>÷</span></div></section><div className="menu"><button className="tile blue" onClick={()=>nav('setup')}><span>🚀</span><strong>Start Practice</strong><small>Let's solve some problems!</small><b>→</b></button><button className="tile gold" onClick={()=>nav('statistics')}><span>📊</span><strong>My Statistics</strong><small>See how far you've come</small><b>→</b></button><button className="tile purple" onClick={()=>nav('mistakes')}><span>🎯</span><strong>Mistake Review</strong><small>{pending.length} patterns to practice</small><b>→</b></button><button className="tile mint" onClick={()=>nav('settings')}><span>⚙️</span><strong>Settings</strong><small>Make it yours</small><b>→</b></button></div><div className="tip">💡 <b>Math tip:</b> Every mistake is a chance to learn something new!</div></>}
 {screen==='setup'&&<><div className="pagehead">{action('home','Home')}<h1>Set up your practice</h1><p>Pick what you'd like to work on today.</p></div><section className="panel"><h2>Choose operations</h2><div className="operation-grid">{operations.map(op=><button key={op} className={'op '+(ops.includes(op)?'active':'')} onClick={()=>setOps(o=>o.includes(op)?o.filter(x=>x!==op):[...o,op])}><span>{icons[op]}</span>{labels[op]}</button>)}</div><h2>Difficulty</h2><div className="choices">{([1,2,3,4] as DifficultyLevel[]).map(n=><button key={n} className={difficulty===n?'selected':''} onClick={()=>setDifficulty(n)}>Grade {n}</button>)}</div><h2>Session length</h2><div className="choices">{([5,10,20,'continuous'] as const).map(n=><button key={n} className={length===n?'selected':''} onClick={()=>setLength(n)}>{n==='continuous'?'∞ Continuous':`${n} questions`}</button>)}</div><button className="primary" disabled={!ops.length} onClick={()=>start()}>Start practicing →</button></section></>}
 {screen==='practice'&&question&&<><div className="practicehead">{action('home','Exit practice')}<span>{review?'🎯 Mistake review':'⭐ Math practice'}</span></div><div className="progresslabel">Question {session.length+1}{length==='continuous'?'':` of ${length}`} <span>{percent(session.filter(a=>a.correct).length,session.length)}% correct</span></div>{length!=='continuous'&&<div className="progress"><div style={{width:`${session.length/length*100}%`}}/></div>}<div className={'flashcard '+(settings.cardAnimationEnabled?'animated':'')}><div className="eyebrow">{labels[question.operation]} · Grade {question.difficulty}</div>{review&&<p className="hint">Practicing original mistake: {patterns.find(p=>p.id===reviewPatternId)?.firstOperand} {icons[question.operation]} {patterns.find(p=>p.id===reviewPatternId)?.secondOperand} (similar question below)</p>}<div className="problem">{question.displayText}</div>{flipped?<><div className="answer-label">The correct answer is</div><div className="answer">{question.correctAnswer}</div><p>You chose {selected}. Did you get it right?</p><p className="hint">Your result is self-reported. Please choose honestly; the app does not grade automatically.</p>{settings.showExplanations&&<p className="explanation">{question.operation==='addition'?`Add ${question.firstOperand} and ${question.secondOperand} to get ${question.correctAnswer}.`:question.operation==='subtraction'?`Take ${question.secondOperand} away from ${question.firstOperand} to get ${question.correctAnswer}.`:question.operation==='multiplication'?`${question.firstOperand} groups of ${question.secondOperand} make ${question.correctAnswer}.`:`${question.firstOperand} divided into groups of ${question.secondOperand} gives ${question.correctAnswer}.`}</p>}</>:<><p>Choose your answer</p><div className="answer-grid">{question.choices.map((n,i)=><button key={n} className={selected===n?'picked':''} onClick={()=>setSelected(n)}><small>{i+1}</small>{n}</button>)}</div></>}</div>{flipped?<div className="feedback"><button className="wrong" onClick={()=>record(false)}>✕ I Got It Wrong</button><button className="right" onClick={()=>record(true)}>✓ I Got It Right</button></div>:<button className="primary" disabled={selected===null} onClick={()=>setFlipped(true)}>Flip card to check ↻</button>}<p className="hint">{flipped?'Record your result to continue.':'Tip: Use keys 1–4 to choose an answer, then Enter to flip.'}</p></>}
 {screen==='summary'&&<><div className="pagehead"><h1>Great work! 🎉</h1><p>You finished your practice session.</p></div><section className="panel center"><div className="mascot">🏆</div><div className="bigscore">{percent(session.filter(a=>a.correct).length,session.length)}%</div><p>{session.filter(a=>a.correct).length} correct out of {session.length} questions</p><div className="stats-row"><div><strong>{session.length}</strong><small>Questions</small></div><div><strong>{session.filter(a=>a.correct).length}</strong><small>Correct</small></div><div><strong>{session.filter(a=>!a.correct).length}</strong><small>To review</small></div></div><button className="primary" onClick={()=>nav('setup')}>Practice again</button><button className="secondary" onClick={()=>nav('home')}>Back home</button></section></>}
 {screen==='statistics'&&<><div className="pagehead">{action('home','Home')}<h1>My Statistics 📊</h1><p>Watch your progress grow!</p></div><div className="stats-row large"><div><strong>{count}</strong><small>Questions answered</small></div><div><strong>{correct}</strong><small>Correct answers</small></div><div><strong>{percent(correct,count)}%</strong><small>Accuracy</small></div></div><section className="panel"><h2>By operation</h2>{operations.map(op=>{const attempts=history.filter(a=>a.operation===op);const success=attempts.filter(a=>a.correct).length;return <div className="statline" key={op}><div><b>{icons[op]} {labels[op]}</b><span>{success}/{attempts.length} · {percent(success,attempts.length)}%</span></div><div className="progress"><div style={{width:`${percent(success,attempts.length)}%`}}/></div></div>})}</section><section className="panel"><h2>Recent attempts</h2>{!history.length?<p>No practice yet. Start a session to see your progress!</p>:<div className="history">{history.slice(-12).reverse().map(a=><div key={a.id}><span>{a.firstOperand} {icons[a.operation]} {a.secondOperand} = {a.correctAnswer}</span><b className={a.correct?'good':'bad'}>{a.correct?'✓ Correct':'✕ Incorrect'}</b></div>)}</div>}</section></>}
 {screen==='mistakes'&&<><div className="pagehead">{action('home','Home')}<h1>Mistake Review 🎯</h1><p>Practice similar questions until you've mastered them.</p></div><div className="stats-row"><div><strong>{pending.length}</strong><small>To master</small></div><div><strong>{patterns.filter(p=>p.mastered).length}</strong><small>Mastered</small></div></div><section className="panel"><h2>Patterns to practice</h2>{pending.length===0?<p>🌟 No mistakes to review yet. Keep practicing!</p>:pending.map(p=><div className="pattern" key={p.id}><span>{p.firstOperand} {icons[p.operation]} {p.secondOperand}</span><small>{p.similarCorrectCount}/{settings.masteryThreshold} similar answers correct</small><button className="secondary" onClick={()=>start(true,p.id)}>Review this mistake →</button></div>)}<button className="primary" disabled={!pending.length} onClick={()=>start(true)}>Review first mistake →</button></section></>}
 {screen==='settings'&&<><div className="pagehead">{action('home','Home')}<h1>Settings ⚙️</h1><p>Choose what works best for you.</p></div><section className="panel"><h2>Preferences</h2>{([['soundEffectsEnabled','Sound effects'],['cardAnimationEnabled','Card animations'],['showExplanations','Show explanations']] as const).map(([key,label])=><label className="setting" key={key}><span>{label}</span><input type="checkbox" checked={settings[key]} onChange={e=>setSettings(s=>({...s,[key]:e.target.checked}))}/></label>)}<div className="setting"><span>Answers to master a mistake</span><select value={settings.masteryThreshold} onChange={e=>setSettings(s=>({...s,masteryThreshold:Number(e.target.value)}))}>{[1,2,3,4,5,10].map(n=><option key={n} value={n}>{n}</option>)}</select></div><h2>My data</h2><p>Your progress is saved in this browser, not sent to a server.</p><button className="secondary danger" onClick={()=>setShowReset(true)}>Clear saved progress</button>{showReset&&<div className="confirm"><p>Delete all history and mistake patterns? This cannot be undone.</p><button className="wrong" onClick={()=>{setHistory([]);setPatterns([]);setShowReset(false)}}>Yes, clear progress</button><button className="secondary" onClick={()=>setShowReset(false)}>Cancel</button></div>}</section></>}
 <footer>Made for curious minds ✨ · Your progress stays on this device</footer></div></div>
}
export default App;
