import {useEffect,useRef,useState, type PointerEvent as ReactPointerEvent} from 'react';
import {cellSteps,center,move,visionFor,type Maze,type Point} from './maze';
import {drawGame} from './render';
import {resetControls,type Settings} from './settings';
export type {Settings} from './settings';
export type Run={seconds:number;collisions:number;distance:number;steps:number;path:Point[];settings:Settings;settingsHistory:{at:number;settings:Settings}[]};
export const time=(s:number)=>`${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;
export function SettingsForm({value,onChange}:{value:Settings;onChange:(s:Settings)=>void}){
  return <div className="settings-fields"><label>光の明るさ <span>{Math.round(value.brightness*100)}%</span><input type="range" min="0.5" max="1.5" step="0.1" value={value.brightness} onChange={e=>onChange({...value,brightness:+e.target.value})}/></label><label>移動速度 <span>{value.speed} マス / 秒</span><input type="range" min="1.5" max="4" step="0.5" value={value.speed} onChange={e=>onChange({...value,speed:+e.target.value})}/></label><label className="check"><input type="checkbox" checked={value.reduced} onChange={e=>onChange({...value,reduced:e.target.checked})}/>画面の動きを抑える</label><button className="full" onClick={()=>onChange(resetControls(value,matchMedia('(prefers-reduced-motion: reduce)').matches))}>初期設定に戻す</button></div>;
}
export function Game({maze,settings,setSettings,onFinish,onExit,test}:{maze:Maze;settings:Settings;setSettings:(s:Settings)=>void;onFinish:(r:Run)=>void;onExit:()=>void;test:boolean}){
  const canvas=useRef<HTMLCanvasElement>(null),dialog=useRef<HTMLDialogElement>(null),keys=useRef(new Set<string>()),stick=useRef({x:0,y:0});
  const clockReset=useRef(true),activePointer=useRef<number|null>(null);
  const playSettings={...settings,range:visionFor(maze)};
  const state=useRef({p:center(maze.start),camera:center(maze.start),run:{seconds:0,collisions:0,distance:0,steps:0,path:[center(maze.start)],settings:{...playSettings},settingsHistory:[{at:0,settings:{...playSettings}}]} as Run,contact:false,done:false});
  const [paused,setPaused]=useState(false),pauseRef=useRef(false),config=useRef(playSettings),[stats,setStats]=useState({seconds:0,collisions:0}),[knob,setKnob]=useState({x:0,y:0});
  config.current=playSettings;pauseRef.current=paused;
  function resume(){clockReset.current=true;keys.current.clear();setPaused(false);}
  function pause(){activePointer.current=null;keys.current.clear();stick.current={x:0,y:0};setKnob({x:0,y:0});pauseRef.current=true;setPaused(true);}
  useEffect(()=>{if(paused)dialog.current?.showModal();else dialog.current?.close();},[paused]);
  useEffect(()=>{
    const down=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();if(pauseRef.current)resume();else pause();return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key.toLowerCase().startsWith('arrow')?e.key:e.key.toLowerCase())){if(!pauseRef.current){e.preventDefault();keys.current.add(e.key.toLowerCase());}}};
    const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());const hidden=()=>{if(document.hidden)pause();};
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',pause);document.addEventListener('visibilitychange',hidden);
    return ()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',hidden);};
  },[]);
  useEffect(()=>{
    const c=canvas.current!,ctx=c.getContext('2d')!;let frame=0,last=performance.now(),ui=0;let w=0,h=0;
    const resize=new ResizeObserver(()=>{const rect=c.getBoundingClientRect();w=rect.width;h=rect.height;const dpr=Math.min(devicePixelRatio||1,2);c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);});resize.observe(c);
    function tick(now:number){const elapsed=clockReset.current?0:Math.max(0,(now-last)/1000);clockReset.current=false;const slices=Math.max(1,Math.ceil(elapsed/.025)),dt=elapsed/slices;last=now;const st=state.current,s=config.current;
      if(!pauseRef.current&&!st.done){
        for(let slice=0;slice<slices;slice++){
        st.run.seconds+=dt;if(JSON.stringify(st.run.settingsHistory.at(-1)!.settings)!==JSON.stringify(s))st.run.settingsHistory.push({at:st.run.seconds,settings:{...s}});let x=(keys.current.has('d')||keys.current.has('arrowright')?1:0)-(keys.current.has('a')||keys.current.has('arrowleft')?1:0)+stick.current.x;
        let y=(keys.current.has('s')||keys.current.has('arrowdown')?1:0)-(keys.current.has('w')||keys.current.has('arrowup')?1:0)+stick.current.y;
        const len=Math.hypot(x,y);if(len>1){x/=len;y/=len;}
        const result=move(maze,st.p,x*s.speed*dt,y*s.speed*dt);st.run.steps+=cellSteps(st.p,result.point);st.p=result.point;st.run.distance+=result.distance;
        if(result.hit&&!st.contact)st.run.collisions++;st.contact=result.hit;
        const prev=st.run.path.at(-1)!;if(Math.hypot(prev.x-st.p.x,prev.y-st.p.y)>.055)st.run.path.push({...st.p});
        const a=s.reduced?1:1-Math.exp(-20*dt);st.camera.x+=(st.p.x-st.camera.x)*a;st.camera.y+=(st.p.y-st.camera.y)*a;
        if(Math.floor(st.p.x)===maze.goal.x&&Math.floor(st.p.y)===maze.goal.y){st.done=true;st.run.path.push({...st.p});st.run.settings={...s};onFinish(st.run);return;}
        }
        if(now-ui>100){setStats({seconds:st.run.seconds,collisions:st.run.collisions});ui=now;}
      }
      if(pauseRef.current){ctx.fillStyle='#05080c';ctx.fillRect(0,0,w,h);}else drawGame(ctx,maze,st.p,st.camera,w,h,s.range,s.brightness);
      frame=requestAnimationFrame(tick);
    }frame=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(frame);resize.disconnect();};
  },[maze,onFinish]);
  function stickMove(e:ReactPointerEvent<HTMLDivElement>){if(activePointer.current!==e.pointerId||!e.currentTarget.hasPointerCapture(e.pointerId)||pauseRef.current)return;const r=e.currentTarget.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/42,y=(e.clientY-r.top-r.height/2)/42;const len=Math.hypot(x,y);if(len>1){x/=len;y/=len;}if(len<.12){x=0;y=0;}stick.current={x,y};const travel=Math.min(32,(r.width-54)/2);setKnob({x:x*travel,y:y*travel});}
  const release=(e:ReactPointerEvent<HTMLDivElement>)=>{if(activePointer.current!==e.pointerId)return;activePointer.current=null;stick.current={x:0,y:0};setKnob({x:0,y:0});};
  return <main className="game"><header className="game-header"><span className="wordmark">暗めいろ{test&&<small> テスト</small>}</span><div className="game-stats"><span aria-label="経過時間">{time(stats.seconds)}</span></div><button onClick={pause} aria-label="一時停止">一時停止 <span className="key">Esc</span></button></header><div className="playfield"><canvas ref={canvas} aria-label="暗闇の迷路。WASD、矢印キー、または画面下のスティックで移動。緑の灯る扉を探します。"/><div className="game-hint">見える道を、ひとつずつ。<br/><span>緑の灯る扉を、探そう。</span></div></div><footer className="game-controls"><p className="keyboard-help"><span className="key">W A S D</span> / <span className="key">↑ ↓ ← →</span><br/><span className="small muted">押し続けて移動</span></p><div className="joystick" role="group" aria-label="タッチ移動スティック" onPointerDown={e=>{if(activePointer.current!==null||pauseRef.current)return;activePointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);stickMove(e);}} onPointerMove={stickMove} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}><span className="stick-cross"/><span className="stick-knob" style={{transform:`translate(${knob.x}px,${knob.y}px)`}}/></div><p className="small muted">スティックを<br/>倒して移動</p></footer><dialog ref={dialog} onCancel={e=>{e.preventDefault();resume();}}><h2>ひと休み。</h2><p className="muted">時間は止まっています。</p><SettingsForm value={settings} onChange={setSettings}/><button className="primary full" onClick={resume}>探索に戻る</button><button className="full" onClick={onExit}>{test?'エディターに戻る':'トップに戻る'}</button></dialog></main>;
}
