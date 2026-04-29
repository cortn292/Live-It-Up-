(function () {
    function seededRand(seed) {
        let s = seed;
        return function () {
            s = (s * 1664525 + 1013904223) & 0xffffffff;
            return (s >>> 0) / 0xffffffff;
        };
    }
 
    
    const ratios = ['3/4', '2/3', '1/1', '3/4', '4/5', '1/1', '2/3'];
 
    function applyScrapbookStyle(card, index) {
        const rand = seededRand(index * 7919 + 31337);
 
       
        const rot = (rand() * 12 - 6).toFixed(2);
        card.style.transform = `rotate(${rot}deg)`;
 
        
        const tapeRot = (rand() * 8 - 4).toFixed(1);
        card.style.setProperty('--tape-rot', `${tapeRot}deg`);
 
      
        const img = card.querySelector('img');
        if (img) {
            const ratio = ratios[Math.floor(rand() * ratios.length)];
            img.style.aspectRatio = ratio;
        }
 
        
        if (rand() > 0.65) card.classList.add('fold');
 
       
        if (rand() > 0.8) {
            card.style.setProperty('--tape', 'rgba(255, 0, 144, 0.78)');
        }
 
        const tints = ['#ff00e1', '#00d5ff', '#1900ff', '#44ff00', '#eeff00'];
        card.style.background = tints[Math.floor(rand() * tints.length)];
    }
 
    function decorateAll() {
        const cards = document.querySelectorAll('.block');
        cards.forEach((card, i) => {

            if (card.dataset.scrapbooked) return;
            card.dataset.scrapbooked = '1';
            applyScrapbookStyle(card, i);
        });
    }
 
    const observer = new MutationObserver(() => decorateAll());
    observer.observe(document.body, { childList: true, subtree: true });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', decorateAll);
    } else {
        decorateAll();
    }
})();