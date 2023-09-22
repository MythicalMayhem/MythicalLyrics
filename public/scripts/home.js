function setCookie(cName, cValue, time) {
    let date = new Date();
    date.setTime(date.getTime() + (time * 1000));
    date = "expires=" + date.toUTCString()
    document.cookie = cName + "=" + cValue + "; " + date + "; path=/";
}

function getCookie(cName) {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(document.cookie);
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res;
}

function deleteCookie(name) {
    setCookie(name, '', -1)
}
function Code() {
    if (!getCookie('token') || getCookie('token')?.length == '') {
        const params1 = new URLSearchParams(window.location.search)
        const token = params1.get("access_token")
        if (!token) { return false }
        setCookie('token', token, 50 * 60)
        if ((getCookie('autoLogin') !== 'true') && confirm("Save login info ?")) { setCookie('autoLogin', 'true', (10 * 365 * 24 * 60 * 60)) }
        window.location = '/home'
        return token
    }
    return getCookie('token')
}

class trackConstruct {
    constructor(searchItem) {
        this.name = searchItem['name']
        this.img = searchItem['album']['images'][1]['url']
        this.artists = this.getArtists(searchItem['artists'])
        this.length = searchItem['duration_ms']
        this.href = searchItem['external_urls']['spotify']
    }
    getArtists(t) {
        let artists = [];
        for (let j = 0; j < t.length; j++) {
            let artist = { name: t[j]["name"], link: t[j]["external_urls"]["spotify"] };
            artists.push(artist);
        }
        return artists
    }
}
async function getCurrentPlaying(token) {
    const result = await fetch(`https://api.spotify.com/v1/me/player/currently-playing`, { method: "GET", headers: { Authorization: `Bearer ${token}` } })
    return await result.json()
}
async function getRecent(token) {
    const result = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=3`, { method: "GET", headers: { Authorization: `Bearer ${token}` } })
    return await result.json()
}
async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", { method: "GET", headers: { Authorization: `Bearer ${token}` } });
    return await result.json();
}

function PopulateProfile() {
    fetchProfile(Code()).then((res) => {
        if (res?.error?.status === 401) { deleteCookie('token'); return }
        document.querySelector('#account').querySelector('p').innerText = res['display_name']
        document.querySelector('#account').querySelector('img').src = res['images'][1]['url']
    })
}
function PopulateRecent() {
    getRecent(Code()).then((res) => {
        if (res?.error?.status === 401) { deleteCookie('token'); return }
        while (document.getElementById('history').hasChildNodes()) { document.getElementById('history').removeChild(document.getElementById('history').firstChild) }
        for (const i of res['items']) {
            let item = new trackConstruct(i['track'])
            let div = document.createElement('div')
            let img = document.createElement('img')
            let title = document.createElement('span')
            img.src = item.img; img.style.height = '40px'; img.style.width = '40px'
            title.innerHTML = `<a target='_blank' href=${item.href}>${item.name}</a> - ${item.artists.reduce((Artists, el) => { return Artists + `<a target='_blank'  href="${el.link}">` + el.name + `</a>` + ', ' }, '').slice(0, -2)}`

            let logo = document.createElement('img')
            logo.src = '../src/Spotify_Logo_RGB_White.png'
            logo.id = 'spotify_logo' 
            let logow = document.createElement('div')
            logow.appendChild(logo)
            logow.id = 'logo'
            let after = document.createElement('div')
            after.id = 'after'
            after.textContent = 'Get Lyrics'

            let wrap = document.createElement('div')
            wrap.id ='cwrap'
            wrap.appendChild(img)
            wrap.appendChild(title)
            div.appendChild(logow);div.appendChild(wrap); div.appendChild(after)
            div.id = 'clicker'



            let newurl = new URL(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port)
            newurl.pathname = '/spotifylyrics'
            newurl.searchParams.set("artist", item.artists[0].name)
            newurl.searchParams.set("track", item.name)
            newurl.searchParams.set("albumart", item.img)
            newurl.searchParams.set("fullartists", item.artists.reduce((Artists, item) => { return Artists + item.name + ', ' }, '').slice(0, -2))
            div.addEventListener('click', (e) => {
                if (e.target.id === 'clicker') {
                    window.location.href = newurl.toString()
                }
            })
            document.getElementById('history').appendChild(div)
        }
    })
}
let currentPlay = undefined
async function Runner() {
    getCurrentPlaying(Code()).then((res) => {
        if (res?.error?.status === 401) { deleteCookie('token'); return }
        let track = new trackConstruct(res['item'])
        if (((currentPlay?.name !== track.name))) {
            let div0 = document.getElementById('identity')
            let img0 = document.createElement('img')
            let div1 = document.createElement('div')
            let title0 = document.createElement('span')
            let artist0 = document.createElement('span')
            img0.src = track.img; img0.style.height = '80px'; img0.style.width = '80px'
            title0.innerHTML = `<a target='_blank' href=${track.href}>${track.name}</a>`;
            artist0.innerHTML = `${track.artists.reduce((Artists, item) => { return Artists + `<a target='_blank' href="${item.link}">` + item.name + `</a>` + ', ' }, '').slice(0, -2)}`;
            div1.id = 'name'

            let logo = document.createElement('img')
            logo.src = '../src/Spotify_Logo_RGB_White.png'
            logo.id = 'spotify_logo' 
            let logow = document.createElement('div')
            logow.appendChild(logo)
            logow.id = 'logo'
            let after = document.createElement('div')
            after.id = 'after'
            after.textContent = 'Get Lyrics'
            let wrap = document.createElement('div'); wrap.id = 'cwrap'
            wrap.appendChild(img0); div1.appendChild(title0); div1.appendChild(artist0); wrap.appendChild(div1); wrap
            let newurl = new URL(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port)
            newurl.pathname = '/spotifylyrics'
            newurl.searchParams.set("artist", track.artists[0].name)
            newurl.searchParams.set("track", track.name)
            newurl.searchParams.set("albumart", track.img)
            newurl.searchParams.set("fullartists", track.artists.reduce((Artists, item) => { return Artists + item.name + ', ' }, '').slice(0, -2))
            div0.setAttribute('redir', newurl.toString())
            while (div0.hasChildNodes()) { div0.firstChild.remove() }
            div0.appendChild(logow); div0.appendChild(wrap); div0.appendChild(after);
        }
        currentPlay = track
        PopulateRecent()
    }).then(() => { setTimeout(() => { Runner() }, "2500") })
}


function logout() {
    deleteCookie('token')
    deleteCookie('autoLogin')
    window.location = '/'
}

if (Code()) {
    PopulateRecent()
    PopulateProfile(Code())
    document.querySelector('#account').style.display = 'flex'
    document.querySelectorAll('#login')[0].style.display = 'none'
    document.querySelectorAll('#login')[1].style.display = 'none'
    document.querySelector('#logout').style.display = 'unset'
    Runner()
    document.getElementById('identity').addEventListener('click', (e) => {
        if (e.target.id === 'identity') {
            window.location.href = document.getElementById('identity').getAttribute('redir')
        }
    })

} else {
    document.querySelector('#account').querySelector('p').style.display = 'none'
    document.querySelector('#account').querySelector('img').style.display = 'none'
    document.querySelector('#logout').style.display = 'none'
    document.querySelectorAll('#login')[0].style.display = 'block'
    document.querySelectorAll('#login')[1].style.display = 'block'
    document.querySelector('#identity').remove()
    document.querySelector('#history').remove()
    if (getCookie('autoLogin') === 'true') { window.location = '/authorize' }
}  
