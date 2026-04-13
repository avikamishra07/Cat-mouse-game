
let isPaused = false;
const rows = 20, cols = 20;
let grid = [];
let mouse = {x:0, y:0};
let cat = {x:19, y:19};
let gameRunning = true;

function initGrid(){
  grid = [];
  for(let i=0;i<rows;i++){
    grid[i]=[];
    for(let j=0;j<cols;j++){
      grid[i][j]=0;
    }
  }

  // Walls
  for(let i=5;i<15;i++) grid[i][10] = "W";

  // Random obstacles
  for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
      if(Math.random() < 0.15 && grid[i][j] === 0){
        grid[i][j] = "O";
      }
    }
  }

  // Ensure start positions are free
  grid[0][0] = 0;
  grid[19][19] = 0;
}

function heuristic(a,b){
  return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
}

function getNeighbors(node){
  let dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  let result=[];
  for(let d of dirs){
    let nx=node.x+d[0], ny=node.y+d[1];
    if(nx>=0 && ny>=0 && nx<rows && ny<cols && grid[nx][ny]!="W" && grid[nx][ny]!="O"){
      result.push({x:nx,y:ny});
    }
  }
  return result;
}

function aStar(start,goal){
  let open=[start];
  let cameFrom={};
  let gScore={};
  let fScore={};
  let key=(n)=>n.x+","+n.y;

  gScore[key(start)] = 0;
  fScore[key(start)] = heuristic(start,goal);

  while(open.length){
    open.sort((a,b)=>fScore[key(a)]-fScore[key(b)]);
    let current=open.shift();

    if(current.x==goal.x && current.y==goal.y){
      let path=[current];
      while(key(current) in cameFrom){
        current=cameFrom[key(current)];
        path.unshift(current);
      }
      return path;
    }

    for(let n of getNeighbors(current)){
      let temp = gScore[key(current)] + 1;
      if(!(key(n) in gScore) || temp < gScore[key(n)]){
        cameFrom[key(n)] = current;
        gScore[key(n)] = temp;
        fScore[key(n)] = temp + heuristic(n,goal);
        open.push(n);
      }
    }
  }
  return [];
}

function draw(){
  let g = document.getElementById("grid");
  g.innerHTML="";
  for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
      let c=document.createElement("div");
      c.classList.add("cell");

      if(i==mouse.x && j==mouse.y) c.innerHTML="🐭";
      else if(i==cat.x && j==cat.y) c.innerHTML="🐱";
      else if(grid[i][j]=="W") c.classList.add("wall");
      else if(grid[i][j]=="O") c.classList.add("obstacle");

      g.appendChild(c);
    }
  }
}

document.addEventListener("keydown",(e)=>{
  if(!gameRunning || isPaused) return;

  let nx=mouse.x, ny=mouse.y;
  if(e.key=="ArrowUp") nx--;
  if(e.key=="ArrowDown") nx++;
  if(e.key=="ArrowLeft") ny--;
  if(e.key=="ArrowRight") ny++;

  if(nx>=0 && ny>=0 && nx<rows && ny<cols && grid[nx][ny]!="W" && grid[nx][ny]!="O"){
    mouse={x:nx,y:ny};
  }
});

function loop(){
  if(!gameRunning || isPaused) return;

  let path=aStar(cat,mouse);
  if(path.length>1) cat=path[1];

  if(cat.x==mouse.x && cat.y==mouse.y){
    gameRunning=false;
    document.getElementById("gameOver").style.display="block";
  }
  draw();
}

function restartGame(){
  mouse={x:0,y:0};
  cat={x:19,y:19};
  gameRunning=true;
  isPaused=false;
  document.getElementById("gameOver").style.display="none";
  initGrid();
}

function togglePause() {
  isPaused = !isPaused;
}

initGrid();
draw();
setInterval(loop,300);
