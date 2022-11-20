import { Omniscent } from 'omniscent';


const canvas = document.getElementById('main-canvas');

const controls = {
    play: document.getElementById('control-play'),
    hardwareRenderer: document.getElementById('control-hardware-renderer'),
    midiOutput: document.getElementById('control-midi-output'),
};

const OMNISCENT = new Omniscent(canvas);


let frameCounter = 0;
requestAnimationFrame(function _onRender() {
    OMNISCENT.onRender();
    ++frameCounter;
    requestAnimationFrame(_onRender);
});
setInterval(function() {
    document.getElementById('fps').innerHTML = 'FPS: ' + frameCounter;
    frameCounter = 0;
}, 1000);

function run() {
    if(!OMNISCENT.running) {
        OMNISCENT.start().then(() => {
            controls.play.value = 'Play';
        });
    } else OMNISCENT.stop();
}

controls.play.addEventListener('click', e => {
    run();
    controls.play.value = OMNISCENT.running ? 'Stop' : 'Play';
});

controls.hardwareRenderer.addEventListener('click', e => {
    OMNISCENT.useHardwareRenderer = controls.hardwareRenderer.checked;
});

controls.midiOutput.addEventListener('click', e => {
    const midiOutput = controls.midiOutput.checked;
    OMNISCENT.midi.setVolume(midiOutput);
});
