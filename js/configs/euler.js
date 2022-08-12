const euler = {
    update: function() {
        const n = 1.0 * Math.round(100 * S.n);
        const vecs = [];
        const ortho = Mat.trans(Mat.orth2(Math.PI / 2));
        vecs.push([0, 0], [1, 0]);
        var tot = vecs[1];
        for (var i = 0; i < n; i++) {
            const addDir = Mat.prod([tot], ortho)[0];
            const add = Mat.scale([addDir], (2 * Math.PI * S.theta)/n)[0];
            tot = Mat.addVec(tot, add);
            vecs.push(tot);
        }
        const tipToTail = []
        for (var i = 0; i < vecs.length - 1; i++) {
            tipToTail.push([vecs[i], vecs[i + 1]]);
        }
        setState('lst', tipToTail);
    },

    init: function() {
        addInput(
            getInput('theta', 0.5)
        );
        addInput(
            getInput('n', 0.04)
        );
    },

    draw: function() {
        drawBackground();
        const axes = getAxes();
        logical.drawLineList(axes, 0.7);
        logical.drawLineList(getXTicks(-100, 100, 0.3), 0.7);
        logical.drawLineList(getYTicks(-100, 100, 0.3), 0.7);
        for(var i = 0; i < S.lst.length; i++) {
            logical.drawVec(S.lst[i][0], S.lst[i][1], {color: 'cyan'});
        }
    }

}
