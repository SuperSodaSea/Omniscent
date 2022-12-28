export class OmniscentPalette {
    // 0x0F28-0x0F68: Palette table
    static PALETTE_TABLE = new Uint8Array([
        0x10,
        0x1F, 0x3F, 0x3F, 0x3F,
        0x01, 0x00, 0x00, 0x00,
        0x1F, 0x28, 0x20, 0x3F,
        0x01, 0x00, 0x00, 0x00,
        0x1F, 0x3F, 0x00, 0x00,
        0x01, 0x06, 0x01, 0x00,
        0x1F, 0x3F, 0x29, 0x14,
        0x01, 0x00, 0x00, 0x00,
        0x1F, 0x3F, 0x3F, 0x08,
        0x01, 0x00, 0x00, 0x00,
        0x1F, 0x38, 0x38, 0x3F,
        0x01, 0x3F, 0x00, 0x00,
        0x10, 0x3F, 0x3F, 0x00,
        0x10, 0x3F, 0x00, 0x00,
        0x01, 0x16, 0x05, 0x00,
        0x07, 0x3F, 0x38, 0x11,
    ]);
    
    // 0x1408-0x1707: Palette data
    private palette: Uint8Array;
    
    constructor() {
        this.palette = this.generatePalette();
    }
    
    // 0x018C-0x01BC
    generatePalette() {
        const palette = new Uint8Array(3 * 0x100);
        let a = 0x0000, b = 0x0001;
        for(let i = 0; i < 3; ++i) {
            let p = 0, q = 0;
            a = OmniscentPalette.PALETTE_TABLE[p];
            // Don't clear DL?
            b &= 0x00FF;
            let entryCount = OmniscentPalette.PALETTE_TABLE[p++];
            for(let j = 0; j < entryCount; ++j) {
                a = (a & 0x00FF) | (OmniscentPalette.PALETTE_TABLE[p + i + 1] << 8);
                a = ((a - b) / OmniscentPalette.PALETTE_TABLE[p]) | 0;
                for(let k = 0; k < OmniscentPalette.PALETTE_TABLE[p]; ++k, ++q) {
                    b += a;
                    palette[q * 3 + i] = b >> 8;
                }
                p += 4;
            }
        }
        // Original palette is 18bpp, convert it to 24bpp.
        for(let i = 0; i < 3 * 0x100; ++i)
            palette[i] = (palette[i] << 2) | (palette[i] >> 4);
        return palette;
    }
    
    onTimer() {
        // 0x05B3
        // Update palette 0xC0-0xDF
        const t = [this.palette[0xC0 * 3], this.palette[0xC0 * 3 + 1]];
        for(let i = 0; i < 0x5D; ++i)
            this.palette[0xC0 * 3 + i] = this.palette[0xC1 * 3 + i];
        this.palette[0xDF * 3] = t[0];
        this.palette[0xDF * 3 + 1] = t[1];
    }
    
    getPalette() { return this.palette; }
}
