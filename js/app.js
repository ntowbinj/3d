const COLORS = {
    'background': '#611'
}
const COLOR = "color";
const THICK = "thick";
const DASHED = "dashed";
const WIDTH = "width";
const ALPHA = "alpha";
const ORTH90 = "orth90";
const ORTH_NEG90 = "orthNeg90";

const basis2 = {
    i: [1, 0],
    j: [0, 1]
};

const basis3 = {
    i: [1, 0, 0],
    j: [0, 1, 0],
    k: [0, 0, 1]
};

const X = 0;
const Y = 1;
const Z = 2;

const G = {};


const S = {};

const triang = function(verts, opts, id = -1) {
    const a = Mat.subVec(verts[1], verts[0]);
    const b = Mat.subVec(verts[2], verts[0]);
    const cross = Mat.normedCross(a, b);
    return {
        verts: verts,
        opts: opts,
        normal: cross,
        id: id
    };
}

const applyDebug = function(name, value) {
    setState(name, value);
    update();
    draw();
};

const setState = function(name, value) {
    S[name] = value;
};

const handleInputChange = function(name, value) {
    setState(name, value);
    update();
    draw();
};

const init = function() {
    addInput(
        getInput('cam_x', -10, 10, 0)
    );
    addInput(
        getInput('cam_y', -10, 10, 0)
    );
    addInput(
        getInput('cam_z', -200, 200, 20)
    );
    const angleInputs = [
        'alpha',
        'beta',
        'theta'
    ];
    for (var i = 0; i < angleInputs.length; i++) {
        addInput(
            getInput(angleInputs[i], Math.PI * (-1), Math.PI * 1, 0)
        );
    }
    addInput(
        getInput('focalLength', 1, 50, 1)
    );

    for (var i = 0; i < G.config.inputs.length; i++) {
        addInput(G.config.inputs[i]);
    }
    G[ORTH90] = Mat.trans(Mat.orth2(Math.PI / 2));
    G[ORTH_NEG90] = Mat.orth2(Math.PI / 2);
    G.timingBuffer = [];

};

const log = {

    isDebug: false,

    debug: function(s) {
        if (this.isDebug) {
            console.log(s);
        }
    }
};

const update = function() {
    const perfNow = window.performance.now();
    const now = Date.now();
    if (S.lastUpdated > 0 && (now - S.lastUpdated < 50)) {
        return;
    }
    S.lastUpdated = now;
    updateCamera();
    updateLight();
    G.config.update();
    log.debug(S);
    G.timingBuffer.push(window.performance.now() - perfNow);
};

const mean = function(arr) {
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum / arr.length;
};

const updateCamera = function() {
    setState('camera_pos', [S.cam_x, S.cam_y, S.cam_z]);

    setState('Rx', Mat.counterClockYZ(S.alpha));
    setState('Ry', Mat.counterClockXZ(S.beta));
    setState('Rz', Mat.counterClockXY(S.theta));

    setState(
        'combinedRotation',
        Mat.prod(
            S.Rz,
            Mat.prod(
                S.Rx,
                S.Ry
            )
        )
    );
    setState('inverseCombinedRotation', Mat.trans(S.combinedRotation));
    const focPoint = [0, 0, -1 * S.focalLength];
    setState('focPoint', focPoint);
};

const updateLight = function() {
    setState('lightDir', Mat.normed([-1, -1, -1]));
};

const toRange = function(s, e, t) {
    return s + (e - s) * t;
};

const fromRange = function(s, e, t) {
    return (t - s)/(e - s);
};

const getAxes = function(l) {
    return [[-1 * l, 0], [l, 0], [0, -1 * l], [0, l]];
};

const getAxes3d = function(l) {
    return [
        [-1 * l, 0, 0], [l, 0, 0],
        [0, -1 * l, 0], [0, l, 0],
        [0, 0, -1 * l], [0, 0, l]
    ];
};

const getSquare = function(l) {
    return [[-1 * l, l], [l, l], [l, -1 * l], [-1 * l, -1 * l]];
};

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
};

const getTicks3d = function(s, e, l) {
    const ret = [];
    const xticks = in3d(
        getXTicks(s, e, l)
    );

};

const getXTicks = function(s, e, l) {
    const result = [];
    for (var x = s; x <= e; x++) {
        result.push([x, l * -0.5]);
        result.push([x, l * 0.5]);
    }
    return result;
};

const getYTicks = function(s, e, l) {
    const orth = G.orthNeg90;
    return Mat.prod(getXTicks(s, e, l), orth);
};


const draw = function() {
    drawBackground();
    G.config.draw();
};

const get01Input = function(name, initialValue = 0) {
    return getInput(name, 0, 1, initialValue);
};

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
};


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
    $(input.select).slider('option', 'step', 0.10);

};

const byId = function(id) {
    return document.getElementById(id);
};

const in3d = function(v) {
    if (v.length == 2) {
        return [v[X], v[Y], 0];
    } else if (v.length == 3) {
        return v;
    } else {
        throw new Error('must be 2d or 3d, got ' + v);
    }
};


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
            let origin;
            if (v.length == 2) {
                origin = [0, 0];
            } else {
                origin = [0, 0, 0];
            }
            this.drawVec(origin, v, options);
        },

        drawVec: function(s, e, options = {}) {
            if (!(THICK in options)) {
                options[THICK] = true;
            }
            if (!(WIDTH  in options)) {
                options[WIDTH] = 5;
            }
            let orth90;
            let orthNeg90;
            if (s.length == 2) {
                orth90 = G.orth90;
                orthNeg90 = G.orthNeg90;
            } else {
                orth90 = Mat.in3dFromXY(G.orth90);
                orthNeg90 = Mat.in3dFromXY(G.orthNeg90);
            }
            const posVec = Mat.addVec(e, Mat.scaleVec(s, -1));
            const norm = Mat.norm(posVec);
            const length = 0.1 * (1 + Math.log(4 + norm))
            const segment = Mat.scaleVec(posVec, Math.min(0.4, length/norm));
            const triangIntersectVec = Mat.addVec(e, Mat.scaleVec(segment, -1));
            const leftAdd = Mat.scaleVec(Mat.trans(Mat.prod(orthNeg90, Mat.trans([segment])))[0], 0.7/Math.tan(Math.PI/3));
            const rightAdd = Mat.scaleVec(Mat.trans(Mat.prod(orth90, Mat.trans([segment])))[0], 0.7/Math.tan(Math.PI/3));
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
            const physicalPoints = this.physPointList(pts);
            physical.drawShape(physicalPoints, options.color, options.alpha);

            //physical.drawShape(pts.map(pt => this.physPoint(pt)), options.color, options.alpha);
        },

        drawTriangle: function(pts, options = {}) {
            const a = Mat.subVec(pts[1], pts[0]);
            const b = Mat.subVec(pts[2], pts[0]);
            const cross = Mat.normedCross(a, b);
            const lightDot = Mat.dot(cross, S.lightDir);
            const scaled = 50 + (50 * lightDot);
            if (!(COLOR in options)) {
                options.color = '#FFF';
            }
            if (!(ALPHA in options)) {
                options.alpha = 1.0;
            }
            options.color = tinycolor(options.color).darken(scaled).toString();
            const physicalPoints = this.physPointList(pts);
            physical.drawShape(physicalPoints, options.color, options.alpha);

            //physical.drawShape(pts.map(pt => this.physPoint(pt)), options.color, options.alpha);
        },


        drawHollowShape: function(pts, options = {}) {
            for (var i = 0; i < pts.length; i++) {
                this.drawLine(pts[i], pts[(i + 1) % pts.length], options);
            }
        },

        physWidth: function(w, options) {
            return options.thick ? this.transformWidth(Math.max(1.5, w * (1/S.camera_pos[Z]))) : w;
        },

        physPoint: function(vec) {
            return physical.relToAbs(
                camera.projUninvert(
                    this.transform(
                        in3d(vec)
                    )
                )
            );
        },

        physPointList: function(vecList) {
            return vecList.map(in3d)
                .map(this.transform)
                .map(camera.translate)
                .map(camera.rotate)
                .map(camera.projectRotated)
                .map(camera.uninvert)
                .map(physical.relToAbs);
        },

        drawAllTriangles: function(trngs) {
            const sorted = this.rotateAndDepthSort(trngs);

            for (var i = 0; i < sorted.length; i++) {
                const triang = sorted[i][0];
                const abs = triang.map(camera.projectRotated)
                    .map(camera.uninvert)
                    .map(physical.relToAbs);
                const options = sorted[i][1];
                physical.drawShape(abs, options.color, options.alpha);

            }

        },

        rotateAndDepthSort: function(trngs) {
            const withZ = [];
            for (var i = 0; i < trngs.length; i++) {
                const triangle = trngs[i].verts;
                const opt = trngs[i].opts;
                const rotated = triangle.map(this.transform)
                    .map(camera.translate)
                    .map(camera.rotate);
                const midP = this.midPoint(rotated);
                withZ.push([rotated, opt, midP[Z]]);
            }
            withZ.sort(function(a, b) {
                if (a[2] < b[2]) {
                    return -1;
                }
                if (a[2] > b[2]) {
                    return 1;
                }
                return 0;
            });

            return withZ;

        },

        midPoint: function(shape) {
            var sum = [0, 0, 0];
            for (var i = 0; i < shape.length; i++) {
                sum = Mat.addVec(sum, shape[i]);
            }
            return Mat.scaleVec(sum, 1 / shape.length);
        },

        physPointListDebug: function(vecList) {
            const in3dResult = vecList.map(in3d);
            const transformed = in3dResult.map(this.transform);
            const translated = transformed.map(camera.translate);
            const rotated = translated.map(camera.rotate);
            const projected = rotated.map(camera.projectRotated);
            const uninverted = projected.map(camera.uninvert);
            const relToAbs = uninverted.map(physical.relToAbs);
            return relToAbs;
        }
    }
};

const camera = {

    translate: function(pt) {
        const camera_pos = S.camera_pos;
        const translated = Mat.subVec(pt, camera_pos);
        return translated;
    },

    rotate: function(pt) {
        return Mat.prod([pt], S.inverseCombinedRotation)[0];
    },

    projectRotated: function(transRot) {
        const ray = Mat.subVec(S.focPoint, transRot);

        if (ray[Z] <= 0) {
            return null;
        }

        const diffX = ray[X] * (S.focalLength / ray[Z]);
        const diffY = ray[Y] * (S.focalLength / ray[Z]);
        const ret = [diffX, diffY, 0];
        return ret;
    },

    project: function(pt) {
        const transRot = this.rotate(this.translate(pt));
        return this.projectRotated(transRot);
    },

    uninvert: function(pt) {
        if (pt === null) {
            return null;
        }
        return [-1 * pt[X], -1 * pt[Y], pt[Z]];
    },

    projUninvert: function(pt) {
        return camera.uninvert(camera.project(pt));
    }
};


const physical = {

    drawLine: function(s, e, w, color, alpha, dashed) {
        if (s == null || e == null) {
            return;
        }
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
        G.ctx.moveTo(fixedS[X], fixedS[Y]);
        G.ctx.lineTo(fixedE[X], fixedE[Y]);
        G.ctx.stroke();
    },

    fixPointForCanvas: function(pt) {
        return [pt[X] + 0.5, pt[Y], 0]
    },

    relToAbs: function(pt) {
        if (pt === null) {
            return null;
        }
        const centerX = G.canvas.width/2;
        const centerY = G.canvas.height/2;
        return [(centerX + pt[X] * 100), (centerY - pt[Y] * 100), 0]
    },

    drawShape: function(pts, color, alpha) {
        for (var i = 0; i < pts.length; i++) {
            if (pts[i] == null) {
                return;
            }
        }
        G.ctx.strokeStyle = color;
        G.ctx.fillStyle = color;
        G.ctx.globalAlpha = alpha;
        G.ctx.beginPath();
        G.ctx.moveTo(pts[0][X], pts[0][Y]);
        for (var i = 1; i < pts.length; i++) {
            const fixed = physical.fixPointForCanvas(pts[i]);
            G.ctx.lineTo(fixed[X], fixed[Y]);
        }
        G.ctx.fill();
    }
};

const origin = function() {
    return [0, 0, 0];
};


const setUpCanvas = function() {
    canvas = byId('canvas');
    canvas.width = 4;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx = canvas.getContext('2d');
    G.canvas = canvas;
    G.ctx = ctx;
    drawBackground();
};

const drawBackground = function() {
    G.ctx.globalAlpha = 1;
    G.ctx.fillStyle = 'black';//COLORS.background;
    G.ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const Mat = {
    mat: function(arrs) {
        const shape = this.shape(arrs);
        if (isNaN(shape[0]) || isNaN(shape[1])) {
            throw new Error('bad shape: ' + shape);
        }
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
        ret = [];
        for (var i = 0; i < a.length; i++) {
            ret.push(a[i] + b[i]);
        }
        return ret;
    },

    subVec: function(a, b) {
        ret = [];
        for (var i = 0; i < a.length; i++) {
            ret.push(a[i] - b[i]);
        }
        return ret;
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

    counterClockXY: function(theta) {
        const in3d = Mat.in3dFromXY(Mat.orth2(theta));
        in3d[2][2] = 1;
        return in3d;
    },

    counterClockXZ: function(theta) {
        return Mat.mat([
            [Math.cos(theta), 0, Math.sin(theta)],
            [0, 1, 0],
            [-1 * Math.sin(theta), 0, Math.cos(theta)]
        ]);
    },

    counterClockYZ: function(theta) {
        return Mat.mat([
            [1, 0, 0],
            [0, Math.cos(theta), -1 * Math.sin(theta)],
            [0, Math.sin(theta), Math.cos(theta)]
        ]);
    },

    in3dFromXY: function(mat2d) {
        const shape = Mat.shape(mat2d);
        if ((shape[0] != 2) || (shape[1] != 2)) {
            throw new Error("det only supported on 2x2, this is " + shape);
        }
        return Mat.mat(
            [
                [mat2d[0][0], mat2d[0][1], 0],
                [mat2d[1][0], mat2d[1][1], 0],
                [0, 0, 0]
            ]
        );
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
    },

    cross: function(a, b) {
        return [
            a[X] * b[Y] - a[Y] * b[X],
            -1 * (a[X] * b[Z] - a[Z] * b[X]),
            a[Y] * b[Z] - a[Z] * b[Y]
        ];
    },

    normedCross: function(a, b) {
        const cross = this.cross(a, b);
        return this.scaleVec(cross, 1 / this.norm(cross));
    }
};



const main = function() {
    G.config = new Pictures();
    setUpCanvas();
    init();
    update();
    draw();
    $("#record").click(startRecording);
};

const Pictures = function() {
    const logical = Logical(
        transform = function(v) {
            return v;
        }
    );


    const colors = ['yellow', 'red', 'blue', 'orange', 'green', 'white', 'cyan', 'purple'];
    const base = [[0, 0, 0], [1, 0, 0], [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3), 0]];
    const triangles = [];
    var id = 0;
    for (var k = -300; k <= 10; k++) {
        for (var i = -40; i <= 40; i++) {
            for (var j = -40; j <= 40; j++) {
                if (Math.random() > 0.999) {
                    id += 1;
                    triangles.push(
                        triang(
                            base.map(p => Mat.addVec(Mat.scaleVec([i, j, k], 1), p)),
                            {color: colors[(id % colors.length)]},
                            id
                        )
                    );
                }
            }
        }
    }
    shuffle(triangles);
    return {

        inputs: [
        ],

        update: function() {
        },

        draw: function() {
            drawBackground();
            logical.drawAllTriangles(triangles);
            logical.drawLineList(getAxes3d(5).map(v => Mat.addVec(v, [0, 0, 10])), {color: 'white'});
            //const triang = [[0, 0, 0], [1, 0, 0], [1, 1, 0]];
            //logical.drawShape(triang, {color: 'yellow'});

        }
    }
};


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
};

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
};

window.addEventListener('load', main);

// TODO delete
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
