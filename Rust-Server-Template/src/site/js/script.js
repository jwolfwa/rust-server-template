let body = document.getElementsByTagName('body')[0];

// Links to blue and red images
const imageSources = {
    red : 'assets/man-silhouette-red-hi.png',
    blue : 'assets/man-silhouette-blue-hi.png'
};

// Function to load images
const images = [];
function loadImages(sources, callback) {
    let loadedCount = 0;

    sources.forEach((source, index) => {
        const img = new Image();
        img.onload = () => {
            images[index] = img;
            loadedCount++;
            if (loadedCount === sources.length) {
                callback();
            }
        };
        img.src = imageSources[source];
    });
}

// Randomly Generate blue and red people
function generateGrid(size) {
    var grid = []
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        // Assign red or blue randomly, can adjust probabilities for clustering
        grid[(i*size) + j] = Math.random() < 0.5 ? 'red' : 'blue';
      }
    }
    return grid;
  }


// Draw the grid and images
function drawGrid(ctx, size, gridSize) {
    // Draw the grid
    for (let col = 0; col < size; col++) {
        
        for (let row = 0; row < size; row++) {
            const x = col * gridSize;
            const y = row * gridSize;

            // Center and resize the image in the grid space
            const imgIndex = col + row * size;
            if (images[imgIndex]) {
                const img = images[imgIndex];
                const maxImageSize = Math.min(gridSize, gridSize); // Fit the image into the smaller dimension
                const aspectRatio = img.width / img.height;
                let drawWidth = maxImageSize;
                let drawHeight = maxImageSize;

                if (aspectRatio < 1) {
                    drawWidth *= aspectRatio;
                } else {
                    drawHeight /= aspectRatio;
                }

                const imgX = x + (gridSize - drawWidth) / 2;
                const imgY = y + (gridSize - drawHeight) / 2;

                ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);
            }
        }
    }
}

// Create the canvases, and Initialize all event listeners
const startForm = document.getElementById('startForm')
function gameInit(size){
    startForm.style.display = "none";

    const canvasContainer = document.createElement('div');

    // background Canvas
    const backgroundCanvas = document.createElement('canvas');
    canvasContainer.appendChild(backgroundCanvas);
    const backgroundCtx = backgroundCanvas.getContext('2d');
    
    backgroundCanvas.width = 500;
    backgroundCanvas.height = 500;
    backgroundCanvas.style.top = 0;
    backgroundCanvas.style.left = 0;
    backgroundCanvas.style.position = "absolute";
    body.appendChild(backgroundCanvas);

    // Normal Canvas
    const canvas = document.createElement('canvas');
    canvasContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    canvas.width = 500;
    canvas.height = 500;
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = 1;
    canvas.style.position = "absolute";

    // Calculate the size of each grid space
    var gridSize = canvas.width / size;
    ctx.lineWidth = .05;
    ctx.strokeStyle = "#000000"

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 1; i < size; i++){
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.closePath()
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.closePath()
        ctx.stroke();
    }

    var info = generateGrid(size);

    loadImages(info, () => {
        drawGrid(ctx, size, gridSize);
    });


    // Append the canvas element to the body
    body.appendChild(canvas);

    
    // Shade a square with black when clicked
    document.addEventListener('mousedown', function(event) {
        if (event.button === 0) { // Left mouse button
            isMouseDown = true;
            const canvasRect = backgroundCanvas.getBoundingClientRect();
            const mouseX = event.clientX - canvasRect.left;
            const mouseY = event.clientY - canvasRect.top;

            if (mouseX >= 0 && mouseY >= 0 && mouseX < backgroundCanvas.width && mouseY < backgroundCanvas.height) {
                const squareX = Math.floor(mouseX / gridSize);
                const squareY = Math.floor(mouseY / gridSize);

                // Fill the square
                shadeSquare(squareX, squareY, 'black');
            }
        }
    });

    // Fill out a county on right click
    document.addEventListener('contextmenu', function(event) {
        // Prevent the default right-click menu from appearing
        event.preventDefault();
        const canvasRect = backgroundCanvas.getBoundingClientRect();
        const mouseX = event.clientX - canvasRect.left;
        const mouseY = event.clientY - canvasRect.top;
        const squareX = Math.floor(mouseX / gridSize);
        const squareY = Math.floor(mouseY / gridSize);

        // Fill the square
        let newCounty = markCounty(size, shadedCoords, [squareX, squareY]);

        for (let [x, y] of newCounty) {
            shadeSquare(x, y, 'green');
        }
    });

    document.addEventListener('mouseup', function(event) {
        if (event.button === 0) { // Left mouse button
            isMouseDown = false;
            isMouseUp = true;
        }
    });

    // Shade square with black on mouse move
    document.addEventListener('mousemove', function(event) {
    if (isMouseDown) {
        const canvasRect = backgroundCanvas.getBoundingClientRect();

        const mouseX = event.clientX - canvasRect.left;
        const mouseY = event.clientY - canvasRect.top;

        if (mouseX >= 0 && mouseY >= 0 && mouseX < backgroundCanvas.width && mouseY < backgroundCanvas.height) {
            const squareX = Math.floor(mouseX / gridSize);
            const squareY = Math.floor(mouseY / gridSize);

            // Fill the square
            shadeSquare(squareX, squareY);
        }
    }
    });

    var shadedCoords = new Set();
    
    // Shade in a square in a desired color
    function shadeSquare(squareX, squareY, color) {
        let x = squareX * gridSize;
        let y = squareY * gridSize;

        backgroundCtx.fillStyle = color;

        shadedCoords.add([squareX,squareY]);

        backgroundCtx.fillRect(x, y, gridSize, gridSize);
    }

}

 // Boolean variables to track mouse state
 let isMouseDown = false;
 let isMouseUp = false;
 


function markCounty(size, blackCoordinates, whiteCoordinate) {
    // Initialize the grid with all white spaces (0s)
    let grid = new Array(size*size).fill().map(() => new Array(size*size).fill(0));
    
    // Mark black coordinates on the grid
    for (let [r, c] of blackCoordinates) {
        grid[r][c] = 1; // Assuming 1 represents black
    }
    
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
    
    // Function to perform BFS from the given white coordinate
    function bfs(startRow, startCol) {
        let queue = [[startRow, startCol]];
        let enclosedCoords = new Set();
        enclosedCoords.add(startRow + ',' + startCol);
        grid[startRow][startCol] = -1; // Mark as visited
        
        while (queue.length > 0) {
            let [r, c] = queue.shift();
            
            for (let [dr, dc] of directions) {
                let nr = r + dr;
                let nc = c + dc;
                
                // Check if neighbor is within bounds and is white space
                if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 0) {
                    if (!enclosedCoords.has(nr + ',' + nc)) {
                        enclosedCoords.add(nr + ',' + nc);
                        queue.push([nr, nc]);
                        grid[nr][nc] = -1; // Mark as visited
                    }
                }
            }
        }
        
        return enclosedCoords;
    }
    
    // Extract row and column from whiteCoordinate
    let [whiteRow, whiteCol] = whiteCoordinate;
    
    // Perform BFS from the white coordinate
    let enclosedCoordinates = bfs(whiteRow, whiteCol);
    
    // Convert enclosedCoordinates set to array
    let enclosedCoordsArray = Array.from(enclosedCoordinates).map(coord => {
        let [r, c] = coord.split(',').map(Number);
        return [r, c];
    });
    
    return enclosedCoordsArray;
}
