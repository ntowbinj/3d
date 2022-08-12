window.addEventListener("deviceorientation", handleOrientation, true);

console.log('reload ' + Date());

let lastLogged = 0;

function handleOrientation(event) {
    if (window.performance.now() > lastLogged + 200) {
        console.log(
            'alpha: ' + Math.round(event.alpha) +
            ', beta: ' + Math.round(event.beta) +
            ', gamma: ' + Math.round(event.gamma)

        );
        lastLogged = window.performance.now();
    }
    setState('Ry', event.gamma * (2 * Math.PI / 360));
    setState('Rz', event.alpha * (2 * Math.PI / 360));
    setState('Rx', event.beta * (2 * Math.PI / 360));
    updateAndDraw();
}

