
HTMLElement.prototype.applyStyle = function(o){
    for(const prop in o){
        this.style[prop] = o[prop];
    }
}

class Mode{
    constructor(ar){
        for(const prop in ar){
            this[prop] = ar[prop];
        }
    }
}
class ModeChanger{
    constructor(am, defaultObj){
        this.modes = {};
        for(const prop in am){
            this.modes[prop] = am[prop];
        }
        this.defObj = defaultObj;
        this.mode = "";
    }
    setMode(modeName){
        if(this.modes.hasOwnProperty(modeName)){
            this.mode = modeName;
            for(const prop in this.modes[modeName]){
                if(prop == "back"){
                    document.getElementsByTagName("body")[0].style.backgroundColor = this.modes[modeName][prop];
                    continue;
                }
                let s = "--";
                for(let p in prop){
                    if(/[A-Z]/.test(prop[p]))
                    s+="-";
                    s+=prop[p].toLocaleLowerCase();
                }
                this.defObj.style.setProperty(s,this.modes[modeName][prop]);
            }
        }
    }
}

/*
     --button-width: 80px;
    --button-spacing: 15px;
    --button-font-size: 30px;
    --background-color: #EFEEEE;
    --button-click: rgb(220, 245, 255);
    --button-shadow-i: #d1cdc780;
    --button-shadow-ii: #FFFFFF80;
    --button-text: gray;
 */


function random(min, max){
    let d = max - min;
    return Math.floor(Math.random()*d) + min;
}



const pad = document.getElementById("pad");

const output = pad.querySelector("#output");

const buttons = pad.querySelector("#buttons");

const buttonOptions = [
    ["1","2","3","*÷"],
    ["4","5","6","*×"],
    ["7","8","9","*+"],
    ["0","*.","*-","*="  ]];
const buttonValues = [
    ["1","2","3","/"],
    ["4","5","6","*"],
    ["7","8","9","+"],
    ["0",".","-","="   ]];
const buttonElements = [];

for(let i=0;i<buttonOptions.length;i++){

    const row = document.createElement("div");
    row.classList.add("buttonRow");
    buttons.appendChild(row);
    buttonElements[i] = [];
    for(let j=0;j<buttonOptions[i].length;j++){
        const bu = document.createElement("input");
        row.appendChild(bu);
        if(buttonOptions[i][j].startsWith(":")){
            bu.classList.add("double-button");
            buttonOptions[i][j] = buttonOptions[i][j][1];
        }
        else if(buttonOptions[i][j].startsWith("*")){
            bu.classList.add("operation-button");
            buttonOptions[i][j] = buttonOptions[i][j][1];
        }
        bu.classList.add("button");
        bu.buttonValue = buttonValues[i][j];
        bu.value = buttonOptions[i][j];
        bu.id = buttonOptions[i][j];
        bu.type = "button";
        bu.addEventListener('click',function(){
            pressButton(this);
        })
        bu.classList.add("card")
        buttonElements[i][j] = bu;
    }
}


function pressButton(v){
    if(v.buttonValue=="="){
        try{
            eval(`output.innerHTML = ${output.innerHTML};`);
        }
        catch(err){
            output.innerHTML = "ERROR";
        }
    }else{
        output.innerHTML += v.buttonValue;
    }
}


const Modes = new ModeChanger({
    dark: {
        buttonShadowI: "#0c0d0f80",
        buttonShadowIi: "#7c7d7f80",
        buttonText: "white",
        backgroundColor: "#3d3f40",
        back: "#3d3f40",
        buttonClick: "darkcyan"
    },
    light: {
        buttonShadowIi: "#FFFFFF80",
        buttonShadowI: "#d1cdc780",
        buttonText: "gray",
        backgroundColor: "#EFEEEE",
        back: "#EFEEEE",
        buttonClick: "rgb(220, 245, 255)"
    }
    ,
    glow: {
        buttonShadowIi: "#FFFFFF80",
        buttonShadowI: "#d1cdc780",
        buttonText: "gray",
        backgroundColor: "#EFEEEE",
        back: "#3d3f40",
        buttonClick: "rgb(220, 245, 255)"
    }
}, document.querySelector(":root"));

Modes.setMode("dark");

