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
/*
function renderCircle() {
    let circleContainer = d3.select("#circleContainer");
    let radius = 250;
    let centerX = radius + 10;
    let centerY = radius + 10;

    circleContainer.selectAll("*").remove();  // Clear any existing elements

    let svg = circleContainer.append("svg")
        .attr("width", 2 * (radius + 10))
        .attr("height", 2 * (radius + 10));

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
            let angle = Math.atan2(event.offsetY - centerY, event.offsetX - centerX);
            let x = centerX + (radius + 30) * Math.cos(angle); // Adjust distance from the circle
            let y = centerY + (radius + 30) * Math.sin(angle); // Adjust distance from the circle

            let video = document.createElementNS("http://www.w3.org/1999/xhtml", "video");
            video.src = draggedVideo.src;
            video.width = 50;
            video.controls = true;
            video.draggable = true;
            video.autoplay = true;
            video.loop = true;
            video.addEventListener('dragstart', handleDragStart);

            let foreignObject = svg.append("foreignObject")
                .attr("x", x - 25)
                .attr("y", y - 25)
                .attr("width", 50)
                .attr("height", 50)
                .node();

            foreignObject.appendChild(video);
            draggedVideo.classList.add('used');  // Mark video as used

            // Enable moving the video after placing it down
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
*/
function renderCircle() {
    let circleContainer = d3.select("#circleContainer");
    let radius = 250;
    let centerX = radius + 100;
    let centerY = radius + 100;
    let containerWidth = 2 * (radius + 10) + 300;
    let containerHeight = 2 * (radius + 10) + 300;

    circleContainer.selectAll("*").remove();

    let svg = circleContainer.append("svg")
        .attr("width", containerWidth) // Set the width of the container
        .attr("height", containerHeight); // Set the height of the container

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
            let angle = Math.atan2(event.offsetY - centerY, event.offsetX - centerX);
            let x = centerX + (radius + 20) * Math.cos(angle); // Adjust distance from the circle
            let y = centerY + (radius + 20) * Math.sin(angle); // Adjust distance from the circle

            let video = document.createElementNS("http://www.w3.org/1999/xhtml", "video");
            video.src = draggedVideo.src;
            video.width = 50;
            video.controls = true;
            video.draggable = true;
            video.autoplay = true;
            video.loop = true;
            video.addEventListener('dragstart', handleDragStart);

            let foreignObject = svg.append("foreignObject")
                .attr("x", x - 25)
                .attr("y", y - 25)
                .attr("width", 50)
                .attr("height", 50)
                .node();

            foreignObject.appendChild(video);
            draggedVideo.classList.add('used');  // Mark video as used

            // Enable moving the video after placing it down
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
        let angle = Math.atan2(this.y.baseVal.value + 25 - 260, this.x.baseVal.value + 25 - 260) * 180 / Math.PI;

        // Convert negative angles to 0-360 range
        angle = (angle + 360) % 360;

        locations.push({
            angle: angle,
            src: this.firstChild.src
        });
    });
    fetch('/save_locations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(locations)
    }).then(response => response.json())
      .then(data => {
          console.log(data.message);
      });
});

document.addEventListener('DOMContentLoaded', renderCircle);
