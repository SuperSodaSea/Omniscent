import { OmniscentUtil } from './OmniscentUtil';

import type { OmniscentRandom } from './OmniscentRandom';


export class OmniscentTexture {
    // 0x0F69-0x1004: Texture pattern table
    static TEXTURE_PATTERN_TABLE = new Uint8Array([
        0x13, 0x0F, 0x0F, 0x31, 0x31, 0x0A,
        0x13, 0x10, 0x10, 0x30, 0x30, 0x11,
        0x13, 0x11, 0x11, 0x2F, 0x2F, 0x18,
        0x13, 0x12, 0x12, 0x2E, 0x2E, 0xBE,
        0x13, 0x15, 0x15, 0x2B, 0x2B, 0x1E,
        0x25, 0x00, 0x00, 0x3E, 0x1E, 0x03,
        0x25, 0x03, 0x03, 0x3E, 0x1E, 0x07,
        0x25, 0x03, 0x03, 0x3B, 0x1B, 0xFC,
        0x25, 0x00, 0x20, 0x3E, 0x3E, 0x03,
        0x25, 0x03, 0x23, 0x3E, 0x3E, 0x07,
        0x25, 0x03, 0x23, 0x3B, 0x3B, 0xFC,
        0x25, 0x00, 0x00, 0x3F, 0x3F, 0xFE,
        0x2C, 0x00, 0x0A, 0x3F, 0x0F, 0xF6,
        0x2C, 0x00, 0x0B, 0x3F, 0x10, 0x04,
        0x2C, 0x00, 0x2F, 0x3F, 0x34, 0xF6,
        0x2C, 0x00, 0x30, 0x3F, 0x35, 0x04,
        0x2E, 0x13, 0x18, 0x2C, 0x27, 0x05,
        0x2E, 0x14, 0x19, 0x2C, 0x27, 0xF4,
        0x2E, 0x14, 0x19, 0x2B, 0x26, 0x07,
        0x3E, 0x14, 0x19, 0x2B, 0x26, 0x06,
        0x2F, 0x00, 0x18, 0x3F, 0x1E, 0x06,
        0x2F, 0x00, 0x19, 0x3F, 0x1F, 0xFA,
        0x3F, 0x00, 0x19, 0x3F, 0x1E, 0x06,
        0x2F, 0x00, 0x20, 0x3F, 0x26, 0x06,
        0x2F, 0x00, 0x21, 0x3F, 0x27, 0xFA,
        0x3F, 0x00, 0x21, 0x3F, 0x26, 0x06,
    ]);
    // 0x1005-0x1020: Texture background table
    static TEXTURE_BACKGROUND_TABLE = new Uint8Array([
        0x22, 0xC0,
        0x26, 0x01,
        0x26, 0x01,
        0x26, 0x00,
        0x20, 0x00,
        0x20, 0x20,
        0x20, 0x40,
        0x22, 0x60,
        0x24, 0x00,
        0x22, 0x60,
        0x24, 0x00,
        0x24, 0x00,
        0x24, 0x00,
        0x24, 0x00,
    ]);
    
    private random: OmniscentRandom;
    private textures: Uint8Array[];
    private texture01Data: number[][];
    private doorCounter = 0;
    
    constructor(random: OmniscentRandom) {
        this.random = random;
        
        this.textures = new Array<Uint8Array>(0x14);
        for(let i = 0; i < 0x14; ++i)
            this.textures[i] = new Uint8Array(64 * 64);
        // 0x41ED-0x4246: Texture 0x01 data
        this.texture01Data = new Array<number[]>(0x1E);
    }
    
    // 0x01BD-0x02FE
    reset() {
        // Int16 0x1362
        this.doorCounter = -4250;
        
        // 0x01BD-0x01C7
        // Generate texture 0x11
        this.generateCircleNoise(0x11, 0x05, 0x0320);
        // 0x01C8-0x01D1
        // Generate texture 0x10
        this.generateCircleNoise(0x10, 0x0F, 0x0070);
        
        // 0x01D2-0x01F4
        // Generate texture 0x12
        this.textures[0x12].fill(0x14);
        for(let i = 0; i < 0xFC0; ++i) {
            let a = this.random.random(0x4);
            a = (a + this.textures[0x12][i] + this.textures[0x12][i + 1]) & 0xFF;
            a = (a - 1) >> 1;
            this.textures[0x12][i + 0x40] = a;
        }
        
        // 0x01F5-0x020D
        // Generate texture 0x12
        this.textures[0x13].fill(0x03);
        for(let i = 0; i < 0x1000; ++i) {
            const p = this.random.random(0x1000);
            ++this.textures[0x13][p];
        }
        
        // 0x020E-0x022C
        // Generate texture 0x01 data
        for(let i = 0; i < 0x1E; ++i)
            this.texture01Data[i] = [
                this.random.random(0x100),
                this.random.random(0xEC0 + 0x80) + 0x40,
            ];
        
        // 0x022D-0x0259
        // Generate texture 0x00
        for(let i = 0; i < 0x1000; ++i) {
            let x = i;
            if(x & 0x08)
                x ^= 0x00FF;
            x &= 0x0F;
            let y = i >> 6;
            if(y & 0x08)
                y ^= 0x00FF;
            y &= 0x0F;
            this.textures[0x00][i] = 0xE0 + Math.min(x, y);
        }
        
        // 0x025A-0x0280
        // Generate texture 0x02-0x0F background
        for(let i = 0x02, p = 0; i <= 0x0F; ++i, p += 2) {
            const src = this.textures[OmniscentTexture.TEXTURE_BACKGROUND_TABLE[p] >> 1], dst = this.textures[i];
            const offset = OmniscentTexture.TEXTURE_BACKGROUND_TABLE[p + 1];
            for(let j = 0; j < 0x1000; ++j)
                dst[j] = src[j] + offset;
        }
        
        // 0x0281-0x02D7
        // Generate texture 0x03, 0x05, 0x0C, 0x0E, 0x0F pattern
        for(let i = 0, p = 0; i < 0x1A; ++i, p += 6) {
            const dst = this.textures[OmniscentTexture.TEXTURE_PATTERN_TABLE[p] & 0x0F];
            const mode = OmniscentTexture.TEXTURE_PATTERN_TABLE[p] >> 4;
            const x0 = OmniscentTexture.TEXTURE_PATTERN_TABLE[p + 1];
            const y0 = OmniscentTexture.TEXTURE_PATTERN_TABLE[p + 2];
            const x1 = OmniscentTexture.TEXTURE_PATTERN_TABLE[p + 3];
            const y1 = OmniscentTexture.TEXTURE_PATTERN_TABLE[p + 4];
            const offset = OmniscentTexture.TEXTURE_PATTERN_TABLE[p + 5];
            for(let y = y0; y <= y1; ++y)
                for(let x = x0; x <= x1; ++x) {
                    const index = (y << 6) | x;
                    let a;
                    switch(mode) {
                    case 1: {
                        a = 0;
                        break;
                    }
                    case 2: {
                        a = dst[index];
                        break;
                    }
                    default: { // 3
                        a = (x + y) & 0x04;
                        if(a !== 0) a = 0x98;
                        break;
                    }
                    }
                    a += offset;
                    dst[index] = a;
                }
        }
        
        // 0x02D8-0x02FE
        // Generate texture 0x0B pattern
        for(let i = 0; i < 0x14; ++i) {
            for(let j = 0; j < ((0x14 - i) << 3); ++j) {
                const p = 0xFFF - 0x40 * i - this.random.random(0x40);
                this.textures[0x0B][p] = 0x5E - i;
            }
        }
    }
    
    updateDoorTexture() {
        // 0x0457
        // Update texture 0x0D
        const texture0D = this.textures[0x0D], texture0F = this.textures[0x0F];
        let offset = this.doorCounter;
        if(offset < 0) offset = 0;
        if(offset > 0x18) offset = 0x18;
        offset <<= 6;
        for(let i = 0; i < 0x800; ++i)
            texture0D[i] = texture0F[offset + i];
        for(let i = 0; i < 0x800; ++i)
            texture0D[0x800 + i] = texture0F[0x800 - offset + i];
        for(let i = 0; i < offset * 2; ++i)
            texture0D[0x800 - offset + i] = 0x00;
    }
    
    onTimer() {
        // 0x05C2
        // Generate texture 0x01
        const texture01 = this.textures[0x01];
        const texture01Data = this.texture01Data;
        texture01.fill(0x00);
        for(let i = 0; i < 0x1E; ++i) {
            texture01Data[i][0] = (texture01Data[i][0] - 1) & 0xFF;
            let a = texture01Data[i][0] & 0x3F;
            if(a < 0x1F)
                a = ~a & 0x1F;
            a >>= 1;
            const b = texture01Data[i][1];
            OmniscentUtil.drawStar(texture01, b, 0x003B, 0xE000, a);
        }
        
        ++this.doorCounter;
    }
    
    // 0x06E8-0x074D
    generateCircleNoise(id: number, r: number, n: number) {
        const texture = this.textures[id];
        texture.fill(0x00);
        
        const table = new Array<number>(r * 2);
        for(let i = r; i > -r; --i)
            table[r - i] = Math.round(Math.sqrt(r * r - i * i)) | 0;
        for(let i = 0; i < n; ++i) {
            let p = this.random.random(0x1000);
            for(let j = 0; j < r * 2; ++j) {
                const a = table[j];
                for(let k = 0; k < a * 2; ++k)
                    ++texture[(p - a + k) & 0x0FFF];
                p += 0x40;
            }
        }
    }
    
    getTextures() { return this.textures; }
    isDoorOpened() { return this.doorCounter >= 0; }
}
