import {center, visibility, type Maze, type Point} from './maze';
export function drawMaze(ctx: CanvasRenderingContext2D,m: Maze,tile: number) {
  ctx.fillStyle='#1b2731';ctx.fillRect(0,0,m.size*tile,m.size*tile);
  for(let y=0;y<m.size;y++)for(let x=0;x<m.size;x++){
    if(m.cells[y*m.size+x]){
      ctx.fillStyle='#39454e';ctx.fillRect(x*tile,y*tile,tile,tile);
      ctx.strokeStyle='#56616a';ctx.lineWidth=tile*.12;ctx.strokeRect(x*tile,y*tile,tile,tile);
      ctx.fillStyle='#46525b';ctx.fillRect(x*tile+tile*.1,y*tile+tile*.1,tile*.8,tile*.34);
      ctx.strokeStyle='#26323c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x*tile,y*tile+tile*.51);ctx.lineTo((x+1)*tile,y*tile+tile*.51);ctx.stroke();
    }else {
      ctx.strokeStyle='#24313a';ctx.lineWidth=1;ctx.strokeRect(x*tile+tile*.08,y*tile+tile*.08,tile*.84,tile*.84);
      const seed=(x*71+y*113)%31;ctx.fillStyle='#34404a';ctx.fillRect(x*tile+seed/40*tile,y*tile+.7*tile,2,1);
    }
  }
}
export function lantern(ctx: CanvasRenderingContext2D,x: number,y: number,t: number){
  ctx.fillStyle='#a2b6bf';ctx.beginPath();ctx.ellipse(x,y+t*.08,t*.14,t*.18,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#d4d1bc';ctx.beginPath();ctx.arc(x,y-t*.13,t*.115,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#f4d89c';ctx.lineWidth=1.5;ctx.strokeRect(x+t*.1,y-t*.04,t*.11,t*.17);
  ctx.fillStyle='#ffe5a2';ctx.fillRect(x+t*.12,y,t*.07,t*.1);
}
export function goal(ctx: CanvasRenderingContext2D,p: Point,t: number){
  const c=center(p);ctx.strokeStyle='#a5dbb6';ctx.fillStyle='#29473c';ctx.lineWidth=2;ctx.fillRect((c.x-.23)*t,(c.y-.30)*t,t*.46,t*.60);ctx.strokeRect((c.x-.23)*t,(c.y-.30)*t,t*.46,t*.60);ctx.fillStyle='#c2f1c4';ctx.fillRect((c.x+.10)*t,(c.y-.02)*t,t*.06,t*.06);
}
export function drawGame(ctx: CanvasRenderingContext2D,m: Maze,p: Point,camera: Point,w: number,h: number,range: number,brightness: number){
  ctx.fillStyle='#05080c';ctx.fillRect(0,0,w,h);
  const tile=Math.max(42,Math.min(68,w/7.3,h/7.5)),ox=w/2-camera.x*tile,oy=h/2-camera.y*tile;
  ctx.save();ctx.translate(ox,oy);
  const poly=visibility(m,p,range);ctx.beginPath();poly.forEach((v,i)=>i?ctx.lineTo(v.x*tile,v.y*tile):ctx.moveTo(v.x*tile,v.y*tile));ctx.closePath();ctx.clip();
  drawMaze(ctx,m,tile);goal(ctx,m.goal,tile);
  const g=ctx.createRadialGradient(p.x*tile,p.y*tile,0,p.x*tile,p.y*tile,range*tile);
  g.addColorStop(0,`rgba(231,193,117,${.20*brightness})`);g.addColorStop(.45,'rgba(11,14,16,0.06)');g.addColorStop(.72,'rgba(5,8,12,0.48)');g.addColorStop(1,'#05080c');
  ctx.fillStyle=g;ctx.fillRect((p.x-range)*tile,(p.y-range)*tile,range*2*tile,range*2*tile);ctx.restore();
  ctx.save();ctx.translate(ox,oy);lantern(ctx,p.x*tile,p.y*tile,tile);ctx.restore();
}
