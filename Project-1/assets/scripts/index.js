"use strict";


const darkModeColors = ["darkturquoise","#f1f3f5","#1d1f20","#4d4f50","#bbb"];
const lightModeColors = ["darkcyan","#4d4f50","#f1f3f5","#bbb","#5d5f60"];

const modeButton = document.getElementById("m-button");

const cf = document.getElementById("cf");
const fc = document.getElementById("fc");
const cfv = document.getElementById("cf-inf");
const fcv = document.getElementById("fc-inf");
let mode = false

function swapMode(){
    mode = !mode;
    if(mode){
        modeButton.innerHTML = "light mode";
        const styles = document.querySelector(":root").style;
        styles.setProperty("--bl", lightModeColors[0]);
        styles.setProperty("--bg", lightModeColors[1]);
        styles.setProperty("--it", lightModeColors[2]);
        styles.setProperty("--ut", lightModeColors[3]);
        styles.setProperty("--vl", lightModeColors[4]);
    }else{
        modeButton.innerHTML = "dark mode";
        const styles = document.querySelector(":root").style;
        styles.setProperty("--bl", darkModeColors[0]);
        styles.setProperty("--bg", darkModeColors[1]);
        styles.setProperty("--it", darkModeColors[2]);
        styles.setProperty("--ut", darkModeColors[3]);
        styles.setProperty("--vl", darkModeColors[4]);
    }
}


function cToF(num){
    if(!(/[^\d\.\-]/g.test(num)||cf.value=='')){
        num = parseFloat(num);
        let nnum = (Math.round((num*1.8+32)*100)/100);
        cfv.innerHTML = num + "℃ is " + nnum + "℉"
    }else{
        cfv.innerHTML = "please input a valid number";
    }
}

function fToC(num){
    if(!(/[^\d\.\-]/g.test(num)||cf.value=='')){
        num = parseFloat(num);
        let nnum = (Math.round((num-32)*5/9*100)/100);
        fcv.innerHTML = num + "℉ is " + nnum + "℃"
    }else{
        fcv.innerHTML = "please input a valid number";
    }
}

