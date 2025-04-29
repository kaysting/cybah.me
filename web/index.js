document.addEventListener('DOMContentLoaded', () => {

    const hueUpdateIntervalMs = 1000 / 30;
    const hueCycleMs = 15 * 1000;
    const hueChangePerUpdate = (360 / hueCycleMs) * hueUpdateIntervalMs;
    setInterval(() => {
        const hueCurrent = parseInt(document.body.style.getPropertyValue('--hue'));
        const hueNew = Math.round((hueCurrent + hueChangePerUpdate) % 360);
        document.body.style.setProperty('--hue', hueNew);
    }, hueUpdateIntervalMs);

    const elMain = document.querySelector('#main');
    const elCards = elMain.querySelectorAll('.cards .card');
    const elTabs = document.querySelectorAll('.navbar .tab');

    elMain.addEventListener('scroll', () => {
        let activeCard = null;

        for (const elCard of elCards) {
            const rect = elCard.getBoundingClientRect();
            if (rect.top < (elMain.clientHeight * 0.8)) {
                activeCard = elCard;
            }
        }

        const cardId = activeCard ? activeCard.id : null;
        for (const elTab of elTabs) {
            const tabId = elTab.dataset.cardId;
            if (tabId === cardId) {
                elTab.classList.add('active');
            } else {
                elTab.classList.remove('active');
            }
        }
    });

    for (const elTab of elTabs) {
        elTab.addEventListener('click', () => {
            const cardId = elTab.dataset.cardId;
            const elCard = document.querySelector(`#${cardId}`);
            // Scroll to slightly above the card
            const rect = elCard.getBoundingClientRect();
            const elCardTop = rect.top + elMain.scrollTop;
            elMain.scrollTo({
                top: elCardTop - 80,
                behavior: 'smooth'
            });
        });
    }

});