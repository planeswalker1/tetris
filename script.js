console.log("Hello");

// grab canvas
const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

// scale canvas
context.scale(20, 20);

// collect rows
function arenaSweep () {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      // check if any rows have 0
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    // take arena row out at index y and fill with 0 and save row into var then later put on top of arena
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    // when swept row
    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

// colission detection function
function collide (arena, player) {
  // break out the player matrix and player position
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      // iterating over player
      // check matrix of player y row and x col is not 0
      // check if arena is not 0
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
          arena[y + o.y][x + o.x]) !== 0) {
            return true;
          }
    }
  }
  return false;
}

// draw matrix  where we save all pieces
function createMatrix (w, h) {
  const matrix = [];
  // while h is not 0
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// data structure for tetris pieces
// create pieces
function createPiece (type) {
  if (type === "T") {
    return [
      // T
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
  } else if (type === "O") {
    return [
      // O
      [2, 2],
      [2, 2],
    ];
  } else if (type = "L") {
    return [
      // L
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3],
    ];
  } else if (type = "J") {
    return [
      // J
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0],
    ];
  } else if (type = "I") {
    return [
      // I
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
    ];
  } else if (type = "S") {
    return [
      // S
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ];
  } else if (type = "Z") {
    return [
      // Z
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ];
  }
}

// draw pieces
function draw () {
  // clear canvas
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  // draw piece hits edge or another piece
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

function drawMatrix (matrix, offset) {
  // draw piece
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x,
                         y + offset.y,
                         1, 1);
      }
    });
  });
}

// merge function: copy all values from player into arena at correct position
function merge (arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function playerDrop () {
  player.pos.y++;
  // if we drop and collide meaning we are touching the ground or another piece
  if (collide(arena, player)) {
    // when a piece hits bottom we start from the beginning again
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  // reset drop counter bc if we press down we dont want another drop to happen we want that extra delay of a sec
  dropCounter = 0;
}

// if piece hits edges of arena so it doesn't sitck or go over edge
function playerMove (dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

//get random piece
function playerReset () {
  // list available pieces in string
  const pieces = "IJLOSTZ"
  // pick piece randomly
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  // position piece top center
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  // check if game is over
  if (collide(arena, player)) {
    // fill row with 0
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

// implement player rotate
function playerRotate (dir) {
  const pos = player.pos.x;
  let offset = 1;

  rotate(player.matrix, dir);
  // check collision move piece right or left to see if clear edge
  while (collide(arena, player)) {
    player.pos.x += offset;
    // goes up by 1 then negate
    offset = -(offset + (offset > 0 ? 1 : -1));
    // bail if doesn't work
    if (offset > player.matrix[0].length) {
      //we move so much that it doesnt make sense so we rotate back
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

// transpose (convert all rows into columns) + reverse (each row) = rotation
function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      // an aside <!--
      // crash course for tupal switch
      // traditional way
      // imagine 2 var
      // let a = "AAA";
      // let b = "BBB";
      // switch places
      // var temp = a;
      // a = b;
      // b = temp;
      // console.log(a, b);
      // new way
      // [a, b] = [b, a]
      // console.log(a, b);
      // -->
      [
        matrix[x][y],
        matrix[y][x]
      ] = [
        matrix[y][x],
        matrix[x][y]
      ];
    }
  }
  // check direction
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

//<!-- every 1 sec drop piece one step
let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update (time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  //-->
  // draw piece
  draw();
  // draw/update continuosly
  requestAnimationFrame(update);
}

// put score
function updateScore () {
  document.getElementById("score").innerText = player.score;
}

// map colors for pieces
const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF',
];

const arena = createMatrix(12, 20);

// player
const player = {
  // pos = position
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0
}

// keyboard controls
document.addEventListener('keydown', event => {
  // check keyCode
  // console.log(event);
  // move left
  if (event.keyCode === 37) {
    playerMove(-1);
    // move right
  } else if (event.keyCode === 39) {
    playerMove(1);
    // move down
  } else if (event.keyCode === 40) {
    playerDrop();
    //rotate left (q)
  } else if (event.keyCode === 81) {
    playerRotate(-1);
    // rotate right (w)
  } else if (event.keyCode === 87) {
    playerRotate(1);
  }
});

playerReset();
updateScore();
// initialize game
update();
