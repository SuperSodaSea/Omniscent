/*
            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.
*/

'use strict';


class OmniscentUtil {
    // 0x1021-0x1039: Star pattern
    static STAR_PATTERN = new Uint8Array([
        0x00, 0x00, 0x03, 0x00, 0x00,
        0x00, 0x02, 0x05, 0x02, 0x00,
        0x03, 0x05, 0x07, 0x05, 0x03,
        0x00, 0x02, 0x05, 0x02, 0x00,
        0x00, 0x00, 0x03, 0x00, 0x00,
    ]);
    
    // 0x0611-0x062F
    static drawStar(data, index, stride, color, value) {
        for(let i = 0, p = 0; i < 5; ++i, index += stride)
            for(let j = 0; j < 5; ++j, ++p, ++index) {
                const x = OmniscentUtil.STAR_PATTERN[p];
                if(x > value)
                    data[index] = ((x - value) + (color >> 8)) << (color & 0xFF);
            }
    }
    
    // 0x065A-0x698
    static quickSort(data, l, r) {
        if(l >= r) return;
        let ll = l, rr = r;
        let x = data[ll * 2];
        do {
            while(data[ll * 2] > x) ++ll;
            while(data[rr * 2] < x) --rr;
            if(ll > rr) break;
            const t0 = data[ll * 2];
            data[ll * 2] = data[rr * 2];
            data[rr * 2] = t0;
            const t1 = data[ll * 2 + 1];
            data[ll * 2 + 1] = data[rr * 2 + 1];
            data[rr * 2 + 1] = t1;
            ++ll;
            --rr;
        } while(ll <= rr);
        OmniscentUtil.quickSort(data, l, rr);
        OmniscentUtil.quickSort(data, ll, r);
    }
    
    // 0x0BAD-0x0BCF
    static rotateVector2(vector, angle) {
        angle *= Math.PI / 0x10000;
        const c = Math.cos(angle), s = Math.sin(angle);
        return [c * vector[0] - s * vector[1], s * vector[0] + c * vector[1]];
    }
    // 0x0BD0-0x0BFB
    static rotateVector3(vector, angle) {
        const result = [vector[0], vector[1], vector[2]];
        const a = OmniscentUtil.rotateVector2([result[1], result[2]], angle[2]);
        result[1] = a[0], result[2] = a[1];
        const b = OmniscentUtil.rotateVector2([result[2], result[0]], angle[1]);
        result[2] = b[0], result[0] = b[1];
        const c = OmniscentUtil.rotateVector2([result[0], result[1]], angle[0]);
        result[0] = c[0], result[1] = c[1];
        return result;
    }
    
    static toInt16(x) {
        x &= 0xFFFF;
        if(x >= 0x8000) x -= 0x10000;
        return x;
    }
};

class OmniscentMIDI {
    // 0x0DE3-0x0F27: MIDI table
    static MIDI_TABLE = new Uint8Array([
        // Channel 2: 0x50, 0x0DE3-0x0E51
        0x02, 0x50,
            0xFB, // Repeat x5
                0xFE, // Repeat x2
                    0x32, 0x04, 0x45, 0x02, 0x3E, 0x02, 0x45, 0x02,
                    0x51, 0x02, 0x3E, 0x02, 0x45, 0x02, 0x4F, 0x02,
                    0x3E, 0x02, 0x45, 0x02, 0x51, 0x02, 0x3E, 0x02,
                    0x45, 0x02, 0x4F, 0x02, 0x51, 0x02,
                0x00,
                0xFE, // Repeat x2
                    0x32, 0x04, 0x46, 0x02, 0x3E, 0x02, 0x46, 0x02,
                    0x51, 0x02, 0x3E, 0x02, 0x46, 0x02, 0x4F, 0x02,
                    0x3E, 0x02, 0x46, 0x02, 0x52, 0x02, 0x3E, 0x02,
                    0x46, 0x02, 0x4F, 0x02, 0x52, 0x02,
                0x00,
            0x00,
            0x37, 0x20, 0x38, 0x20, 0x33, 0x20, 0x35, 0x18,
            0x37, 0x08, 0x39, 0x20, 0x32, 0x20, 0x3C, 0x30,
            0x3A, 0x08, 0x39, 0x08, 0x37, 0x40,
            0xFE, // Repeat x2
                0x43, 0x10, 0x3E, 0x10, 0x45, 0x10, 0x46, 0x10,
            0x00,
            0xFE, // Repeat x2
                0x46, 0x10, 0x45, 0x10, 0x3E, 0x10, 0x41, 0x10,
            0x00,
        0x00,
        // Channel 4: 0x32, 0x0E52-0x0EA0
        0x04, 0x32,
            0x01, 0x80, 0x01, 0x80, 0x41, 0x1C, 0x40, 0x02,
            0x41, 0x02, 0x40, 0x10, 0x3E, 0x08, 0x3C, 0x08,
            0x43, 0x1C, 0x41, 0x04, 0x3C, 0x10, 0x41, 0x08,
            0x40, 0x08, 0x3E, 0x20, 0x32, 0x10, 0x40, 0x08,
            0x41, 0x08, 0x43, 0x20, 0x3C, 0x10, 0x3E, 0x08,
            0x40, 0x08, 0x3E, 0x80, 0x43, 0x80, 0x43, 0x10,
            0x40, 0x10, 0x42, 0x10, 0x40, 0x08, 0x42, 0x08,
            0x48, 0x30, 0x46, 0x10, 0x43, 0x20, 0x37, 0x20,
            0xFE, // Repeat x2
                0x1F, 0x20, 0x37, 0x20,
            0x00,
            0xFE, // Repeat x2
                0x1A, 0x20, 0x32, 0x20,
            0x00,
        0x00,
        // Channel 5: 0x59, 0x0EA1-0x0EE1
        0x05, 0x59,
            0xFB, // Repeat x5
                0x01, 0x80,
            0x00,
            0x43, 0x08, 0x4A, 0x18, 0x44, 0x08, 0x4B, 0x18,
            0x3F, 0x08, 0x46, 0x18, 0x3C, 0x08, 0x45, 0x10,
            0x43, 0x08, 0x3E, 0x08, 0x45, 0x10, 0x43, 0x08,
            0x3E, 0x08, 0x42, 0x18, 0x3F, 0x08, 0x43, 0x18,
            0x3C, 0x08, 0x43, 0x10, 0x45, 0x08, 0x37, 0x08,
            0x43, 0x18, 0x2B, 0x08, 0x32, 0x18,
            0xFE, // Repeat x2
                0x1F, 0x01, 0x26, 0x3F,
            0x00,
            0xFE, // Repeat x2
                0x1A, 0x01, 0x21, 0x3F,
            0x00,
        0x00,
        // Channel 10: 0x00, 0x0EE2-0x0F26
        0x0A, 0x00,
            0xF0, // Repeat x16
                0x2A, 0x02, 0x2A, 0x02, 0x2A, 0x02, 0x2A, 0x01,
                0x2A, 0x01,
            0x00,
            0xF0, // Repeat x16
                0x24, 0x02, 0x2A, 0x02, 0x2A, 0x02, 0x2A, 0x01,
                0x2A, 0x01,
            0x00,
            0xE2, // Repeat x30
                0x24, 0x02, 0x2A, 0x02, 0x2E, 0x02, 0x24, 0x01,
                0x2A, 0x01, 0x26, 0x02, 0x2A, 0x02, 0x2E, 0x02,
                0x26, 0x01, 0x2A, 0x01, 0x24, 0x02, 0x26, 0x02,
                0x24, 0x02, 0x2A, 0x01, 0x2A, 0x01, 0x26, 0x02,
                0x2A, 0x02, 0x2E, 0x02, 0x26, 0x01, 0x2A, 0x01,
            0x00,
        0x00,
        // MIDI Table End
        0x00,
    ]);
    
    constructor() {
        this.generateMIDI();
        
        this.midiOutput = null;
        this.midiIndexs = new Array(this.midiData.length);
    }
    
    // 0x014C-0x016A
    generateMIDI() {
        this.midiData = [];
        let p = 0;
        while(OmniscentMIDI.MIDI_TABLE[p] - 1 >= 0) {
            const channelData = {};
            channelData.channel = OmniscentMIDI.MIDI_TABLE[p++] - 1;
            channelData.instrument = OmniscentMIDI.MIDI_TABLE[p++];
            channelData.data = [];
            p = this.generateMIDILoop(p, channelData);
            channelData.data = new Uint8Array(channelData.data);
            this.midiData.push(channelData);
        }
    }
    // 0x063B-0x0659
    generateMIDILoop(p, channelData) {
        while(OmniscentMIDI.MIDI_TABLE[p] !== 0x00) {
            if(OmniscentMIDI.MIDI_TABLE[p] >= 0x80) {
                const count = 0x100 - OmniscentMIDI.MIDI_TABLE[p++];
                const q = p;
                for(let i = 0; i < count; ++i)
                    p = this.generateMIDILoop(q, channelData);
            } else
                channelData.data.push(OmniscentMIDI.MIDI_TABLE[p++], OmniscentMIDI.MIDI_TABLE[p++]);
        }
        ++p;
        return p;
    }
    
    sendMIDI(data) {
        if(this.midiOutput)
            this.midiOutput.send(data);
    }
    async start() {
        for(let i = 0; i < this.midiData.length; ++i)
            this.midiIndexs[i] = [-2, 0];
        
        for(const channelData of this.midiData)
            this.sendMIDI([0xC0 + channelData.channel, channelData.instrument]);
    }
    stop() {
        // 0x052C
        for(let i = 1; i <= 15; ++i)
            this.sendMIDI([0xB0 + i, 0x7B, 0x00]);
        if(this.midiOutput) {
            this.midiOutput.disconnect();
            this.midiOutput = null;
        }
    }
    onTimer() {
        // 0x0568
        for(let i = 0; i < this.midiData.length; ++i) {
            const channel = this.midiData[i].channel;
            const data = this.midiData[i].data;
            if(this.midiIndexs[i][0] < data.length) {
                if(this.midiIndexs[i][1] === 0) {
                    this.midiIndexs[i][0] += 2;
                    if(this.midiIndexs[i][0] > 0)
                        this.sendMIDI([0x80 | channel, data[this.midiIndexs[i][0] - 2], 0x7F]);
                    if(this.midiIndexs[i][0] >= data.length) continue;
                    this.midiIndexs[i][1] = data[this.midiIndexs[i][0] + 1] * 29;
                    this.sendMIDI([0x90 | channel, data[this.midiIndexs[i][0]], 0x7F]);
                }
                --this.midiIndexs[i][1];
            }
        }
    }
}

class OmniscentRandom {
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
    random(x) {
        this.randomB = (Math.imul(this.randomB, this.randomA) + 1) | 0;
        return ((((this.randomB >> 16) & 0xFFFF) * x) >> 16) & 0xFFFF;
    }
}

class OmniscentModel {
    // 0x1047-0x105E: Index table
    static INDEX_TABLE = new Uint8Array([
        0x08, 0x28, 0x30, 0x10,
        0x18, 0x38, 0x20, 0x00,
        0x10, 0x30, 0x38, 0x18,
        0x00, 0x20, 0x28, 0x08,
        0x38, 0x30, 0x28, 0x20,
        0x00, 0x08, 0x10, 0x18,
    ]);
    
    // 0x105F-0x108B: Vertex table
    static VERTEX_TABLE = new Int8Array([
        0xE0, 0xE0, 0xE0,
        0x20, 0xE0, 0xE0,
        0x20, 0x20, 0xE0,
        0xE0, 0x20, 0xE0,
        0xE0, 0xE0, 0x20,
        0x20, 0xE0, 0x20,
        0x20, 0x20, 0x20,
        0xE0, 0x20, 0x20,
        0x40, 0x00, 0x00,
        0xC0, 0x00, 0x00,
        0x00, 0x40, 0x00,
        0x00, 0xC0, 0x00,
        0x00, 0x00, 0x40,
        0x00, 0x00, 0xC0,
        0x00, 0x00, 0x00,
    ]);
    
    // 0x108C-0x12E2: Model table
    static MODEL_TABLE = new Uint8Array([
        // Chunk 0, 0x108C-0x10E8
        0x71, 0x70, 0x00, 0x06,
        0x72, 0x00, 0x00, 0x06,
        0x71, 0x00, 0x70, 0x06,
        0x73, 0x07, 0x70, 0x06,
        0x73, 0x07, 0x00, 0x06,
        0x70, 0x07, 0x07, 0x06,
        0x74, 0x00, 0x07, 0x06,
        0x70, 0x00, 0x07, 0x40,
        0x72, 0x70, 0x07, 0x50,
        0x72, 0x70, 0x00, 0x50,
        0x71, 0x70, 0x70, 0x50,
        0x73, 0x00, 0x70, 0x40,
        0x71, 0x00, 0x00, 0x40,
        0x72, 0x00, 0x00, 0x50,
        0x71, 0x00, 0x70, 0x50,
        0x73, 0x07, 0x70, 0x46,
        0x73, 0x00, 0x00, 0x46,
        0x70, 0x07, 0x07, 0x46,
        0x72, 0x00, 0x07, 0x50,
        0x71, 0x00, 0x00, 0x00,
        0x71, 0x00, 0x00, 0x00,
        0x71, 0x00, 0xBB, 0x56,
        0x70, 0x0F, 0xBB, 0x46,
        0xFF,
        // Chunk 1, 0x10E9-0x11CD
        0x33, 0x00, 0x00, 0x00,
        0xF0, 0x00, 0x07, 0x06, 0xE4,
        0xB0, 0x00, 0xBB, 0x46, 0xE4,
        0x90, 0x00, 0xBB, 0x56, 0xE4,
        0x90, 0x00, 0xBB, 0x56, 0xE4,
        0x30, 0x00, 0xBB, 0x56,
        0xF0, 0x00, 0xBB, 0x56, 0x11,
        0xF0, 0x00, 0xBB, 0x46, 0x11,
        0xB0, 0x00, 0xBB, 0x56, 0x11,
        0x90, 0x00, 0xBB, 0x56, 0x11,
        0xB0, 0x00, 0xBB, 0x56, 0x11,
        0xF0, 0x00, 0xBB, 0x56, 0x11,
        0xF0, 0x00, 0xBB, 0x46, 0x11,
        0xB0, 0x00, 0xBB, 0x56, 0x11,
        0x30, 0x00, 0xBB, 0x56,
        0x10, 0x00, 0xBB, 0x56,
        0x34, 0x00, 0x00, 0x00,
        0x32, 0x05, 0x00, 0x80,
        0x35, 0x05, 0x80, 0x80,
        0x35, 0x05, 0x80, 0x00,
        0x33, 0x05, 0x80, 0x08,
        0x33, 0x05, 0x00, 0x08,
        0x74, 0x05, 0x08, 0x08,
        0x74, 0x05, 0x00, 0x00,
        0x73, 0x05, 0x08, 0x80,
        0x75, 0x00, 0x00, 0x00,
        0x75, 0x05, 0x08, 0x88,
        0x70, 0x00, 0x00, 0x00,
        0x74, 0x64, 0x08, 0x08,
        0x74, 0x60, 0x08, 0x00,
        0x72, 0x64, 0x08, 0x80,
        0x05, 0x60, 0x00, 0x80,
        0x05, 0x60, 0x00, 0x00,
        0x02, 0x60, 0x00, 0x08,
        0x34, 0x60, 0x00, 0x08,
        0x34, 0x60, 0x00, 0x00,
        0x32, 0x60, 0x00, 0x80,
        0x35, 0x60, 0x00, 0x80,
        0x35, 0x60, 0x00, 0x00,
        0x32, 0x60, 0x00, 0x08,
        0x34, 0x35, 0x00, 0x08,
        0x14, 0x65, 0x00, 0x00,
        0x32, 0x35, 0x00, 0x80,
        0x35, 0x35, 0x00, 0x80,
        0x15, 0x65, 0x00, 0x00,
        0x32, 0x35, 0x00, 0x08,
        0x34, 0x35, 0x80, 0x08,
        0x14, 0x65, 0x00, 0x00,
        0x32, 0x35, 0x80, 0x80,
        0x75, 0x00, 0x00, 0x00,
        0x52, 0x65, 0xE0, 0x77,
        0x32, 0x64, 0x0E, 0x77,
        0x12, 0x65, 0x00, 0x77,
        0x00, 0x65, 0x00, 0x77,
        0xFF,
        // Chunk 2, 0x11CE-0x128E
        0x32, 0x00, 0x00, 0x00,
        0xF0, 0x00, 0x00, 0x00, 0x14,
        0xB0, 0x00, 0x00, 0x00, 0x14,
        0x30, 0x00, 0x00, 0x00,
        0xF0, 0x00, 0x00, 0x00, 0xF4,
        0xF0, 0x00, 0xDD, 0x56, 0xF4,
        0x30, 0x00, 0xDD, 0x46,
        0x30, 0x00, 0xDD, 0x56,
        0x30, 0x00, 0xDD, 0x56,
        0x32, 0x00, 0x00, 0x50,
        0x30, 0x0A, 0xA0, 0x50,
        0x33, 0x00, 0xA0, 0x50,
        0x30, 0x00, 0x00, 0x50,
        0x32, 0x70, 0x00, 0x50,
        0x30, 0x00, 0xA0, 0x50,
        0x33, 0xA0, 0xA7, 0x50,
        0x33, 0x00, 0x00, 0x00,
        0x31, 0xA0, 0x7A, 0x50,
        0x31, 0x00, 0x0A, 0x50,
        0x31, 0x00, 0x0A, 0x50,
        0x32, 0x0A, 0x0A, 0x50,
        0x35, 0x00, 0x00, 0x00,
        0x72, 0x0A, 0x00, 0x00,
        0x70, 0x0A, 0xA0, 0x00,
        0x73, 0x00, 0xA0, 0x00,
        0x70, 0x00, 0x00, 0x00,
        0x72, 0x00, 0x00, 0x00,
        0x70, 0x00, 0xA0, 0x00,
        0x73, 0xA0, 0xA0, 0x00,
        0x73, 0xA0, 0x00, 0x99,
        0x71, 0xA0, 0x0A, 0x00,
        0x71, 0x00, 0x0A, 0x00,
        0x71, 0x00, 0x0A, 0x00,
        0x75, 0x0A, 0x0A, 0x00,
        0x70, 0x0C, 0x0C, 0x03,
        0x70, 0x00, 0x0C, 0x03,
        0x70, 0x00, 0x0C, 0x03,
        0x72, 0xC0, 0x7C, 0x03,
        0x72, 0x00, 0x00, 0x00,
        0x71, 0xC0, 0xC7, 0x03,
        0x73, 0x00, 0xC0, 0x03,
        0x71, 0x70, 0x00, 0x03,
        0x72, 0x00, 0x00, 0x03,
        0x71, 0x00, 0xC0, 0x03,
        0x73, 0x0C, 0xC0, 0x03,
        0x71, 0x00, 0x00, 0x03,
        0x31, 0x0C, 0xCC, 0xA3,
        0xFF,
        // Chunk 3, 0x128F-0x12E2
        0x32, 0x00, 0x00, 0x00,
        0xF0, 0x00, 0x70, 0x06, 0x14,
        0xB0, 0x00, 0xDD, 0x46, 0x14,
        0x30, 0x00, 0xDD, 0x56,
        0xB2, 0x00, 0x0D, 0x56, 0xC4,
        0x32, 0xDD, 0x00, 0x56,
        0x32, 0xDD, 0x00, 0x56,
        0x32, 0xDD, 0x00, 0x56,
        0x70, 0x00, 0xF0, 0x56,
        0x70, 0x00, 0xBB, 0x56,
        0x32, 0xB0, 0x0B, 0x46,
        0x72, 0xBB, 0x00, 0x56,
        0x71, 0xB0, 0xB0, 0x56,
        0x71, 0x02, 0x11, 0x56,
        0x71, 0x22, 0x11, 0x56,
        0x31, 0x20, 0x11, 0x56,
        0x73, 0x0B, 0xB0, 0x56,
        0x73, 0xBB, 0x00, 0x56,
        0x30, 0x0B, 0x0B, 0x46,
        0x30, 0x00, 0xBB, 0x56,
        0xFF,
    ]);
    
    constructor() {
        this.generateModel();
        
        this.transformedVertexs = new Float32Array(this.vertexCount * 3);
    }
    
    // 0x0C80-0x0DCA
    generateModel() {
        // 0x1768: Vertex count (362)
        // 0x176A: Quad count (367)
        // 0x176C-0x22BB: Vertex data
        // 0x23EC-0x3241: Quad data
        this.vertexCount = 0;
        this.quadCount = 0;
        this.vertexs = new Int16Array(362 * 4);
        this.quads = new Int16Array(367 * 5);
        let p = 0;
        let int16Table = new Int16Array(4 * 15);
        let float32Table = new Float32Array(3 * 15);
        for(let i = 0; i < 4; ++i) {
            // 0x0C8B-0x0CAE
            for(let j = 0; j < 15; ++j) {
                for(let k = 0; k < 3; ++k) {
                    let x = OmniscentModel.VERTEX_TABLE[j * 3 + k];
                    int16Table[j * 4 + k] = x;
                    float32Table[j * 3 + k] = x;
                }
                int16Table[j * 4 + 3] = 0x7F00;
            }
            // 0x0CAF-0x0DC0
            while(true) {
                let a = OmniscentModel.MODEL_TABLE[p++];
                if(a === 0xFF) break;
                let face = a & 0x0F;
                let light = ((a << 8) & 0x7000) | 0x0F00;
                for(let j = 0; j < 6; ++j) {
                    let textureIndex;
                    if(j & 0x01)
                        textureIndex = OmniscentModel.MODEL_TABLE[p++] & 0x0F;
                    else
                        textureIndex = OmniscentModel.MODEL_TABLE[p] >> 4;
                    --textureIndex;
                    if(textureIndex < 0) continue;
                    this.quads[this.quadCount * 5 + 4] = textureIndex;
                    for(let k = 0; k < 4; ++k) {
                        let index = OmniscentModel.INDEX_TABLE[j * 4 + k] >> 3;
                        let vertexIndex = 0;
                        for(; vertexIndex < this.vertexCount; ++vertexIndex)
                            if(int16Table[index * 4] === this.vertexs[vertexIndex * 4]
                                && int16Table[index * 4 + 1] === this.vertexs[vertexIndex * 4 + 1]
                                && int16Table[index * 4 + 2] === this.vertexs[vertexIndex * 4 + 2]) break;
                        if(vertexIndex === this.vertexCount) {
                            this.vertexs[vertexIndex * 4] = int16Table[index * 4];
                            this.vertexs[vertexIndex * 4 + 1] = int16Table[index * 4 + 1];
                            this.vertexs[vertexIndex * 4 + 2] = int16Table[index * 4 + 2];
                            this.vertexs[vertexIndex * 4 + 3] = int16Table[index * 4 + 3];
                            ++this.vertexCount;
                        }
                        this.quads[this.quadCount * 5 + k] = vertexIndex;
                    }
                    ++this.quadCount;
                }
                // 0x0D36
                for(let j = 0; j < 3; ++j)
                    float32Table[14 * 3 + j] += float32Table[(8 + face) * 3 + j];
                // 0x0D4C
                if(a & 0x80) {
                    let angle = (OmniscentModel.MODEL_TABLE[p] << 8) & 0xF000;
                    if(angle >= 0x8000) angle -= 0x10000;
                    let angles = [
                        OmniscentModel.MODEL_TABLE[p] & 0x04 ? angle : 0,
                        OmniscentModel.MODEL_TABLE[p] & 0x02 ? angle : 0,
                        OmniscentModel.MODEL_TABLE[p] & 0x01 ? angle : 0,
                    ];
                    for(let j = 0; j < 14; ++j) {
                        let v = OmniscentUtil.rotateVector3([
                                float32Table[j * 3],
                                float32Table[j * 3 + 1],
                                float32Table[j * 3 + 2]
                            ], angles);
                            float32Table[j * 3] = v[0];
                            float32Table[j * 3 + 1] = v[1];
                            float32Table[j * 3 + 2] = v[2];
                    }
                    ++p;
                }
                // 0x0D77
                for(let j = 0; j < 4; ++j) {
                    let index0 = OmniscentModel.INDEX_TABLE[face * 4 + j] >> 3;
                    let index1 = OmniscentModel.INDEX_TABLE[(face * 4 + j) ^ 0x7] >> 3;
                    for(let k = 0; k < 4; ++k)
                        int16Table[index1 * 4 + k] = int16Table[index0 * 4 + k];
                    for(let k = 0; k < 3; ++k)
                        int16Table[index0 * 4 + k] = Math.round(
                            float32Table[index0 * 3 + k] + float32Table[14 * 3 + k]);
                    int16Table[index0 * 4 + 3] = light;
                }
            }
        }
    }
    
    // 0x0493-0x04D2
    transformModel(camera) {
        let cameraPosition = camera.getPosition();
        let cameraMatrix = camera.getMatrix();
        for(let i = 0; i < this.vertexCount; ++i)
            for(let j = 0; j < 3; ++j)
                this.transformedVertexs[i * 3 + j] =
                    (this.vertexs[i * 4] - cameraPosition[0]) * cameraMatrix[j * 3]
                    + (this.vertexs[i * 4 + 1] - cameraPosition[1]) * cameraMatrix[j * 3 + 1]
                    + (this.vertexs[i * 4 + 2] - cameraPosition[2]) * cameraMatrix[j * 3 + 2];
    }
}

class OmniscentPalette {
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
    
    constructor() {
        this.generatePalette();
    }
    
    // 0x018C-0x01BC
    generatePalette() {
        // 0x1408-0x1707: Palette data
        this.palette = new Uint8Array(3 * 0x100);
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
                    this.palette[q * 3 + i] = b >> 8;
                }
                p += 4;
            }
        }
        // Original palette is 18bpp, convert it to 24bpp.
        for(let i = 0; i < 3 * 0x100; ++i)
            this.palette[i] = (this.palette[i] << 2) | (this.palette[i] >> 4);
        return this.palette;
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

class OmniscentLightMap {
    constructor() {
        // 0x4274-0xC273: Light map
        this.lightMap = new Uint8Array(0x80 * 0x100);
        
        this.generateLightMap();
    }
    
    generateLightMap() {
        // 0x02FF-0x032D
        let p = 0;
        for(let i = 0x00; i < 0x80; ++i) {
            for(let j = 0x00; j < 0xC0; ++j)
                this.lightMap[p++] = (j & 0xE0) + (((j & 0x1F) * i * 2) >> 8);
            for(let j = 0xC0; j < 0x100; ++j)
                this.lightMap[p++] = j;
        }
    }
    
    getLightMap() { return this.lightMap; }
}

class OmniscentTexture {
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
    
    constructor(random) {
        this.random = random;
        
        this.textures = new Array(0x14);
        for(let i = 0; i < 0x14; ++i)
            this.textures[i] = new Uint8Array(64 * 64);
        // 0x41ED-0x4246: Texture 0x01 data
        this.texture01Data = new Array(0x1E);
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
        for(let i = 0; i < 0x1E; ++i) {
            const t = new Array(2);
            t[0] = this.random.random(0x100);
            t[1] = this.random.random(0xEC0 + 0x80) + 0x40;
            this.texture01Data[i] = t;
        }
        
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
            const x0 = OmniscentTexture.TEXTURE_PATTERN_TABLE[p + 1], y0 = OmniscentTexture.TEXTURE_PATTERN_TABLE[p + 2];
            const x1 = OmniscentTexture.TEXTURE_PATTERN_TABLE[p + 3], y1 = OmniscentTexture.TEXTURE_PATTERN_TABLE[p + 4];
            const offset = OmniscentTexture.TEXTURE_PATTERN_TABLE[p + 5];
            for(let y = y0; y <= y1; ++y)
                for(let x = x0; x <= x1; ++x) {
                    let index = (y << 6) | x;
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
    generateCircleNoise(id, r, n) {
        const texture = this.textures[id];
        texture.fill(0x00);
        
        const table = new Array(r * 2);
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

class OmniscentCamera {
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
    
    constructor() {
        this.reset();
    }
    
    reset() {
        this.position = new Float32Array([-330.0, 0.0, 64.0]);
        this.matrix0 = new Float32Array([0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 1.0, 0.0, 0.0]);
        this.matrix1 = new Float32Array(this.matrix0);
        
        // Int16 0x1360
        this.directionX = 1;
        // Int16[4] 0x13F6
        // {forward, z, y, x}
        this.speed = new Int16Array(4);
        // Int16 0x13FE
        this.pointer = 0;
        // Int16 0x1400
        this.counter = 0;
        // Int16 0x1402
        this.direction = 0;
    }
    
    // 0x0BFC-0x0C7F
    updateMatrix(a, b, c, d) {
        const matrix2 = new Float32Array(9);
        for(let i = 0; i < 3; ++i)
            for(let j = 0; j < 3; ++j)
                matrix2[i * 3 + j] = i === j;
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

class OmniscentRenderer {
    // 0x103F-0x1042: Texture coord U table
    static TEXTURE_COORD_U_TABLE = new Uint8Array([0, 0, 63, 63]);
    // 0x1043-0x1046: Texture coord V table
    static TEXTURE_COORD_V_TABLE = new Uint8Array([63, 0, 0, 63])
    
    static FONT = Base64.toUint8Array('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');
    
    constructor(canvas) {
        this.random = new OmniscentRandom();
        this.camera = new OmniscentCamera();
        this.model = new OmniscentModel();
        this.palette = new OmniscentPalette();
        this.texture = new OmniscentTexture(this.random);
        this.lightMap = new OmniscentLightMap();
        
        // 0x0104-0x0119
        this.background = new Uint8Array(320 * 200);
        this.frameBuffer = new Uint8Array(320 * 200);
        
        this.generateText();
        
        this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: false});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.autoClear = false;
        
        this.frameBufferScene = new THREE.Scene();
        this.frameBufferMaterial = new THREE.MeshBasicMaterial({
            depthTest: false,
            side: THREE.DoubleSide,
        });
        this.frameBufferGeometry = new THREE.PlaneBufferGeometry(1, 1);
        this.frameBufferMesh = new THREE.Mesh(this.frameBufferGeometry, this.frameBufferMaterial);
        this.frameBufferScene.add(this.frameBufferMesh);
        this.frameBufferCamera = new THREE.OrthographicCamera(-0.5, 0.5, -0.5, 0.5, 0.0, 1.0);

        this.scene = new THREE.Scene();
        this.sceneMaterial = new THREE.MeshBasicMaterial({
            depthTest: false,
            alphaTest: 0.5,
            side: THREE.BackSide,
            vertexColors: true,
        });
        this.sceneMesh = new THREE.Mesh(undefined, this.sceneMaterial);
        this.scene.add(this.sceneMesh);
        this.hardwareCamera = new THREE.Camera();
        this.hardwareCamera.projectionMatrix.set(
            2 / 320 * 1.2, 0, 0, 0,
            0, 2 / (179 - 21 + 1), 0, 0,
            0, 0, 0, -1 / 512,
            0, 0, -1 / 160, 13 / 160,
        );
        this.hardwareCamera.scale.y = -1;
        
        window.addEventListener('resize', () => this.onResize(), false);
        this.onResize();
        
        this.reset();
    }
    
    generateText() {
        // 0x0173-0x018B
        const data = new Uint8Array(320 * 200);
        this.drawText(data, 6, 1, 'OMNISCENT', 0x1C);
        this.drawText(data, 1, 12, '(C) 1997 SANCTION', 0x1C);
        
        // 0x0360-0x0376
        for(let i = 0; i < 0x7D00; ++i)
            this.background[i * 2] = this.background[i * 2 + 1] = data[0x0640 + i];
    }
    
    reset() {
        this.random.reset();
        this.camera.reset();
        this.texture.reset();
        
        this.backgroundStarDrawn = false;
        this.rendererCounter = 0;
    }
    
    onTimer() {
        this.rendererCounter = (this.rendererCounter + 1) & 0x7;
        if(this.rendererCounter === 0) {
            this.palette.onTimer();
            this.texture.onTimer();
        }
        
        return this.camera.onTimer();
    }
    
    renderFrameBuffer() {
        const size = new THREE.Vector2();
        this.renderer.getSize(size);
        const width = size.x, height = size.y;
        
        this.renderer.clear();
        this.frameBufferMaterial.map
            = new THREE.DataTexture(this.convertFrameBuffer(this.frameBuffer),
                320, 200, THREE.RGBFormat);
        this.frameBufferMaterial.map.needsUpdate = true;
        this.renderer.setViewport(0, 0, width, height);
        this.renderer.render(this.frameBufferScene, this.frameBufferCamera);
        this.frameBufferMaterial.map.dispose();
    }
    
    // 0x074E-0x09BE
    drawPolygon(textureIndex, clippedVertexCount, clippedDataI) {
        // 0x0752
        let minX = 32767, maxX = -32767;
        let minY = 32767, maxY = -32767;
        let indexL, indexR;
        for(let i = 0; i < clippedVertexCount; ++i) {
            let x = clippedDataI[4][i] >> 16;
            if(minX > x) minX = x;
            if(maxX < x) maxX = x;
            let y = OmniscentUtil.toInt16(clippedDataI[3][i]);
            if(minY > y) minY = y, indexL = indexR = i;
            if(maxY < y) maxY = y;
            // console.log(x, y);
        }
        
        // 0x0793
        if(maxX < 0 || minY > 320 || maxY < 21 || minY > 179) return;
        // console.log(minX, minY, maxX, maxY);
        if(maxY > 179) maxY = 179;
        if(minY === maxY) return;
        let scanlineY = minY;
        
        // [BP - 0x3C]
        let t0 = new Int32Array(10);
        // [BP - 0x78]
        let t1 = new Int32Array(10);
        // [BP - 0x50]
        let t2 = new Int32Array(5);
        // [BP - 0x14]
        let t3 = new Int32Array(5);
        
        // 0x09BF-0x0A08
        function interpolate(index0, index1, offset) {
            let y = OmniscentUtil.toInt16(clippedDataI[3][index1]);
            let dy = y - scanlineY;
            for(let i = 0; i < 5; ++i) {
                let x0 = clippedDataI[4 + i][index0];
                t0[offset + i] = x0;
                let x1 = clippedDataI[4 + i][index1];
                let dx = x1 - x0;
                if(dy !== 0) {
                    dx = (dx / dy) | 0;
                    t1[offset + i] = dx;
                }
            }
        }
        interpolate = interpolate.bind(this);
        
        // 0x07D5
        const texture = this.texture.getTextures()[textureIndex];
        while(scanlineY <= maxY) {
            // 0x07E8
            while(scanlineY <= maxY) { // while(true)?
                let y = OmniscentUtil.toInt16(clippedDataI[3][indexL]);
                if(scanlineY !== y) break;
                let index0 = indexL;
                if(--indexL < 0) indexL = clippedVertexCount - 1;
                interpolate(index0, indexL, 0);
            }
            // 0x0816
            while(scanlineY <= maxY) { // while(true)?
                let y = OmniscentUtil.toInt16(clippedDataI[3][indexR]);
                if(scanlineY !== y) break;
                let index0 = indexR;
                if(++indexR === clippedVertexCount) indexR = 0;
                interpolate(index0, indexR, 5);
            }
            // 0x0846
            if(scanlineY >= 21) {
                let l = t0[0] >> 16, r = t0[5] >> 16;
                let dx = r - l;
                if(dx !== 0 && r > 0 && l <= 320) {
                    // 0x0878
                    let dl = -l;
                    if(dl < 0) dl = 0;
                    else l = 0;
                    // 0x0885
                    for(let i = 1; i < 5; ++i) {
                        let a0 = t0[i], a1 = t0[5 + i];
                        let da = a1 - a0;
                        if(dx !== 0)
                            t2[i] = da / dx;
                        t3[i] = t2[i] * dl + a0;
                    }
                    // 0x08AF
                    let dd = OmniscentUtil.toInt16(t2[4]);
                    if(r > 320) r = 320;
                    let p = scanlineY * 320 + l;
                    let u0 = OmniscentUtil.toInt16(t3[1] * 256 / t3[3]); // [BP - 0x8C]
                    let v0 = OmniscentUtil.toInt16(t3[2] * 256 / t3[3]); // [BP - 0x8E]
                    // 0x08EC
                    while(true) {
                        let d = r - l;
                        if(d <= 0) break;
                        if(d > 16) d = 16;
                        t3[1] += t2[1] * d;
                        t3[2] += t2[2] * d;
                        t3[3] += t2[3] * d;
                        let u1 = OmniscentUtil.toInt16(t3[1] * 256 / t3[3]);
                        let v1 = OmniscentUtil.toInt16(t3[2] * 256 / t3[3]);
                        let du = OmniscentUtil.toInt16((u1 - u0) / d);
                        let dv = OmniscentUtil.toInt16((v1 - v0) / d);
                        for(let i = 0; i < d; ++i) {
                            let q = ((v0 & 0xFF00) >> 2) | (u0 >> 8);
                            let value = texture[q];
                            if(value)
                                this.frameBuffer[p] = this.lightMap.getLightMap()[value + (t3[4] & 0xFF00)];
                            t3[4] += dd;
                            u0 = OmniscentUtil.toInt16(u0 + du);
                            v0 = OmniscentUtil.toInt16(v0 + dv);
                            ++p;
                        }
                        u0 = u1;
                        v0 = v1;
                        l += 16;
                    }
                }
            }
            // 0x09A4
            for(let i = 0; i < 10; ++i)
                t0[i] += t1[i];
            ++scanlineY;
        }
    }
    
    // 0x0A09-0x0B5F
    drawQuad(quadIndex) {
        // [BP - 0xBE, 0xBA, 0xB6, (0xB2), (0xAE), 0xAA, 0xA6, (0xA2), 0x9E]
        let data = new Array(9), dataI = new Array(9);
        // [BP - 0x172, 0x16E, 0x16A, (0x166), (0x162), 0x15E, 0x15A, (0x156), 0x152]
        let clippedData = new Array(9), clippedDataI = new Array(9);
        for(let i = 0; i < 9; ++i) {
            data[i] = new Float32Array(4);
            clippedData[i] = new Float32Array(5);
        }
        for(let i = 0; i < 9; ++i) {
            dataI[i] = new Int32Array(data[i].buffer);
            clippedDataI[i] = new Int32Array(clippedData[i].buffer);
        }
        
        // 0x0A0D
        for(let i = 0; i < 4; ++i) {
            let vertexIndex = this.model.quads[quadIndex * 5 + i];
            data[0][i] = this.model.transformedVertexs[vertexIndex * 3];
            data[1][i] = this.model.transformedVertexs[vertexIndex * 3 + 1];
            data[2][i] = this.model.transformedVertexs[vertexIndex * 3 + 2];
            let z = Math.round(data[2][i]) + 512;
            if(z < 0) return;
            if(z > 511) z = 511;
            dataI[8][i] = ((z << 7) * this.model.vertexs[vertexIndex * 4 + 3]) >> 16;
            dataI[6][i] = OmniscentRenderer.TEXTURE_COORD_V_TABLE[i] << 16;
            dataI[5][i] = OmniscentRenderer.TEXTURE_COORD_U_TABLE[i] << 16;
        }
        // 0x0A80
        let textureIndex = this.model.quads[quadIndex * 5 + 4];
        // 0x0A85
        let clippedVertexCount = 0;
        // 0x0A8A
        let neg = data[2][3] < 0;
        
        // 0x0B60-0x0BAC
        function clip(i1) {
            let i0 = i1 - 1;
            if(i0 < 0) i0 = 3;
            let z = data[2][i1] / (data[2][i1] - data[2][i0]);
            for(let i of [0, 1, 2, 5, 6, 8])
                clippedData[i][clippedVertexCount]
                    = (data[i][i0] - data[i][i1]) * z + data[i][i1];
            ++clippedVertexCount;
        }
        clip = clip.bind(this);
        
        // 0x0A9B
        for(let i = 0; i < 4; ++i) {
            let z = data[2][i];
            if(z < 0) {
                if(!neg) clip(i), neg = !neg;
                for(let j = 0; j < 9; ++j)
                    clippedDataI[j][clippedVertexCount] = dataI[j][i];
                ++clippedVertexCount;
            } else {
                if(neg) clip(i), neg = !neg;
            }
        }
        
        // 0x0AED
        if(clippedVertexCount < 2) return; // 3?
        
        // 0x0AF7
        for(let i = 0; i < clippedVertexCount; ++i) {
            let z = (13 - clippedData[2][i]) / 160;
            clippedDataI[3][i] = Math.round(clippedData[1][i] / z + 100);
            clippedDataI[4][i] = Math.round(clippedData[0][i] * 1.2 / z + 160) * 65536;
            clippedDataI[5][i] = Math.round(clippedDataI[5][i] / z);
            clippedDataI[6][i] = Math.round(clippedDataI[6][i] / z);
            clippedDataI[7][i] = Math.round(65536 / z);
        }
        
        this.drawPolygon(textureIndex, clippedVertexCount, clippedDataI);
    }
    
    // 0x041D-0x0523
    render(useHardwareRenderer) {
        this.renderer.clear();
        
        if(this.texture.isDoorOpened() && !this.backgroundStarDrawn) {
            // 0x0428
            // Draw background star
            this.backgroundStarDrawn = true;
            for(let i = 0; i < 100; ++i) {
                const p = this.random.random(0xC1C0) + 0x1900;
                OmniscentUtil.drawStar(this.background, p, 0x013B, 0x0002, (p >> 8) & 0x07);
            }
        }
        this.texture.updateDoorTexture();
        
        // 0x0486
        for(let i = 0; i < 320 * 200; ++i)
            this.frameBuffer[i] = this.background[i];
        
        // 0x0493
        this.model.transformModel(this.camera);
        
        // 0x04D3
        this.sortList = new Int16Array((this.model.quadCount + 1) * 2);
        for(let i = 0; i < this.model.quadCount; ++i) {
            let z = 0;
            for(let j = 0; j < 4; ++j) {
                const index = this.model.quads[i * 5 + j];
                z -= this.model.transformedVertexs[index * 3 + 2];
            }
            this.sortList[i * 2] = z;
            this.sortList[i * 2 + 1] = i;
        }
        OmniscentUtil.quickSort(this.sortList, 0, this.model.quadCount - 1); // -1?
        
        if(!useHardwareRenderer) {
            // 0x0504
            for(let i = 0; i < this.model.quadCount; ++i)
                this.drawQuad(this.sortList[i * 2 + 1]);
        }
        
        this.renderFrameBuffer();
        
        if(useHardwareRenderer) {
            const size = new THREE.Vector2();
            this.renderer.getSize(size);
            const width = size.x, height = size.y;
            
            this.sceneMesh.geometry = this.convertModel();
            this.sceneMaterial.map
                = new THREE.DataTexture(this.convertTexture(), 4 * 64, 4 * 64, THREE.RGBAFormat);
            this.renderer.setViewport(0, (20 / 200) * height,
                width, ((179 - 21 + 1) / 200) * height);
            this.renderer.render(this.scene, this.hardwareCamera);
            this.sceneMesh.geometry.dispose();
            this.sceneMaterial.map.dispose();
        }
    }
    
    onResize() {
        const WIDTH = 320, HEIGHT = 200;
        const scale = Math.max(Math.floor(Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT)
            * window.devicePixelRatio * 0.8), 1) / window.devicePixelRatio;
        this.renderer.setSize(WIDTH * scale, HEIGHT * scale);
    }
    
    drawChar(data, x, y, c, color) {
        const index = c.charCodeAt(0);
        for(let i = 0; i < 8; ++i)
            for(let j = 0; j < 8; ++j)
                if((OmniscentRenderer.FONT[index * 8 + i] >> j) & 1)
                    data[(y * 8 + i) * 320 + (x * 8 + j)] = color;
    }
    drawText(data, x, y, s, color) {
        for(let i = 0; i < s.length; ++i)
            this.drawChar(data, x + i, y, s.charAt(i), color);
    }
    
    convertModel() {
        let positionData = [];
        let colorData = [];
        let textureCoordData = [];
        let indexData = [];
        
        let textureUnitX = 1 / 4, textureUnitY = 1 / 4;
        let indexOffset = 0;
        for(let i = 0; i < this.model.quadCount; ++i) {
            let quadIndex = this.sortList[i * 2 + 1];
            let textureIndex = this.model.quads[quadIndex * 5 + 4];
            let clipped = false;
            for(let j = 0; j < 4; ++j) {
                let vertexIndex = this.model.quads[quadIndex * 5 + j];
                if(this.model.transformedVertexs[vertexIndex * 3 + 2] + 512 < 0) {
                    clipped = true;
                    break;
                }
            }
            if(clipped) continue;
            for(let j = 0; j < 4; ++j) {
                let vertexIndex = this.model.quads[quadIndex * 5 + j];
                for(let k = 0; k < 3; ++k)
                    positionData.push(this.model.transformedVertexs[vertexIndex * 3 + k]);
                let color = textureIndex <= 2 ? 0xFF : (
                    (this.model.vertexs[vertexIndex * 4 + 3] / 0x7F00)
                    * (Math.min(511, this.model.transformedVertexs[vertexIndex * 3 + 2] + 512) / 511)
                    * 0xFF) | 0;
                colorData.push(color, color, color);
            }
            let textureX = (textureIndex & 0x3) * textureUnitX;
            let textureY = (textureIndex >> 2) * textureUnitY;
            textureCoordData.push(
                textureX, textureY + textureUnitY * (63 / 64),
                textureX, textureY,
                textureX + textureUnitX * (63 / 64), textureY,
                textureX + textureUnitX * (63 / 64), textureY + textureUnitY * (63 / 64),
            );
            indexData.push(indexOffset, indexOffset + 1, indexOffset + 2,
                indexOffset, indexOffset + 2, indexOffset + 3);
            indexOffset += 4;
        }
        
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionData, 3));
        geometry.setAttribute('color', new THREE.Uint8BufferAttribute(colorData, 3, true));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(textureCoordData, 2));
        geometry.setIndex(indexData);
        return geometry;
    }
    convertFrameBuffer(data) {
        const palette = this.palette.getPalette();
        let result = new Uint8Array(3 * 320 * 200);
        for(let i = 0; i < 320 * 200; ++i) {
            let value = data[i];
            result[i * 3] = palette[value * 3];
            result[i * 3 + 1] = palette[value * 3 + 1];
            result[i * 3 + 2] = palette[value * 3 + 2];
        }
        return result;
    }
    convertTexture() {
        const WIDTH = 4 * 64, HEIGHT = 4 * 64;
        const palette = this.palette.getPalette();
        const textures = this.texture.getTextures();
        const result = new Uint8Array(4 * WIDTH * HEIGHT);
        for(let i = 0; i < 15; ++i) {
            const x0 = (i & 0x3) * 64, y0 = (i >> 2) * 64;
            for(let j = 0; j < 0x1000; ++j) {
                const x1 = j & 0x3F, y1 = j >> 6;
                const value = textures[i][j];
                const index = 4 * ((y0 + y1) * WIDTH + (x0 + x1));
                if(value === 0) {
                    result[index] = 0x00;
                    result[index + 1] = 0x00;
                    result[index + 2] = 0x00;
                    result[index + 3] = 0x00;
                } else {
                    result[index] = palette[value * 3];
                    result[index + 1] = palette[value * 3 + 1];
                    result[index + 2] = palette[value * 3 + 2];
                    result[index + 3] = 0xFF;
                }
            }
        }
        return result;
    }
}

class Omniscent {
    constructor(canvas) {
        this.canvas = canvas;
        
        this.midi = new OmniscentMIDI();
        this.renderer = new OmniscentRenderer(this.canvas);
        
        // Use WebGL to render model instead of original software rasterizer
        this.useHardwareRenderer = false;

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
                
        console.log('Start.');
        
        await this.midi.start();
        
        let lastFrame = 0;
        let startTime = getTime();
    loop:
        while(true) {
            let currentFrame = Math.floor((getTime() - startTime) / unitTime);
            while(lastFrame < currentFrame) {
                this.onTimer();
                if(this.stopping) break loop;
                ++lastFrame;
            }
            await wait();
        }
        
        this.midi.stop();
        
        console.log('End.');
        
        this.running = false;
        this.stopping = false;
    }
    
    stop() {
        if(!this.running) return;
        this.stopping = true;
    }
}


const canvas = document.getElementById('main-canvas');

const controls = {
    play: document.getElementById('control-play'),
    hardwareRenderer: document.getElementById('control-hardware-renderer'),
    midiOut: document.getElementById('control-midi-out'),
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
        if(OMNISCENT.midi.midiOutput)
            OMNISCENT.midi.midiOutput.disconnect();
        const midiOutName = controls.midiOut.options[controls.midiOut.selectedIndex].value;
        if(midiOutName !== '(None)')
            OMNISCENT.midi.midiOutput =
                JZZ()
                .openMidiOut(midiOutName)
                .or(() => console.error('Cannot open MIDI Out port!'));
        controls.midiOut.disabled = true;
        OMNISCENT.start().then(() => {
            controls.play.value = 'Play';
            controls.midiOut.disabled = false;
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

JZZ.synth.Tiny.register('JZZ synth Tiny');
JZZ().and(function() {
    let i = 0;
    for(; i < this.info().outputs.length; ++i)
        controls.midiOut[i] = new Option(this.info().outputs[i].name);
    controls.midiOut[i] = new Option('(None)');
});
