require('dotenv').config()
const express = require("express");
const fetch = require("node-fetch");
const getLyrics = require('./modules/getLyrics')
const searchSong = require('./modules/searchSong') 
const client_id = process.env.clientID;
const client_secret = process.env.clientSecret
const geniusApiKey = process.env.geniusApiKey
const app = express()

app.listen(5500)
app.set('view engine', 'ejs')
app.use(express.static('public'));

function redir(base) {
  var redirect_uri = base + "/response";
  var scope = "user-read-recently-played";
  var url = "https://accounts.spotify.com/authorize";
  url += "?response_type=code";
  url += "&client_id=" + encodeURIComponent(client_id);
  url += "&scope=" + encodeURIComponent(scope);
  url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
  return url
}

async function token(base, code) {
  const params = new URLSearchParams();
  params.append("redirect_uri", base + "/response");
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("client_id", client_id);
  params.append("client_secret", client_secret);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  })
  return result.json()
}


app.get('/', (req, res) => {
  res.render('index')
})
app.get('/authorize', (req, res) => {
  res.redirect(redir(req.protocol + '://' + req.get('host')))
})
app.get(/\/edit/, (req, res) => { res.render('search') })
app.get(/\/privacy/, (req, res) => { res.render('privacy') })
app.get(/\/about/, (req, res) => { res.render('about') })


app.get(/\/response.*/, (req, res) => {
  var code = req.query.code || null;
  token(req.protocol + '://' + req.get('host'), code).then(function (result) {
    res.redirect('/edit?token=' + result['access_token'])
  })
})


app.get(/\/spotifylyrics/, (req, res) => {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  const track = decodeURI(new URL(fullUrl).searchParams.get('track'))
  const artist = decodeURI(new URL(fullUrl).searchParams.get('artist'))
  const albumart = new URL(fullUrl).searchParams.get('albumart')

  const options = {
    apiKey: geniusApiKey,
    title: track.toString(),
    artist: artist.toString(),
    optimizeQuery: true,
  }
  getLyrics(options).then((lyrics) => {
    if (lyrics) {

      let newlyrics = lyrics.split('\n')
      res.render('lyrics', { pagelyrics: newlyrics, title: track, author: artist, art: ('https://i.scdn.co/image/'+albumart) })
    } else {
      res.render('lyrics', { pagelyrics: ['sorry no lyrics for this one :( \n type them out yourself !'], title: 'title', author: 'artist', art: 'null' })
    }
  })

})

app.get(/\/geniuslyrics/, (req, res) => {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  const track = decodeURI(new URL(fullUrl).searchParams.get('track'))
  const artist = decodeURI(new URL(fullUrl).searchParams.get('artist'))
  const options = {
    apiKey: geniusApiKey,
    title: track.toString(),
    artist: artist.toString(),
    optimizeQuery: true,
  }
  searchSong(options).then((R) => { 
    opts = {
      apiKey: geniusApiKey,
      title: R[0].title,
      artist: R[0].artists,
      optimizeQuery: true,
    } 
    getLyrics(opts).then((lyrics) => {
      if (lyrics) { 
        let newlyrics = lyrics.split('\n')
        res.render('lyrics', { pagelyrics: newlyrics, title: R[0].title, author: R[0].artists, art: R[0].albumArt })
      } else {
        res.render('lyrics', { pagelyrics: ['sorry no lyrics for this one :( \n type them out yourself !'], title: 'title', author: 'artist', art: 'null' })
      }
    }).catch(()=>{res.send('timeout :(')})
  }).catch(()=>{res.send('timeout :(')})
})