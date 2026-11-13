import {useEffect,useRef} from 'react';
import {center,type Maze,type Point} from './maze';
import {drawMaze,goal} from './render';
export function MapView({maze,path,shortest,step=1}:{maze:Maze;path?:Point[];shortest?:Point[];step?:number}){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{const c=ref.current!,ctx=c.getContext('2d')!;const t=28;c.width=c.height=maze.size*t*2;ctx.scale(2,2);drawMaze(ctx,maze,t);
    const line=(ps:Point[],color:string,width:number,dash:number[])=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.setLineDash(dash);ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p.x*t,p.y*t):ctx.moveTo(p.x*t,p.y*t));ctx.stroke();};
    if(shortest)line(shortest.map(center),'#b1c9d6',2,[4,5]);
    if(path){const visible=path.slice(0,Math.max(1,Math.ceil(path.length*step)));line(visible,'rgba(247,151,104,.40)',5,[]);line(visible,'#ffc08c',1.4,[]);ctx.setLineDash([]);visible.forEach((p,i)=>{if(i%10===0){ctx.fillStyle='#f09264';ctx.beginPath();ctx.arc(p.x*t,p.y*t,2,0,Math.PI*2);ctx.fill();}});}
    goal(ctx,maze.goal,t);const s=center(maze.start);ctx.fillStyle='#f6d58b';ctx.beginPath();ctx.arc(s.x*t,s.y*t,t*.20,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0b1219';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('S',s.x*t,s.y*t);
  },[maze,path,shortest,step]);
  return <canvas className="map" ref={ref} aria-label="迷路全体図。Sはスタート、緑の扉はゴール。"/>;
}
