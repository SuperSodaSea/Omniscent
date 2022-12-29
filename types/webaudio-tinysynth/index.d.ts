declare class WebAudioTinySynth {
    send(data: number[]): void;
    setMasterVol(volume: number): void;
    stopMIDI(): void;
}

export = WebAudioTinySynth;
