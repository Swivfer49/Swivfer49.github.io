"use strict";

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
        this.pos = this.phy.pos;
        this.vel = this.phy.vel;
        this.acc = this.phy.acc;
        this.applyForce = (x,y)=>this.phy.applyForce(x,y);
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

class EnemyPrefab{
    constructor({
        physics:{airFriction,friction,mass,maxVel},
        element,
        ai:{canAttack,canJump,attack,speed,range}
        }
        ){
        //physics = mass, friction, maxVelocity
        //element = information to create AndreBoxElement
        //ai = functions to determine ai
        this.airFriction = 1/airFriction;
        this.friction = 1/friction;
        this.mass = mass;
        this.maxVelocity = maxVel;
        this.speed = speed;
        this.canJump = canJump;
        this.canAttack = canAttack;
        this.attack = attack;
        this.element = element;
        this.range = range;
    }
    create(x,y,vx,vy)
}

class Enemy{
    constructor(){
        this.canAttack = null;
        this.attack = null;
        this.canJump = null;
        this.canAttack = null;
    }

    update(){
        this.physics.update();
    }
}

class Player{

}

class Boss{

}

class QueryHit{
    constructor(hits,entities){
        this.hits = hits ?? 0;
        this.entities = entities;
    }
}


const Env = {
    enemies: [],boss:null,
    enemyPrefabs: {},
    player: new Player(),playerRange:70,playerRangeRadius:12,
    width: document.body.offsetWidth,
    height: document.body.offsetHeight,
    floorHeight: document.body.offsetHeight-60,
    floor: new AndreBoxElement({tagname:'div',classes:['floor'],parent:document.body,styles:{
        backgroundColor: 'grey',
        height: 60,
        width: '100vw',
        top: document.body.offsetHeight-60
    },id:'floor'}),
    update: function UpdateEnvironment(){
        
    },
    QueryEnemies: function QueryEnemies(x,y,callback){
        let hts = [];
        this.enemies.forEach((element,index,array)=>{
            let cp = new Point(
            constrain(x,element.pos.x,element.pos.x+element.width)-x,
            constrain(y,element.pos.y,element.pos.y+element.height)-y);
            let d = cp.x**2+cp.y**2;
            if(d<this.playerRangeRadius**2){
                callback(element);
                if(element.health<=0){
                    
                }
            }

        })
    }

}

