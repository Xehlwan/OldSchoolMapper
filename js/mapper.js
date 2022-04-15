const colorUnmarked = "#ccc";
const colorMarked = "#fff";
const colorGrid = "#444";
const colorOutline = "#000";

let mapGrid = [0][0];
let gridSize;
let width;
let height;
let canvas;
let ctx;
let dragMode = "none";
let drag = false;
let clickX;
let clickY;

$(() => {
    canvas = $("canvas#map-canvas");
    ctx = canvas[0].getContext("2d");
    let gridSizeInput = $("#map-grid-size");
    let widthInput = $("#map-grid-width");
    let heightInput = $("#map-grid-height");
    updateGridResolution();

    gridSizeInput.on("change", updateGridResolution);
    widthInput.on("change", updateGridResolution);
    heightInput.on("change", updateGridResolution);
    canvas.on("mousedown", startDrag);
    canvas.on("mouseup", stopDrag);
    canvas.on("mousemove", onMapMouseMove);
    canvas.on("mouseout", stopDrag);
});



function onMapMouseMove(event) {
    if (drag !== true) {
        return;
    }
    let cellX = Math.floor(width * event.offsetX / canvas.width());
    let cellY = Math.floor(height * event.offsetY / canvas.height());
    let cellState = mapGrid[cellX][cellY];
    // console.log("Mouse drag over cell: " + cellX + ":" + cellY);
    if (dragMode === "none") {
        dragMode = cellState === true ? "clear" : "mark";
    }
    if (dragMode === "mark" && cellState !== true) {
        markMapCell(cellX, cellY);
    }
    else if (dragMode === "clear" && cellState === true) {
        clearMapCell(cellX, cellY);
    }
}

function startDrag(event) {
    drag = true;
    clickX = event.offsetX;
    clickY = event.offsetY;
}

function stopDrag(event) {
    dragMode = "none";
    drag = false;
    if (clickX === event.offsetX && clickY === event.offsetY) {
        onMapClick(event);
    }
}

function onMapClick(event) {
    let cellX = Math.floor(width * event.offsetX / canvas.width());
    let cellY = Math.floor(height * event.offsetY / canvas.height());
    //console.log("[Click] Coord=" + event.offsetX + ":" + event.offsetY + " Cell=" + cellX + ":" + cellY);
    if (mapGrid[cellX][cellY] !== true) {
        markMapCell(cellX, cellY);
    }
    else {
        clearMapCell(cellX, cellY);
    }
}

function drawGrid(width, height) {
    ctx.fillStyle = colorUnmarked;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            traceCell(x, y, colorGrid);
        }
    }
}

function fillCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
}

function traceCell(x, y, color) {
    ctx.strokeStyle = color;
    ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
}

function drawLine(x1, y1, x2, y2, color) {
    x1 = x1 * gridSize;
    y1 = y1 * gridSize;
    x2 = x2 * gridSize;
    y2 = y2 * gridSize;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}

function markBorders(x, y, markedColor, emptyColor) {
    let nextColor;
    nextColor = (x + 1) < width && mapGrid[x + 1][y] === true ? markedColor : emptyColor;
    drawLine(x + 1, y, x + 1, y + 1, nextColor);
    nextColor = x > 0 && mapGrid[x - 1][y] === true ? markedColor : emptyColor;
    drawLine(x, y, x, y + 1, nextColor);
    nextColor = (y + 1) < height && mapGrid[x][y + 1] === true ? markedColor : emptyColor;
    drawLine(x, y + 1, x + 1, y + 1, nextColor)
    nextColor = y > 0 && mapGrid[x][y - 1] === true ? markedColor : emptyColor;
    drawLine(x, y, x + 1, y, nextColor);
}

function updateGridResolution() {
    gridSize = $("#map-grid-size").val();
    width = $("#map-grid-width").val();
    height = $("#map-grid-height").val();
    console.log("Set grid to:" + width + "x" + height + "@" + gridSize + "pps");

    canvas[0].width = gridSize * width;
    canvas[0].height = gridSize * height;

    drawGrid(width, height);
    mapGrid = new Array(width);
    for (let i = 0; i < height; i++) {
        mapGrid[i] = new Array(height);
    }
}



function markMapCell(x, y) {
    // console.log("Marking " + x + ":" + y);
    mapGrid[x][y] = true;
    fillCell(x, y, colorMarked);
    traceCell(x, y, colorOutline);
    markBorders(x, y, colorMarked, colorOutline);
}

function clearMapCell(x, y) {
    // console.log("Clearing " + x + ":" + y);
    mapGrid[x][y] = false;
    fillCell(x, y, colorUnmarked);
    traceCell(x, y, colorGrid);
    markBorders(x, y, colorOutline, colorGrid);
}