function downloadimage() {
    let container = document.getElementById("mainContainer");
    html2canvas(container, {
        allowTaint: true, useCORS: true, backgroundColor: null, imageTimeout: 15000
    }).then(function (canvas) {
        container.style.boxShadow = 'none'
        let link = document.createElement("a");
        document.body.appendChild(link);
        link.download = "html_image.png";
        link.href = canvas.toDataURL();
        link.target = '_blank';
        link.click();
        container.style.boxShadow = '0px 0px 20px rgba(0, 0, 0, 0.747)'
    });
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
const colorThief = new ColorThief();
const img = document.querySelector('#albumArt');
if (img.complete) {
    console.log(colorThief.getPalette(img, 10));
} else {
    img.addEventListener('load', function () {
        console.log(colorThief.getPalette(img, 10));
    });
}

function changeBackground(nodes, items) {
    for (let j = 0; j < nodes.length; j++) {
        if (items.indexOf(j) == -1) {
            nodes[j].style.backgroundColor = '#950740'
            nodes[j].style.color = 'black'
            nodes[j].style.borderInline = 'none'
        } else {
            nodes[j].style.backgroundColor = 'black'
            nodes[j].style.borderInline = '5px solid black'
            nodes[j].style.color = 'white'
        }
    }
    if (selected.length >= 5) { return }
    if (items[0] > 0) {
        nodes[items[0] - 1].style.backgroundColor = '#e3b2c5'
        nodes[items[0] - 1].style.borderInline = '5px solid #e3b2c5'
    }
    if (items[items.length - 1] < nodes.length - 1) {
        nodes[items[items.length - 1] + 1].style.backgroundColor = '#e3b2c5'
        nodes[items[items.length - 1] + 1].style.borderInline = '5px solid #e3b2c5'
    }
}

function resize() {
    let container = document.querySelector('.container');
    let containerInner = document.querySelector('.container-inner');
    let containerHeight = container.offsetHeight;
    let containerScrollHeight = containerInner.scrollHeight;
    let scrollMarker = document.querySelector('.scroll-marker');
    let colorfulStuff = document.querySelectorAll('.container-inner span'); // colorful spans from text
    colorfulStuff.forEach(function (span) { // loop to create each marker
        let spanTop = span.offsetTop;
        let spanBottom = spanTop + span.offsetHeight;
        let markerTop = Math.ceil(spanTop * containerHeight / containerScrollHeight);
        let markerBottom = Math.ceil(spanBottom * containerHeight / containerScrollHeight);
        let markerElement = document.createElement("span"); // create the marker, set color and position and put it there
        markerElement.style.backgroundColor = 'black';
        markerElement.style.top = markerTop + "px"
        markerElement.style.height = (markerBottom - markerTop + 2) + "px"
        scrollMarker.appendChild(markerElement);
    })
}
resize()
document.addEventListener("resize", (event) => { resize() });
let kids = document.getElementById('lyricsContainer').querySelectorAll('#bar')
let selected = []
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