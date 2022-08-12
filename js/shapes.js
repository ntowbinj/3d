const Mesh = function(verteces, triangles) {
    return {
        verteces: verteces,
        triangles: triangles
    };
};

const Verteces = function(vertMatrix) {
    return {
        vertMatrix: vertMatrix,
        get: function(i) {
            return this.vertMatrix[i];
        }
    };
};

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

const cube = function() {
    const base = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
    const cube = [];
    const face = [];
    face.push(base);
    face.push(
        Mat.translateRecursive(
            Mat.prod(
                base,
                Mat.counterClockXY(-1 * Math.PI)
            ),
            [1, 1, 0]
        )
    );
    cube.push.apply(cube, face);
    cube.push.apply(
        cube,
        Mat.translateRecursive(
            Mat.prodRecursive(
                face, 
                Mat.counterClockXZ(-0.5 * Math.PI)
            ),
            [0, 0, -1]
        )
    );
    cube.push.apply(
        cube,
        Mat.translateRecursive(
            Mat.prodRecursive(
                face, 
                Mat.counterClockYZ(0.5 * Math.PI)
            ),
            [0, 0, -1]
        )
    );
    const rotted = Mat.prodRecursive(
        cube, 
        Mat.counterClockXZ(Math.PI)
    );
    const otherHalf = Mat.translateRecursive(
        Mat.prodRecursive(
            rotted,
            Mat.counterClockYZ(0.5 * Math.PI)
        ),
        [1, 1, -1]
    );
    cube.push.apply(
        cube,
        otherHalf
    );
    return cube;
};

const icosahedron = function() {
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

    const triangs = [];
    triangs.push([v[0], v[11], v[5]]);
    triangs.push([v[0], v[5], v[1]]);
    triangs.push([v[0], v[1], v[7]]);
    triangs.push([v[0], v[7], v[10]]);
    triangs.push([v[0], v[10], v[11]]);
    triangs.push([v[1], v[5], v[9]]);
    triangs.push([v[5], v[11], v[4]]);
    triangs.push([v[11], v[10], v[2]]);
    triangs.push([v[10], v[7], v[6]]);
    triangs.push([v[7], v[1], v[8]]);
    triangs.push([v[3], v[9], v[4]]);
    triangs.push([v[3], v[4], v[2]]);
    triangs.push([v[3], v[2], v[6]]);
    triangs.push([v[3], v[6], v[8]]);
    triangs.push([v[3], v[8], v[9]]);
    triangs.push([v[4], v[9], v[5]]);
    triangs.push([v[2], v[4], v[11]]);
    triangs.push([v[6], v[2], v[10]]);
    triangs.push([v[8], v[6], v[7]]);
    triangs.push([v[9], v[8], v[1]]);

    return triangs;
};

const icosahedronMesh = function(opts) {
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

    return Mesh(verts, triangs);
};
