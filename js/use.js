const Pictures = function() {
    const logical = Logical(
        transform = function(v) {
            //return v;
            return Mat.prod([v], Mat.rotMat(S.trans_alpha, S.trans_beta, S.trans_theta))[0];
        }
    );


    //const base = Mat.scale([[0, 0, 0], [1, 0, 0], [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3), 0]], 1);
    //const shape = icosahedron();
    Math.seedrandom('');
    const shape = icosahedronMesh({});
    let shapes = [];
    let moving = [];
    var id = 0;
    for (var k = -500; k <= 10; k++) {
        for (var i = -300; i <= 50; i++) {
            for (var j = -100; j <= 100; j++) {
                const randRot = Mat.rotMat(randAngle(), randAngle(), randAngle());
                const s = Math.max(0.9, 0.6 * samplePareto(.001 + Math.random()));
                const vertsTrans = shape.verteces
                    .unitaryTransformation(randRot)
                    .scale(s)
                    .translate([i, j, k]);

                const color = tinycolor.random();
                const newshape = icosahedronMesh({color: color}, id);
                newshape.verteces = vertsTrans;
                if (Math.random() > 0.99998) {
                    id++;
                    shapes.push(newshape);
                } else if (Math.random() > 0.999995) {
                    moving.push(
                        [
                            newshape,
                            Math.random(),
                            [Math.random(), Math.random(), Math.random()],
                            Mat.rotMat(randAngle(), randAngle(), randAngle())
                        ]
                    );
                }
            }
        }
    }

    const randRot = Mat.rotMat(randAngle(), randAngle(), randAngle());
    //const bigOne = icosahedronMesh({color: tinycolor.random()});
    /*
    const vertsTrans = shape.verteces
        .unitaryTransformation(randRot)
        .scale(1000)
        .translate([-12000, 0, -9000]);
        */

    const vertsTrans = shape.verteces
        .unitaryTransformation(randRot)
        .scale(800)
        .translate([-4000, 0, -4000]);
    const bigOne = Mesh(
        vertsTrans,
        icoTriangles({color: tinycolor('yellow')})
    );
    shapes.push(bigOne);



    const color = tinycolor.random();
    shuffle(shapes);
    return {

        inputs: [
        ],

        update: function() {
        },

        draw: function() {
            drawBackground();
            const allTriangs = logical.getAllTrianglesMeshes(shapes);
            physical.draw(allTriangs);
            logical.drawLineList(getAxes3d(5).map(v => Mat.addVec(v, [0, 0, 0])), {color: 'white'});
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

