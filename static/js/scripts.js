document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    let formData = new FormData(this);
    fetch('/upload', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
      .then(data => {
          console.log(data.message);
          displayGallery(data.files);
      });
});

document.getElementById('saveFinalLocations').addEventListener('click', function () {
    saveLocations('locationsUser.json', 'final x', 'final y');
});

document.getElementById('saveButton').addEventListener('click', function () {
    saveLocations('locationsAdmin.json', 'initial x', 'initial y');
});

let selectedVideo = null;

function saveLocations(filename, xLabel, yLabel) {
    let locations = [];
    d3.selectAll("foreignObject").each(function () {
        let x = this.x.baseVal.value + 25;
        let y = this.y.baseVal.value + 25;

        locations.push({
            [xLabel]: x,
            [yLabel]: y,
            src: this.firstChild.src
        });
    });
    let questionText = document.getElementById('question').innerText;
    let dataToSave = { locations, question: questionText };
    let blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    let url = URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function displayGallery(files) {
    let gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    files.forEach(file => {
        let video = document.createElement('video');
        video.src = '/uploads/' + file;
        video.width = 100;
        video.controls = true;
        video.draggable = true;
        video.dataset.src = file;
        video.autoplay = true;
        video.loop = true;
        video.addEventListener('dragstart', handleDragStart);
        video.addEventListener('click', handleVideoClick);
        gallery.appendChild(video);
    });

    updateCoordinatesBlock();
}

function handleVideoClick(event) {
    selectedVideo = event.target;
    document.getElementById('coordinateInput').style.display = 'block';
    document.getElementById('xCoord').value = selectedVideo.parentElement.x.baseVal.value;
    document.getElementById('yCoord').value = selectedVideo.parentElement.y.baseVal.value;
}

function setCoordinatesForSelectedVideo(x, y) {
    if (selectedVideo) {
        d3.select(selectedVideo.parentElement)
            .attr("x", x)
            .attr("y", y);
        document.getElementById('coordinateInput').style.display = 'none';
        selectedVideo = null;
        updateCoordinatesBlock();
    }
}

function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.src);
}

function renderCircle() {
    let circleContainer = d3.select("#circleContainer");
    let radius = 250;
    let centerX = radius + 100;
    let centerY = radius + 100;
    let containerWidth = 2 * (radius + 10) + 200;
    let containerHeight = 2 * (radius + 10) + 200;

    circleContainer.selectAll("*").remove();

    let svg = circleContainer.append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight);

    svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", radius)
        .style("fill", "none")
        .style("stroke", "#000");

    svg.on("dragover", function (event) {
        event.preventDefault();
    });

    svg.on("drop", function (event) {
        event.preventDefault();
        let src = event.dataTransfer.getData('text/plain');
        let draggedVideo = document.querySelector(`video[data-src='${src}']`);
        if (draggedVideo) {
            let x = event.offsetX - 25;
            let y = event.offsetY - 25;

            let video = document.createElementNS("http://www.w3.org/1999/xhtml", "video");
            video.src = draggedVideo.src;
            video.width = 50;
            video.controls = true;
            video.draggable = true;
            video.autoplay = true;
            video.loop = true;
            video.dataset.src = src;
            video.addEventListener('dragstart', handleDragStart);
            video.addEventListener('click', handleVideoClick);

            let foreignObject = svg.append("foreignObject")
                .attr("x", x)
                .attr("y", y)
                .attr("width", 50)
                .attr("height", 50)
                .call(d3.drag()
                    .on("drag", function (event) {
                        d3.select(this)
                            .attr("x", event.x - 25)
                            .attr("y", event.y - 25);
                    })
                ).node();

            foreignObject.appendChild(video);
            draggedVideo.remove();
            updateCoordinatesBlock();
        }
    });
}

function updateCoordinatesBlock() {
    let coordinatesBlock = document.getElementById('coordinatesBlock');
    coordinatesBlock.innerHTML = '';

    d3.selectAll("foreignObject").each(function () {
        let x = this.x.baseVal.value + 25;
        let y = this.y.baseVal.value + 25;
        let src = this.firstChild.src;

        let div = document.createElement('div');
        div.className = 'coordinate-item';

        let video = document.createElement('video');
        video.src = src;
        video.width = 50;
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        div.appendChild(video);

        let xLabel = document.createElement('label');
        xLabel.innerText = 'X:';
        div.appendChild(xLabel);

        let xInput = document.createElement('input');
        xInput.type = 'number';
        xInput.value = x;
        xInput.addEventListener('change', function () {
            setCoordinatesForVideo(src, xInput.value, yInput.value);
        });
        div.appendChild(xInput);

        let yLabel = document.createElement('label');
        yLabel.innerText = 'Y:';
        div.appendChild(yLabel);

        let yInput = document.createElement('input');
        yInput.type = 'number';
        yInput.value = y;
        yInput.addEventListener('change', function () {
            setCoordinatesForVideo(src, xInput.value, yInput.value);
        });
        div.appendChild(yInput);

        coordinatesBlock.appendChild(div);
    });
}

function setCoordinatesForVideo(src, x, y) {
    d3.selectAll("foreignObject").each(function () {
        if (this.firstChild.src === src) {
            d3.select(this)
                .attr("x", x - 25)
                .attr("y", y - 25);
        }
    });
}

function placeSavedVideos(savedData) {
    let svg = d3.select("svg");
    savedData.locations.forEach(location => {
        let video = document.createElementNS("http://www.w3.org/1999/xhtml", "video");
        video.src = location.src;
        video.width = 50;
        video.controls = true;
        video.draggable = true;
        video.autoplay = true;
        video.loop = true;
        video.dataset.src = location.src;
        video.addEventListener('dragstart', handleDragStart);
        video.addEventListener('click', handleVideoClick);

        let foreignObject = svg.append("foreignObject")
            .attr("x", location["initial x"] - 25)
            .attr("y", location["initial y"] - 25)
            .attr("width", 50)
            .attr("height", 50)
            .call(d3.drag()
                .on("drag", function (event) {
                    d3.select(this)
                        .attr("x", event.x - 25)
                        .attr("y", event.y - 25);
                })
            ).node();

        foreignObject.appendChild(video);
    });

    document.getElementById('question').innerText = savedData.question;
    updateCoordinatesBlock();
}

function loadSavedLocationsFromFile() {
    let fileInput = document.getElementById('locationFileInput');
    fileInput.addEventListener('change', function () {
        let file = fileInput.files[0];
        let reader = new FileReader();

        reader.onload = function (event) {
            try {
                let savedData = JSON.parse(event.target.result);
                placeSavedVideos(savedData);
            } catch (error) {
                console.error('Error parsing saved locations:', error);
            }
        };

        reader.readAsText(file);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    renderCircle();
    loadSavedLocationsFromFile();
});
