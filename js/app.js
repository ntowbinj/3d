const COLORS = {
    'background': '#611'
}
COLOR = "color";
THICK = "thick";
DASHED = "dashed";
WIDTH = "width";
ORTH90 = "orth90";
ORTH_NEG90 = "orthNeg90";

const G = {};


const S = {};

const setState = function(name, value) {
    S[name] = value;
}

const handleInputChange = function(name, value) {
    setState(name, value);
    update();
    draw();
}

const init = function() {
    addInput(
        getInput('cam_x', 0.5)
    );
    addInput(
        getInput('cam_y', 0.5)
    );
    addInput(
        getInput('cam_z', 0.3)
    );
    G.config.init();
    G[ORTH90] = Mat.trans(Mat.orth2(Math.PI / 2));
    G[ORTH_NEG90] = Mat.orth2(Math.PI / 2);

}

const update = function() {
    setState('camera_pos', getPoint((S.cam_x - 0.5) * 10, (S.cam_y - 0.5) * 10, Math.exp(3 * S.cam_z) - 0.9));
    G.config.update();
}

const getAxes = function(l) {
    return [[-1 * l, 0], [l, 0], [0, -1 * l], [0, l]];
}

const getGrid = function(l) {
    const ret = [];
    for (var i = -1 * l; i <= l; i++) {
        ret.push(
            [-1 * l, i],
            [l, i]
        );
        ret.push(
            [i, -1 * l],
            [i, l]
        );
    }
    return ret;
}

const getXTicks = function(s, e, l) {
    const result = [];
    for (var x = s; x <= e; x++) {
        result.push([x, l * -0.5]);
        result.push([x, l * 0.5]);
    }
    return result;
}

const getYTicks = function(s, e, l) {
    const orth = G.orthNeg90;
    return Mat.prod(getXTicks(s, e, l), orth);
}


const draw = function() {
    drawBackground();
    G.config.draw();
}


const getInput = function(name, initialValue = 0) {
    setState(name, initialValue);
    const id = 'input_' + name;
    return {
        'name': name,
        'handle': function(value) {handleInputChange(name, value)},
        'type': 'slider',
        'id': id,
        'select': '#' + id
    }
}


const addInput = function(input) {
    const domObj = document.createElement('div');
    const label = document.createElement('div');
    label.innerHTML = '<p class="inputLabel">' + input.name + '</p>';
    const sldr = document.createElement('div');
    sldr.setAttribute("id", input.id);
    domObj.appendChild(label);
    domObj.appendChild(sldr);
    $("#inputs").append(domObj);
    $(input.select).slider({
        slide: function(event, ui) {
            input.handle(ui.value / 100.0);
        }
    });
    $(input.select).slider('value', S[input.name] * 100)

}

const byId = function(id) {
    return document.getElementById(id);
}

const Logical = function(
    transform = function(v) {return v},
    transformWidth = function(w) {return w}
) {
    return {
        transform: transform,

        transformWidth: transformWidth,

        drawVecOrig: function(v, options = {}) {
            if (!(COLOR in options)) {
                options[COLOR] = 'cyan';
            }
            this.drawVec([0, 0], v, options);
        },

        drawVec: function(s, e, options = {}) {
            if (!(THICK in options)) {
                options[THICK] = true;
            }
            if (!(WIDTH  in options)) {
                options[WIDTH] = 3;
            }
            const posVec = Mat.addVec(e, Mat.scaleVec(s, -1));
            const norm = Mat.norm(posVec);
            const length = 0.1 * (1 + Math.log(4 + norm))
            const segment = Mat.scaleVec(posVec, Math.min(0.4, length/norm));
            const triangIntersectVec = Mat.addVec(e, Mat.scaleVec(segment, -1));
            const leftAdd = Mat.scaleVec(Mat.trans(Mat.prod(G.orthNeg90, Mat.trans([segment])))[0], 0.7/Math.tan(Math.PI/3));
            const rightAdd = Mat.scaleVec(Mat.trans(Mat.prod(G.orth90, Mat.trans([segment])))[0], 0.7/Math.tan(Math.PI/3));
            const triang = [
                e,
                Mat.addVec(triangIntersectVec, leftAdd),
                Mat.addVec(triangIntersectVec, rightAdd)
            ];
            this.drawLine(s, Mat.addVec(e, Mat.scaleVec(segment, -1)), options.width, options);
            this.drawShape(triang, options);
        },

        drawLineList: function(l, w, options = {}) {
            if ((l.length % 2) != 0) {
                throw new Error('need even number of points for line list');
            }
            for (var i = 0; i < l.length / 2; i++) {
                this.drawLine(l[i * 2], l[(i * 2) + 1], w,  options);
            }
        },

        drawLine: function(s, e, w, options = {}) {
            if (!(COLOR in options)) {
                options[COLOR] = '#FFF';
            }
            if (!(DASHED in options)) {
                options[DASHED] = false;
            }
            const actualWidth = this.physWidth(w, options);
            physical.drawLine(this.physPoint(s), this.physPoint(e), actualWidth, options.color, options.dashed);
        },

        drawDashedLine: function(s, e, w, options = {}) {
            options[DASHED] = true;
            this.drawLine(s, e, w, options);
        },

        drawShape: function(pts, options = {}) {
            if (!(COLOR in options)) {
                options[COLOR] = '#FFF';
            }
            physical.drawShape(pts.map(pt => this.physPoint(pt)), options.color);
        },

        physWidth: function(w, options) {
            return options.thick ? this.transformWidth(Math.max(1.5, w * (1/S.camera_pos.z))) : w;
        },

        physPoint: function(vec) {
            return physical.relToAbs(camera.projUninvert(vecToPoint(this.transform(vec))));
        }
    }
}

const camera = {

    project: function(pt) {
        ray_x = S.camera_pos.x - pt.x;
        ray_y = S.camera_pos.y - pt.y;
        ray_z = S.camera_pos.z - pt.z;
        diff_x = ray_x / ray_z;
        diff_y = ray_y / ray_z;
        ray_z = 1;
        return getPoint(S.camera_pos.x + diff_x, S.camera_pos.y + diff_y, S.camera_pos.z + 1);
    },

    uninvert: function(pt) {
        return getPoint(-1 * pt.x, -1 * pt.y, pt.z);
    },

    projUninvert: function(pt) {
        return camera.uninvert(camera.project(pt));
    }
}


const physical = {

    drawLine: function(s, e, w, color, dashed) {
        if (dashed) {
            G.ctx.setLineDash([10, 10]);
        } else {
            G.ctx.setLineDash([]);
        }
        G.ctx.strokeStyle = color;
        G.ctx.lineWidth = w;
        G.ctx.beginPath();
        const fixedS = physical.fixPointForCanvas(s);
        const fixedE = physical.fixPointForCanvas(e);
        G.ctx.moveTo(fixedS.x, fixedS.y);
        G.ctx.lineTo(fixedE.x, fixedE.y);
        G.ctx.stroke();
    },

    fixPointForCanvas: function(pt) {
        return getPoint(pt.x + 0.5, pt.y);
    },

    relToAbs: function(pt) {
        const centerX = G.canvas.width/2;
        const centerY = G.canvas.height/2;
        return {
            'x': (centerX + pt.x * 100),
            'y': (centerY - pt.y * 100)
        };
    },

    drawShape: function(pts, color) {
        G.ctx.strokeStyle = color;
        G.ctx.fillStyle = color;
        G.ctx.beginPath();
        G.ctx.moveTo(pts[0].x, pts[0].y);
        for (var i = 1; i < pts.length; i++) {
            const fixed = physical.fixPointForCanvas(pts[i]);
            G.ctx.lineTo(fixed.x, fixed.y);
        }
        G.ctx.fill();
    }
}

const origin = function() {
    return [0, 0, 0];
}


const vecToPoint = function(v) {
    return getPoint(v[0], v[1]);
}

const getPoint = function(x, y, z = 0) {
    return {'x': x, 'y': y, 'z': z};
}


const setUpCanvas = function() {
    canvas = byId('canvas');
    canvas.width = 4;
    console.log(canvas.width);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx = canvas.getContext('2d');
    G.canvas = canvas;
    G.ctx = ctx;
    drawBackground();
}

const drawBackground = function() {
    G.ctx.fillStyle = COLORS.background;
    G.ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const Mat = {
    mat: function(arrs) {
        var size = arrs[0].length;
        for (var i = 0; i < arrs.length; i++) {
            if (arrs[i].length != size) {
                throw new Error('bad shape');
            }
        }
        return arrs;
    },

    shape: function(mat) {
        return [mat.length, mat[0].length];
    },


    trans: function(mat) {
        const [i, j] = Mat.shape(mat);
        const res = [];
        for (var col = 0; col < j; col++) {
            const transRow = [];
            for (var row = 0; row < i; row++) {
                transRow.push(mat[row][col]);
            }
            res.push(transRow);
        }
        return res;

    },

    prod: function(A, B) {
        const [A_n, A_m] = Mat.shape(A);
        const [B_n, B_m] = Mat.shape(B);
        if (A_m != B_n) {
            throw new Error("can't multiply shapes " + Mat.shape(A) + " and " + Mat.shape(B));
        }
        B_trans = Mat.trans(B);
        const res = [];
        for (var i = 0; i < A_n; i++) {
            const row = [];
            for (var j = 0; j < B_m; j++) {
                row.push(Mat.dot(A[i], B_trans[j]));
            }
            res.push(row);
        }
        return res;
    },

    addVec: function(a, b) {
        return Mat.add([a], [b])[0];
    },

    scaleVec: function(a, c) {
        return Mat.scale([a], c)[0];
    },

    add: function(A, B) {
        const [A_n, A_m] = Mat.shape(A);
        const [B_n, B_m] = Mat.shape(B);
        if ((A_n != B_n) || (A_m != B_m)) {
            throw new Error("can't add shapes " + Mat.shape(A) + " and " + Mat.shape(B));
        }
        const res = []
        for (var i = 0; i < A_n; i++) {
            const row = [];
            for (var j = 0; j < A_m; j++) {
                row.push(A[i][j] + B[i][j]);
            }
            res.push(row);
        }
        return res;
    },

    scale: function(A, c) {
        const [A_n, A_m] = Mat.shape(A);
        const res = [];
        for (var i = 0; i < A_n; i++) {
            const row = [];
            for (var j = 0; j < A_m; j++) {
                row.push(A[i][j] * c);
            }
            res.push(row);
        }
        return res;
    },

    ident: function(n) {
        const res = [];
        for (var i = 0; i < n; i++) {
            const row = [];
            for (var j = 0; j < n; j++) {
                if (i == j) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }
            res.push(row);
        }
        return res;
    },

    dot: function(v, w) {
        if (v.length != w.length) {
            throw new Error("can't dot shapes " + v.length + " and " + w.length);
        }
        ret = 0;
        for (var i = 0; i < v.length; i++) {
            ret += v[i] * w[i];
        }
        return ret;
    },

    proj: function(v, w) {
        return Mat.scaleVec(w, Mat.dot(v, w) / Mat.dot(w, w));
    },

    norm: function(v) {
        return Math.sqrt(Mat.dot(v, v));
    },

    normed: function(v) {
        return Mat.scaleVec(v, 1/Mat.norm(v));
    },

    convComb: function(A, B, c) {
        const Apart = Mat.scale(A, 1 - c);
        const Bpart = Mat.scale(B, c);
        return Mat.add(Apart, Bpart);
    },

    orth2: function(theta) {
        return Mat.mat([[Math.cos(theta), -1 * Math.sin(theta)], [Math.sin(theta), Math.cos(theta)]]);
    },

    det: function(A) {
        const shape = Mat.shape(A);
        if ((shape[0] != 2) || (shape[1] != 2)) {
            throw new Error("det only supported on 2x2, this is " + shape);
        }
        return (A[0][0] * A[1][1]) - (A[0][1] * A[1][0]);
    },

    cofactors: function(A) {
        const shape = Mat.shape(A);
        if ((shape[0] != 2) || (shape[1] != 2)) {
            throw new Error("det only supported on 2x2, this is " + shape);
        }
        return [[A[1][1], -1 * A[1][0]], [-1 * A[0][1], A[0][0]]];
    },

    inverse: function(A) {
        const det = Mat.det(A);
        return Mat.scale(Mat.trans(Mat.cofactors(A)), 1 / det);
    }
}



const main = function() {
    G.config = new Pictures();
    setUpCanvas();
    init();
    update();
    draw();
    $("#record").click(startRecording);
}

const Pictures = function() {
    const logical = Logical(
        transform = function(v) {
            return Mat.prod([v], Mat.trans(Mat.orth2(S.q * 2 * Math.PI)))[0];
        }
    );
    return {

        update: function() {
            const shiftScale = function(x) {
                return 10 * (x - 0.5);
            }
            const A = [[shiftScale(S.a), shiftScale(S.b)], [shiftScale(S.c), shiftScale(S.d)]]
            const v = A[0];
            const w = A[1];
            const wOrth = Mat.normed(Mat.prod([w], G.orthNeg90)[0]);
            const vSheered = Mat.addVec(v, Mat.scaleVec(wOrth, 20 * (S.s - 0.5)));
            A[0] = vSheered;

            setState('A', A);
        },

        init: function() {
            addInput(
                getInput('a', 1)
            );
            addInput(
                getInput('b', 0.5)
            );
            addInput(
                getInput('c', 0.5)
            );
            addInput(
                getInput('d', 1)
            );
            addInput(
                getInput('s', 0.5)
            );
            addInput(
                getInput('q', 0)
            );
        },

        draw: function() {
            drawBackground();
            const forAx = function(logical) {
                const axes = getAxes(5);
                const grid = getGrid(5);
                logical.drawLineList(axes, 0.7);
                logical.drawLineList(grid, 0.4);
                logical.drawLineList(getXTicks(-5, 5, 0.3), 0.7);
                logical.drawLineList(getYTicks(-5, 5, 0.3), 0.7);
                logical.drawVecOrig(S.A[0], {color: 'yellow', width: 5});
                logical.drawVecOrig(S.A[1], {color: 'orange'});
                const v = S.A[0]
                const w = S.A[1]
                const vx = [v[0], 0]
                const vy = [0, v[1]];
                const wUnit = Mat.normed(w);
                const wOrth = Mat.normed(Mat.prod([w], G.orth90)[0]);
                const projVxWOrth = Mat.proj(vx, wOrth);
                const projVyW = Mat.proj(vy, w);
                const projVySummed = Mat.addVec(projVyW, vx);
                const projVW = Mat.proj(v, w);
                logical.drawDashedLine(Mat.scaleVec(w, 10), Mat.scaleVec(w, -10), 1, {color: 'orange'});
                //logical.drawDashedLine(v, vx, 1);
                logical.drawVecOrig(vx, {color: 'yellow', width: 1.5});
                logical.drawVec(vx, v, {color: 'yellow', width: 1.5});
                logical.drawDashedLine([0, 0], projVxWOrth, 1);
                logical.drawDashedLine(projVxWOrth, vx, 1);
                logical.drawDashedLine(vx, projVySummed, 1);
                logical.drawDashedLine(v, projVySummed, 1);
                logical.drawDashedLine(projVW, v, 1);
            }
            forAx(logical);
        }
    }
}

function startRecording() {
    const chunks = []; // here we will store our recorded media chunks (Blobs)
    const stream = canvas.captureStream(); // grab our canvas MediaStream
    const rec = new MediaRecorder(stream); // init the recorder
    // every time the recorder has new data, we will store it in our array
    rec.ondataavailable = e => chunks.push(e.data);
    // only when the recorder stops, we construct a complete Blob from all the chunks
    rec.onstop = e => exportVid(new Blob(chunks, {type: 'video/webm'}));

    rec.start();
    setTimeout(()=>rec.stop(), 10000); // stop recording in 3s
}

function exportVid(blob) {
    const vid = document.createElement('video');
    vid.src = URL.createObjectURL(blob);
    vid.controls = true;
    document.body.appendChild(vid);
    const a = document.createElement('a');
    a.download = 'myvid.webm';
    a.href = vid.src;
    a.textContent = 'download the video';
    document.body.appendChild(a);
}

window.addEventListener('load', main);
