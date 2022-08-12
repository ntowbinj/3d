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
        //return Mat.mat([[Math.cos(theta), -1 * Math.sin(theta)], [Math.sin(theta), Math.cos(theta)]]);
        return Mat.mat([[Math.cos(theta), Math.sin(theta)], [-1 * Math.sin(theta), Math.cos(theta)]]);
    },

    counterClockXY: function(theta) {
        const in3d = Mat.in3dFromXY(Mat.orth2(theta));
        in3d[2][2] = 1;
        return in3d;
    },

    counterClockXZ: function(theta) {
        return Mat.mat([
            [Math.cos(theta), 0, -1 * Math.sin(theta)],
            [0, 1, 0],
            [Math.sin(theta), 0, Math.cos(theta)]
        ]);
    },

    counterClockYZ: function(theta) {
        return Mat.mat([
            [1, 0, 0],
            [0, Math.cos(theta), Math.sin(theta)],
            [0, -1 * Math.sin(theta), Math.cos(theta)]
        ]);
    },

    rotMat: function(alpha, beta, theta) {
        const Rx = Mat.counterClockYZ(alpha);
        const Ry = Mat.counterClockXZ(beta)
        const Rz = Mat.counterClockXY(theta);
        return Mat.prod(
            Rz,
            Mat.prod(
                Rx,
                Ry
            )
        );
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
    },

    // TODO bad
    hasNull: function(m) {
        for (var i = 0; i < m.length; i++) {
            if (m[i] == null) {
                return true;
            }
        }
        return false;
    },

    isVec: function(o) {
        return typeof(o[0]) === "number";
    },

    translateRecursive(o, v) {
        if (this.isVec(o)) {
            return this.addVec(o, v);
        }
        if (!(o.length > 0)) {
            throw new Error('bad object: ' + o);
        }
        const ret = [];
        for (var i = 0; i < o.length; i++) {
            ret.push(this.translateRecursive(o[i], v));
        }
        return ret;
    },

    prodRecursive(o, m) {
        if (this.isVec(o)) {
            return this.prod([o], m)[0];
        }
        if (!(o.length > 0)) {
            throw new Error('bad object: ' + o);
        }
        const ret = [];
        for (var i = 0; i < o.length; i++) {
            ret.push(this.prodRecursive(o[i], m));
        }
        return ret;
    },

    scaleRecursive(o, s) {
        if (this.isVec(o)) {
            return this.scaleVec(o, s);
        }
        if (!(o.length > 0)) {
            throw new Error('bad object: ' + o);
        }
        const ret = [];
        for (var i = 0; i < o.length; i++) {
            ret.push(this.scaleRecursive(o[i], s));
        }
        return ret;
    }
};



