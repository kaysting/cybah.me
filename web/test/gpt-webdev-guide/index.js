
const elDoc = document.getElementById('doc');

window.addEventListener('load', async() => {
    const query = new URLSearchParams(window.location.search);
    const docParam = (query.get('doc') || '').trim() || 'toc';
    try {
        const res = await axios.get(`${docParam}.md`);
        elDoc.innerHTML = marked.parse(res.data);
        if (docParam == 'toc')
            $('#footerHome').style.display = 'none';
    } catch (error) {
        elDoc.innerHTML = `<h2>404</h2><p>Document ${docParam} not found! It may not be written yet.</p>`;
    }
    Prism.highlightAll();
});