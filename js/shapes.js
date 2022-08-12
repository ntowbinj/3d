const Mesh = function(verteces, triangles, id = -1) {
    return {
        verteces: verteces,
        triangles: triangles,
        id: id
    };
};

const Verteces = function(vertMatrix) {
    const center = midPoint(vertMatrix);
    return {
        vertMatrix: vertMatrix,
        get: function(i) {
            return this.vertMatrix[i];
        },
        center: center,
        radius: radius(center, vertMatrix)
    };
};

const radius = function(center, pts) {
    let max = 0;
    for (var i = 0; i < pts.length; i++) {
        const dist = Mat.norm(Mat.subVec(pts[i], center));
        max = Math.max(max, dist);
    }
    return max;
}

let triId = 0;
const Tri = function(vertIdxs, opts) {
    triId +=1 ;
    return {
        vertIdxs: vertIdxs,
        opts: opts,
        id: triId,

        a: function(verteces) {
            return verteces.get(vertIdxs[0]);
        },

        b: function(verteces) {
            return verteces.get(vertIdxs[1]);
        },

        c: function(verteces) {
            return verteces.get(vertIdxs[2]);
        },

        mat: function(verteces) {
            return [
                this.a(verteces),
                this.b(verteces),
                this.c(verteces)
            ];
        }
    };
};

const cube = function(opts) {
    const v = [];
    v.push(
        [0, 0, 0], // 0
        [0, 0, 1], // 1
        [0, 1, 0], // 2
        [0, 1, 1], // 3
        [1, 0, 0], // 4
        [1, 0, 1], // 5
        [1, 1, 0], // 6
        [1, 1, 1] // 7
    );

    const verts = Verteces(v);

    const t = [];
    t.push(
        [1, 5, 3],
        [7, 3, 5],

        [0, 1, 2],
        [3, 2, 1],

        [0, 4, 1],
        [5, 1, 4],

        [0, 2, 4],
        [6, 4, 2],

        [5, 4, 7],
        [6, 7, 4],

        [2, 3, 6],
        [7, 6, 3]
    );

    const tr = [];
    for (var i = 0; i < t.length; i++) {
        tr.push(Tri(t[i], opts));
    }

    return Mesh(verts, tr);

};

const icoTriangles = function(opts, id = -1) {
    const triangs = [];

    triangs.push(Tri([0, 11, 5], opts));
    triangs.push(Tri([0, 5, 1], opts));
    triangs.push(Tri([0, 1, 7], opts));
    triangs.push(Tri([0, 7, 10], opts));
    triangs.push(Tri([0, 10, 11], opts));
    triangs.push(Tri([1, 5, 9], opts));
    triangs.push(Tri([5, 11, 4], opts));
    triangs.push(Tri([11, 10, 2], opts));
    triangs.push(Tri([10, 7, 6], opts));
    triangs.push(Tri([7, 1, 8], opts));
    triangs.push(Tri([3, 9, 4], opts));
    triangs.push(Tri([3, 4, 2], opts));
    triangs.push(Tri([3, 2, 6], opts));
    triangs.push(Tri([3, 6, 8], opts));
    triangs.push(Tri([3, 8, 9], opts));
    triangs.push(Tri([4, 9, 5], opts));
    triangs.push(Tri([2, 4, 11], opts));
    triangs.push(Tri([6, 2, 10], opts));
    triangs.push(Tri([8, 6, 7], opts));
    triangs.push(Tri([9, 8, 1], opts));
    return triangs;
}

const icosahedronMesh = function(opts, id = -1) {
    const t = (1 + Math.sqrt(5)) / 2;
    const v = [];
    v.push(Mat.normed([-1.0,  t, 0.0]));
    v.push(Mat.normed([ 1.0,  t, 0.0]));
    v.push(Mat.normed([-1.0, -t, 0.0]));
    v.push(Mat.normed([ 1.0, -t, 0.0]));
    v.push(Mat.normed([0.0, -1.0,  t]));
    v.push(Mat.normed([0.0,  1.0,  t]));
    v.push(Mat.normed([0.0, -1.0, -t]));
    v.push(Mat.normed([0.0,  1.0, -t]));
    v.push(Mat.normed([ t, 0.0, -1.0]));
    v.push(Mat.normed([ t, 0.0,  1.0]));
    v.push(Mat.normed([-t, 0.0, -1.0]));
    v.push(Mat.normed([-t, 0.0,  1.0]));

    const verts = Verteces(v);


    return Mesh(verts, icoTriangles(opts), id);
};
