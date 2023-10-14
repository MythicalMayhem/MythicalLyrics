
let form = document.querySelector("form");
form.addEventListener('submit', handleForm);
let lastTerm = ''
let allowed = true

async function handleForm(e) {
    e.preventDefault()
    let term = document.querySelector('#searcher').value.trim()
    if (!(term && term.length > 1 && term !== lastTerm && allowed)) { return }
    allowed = false
    lastTerm = term
    setTimeout(() => { allowed = true }, 2250);
    await fetch(`/gsearchreq?query=${term}`)
        .then((res) => { return res.json() })
        .then((res) => {
            if (res.ok === true && res?.data.length > 0) { return populateSearch(res['data']) }
            else {
                let parent = document.getElementById('container')
                while (parent.hasChildNodes()) { parent.removeChild(parent.firstChild) }
                let h1 = document.createElement('h1')
                h1.innerText = 'No results'
                h1.style.color = 'white'
                parent.appendChild(h1)
            }
        })
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
        newurl.pathname = '/glyrics' 
        newurl.searchParams.set("id", el.id)
        newurl.searchParams.set("fullartists", el.artists)

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