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

function deleteCookie(name) { setCookie(name, "", -1); }

function Code() {
    if (!getCookie('token')) {
        console.log(getCookie('token2'))
        const params1 = new URLSearchParams(window.location.search)
        const token = params1.get("access_token")
        if (!token) { return false }
        setCookie('token', token, 10)
        return token
    }
    return getCookie('token')
}


function mtmas(millis) {
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

class playlistConstruct {
    constructor(res) {
        this.type = res['type'];
        this.id = res['id'];
        this.href = res["external_urls"]["spotify"];
        this.name = res['name'];
        this.collaborative = res["collaborative"];
        this.description = res["description"];
        this.img = res["images"][0]['url'];
        this.tracks = res["tracks"]["href"];
        this.len = res["tracks"]["total"];
    }
    async getTrackLink(token) {
        const result = await fetch(this.tracks, { method: "GET", headers: { Authorization: `Bearer ${token}` }, });
        let r = await result.json(); r = r["items"];
        let tlist = [];
        for (let i = 0; i < r.length; i++) { tlist.push(new trackConstruct(r[i]["track"])); }
        return tlist;
    }
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
async function getPlaylists(token) {
    const result = await fetch("https://api.spotify.com/v1/me/playlists?&limit=50", { method: "GET", headers: { Authorization: `Bearer ${token}` } });
    let playlists = [];
    let res = await result.json();
    res = res["items"];
    for (let i = 0; i < res.length; i++) {
        let pl = new playlistConstruct(res[i]);
        pl.tracks = pl.getTrackLink(token);
        playlists.push(pl);
    } return playlists
}
//console.log(getPlaylists(Code()))

async function search(searchterm) {
    if (searchterm.length == 0) { return }
    try {
        if (searchterm.startsWith('https://open.spotify.com/track/')) {
            const id = searchterm.split('track/')[1].split('?')[0]
            const result = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
                method: "GET", headers: { Authorization: `Bearer ${Code()}` }
            })
            let r = await result.json();
            return [new trackConstruct(r)]
        }
        else {
            let url = "https://api.spotify.com/v1/search?";
            url += "q=" + encodeURIComponent(searchterm);
            url += '&type=track&limit=10'
            const result = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${Code()}` } })
            let r = await result.json();
            let queries = r['tracks']['items']
            let returner = []
            for (let i = 0; i < queries.length; i++) {
                returner.push(new trackConstruct(queries[i]))
            }
            return returner
        }

    } catch (error) {
        let url = "https://api.spotify.com/v1/search?";
        url += "q=" + encodeURIComponent(searchterm);
        url += '&type=track&limit=8'
        const result = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${Code()}` } })
        let r = await result.json();
        let returner = []
        r['tracks']['items'].forEach(el => { returner.push(new trackConstruct(el)) });

        return returner
    }
}


async function PopulateSearch(term) {
    const arr = await search(term)
    if (!arr) { return }
    document.getElementById('container').innerHTML = ''
    for (let i = 0; i < arr.length; i++) {
        let artists = []
        for (index of arr[i].artists) {artists.push(`<a id='artist' target="_blank" href=${index['link']}> ${index['name']}`)}
        artists = artists.join(',</a>') + '</a>'
        let template = ` 
            <img id="img" src="${arr[i].img}" alt="track image" >
            <p id="duration">${mtmas(arr[i].length)}</p>
            <div id="identity">
                <a target="_blank" id='title' href="${arr[i].href}">${arr[i].name}</a>
                <div>${artists}</div>
            </div>
            <div id="other"> 
            <img id="spotify_logo"
                    src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png"
                    alt="spotify icon" />
            </div>
        `

        const container = document.createElement("div");
        container.setAttribute("id", 'template')
        container.setAttribute("track", `${arr[i].name}`)
        container.setAttribute("artist", `${arr[i].artists[0].name}`)
        container.setAttribute("art", `${arr[i].img}`)
        container.innerHTML = template
        container.addEventListener('click', (e) => {
            if (e.target.id.toString() == 'artist' || e.target.id.toString() == 'title') { return } else {
                let newurl = new URL(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port)
                newurl.pathname = '/spotifylyrics'
                newurl.searchParams.set("artist", container.getAttribute('artist'))
                newurl.searchParams.set("track", container.getAttribute('track'))
                newurl.searchParams.set("albumart", container.getAttribute('art').substring(container.getAttribute('art').lastIndexOf('/') + 1))
                window.location.href = newurl.toString()
            }
        })
        // container.addEventListener('touchstart', (e) => {
        //     if (e.target.id.toString() == 'artist' || e.target.id.toString() == 'title') { return } else {
        //         let  newurl = new URL(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port)
        //         newurl.pathname = '/spotifylyrics'
        //         newurl.searchParams.set("artist", container.getAttribute('artist'))
        //         newurl.searchParams.set("track", container.getAttribute('track'))
        //         newurl.searchParams.set("albumart", container.getAttribute('art').substring(container.getAttribute('art').lastIndexOf('/') + 1))
        //         window.location.href = newurl.toString()
        //     }
        // })
        document.getElementById('container').appendChild(container)
    }

}



PopulateSearch('a')
var call
async function searchLegit(term) {
    clearTimeout(call)
    call = setTimeout(() => { PopulateSearch(term) }, 500)
}

if (!Code()) { window.location = '/gsearch' }