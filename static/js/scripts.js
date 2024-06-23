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

document.getElementById('saveFinalLocations').addEventListener('click', function (event) {
    savefinalLocations('locationsUser.json');
});

document.getElementById('saveButton').addEventListener('click', function (event) {
    saveLocations('locationsAdmin.json');
});

function saveLocations(filename) {
    let locations = [];
    d3.selectAll("foreignObject").each(function () {
        let x = this.x.baseVal.value + 25;
        let y = this.y.baseVal.value + 25;

        locations.push({
            "initial x": x,
            "initial y": y,
            src: this.firstChild.src
        });
    });
    let blob = new Blob([JSON.stringify(locations, null, 2)], { type: 'application/json' });
    let url = URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function savefinalLocations(filename) {
    let locations = [];
    d3.selectAll("foreignObject").each(function () {
        let x = this.x.baseVal.value + 25;
        let y = this.y.baseVal.value + 25;

        locations.push({
            "final x": x,
            "final y": y,
            src: this.firstChild.src
        });
    });
    let blob = new Blob([JSON.stringify(locations, null, 2)], { type: 'application/json' });
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
    gallery.innerHTML = '';  // Clear existing gallery
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
        gallery.appendChild(video);
    });
}

let draggedVideos = []; 

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

    let circle = svg.append("circle")
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
            video.dataset.src = src; // Set the data-src attribute for the new video element
            video.addEventListener('dragstart', handleDragStart);

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

            // Remove the original video element from the gallery
            draggedVideo.remove();

            draggedVideos.push(foreignObject);
        }
    });

    d3.selectAll("foreignObject")
        .call(d3.drag()
            .on("drag", function (event) {
                let x = event.x - 25;
                let y = event.y - 25;
                d3.select(this)
                    .attr("x", x)
                    .attr("y", y);
            })
        );
}

function placeSavedVideos(savedLocations) {
    let svg = d3.select("svg");
    savedLocations.forEach(location => {
        let video = document.createElementNS("http://www.w3.org/1999/xhtml", "video");
        video.src = location.src;
        video.width = 50;
        video.controls = true;
        video.draggable = true;
        video.autoplay = true;
        video.loop = true;
        video.dataset.src = location.src; 
        video.addEventListener('dragstart', handleDragStart);

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

        draggedVideos.push(foreignObject);
    });
}

function loadSavedLocationsFromFile() {
    let fileInput = document.getElementById('locationFileInput');

    fileInput.addEventListener('change', function () {
        let file = fileInput.files[0];
        let reader = new FileReader();

        reader.onload = function (event) {
            try {
                let savedLocations = JSON.parse(event.target.result);
                placeSavedVideos(savedLocations);
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
