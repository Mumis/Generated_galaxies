import { Background } from "./Entities/Galaxy/Background";
import { Renderer } from "./Renderer/Renderer";
import { GalaxyGenerator } from "./Entities/Galaxy/GalaxyGenerator";

const canvas = document.getElementById("webgl") as HTMLCanvasElement;

const renderer = new Renderer(canvas);



const background = new Background();


const main = new GalaxyGenerator(canvas, {
    rotationX: 0.005,
    rotationY: 0,
    rotationZ: 0.05,
    positionXOffset: 0,
    positionYOffset: 0,
    positionZOffset: 0,
});

const main2 = new GalaxyGenerator(canvas, {
    rotationX: 0.1,
    rotationY: 0,
    rotationZ: -0.25,
    positionXOffset: -4,
    positionYOffset: 0,
    positionZOffset: -10,
});

renderer.addEntity(background);
renderer.addEntity(main);
renderer.addEntity(main2);

renderer.start();


const speedSlider = document.getElementById("speed_slider") as HTMLInputElement;
const speedText = document.getElementById("speed_text") as HTMLSpanElement;
speedText.innerText = speedSlider.value;

speedSlider.addEventListener("change", function(ev: any) {
    renderer.targetSpeed = ev.target.value;
    speedText.innerText = ev.target.value;
});


document.getElementById("controls")?.addEventListener("click", function() {
    renderer.enableControls();
});

document.getElementById("nocontrols")?.addEventListener("click", function() {
    renderer.disableControls();
});

