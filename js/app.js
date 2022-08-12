const COLORS = {
    'background': '#611'
}
COLOR = "color";
THICK = "thick";

const G = {};
 
var C;


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
        getInput('cam_z', 0.5)
    );
    G.config.init();
}

const update = function() {
    setState('camera_pos', getPoint((S.cam_x - 0.5) * 10, (S.cam_y - 0.5) * 10, Math.exp(3 * S.cam_z) - 0.9));
    G.config.update();
}

const getAxes = function() {
    return [[-100, 0], [100, 0], [0, -100], [0, 100]];
}

const getXTicks = function(s, e, l) {
    const result = [];
    for (var x = s; x < e; x++) {
        result.push([x, l * -0.5]);
        result.push([x, l * 0.5]);
    }
    return result;
}

const getYTicks = function(s, e, l) {
    const orth = Mat.orth2(Math.PI / 2);
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
    $("#ctrl").append(domObj);
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

const logical = {

    drawVecOrig: function(v, options = {}) {
        if (!(COLOR in options)) {
            options[COLOR] = 'cyan';
        }
        logical.drawVec([0, 0], v, options);
    },

    drawVec: function(s, e, options = {}) {
        const posVec = Mat.addVec(e, Mat.scaleVec(s, -1));
        const norm = Mat.norm(posVec);
        const lengthRatio = 0.1/(1 + Math.log(1 + norm/5));
        const segment = Mat.scaleVec(posVec, lengthRatio);
        const triangIntersectVec = Mat.addVec(e, Mat.scaleVec(segment, -1));
        const leftAdd = Mat.scaleVec(Mat.trans(Mat.prod(Mat.orth2(Math.PI/2), Mat.trans([segment])))[0], 0.7/Math.tan(Math.PI/3));
        const rightAdd = Mat.scaleVec(Mat.trans(Mat.prod(Mat.orth2(-1 * (Math.PI/2)), Mat.trans([segment])))[0], 0.7/Math.tan(Math.PI/3));
        const triang = [
            e,
            Mat.addVec(triangIntersectVec, leftAdd),
            Mat.addVec(triangIntersectVec, rightAdd)
        ];
        logical.drawLine(s, e, options);
        logical.drawShape(triang, options);
    },

    drawLineList: function(l, options = {}) {
        if ((l.length % 2) != 0) {
            throw new Error('need even number of points for line list');
        }
        for (var i = 0; i < l.length / 2; i++) {
            logical.drawLine(l[i * 2], l[(i * 2) + 1], options);
        }
    },

    drawLine: function(s, e, options = {}) {
        if (!(COLOR in options)) {
            options[COLOR] = '#FFF';
        }
        physical.drawLineAbs(logical.physPoint(s), logical.physPoint(e), options.color);
    },

    drawShape: function(pts, options = {}) {
        if (!(COLOR in options)) {
            options[COLOR] = '#FFF';
        }
        physical.drawShape(pts.map(pt => logical.physPoint(pt)), options.color);
    },

    physPoint: function(vec) {
        return physical.relToAbs(camera.projUninvert(vecToPoint(vec)));
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

    drawLineAbs: function(s, e, color) {
        G.ctx.strokeStyle = color;
        G.ctx.lineWidth = 2;
        G.ctx.beginPath();
        const fixedS = physical.fixPointForCanvas(s);
        const fixedE = physical.fixPointForCanvas(e);
        G.ctx.moveTo(fixedS.x, fixedS.y);
        G.ctx.lineTo(fixedE.x, fixedE.y);
        G.ctx.stroke();
    },

    fixPointForCanvas: function(pt) {
        /*
        return getPoint(
            Math.min(Math.max(pt.x + 0.5, 0), G.canvas.width),
            Math.min(Math.max(pt.y, 0), G.canvas.height)
        );
        */
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

    norm: function(v) {
        return Math.sqrt(Mat.dot(v, v));
    },

    convComb: function(A, B, c) {
        const Apart = Mat.scale(A, 1 - c);
        const Bpart = Mat.scale(B, c);
        return Mat.add(Apart, Bpart);
    },

    orth2: function(theta) {
        return Mat.mat([[Math.cos(theta), -1 * Math.sin(theta)], [Math.sin(theta), Math.cos(theta)]])
    }
}

const euler = {
    update: function() {
        const n = 1.0 * Math.round(100 * S.n);
        const vecs = [];
        const ortho = Mat.trans(Mat.orth2(Math.PI / 2));
        vecs.push([0, 0], [1, 0]);
        var tot = vecs[1];
        for (var i = 0; i < n; i++) {
            const addDir = Mat.prod([tot], ortho)[0];
            const add = Mat.scale([addDir], (2 * Math.PI * S.theta)/n)[0];
            tot = Mat.addVec(tot, add);
            vecs.push(tot);
        }
        const tipToTail = []
        for (var i = 0; i < vecs.length - 1; i++) {
            tipToTail.push([vecs[i], vecs[i + 1]]);
        }
        setState('lst', tipToTail);
    },

    init: function() {
        addInput(
            getInput('theta', 0.5)
        );
        addInput(
            getInput('n', 0.04)
        );
    },

    draw: function() {
        drawBackground();
        const axes = getAxes();
        logical.drawLineList(axes);
        logical.drawLineList(getXTicks(-100, 100, 0.3));
        logical.drawLineList(getYTicks(-100, 100, 0.3));
        for(var i = 0; i < S.lst.length; i++) {
            logical.drawVec(S.lst[i][0], S.lst[i][1], {color: 'cyan'});
        }
    }

}

const main = function() {
    G.config = euler;
    setUpCanvas();
    init();
    update();
    draw();
    //startRecording();
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
    setTimeout(()=>rec.stop(), 8000); // stop recording in 3s
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
