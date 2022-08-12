const inverse = {
    update: function() {
        const shiftScale = function(x) {
            return 2 * (x - 0.5);
        }
        const A = [[shiftScale(S.a), shiftScale(S.b)], [shiftScale(S.c), shiftScale(S.d)]]
        const B = Mat.trans(Mat.inverse(A));
        setState('A', A);
        setState('B', B);
    },

    init: function() {
        addInput(
            getInput('a', 1)
        );
        addInput(
            getInput('b', 0.5)
        );
        addInput(
            getInput('c', 0.5)
        );
        addInput(
            getInput('d', 1)
        );
    },

    draw: function() {
        drawBackground();
        const axes = getAxes();
        logical.drawLineList(axes, 0.7);
        logical.drawLineList(getXTicks(-100, 100, 0.3), 0.7);
        logical.drawLineList(getYTicks(-100, 100, 0.3), 0.7);
        for(var i = 0; i < S.A.length; i++) {
            logical.drawVecOrig(S.A[i], {color: 'orange'});
        }
        for(var i = 0; i < S.B.length; i++) {
            logical.drawVecOrig(S.B[i], {color: 'yellow'});
        }
    }


}
