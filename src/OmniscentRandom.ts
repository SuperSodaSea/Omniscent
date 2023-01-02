export class OmniscentRandom {
    private randomA = 0;
    private randomB = 0;
    
    constructor() {
        this.reset();
    }
    
    reset() {
        // Uint32 0x0DDB
        this.randomA = 0x08088405;
        // Uint32 0x0DDF
        this.randomB = 0x000010FB;
    }
    
    // 0x0699-0x06B8
    random(x: number) {
        this.randomB = (Math.imul(this.randomB, this.randomA) + 1) | 0;
        return ((((this.randomB >> 16) & 0xFFFF) * x) >> 16) & 0xFFFF;
    }
}
