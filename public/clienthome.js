if (document.cookie[0] !== '{') { document.cookie = '{}' }
function setCookie(name, val) {
    let obj = JSON.parse(document.cookie)
    obj[String(name)] = String(val)
    document.cookie = JSON.stringify(obj)
}
function getCookie(name) {
    if (document.cookie[0] !== '{') { document.cookie = '{}' }
    let obj = JSON.parse(document.cookie)
    return obj[name]
}

function Code() {
    if (!getCookie('token')) {
        const params1 = new URLSearchParams(window.location.search);
        const token = params1.get("token");const refresh = params1.get("refresh") 
        if (token) { setCookie('token', token);setCookie('refresh', token); return token } else { return false }
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
        var artists = [];
        for (var j = 0; j < t.length; j++) {
            var artist = { name: t[j]["name"], link: t[j]["external_urls"]["spotify"] };
            artists.push(artist);
        }
        return artists
    }
}
async function getCurrentPlaying(code) {
    const result = await fetch(`https://api.spotify.com/v1/me/player/currently-playing`, { method: "GET", headers: { Authorization: `Bearer ${code}` } })
    return await result.json()
}
async function getRecent(code) {
    const result = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=5`, { method: "GET", headers: { Authorization: `Bearer ${code}` } })
    return await result.json()
}
async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", { method: "GET", headers: { Authorization: `Bearer ${token}` } });
    return await result.json();
}
function PopulateProfile() {
    fetchProfile(Code()).then((res) => {
        console.log(res)
        document.querySelector('#account').querySelector('p').innerText = res['display_name']
        document.querySelector('#account').querySelector('img').src = res['images'][1]['url']
    })
}
function PopulateRecent() {
    getRecent(Code()).then((res) => {
        while (document.getElementById('history').hasChildNodes()) { document.getElementById('history').firstChild.remove() }
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
let currentPlay = null
async function Runner() {
    getCurrentPlaying(Code()).then((res) => {
        if (res['is_playing'] === true) {
            let track = new trackConstruct(res['item'])
            if (currentPlay === null || (currentPlay.name !== track.name)) {
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
                PopulateRecent()
            }
            currentPlay = track
        } else {
            console.log('track')
        }
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