
var form = document.querySelector("form");
form.addEventListener('submit', handleForm);
let lastTerm = ''
let allowed = true
async function handleForm(e) {
    e.preventDefault()
    let term = document.querySelector('#searcher').value.trim()
    if (!(term && term.length > 1 && term !== lastTerm && allowed)) { return }
    allowed = false
    lastTerm = term
    setTimeout(() => { allowed = true }, 5000);
    await fetch(`http://127.0.0.1:5500/gnsearch?query=${term}`)
        .then((res) => { return res.json() })
        .then(populateSearch)

}
function populateSearch(res) {
    let parent = document.getElementById('container')
    while (parent.hasChildNodes()) { parent.removeChild(parent.firstChild) }
    res.forEach(el => {
        let wrapper = document.createElement('div')
        let span1 = document.createElement('span')
        let span2 = document.createElement('span')
        let div1 = document.createElement('div')
        span1.textContent = el.title
        span2.textContent = el.artists
        let img = document.createElement('img')
        let newurl = new URL(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port)
        newurl.pathname = '/geniuslyrics'
        newurl.searchParams.set("artist", el.artists)
        newurl.searchParams.set("track", el.title)
        newurl.searchParams.set("art", el.albumArt)
        newurl.searchParams.set("url", el.url)

        img.style.height = '75px'
        img.style.width = '75px'
        img.src = el.albumArt
        div1.id = 'identity'
        wrapper.id = 'template'
        div1.appendChild(span1)
        div1.appendChild(span2)
        wrapper.appendChild(img)
        wrapper.appendChild(div1)
        wrapper.setAttribute('redir', newurl)
        wrapper.addEventListener('click', () => {
            window.location = (wrapper.getAttribute('redir'))
        })
        parent.appendChild(wrapper)

    });
}