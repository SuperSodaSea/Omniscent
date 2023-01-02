import { OmniscentUtil } from './OmniscentUtil';


export class OmniscentCamera {
    // 0x12E3-0x135F: Camera table
    static CAMERA_TABLE = new Uint8Array([
        0xA1, 0xF8, 0xF8, 0x98, 0xA1, 0xA6, 0xF0, 0xA7,
        0xB3, 0x37, 0x10, 0x36, 0x50, 0x84, 0x85, 0x85,
        0x84, 0xF0, 0xF0, 0xB2, 0xA7, 0xA6, 0xA6, 0xA7,
        0xF3, 0x26, 0x70, 0x27, 0x80, 0x44, 0x45, 0x77,
        0x76, 0xA6, 0xB0, 0x61, 0x61, 0x52, 0xA7, 0x77,
        0x30, 0x76, 0x80, 0xA2, 0x01, 0x41, 0x41, 0x01,
        0xF5, 0x30, 0xF4, 0xB3, 0xA4, 0xF8, 0xA5, 0xD0,
        0x47, 0x46, 0xF0, 0xA6, 0x80, 0xA7, 0x70, 0xA7,
        0x10, 0xA6, 0x8E, 0xF0, 0x50, 0x8F, 0xB2, 0xF8,
        0xA3, 0x80, 0x8E, 0xF0, 0x50, 0x8F, 0xB7, 0x10,
        0xB6, 0xF0, 0x80, 0xA6, 0xA7, 0xF0, 0x87, 0xF0,
        0x70, 0x86, 0x36, 0xF0, 0xF0, 0x90, 0x37, 0x83,
        0x2C, 0xF0, 0xF0, 0xF0, 0x30, 0x2D, 0x82, 0x30,
        0xB5, 0xB4, 0xF2, 0xA6, 0x30, 0xA7, 0x83, 0x83,
        0xA6, 0xF0, 0x58, 0xA7, 0x77, 0x76, 0xF0, 0xF0,
        0xF0, 0xF0, 0xF8, 0xF8, 0x00,
    ]);
    
    private position = new Float32Array(3);
    private matrix0 = new Float32Array(9);
    private matrix1 = new Float32Array(9);
    
    // Int16 0x1360
    private directionX = 1;
    // Int16[4] 0x13F6
    // {forward, z, y, x}
    private speed = new Int16Array(4);
    // Int16 0x13FE
    private pointer = 0;
    // Int16 0x1400
    private counter = 0;
    // Int16 0x1402
    private direction = 0;
    
    constructor() {
        this.reset();
    }
    
    reset() {
        this.position.set([-330.0, 0.0, 64.0]);
        this.matrix0.set([0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 1.0, 0.0, 0.0]);
        this.matrix1.set(this.matrix0);
        
        // Int16 0x1360
        this.directionX = 1;
        // Int16[4] 0x13F6
        // {forward, z, y, x}
        this.speed.fill(0);
        // Int16 0x13FE
        this.pointer = 0;
        // Int16 0x1400
        this.counter = 0;
        // Int16 0x1402
        this.direction = 0;
    }
    
    // 0x0BFC-0x0C7F
    updateMatrix(a: number, b: number, c: number, d: number) {
        const matrix2 = new Float32Array(9);
        for(let i = 0; i < 3; ++i)
            for(let j = 0; j < 3; ++j)
                matrix2[i * 3 + j] = Number(i === j);
        for(let i = 0; i < 3; ++i) {
            const v = OmniscentUtil.rotateVector3([
                    matrix2[i * 3],
                    matrix2[i * 3 + 1],
                    matrix2[i * 3 + 2],
                ], [b, c, d]);
            matrix2[i * 3] = v[0];
            matrix2[i * 3 + 1] = v[1];
            matrix2[i * 3 + 2] = v[2];
            for(let j = 0; j < 3; ++j)
                this.matrix0[i * 3 + j] = this.matrix1[i * 3 + j]
                    = matrix2[i * 3] * this.matrix0[j]
                    + matrix2[i * 3 + 1] * this.matrix0[3 + j]
                    + matrix2[i * 3 + 2] * this.matrix0[6 + j];
        }
        for(let i = 0; i < 3; ++i) {
            const v = OmniscentUtil.rotateVector2([this.matrix1[i], this.matrix1[3 + i]], a);
            this.matrix1[i] = v[0];
            this.matrix1[3 + i] = v[1];
        }
    }
    
    // 36156 Ticks
    onTimer() {
        // 0x0396
        if(--this.counter < 0) {
            let a = OmniscentCamera.CAMERA_TABLE[this.pointer];
            if(a === 0) return false;
            this.counter = (a & 0xF8) << 1;
            a &= 0x07;
            this.direction = a;
            if(a === 0x1)
                this.directionX = -this.directionX;
            ++this.pointer;
        }
        if(this.direction === 0x1)
            this.speed[3] += this.directionX;
        for(let i = 0; i < 3; ++i) {
            if(this.direction === 0x02 + i * 2)
                ++this.speed[i];
            if(this.direction === 0x03 + i * 2)
                --this.speed[i];
        }
        this.updateMatrix(
            this.speed[2] << 4, this.speed[3] >> 2, this.speed[2] >> 2, this.speed[1] >> 2);
        for(let i = 0; i < 3; ++i)
            this.position[i] += this.matrix0[6 + i] * this.speed[0] / 1792;
        return true;
    }
    
    getPosition() { return this.position; }
    getMatrix() { return this.matrix1; }
}
