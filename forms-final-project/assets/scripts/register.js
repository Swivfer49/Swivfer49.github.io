"use strict";

const form = document.getElementById('form');

const inputs = form.querySelectorAll('input[type="text"]');
const button = form.querySelector('input[type="button"]#sub');
const closeBtn = form.querySelector('input[type="button"]#close');
inputs[0].theAddon = "name";
inputs[1].theAddon = "password";
let vl = false
closeBtn.addEventListener('click', function closeRegister(){
    window.location.assign('index.html?valid='+vl);
});

button.addEventListener('click', function(){
    let v = true;
    if(inputs[0].value != "" && (!(/[^a-zA-Z0-9]/g.test(inputs[0].value)))){
        ConsiderValid(inputs[0]);
    }else{
        ConsiderInvalid(inputs[0]);
        v = false;
    }

    if(inputs[1].value != ""){
        ConsiderValid(inputs[1]);
    }else{
        ConsiderInvalid(inputs[1]);
        v = false;
    }

    if(v){
        ConsiderValid(form);
        closeBtn.value = "return";
        closeBtn.classList.add('now-valid');
    }else{
        ConsiderInvalid(form);
    }
    vl = v;
});

function ConsiderInvalid(element){
    element.style.border = "1px solid red";
    element.style.boxShadow = "0px 0px 5px 2px #ff000040";
    element.fVal = element.placeholder;
    element.value = "";
    element.placeholder = "please input valid "+element.theAddon;
    element.addEventListener('input', function resetValidation(){
        this.style.border = "";
        element.style.boxShadow = "";
        this.placeholder = this.fVal;
        this.removeEventListener('input', resetValidation);
    });
}
function ConsiderValid(element){
    element.style.border = "1px solid green";
    element.style.boxShadow = "0px 0px 5px 2px #00ff0040";
    element.addEventListener('input', function resetValidation(){
        this.style.border = "";
        element.style.boxShadow = "";
        this.removeEventListener('input', resetValidation);
    });
}
