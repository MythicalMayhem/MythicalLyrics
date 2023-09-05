function changeBackground(nodes, items) {
    for (let j = 0; j < nodes.length; j++) {
        if (items.indexOf(j) == -1) {
            nodes[j].style.backgroundColor = '#179b45ff'
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
        nodes[items[0] - 1].style.backgroundColor = 'lightgray'
        nodes[items[0] - 1].style.borderInline = '5px solid lightgray'
    }
    if (items[items.length - 1] < nodes.length - 1) {
        nodes[items[items.length - 1] + 1].style.backgroundColor = 'lightgray'
        nodes[items[items.length - 1] + 1].style.borderInline = '5px solid lightgray'
    }
}

function resize() {
    var container = document.querySelector('.container');
    var containerInner = document.querySelector('.container-inner');

    var containerHeight = container.offsetHeight;
    var containerScrollHeight = containerInner.scrollHeight;

    var scrollMarker = document.querySelector('.scroll-marker');

    var colorfulStuff = document.querySelectorAll('.container-inner span'); // colorful spans from text



    colorfulStuff.forEach(function (span) { // loop to create each marker

        var spanTop = span.offsetTop;
        var spanBottom = spanTop + span.offsetHeight;

        var markerTop = Math.ceil(spanTop * containerHeight / containerScrollHeight);
        var markerBottom = Math.ceil(spanBottom * containerHeight / containerScrollHeight);
        if (span.className === "marker") { var markerColor = 'black'; }
        var markerElement = document.createElement("span"); // create the marker, set color and position and put it there
        markerElement.style.backgroundColor = markerColor;
        markerElement.style.top = markerTop + "px"
        markerElement.style.height = (markerBottom - markerTop + 2) + "px"
        scrollMarker.appendChild(markerElement);

    })
}
resize()
addEventListener("resize", (event) => { resize() });




var kids = document.getElementById('lyricsContainer').querySelectorAll('#bar')

var selected = []
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
            var clone = kids[el].cloneNode(false)
            clone.textContent = text
            clone.className = ''
            clone.style.backgroundColor = 'transparent'
            clone.style.borderInline = 'none'
            clone.style.color = 'white'
            clone.style.margin = '5px 0'
            document.getElementById('barz').appendChild(clone)
            //var breaker = document.createElement('br')
            //document.getElementById('barz').appendChild(breaker)
        })
        if (document.getElementById('barz').hasChildNodes() == false) {
            var a = document.createElement('h3')
            a.id = 'bar'
            a.setAttribute('contenteditable', 'true')
            const text = document.createTextNode("choose or type lyrics");
            a.appendChild(text)
            document.getElementById('barz').appendChild(a)
        }
        changeBackground(kids, selected)
    })
}