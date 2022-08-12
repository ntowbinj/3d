const Pictures = function() {
    const logical = Logical(
        transform = function(v) {
            return v;
        }
    );


    //const base = Mat.scale([[0, 0, 0], [1, 0, 0], [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3), 0]], 1);
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
    /*
    cube.push.apply(
        cube,
        Mat.translateRecursive(
            Mat.prodRecursive(
                face, 
                Mat.counterClockXZ(0.5 * Math.PI)
            ),
            [1, 0, 0]
        )
    );
    */
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
    const triangles = [];
    var id = 0;
    for (var k = -200; k <= 10; k++) {
        for (var i = -40; i <= 40; i++) {
            for (var j = -40; j <= 40; j++) {
                if (Math.random() > 0.99975) {
                    const color = tinycolor.random();
                    const randRot = Mat.prod(
                        Mat.counterClockXY(randAngle()),
                        Mat.prod(
                            Mat.counterClockXZ(randAngle()),
                            Mat.counterClockYZ(randAngle())
                        )
                    );
                    const theCube = Mat.translateRecursive(
                        Mat.scaleRecursive(
                            Mat.prodRecursive(cube, randRot),
                            sampleExp(1, .001 + Math.random())
                        ),
                        [i, j, k]
                    );
                    for (var c = 0; c < theCube.length; c++) {
                        id += 1;
                        triangles.push(
                            triang(
                                theCube[c],
                                {color: color},
                                id
                            )
                        );
                    }
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
            const allTriangs = logical.getAllTriangles(triangles);
            physical.draw(allTriangs);
            logical.drawLineList(getAxes3d(5).map(v => Mat.addVec(v, [0, 0, 0])), {color: 'white'});
        }
    }
};

