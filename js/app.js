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

const applyDebug = function(name, value) {
    setState(name, value);
    updateAndDraw();
};

const setState = function(name, value) {
    S[name] = value;
};

const handleInputChange = function(name, value) {
    setState(name, value);
    if (G.animate) {
        return;
    }
    updateAndDraw();
};

const init = function() {
    addInput(
        getInput('cam_x', -10, 10, 0)
    );
    addInput(
        getInput('cam_y', -10, 10, 0)
    );
    addInput(
        getInput('cam_z', -200, 200, 40)
    );
    const angleInputs = [
        'alpha',
        'beta',
        'theta',
        /*
        'light_alpha',
        'light_beta',
        'light_theta',
        */
        'trans_alpha',
        'trans_beta',
        'trans_theta'
    ];
    for (var i = 0; i < angleInputs.length; i++) {
        addInput(
            getInput(angleInputs[i], Math.PI * (-1), Math.PI * 1, 0)
        );
    }
    addInput(
        getInput('focalLength', 1, 50, 20)
    );

    for (var i = 0; i < G.config.inputs.length; i++) {
        addInput(G.config.inputs[i]);
    }
    G[ORTH90] = Mat.trans(Mat.orth2(Math.PI / 2));
    G[ORTH_NEG90] = Mat.orth2(Math.PI / 2);
    G.hsvToRgbCache = {};
    G.timingBuffer = [];
    clearStats();
    G.collectStats = false;
    G.debugMap = {};
};

const clearStats = function() {
    G.stats = {};
}

const getOrDefault = function(m, k, d) {
    const result = m[k];
    if (result !== undefined) {
        return result;
    }
    const def = d();
    m[k] = def;
    return def;
}

const hsvToRgb = function(hsv) {
    return getOrDefault(
        getOrDefault(
            getOrDefault(
                G.hsvToRgbCache,
                Math.floor(hsv.h),
                function(){return {};}
            ),
            Math.floor(hsv.s),
            function(){return {};}
        ),
        Math.floor(100 * hsv.l),
        function() {
            return tinycolor(hsv).toString("rgb");
        }
    );
};

const log = {

    isDebug: false,

    debug: function(s) {
        if (this.isDebug) {
            console.log(s);
        }
    }
};

const updateAndDraw = function() {
    const perfNow = window.performance.now();
    const now = Date.now();
    if (S.lastUpdated > 0 && (now - S.lastUpdated < 50)) {
        if (G.collectStats) {
            G.stats['skippedFrameCount'] = (G.stats['skippedFrameCount'] || 0) + 1;
        }
        return;
    }
    S.lastUpdated = now;
    update();
    draw();
    if (G.collectStats) {
        getOrDefault(G.stats, 'timingBuffer', function() { return []; })
            .push(window.performance.now() - perfNow);
    }
}

const update = function() {
    updateCamera();
    updateLight();
    G.config.update();
    log.debug(S);
};

const mean = function(arr) {
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum / arr.length;
};

const stdev = function(arr) {
    const mn = mean(arr);
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        sum += Math.pow(arr[i], 2);
    }
    return (sum / arr.length) - Math.pow(mn, 2);
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
    /*
    setState(
        'lightDir',
        Mat.prod(
            [[0, 0, 1]],
            Mat.prod(
                Mat.counterClockXY(S.light_theta),
                Mat.prod(
                    Mat.counterClockYZ(S.light_alpha),
                    Mat.counterClockXZ(S.light_beta)
                )
            )
        )[0]
    );
    */
    setState('lightDir', [0, 0, 1]);
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

const midPoint = function(shape) {
    var sum = [0, 0, 0];
    for (var i = 0; i < shape.length; i++) {
        sum = Mat.addVec(sum, shape[i]);
    }
    return Mat.scaleVec(sum, 1 / shape.length);
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

        /*
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
        */

        // :(
        copyOptions: function(options) {
            return {
                color: options.color,
                alpha: options.alpha
            }
        },

        getTriangle: function(orig, proj, cam, opts = {}) {
            const options = this.copyOptions(opts);
            if (Mat.hasNull(proj)) {
                return null;
            }

            const a = Mat.subVec(orig[1], orig[0]);
            const b = Mat.subVec(orig[2], orig[0]);
            const cross = Mat.normedCross(a, b);
            const lightDot = Math.max(0, Mat.dot(cross, S.lightDir));
            if (!(COLOR in options)) {
                options.color = '#FFF';
            }
            if (!(ALPHA in options)) {
                options.alpha = 1.0;
            }
            const hsv = opts.color.toHsl();
            hsv.l = hsv.l * (0.2 + 0.8 * lightDot);
            options.color = hsvToRgb(hsv);
            return [cam, options.color, options.alpha];
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

        /*
        physPointList: function(vecList) {
            return vecList.map(in3d)
                .map(this.transform)
                .map(camera.translate)
                .map(camera.rotate)
                .map(camera.projectRotated)
                .map(camera.uninvert)
                .map(physical.relToAbs);
        },
        */

        getAllTrianglesMeshes: function(meshes) {
            const sorted = this.rotateAndDepthSortMeshes(meshes);
            const ret = [];
            for (var i = 0; i < sorted.length; i++) {
                const rotated = sorted[i][1];
                const abs = rotated.map(camera.projectRotated)
                    .map(camera.uninvert)
                    .map(physical.relToAbs);
                const options = sorted[i][2];
                const result = this.getTriangle(sorted[i][0], rotated, abs, options);
                if (result !== null) {
                    ret.push(result);
                }
            }
            return ret;
        },

        rotateAndDepthSortMeshes: function(meshes) {
            const withZ = [];
            for (var i = 0; i < meshes.length; i++) {
                const mesh = meshes[i];
                const verts = mesh.verteces;
                const triangles = mesh.triangles;
                const rotatedVerts = Verteces(
                    verts.vertMatrix.map(this.transform)
                    .map(camera.translate)
                    .map(camera.rotate)
                );
                for (var j = 0; j < triangles.length; j++) {
                    const triangle = triangles[j].mat(verts);
                    const rotated = triangles[j].mat(rotatedVerts);
                    let opt = triangles[j].opts;
                    const visible = Mat.det3(rotated) < 0;
                    if (!visible) {
                        continue;
                    }
                    const midP = midPoint(rotated);
                    if (midP[Z] > -5000) {
                        withZ.push([triangle, rotated, opt, midP[Z]]);
                    }
                }
            }
            return this.sort(withZ);
        },

        text: function(pt, txt) {
            const phys = this.physPoint(pt);
            if (phys) {
                physical.text(phys, txt);
            }
        },

        sort: function(withZ) {
            withZ.sort(function(a, b) {
                if (a[3] < b[3]) {
                    return -1;
                }
                if (a[3] > b[3]) {
                    return 1;
                }
                return 0;
            });

            return withZ;
        },

        /*
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
        */
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

    inView: function(pt) {
        if (pt[X] < 0) {
            return false;
        }
        if (pt[Y] < 0) {
            return false;
        }
        if (pt[X] > G.canvas.width) {
            return false;
        }
        if (pt[Y] > G.canvas.height) {
            return false;
        }
        return true;
    },

    draw: function(triangs) {
        for (var i = 0; i < triangs.length; i++) {
            let proj, color, alpha;
            [proj, color, alpha] = triangs[i];
            this.drawShape(proj, color, alpha);
        }
    },

    text: function(pt, txt) {
        G.ctx.fillStyle = 'white';
        G.ctx.fillText(txt, pt[X], pt[Y]);
    },

    drawShape: function(pts, color, alpha) {
        var outOfViewCount = 0;
        for (var i = 0; i < pts.length; i++) {
            if (pts[i] == null) {
                return;
            }
            if (!this.inView(pts[i])) {
                outOfViewCount++;
            }
        }
        if (outOfViewCount === pts.length) {
            return;
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
    G.ctx.font = '25px sans-serif';
    drawBackground();
};

const drawBackground = function() {
    G.ctx.globalAlpha = 1;
    G.ctx.fillStyle = '#000010';//COLORS.background;
    G.ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const animate = function(f, n, k, r) {
    G.animate = true;
    if (k == n) {
        G.animate = false;
        return;
    }
    f(k/n);
    setTimeout(function() {
        animate(f, n, k + 1, r)
    }, r);
}

const doAnimate = function(f, n, r) {
    animate(f, n, 0, r);
}

const main = function() {
    G.config = new Pictures();
    setUpCanvas();
    init();
    updateAndDraw();
    $("#record").click(startRecording);
}

const sigmoid = function(s) {
    return 1 / (1 + Math.exp(-1 * s));
}

function anim() {
    doAnimate(
        function(t) {
            //setState('cam_z', ((1 - t) * 100 - 80));
            setState('cam_z',   (1 - t) * 200 - 80);
            setState('beta', sigmoid(t*15 - 8) * Math.PI * 0.2);
            setState('alpha', sigmoid(t*15 - 10) * Math.PI * -0.05);
            setState('theta', sigmoid(t*10 - 5) * Math.PI * 0.1);
            //setState('alpha', -1 * t * 0.05 * Math.PI * 2 - 0.2 * Math.PI * sigmoid(t * 25 - 20));
            setState('cam_x', t * 80);
            setState('cam_y', sigmoid(t * 20 - 15) * 30);
            setState('focalLength', 22 - 10 * sigmoid(t * 15 - 6));
            //setState('focalLength', 22 - 21 * gauss(t * 10 - 5, 4));
            updateAndDraw();
        },
        100,
        50
    );
}

const sampleExp = function(lambda, x) {
    return (1/lambda) * Math.log(1 / (1 - x));
}

const samplePareto = function(x) {
    return 1 / (Math.pow(x, 0.70))
}

const gauss = function(x, d) {
    return Math.exp((-1 * (x**2) / d));
}


function startRecording() {
    anim();
    return;
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

function randAngle() {
    return Math.random() * 2 * Math.PI;
}

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

