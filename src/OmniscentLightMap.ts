export class OmniscentLightMap {
    // 0x4274-0xC273: Light map
    private lightMap: Uint8Array;
    
    constructor() {
        this.lightMap = this.generateLightMap();
    }
    
    generateLightMap() {
        // 0x02FF-0x032D
        const lightMap = new Uint8Array(0x80 * 0x100);
        let p = 0;
        for(let i = 0x00; i < 0x80; ++i) {
            for(let j = 0x00; j < 0xC0; ++j)
            lightMap[p++] = (j & 0xE0) + (((j & 0x1F) * i * 2) >> 8);
            for(let j = 0xC0; j < 0x100; ++j)
            lightMap[p++] = j;
        }
        return lightMap;
    }
    
    getLightMap() { return this.lightMap; }
}
