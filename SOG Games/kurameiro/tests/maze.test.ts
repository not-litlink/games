import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generate,shortestPath,validate,encode,decode,move,canOccupy,castRay,visibility,wall,center,cellSteps,visionFor,type Maze} from '../src/maze.ts';
for(const size of [9,15,21])test(`${size}×${size}: 200個の到達性・分岐・ループ・行き止まり`,()=>{
  for(let k=0;k<200;k++){const m=generate(size);assert.equal(validate(m),null);assert.ok(shortestPath(m).length>=size-2);let vertices=0,edges=0,dead=0,branches=0;
    for(let i=0;i<m.cells.length;i++)if(!m.cells[i]){vertices++;const x=i%size,y=Math.floor(i/size),degree=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>!wall(m,x+a,y+b)).length;edges+=degree;if(degree===1)dead++;if(degree>=3)branches++;}
    assert.ok(dead>0);assert.ok(branches>0);assert.ok(edges/2>=vertices,'少なくとも1つループがある');
  }
});
test('共有URL: 全サイズの損失なし往復',()=>{for(const n of [9,15,21]){const m=generate(n);assert.deepEqual(decode(encode(m)),m);assert.ok(encode(m).length<100);}});
test('壊れた共有データ、未対応形式、サイズ、壁配列を拒否',()=>{
  for(const s of ['', '!', 'a'.repeat(151),'AA','____'])assert.throws(()=>decode(s));
  const s=encode(generate(21));assert.throws(()=>decode(s.slice(0,10)+'A'+s.slice(11)));
  const m=generate(15);assert.ok(validate({...m,size:10}));assert.ok(validate({...m,cells:[0,2]}));assert.ok(validate({...m,start:{x:0,y:0}}));assert.ok(validate({...m,goal:{...m.start}}));
});
test('到達不能な編集は共有を拒否',()=>{const m=generate(15);for(let y=0;y<m.size;y++)for(let x=0;x<m.size;x++)if(Math.abs(x-m.goal.x)+Math.abs(y-m.goal.y)===1)m.cells[y*m.size+x]=1;assert.match(validate(m)!,/たどり着けません/);assert.throws(()=>encode(m));});
const room:Maze={size:9,cells:Array.from({length:81},(_,i)=>i%9===0||i%9===8||i<9||i>=72?1:0),start:{x:1,y:1},goal:{x:7,y:7}};
test('高速・斜め移動でも外周の壁を抜けない',()=>{for(const [dx,dy] of [[100,0],[-100,0],[0,100],[0,-100],[100,100],[-100,-100]]){const r=move(room,{x:4.5,y:4.5},dx,dy);assert.ok(r.hit);assert.ok(canOccupy(room,r.point));assert.ok(r.point.x>=1.19&&r.point.x<=7.81&&r.point.y>=1.19&&r.point.y<=7.81);}});
test('壁沿いに滑る・フレーム分割に影響されない',()=>{const start={x:7.8,y:2.5};const r=move(room,start,1,1);assert.ok(r.hit);assert.ok(r.point.y>3.4);let p={x:4.5,y:4.5};for(let i=0;i<60;i++)p=move(room,p,.01,0).point;const q=move(room,{x:4.5,y:4.5},.6,0).point;assert.ok(Math.hypot(p.x-q.x,p.y-q.y)<1e-9);});
test('全迷路のBFS経路を連続移動で最後まで通れる',()=>{for(const n of [9,15,21])for(let i=0;i<10;i++){const m=generate(n),path=shortestPath(m);let p=center(m.start);for(const cell of path.slice(1)){const target=center(cell);p=move(m,p,target.x-p.x,target.y-p.y).point;assert.ok(Math.hypot(p.x-target.x,p.y-target.y)<1e-8);}}});
test('視界は最初の壁で止まり、向こうの通路を見せない',()=>{const m=structuredClone(room);for(let y=1;y<8;y++)m.cells[y*9+4]=1;const p={x:2.5,y:4.5};assert.equal(castRay(m,p,0,6).x,4);for(const v of visibility(m,p,6))assert.ok(v.x<=4+1e-8);assert.ok(Math.abs(castRay(m,p,Math.PI,6).x-1)<1e-8);});
test('角で隣接壁を透過しない',()=>{const m=structuredClone(room);m.cells[3*9+4]=1;m.cells[4*9+3]=1;const p={x:3.5,y:3.5};const hit=castRay(m,p,Math.PI/4,5);assert.ok(hit.x<=4.0000001&&hit.y<=4.0000001);});

test('作問者の視界を共有し、従来のURLも標準視界で開ける',()=>{
  for(const size of [9,15,21])for(const vision of [2,2.5,3,3.5,4]){const m={...generate(size),vision};assert.deepEqual(decode(encode(m)),m);assert.equal(visionFor(decode(encode(m))),vision);}
  assert.equal(visionFor(decode('AQkBAQMB_wMGDBgwYMCA_wHAjV6z')),2.5);
  for(const vision of [0,1.5,2.6,5,NaN,Infinity])assert.throws(()=>encode({...generate(9),vision}));
});
test('改変された視界は、チェックサムが正しくても拒否',()=>{
  const code=encode({...generate(9),vision:3});const b=Uint8Array.from(atob(code.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));b[6]=9;
  let c=0x811c9dc5;for(const v of b.subarray(0,-4))c=Math.imul(c^v,16777619);new DataView(b.buffer).setUint32(b.length-4,c>>>0);
  const altered=btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');assert.throws(()=>decode(altered),/視界/);
});
test('マス数の比較は角の近道・ゴール手前で止まる場合も同じ尺度',()=>{
  for(const goal of [{x:3,y:1},{x:3,y:3}]){
    const m={...room,goal};let p=center(m.start),steps=0,distance=0;
    for(let i=0;i<200;i++){if(Math.floor(p.x)===goal.x&&Math.floor(p.y)===goal.y)break;const next=move(m,p,.04,goal.y===3?.04:0);steps+=cellSteps(p,next.point);distance+=next.distance;p=next.point;}
    assert.equal(steps,shortestPath(m).length-1);assert.ok(distance<steps);
  }
});
