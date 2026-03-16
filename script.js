

const reveals = document.querySelectorAll(".reveal");

function revealOnScroll(){

reveals.forEach(el=>{

const windowHeight = window.innerHeight;
const top = el.getBoundingClientRect().top;

if(top < windowHeight - 100){
el.classList.add("active");
}

});

}

window.addEventListener("scroll", revealOnScroll);



const bars = document.querySelectorAll(".bar");

bars.forEach(bar=>{

let value = bar.dataset.value;
let fill = bar.querySelector(".fill");

setTimeout(()=>{
fill.style.height = value + "%";
},400);

});