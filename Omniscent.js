'use strict';


class Omniscent {
    constructor(canvas) {
        this.canvas = canvas;
        
        this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: false});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.autoClear = false;

        this.backgroundScene = new THREE.Scene();
        this.backgroundMaterial = new THREE.MeshBasicMaterial({
            depthTest: false,
            side: THREE.DoubleSide,
        });
        this.backgroundGeometry = new THREE.PlaneBufferGeometry(1, 1);
        this.backgroundMesh = new THREE.Mesh(this.backgroundGeometry, this.backgroundMaterial);
        this.backgroundScene.add(this.backgroundMesh);
        this.backgroundCamera = new THREE.OrthographicCamera(-0.5, 0.5, -0.5, 0.5, 0.0, 1.0);

        this.scene = new THREE.Scene();
        this.sceneMaterial = new THREE.MeshBasicMaterial({
            depthTest: false,
            alphaTest: 0.5,
            side: THREE.BackSide,
        });
        this.sceneMesh = new THREE.Mesh(undefined, this.sceneMaterial);
        this.scene.add(this.sceneMesh);
        this.camera = new THREE.PerspectiveCamera(70, 320 / (179 - 21 + 1), 0.015625, 4096.0);
        this.camera.scale.y = -1;
        
        window.addEventListener('resize', () => this.onResize(), false);
        this.onResize();
        
        this.FONT = new Uint8Array(Base64.toUint8Array('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'));
        this.DATA = Base64.toUint8Array('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');
        this.MEMORY = new Uint8Array(0x44000);
        
        // 0x0104-0x0119
        this.background = new Uint8Array(this.MEMORY.buffer, 0x10000, 320 * 200);
        this.frameBuffer = new Uint8Array(this.MEMORY.buffer, 0x20000, 320 * 200);
        this.textures = new Array(0x14);
        for(let i = 0; i < 0x14; ++i)
            this.textures[i] = new Uint8Array(this.MEMORY.buffer, 0x30000 + 0x1000 * i, 0x1000);
        
        this.reset();
    }
    
    reset() {
        // Use WebGL to render model instead of original software rasterizer
        this.hardwareRenderer = false;
        
        this.MEMORY.fill(0x00);
        for(let i = 0; i < 0x12AE; ++i)
            this.MEMORY[i + 0x0100] = this.DATA[i];
        
        // Uint32 [0x0DDB]
        this.randomA = 0x08088405;
        // Uint32 [0x0DDF]
        this.randomB = 0x000010FB;
        
        this.cameraPosition = new Float32Array([-330.0, 0.0, 64.0]);
        this.cameraMatrix0 = new Float32Array([0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 1.0, 0.0, 0.0]);
        this.cameraMatrix1 = new Float32Array([0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 1.0, 0.0, 0.0]);
        
        this.backgroundStarDrawn = false;
        
        this.rendererCounter = 0;
        this.cameraDataCounter = 0;
        this.cameraDataPointer = 0;
        this.cameraA = 0;
        // Int16 [0x1360]
        this.cameraDir = 1;
        this.cameraData = new Int16Array(4);
        // Int16 [0x0DD5]
        this.cameraSpeed = 1792;
        
        this.doorOffset = this.toInt16(this.MEMORY[0x1362] | (this.MEMORY[0x1363] << 8));
        
        this.running = false;
        this.stopping = false;
        
        this.generateMIDI();
        this.generateModel();
        this.generateText();
        this.generatePalette();
        this.generateTexture();
    }
    
    // 0x014C-0x016A
    generateMIDI() {
        // 0x0DE3-0x0F27: MIDI Data
        this.midiData = [];
        let p = 0x0DE3;
        while(this.MEMORY[p] - 1 >= 0) {
            let channelData = {};
            channelData.channel = this.MEMORY[p++] - 1;
            channelData.instrument = this.MEMORY[p++];
            channelData.data = [];
            p = this.generateMIDILoop(p, channelData);
            channelData.data = new Uint8Array(channelData.data);
            this.midiData.push(channelData);
        }
    }
    
    generateText() {
        // 0x0173-0x018B
        let data = new Uint8Array(320 * 200);
        this.drawText(data, 6, 1, 'OMNISCENT', 0x1C);
        this.drawText(data, 1, 12, '(C) 1997 SANCTION', 0x1C);
        
        // 0x0360-0x0376
        for(let i = 0; i < 0x7D00; ++i)
            this.background[i * 2] = this.background[i * 2 + 1] = data[0x0640 + i];
    }
    
    // 0x018C-0x01BC
    generatePalette() {
        // 0x0F28-0x0F68: Palette data
        // 0x1408-0x1707: Generated palette data
        this.palette = new Uint8Array(3 * 0x100);
        let a = 0x0000, b = 0x0001;
        for(let i = 0; i < 3; ++i) {
            let p = 0x0F28, q = 0x00;
            a = this.MEMORY[p];
            // Don't clear DL?
            b &= 0x00FF;
            let entryCount = this.MEMORY[p++];
            for(let j = 0; j < entryCount; ++j) {
                a = (a & 0x00FF) | (this.MEMORY[p + i + 1] << 8);
                a = ((a - b) / this.MEMORY[p]) | 0;
                for(let k = 0; k < this.MEMORY[p]; ++k, ++q) {
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
    
    // 0x01BD-0x02FE
    generateTexture() {
        // 0x0F69-0x1004: Texture pattern data
        // 0x1005-0x1020: Texture background data
        // 0x41ED-0x4246: Texture 0x01 data
        
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
            let a = this.random(0x4);
            a = (a + this.textures[0x12][i] + this.textures[0x12][i + 1]) & 0xFF;
            a = (a - 1) >> 1;
            this.textures[0x12][i + 0x40] = a;
        }
        
        // 0x01F5-0x020D
        // Generate texture 0x12
        this.textures[0x13].fill(0x03);
        for(let i = 0; i < 0x1000; ++i) {
            let p = this.random(0x1000);
            ++this.textures[0x13][p];
        }
        
        // 0x020E-0x022C
        // Generate texture 0x01 data
        this.texture01Data = new Array(0x1E);
        for(let i = 0; i < 0x1E; ++i) {
            let t = new Array(2);
            t[0] = this.random(0x100);
            t[1] = this.random(0xEC0 + 0x80) + 0x40;
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
        for(let i = 0x02, p = 0x1005; i <= 0x0F; ++i, p += 2) {
            let src = this.textures[this.MEMORY[p] >> 1], dst = this.textures[i];
            let offset = this.MEMORY[p + 1];
            for(let j = 0; j < 0x1000; ++j)
                dst[j] = src[j] + offset;
        }
        
        // 0x0281-0x02D7
        // Generate texture 0x03, 0x05, 0x0C, 0x0E, 0x0F pattern
        for(let i = 0, p = 0x0F69; i < 0x1A; ++i, p += 6) {
            let dst = this.textures[this.MEMORY[p] & 0x0F];
            let mode = this.MEMORY[p] >> 4;
            let x0 = this.MEMORY[p + 1], y0 = this.MEMORY[p + 2];
            let x1 = this.MEMORY[p + 3], y1 = this.MEMORY[p + 4];
            let offset = this.MEMORY[p + 5];
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
                let p = 0xFFF - 0x40 * i - this.random(0x40);
                this.textures[0x0B][p] = 0x5E - i;
            }
        }
        
        // 0x4274-0xC273: Light map
        this.lightMap = new Uint8Array(0x80 * 0x100);
        // 0x02FF-0x032D
        let p = 0;
        for(let i = 0x00; i < 0x80; ++i) {
            for(let j = 0x00; j < 0xC0; ++j)
            this.lightMap[p++] = (j & 0xE0) + (((j & 0x1F) * i * 2) >> 8);
            for(let j = 0xC0; j < 0x100; ++j)
            this.lightMap[p++] = j;
        }
    }
    
    // 0x041D-0x0523
    onRender() {
        let offset = this.doorOffset;
        if(offset < 0) offset = 0;
        else if(!this.backgroundStarDrawn) {
            // 0x0428
            // Draw background star
            this.backgroundStarDrawn = true;
            for(let i = 0; i < 100; ++i) {
                let p = this.random(0xC1C0) + 0x1900;
                this.drawStar(this.background, p, 0x013B, 0x0002, (p >> 8) & 0x07);
            }
        }
        // 0x0457
        // Update texture 0x0D
        if(offset > 0x18) offset = 0x18;
        offset <<= 6;
        for(let i = 0; i < 0x800; ++i)
            this.textures[0x0D][i] = this.textures[0x0F][offset + i];
        for(let i = 0; i < 0x800; ++i)
            this.textures[0x0D][0x800 + i] = this.textures[0x0F][0x800 - offset + i];
        for(let i = 0; i < offset * 2; ++i)
            this.textures[0x0D][0x800 - offset + i] = 0x00;
        
        // 0x0486
        for(let i = 0; i < 320 * 200; ++i)
            this.frameBuffer[i] = this.background[i];
        
        // 0x0493
        this.transformModel();
        
        // 0x04D3
        this.sortList = new Int16Array((this.quadCount + 1) * 2);
        for(let i = 0; i < this.quadCount; ++i) {
            let z = 0;
            for(let j = 0; j < 4; ++j) {
                let index = this.quads[i * 5 + j];
                z -= this.transformedVertexs[index * 3 + 2];
            }
            this.sortList[i * 2] = z;
            this.sortList[i * 2 + 1] = i;
        }
        this.quickSort(0, this.quadCount - 1); // -1?
        
        // 0x0504
        if(!this.hardwareRenderer)
            for(let i = 0; i < this.quadCount; ++i)
                this.drawQuad(this.sortList[i * 2 + 1]);
        
        
        let size = new THREE.Vector2();
        this.renderer.getSize(size);
        let width = size.x, height = size.y;
        
        this.renderer.clear();
        
        this.backgroundMaterial.map
            = new THREE.DataTexture(this.convertFrameBuffer(this.frameBuffer),
                320, 200, THREE.RGBFormat);
        this.renderer.setViewport(0, 0, width, height);
        this.renderer.render(this.backgroundScene, this.backgroundCamera);
        this.backgroundMaterial.map.dispose();
        
        if(this.hardwareRenderer) {
            this.sceneMesh.geometry = this.convertModel();
            this.sceneMaterial.map
                = new THREE.DataTexture(this.convertTexture(), 4 * 64, 4 * 64, THREE.RGBAFormat);
            this.renderer.setViewport(0, (20 / 200) * height,
                width, ((179 - 21 + 1) / 200) * height);
            this.renderer.render(this.scene, this.camera);
            this.sceneMesh.geometry.dispose();
            this.sceneMaterial.map.dispose();
        }
    }
    
    // 0x0493-0x04D2
    transformModel() {
        this.transformedVertexs = new Float32Array(this.vertexCount * 3);
        for(let i = 0; i < this.vertexCount; ++i)
            for(let j = 0; j < 3; ++j)
                this.transformedVertexs[i * 3 + j] =
                    (this.vertexs[i * 4] - this.cameraPosition[0]) * this.cameraMatrix1[j * 3]
                    + (this.vertexs[i * 4 + 1] - this.cameraPosition[1]) * this.cameraMatrix1[j * 3 + 1]
                    + (this.vertexs[i * 4 + 2] - this.cameraPosition[2]) * this.cameraMatrix1[j * 3 + 2];
    }
    
    // 0x0563-0x0601
    onTimer() {
        // 0x0568
        for(let i = 0; i < this.midiData.length; ++i) {
            const channel = this.midiData[i].channel;
            const data = this.midiData[i].data;
            if(this.midiIndexs[i][0] < data.length) {
                if(this.midiIndexs[i][1] === 0) {
                    this.midiIndexs[i][0] += 2;
                    if(this.midiIndexs[i][0] > 0)
                        this.midiOutput.send([0x80 | channel, data[this.midiIndexs[i][0] - 2], 0x7F]);
                    if(this.midiIndexs[i][0] >= data.length) continue;
                    this.midiIndexs[i][1] = data[this.midiIndexs[i][0] + 1] * 29;
                    this.midiOutput.send([0x90 | channel, data[this.midiIndexs[i][0]], 0x7F]);
                }
                --this.midiIndexs[i][1];
            }
        }
        
        this.rendererCounter = (this.rendererCounter + 1) & 0x7;
        if(this.rendererCounter === 0) {
            // 0x05B3
            // Update palette 0xC0-0xDF
            let t = [this.palette[0xC0 * 3], this.palette[0xC0 * 3 + 1]];
            for(let i = 0; i < 0x5D; ++i)
                this.palette[0xC0 * 3 + i] = this.palette[0xC1 * 3 + i];
            this.palette[0xDF * 3] = t[0];
            this.palette[0xDF * 3 + 1] = t[1];
            
            // 0x05C2
            // Generate texture 0x01
            this.textures[0x01].fill(0x00);
            for(let i = 0; i < 0x1E; ++i) {
                this.texture01Data[i][0] = (this.texture01Data[i][0] - 1) & 0xFF;
                let a = this.texture01Data[i][0] & 0x3F;
                if(a < 0x1F)
                    a = ~a & 0x1F;
                a >>= 1;
                let b = this.texture01Data[i][1];
                this.drawStar(this.textures[0x01], b, 0x003B, 0xE000, a);
            }
            
            ++this.doorOffset;
        }
        
        // 0x0396
        if(--this.cameraDataCounter < 0) {
            let a = this.MEMORY[0x12E3 + this.cameraDataPointer];
            if(a === 0) { this.stop(); return; }
            this.cameraDataCounter = (a & 0xF8) << 1;
            a &= 0x07;
            this.cameraA = a;
            if(a == 0x1)
                this.cameraDir = -this.cameraDir;
            ++this.cameraDataPointer;
        }
        if(this.cameraA == 0x1)
            this.cameraData[3] += this.cameraDir;
        for(let i = 0; i < 3; ++i) {
            if(this.cameraA == 0x02 + i * 2)
                ++this.cameraData[i];
            if(this.cameraA == 0x03 + i * 2)
                --this.cameraData[i];
        }
        this.updateCameraMatrix(
            this.cameraData[2] << 4, this.cameraData[3] >> 2, this.cameraData[2] >> 2, this.cameraData[1] >> 2);
        for(let i = 0; i < 3; ++i)
            this.cameraPosition[i] += this.cameraMatrix0[6 + i] * this.cameraData[0] / this.cameraSpeed;
    }
    
    // 0x0611-0x062F
    drawStar(data, index, stride, color, value) {
        // 0x1021-0x1039: Star pattern data
        let pattern = new Uint8Array(this.MEMORY.buffer, 0x1021, 5 * 5);
        for(let i = 0, p = 0; i < 5; ++i, index += stride)
            for(let j = 0; j < 5; ++j, ++p, ++index) {
                let x = pattern[p];
                if(x > value)
                    data[index] = ((x - value) + (color >> 8)) << (color & 0xFF);
            }
    }
    
    // 0x063B-0x0659
    generateMIDILoop(p, channelData) {
        while(this.MEMORY[p] !== 0x00) {
            if(this.MEMORY[p] >= 0x80) {
                let count = 0x100 - this.MEMORY[p++];
                let q = p;
                for(let i = 0; i < count; ++i) {
                    p = q;
                    p = this.generateMIDILoop(p, channelData);
                }
            } else
                channelData.data.push(this.MEMORY[p++], this.MEMORY[p++]);
        }
        ++p;
        return p;
    }
    
    // 0x065A-0x698
    quickSort(l, r) {
        if(l >= r) return;
        let ll = l, rr = r;
        let x = this.sortList[ll * 2];
        do {
            while(this.sortList[ll * 2] > x) ++ll;
            while(this.sortList[rr * 2] < x) --rr;
            if(ll > rr) break;
            let t0 = this.sortList[ll * 2];
            this.sortList[ll * 2] = this.sortList[rr * 2];
            this.sortList[rr * 2] = t0;
            let t1 = this.sortList[ll * 2 + 1];
            this.sortList[ll * 2 + 1] = this.sortList[rr * 2 + 1];
            this.sortList[rr * 2 + 1] = t1;
            ++ll;
            --rr;
        } while(ll <= rr);
        this.quickSort(l, rr);
        this.quickSort(ll, r);
    }
    
    // 0x0699-0x06B8
    random(x) {
        this.randomB = (Math.imul(this.randomB, this.randomA) + 1) | 0;
        return ((((this.randomB >> 16) & 0xFFFF) * x) >> 16) & 0xFFFF;
    }
    
    // 0x06E8-0x074D
    generateCircleNoise(id, r, n) {
        let texture = this.textures[id];
        texture.fill(0x00);
        
        let table = new Array(r * 2);
        for(let i = r; i > -r; --i)
            table[r - i] = Math.round(Math.sqrt(r * r - i * i)) | 0;
        for(let i = 0; i < n; ++i) {
            let p = this.random(0x1000);
            for(let j = 0; j < r * 2; ++j) {
                let a = table[j];
                for(let k = 0; k < a * 2; ++k)
                    ++texture[(p - a + k) & 0x0FFF];
                p += 0x40;
            }
        }
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
            let y = this.toInt16(clippedDataI[3][i]);
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
            let y = this.toInt16(clippedDataI[3][index1]);
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
        let texture = this.textures[textureIndex];
        while(scanlineY <= maxY) {
            // 0x07E8
            while(scanlineY <= maxY) { // while(true)?
                let y = this.toInt16(clippedDataI[3][indexL]);
                if(scanlineY != y) break;
                let index0 = indexL;
                if(--indexL < 0) indexL = clippedVertexCount - 1;
                interpolate(index0, indexL, 0);
            }
            // 0x0816
            while(scanlineY <= maxY) { // while(true)?
                let y = this.toInt16(clippedDataI[3][indexR]);
                if(scanlineY != y) break;
                let index0 = indexR;
                if(++indexR == clippedVertexCount) indexR = 0;
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
                    let dd = this.toInt16(t2[4]);
                    if(r > 320) r = 320;
                    let p = scanlineY * 320 + l;
                    let u0 = this.toInt16(t3[1] * 256 / t3[3]); // [BP - 0x8C]
                    let v0 = this.toInt16(t3[2] * 256 / t3[3]); // [BP - 0x8E]
                    // 0x08EC
                    while(true) {
                        let d = r - l;
                        if(d <= 0) break;
                        if(d > 16) d = 16;
                        t3[1] += t2[1] * d;
                        t3[2] += t2[2] * d;
                        t3[3] += t2[3] * d;
                        let u1 = this.toInt16(t3[1] * 256 / t3[3]);
                        let v1 = this.toInt16(t3[2] * 256 / t3[3]);
                        let du = this.toInt16((u1 - u0) / d);
                        let dv = this.toInt16((v1 - v0) / d);
                        for(let i = 0; i < d; ++i) {
                            let q = ((v0 & 0xFF00) >> 2) | (u0 >> 8);
                            let value = texture[q];
                            if(value)
                                this.frameBuffer[p] = this.lightMap[value + (t3[4] & 0xFF00)];
                            t3[4] += dd;
                            u0 = this.toInt16(u0 + du);
                            v0 = this.toInt16(v0 + dv);
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
            let vertexIndex = this.quads[quadIndex * 5 + i];
            data[0][i] = this.transformedVertexs[vertexIndex * 3];
            data[1][i] = this.transformedVertexs[vertexIndex * 3 + 1];
            data[2][i] = this.transformedVertexs[vertexIndex * 3 + 2];
            let z = Math.round(data[2][i]) + 512;
            if(z < 0) return;
            if(z > 511) z = 511;
            dataI[8][i] = ((z << 7) * this.vertexs[vertexIndex * 4 + 3]) >> 16;
            dataI[6][i] = this.MEMORY[0x1043 + i] << 16; // 63, 0, 0, 63
            dataI[5][i] = this.MEMORY[0x103F + i] << 16; // 0, 0, 63, 63
        }
        
        // 0x0A80
        let textureIndex = this.quads[quadIndex * 5 + 4];
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
    
    // 0x0BAD-0x0BCF
    rotateVector2(vector, angle) {
        angle *= Math.PI / 0x10000;
        let c = Math.cos(angle), s = Math.sin(angle);
        return [c * vector[0] - s * vector[1], s * vector[0] + c * vector[1]];
    }
    // 0x0BD0-0x0BFB
    rotateVector3(vector, angle) {
        let result = [vector[0], vector[1], vector[2]];
        let a = this.rotateVector2([result[1], result[2]], angle[2]);
        result[1] = a[0], result[2] = a[1];
        let b = this.rotateVector2([result[2], result[0]], angle[1]);
        result[2] = b[0], result[0] = b[1];
        let c = this.rotateVector2([result[0], result[1]], angle[0]);
        result[0] = c[0], result[1] = c[1];
        return result;
    }
    
    // 0x0BFC-0x0C7F
    updateCameraMatrix(a, b, c, d) {
        let cameraMatrix2 = new Float32Array(9);
        for(let i = 0; i < 3; ++i)
            for(let j = 0; j < 3; ++j)
                cameraMatrix2[i * 3 + j] = i == j;
        for(let i = 0; i < 3; ++i) {
            let v = this.rotateVector3([
                    cameraMatrix2[i * 3],
                    cameraMatrix2[i * 3 + 1],
                    cameraMatrix2[i * 3 + 2],
                ], [b, c, d]);
            cameraMatrix2[i * 3] = v[0];
            cameraMatrix2[i * 3 + 1] = v[1];
            cameraMatrix2[i * 3 + 2] = v[2];
            for(let j = 0; j < 3; ++j)
                this.cameraMatrix0[i * 3 + j] = this.cameraMatrix1[i * 3 + j]
                    = cameraMatrix2[i * 3] * this.cameraMatrix0[j]
                    + cameraMatrix2[i * 3 + 1] * this.cameraMatrix0[3 + j]
                    + cameraMatrix2[i * 3 + 2] * this.cameraMatrix0[6 + j];
        }
        for(let i = 0; i < 3; ++i) {
            let v = this.rotateVector2([this.cameraMatrix1[i], this.cameraMatrix1[3 + i]], a);
            this.cameraMatrix1[i] = v[0];
            this.cameraMatrix1[3 + i] = v[1];
        }
    }
    
    // 0x0C80-0x0DCA
    generateModel() {
        // 0x1047-0x105E: Index data
        // 0x105F-0x108B: Vertex position data
        // 0x1768: Vertex count (362)
        // 0x176A: Quad count (367)
        // 0x176C-0x22BB: Vertex data
        // 0x23EC-0x3241: Quad data
        this.vertexCount = 0;
        this.quadCount = 0;
        this.vertexs = new Int16Array(362 * 4);
        this.quads = new Int16Array(367 * 5);
        let p = 0x108C;
        let int8Table = new Int8Array(this.MEMORY.buffer, 0x105F, 3 * 15);
        let int16Table = new Int16Array(4 * 15);
        let float32Table = new Float32Array(3 * 15);
        for(let i = 0; i < 4; ++i) {
            // 0x0C8B-0x0CAE
            for(let j = 0; j < 15; ++j) {
                for(let k = 0; k < 3; ++k) {
                    let x = int8Table[j * 3 + k];
                    int16Table[j * 4 + k] = x;
                    float32Table[j * 3 + k] = x;
                }
                int16Table[j * 4 + 3] = 0x7F00;
            }
            // 0x0CAF-0x0DC0
            while(true) {
                let a = this.MEMORY[p++];
                if(a === 0xFF) break;
                let face = a & 0x0F;
                let light = ((a << 8) & 0x7000) | 0x0F00;
                for(let j = 0; j < 6; ++j) {
                    let textureIndex;
                    if(j & 0x01)
                        textureIndex = this.MEMORY[p++] & 0x0F;
                    else
                        textureIndex = this.MEMORY[p] >> 4;
                    --textureIndex;
                    if(textureIndex < 0) continue;
                    this.quads[this.quadCount * 5 + 4] = textureIndex;
                    for(let k = 0; k < 4; ++k) {
                        let index = this.MEMORY[0x1047 + j * 4 + k] >> 3;
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
                    let angle = (this.MEMORY[p] << 8) & 0xF000;
                    if(angle >= 0x8000) angle -= 0x10000;
                    let angles = [
                        this.MEMORY[p] & 0x04 ? angle : 0,
                        this.MEMORY[p] & 0x02 ? angle : 0,
                        this.MEMORY[p] & 0x01 ? angle : 0,
                    ];
                    for(let j = 0; j < 14; ++j) {
                        let v = this.rotateVector3([
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
                    let index0 = this.MEMORY[0x1047 + face * 4 + j] >> 3;
                    let index1 = this.MEMORY[0x1047 + ((face * 4 + j) ^ 0x7)] >> 3;
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
    
    async start() {
        if(this.running) return;
        this.running = true;
        
        const unitTime = 1000 / 350;
        
        this.midiOutput = await JZZ.synth.Tiny();
        
        this.midiIndexs = new Array(this.midiData.length);
        for(let i = 0; i < this.midiData.length; ++i)
            this.midiIndexs[i] = [-2, 0];
        
        for(const channelData of this.midiData)
            this.midiOutput.send([0xC0 + channelData.channel, channelData.instrument]);
        
        function getTime() { return (new Date()).getTime(); }
        function wait() { return new Promise((resolve) => setTimeout(resolve, 10)); }
                
        console.log('Start.');
        
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
        
        // 0x052C
        for(let i = 1; i <= 15; ++i)
            this.midiOutput.send([0xB0 + i, 0x7B, 0x00]);
        
        console.log('End.');
        
        this.running = false;
        this.stopping = false;
    }
    
    stop() {
        if(!this.running) return;
        this.stopping = true;
    }
    
    onResize() {
        const WIDTH = 320, HEIGHT = 200;
        let scale = Math.max(Math.floor(Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT)
            * window.devicePixelRatio * 0.8), 1) / window.devicePixelRatio;
        this.renderer.setSize(WIDTH * scale, HEIGHT * scale);
    }
    
    toInt16(x) {
        x &= 0xFFFF;
        if(x >= 0x8000) x -= 0x10000;
        return x;
    }
    
    drawChar(data, x, y, c, color) {
        let index = c.charCodeAt(0);
        for(let i = 0; i < 8; ++i)
            for(let j = 0; j < 8; ++j)
                if((this.FONT[index * 8 + i] >> j) & 1)
                    data[(y * 8 + i) * 320 + (x * 8 + j)] = color;
    }
    drawText(data, x, y, s, color) {
        for(let i = 0; i < s.length; ++i)
            this.drawChar(data, x + i, y, s.charAt(i), color);
    }
    
    convertModel() {
        let positionData = [];
        let textureCoordData = [];
        let indexData = [];
        
        let textureUnitX = 1 / 4, textureUnitY = 1 / 4;
        let indexOffset = 0;
        for(let i = 0; i < this.quadCount; ++i) {
            let quadIndex = this.sortList[i * 2 + 1];
            for(let j = 0; j < 4; ++j) {
                let vertexIndex = this.quads[quadIndex * 5 + j];
                for(let k = 0; k < 3; ++k)
                    positionData.push(this.transformedVertexs[vertexIndex * 3 + k]);
            }
            let textureIndex = this.quads[quadIndex * 5 + 4];
            let textureX = (textureIndex & 0x3) * textureUnitX;
            let textureY = (textureIndex >> 2) * textureUnitY;
            textureCoordData.push(
                textureX, textureY + textureUnitY,
                textureX, textureY,
                textureX + textureUnitX, textureY,
                textureX + textureUnitX, textureY + textureUnitY,
            );
            indexData.push(indexOffset, indexOffset + 1, indexOffset + 2,
                indexOffset, indexOffset + 2, indexOffset + 3);
            indexOffset += 4;
        }
        
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionData, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(textureCoordData, 2));
        geometry.setIndex(indexData);
        return geometry;
    }
    convertFrameBuffer(data) {
        let result = new Uint8Array(3 * 320 * 200);
        for(let i = 0; i < 320 * 200; ++i) {
            let value = data[i];
            result[i * 3] = this.palette[value * 3];
            result[i * 3 + 1] = this.palette[value * 3 + 1];
            result[i * 3 + 2] = this.palette[value * 3 + 2];
        }
        return result;
    }
    convertTexture() {
        const WIDTH = 4 * 64, HEIGHT = 4 * 64;
        let result = new Uint8Array(4 * WIDTH * HEIGHT);
        for(let i = 0; i < 15; ++i) {
            let x0 = (i & 0x3) * 64, y0 = (i >> 2) * 64;
            for(let j = 0; j < 0x1000; ++j) {
                let x1 = j & 0x3F, y1 = j >> 6;
                let value = this.textures[i][j];
                let index = 4 * ((y0 + y1) * WIDTH + (x0 + x1));
                if(value === 0) {
                    result[index] = 0x00;
                    result[index + 1] = 0x00;
                    result[index + 2] = 0x00;
                    result[index + 3] = 0x00;
                } else {
                    result[index] = this.palette[value * 3];
                    result[index + 1] = this.palette[value * 3 + 1];
                    result[index + 2] = this.palette[value * 3 + 2];
                    result[index + 3] = 0xFF;
                }
            }
        }
        return result;
    }
}


let canvas = document.getElementById('mainCanvas');
let OMNISCENT = new Omniscent(canvas);


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
    if(OMNISCENT.running) return;
    OMNISCENT.reset();
    OMNISCENT.start();
}
