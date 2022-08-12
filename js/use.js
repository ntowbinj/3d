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
    var id = 0;
    for (var k = -400; k <= 10; k++) {
        for (var i = -50; i <= 50; i++) {
            for (var j = -50; j <= 50; j++) {
                if (Math.random() > 0.99993) {
                    id++;
                    const randRot = Mat.rotMat(randAngle(), randAngle(), randAngle());
                    const vertsTrans = shape.verteces
                        .unitaryTransformation(randRot)
                        .scale(0.5 * samplePareto(.001 + Math.random()))
                        .translate([i, j, k]);

                    const color = tinycolor.random();
                    const newshapesa = icosahedronMesh({color: color}, id);
                    newshapesa.verteces = vertsTrans;
                    shapes.push(newshapesa);
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
        .scale(2)
        .translate([0, 0, -10]);
    const bigOne = Mesh(
        vertsTrans,
        icoTriangles({color: tinycolor('cyan')})
    );
    //shapes = []
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
        }
    }
};

