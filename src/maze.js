const AISLE = 0;
const WALL = 1;
const DIRECTIONS = {
  UP: 1,
  DOWN: 2,
  LEFT: 4,
  RIGHT: 8,
};
const DIRECTION_NEXT_X = {
  UP: -1,
  DOWN: 1,
  LEFT: 0,
  RIGHT: 0,
};
const DIRECTION_NEXT_Y = {
  UP: 0,
  DOWN: 0,
  LEFT: -1,
  RIGHT: 1,
};
const DIRECTION_OPP = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const range = (start, end) => {
  const array = [];
  for (let i = start; i < end; i += 1) {
    array.push(i);
  }
  return array;
};

const shuffle = (array) => {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;
  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};

class Block {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.visited = false;
    this.dir = DIRECTIONS.DOWN | DIRECTIONS.UP | DIRECTIONS.LEFT | DIRECTIONS.RIGHT;

    this.addWall = function (direction) {
      this.dir = this.dir | DIRECTIONS[direction];
    };

    this.removeWall = function (direction) {
      this.dir = this.dir & (~DIRECTIONS[direction]);
    };

    this.setVisited = function () {
      this.visited = true;
    };

    this.getBlock = function () {
      return {
        x: this.x,
        y: this.y,
        dir: this.dir,
        downWall: (this.dir & DIRECTIONS.DOWN) !== 0,
        rightWall: (this.dir & DIRECTIONS.RIGHT) !== 0,
      };
    };
  }
}


export const generateMaze = (rows, cols) => {
  const blocks = [];
  const stack = [];

  for (const i of range(0, rows)) {
    blocks[i] = [];
    for (const j of range(0, cols)) {
      blocks[i][j] = new Block(i, j);
    }
  }
  let current = blocks[0][0];
  stack.push(current);
  current.setVisited();

  while (stack.length > 0) {
    const dirs = shuffle(Reflect.ownKeys(DIRECTIONS));
    let found = false;
    for (const dir of dirs) {
      const nextX = current.x + DIRECTION_NEXT_X[dir];
      const nextY = current.y + DIRECTION_NEXT_Y[dir];

      if ((nextX >= 0 && nextX < rows) && (nextY >= 0 && nextY < cols)) {
        const nextBlock = blocks[nextX][nextY];
        if (!nextBlock.visited) {
          current.removeWall(dir);
          nextBlock.removeWall(DIRECTION_OPP[dir]);
          nextBlock.setVisited();
          stack.push(nextBlock);
          current = nextBlock;
          found = true;
          break;
        }
      }
    }
    if (!found) {
      current = stack.pop();
    }
  }

  const walls = blocks.map(row => row.map(col => col.getBlock()));
  const maze = Array(rows * 2).fill().map(() => Array(cols * 2).fill(1));

  for (let y = 0; y < rows * 2; y += 2) {
    for (let x = 0; x < cols * 2; x += 2) {
      // maze[y][x] = 1;
      maze[y][x + 1] = walls[y / 2][x / 2].rightWall ? 0 : 1;
      maze[y + 1][x] = walls[y / 2][x / 2].downWall ? 0 : 1;
      maze[y + 1][x + 1] = walls[y / 2][x / 2].rightWall || walls[y / 2][x / 2].downWall ? 0 : 1;
      // maze[]
    }
  }
  return maze;
};
