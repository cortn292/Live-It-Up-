(function () {
    const canvas = document.getElementById('orb-canvas');
    const ctx    = canvas.getContext('2d');
 
    Object.assign(canvas.style, {
        position: 'fixed',
        inset:     '0',
        width:     '100%',
        height:    '100%',
        zIndex:    '0',
        pointerEvents: 'none',
    });
 

    document.querySelector('#site-header').style.position = 'sticky';
 
    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();
 

    const COLORS = [
        { r: 200, g: 255, b:   0 },   
        { r: 255, g:  60, b: 172 },   
        { r: 120, g:  40, b: 255 },   
        { r:  30, g: 160, b: 255 },   
        { r: 255, g: 140, b:   0 },   
    ];
 
    const ORB_COUNT = 7;
 
    function randBetween(a, b) { return a + Math.random() * (b - a); }
 
    function makeOrb(i) {
        const c = COLORS[i % COLORS.length];
        return {
            x:      randBetween(0.05, 0.95),
            y:      randBetween(0.05, 0.95),
            r:      randBetween(0.12, 0.28),   
            vx:     randBetween(-0.00012, 0.00012),
            vy:     randBetween(-0.00010, 0.00010),
            color:  c,
            alpha:  randBetween(0.13, 0.22),
            phase:  randBetween(0, Math.PI * 2),
            speed:  randBetween(0.0004, 0.0009),
        };
    }
 
    const orbs = Array.from({ length: ORB_COUNT }, (_, i) => makeOrb(i));
 
    let last = performance.now();
 
    function draw(now) {
        const dt = now - last;
        last = now;
 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
 
        const W = canvas.width;
        const H = canvas.height;
        const minDim = Math.min(W, H);
 
        for (const orb of orbs) {
       
            orb.x += orb.vx * dt;
            orb.y += orb.vy * dt;
 
            if (orb.x < 0.0 || orb.x > 1.0) orb.vx *= -1;
            if (orb.y < 0.0 || orb.y > 1.0) orb.vy *= -1;
            orb.x = Math.max(0, Math.min(1, orb.x));
            orb.y = Math.max(0, Math.min(1, orb.y));
 
            orb.phase += orb.speed * dt;
            const pulse = 1 + 0.12 * Math.sin(orb.phase);
            const radius = orb.r * minDim * pulse;
 
            const cx = orb.x * W;
            const cy = orb.y * H;
            const { r, g, b } = orb.color;
 
          
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            grad.addColorStop(0,    `rgba(${r},${g},${b},${(orb.alpha * 0.9).toFixed(3)})`);
            grad.addColorStop(0.35, `rgba(${r},${g},${b},${(orb.alpha * 0.55).toFixed(3)})`);
            grad.addColorStop(0.7,  `rgba(${r},${g},${b},${(orb.alpha * 0.18).toFixed(3)})`);
            grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
 
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
 
        requestAnimationFrame(draw);
    }
 
    requestAnimationFrame(draw);
})();
 