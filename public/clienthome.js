function setCookie(name, value, days) {
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (3500000));
        let expires = "; expires=" + date.toUTCString();
    } else {
        let expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    }
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    setCookie(name, "", -1);
}

function Code() {
    if (!getCookie('token')) {
        console.log(getCookie('token2'))
        const params1 = new URLSearchParams(window.location.search);
        const token = params1.get("access_token");
        if (!token) { return false }
        setCookie('token', token, 10)
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
    const result = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=5`, { method: "GET", headers: { Authorization: `Bearer ${token}` } })
    return await result.json()
}
async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", { method: "GET", headers: { Authorization: `Bearer ${token}` } });
    return await result.json();
}

function PopulateProfile() {
    fetchProfile(Code()).then((res) => {
        console.log(Code())
        document.querySelector('#account').querySelector('p').innerText = res['display_name']
        document.querySelector('#account').querySelector('img').src = res['images'][1]['url']
    })
}
function PopulateRecent() {
    getRecent(Code()).then((res) => {
        while (document.getElementById('history').hasChildNodes()) { document.getElementById('history').removeChild(document.getElementById('history').firstChild) }
        for (const i of res['items']) {
            let item = new trackConstruct(i['track'])
            let div = document.createElement('div')
            let img = document.createElement('img')
            let title = document.createElement('span')
            img.src = item.img; img.style.height = '40px'; img.style.width = '40px'
            title.innerText = `${item.name} - ${item.artists.reduce((Artists, item) => { return item.name + ',' + Artists }, '').slice(0, -1)}`
            div.appendChild(img); div.appendChild(title)
            document.getElementById('history').appendChild(div)
        }
    })
}
let currentPlay = undefined
async function Runner() {//window.location = '/authorize'
    getCurrentPlaying(Code()).then((res) => {
        let track = new trackConstruct(res['item'])
        if (res['is_playing'] === true) {
            if (currentPlay?.name !== track.name) {
                let div0 = document.getElementById('identity')
                let img0 = document.createElement('img')
                let div1 = document.createElement('div')
                let title0 = document.createElement('span')
                let artist0 = document.createElement('span')
                img0.src = track.img; img0.style.height = '80px'; img0.style.width = '80px'
                title0.innerText = `${track.name}`;
                artist0.innerText = `${track.artists.reduce((Artists, track) => { return track.name + ',' + Artists }, '').slice(0, -1)}`;
                div1.id = 'name'
                while (document.getElementById('identity').hasChildNodes()) { document.getElementById('identity').firstChild.remove() }
                div0.appendChild(img0); div1.appendChild(title0); div1.appendChild(artist0); div0.appendChild(div1)
            }
        }
        currentPlay = track
        PopulateRecent()
    }).then(() => { setTimeout(() => { Runner() }, "7000") })
}



if (Code()) {
    PopulateRecent()
    PopulateProfile(Code())
    document.querySelector('#account').style.display = 'flex'
    document.querySelectorAll('#login')[0].style.display = 'none'
    document.querySelectorAll('#login')[1].style.display = 'none'
    Runner()

} else {
    document.querySelector('#account').querySelector('p').style.display = 'none'
    document.querySelector('#account').querySelector('img').style.display = 'none'
    document.querySelectorAll('#login')[0].style.display = 'block'
    document.querySelectorAll('#login')[1].style.display = 'block'
    document.querySelector('#identity').remove()
    document.querySelector('#history').remove()
}