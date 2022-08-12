const Pictures = function() {
    const logical = Logical(
        transform = function(v) {
            return v;
        }
    );


    const colors = ['yellow', 'red', 'blue', 'orange', 'green', 'white', 'cyan', 'purple'];
    const base = [[0, 0, 0], [1, 0, 0], [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3), 0]];
    const triangles = [];
    var id = 0;
    for (var k = -300; k <= 10; k++) {
        for (var i = -40; i <= 40; i++) {
            for (var j = -40; j <= 40; j++) {
                if (Math.random() > 0.999) {
                    id += 1;
                    triangles.push(
                        triang(
                            base.map(p => Mat.addVec(Mat.scaleVec([i, j, k], 1), p)),
                            {color: colors[(id % colors.length)]},
                            id
                        )
                    );
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
            logical.drawAllTriangles(triangles);
            logical.drawLineList(getAxes3d(5).map(v => Mat.addVec(v, [0, 0, 10])), {color: 'white'});
            //const triang = [[0, 0, 0], [1, 0, 0], [1, 1, 0]];
            //logical.drawShape(triang, {color: 'yellow'});

        }
    }
};

