require('dotenv').config()
const express = require("express");
const fetch = require("node-fetch");
const extractLyrics = require('./modules/utils/extractLyrics')
const searchSong = require('./modules/searchSong')
const getSongById = require('./modules/getSongById')
const getLyrics = require('./modules/getLyrics')

const getPixels = require("get-pixels")
const { extractColors } = require('extract-colors')

const client_id = process.env.clientID;
const client_secret = process.env.clientSecret
const geniusApiKey = process.env.geniusApiKey
const app = express()

app.listen(5500)
app.set('view engine', 'ejs')
app.use(express.static('public'));

function redir(base) {
  let redirect_uri = base + "/response";
  let scope = "user-read-recently-played user-read-currently-playing";
  let url = "https://accounts.spotify.com/authorize";
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





app.get('/', (req, res) => { res.redirect('/home') })
app.get(/^(\/search)/, (req, res) => { res.render('search') })
app.get(/^(\/gsearch)$/, (req, res) => { res.render('gsearch') })
app.get(/^(\/privacy)/, (req, res) => { res.render('privacy') })
app.get(/^(\/about)/, (req, res) => { res.render('about') })
app.get('/home', (req, res) => { res.render('home') })
app.get('/authorize', (req, res) => { res.redirect(redir(req.protocol + '://' + req.get('host'))) })

app.get(/^(\/response)/, (req, res) => {
  let code = req.query.code || null;
  token(req.protocol + '://' + req.get('host'), code).then(function (result) {
    res.redirect('/home?access_token=' + result['access_token'])//+'&refresh='+result['refresh_token']
  })
})

app.get(/^(\/gsearchreq)/, (req, res) => {
  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  const query = decodeURI(new URL(fullUrl).searchParams.get('query'))
  console.log('asdfadsfadsgadsf')
  if (query) {
    const options = {
      apiKey: geniusApiKey,
      title: query,
      artist: '',
      optimizeQuery: true,
    }
    searchSong(options).then((r) => {
      console.log(r)
      res.status(200).json({
        ok: true,
        data: r
      });

    })
      .catch((e) => { res.status(501)({ 'server error': String(e) }) })
  }
})
app.get(/^(\/slyrics)/, (req, res) => {
  let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl)
  let params = new URLSearchParams(url.search)
  if (!(params.has('track') && params.has('artist') && params.has('fullartists'))) { res.send('unformatted url'); return }

  const track = decodeURI(params.get('track'))  // ! check if url params are encoded first
  const artist = decodeURI(params.get('artist'))
  const fullartists = decodeURI(params.get('fullartists'))

  const options = { apiKey: geniusApiKey, title: track, artist: artist, optimizeQuery: true }

  searchSong(options).then((r) => { return r[0] })
    .then((r) => { getLyrics(r.url).then((lyrics) => { res.render('lyrics', { pagelyrics: lyrics.split('\n'), title: track.replace(/\(feat.*\)/, ''), author: fullartists, art: r.albumArt }) }) })
    .catch((e) => { res.render('lyrics', { pagelyrics: ['sorry no lyrics for this one :( \n type them out yourself !'], title: 'title', author: 'artist', art: 'null' }) })
})

app.get(/^(\/glyrics)/, (req, res) => {
  let url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl)
  let params = new URLSearchParams(url.search)
  if (!(params.has('id'))) { res.send('unformatted url'); return }

  const id = decodeURI(params.get('id'))
  const artists = decodeURI(params.get('fullartists'))

  getSongById(id, geniusApiKey).then((r) => {
    res.render('lyrics', { pagelyrics: r.lyrics.split('\n'), title: r.title.replace(/\(feat.*\)/, ''), author: artists, art: r.albumArt }) 
  }).catch((e) => {
    res.status(501).json({ 'server error': String(e) })
    res.render('lyrics', { pagelyrics: ['sorry no lyrics for this one :( \n type them out yourself !'], title: 'title', author: 'artist', art: 'null' })
  })
}) 