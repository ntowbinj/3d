const Pictures = function() {
    const logical = Logical(
        transform = function(v) {
            return v;
        }
    );


    //const base = Mat.scale([[0, 0, 0], [1, 0, 0], [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3), 0]], 1);
    //const ico = icosahedron();
    Math.seedrandom('2');
    const ico = icosahedronMesh({});
    const icosas = [];
    var id = 0;
    for (var k = -400; k <= 10; k++) {
        for (var i = -50; i <= 50; i++) {
            for (var j = -50; j <= 50; j++) {
                if (Math.random() > 0.99995) {
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
                            0.5 * samplePareto(.001 + Math.random())
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

    const randRot = Mat.prod(
        Mat.counterClockXY(randAngle()),
        Mat.prod(
            Mat.counterClockXZ(randAngle()),
            Mat.counterClockYZ(randAngle())
        )
    );
    const bigOne = icosahedronMesh({color: tinycolor.random()});
    const vertsTrans = Mat.translateRecursive(
        Mat.scaleRecursive(
            Mat.prodRecursive(ico.verteces.vertMatrix, randRot),
            700
        ),
        [400, -3000, -500]
    )
    bigOne.verteces = Verteces(vertsTrans);
    icosas.push(bigOne);




    shuffle(icosas);
    return {

        inputs: [
        ],

        update: function() {
        },

        draw: function() {
            drawBackground();
            const allTriangs = logical.getAllTrianglesMeshes(icosas);
            physical.draw(allTriangs);
            logical.drawLineList(getAxes3d(5).map(v => Mat.addVec(v, [0, 0, 0])), {color: 'white'});
        }
    }
};

