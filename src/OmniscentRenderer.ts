import { toByteArray as decodeBase64 } from 'base64-js';
import * as THREE from 'three';

import { OmniscentCamera } from './OmniscentCamera';
import { OmniscentLightMap } from './OmniscentLightMap';
import { OmniscentModel } from './OmniscentModel';
import { OmniscentPalette } from './OmniscentPalette';
import { OmniscentRandom } from './OmniscentRandom';
import { OmniscentTexture } from './OmniscentTexture';
import { OmniscentUtil } from './OmniscentUtil';


export class OmniscentRenderer {
    // 0x103F-0x1042: Texture coord U table
    static TEXTURE_COORD_U_TABLE = new Uint8Array([0, 0, 63, 63]);
    // 0x1043-0x1046: Texture coord V table
    static TEXTURE_COORD_V_TABLE = new Uint8Array([63, 0, 0, 63]);
    
    // eslint-disable-next-line max-len
    static FONT = decodeBase64('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');
    
    private random: OmniscentRandom;
    private camera: OmniscentCamera;
    private model: OmniscentModel;
    private palette: OmniscentPalette;
    private texture: OmniscentTexture;
    private lightMap: OmniscentLightMap;
    
    private background: Uint8Array;
    private frameBuffer: Uint8Array;
    
    private renderer: THREE.WebGLRenderer;
    private frameBufferScene: THREE.Scene;
    private frameBufferMaterial: THREE.MeshBasicMaterial;
    private frameBufferGeometry: THREE.PlaneGeometry;
    private frameBufferMesh: THREE.Mesh;
    private frameBufferCamera: THREE.OrthographicCamera;
    private scene: THREE.Scene;
    private sceneMaterial: THREE.ShaderMaterial;
    private sceneMesh: THREE.Mesh;
    private hardwareCamera: THREE.Camera;
    
    private backgroundStarDrawn = false;
    private rendererCounter = 0;
    
    private sortList = new Int16Array();
    
    constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
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
        
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.autoClear = false;
        
        this.frameBufferScene = new THREE.Scene();
        this.frameBufferMaterial = new THREE.MeshBasicMaterial({
            depthTest: false,
            side: THREE.DoubleSide,
        });
        this.frameBufferGeometry = new THREE.PlaneGeometry(1, 1);
        this.frameBufferMesh = new THREE.Mesh(this.frameBufferGeometry, this.frameBufferMaterial);
        this.frameBufferScene.add(this.frameBufferMesh);
        this.frameBufferCamera = new THREE.OrthographicCamera(-0.5, 0.5, -0.5, 0.5, 0.0, 1.0);
        
        const glslPredef = `
            #if __VERSION__ >= 300
            #   define centroid_in centroid in
            #   define centroid_out centroid out
            #   define sample texture
            #else
            #   define centroid_in varying
            #   define centroid_out varying
            #   define sample texture2D
            #endif
        `;
        
        this.scene = new THREE.Scene();
        this.sceneMaterial = new THREE.ShaderMaterial({
            uniforms: {
                colorTexture: { value: null },
                lightMapTexture: { value: null },
            },
            vertexShader: `${ glslPredef }
                attribute vec4 textureCoord;
                attribute float light;
                centroid_out vec4 textureCoordV;
                centroid_out float lightV;
                void main() {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    textureCoordV = textureCoord;
                    lightV = light;
                }
            `,
            fragmentShader: `${ glslPredef }
                uniform sampler2D colorTexture;
                uniform sampler2D lightMapTexture;
                centroid_in vec4 textureCoordV;
                centroid_in float lightV;
                void main() {
                    vec2 textureCoord = textureCoordV.xy + clamp(textureCoordV.zw, 1e-5, 63.0 / 64.0 / 4.0 - 1e-5);
                    float paletteIndex = sample(colorTexture, textureCoord).r;
                    vec2 coord = vec2(
                        255.0 / 256.0 * paletteIndex + 0.5 / 256.0,
                        1.0 / 128.0 * floor(1.0 / 256.0 * lightV) + 0.5 / 128.0);
                    gl_FragColor = sample(lightMapTexture, coord);
                }
            `,
            side: THREE.BackSide,
            depthTest: false,
            transparent: true,
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
        
        window.addEventListener('resize', () => { this.onResize(); }, false);
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
        const frameBufferTexture = this.convertFrameBuffer(this.frameBuffer);
        this.frameBufferMaterial.map = frameBufferTexture;
        this.renderer.setViewport(0, 0, width, height);
        this.renderer.render(this.frameBufferScene, this.frameBufferCamera);
        frameBufferTexture.dispose();
    }
    
    // 0x074E-0x09BE
    drawPolygon(textureIndex: number, clippedVertexCount: number, clippedDataI: Int32Array[]) {
        const lightMap = this.lightMap.getLightMap();
        
        // 0x0752
        let minX = 32767, maxX = -32767;
        let minY = 32767, maxY = -32767;
        let indexL = 0, indexR = 0;
        for(let i = 0; i < clippedVertexCount; ++i) {
            const x = clippedDataI[4][i] >> 16;
            if(minX > x) minX = x;
            if(maxX < x) maxX = x;
            const y = OmniscentUtil.toInt16(clippedDataI[3][i]);
            if(minY > y) { minY = y; indexL = indexR = i; }
            if(maxY < y) maxY = y;
        }
        
        // 0x0793
        if(maxX < 0 || minY > 320 || maxY < 21 || minY > 179) return;
        if(maxY > 179) maxY = 179;
        if(minY === maxY) return;
        let scanlineY = minY;
        
        // [BP - 0x3C]
        const t0 = new Int32Array(10);
        // [BP - 0x78]
        const t1 = new Int32Array(10);
        // [BP - 0x50]
        const t2 = new Int32Array(5);
        // [BP - 0x14]
        const t3 = new Int32Array(5);
        
        // 0x09BF-0x0A08
        function interpolate(index0: number, index1: number, offset: number) {
            const y = OmniscentUtil.toInt16(clippedDataI[3][index1]);
            const dy = y - scanlineY;
            for(let i = 0; i < 5; ++i) {
                const x0 = clippedDataI[4 + i][index0];
                t0[offset + i] = x0;
                const x1 = clippedDataI[4 + i][index1];
                let dx = x1 - x0;
                if(dy !== 0) {
                    dx = (dx / dy) | 0;
                    t1[offset + i] = dx;
                }
            }
        }
        
        // 0x07D5
        const texture = this.texture.getTextures()[textureIndex];
        while(scanlineY <= maxY) {
            // 0x07E8
            while(true) { // while(scanlineY <= maxY)?
                const y = OmniscentUtil.toInt16(clippedDataI[3][indexL]);
                if(scanlineY !== y) break;
                const index0 = indexL;
                if(--indexL < 0) indexL = clippedVertexCount - 1;
                interpolate(index0, indexL, 0);
            }
            // 0x0816
            while(true) { // while(scanlineY <= maxY)?
                const y = OmniscentUtil.toInt16(clippedDataI[3][indexR]);
                if(scanlineY !== y) break;
                const index0 = indexR;
                if(++indexR === clippedVertexCount) indexR = 0;
                interpolate(index0, indexR, 5);
            }
            // 0x0846
            if(scanlineY >= 21) {
                let l = t0[0] >> 16, r = t0[5] >> 16;
                const dx = r - l;
                if(dx !== 0 && r > 0 && l <= 320) {
                    // 0x0878
                    let dl = -l;
                    if(dl < 0) dl = 0;
                    else l = 0;
                    // 0x0885
                    for(let i = 1; i < 5; ++i) {
                        const a0 = t0[i], a1 = t0[5 + i];
                        const da = a1 - a0;
                        if(dx !== 0)
                            t2[i] = da / dx;
                        t3[i] = t2[i] * dl + a0;
                    }
                    // 0x08AF
                    const dd = OmniscentUtil.toInt16(t2[4]);
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
                        const du = OmniscentUtil.toInt16((u1 - u0) / d);
                        const dv = OmniscentUtil.toInt16((v1 - v0) / d);
                        for(let i = 0; i < d; ++i) {
                            const q = ((v0 & 0xFF00) >> 2) | (u0 >> 8);
                            const value = texture[q];
                            if(value)
                                this.frameBuffer[p] = lightMap[value + (t3[4] & 0xFF00)];
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
    drawQuad(quadIndex: number) {
        // [BP - 0xBE, 0xBA, 0xB6, (0xB2), (0xAE), 0xAA, 0xA6, (0xA2), 0x9E]
        const data = new Array<Float32Array>(9), dataI = new Array<Int32Array>(9);
        // [BP - 0x172, 0x16E, 0x16A, (0x166), (0x162), 0x15E, 0x15A, (0x156), 0x152]
        const clippedData = new Array<Float32Array>(9), clippedDataI = new Array<Int32Array>(9);
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
            const vertexIndex = this.model.quads[quadIndex * 5 + i];
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
        const textureIndex = this.model.quads[quadIndex * 5 + 4];
        // 0x0A85
        let clippedVertexCount = 0;
        // 0x0A8A
        let neg = data[2][3] < 0;
        
        // 0x0B60-0x0BAC
        function clip(i1: number) {
            let i0 = i1 - 1;
            if(i0 < 0) i0 = 3;
            const z = data[2][i1] / (data[2][i1] - data[2][i0]);
            for(let i of [0, 1, 2, 5, 6, 8])
                clippedData[i][clippedVertexCount]
                    = (data[i][i0] - data[i][i1]) * z + data[i][i1];
            ++clippedVertexCount;
        }
        
        // 0x0A9B
        for(let i = 0; i < 4; ++i) {
            const z = data[2][i];
            if(z < 0) {
                if(!neg) { clip(i); neg = !neg; }
                for(let j = 0; j < 9; ++j)
                    clippedDataI[j][clippedVertexCount] = dataI[j][i];
                ++clippedVertexCount;
            } else {
                if(neg) { clip(i); neg = !neg; }
            }
        }
        
        // 0x0AED
        if(clippedVertexCount < 2) return; // 3?
        
        // 0x0AF7
        for(let i = 0; i < clippedVertexCount; ++i) {
            const z = (13 - clippedData[2][i]) / 160;
            clippedDataI[3][i] = Math.round(clippedData[1][i] / z + 100);
            clippedDataI[4][i] = Math.round(clippedData[0][i] * 1.2 / z + 160) * 65536;
            clippedDataI[5][i] = Math.round(clippedDataI[5][i] / z);
            clippedDataI[6][i] = Math.round(clippedDataI[6][i] / z);
            clippedDataI[7][i] = Math.round(65536 / z);
        }
        
        this.drawPolygon(textureIndex, clippedVertexCount, clippedDataI);
    }
    
    // 0x041D-0x0523
    render(useHardwareRenderer: boolean) {
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
            const colorTexture = this.convertTexture();
            const lightMapTexture = this.convertLightMap();
            this.sceneMaterial.uniforms.colorTexture.value = colorTexture;
            this.sceneMaterial.uniforms.lightMapTexture.value = lightMapTexture;
            this.renderer.setViewport(0, (20 / 200) * height,
                width, ((179 - 21 + 1) / 200) * height);
            this.renderer.render(this.scene, this.hardwareCamera);
            this.sceneMesh.geometry.dispose();
            colorTexture.dispose();
            lightMapTexture.dispose();
        }
    }
    
    onResize() {
        const WIDTH = 320, HEIGHT = 200;
        const scale = Math.max(Math.floor(Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT)
            * window.devicePixelRatio * 0.8), 1) / window.devicePixelRatio;
        this.renderer.setSize(WIDTH * scale, HEIGHT * scale);
    }
    
    drawChar(data: Uint8Array, x: number, y: number, c: string, color: number) {
        const index = c.charCodeAt(0);
        for(let i = 0; i < 8; ++i)
            for(let j = 0; j < 8; ++j)
                if((OmniscentRenderer.FONT[index * 8 + i] >> j) & 1)
                    data[(y * 8 + i) * 320 + (x * 8 + j)] = color;
    }
    drawText(data: Uint8Array, x: number, y: number, s: string, color: number) {
        for(let i = 0; i < s.length; ++i)
            this.drawChar(data, x + i, y, s.charAt(i), color);
    }
    
    convertModel() {
        const positionData = [];
        const colorData = [];
        const textureCoordData = [];
        const indexData = [];
        
        const textureUnitX = 1 / 4, textureUnitY = 1 / 4;
        const textureDX = (63 / 64) * textureUnitX, textureDY = (63 / 64) * textureUnitY;
        let indexOffset = 0;
        for(let i = 0; i < this.model.quadCount; ++i) {
            const quadIndex = this.sortList[i * 2 + 1];
            const textureIndex = this.model.quads[quadIndex * 5 + 4];
            let clipped = false;
            for(let j = 0; j < 4; ++j) {
                const vertexIndex = this.model.quads[quadIndex * 5 + j];
                if(this.model.transformedVertexs[vertexIndex * 3 + 2] + 512 < 0) {
                    clipped = true;
                    break;
                }
            }
            if(clipped) continue;
            for(let j = 0; j < 4; ++j) {
                const vertexIndex = this.model.quads[quadIndex * 5 + j];
                for(let k = 0; k < 3; ++k)
                    positionData.push(this.model.transformedVertexs[vertexIndex * 3 + k]);
                let z = Math.round(this.model.transformedVertexs[vertexIndex * 3 + 2]) + 512;
                if(z < 0) z = 0;
                if(z > 511) z = 511;
                const color = ((z << 7) * this.model.vertexs[vertexIndex * 4 + 3]) >> 16;
                colorData.push(color);
            }
            const textureX0 = (textureIndex & 0x3) * textureUnitX;
            const textureY0 = (textureIndex >> 2) * textureUnitY;
            textureCoordData.push(
                textureX0, textureY0, 0, textureDY,
                textureX0, textureY0, 0, 0,
                textureX0, textureY0, textureDX, 0,
                textureX0, textureY0, textureDX, textureDY
            );
            indexData.push(indexOffset, indexOffset + 1, indexOffset + 2,
                indexOffset, indexOffset + 2, indexOffset + 3);
            indexOffset += 4;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionData, 3));
        geometry.setAttribute('textureCoord', new THREE.Float32BufferAttribute(textureCoordData, 4));
        geometry.setAttribute('light', new THREE.Uint16BufferAttribute(colorData, 1, false));
        geometry.setIndex(indexData);
        return geometry;
    }
    convertFrameBuffer(data: Uint8Array) {
        const WIDTH = 320, HEIGHT = 200;
        const palette = this.palette.getPalette();
        const result = new Uint8Array(4 * WIDTH * HEIGHT);
        for(let i = 0; i < WIDTH * HEIGHT; ++i) {
            const value = data[i];
            result[i * 4] = palette[value * 3];
            result[i * 4 + 1] = palette[value * 3 + 1];
            result[i * 4 + 2] = palette[value * 3 + 2];
            result[i * 4 + 3] = 0xFF;
        }
        const texture = new THREE.DataTexture(result, WIDTH, HEIGHT, THREE.RGBAFormat);
        texture.needsUpdate = true;
        return texture;
    }
    convertTexture() {
        const WIDTH = 4 * 64, HEIGHT = 4 * 64;
        const textures = this.texture.getTextures();
        const result = new Uint8Array(WIDTH * HEIGHT);
        for(let i = 0; i < 15; ++i) {
            const x0 = (i & 0x3) * 64, y0 = (i >> 2) * 64;
            for(let j = 0; j < 0x1000; ++j) {
                const x1 = j & 0x3F, y1 = j >> 6;
                const value = textures[i][j];
                const index = (y0 + y1) * WIDTH + (x0 + x1);
                result[index] = value;
            }
        }
        const texture = new THREE.DataTexture(result, WIDTH, HEIGHT, THREE.RedFormat);
        texture.needsUpdate = true;
        return texture;
    }
    convertLightMap() {
        const WIDTH = 256, HEIGHT = 128;
        const result = new Uint8Array(4 * WIDTH * HEIGHT);
        const lightMap = this.lightMap.getLightMap();
        const palette = this.palette.getPalette();
        let index = 0;
        for(let i = 0; i < 128; ++i) {
            ++index;
            for(let j = 1; j < 256; ++j, ++index) {
                const value = lightMap[index];
                result[index * 4] = palette[value * 3];
                result[index * 4 + 1] = palette[value * 3 + 1];
                result[index * 4 + 2] = palette[value * 3 + 2];
                result[index * 4 + 3] = 0xFF;
            }
        }
        const texture = new THREE.DataTexture(result, WIDTH, HEIGHT, THREE.RGBAFormat);
        texture.needsUpdate = true;
        return texture;
    }
}
