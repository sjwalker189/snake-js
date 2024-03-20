import { EventEmitter } from "./event-emitter";

type Coordinate = [number, number]; // row, col
type Positions = Coordinate[];

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const AllowedMovements = new Map<Direction, Direction[]>([
  [Direction.UP, [Direction.LEFT, Direction.RIGHT]],
  [Direction.DOWN, [Direction.LEFT, Direction.RIGHT]],
  [Direction.LEFT, [Direction.UP, Direction.DOWN]],
  [Direction.RIGHT, [Direction.UP, Direction.DOWN]],
]);

export class GameEngine extends EventEmitter {
  /** game controls */
  start: number | undefined;
  end: number | undefined;
  tickRate = 500;
 
  options = {
    borders: true,
  };

  /** food */
  consumed = 0;
  foodPosition: Coordinate = [-1, -1];

  /** snake */
  currentDirection = Direction.UP;

  position: Positions = [
    [8, 16],
    [8, 17],
    [8, 18],
  ];

  private locked = false;

  constructor(
    public rows = 16,
    public cols = 32,
  ) {
    super();
  }

  private lock() {
    this.locked = true;
  }

  private unlock() {
    this.locked = false;
  }

  score() {
    return this.consumed * 10;
  }

  getDirection(): Direction {
    return this.currentDirection;
  }

  setDirection(newDirection: Direction) {
    if (this.locked) {
      return;
    }

    if (AllowedMovements.get(this.currentDirection)!.includes(newDirection)) {
      this.currentDirection = newDirection;
    }
  }

  clearFood() {
    this.foodPosition[0] = -1;
    this.foodPosition[1] = -1;
  }

  placeFood() {
    const row = randomInt(0, this.rows);
    const col = randomInt(0, this.cols);

    if (coordinateExists(this.position, row, col)) {
      this.placeFood();
      return;
    }

    this.foodPosition[0] = row;
    this.foodPosition[1] = col;
  }

  isFoodAt(row: number, col: number) {
    return this.foodPosition[0] === row && this.foodPosition[1] === col;
  }

  getNextCoordinate(): Coordinate | false {
    const [row, col] = this.position[0];
    let nextRow = row;
    let nextCol = col;

    switch (this.currentDirection) {
      case Direction.UP:
        if (row === 1) {
          if (this.options.borders) {
            return false;
          } else {
            nextRow = this.rows;
          }
        } else {
          nextRow = row - 1;
        }
      case Direction.DOWN:
        if (row === this.rows) {
          if (this.options.borders) {
            return false;
          } else {
            nextRow = 1;
          }
        } else {
          nextRow = row + 1;
        }
      case Direction.LEFT:
        if (col === 1) {
          if (this.options.borders) {
            return false;
          } else {
            nextCol = this.cols;
          }
        } else {
          nextCol = col - 1;
        }
      case Direction.RIGHT:
        if (col === this.cols) {
          if (this.options.borders) {
            return false;
          } else {
            nextCol = 1;
          }
        } else {
          nextCol = col + 1;
        }
    }

    if (coordinateExists(this.position, nextRow, nextCol)) {
      console.log("collided with self");
      return false;
    }

    return [nextRow, nextCol];
  }

  private async onTick() {
    const next = this.getNextCoordinate();
    if (next === false) {
      this.emit("gameover");
      return;
    }

    const [row, col] = next;

    if (this.isFoodAt(row, col)) {
      // Add the next position to the head to grow and move along the board
      this.position.unshift(next);
      this.consumed += 1;
      this.levelUp();
      this.placeFood();
    } else {
      // Move the tail to head to move along the board
      this.position.pop();
      this.position.unshift(next);
    }

    this.ticks += 1;
    this.emit("move");
  }

  protected async *loop() {
    // TODO: Calculate frame deltas to ensure a consistent tick rate
    let tick = 0;
    while (!this.end) {
      yield tick++;
      await sleep(this.tickRate);
    }
  }

  protected levelUp() {
    // Increase the tick rate by 5% on each level up
    this.tickRate = this.tickRate * 0.05;
    this.emit("levelup");
  }

  setup() {
    this.placeFood();
  }

  async run() {
    this.start = Date.now();
    this.emit("gamestart");
    this.setup();

    let lastTick = 0;
    for await (const tick of this.loop()) {
      this.lock();
      this.emit("tick", tick);
      this.onTick();
      this.unlock();
      lastTick = tick;
    }

    this.emit("gameend");

    return {
      score: this.score(),
      consumed: this.consumed,
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}


function randomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function coordinateExists(items: Positions, row: number, col: number) {
  return (
    items.findIndex(
      ([cellRow, cellCol]) => cellRow === row && cellCol === col,
    ) >= 0
  );
}