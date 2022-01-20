"use strict";


HTMLElement.prototype.addChild = function(type){
    const ret = document.createElement(type);
    this.appendChild(ret);
    return ret;
}

HTMLElement.prototype.applyStyle = function(o){
    for(const prop in o){
        this.style[prop] = o[prop];
    }
}

function random(min, max){
    let d = max - min;
    return Math.floor(Math.random()*d) + min;
}