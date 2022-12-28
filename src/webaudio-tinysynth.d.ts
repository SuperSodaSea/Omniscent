declare module 'webaudio-tinysynth' {
    export default class WebAudioTinySynth {
        send(data: number[]): void;
        setMasterVol(volume: number): void;
        stopMIDI(): void;
    }
}
