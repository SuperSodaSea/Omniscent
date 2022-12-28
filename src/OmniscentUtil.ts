export class OmniscentUtil {
    // 0x1021-0x1039: Star pattern
    static STAR_PATTERN = new Uint8Array([
        0x00, 0x00, 0x03, 0x00, 0x00,
        0x00, 0x02, 0x05, 0x02, 0x00,
        0x03, 0x05, 0x07, 0x05, 0x03,
        0x00, 0x02, 0x05, 0x02, 0x00,
        0x00, 0x00, 0x03, 0x00, 0x00,
    ]);
    
    // 0x0611-0x062F
    static drawStar(data: Uint8Array, index: number, stride: number, color: number, value: number) {
        for(let i = 0, p = 0; i < 5; ++i, index += stride)
            for(let j = 0; j < 5; ++j, ++p, ++index) {
                const x = OmniscentUtil.STAR_PATTERN[p];
                if(x > value)
                    data[index] = ((x - value) + (color >> 8)) << (color & 0xFF);
            }
    }
    
    // 0x065A-0x698
    static quickSort(data: Int16Array, l: number, r: number) {
        if(l >= r) return;
        let ll = l, rr = r;
        const x = data[ll * 2];
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
    static rotateVector2(vector: [number, number], angle: number) {
        angle *= Math.PI / 0x10000;
        const c = Math.cos(angle), s = Math.sin(angle);
        return [c * vector[0] - s * vector[1], s * vector[0] + c * vector[1]];
    }
    // 0x0BD0-0x0BFB
    static rotateVector3(vector: [number, number, number], angle: [number, number, number]) {
        const result = [vector[0], vector[1], vector[2]];
        const a = OmniscentUtil.rotateVector2([result[1], result[2]], angle[2]);
        result[1] = a[0], result[2] = a[1];
        const b = OmniscentUtil.rotateVector2([result[2], result[0]], angle[1]);
        result[2] = b[0], result[0] = b[1];
        const c = OmniscentUtil.rotateVector2([result[0], result[1]], angle[0]);
        result[0] = c[0], result[1] = c[1];
        return result;
    }
    
    static toInt16(x: number) {
        x &= 0xFFFF;
        if(x >= 0x8000) x -= 0x10000;
        return x;
    }
}
