import { OmniscentMIDI } from "./OmniscentMIDI";
import { OmniscentRenderer } from "./OmniscentRenderer";


export class Omniscent {
    // Use WebGL to render model instead of original software rasterizer
    public useHardwareRenderer: boolean = false;
    
    private canvas: HTMLCanvasElement | OffscreenCanvas;
    public midi: OmniscentMIDI;
    private renderer: OmniscentRenderer;
    public running: boolean = false;
    private stopping: boolean = false;
    
    constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
        this.canvas = canvas;
        
        this.midi = new OmniscentMIDI();
        this.renderer = new OmniscentRenderer(this.canvas);

        this.reset();
    }
    
    reset() {
        this.running = false;
        this.stopping = false;
        
        this.renderer.reset();
    }
    
    onRender() {
        this.renderer.render(this.useHardwareRenderer);
    }
    
    // 0x0563-0x0601
    onTimer() {
        this.midi.onTimer();
        
        const stopping = !this.renderer.onTimer();
        if(stopping) {
            // 0x0396
            this.stop();
        }
    }
    
    async start() {
        if(this.running) return;
        this.reset();
        this.running = true;
        
        const unitTime = 1000 / 350;
        
        function getTime() { return (new Date()).getTime(); }
        function wait() { return new Promise((resolve) => setTimeout(resolve, 10)); }
        
        await this.midi.start();
        
        let lastFrame = 0;
        let startTime = getTime();
    loop:
        while(true) {
            const currentFrame = Math.floor((getTime() - startTime) / unitTime);
            while(lastFrame < currentFrame) {
                this.onTimer();
                if(this.stopping) break loop;
                ++lastFrame;
            }
            await wait();
        }
        
        this.midi.stop();
        
        this.running = false;
        this.stopping = false;
    }
    
    stop() {
        if(!this.running) return;
        this.stopping = true;
    }
}
