"use strict";

const form = document.getElementById('search-bar');
const searchText = form.querySelector('input[type="text"]');
const buttons = form.querySelectorAll('input[type="button"]');
if(!window.location.href.endsWith('valid=true')){
    buttons[1].disabled = 'true';
    buttons[0].disabled = 'true';
    searchText.placeholder = "you must login or sign up to search";
}
const loginBack = document.querySelector('.center.login-back');
const loginMenu = document.querySelector('#login-menu form');
loginBack.style.visibility = 'hidden';
const loginInputs = loginMenu.querySelectorAll('input[type="text"]');
const sub = loginMenu.querySelector('#sub');
const clo = loginMenu.querySelector('#close');

const loginButton = document.getElementById('logbtn');
loginButton.addEventListener('click', () => {
    loginBack.style.visibility = '';
});
searchText.theAddon = "input";
loginInputs[0].theAddon = "username";
loginInputs[1].theAddon = "password";
function closeLogin(){
    loginBack.style.visibility = 'hidden';
}
clo.addEventListener('click', closeLogin);

sub.addEventListener('click', function(){
    let v = true;
    if(loginInputs[0].value.trim() === "Dave"){
        ConsiderValid(loginInputs[0]);
    }else{
        ConsiderInvalid(loginInputs[0]);
        v = false;
    }
    if(loginInputs[1].value.trim() === "LinesRImaginary"){
        ConsiderValid(loginInputs[1]);
    }else{
        ConsiderInvalid(loginInputs[1]);
        v = false;
    }
    if(v){
        ConsiderValid(loginMenu);
        clo.removeEventListener('click', closeLogin);
        clo.value = "return";
        clo.classList.add('now-valid');
        clo.addEventListener('click', function ret(){
            loginInputs[0].value = "";
            loginInputs[1].value = "";
            this.class = "";
            this.value = "close"
            buttons[0].disabled = '';
            buttons[1].disabled = '';
            loginBack.style.visibility = 'hidden';
            this.removeEventListener('click', ret);
            this.addEventListener('click', closeLogin);
            window.location.assign('index.html?valid=true');
        });
    }else{
        ConsiderInvalid(loginMenu);
    }
})

buttons[0].addEventListener('click', () => {
    let val = searchText.value.trim();
    if (val.length > 0) {
    let newUrl = 'https://www.google.com/search?q=' + val;
    window.location.assign(newUrl);
    }else{
        ConsiderInvalid(searchText);
    }
    });
buttons[1].addEventListener('click', () => {
    let val = searchText.value.trim();
    if (val.length > 0) {
    let newUrl = 'https://www.bing.com/search?q=' + val;
    window.location.assign(newUrl);
    }else{
        ConsiderInvalid(searchText);
    }
});



function ConsiderInvalid(element){
    element.style.border = "1px solid red";
    element.style.boxShadow = "0px 0px 5px 2px #ff000040";
    element.fVal = element.placeholder;
    element.value = "";
    element.placeholder = "please provide valid "+element.theAddon;
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
