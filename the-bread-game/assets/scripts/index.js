"use strict";

function constrain(v,min,max){
    if(v<min)return min;
    if(v>max)return max;
    return v;
}

function l(...values){console.log(...values);}

const canv = document.createElement('canvas');
canv.position='fixed';
canv.width = document.body.offsetWidth;
canv.height = document.body.offsetHeight;
const ctx = canv.getContext('2d');
document.body.appendChild(canv);

let paused = true;

class AndreBoxElement{
    constructor({tagname,classes,styles,id,parent}){
        this.element = document.createElement(tagname??'div');
        this.element.id=id??'';
        classes?.forEach(element=>{
            this.element.classList.add(element);
        });
        if(styles!=null)
        for(const prop in styles){
            this.element.style[prop] = styles[prop];
        }
        parent.appendChild(this.element);

    }
    remove(){
        this.element.remove();
    }
}
class Point{
    constructor(x,y){
        this.x=x;this.y=y;
        this.magValue = 0;
        this.changed = false;
    }
    setMag(v){
        if(this.mag() == 0)return this;
        let m = this.mag();
        this.div(m);
        this.mult(v);
        this.changed = false;
        this.magValue = v;
        return this;
    }
    getMag(){
        this.changed = false;
        if(!(this.x==0&&this.y==0))
        return this.magValue = Math.sqrt(this.x**2+this.y**2);
        return this.magValue = 0;
    }
    norm(){
        return this.setMag(1);
    }
    add(p){
        this.x+=p.x;
        this.y+=p.y;
        this.changed = true;
        return this;
    }
    sub(p){
        this.x-=p.x;
        this.y-=p.y;
        this.changed = true;
        return this;
    }
    mult(v){
        this.x*=v;
        this.y*=v;
        this.changed = true;
        return this;
    }
    div(v){
        return this.mult(1/v);
    }
    mag(){
        if(this.changed)return this.getMag();
        return this.magValue;
    }
    set(x,y){
        this.x=x??this.x;
        this.y=y??this.y;
        this.getMag();
        return this;
    }
    tofixed(){
        this.x=Math.round(this.x*1000)*0.001;
        this.y=Math.round(this.y*1000)*0.001;
        this.getMag();
        return this;
    }
    angle(){
        return Math.atan2(this.y,this.x);
    }
}
const Vector = {
    sub:(vector1,vector2)=>{return new Point(vector1.x-vector2.x,vector1.y-vector2.y);},
    add:(vector1,vector2)=>{return new Point(vector1.x+vector2.x,vector1.y+vector2.y);},
    create:(x,y)=>{return new Point(x,y);},
    mult:(x,y,v)=>{return new Point(x*v,y*v);},
    spl:(...vectors)=>{
        let r = [];
        vectors.forEach(element=>{
            r.push(element.x); r.push(element.y);
        });
        return r;
    },
    fromAngle(a){
        return new Point(Math.cos(a),Math.sin(a));
    },
    copy:(v)=>{
        return new Point(v.x,v.y);
    }
}
class Physics{
    constructor(x,y,vx,vy,ax,ay,mass,maxVel,airFriction,friction){
        this.pos = new Point(x,y);
        this.vel = new Point(vx??0,vy??0);
        this.acc = new Point(ax??0,ay??0);
        this.f=1/friction;this.af=1/airFriction;
        this.mass = mass; this.m = maxVel;
        this.air = true;
        this.freeze = false;
    }
    update(){
        if(this.freeze){
            this.vel.mult(0.8);
        }
        this.pos.add(this.vel);
        this.vel.add(this.acc);
        this.vel.tofixed()
        this.pos.tofixed()
        this.acc.set(0,0);
        if(this.vel.mag()>this.m)this.vel.setMag(this.m);
        if(this.air)this.vel.mult(this.af);
        else this.vel.mult(this.f);
    }
    applyForce(x,y){
        this.acc.add(new Point(x,y).div(this.mass));
    }
}

class PhysicsElement extends AndreBoxElement{
    constructor(o,x,y,width,height,mass,maxVelocity,airFriction,friction,velocity,acceleration){
        super(o);
        this.element.style.position = 'fixed';
        this.element.style.top = y;
        this.element.style.left = x;
        this.phy = new Physics(x,y,velocity?.x,velocity?.y,acceleration?.x,acceleration?.y,mass,maxVelocity,airFriction,friction);
        this.w=width;this.h=height;
    }
    setPos(x,y){
        this.phy.pos.set(x,y);
        this.element.style.top = this.phy.pos.y;
        this.element.style.left = this.phy.pos.x;
    }
    update(){
        this.phy.update();
        this.element.style.top = this.phy.pos.y;
        this.element.style.left = this.phy.pos.x;
    }
}


class Player{
    constructor(o,x,y,width,height,mass,maxVelocity,airFriction,friction,velocity,acceleration){
        this.phy = new PhysicsElement(o,x,y,width,height,mass,maxVelocity,airFriction,friction,velocity,acceleration);
        this.pos = this.phy.phy.pos;
        this.vel = this.phy.phy.vel;
        this.acc = this.phy.phy.acc;
        this.e = this.phy.element;

        this.width = width;
        this.height = height;


        this.body = document.createElement('div');
        this.body.id = 'player-body';
        this.e.appendChild(this.body);
        
        this.weapon = document.createElement('div');
        this.weapon.id = 'player-weapon';
        this.e.appendChild(this.weapon);
        
        this.hor = 0;

        this.timeManager = new TimeManager();
        this.triggerManager = new TriggerManager();

        this.triggerManager.add('a',['a','A'],()=>{
            this.hor = (-this.triggerManager.triggers.a)+(this.triggerManager.triggers.d);
        },()=>{
            this.hor = (-this.triggerManager.triggers.a)+(this.triggerManager.triggers.d);
        });
        this.triggerManager.add('d',['d','D'],()=>{
            this.hor = (-this.triggerManager.triggers.a)+(this.triggerManager.triggers.d);
        },()=>{
            this.hor = (-this.triggerManager.triggers.a)+(this.triggerManager.triggers.d);
        });
        this.triggerManager.add('w',['w','W'],()=>{
            if(this.phy.phy.air){
                //console.log(this.phy.phy.acc.y)
                this.phy.phy.vel.y = -35;
            this.phy.phy.air = false;
            }
        });
        
        this.timeManager.events.swing = new TimeEvent(10,null,false,()=>{this.swing();},false,null);
        
        this.timeManager.events.damage = new TimeEvent(10,(e,em)=>{
            
        },false,(e)=>{

        },false,(e,em)=>{

        });
    }
    update(){
        this.timeManager.frame();
        this.phy.phy.acc.y+=2;
        this.phy.phy.vel.x+= this.hor;
        this.phy.update();
        this.pos.x = constrain(this.pos.x,0,environment.width-this.width);
        if(this.phy.phy.pos.y>=environment.height-(60+this.phy.h)){
            this.phy.setPos(null,environment.height-(60+this.phy.h));
            if(this.phy.phy.vel.y>0)this.phy.phy.vel.y = 0;
            if(!this.phy.phy.air){LandAudio.currentTime = 0;LandAudio.play();}
            this.phy.phy.air = true;
        }else this.phy.phy.air = false;
    }
    center(){
        return Vector.add(this.pos,Vector.create(this.width*0.5,this.height*0.5));
    }
    swing(){
        if(Mouse.x==0&&Mouse.y==0)return false;
        let d = new Point(...Vector.spl(Mouse));
        let c = this.center();
        d.sub(c);
        d.setMag(100);
        d.add(c);
        let hits = environment.queryEnemies(d.x,d.y,Vector.sub(d,c));
        if(hits==0)return false;
        splatter(d.x,d.y,'#0f800f40',hits*environment.playerDamage*40);
        AttackAudio.play();
        d.sub(c);
        this.phy.phy.applyForce(-d.x*hits*0.2,-d.y*hits*0.2);
        this.timeManager.events.swing.doFrame = false;
    }
}


class Enemy{
    constructor(o,x,y,width,height,
        mass,maxVelocity,
        airFriction,friction,
        velocity,acceleration,
        speed,health,damage,jump,
        target,range){
        
        this.phy = new PhysicsElement(o,x,y,width,height,mass,maxVelocity,airFriction,friction,velocity,acceleration);
        this.pos = this.phy.phy.pos;
        this.vel = this.phy.phy.vel;
        this.acc = this.phy.phy.acc;
        this.e = this.phy.element;

        this.speed = speed;
        this.health = health;
        this.damage = damage;
        this.jump = jump;
        this.target = target;
        this.range = range;

        this.width = width;
        this.height = height;


        this.body = document.createElement('div');
        this.body.id = 'enemy-body';
        this.e.appendChild(this.body);
        
        this.weapon = document.createElement('div');
        this.weapon.id = 'enemy-weapon';
        this.e.appendChild(this.weapon);
        
        this.hor = 0;

        this.timeManager = new TimeManager();
        //this.triggerManager = new TriggerManager();
        
        this.timeManager.events.swing = new TimeEvent(20,()=>{this.swing()}
        ,false,(e,em)=>{
            let d = target.center();
            if(d.x==0&&d.y==0)return false;
            let c = this.center();
            d.sub(c);
            d.setMag(this.range);
            this.phy.element.style.boxShadow = `${d.x}px ${d.y}px 2px 4px #0f800f40`;
            d.add(c);
            this.swingPos = d;
            this.freeze();
        },false,null);
        this.contactSinceFrozen = true;
        
    }
    update(){
        this.timeManager.frame();
        if(this.phy.phy.freeze)return false;
        this.acc.y+=2;
        this.acc.x = this.hor;
        this.phy.update();
        if(this.pos.y>=environment.height-(60+this.phy.h)){
            this.phy.setPos(null,environment.height-(60+this.phy.h));
            if(this.vel.y>0)this.vel.y = 0;
            if(!this.phy.phy.air){SlimeLandAudio.currentTime = 0;SlimeLandAudio.play();}
            this.phy.phy.air = true;
            this.contactSinceFrozen = true;
        }else this.phy.phy.air = false;
    }
    ai(){
        if(!this.contactSinceFrozen)return false;
        let c = this.target.center();
        let tc = this.center();
        let dc = Vector.sub(c,tc);
        if(dc.x>-this.range&&dc.x<this.range){
            if(this.timeManager.events.swing.end)
            return this.timeManager.events.swing.restart();
        }
        horizontal:{
            if(dc.x>this.range){
                this.hor = 1*this.speed;
                break horizontal;
            }
            if(dc.x<-this.range){
                this.hor = -1*this.speed;
                break horizontal;
            }
            if(dc.x<this.range){
                this.hor = -0.5*this.speed;
                break horizontal;
            }
            if(dc.x>-this.range){
                this.hor = 0.5*this.speed;
                break horizontal;
            }
            this.hor = 0;
        }
        vertical:{
            if(dc.y<0){
                this.performJump();
            }
        }
        
    }
    center(){
        return Vector.add(this.pos,Vector.create(this.width*0.5,this.height*0.5));
    }
    performJump(){
        if(this.phy.phy.air){
            this.phy.phy.vel.y = -this.jump;
            this.phy.phy.air = false;
        }
    } 
    swing(){
        let d = this.swingPos;
        if(environment.queryPlayer(d.x,d.y,this.damage)){
            splatter(d.x,d.y,'#80702040',this.damage*40);
            SlimeHitAudio.play();
        }
        this.phy.element.style.boxShadow = '';
        this.phy.phy.freeze = false;
    }
    freeze(){
        this.phy.phy.freeze = true;
        this.contactSinceFrozen = false;
    }
    unfreeze(){
        this.phy.phy.freeze = false;
    }
}

class TimeManager{
    constructor(){
        this.events = {};
    }
    frame(){
        for(const prop in this.events){
            this.events[prop].frame(this);
            if(this.events[prop].end)continue;
            if(this.events[prop].time<=0){
                this.events[prop].frame(this);
            }
        }
    }
}
class TimeEvent{
    constructor(time,callback,loop,onstart,start,perFrame){
        this.time = time;
        this.initialTime = time;
        this.callback = callback;
        this.onstart = onstart;
        this.loop = loop??false;
        this.end = (!start)??false;
        this.perFrame = perFrame;
        this.doFrame = !this.end;
    }
    restart(){
        this.time = this.initialTime;
        this.end = false;
        this.doFrame = true;
        this.onstart?.(this);
    }
    frame(em){
        if(this.end)return;
        this.time--;
        if(this.time<=0)return this.onEnd(em);
        if(this.doFrame)
        this.perFrame?.(this,em);
    }
    onEnd(em){
        this.end = true;
        this.doFrame = false;
        this.callback?.(this,em);
        if(this.loop)this.restart();
    }
}
class TriggerManager{
    constructor(){
        this.events = {};
        this.callbacks = {};
        this.triggers = {};
        window.addEventListener('keydown',(e)=>{
            this.trigger(e.key);
        },true);
        window.addEventListener('keyup',(e)=>{
            this.detrigger(e.key);
        },true);
    }
    add(triggerName,ch,callback,callback2){
        for(let i in ch){
            this.events[ch[i]] = triggerName;
        }
        this.callbacks[triggerName] = callback;
        this.callbacks[triggerName+'2'] = callback2;
        this.triggers[triggerName] = false;
    }
    trigger(key){
        if(!this.events.hasOwnProperty(key))return null;
        let tn = this.events[key];
        let t = this.triggers[tn];
        this.triggers[tn] = true;
        if(!t)return this.callbacks[tn]?.(key,tn,t);
        return null;
    }
    detrigger(key){
        if(!this.events.hasOwnProperty(key))return null;
        let tn = this.events[key];
        let t = this.triggers[tn];
        this.triggers[tn] = false;
        if(t)return this.callbacks[tn+'2']?.(key,tn,t);
        return null;
    }
}

const Mouse = {
    x:1,y:1,px:1,py:1
}

window.addEventListener('mousemove',(e)=>{
    Mouse.px = Mouse.x;
    Mouse.py = Mouse.y;
    Mouse.x = constrain(e.clientX,0.1,document.body.offsetWidth);
    Mouse.y = constrain(e.clientY,0.1,document.body.offsetHeight);
    MouseMove(e);
});

window.addEventListener('mousedown',()=>{
    if(environment?.player?.timeManager?.events?.swing?.end)
    environment.player.timeManager.events.swing.restart();

    
});

class EnemyPrefab{
    constructor({width,height,damage,speed,range,health,o,mass,maxVel,friction,airFriction,jump,cooldown,color}){
        this.width=width;this.height=height;
        this.damage = damage??1; this.health = health??3;
        this.speed = speed??2;
        this.range = range??45;
        this.o=o;
        this.friction=friction??1.1;
        this.airFriction=airFriction??1.04;
        this.mass=mass??1;
        this.maxVel=maxVel??30;
        this.jump=jump??10;
        this.cooldown=cooldown??20;
        this.color = color??'#00ff0040';
    }
    createEnemy(x,y,v,a,player){
        return new Enemy(this.o,x,y,this.width,this.height,this.mass,this.maxVel,this.airFriction,this.friction,v,a,this.speed,this.health,this.damage,this.jump,player,this.range);
    }
}

const standardEnemy = new EnemyPrefab({width:50,height:50,
    o:{
    tagname:'div',parent:document.body,classes:['enemy','physics','entity-container'],styles:{width:50,height:50,backgroundColor:'green',border:'2px solid lime'},id:'enemy-container'
    },speed:0.2,range:6,jump:25,cooldown:30
})
const decentEnemy = new EnemyPrefab({width:50,height:50,
    o:{
    tagname:'div',parent:document.body,classes:['enemy','physics','entity-container'],styles:{width:50,height:50,backgroundColor:'red',border:'2px solid lime'},id:'enemy-container'
    },speed:0.4,range:2,jump:50,cooldown:10,color:'#800f0f40',health:5,damage:2
})
const jumpyEnemy = new EnemyPrefab({width:50,height:50,
    o:{
    tagname:'div',parent:document.body,classes:['enemy','physics','entity-container'],styles:{width:50,height:50,backgroundColor:'green',border:'2px solid lime'},id:'enemy-container'
    },speed:0.07,range:40,jump:50,cooldown:30,damage:5,health:2,airFriction:1.5
})

var environment = {
}

const JazzMusic = new Audio('assets/jazz.mp3');
JazzMusic.type = 'audio/mp3';
const AttackAudio = new Audio('assets/attack.wav');
AttackAudio.type = 'audio/wav';
const SlimeLandAudio = new Audio('assets/slime-land.wav');
SlimeLandAudio.type = 'audio/wav';
const SlimeHitAudio = new Audio('assets/slime-hit.wav');
SlimeHitAudio.type = 'audio/wav';
const LandAudio = new Audio('assets/land.wav');
LandAudio.type = 'audio/wav';
const GOLandAudio = new Audio('assets/firstland.wav');
GOLandAudio.type = 'audio/wav';


var player = null;


function frame(){
    if(paused)return;
    environment.frame();
    window.requestAnimationFrame(frame);
}


function MouseMove(e){
    if(paused)return false;
    if(Mouse.x==0&&Mouse.y==0)return false;
    let d = new Point(...Vector.spl(Mouse));
    let c = player.center();
    d.sub(c);
    //d.setMag(100);
    if(d.x>0)player.phy.element.style.transform = '';
    if(d.x<0)player.phy.element.style.transform = 'rotateY(180deg)';
    //player.phy.element.style.boxShadow = `${-d.x}px ${d.y}px 4px 2px #800f0f20`

}

function splatter(x,y,color,intensity){
    ctx.fillStyle = color;
    for(let i=0;i<intensity/2;i++){
        ctx.fillRect(((Math.random()-0.5)*intensity*2)+x,((Math.random()-0.5)*intensity*2)+y,Math.random()*intensity,Math.random()*intensity);
    }
    
}

function gameStart(){
    environment.healthBar = new AndreBoxElement({tagname:'div',classes:['bar'],styles:{
        position:'fixed',
        top: 10,
        left: 10,
        width: 100,
        height: 26,
        border: '1px solid black'
    },id:'health-bar',parent:document.body});

    environment.hBarBar = new AndreBoxElement({tagname:'div',styles:{
        margin: 3,
        height: '100%',
        width: 94*(environment.playerHealth/environment.maxHealth),
        backgroundColor: 'red'
    },parent:environment.healthBar.element})
    environment.onEnemyDie();
    window.requestAnimationFrame(frame);
}

function gameOver(){
    paused = true;
    environment.player.phy.element.remove();
    environment.player = null;
    environment.enemies.forEach(element=>{
        element.phy.element.remove();
    });
    environment.floor.element.remove();
    environment.floor = null;
    environment.enemies = [];
    environment.healthBar.element.remove();
    let endm = document.createElement('div');
    let hs = localStorage.hasOwnProperty('breadHighscore')? localStorage.getItem('breadHighscore'):0;
    document.body.appendChild(endm);
    endm.id = 'end-menu';
    endm.innerHTML = '<div id="gameover">Game Over</div><div id="score-end">Your score: '+environment.points+'</div><div id="highscore">your highscore: '+hs+'</div><div id="restart-button" onclick="this.parentNode.remove();startGame()">restart</div>';
    if(environment.points>hs)localStorage.setItem('breadHighscore',environment.points);
    
    JazzMusic.pause();
    GOLandAudio.play();
}


startGame();


function startGame() {
    
    environment = {
        points: 0,
        playerHealth:10,
        maxHealth:10,
        playerDamage:1,
        enemies: [],
        enemyPrefabs: [standardEnemy,decentEnemy],
        boss: null,
        player: new Player({tagname:'div',parent:document.body,classes:['player','physics','entity-container'],styles:{visibility: 'hidden'},id:'player-container'},
        document.body.offsetWidth/2-25,-60,50,50,1,50,1.12,1.04),
        floor: new AndreBoxElement({tagname:'div',classes:['floor'],styles:{
            position: 'fixed',
            top: document.body.offsetHeight - 60,
            left: 0,
            width: document.body.offsetWidth,
            height: 60,
            backgroundColor: 'grey',
            visibility: 'hidden'
        },id:'floor',parent:document.body}),
        width: document.body.offsetWidth,
        height: document.body.offsetHeight,
        frame: function envframe(){
            this.player.update();
            this.enemies.forEach(element=>{
                element.ai();
                element.update();
            });
        },
        queryEnemies: function(x,y,force){
            let n = [];
            let t = 0;
            this.enemies.forEach((element,index,array)=>{
                const x1 = element.pos.x;
                const y1 = element.pos.y;
                const x2 = x1 + element.width;
                const y2 = y1 + element.height;
                if(x>=x1&&x<=x2&&y>=y1&&y<=y2){
                    element.health-=this.playerDamage;
                    t++;
                    if(element.health<=0){
                        this.points++;
                        t++;
                        this.enemyCount--;
                        this.onEnemyDie();
                        element.isDead = true;
                    }else{
                        element.phy.phy.applyForce(force.x,force.y);
                    }
                }
            });
            this.enemies.forEach((element,ind)=>{
                if(element.isDead??false){
                    element.phy.remove();
                    this.enemies.splice(ind,1);
                }
            })
            return t;
        },
        queryPlayer: function(x,y,d){
            const x1 = player.pos.x;
            const y1 = player.pos.y;
            const x2 = x1 + player.width;
            const y2 = y1 + player.height;
            if(x>=x1&&x<=x2&&y>=y1&&y<=y2){
                this.playerHealth-=d;
                this.hBarBar.element.style.width = 94*(this.playerHealth/this.maxHealth);
                if(this.playerHealth<=0){
                    gameOver();
                }
                return true;
            }
            return false;
        },
        enemyCount: 0,
        enemyMax: 1,
        onEnemyDie: function(){
            if(this.points*0.1>this.enemyMax)this.enemyMax++;
            let numToSpawn = this.enemyMax - this.enemyCount;
            if(numToSpawn>0)
            for(let i=0;i<numToSpawn;i++){
                let interval = setInterval(()=>{
                    let side = Math.round((Math.random()-0.5)*2);
                    let enemy = this.enemyPrefabs[Math.min(Math.round(this.points*0.1),this.enemyPrefabs.length-1)];
                    this.enemies.push(enemy.createEnemy( (side*this.width*0.5)+this.width*0.5 , 0 , Vector.create(-side*10,0), null, this.player ));
                    clearInterval(interval)
                },2000);
                this.enemyCount++;
            }
            
        },
        
    }
    player = environment.player;
    let startMenu = new AndreBoxElement({
        tagname: 'div', classes: ['cover-screen'], id: 'menu-screen', styles: {
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            top: 0, left: 0,
            background: 'radial-gradient(circle, #00000000 0%, #000 100%)',
        }, parent: document.body
    });

    startMenu.element.innerHTML = '<div id="start-button">Begin</div>';
    startMenu.element.querySelector('div#start-button').addEventListener('click', () => {
        startMenu.element.style.background = 'radial-gradient(circle, #000 0%, #000 100%)';
        startMenu.element.innerHTML = '';
        let iv1 = setInterval(() => {
            clearInterval(iv1);
            GOLandAudio.play();
            startMenu.element.innerHTML = '<div id="start-title">The Bread Game</div>';
            let iv2 = setInterval(() => {
                clearInterval(iv2);
                startMenu.element.style.background = 'radial-gradient(circle, #00000000 0%, #000 100%)';
                player.phy.element.style.visibility = '';
                environment.floor.element.style.visibility = '';
                startMenu.element.innerHTML = '';
                let iv3 = setInterval(() => {
                    clearInterval(iv3);
                    startMenu.element.remove();
                    gameStart();
                    paused = false;
                    let iv4 = setInterval(() => {
                        clearInterval(iv4);
                        JazzMusic.loop = true;
                        JazzMusic.play();
                    }, 1000);
                }, 2000);
            }, 2000);

        }, 2000);
    });
}

