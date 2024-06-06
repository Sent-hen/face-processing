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

function displayGallery(files) {
    let gallery = document.getElementById('gallery');
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

function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.src);
}

function renderCircle() {
    let circleContainer = d3.select("#circleContainer");
    let radius = 250;
    let centerX = radius + 100;
    let centerY = radius + 100;
    let containerWidth = 2 * (radius + 10) + 300;
    let containerHeight = 2 * (radius + 10) + 300;

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
        if (draggedVideo && !draggedVideo.classList.contains('used')) {
            let x = event.offsetX - 25;
            let y = event.offsetY - 25;

            let video = document.createElementNS("http://www.w3.org/1999/xhtml", "video");
            video.src = draggedVideo.src;
            video.width = 50;
            video.controls = true;
            video.draggable = true;
            video.autoplay = true;
            video.loop = true;
            video.addEventListener('dragstart', handleDragStart);

            let foreignObject = svg.append("foreignObject")
                .attr("x", x)
                .attr("y", y)
                .attr("width", 50)
                .attr("height", 50)
                .node();

            foreignObject.appendChild(video);
            draggedVideo.classList.add('used');  // Mark video as used

 v
            video.addEventListener('dragstart', function(event) {
                event.preventDefault();
            });

            video.addEventListener('drag', function(event) {
                let dx = event.clientX - event.target.clientWidth / 2;
                let dy = event.clientY - event.target.clientHeight / 2;
                event.target.style.transform = `translate(${dx}px, ${dy}px)`;
            });

            video.addEventListener('dragend', function(event) {
                event.target.style.transform = '';
            });
        }
    });
}

document.getElementById('saveButton').addEventListener('click', function () {
    let locations = [];
    d3.selectAll("foreignObject").each(function () {
        let x = this.x.baseVal.value + 25;
        let y = this.y.baseVal.value + 25;

        locations.push({
            x: x,
            y: y,
            src: this.firstChild.src
        });
    });
    let blob = new Blob([JSON.stringify(locations, null, 2)], { type: 'application/json' });
    let url = URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.href = url;
    a.download = 'locations.json';

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.addEventListener('DOMContentLoaded', renderCircle);
