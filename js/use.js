const Pictures = function() {
    const logical = Logical(
        transform = function(v) {
            return v;
        }
    );


    //const base = Mat.scale([[0, 0, 0], [1, 0, 0], [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3), 0]], 1);
    //const ico = icosahedron();
    const ico = icosahedronMesh({});
    const icosas = [];
    for (var k = -200; k <= 10; k++) {
        for (var i = -40; i <= 40; i++) {
            for (var j = -40; j <= 40; j++) {
                if (Math.random() > 0.99975) {
                    const randRot = Mat.prod(
                        Mat.counterClockXY(randAngle()),
                        Mat.prod(
                            Mat.counterClockXZ(randAngle()),
                            Mat.counterClockYZ(randAngle())
                        )
                    );
                    const vertsTrans = Mat.translateRecursive(
                        Mat.scaleRecursive(
                            Mat.prodRecursive(ico.verteces.vertMatrix, randRot),
                            sampleExp(1, .001 + Math.random())
                        ),
                        [i, j, k]
                    );
                    const color = tinycolor.random();
                    const newIcosa = icosahedronMesh({color: color});
                    newIcosa.verteces = Verteces(vertsTrans);
                    icosas.push(newIcosa);
                }
            }
        }
    }
    shuffle(icosas);
    return {

        inputs: [
        ],

        update: function() {
        },

        draw: function() {
            drawBackground();
            //const allTriangs = logical.getAllTriangles(triangles);
            const allTriangs = logical.getAllTrianglesMeshes(icosas);
            physical.draw(allTriangs);
            logical.drawLineList(getAxes3d(5).map(v => Mat.addVec(v, [0, 0, 0])), {color: 'white'});
        }
    }
};

