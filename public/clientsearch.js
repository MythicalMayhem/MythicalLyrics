 
function mtmas(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
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
        var r = await result.json(); r = r["items"];
        var tlist = [];
        for (var i = 0; i < r.length; i++) { tlist.push(new trackConstruct(r[i]["track"])); }
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
        var artists = [];
        for (var j = 0; j < t.length; j++) {
            var artist = { name: t[j]["name"], link: t[j]["external_urls"]["spotify"] };
            artists.push(artist);
        }
        return artists
    }
}
function Code() {
    const params1 = new URLSearchParams(window.location.search);
    const code = params1.get("token");
    return code
}


async function PopulateSearch() {
    const arr = await search()
    document.getElementById('container').innerHTML = ''
    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        var artists = ''
        for (index of arr[i].artists) {
            artists += `<a id='artist' target="_blank" href=${index['link']}> ${index['name']},</a>`
        }
        artists = artists.slice(0, -5) + '</a>'
        artists = artists.slice(0, artists.indexOf('>') + 2) + '<small>By: </small>' + artists.slice(artists.indexOf('>') + 2, artists.length)
        var template = `
        
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
            if (e.target.id.toString() == 'artist' || e.target.id.toString() == 'title' ){return}else { 
                var newurl = new URL(window.location.protocol+'//'+window.location.hostname+':'+window.location.port)
                newurl.pathname = '/spotifylyrics'
                newurl.searchParams.set("artist",container.getAttribute('artist'))
                newurl.searchParams.set("track" ,container.getAttribute('track'))
                newurl.searchParams.set("albumart" ,container.getAttribute('art').substring(container.getAttribute('art').lastIndexOf('/')+1))
                window.location.href = newurl.toString()
            } 
        })
        container.addEventListener('touchstart', (e) => { 
            if (e.target.id.toString() == 'artist' || e.target.id.toString() == 'title' ){return}else { 
                var newurl = new URL(window.location.protocol+'//'+window.location.hostname+':'+window.location.port)
                newurl.pathname = '/spotifylyrics'
                newurl.searchParams.set("artist",container.getAttribute('artist'))
                newurl.searchParams.set("track" ,container.getAttribute('track'))
                newurl.searchParams.set("albumart" ,container.getAttribute('art').substring(container.getAttribute('art').lastIndexOf('/')+1))
                window.location.href = newurl.toString()
            } 
        })
        document.getElementById('container').appendChild(container)
    }

}
async function search() {
    const searchterm = document.getElementById('searcher').value.trim() 
    try {
        if (searchterm.startsWith('https://open.spotify.com/track/')) {
            const id = searchterm.split('track/')[1].split('?')[0]
            const result = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
                method: "GET", headers: { Authorization: `Bearer ${Code()}` }
            })
            var r = await result.json();
            return [new trackConstruct(r)]
        }
        else {
            var url = "https://api.spotify.com/v1/search?";
            url += "q=" + encodeURIComponent(searchterm);
            url += '&type=track&limit=20'
            const result = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${Code()}` } })
            var r = await result.json();
            var queries = r['tracks']['items']
            var returner = []
            for (var i = 0; i < queries.length; i++) {
                returner.push(new trackConstruct(queries[i]))
            }
            return returner
        }

    } catch (error) {
        var url = "https://api.spotify.com/v1/search?";
        url += "q=" + encodeURIComponent(searchterm);
        url += '&type=track&limit=8'
        const result = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${Code()}` } })
        var r = await result.json();
        var queries = r['tracks']['items']
        var returner = []
        for (var i = 0; i < queries.length; i++) {
            returner.push(new trackConstruct(queries[i]))
        }
        return returner
    }
}


async function getPlaylists(token) {
    const result = await fetch("https://api.spotify.com/v1/me/playlists?&limit=50", { method: "GET", headers: { Authorization: `Bearer ${token}` } });
    var playlists = [];
    var res = await result.json();
    res = res["items"];
    for (var i = 0; i < res.length; i++) {
        var pl = new playlistConstruct(res[i]);
        pl.tracks = pl.getTrackLink(token);
        playlists.push(pl);
    } return playlists
}
var code = Code()
//var res = getPlaylists(code)
//console.log(res)