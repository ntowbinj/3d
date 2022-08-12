const COLORS = {
    'background': '#611'
}
COLOR = "color";
THICK = "thick";
DASHED = "dashed";
WIDTH = "width";
ALPHA = "alpha";
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
        get01Input('cam_x', 0.5)
    );
    addInput(
        get01Input('cam_y', 0.5)
    );
    addInput(
        get01Input('cam_z', 0.4)
    );
    G.config.init();
    G[ORTH90] = Mat.trans(Mat.orth2(Math.PI / 2));
    G[ORTH_NEG90] = Mat.orth2(Math.PI / 2);

}

const update = function() {
    setState('camera_pos', getPoint((S.cam_x - 0.5) * 10, (S.cam_y - 0.5) * 10, Math.exp(3 * S.cam_z) - 0.9));
    G.config.update();
}

const toRange = function(s, e, t) {
    return s + (e - s) * t;
}

const fromRange = function(s, e, t) {
    return (t - s)/(e - s);
}

const getAxes = function(l) {
    return [[-1 * l, 0], [l, 0], [0, -1 * l], [0, l]];
}

const getSquare = function(l) {
    return [[-1 * l, l], [l, l], [l, -1 * l], [-1 * l, -1 * l]];
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

const get01Input = function(name, initialValue = 0) {
    return getInput(name, 0, 1, initialValue);
}

const getInput = function(name, s, e, initialValue = 0) {
    if (s >= e) {
        throw new Error('invalid input range: ' + s + ', ' + e);
    }
    setState(name, initialValue);
    const id = 'input_' + name;
    return {
        'name': name,
        'handle': function(value) {handleInputChange(name, value)},
        'type': 'slider',
        'id': id,
        'select': '#' + id,
        's': s,
        'e': e
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
            input.handle(toRange(input.s, input.e, ui.value / 100.0));
        }
    });
    $(input.select).slider('value', fromRange(input.s, input.e, S[input.name]) * 100)
    $(input.select).slider('option', 'step', 0.5);

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
                options[WIDTH] = 5;
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
            if (!(ALPHA in options)) {
                options[ALPHA] = 1.0;
            }
            const actualWidth = this.physWidth(w, options);
            physical.drawLine(
                this.physPoint(s),
                this.physPoint(e),
                actualWidth,
                options.color,
                options.alpha,
                options.dashed
            );
        },

        drawDashedLine: function(s, e, w, options = {}) {
            options[DASHED] = true;
            this.drawLine(s, e, w, options);
        },

        drawShape: function(pts, options = {}) {
            if (!(COLOR in options)) {
                options[COLOR] = '#FFF';
            }
            if (!(ALPHA in options)) {
                options[ALPHA] = 1.0;
            }
            physical.drawShape(pts.map(pt => this.physPoint(pt)), options.color, options.alpha);
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

    drawLine: function(s, e, w, color, alpha, dashed) {
        if (dashed) {
            G.ctx.setLineDash([10, 10]);
        } else {
            G.ctx.setLineDash([]);
        }
        G.ctx.globalAlpha = alpha;
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

    drawShape: function(pts, color, alpha) {
        G.ctx.strokeStyle = color;
        G.ctx.fillStyle = color;
        G.ctx.globalAlpha = alpha;
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
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx = canvas.getContext('2d');
    G.canvas = canvas;
    G.ctx = ctx;
    drawBackground();
}

const drawBackground = function() {
    G.ctx.globalAlpha = 1;
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
            for (var j = 0; j < arrs[i].length; j++) {
                if (isNaN(arrs[i][j])) {
                    throw new Error(arrs[i][j] + ' is NaN');
                }
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

    squaredNorm: function(v) {
        return Mat.dot(v, v);
    },

    norm: function(v) {
        return Math.sqrt(Mat.squaredNorm(v));
    },

    normed: function(v) {
        return Mat.scaleVec(v, 1/Mat.norm(v));
    },

    nthComponent: function(v, n) {
        const zeros = Mat.zeros(v.length);
        zeros[n] = v[n];
        return zeros;
    },

    zeros: function(n) {
        const ret = []
        for (var i = 0; i < n; i++) {
            ret.push(0);
        }
        return ret;
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
    const trans = function(v) {
        return Mat.prod([v], Mat.trans(Mat.orth2(S.q_ax * 2 * Math.PI)))[0];
    }
    const logical1 = Logical(
        transform = function(v) {
            return Mat.addVec(trans(v), [6, 6]);
        }
    );
    const logical2 = Logical(
        transform = function(v) {
            return Mat.addVec(trans(v), [-6, -6]);
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
                get01Input('a', 1)
            );
            addInput(
                get01Input('b', 0.5)
            );
            addInput(
                get01Input('c', 0.5)
            );
            addInput(
                get01Input('d', 1)
            );
            addInput(
                get01Input('s', 0.5)
            );
            addInput(
                get01Input('q', 0)
            );
            addInput(
                get01Input('q_ax', 0)
            );
        },

        draw: function() {
            drawBackground();
            const go = function(log, A, c1, c2) {
                const axes = getAxes(5);
                const grid = getGrid(5);
                log.drawLineList(axes, 0.7);
                //log.drawLineList(grid, 0.4);
                log.drawLineList(getXTicks(-5, 5, 0.3), 0.7);
                log.drawLineList(getYTicks(-5, 5, 0.3), 0.7);
                log.drawVecOrig(A[0], {color: c1, width: 5});
                log.drawVecOrig(A[1], {color: c2});
                const v = A[0]
                const w = A[1]
                const vx = [v[0], 0]
                const vy = [0, v[1]];
                const wUnit = Mat.normed(w);
                const wOrth = Mat.normed(Mat.prod([w], G.orth90)[0]);
                const wGrid = Mat.prod(grid, [wUnit, Mat.prod([wUnit], G[ORTH90])[0]]);
                log.drawLineList(wGrid, 0.3, {color: c2});
                const projVxWOrth = Mat.proj(vx, wOrth);
                const projVxW = Mat.proj(vx, w);
                const projVyW = Mat.proj(vy, w);
                const projVySummed = Mat.addVec(projVyW, vx);
                const projVW = Mat.proj(v, w);
                log.drawDashedLine(Mat.scaleVec(w, 10), Mat.scaleVec(w, -10), 1, {color: c2});
                //log.drawDashedLine(v, vx, 1);
                log.drawVecOrig(vx, {color: c1, width: 1.5});
                log.drawVec(vx, v, {color: c1, width: 1.5});
                log.drawDashedLine([0, 0], projVxWOrth, 1);
                log.drawDashedLine(projVxWOrth, vx, 1);
                log.drawDashedLine(projVxW, vx, 1);
                log.drawDashedLine(vx, projVySummed, 1);
                log.drawDashedLine(v, projVySummed, 1);
                log.drawDashedLine(projVW, v, 1);
            }
            const A = Mat.prod(S.A, Mat.trans(Mat.orth2(2 * Math.PI * S.q)));
            go(logical1, A, 'yellow', 'orange');
            go(logical2, [A[1], A[0]], 'orange', 'yellow');
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
