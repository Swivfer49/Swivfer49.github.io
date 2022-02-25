let selectedTool="";//this indicates what tool is selected

let papers = [];//this is the array with all the sticky papers in it

let drag; //this holds the drag details

let snap = false;

let penTool;

function windowResized() {
    resizeCanvas(windowWidth, windowHeight - 56);
  }
//these are the main processing function
function setup(){//this is called at the start
    createCanvas( windowWidth, windowHeight - 56);//this determines the canvas size of the board
    penTool = new pen(color(0),3);
     drag=new dragDetails();//this initializes the drag information
     reDraw();
}


function reDraw(){
    background("#fdeca6");
  for(let i=0;i<papers.length;i++){
      papers[i].draw();
      //draws all the papers on screen
  }

  //this makes the recycling bin visible
  if(drag.isDragging==true){
      fill(0,0,250);
      rect(width-80,height-80,width,height);
  }
}

//these are the mouse events
function mousePressed(){//this is when mouse starts being pressed
    if(selectedTool=='draw'){//this draws on the notes
        lineDraw(mouseX,mouseY,pmouseX,pmouseY,penTool);
    }
    
    if(drag.isDragging==false&&(selectedTool=='move'||selectedTool=="rotate")){//this starts dragging the top paper that overlaps the mouse pointer
        papers.reverse();
        let newPapersList=[];
        let gotOne=false;
        for(let i=0;i<papers.length;i++){
            if(ptInsidePaper(createVector(mouseX,mouseY),papers[i])&&drag.isDragging==false){
                drag.startDragging(papers[i]);
                gotOne=true;
            }else{
                newPapersList.push(papers[i]);
            }
        }
        if(gotOne==true){
            newPapersList.reverse();
            newPapersList.push(drag.note);
            newPapersList.reverse();
        }
        papers=newPapersList;
        papers.reverse();
    }
    reDraw();
}
function mouseDragged(){//this is when the mouse is down and gets moved
    if(drag.isDragging==true){
        drag.durringDragging();
    }
    if(selectedTool=='draw'){//this also does drawing on the papers
        lineDraw(mouseX,mouseY,pmouseX,pmouseY,penTool);
    }
    reDraw();
}
function mouseReleased(){//this is when the mouse is released
    if(drag.isDragging==true){//this ends the dragging
        drag.endDragging();
        if(mouseX>width-80&&mouseY>height-80){
           //this deletes the dragged paper if mouse is in the recycle bin
            papers.pop();
            
        }
    }
    reDraw();
}


//these are the toolbar things
function doToolbar(){//this is called after the tool changes

//this disables or enables specific buttons

    if(selectedTool=="move"){
        document.getElementById("move-tool").disabled = true;
    }else{
        document.getElementById("move-tool").disabled = false;
    }
    if(selectedTool=="draw"){
        document.getElementById("draw-tool").disabled = true;
    }else{
        document.getElementById("draw-tool").disabled = false;
    }
    if(selectedTool=="rotate"){
        document.getElementById("rotate-tool").disabled = true;
    }else{
        document.getElementById("rotate-tool").disabled = false;
    }
    
   


}
function setTool(toolName){//this allows the html buttons to set the tool
    selectedTool=toolName;
    doToolbar();
}

function createPaper(){//this creates a paper where the mouse is
    if(drag.isDragging==false){
        let newNote=new paper(0,0,300,300);
        drag.startDragging(newNote);
        papers.push(newNote);
    }
    reDraw();
}






//these are the classes
class dragDetails{//this is a class that holds drag information

    constructor(){
        this.isDragging=false;//is dragging
        this.relativePos=createVector(0,0);//reletive pos from mouse to center of note OR relative rotation to mousse
        this.note;//the note
    }

    startDragging(note){
        this.note=note;//set the note to the note
        this.isDragging=true;//now says is dragging
        if(selectedTool=="move"){//set up for moving
            this.relativePos=p5.Vector.sub(createVector(this.note.x,this.note.y),createVector(mouseX,mouseY));
        }else if(selectedTool=="rotate"){//sex up for rotating
            this.relativePos=createVector(this.note.rot,degrees(p5.Vector.sub(createVector(this.note.x+this.note.hw,this.note.y+this.note.hh),createVector(mouseX,mouseY)).heading()));
        }
        
    }
    durringDragging(){
        if(selectedTool=="move"){//if you are trying to move the note
            let pos=p5.Vector.add(this.relativePos,createVector(mouseX,mouseY));
            if(snap){//for grid snapping
                pos.x=round(pos.x/this.note.hw)*this.note.hw;
                pos.y=round(pos.y/this.note.hh)*this.note.hh;
            }
            //keep the note on the screen
        this.note.x=constrain(pos.x,0,width-10);
        this.note.y=constrain(pos.y,0,height-10);
        }else if(selectedTool=="rotate"){//when you are rotating the note
            //get the new rotation value 
            let rot =  -this.relativePos.x + this.relativePos.y - degrees(p5.Vector.sub(createVector(this.note.x+this.note.hw,this.note.y+this.note.hh),createVector(mouseX,mouseY)).heading());
            
            if(snap){//snap to angles
                rot=round(rot/22.5)*22.5;
            }
            this.note.rot=-rot;//set the note angle
        }
        
    }
    endDragging(){//when you stop dragging
        this.isDragging=false;
    }

}
class paper{//this is a class that is a paper

    constructor(x,y,w,h){
        this.x=x;
        this.y=y;
        this.width=w;
        this.height=h;
        this.hw=w/2;
        this.hh=h/2;
        this.rot=0;
        this.display= createGraphics(this.width,this.height);//this is the image that the paper displays
        this.display.background(255,247,64);
    }

    draw(){//this draws the paper on screen
        push();
        translate(this.x+this.width*0.5,this.y+this.height*0.5);
        rotate(radians(this.rot));
        image(this.display,-this.hw,-this.hh,this.width,this.height);
        fill(0,0);
        stroke("#ffca18");
        rectMode(CORNERS);
        rect(-this.hw,-this.hh,this.hw,this.hh);
        pop();

    }

}
class pen{
    constructor(penColor,penSize){
        this.penColor=penColor;
        this.penSize=penSize;
    }
}



function ptInsidePaper(pt,ppr){//this determines if a paper intersects the mouse
    let hw=ppr.hw;
    let hh=ppr.hh;
    let ptv = ptinrelrot(pt,ppr);
    let ret=(
        ptv.x>= -hw
        &&ptv.x<=hw
        &&ptv.y>= -hh
        &&ptv.y<=hh);
    return(ret);
}

//returns the rotated distance vector
function ptinrelrot(pt,ppr){
    let hw=ppr.hw;
    let hh=ppr.hh;
    let ptv = p5.Vector.sub(createVector(ppr.x+ppr.hw,ppr.y+ppr.hh),pt);
    ptv.rotate(radians(-ppr.rot));
    return(ptv);
}
//draws a line on a specific paper
function drawOn(ppr,mx,my,pmx,pmy){
    if(snap){
        let n=37.5;
        let n2=1/n;
        mx=round(mx*n2)*n;
        my=round(my*n2)*n;
        pmx=round(pmx*n2)*n;
        pmy=round(pmy*n2)*n;
    }
    let pr = p5.Vector.sub(createVector(ppr.hw,ppr.hh),ptinrelrot(createVector(mx,my),ppr));
    let pp = p5.Vector.sub(createVector(ppr.hw,ppr.hh),ptinrelrot(createVector(pmx,pmy),ppr));
    let px=pr.x;
    let py=pr.y;
    let ppx=pp.x;
    let ppy=pp.y;
    ppr.display.line(px,py,ppx,ppy);//this is a line on the paper
}

function mLine(x1,y1,x2,y2,pen){

    

}

function lineDraw(x1,y1,x2,y2,pen){
    let d=true;
    papers.reverse();
    for(let i=0;i<papers.length;i++){
        if((ptInsidePaper(createVector(x1,y1),papers[i])||ptInsidePaper(createVector(x2,y2),papers[i]))&&d==true){
            d=false;
            if(mouseButton===LEFT){
                papers[i].display.stroke(pen.penColor);
                papers[i].display.strokeWeight(pen.penSize);
            }else{
                papers[i].display.stroke(255,247,64);
                papers[i].display.strokeWeight(13);
            }
            drawOn(papers[i],x1,y1,x2,y2);
        }
    }
    papers.reverse();
}