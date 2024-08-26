function downloadimage() {
    let container = document.getElementById("mainContainer");
    html2canvas(container, {
        allowTaint: true, useCORS: true, backgroundColor: null, imageTimeout: 15000
    }).then(function (canvas) {
        let link = document.createElement("a");
        document.body.appendChild(link);
        link.download = "html_image.png";
        link.href = canvas.toDataURL();
        link.target = '_blank';
        link.click();
    });
}

function getAverageRGB(imgEl) {
    let blockSize = 10, // only visit every 5 pixels
        defaultRGB = { r: 0, g: 0, b: 0 },
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'), data, width, height, i = -4, length, rgb = { r: 0, g: 0, b: 0 }, count = 0;
    if (!context) { return defaultRGB; }
    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try { data = context.getImageData(0, 0, width, height); }
    catch (e) { return defaultRGB; }
    length = data.data.length;

    while ((i += blockSize * 4) < length) { ++count; rgb.r += data.data[i]; rgb.g += data.data[i + 1]; rgb.b += data.data[i + 2]; }

    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);
    return rgb;
}
function changeBackground(nodes, items) {
    for (let j = 0; j < nodes.length; j++) {
        if (items.indexOf(j) == -1) {
            nodes[j].style.backgroundColor = 'var(--bgc)'
            nodes[j].style.borderInline = 'none'
            nodes[j].style.color = 'var(--unselected)'
        }
        else {
            nodes[j].style.backgroundColor = 'var(--selected)'
            nodes[j].style.borderInline = '5px solid ' + 'var(--selected)'
            nodes[j].style.color = 'var(--unselected)'
        }
    }
    if (selected.length >= 5) { return }
    if (items[0] > 0) {
        nodes[items[0] - 1].style.color = 'var(--selected)'
        nodes[items[0] - 1].style.backgroundColor = 'var(--unselected)'
        nodes[items[0] - 1].style.borderInline = '5px solid ' + 'var(--unselected)'
    }
    if (items[items.length - 1] < nodes.length - 1) {
        nodes[items[items.length - 1] + 1].style.color = 'var(--selected)'
        nodes[items[items.length - 1] + 1].style.backgroundColor = 'var(--unselected)'
        nodes[items[items.length - 1] + 1].style.borderInline = '5px solid ' + 'var(--unselected)'
    }
}

function resize() {
    let container = document.querySelector('.container');
    let containerInner = document.querySelector('.container-inner');
    let containerHeight = container.offsetHeight;
    let containerScrollHeight = containerInner.scrollHeight;
    let scrollMarker = document.querySelector('.scroll-marker');
    let colorfulStuff = document.querySelectorAll('.container-inner span'); // colorful spans from text

    while (scrollMarker.hasChildNodes()) { scrollMarker.removeChild(scrollMarker.firstChild) }

    colorfulStuff.forEach(function (span) { // loop to create each marker
        let spanTop = span.offsetTop;
        let spanBottom = spanTop + span.offsetHeight;
        let markerTop = Math.ceil(spanTop * containerHeight / containerScrollHeight);
        let markerBottom = Math.ceil(spanBottom * containerHeight / containerScrollHeight);
        let markerElement = document.createElement("span"); // create the marker, set color and position and put it there
        markerElement.className = 'marker'
        markerElement.style.backgroundColor = 'var(--bgcDarker)';
        markerElement.style.top = markerTop + "px"
        markerElement.style.height = (markerBottom - markerTop + 2) + "px"
        scrollMarker.appendChild(markerElement);
    })
}

let kids = document.getElementById('lyricsContainer').querySelectorAll('#bar')
let imgEl = document.getElementById('albumArt')
let selected = []



function componentToHex(c) { return c.toString(16).length == 1 ? "0" + c.toString(16) : c.toString(16); }
function rgbToHex(r, g, b) { return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b); }
function adjust(col, amt) {
    if (col[0] == "#") { col = col.slice(1); }
    let num = parseInt(col, 16);
    let r = (num >> 16) + amt; if (r > 255) { r = 255 } else if (r < 0) { r = 0 };
    let g = (num & 0x0000FF) + amt; if (g > 255) { g = 255 } else if (g < 0) { g = 0 };
    let b = ((num >> 8) & 0x00FF) + amt; if (b > 255) { b = 255 } else if (b < 0) { b = 0 }
    return "#" + (g | (b << 8) | (r << 16)).toString(16);
}
function getContrastYIQ(hexcolor) {
    var r = parseInt(hexcolor.substring(1, 3), 16);
    var g = parseInt(hexcolor.substring(3, 5), 16);
    var b = parseInt(hexcolor.substring(5, 7), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}
function fixHex(HEX) {
    if (HEX[0] == "#") { HEX = HEX.slice(1); }
    if (isNaN(HEX)) { return '#' + HEX }
    while (HEX.length < 6) { HEX += '0' }
    return '#' + HEX
}
function setColors() {
    let rgb = getAverageRGB(imgEl)
    let defaultBGC = rgbToHex(rgb.r, rgb.g, rgb.b)
    let textColor = getContrastYIQ(defaultBGC)
    if (textColor !== '#ffffff') { document.querySelector('#spotify_logo').src = 'src/Spotify_Logo_RGB_Black.png' }
    let opposite = (textColor === '#ffffff') ? '#000000' : '#ffffff';
    let r = document.querySelector(':root')

    r.style.setProperty('--bgc', fixHex(defaultBGC));
    r.style.setProperty('--bgcDarker', fixHex(adjust(defaultBGC, -50)));
    r.style.setProperty('--bgcLighter', fixHex(adjust(defaultBGC, 50)));

    r.style.setProperty('--selected', fixHex(adjust(defaultBGC, -100)));
    r.style.setProperty('--unselected', fixHex(adjust(defaultBGC, 100)));

    r.style.setProperty('--textC', fixHex(textColor));
    r.style.setProperty('--opposite', fixHex(opposite));

    changeBackground(kids, selected)
}
imgEl.onload = setColors
setColors()



resize()
document.addEventListener("resize", () => { resize() });


for (let i = 0; i < kids.length; i++) {
    const el = kids[i];
    el.addEventListener('click', (e) => {
        if (selected.length == 0) { selected = [i] }
        else if (selected.indexOf(i) != -1) {
            if (selected[0] == i) { selected.shift() }
            else if (selected[selected.length - 1] == i) { selected.pop() }
            else { selected = [] }
        } else if (selected.length < 5) { if (i - selected[selected.length - 1] == 1) { selected.push(i) } else if (selected[0] - i == 1) { selected.unshift(i) } else { selected = [i] } }
        else { selected = [i] }
        while (document.getElementById('barz').hasChildNodes()) {
            document.getElementById('barz').removeChild(document.getElementById('barz').firstChild)
        }
        selected.forEach(el => {
            const text = kids[el].textContent
            let clone = document.createElement('p')
            clone.textContent = text.trim()
            clone.id = 'bar'
            document.getElementById('barz').appendChild(clone)
        })
        if (document.getElementById('barz').hasChildNodes() == false) {
            let a = document.createElement('h3')
            a.id = 'bar'
            a.setAttribute('contenteditable', 'true')
            const text = document.createTextNode("choose or type lyrics");
            a.appendChild(text)
            document.getElementById('barz').appendChild(a)
        }
        changeBackground(kids, selected)
    })
}


const getImg = (e) => {
    const src = e.target.getAttribute('src')
    console.log(src);
    
}