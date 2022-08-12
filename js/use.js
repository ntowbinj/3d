const Pictures = function() {
    const logical = Logical(
        transform = function(v) {
            //return v;
            return Mat.prod([v], Mat.rotMat(S.trans_alpha, S.trans_beta, S.trans_theta))[0];
        }
    );


    //const base = Mat.scale([[0, 0, 0], [1, 0, 0], [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3), 0]], 1);
    //const shape = icosahedron();
    Math.seedrandom('10');
    const baseCube = cube({});
    const baseIco = icosahedronMesh({});
    let shapes = [];
    let moving = [];
    var id = 0;
    for (var k = -50; k <= 1; k++) {
        for (var i = -30; i <= 5; i++) {
            for (var j = -10; j <= 10; j++) {
                if (Math.random() > 0.95) {
                    let shapeFunc;
                    let vertsTrans;
                    if (Math.random() > 0.25) {
                        shapeFunc = icosahedronMesh;
                        vertsTrans = baseIco.verteces;
                    } else {
                        shapeFunc = cube;
                        vertsTrans = baseCube.verteces;
                    }
                    const randRot = Mat.rotMat(randAngle(), randAngle(), randAngle());
                    let s;
                    if (Math.random() < 0.5) {
                        s = Math.max(0.9, 0.6 * samplePareto(.001 + Math.random()));
                    } else {
                        s = sampleExp(0.2, Math.random() - 0.001);
                    }
                    const color = tinycolor.random();
                    const baseTrans = [i * 10, j * 10, k * 10];
                    vertsTrans = vertsTrans
                        .unitaryTransformation(randRot)
                        .scale(s)
                    id++;
                    if (Math.random() < 0.70) {
                        vertsTrans = vertsTrans.translate(baseTrans);
                        const newshape = shapeFunc({color: color}, id);
                        newshape.verteces = vertsTrans;
                        shapes.push(newshape);
                    } else {
                        const newshape = shapeFunc({color: color}, id);
                        newshape.verteces = vertsTrans;
                        moving.push(
                            {
                                shape: newshape,
                                transRate: Math.random(),
                                trans: [Math.random(), Math.random(), Math.random()],
                                rotRate: Math.random(),
                                randRot: Mat.rotMat(randAngle(), randAngle(), randAngle()),
                                baseTrans: baseTrans,
                                color: color
                            }
                        );
                    }
                }
            }
        }
    }

    const randRot = Mat.rotMat(randAngle(), randAngle(), randAngle());
    const randRot2 = Mat.rotMat(randAngle(), randAngle(), randAngle());
    //const bigOne = icosahedronMesh({color: tinycolor.random()});
    /*
    const vertsTrans = shape.verteces
        .unitaryTransformation(randRot)
        .scale(1000)
        .translate([-12000, 0, -9000]);
        */




    const color = tinycolor.random();
    shuffle(shapes);
    return {

        inputs: [
        ],

        update: function() {
        },

        draw: function() {
            drawBackground();
            const allShapes = [];
            for (var i = 0; i < shapes.length; i++) {
                allShapes.push(shapes[i]);
            }

            for (var i = 0; i < moving.length; i++) {
                const toMove = moving[i];
                const movedVerts = toMove.shape.verteces.unitaryTransformation(
                    Mat.counterClockXY(Math.PI * S.t * toMove.rotRate * 50)
                )
                    .unitaryTransformation(toMove.randRot)
                    .translate(Mat.scaleVec(toMove.trans, toMove.transRate * S.t * 1000))
                    .translate(toMove.baseTrans);
                const mesh = toMove.shape.withVerts(movedVerts);
                //const mesh = cube({color: toMove.color}, toMove.shape.id);
                //mesh.verteces = movedVerts;
                allShapes.push(mesh);
            }
            const vertsTrans = baseIco.verteces
                .unitaryTransformation(Mat.counterClockXY(10 * sigmoid(S.t * 10 - 5)))
                .unitaryTransformation(randRot)
                .unitaryTransformation(Mat.counterClockXY(20 * sigmoid(S.t * 15 - 10)))
                .unitaryTransformation(randRot2)
                .unitaryTransformation(Mat.counterClockXY(30 * sigmoid(S.t * 20 - 17)))
                .unitaryTransformation(randRot)
                .scale(800)
                .translate([-4000, 0, -4000]);
            const bigOne = Mesh(
                vertsTrans,
                icoTriangles({color: tinycolor('yellow')})
            );
            allShapes.push(bigOne);

            const allTriangs = logical.getAllTrianglesMeshes(allShapes);
            physical.draw(allTriangs);
            logical.drawLineList(getAxes3d(5).map(v => Mat.addVec(v, [0, 0, 0])), {color: 'white'});
            //const allMoving = logical.
            /*
            for (var i = 0; i < shapes.length; i++) {
                const shp = shapes[i];
                const midp = midPoint(shp.verteces.vertMatrix);
                logical.text(midp, shp.id);
            }
            */
        }
    }
};

