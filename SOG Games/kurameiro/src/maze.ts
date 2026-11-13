export type Point = { x: number; y: number };
export type Maze = { size: number; cells: number[]; start: Point; goal: Point; vision?: number };
export const DEFAULT_VISION = 2.5;
export const visionFor = (m: Maze) => m.vision ?? DEFAULT_VISION;
export const cellSteps = (a: Point, b: Point) => Math.abs(Math.floor(a.x)-Math.floor(b.x))+Math.abs(Math.floor(a.y)-Math.floor(b.y));
export const SIZES = [9, 15, 21] as const;
export const directions = [[1,0],[-1,0],[0,1],[0,-1]];
export const wall = (m: Maze, x: number, y: number) => x<0 || y<0 || x>=m.size || y>=m.size || m.cells[y*m.size+x]===1;
export const center = (p: Point): Point => ({x:p.x+.5,y:p.y+.5});
export function shortestPath(m: Maze): Point[] {
  const start=m.start.y*m.size+m.start.x, goal=m.goal.y*m.size+m.goal.x;
  const prev=new Int32Array(m.cells.length).fill(-1), queue=[start]; prev[start]=start;
  for(let i=0;i<queue.length;i++) {
    const id=queue[i]; if(id===goal) break;
    for(const [dx,dy] of directions) {
      const x=id%m.size+dx,y=Math.floor(id/m.size)+dy,n=y*m.size+x;
      if(!wall(m,x,y)&&prev[n]===-1) { prev[n]=id;queue.push(n); }
    }
  }
  if(prev[goal]===-1) return [];
  const path: Point[]=[]; for(let n=goal;;n=prev[n]) {path.push({x:n%m.size,y:Math.floor(n/m.size)});if(n===start)break;}
  return path.reverse();
}
export function generate(size: number): Maze {
  if(!SIZES.includes(size as 9)) throw Error('対応していないサイズです。');
  const m: Maze={size,cells:Array(size*size).fill(1),start:{x:1,y:1},goal:{x:size-2,y:size-2}};
  const stack=[m.start];m.cells[size+1]=0;
  while(stack.length){const p=stack[stack.length-1];const options=directions.filter(([dx,dy])=>{const x=p.x+dx*2,y=p.y+dy*2;return x>0&&y>0&&x<size-1&&y<size-1&&wall(m,x,y);});
    if(!options.length){stack.pop();continue;}
    const [dx,dy]=options[Math.floor(Math.random()*options.length)];const n={x:p.x+dx*2,y:p.y+dy*2};m.cells[(p.y+dy)*size+p.x+dx]=0;m.cells[n.y*size+n.x]=0;stack.push(n);
  }
  // Open one divider with two floor neighbours. Preserve at least one dead end.
  const candidates: number[]=[];
  for(let y=1;y<size-1;y++)for(let x=1;x<size-1;x++)if(wall(m,x,y)&&((!wall(m,x-1,y)&&!wall(m,x+1,y)&&wall(m,x,y-1)&&wall(m,x,y+1))||(!wall(m,x,y-1)&&!wall(m,x,y+1)&&wall(m,x-1,y)&&wall(m,x+1,y))))candidates.push(y*size+x);
  for(const id of candidates.sort(()=>Math.random()-.5)) {
    m.cells[id]=0;
    const dead=m.cells.some((v,i)=>!v&&directions.filter(([dx,dy])=>!wall(m,i%size+dx,Math.floor(i/size)+dy)).length===1);
    if(dead)break;m.cells[id]=1;
  }
  const queue=[size+1],dist=Array(size*size).fill(-1);dist[size+1]=0;
  for(let i=0;i<queue.length;i++){const id=queue[i];for(const [dx,dy] of directions){const x=id%size+dx,y=Math.floor(id/size)+dy,n=y*size+x;if(!wall(m,x,y)&&dist[n]<0){dist[n]=dist[id]+1;queue.push(n);}}}
  const far=queue.reduce((a,b)=>dist[a]>dist[b]?a:b);m.goal={x:far%size,y:Math.floor(far/size)};return m;
}
export function validate(m: Maze): string | null {
  if(m.vision!==undefined&&![2,2.5,3,3.5,4].includes(m.vision))return '視界の設定が正しくありません。';
  if(!SIZES.includes(m.size as 9)||!Array.isArray(m.cells)||m.cells.length!==m.size*m.size||m.cells.some(v=>v!==0&&v!==1))return '迷路データが正しくありません。';
  for(const p of [m.start,m.goal])if(!p||!Number.isInteger(p.x)||!Number.isInteger(p.y)||wall(m,p.x,p.y))return 'スタートとゴールは通路に置いてください。';
  if(m.start.x===m.goal.x&&m.start.y===m.goal.y)return 'スタートとゴールは別の場所に置いてください。';
  for(let i=0;i<m.size;i++)if(!wall(m,i,0)||!wall(m,i,m.size-1)||!wall(m,0,i)||!wall(m,m.size-1,i))return '外周は壁で囲んでください。';
  return shortestPath(m).length?null:'ゴールにたどり着けません。壁を調整してください。';
}
function checksum(bytes: Uint8Array){let c=0x811c9dc5;for(const n of bytes)c=Math.imul(c^n,16777619);return c>>>0;}
export function encode(m: Maze): string {
  const error=validate(m);if(error)throw Error(error);
  const version=m.vision===undefined?1:2,header=version===1?6:7;
  const b=new Uint8Array(header+Math.ceil(m.cells.length/8)+4);b.set([version,m.size,m.start.x,m.start.y,m.goal.x,m.goal.y]);if(version===2)b[6]=m.vision!*2;
  m.cells.forEach((v,i)=>b[header+(i>>3)]|=v<<(i%8));new DataView(b.buffer).setUint32(b.length-4,checksum(b.subarray(0,-4)));
  return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export function decode(s: string): Maze {
  if(s.length>150||!/^[\w-]+$/.test(s))throw Error('共有URLが壊れています。送り主に確認してください。');
  let b: Uint8Array;try{b=Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}catch{throw Error('共有URLを読み込めません。');}
  const size=b[1],header=b[0]===1?6:7;if(![1,2].includes(b[0])||!SIZES.includes(size as 9)||b.length!==header+Math.ceil(size*size/8)+4)throw Error('対応していない共有データです。');
  if(new DataView(b.buffer).getUint32(b.length-4)!==checksum(b.subarray(0,-4)))throw Error('共有データが壊れています。URL全体をコピーしてください。');
  const m:Maze={size,cells:Array.from({length:size*size},(_,i)=>(b[header+(i>>3)]>>(i%8))&1),start:{x:b[2],y:b[3]},goal:{x:b[4],y:b[5]}};
  if(b[0]===2)m.vision=b[6]/2;
  const error=validate(m);if(error)throw Error(error);return m;
}
export function shareUrl(m: Maze){const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('maze',encode(m));return u.href;}
export const PLAYER_RADIUS=.19;
export function canOccupy(m: Maze,p: Point): boolean {
  for(let y=Math.floor(p.y-PLAYER_RADIUS);y<=Math.floor(p.y+PLAYER_RADIUS);y++)for(let x=Math.floor(p.x-PLAYER_RADIUS);x<=Math.floor(p.x+PLAYER_RADIUS);x++)if(wall(m,x,y)){
    const dx=p.x-Math.max(x,Math.min(x+1,p.x)),dy=p.y-Math.max(y,Math.min(y+1,p.y));if(dx*dx+dy*dy<PLAYER_RADIUS**2-1e-10)return false;
  }return true;
}
export function move(m: Maze,p: Point,dx: number,dy: number): {point: Point;hit: boolean;distance: number} {
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.055)),n={...p};let hit=false,distance=0;
  for(let i=0;i<steps;i++) {const old={...n};if(canOccupy(m,{x:n.x+dx/steps,y:n.y}))n.x+=dx/steps;else hit=true;if(canOccupy(m,{x:n.x,y:n.y+dy/steps}))n.y+=dy/steps;else hit=true;distance+=Math.hypot(n.x-old.x,n.y-old.y);}
  return {point:n,hit,distance};
}
// Exact grid DDA: stop at the FIRST wall surface, never inside or beyond a wall.
export function castRay(m: Maze,p: Point,angle: number,range: number): Point {
  const dx=Math.cos(angle),dy=Math.sin(angle),sx=dx>=0?1:-1,sy=dy>=0?1:-1;
  let x=Math.floor(p.x),y=Math.floor(p.y),tx=Math.abs(((sx>0?x+1:x)-p.x)/dx),ty=Math.abs(((sy>0?y+1:y)-p.y)/dy),t=0;
  const stepx=Math.abs(1/dx),stepy=Math.abs(1/dy);
  while(t<range){if(tx<ty){t=tx;tx+=stepx;x+=sx;}else{t=ty;ty+=stepy;y+=sy;}if(t>=range)break;if(wall(m,x,y))return {x:p.x+dx*t,y:p.y+dy*t};}
  return {x:p.x+dx*range,y:p.y+dy*range};
}
export function visibility(m: Maze,p: Point,range: number): Point[] {
  const angles: number[]=[];for(let i=0;i<256;i++)angles.push(i*Math.PI*2/256-Math.PI);
  for(let y=Math.max(0,Math.floor(p.y-range));y<=Math.min(m.size,Math.ceil(p.y+range));y++)for(let x=Math.max(0,Math.floor(p.x-range));x<=Math.min(m.size,Math.ceil(p.x+range));x++){
    const a=Math.atan2(y-p.y,x-p.x);angles.push(a-1e-7,a,a+1e-7);
  }return angles.sort((a,b)=>a-b).map(a=>castRay(m,p,a,range));
}
