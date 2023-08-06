const shuffle = (_array) => {
  const array = _array.slice();
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const rand = (min, max) => min + Math.floor(Math.random() * (1 + max - min));
const posToSpace = x => 2 * (x - 1) + 1;
const posToWall = x => 2 * x;

export default class Maze {
  // Original JavaScript code by Chirp Internet: www.chirpinternet.eu
  // Please acknowledge use of this code by including this header.
  constructor(height, width) {
    this.width = width;
    this.height = height;
    this.cols = 2 * this.width + 1;
    this.rows = 2 * this.height + 1;
    this.cells = this.initArray(0);

    /* place initial walls */
    this.cells.forEach((row, r) => {
      row.forEach((cell, c) => {
        switch (r) {
          case 0:
          case this.rows - 1:
            this.cells[r][c] = 1;
            break;

          default:
            if ((r % 2) === 1) {
              if ((c === 0) || (c === this.cols - 1)) {
                this.cells[r][c] = 1;
              }
            } else if (c % 2 === 0) {
              this.cells[r][c] = 1;
            }
        }
      });
    });

    // start partitioning
    this.partition(1, this.height - 1, 1, this.width - 1);

    // pick random start and end kernals
    const randomYPosition = () => Math.floor(Math.random() * ((this.height * 2) - 1)) + 1;
    const randomXPosition = () => Math.floor(Math.random() * ((this.width * 2) - 1)) + 1;
    this.start = 0;
    this.end = 0;
    const firstCol = 0;
    const afterFirstCol = firstCol + 1;
    const lastCol = this.width * 2;
    const nextToLastCol = lastCol - 1;
    const firstRow = 0;
    const afterFirstRow = firstRow + 1;
    const lastRow = this.height * 2;
    const nextToLastRow = lastRow - 1;
    while (this.cells[this.start][afterFirstCol]) this.start = randomYPosition();
    while (this.cells[this.end][nextToLastCol]) this.end = randomYPosition();
    this.cells[this.start][firstCol] = 0;
    this.cells[this.end][lastCol] = 0;

    // cut random passage through top/bottom
    this.passages = [];
    const adjacentPassageExists = passage => this.passages.indexOf(passage - 1) >= 0 || this.passages.indexOf(passage) >= 0 || this.passages.indexOf(passage + 1) >= 0;
    const doesNotConnect = randomCol => this.cells[afterFirstRow][randomCol] || this.cells[nextToLastRow][randomCol];
    const addPassage = () => {
      let randomCol = 0;
      while (doesNotConnect(randomCol) || adjacentPassageExists(randomCol)) randomCol = randomXPosition();
      this.cells[firstRow][randomCol] = 0;
      this.cells[lastRow][randomCol] = 0;
      this.passages.push(randomCol);
    };
    // add with / 5 passages
    while (this.passages.length < this.width / 5) addPassage();

    this.cells.pop();
  }

  initArray(value) {
    return new Array(this.rows).fill().map(() => new Array(this.cols).fill(value));
  }

  inBounds(r, c) {
    if ((typeof this.cells[r] === 'undefined') || (typeof this.cells[r][c] === 'undefined')) {
      return false; /* out of bounds */
    }
    return true;
  }

  partition(r1, r2, c1, c2) {
    // create partition walls, ref: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_division_method */
    let horiz;
    let vert;
    let x;
    let y;
    let start;
    let end;

    if ((r2 < r1) || (c2 < c1)) {
      return false;
    }

    if (r1 === r2) {
      horiz = r1;
    } else {
      x = r1 + 1;
      y = r2 - 1;
      start = Math.round(x + (y - x) / 4);
      end = Math.round(x + 3 * (y - x) / 4);
      horiz = rand(start, end);
    }

    if (c1 === c2) {
      vert = c1;
    } else {
      x = c1 + 1;
      y = c2 - 1;
      start = Math.round(x + (y - x) / 3);
      end = Math.round(x + 2 * (y - x) / 3);
      vert = rand(start, end);
    }

    for (let i = posToWall(r1) - 1; i <= posToWall(r2) + 1; i += 1) {
      for (let j = posToWall(c1) - 1; j <= posToWall(c2) + 1; j += 1) {
        if ((i === posToWall(horiz)) || (j === posToWall(vert))) {
          this.cells[i][j] = 1;
        }
      }
    }

    const gaps = shuffle([true, false, true, true]);
    /* create gaps in partition walls */
    if (gaps[0]) {
      const gapPosition = rand(c1, vert);
      this.cells[posToWall(horiz)][posToSpace(gapPosition)] = 0;
    }

    if (gaps[1]) {
      const gapPosition = rand(vert + 1, c2 + 1);
      this.cells[posToWall(horiz)][posToSpace(gapPosition)] = 0;
    }

    if (gaps[2]) {
      const gapPosition = rand(r1, horiz);
      this.cells[posToSpace(gapPosition)][posToWall(vert)] = 0;
    }

    if (gaps[3]) {
      const gapPosition = rand(horiz + 1, r2 + 1);
      this.cells[posToSpace(gapPosition)][posToWall(vert)] = 0;
    }

    // recursively partition newly created chambers
    this.partition(r1, horiz - 1, c1, vert - 1);
    this.partition(horiz + 1, r2, c1, vert - 1);
    this.partition(r1, horiz - 1, vert + 1, c2);
    this.partition(horiz + 1, r2, vert + 1, c2);
  }
}
