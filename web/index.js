
const elMain = document.querySelector('#main');
const elCardCont = document.querySelector('#cards');
const btnPrev = document.querySelector('#prev');
const btnNext = document.querySelector('#next');
const elProfile = document.querySelector('#profile');
const elProjects = document.querySelector('#projectsCont');
const elTimeline = document.querySelector('#timelineCont');
const elAccounts = document.querySelector('#accountsCont');

const sanitizeStringForUrl = (string) => {
    return string.replace(/ /gi, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
};

// GPT wrote this one lol
const getAge = (date) => {
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    if (now.getMonth() < date.getMonth() || (now.getMonth() == date.getMonth() && now.getDate() < date.getDate())) age--;
    return age;
};

// I didn't write this lol
const hslToHex = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s == 0) r = g = b = l;
    else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const loadProjects = async () => {
    const projects = (await axios.get('./projects.json')).data;
    elProjects.innerHTML = '';
    for (const project of projects) {
        elProjects.innerHTML += `
            <div class="project">
                <div class="icon">${project.icon}</div>
                <div class="contentCont">
                    <div class="content">
                        <div class="title">${project.title}</div>
                        <p class="desc">${project.desc}</p>
                    </div>
                    ${project.href ? `
                        <a href="${project.href}" target="_blank" class="btn">
                            <div class="icon">open_in_new</div>
                            <span>${project.href.match('github.com') ? 'Code' : 'Website'}</span>
                        </a>
                    `:''}
                </div>
            </div>
        `;
    }
};

const loadTimeline = async () => {
    const timeline = (await axios.get('./timeline.json')).data;
    elTimeline.innerHTML = '';
    for (const event of timeline) {
        const descLines = [];
        if (event.desc) for (const line of event.desc) {
            descLines.push(`<p>${line}</p>`);
        }
        if (event.useCurrentDate) {
            const now = new Date();
            event.year = now.getFullYear();
            event.month = now.getMonth()+1;
            event.day = now.getDate();
        }
        let date = [];
        if (event.month) {
            const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
            date.push(months[event.month-1]);
        }
        if (event.day) date.push(event.day);
        if (event.year) date.push(event.year);
        elTimeline.innerHTML += `
            <div class="row">
                <div class="branch"></div>
                <div class="content">
                    <div class="title"><span class="date">${date.join(' ')}</span> ${event.title ? `• ${event.title}`:''}</div>
                    ${event.desc ? `<div class="desc">${descLines.join('')}</div>`:''}
                </div>
            </div>
        `;
    }
    [...elTimeline.querySelectorAll('.content')].pop().classList.add('last');
};

// Most account icons are from https://simpleicons.org/
// They exist under /account-icons and are named "<siteName>-color.svg"
const loadAccounts = async () => {
    const accounts = (await axios.get('./accounts.json')).data;
    elAccounts.innerHTML = '';
    for (const account of accounts) {
        const slug = sanitizeStringForUrl(account.slug || account.site);
        const shortLink = window.location.origin + '/' + slug;
        elAccounts.innerHTML += `
            <div class="account">
                <img class="logo" src="./account-icons/${account.icon}">
                <div class="content">
                    <div class="text">
                        <div class="site">${account.site}</div>
                        <div class="title">${account.title}</div>
                    </div>
                    ${account.href ? `
                        <a href="${shortLink}" target="_blank" class="btn" title="${account.href}">
                            <div class="icon">open_in_new</div>
                        </a>
                    `:''}
                </div>
            </div>
        `;
    }
};

let timesChanged = 0;
let lastChange = 0;
let changeCardsTimeout;
const changeCards = async (backwards = false, elTarget = null) => {
    if ((Date.now()-lastChange) < 150) return;
    clearTimeout(changeCardsTimeout);
    lastChange = Date.now();
    const elCurrent = elCardCont.querySelector('.exists') || elTarget;
    const elFirst = elCardCont.firstElementChild;
    const elPrev = elCurrent ? elCurrent.previousElementSibling : elTarget;
    const elNext = elCurrent ? elCurrent.nextElementSibling : elTarget;
    const elLast = elCardCont.lastElementChild;
    const isTargeted = !!elTarget;
    elTarget = elTarget || (backwards ? (elPrev || elLast) : (elNext || elFirst));
    elCurrent.classList.remove('next', 'prev');
    elTarget.classList.remove('next', 'prev');
    if (!isTargeted) {
        elCurrent.classList.add(backwards ? 'next' : 'prev');
        elTarget.classList.add(backwards ? 'prev' : 'next');
    }
    elCurrent.classList.remove('active');
    changeCardsTimeout = setTimeout(() => {
        elCurrent.classList.remove('exists');
        elTarget.classList.add('exists');
        changeCardsTimeout = setTimeout(() => {
            elTarget.classList.add('active');
            requestAnimationFrame(() => elMain.scrollTo(0, 0));
            document.title = `${elTarget.dataset.title} | Cybah.me`;
            history.replaceState("", document.title, `#${elTarget.id}`);
            if (elTarget.id == 'head') {
                history.replaceState("", document.title, '/');
            }
            timesChanged++;
        }, 10);
    }, 100);
};

const setCardFromHash = () => {
    const id = window.location.hash.replace('#', '');
    const el = elCardCont.querySelector(`#${id || 'head'}`);
    changeCards(false, el);
};

window.addEventListener('load', async() => {
    elProfile.querySelector('.age').innerText = getAge(new Date(2003, 0, 2));
    await loadProjects();
    await loadTimeline();
    await loadAccounts();
    setCardFromHash();
    elMain.classList.add('visible');
});

window.addEventListener('keydown', (e) => {
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key == 'ArrowLeft') changeCards(true);
    if (e.key == 'ArrowRight') changeCards(false);
});

let hue = 300;
let duration = 60;
let step = 5;
setInterval(() => {
    hue = (hue + step) % 360;
    document.body.style.setProperty('--bgHue', hue);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', hslToHex(hue, 90, 90));
}, (1000*duration)/(360/step));

setInterval(async() => {
    if (timesChanged >= 2 || !!window.location.hash.replace('#', ''))
        return;
    const navButtons = [...document.querySelectorAll('.navBtn')];
    for (const el of navButtons) {
        el.classList.add('active');
        await sleep(300);
        el.classList.remove('active');
        await sleep(300);
    }
}, 1000*10);