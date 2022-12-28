import { Omniscent } from 'omniscent';


const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
const fps = document.getElementById('fps') as HTMLDivElement;
const controlPlay = document.getElementById('control-play') as HTMLButtonElement;
const controlHardwareRenderer = document.getElementById('control-hardware-renderer') as HTMLInputElement;
const controlMidiOutput = document.getElementById('control-midi-output') as HTMLInputElement;

const OMNISCENT = new Omniscent(canvas);


let frameCounter = 0;
requestAnimationFrame(function _onRender() {
    OMNISCENT.onRender();
    ++frameCounter;
    requestAnimationFrame(_onRender);
});
setInterval(function() {
    fps.innerHTML = 'FPS: ' + frameCounter;
    frameCounter = 0;
}, 1000);

function run() {
    if(!OMNISCENT.running) {
        OMNISCENT.start().then(() => {
            controlPlay.value = 'Play';
        });
    } else OMNISCENT.stop();
}

controlPlay.addEventListener('click', () => {
    run();
    controlPlay.value = OMNISCENT.running ? 'Stop' : 'Play';
});

controlHardwareRenderer.addEventListener('click', () => {
    OMNISCENT.useHardwareRenderer = controlHardwareRenderer.checked;
});

controlMidiOutput.addEventListener('click', () => {
    const midiOutput = controlMidiOutput.checked;
    OMNISCENT.midi.setVolume(+midiOutput);
});
