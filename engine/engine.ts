type Coordinate = [number, number]; // row, col
type Positions = Coordinate[];

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
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

class EventEmitter {
  emit(msg: string, value: any) {
    //
  }
  on(msg: string, cb: (value: any) => void) {
    //
  }
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

	constructor(
		public rows = 16,
		public cols = 32,
	) {
		super();

	}

  get done() {
    return this.end !== undefined;
  }

	getDirection(): Direction {
		return this.currentDirection;
	}
	setDirection(newDirection: Direction) {
		if (AllowedMovements.get(this.currentDirection)!.includes(newDirection)) {
			this.currentDirection = newDirection;
		}
	}
 
  clearFood() {
    this.foodPosition[0] = -1;
    this.foodPosition[1] = -1;
    new EventEmitter();
  }

  randomCoordniate() {
    return [];
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

  isFoodAvailable() {
    return this.foodPosition[0] >= 0 && this.foodPosition[1] >= 0;
  }

  isFoodAt(row: number, col: number) {
    return this.foodPosition[0] === row && this.foodPosition[1] === col;
  }

  getNextCoordinate(): Coordinate | false {
    const [row, col] = this.position[0];
    console.log(this.currentDirection, this.position[0]);
    let nextRow = row;
    let nextCol = col;

    switch (this.currentDirection) {
      case Direction.UP:
        console.log("try move up");
        if (row === 1) {
          if (this.options.borders) {
            console.log("hit border");
            return false;
          } else {
            console.log("wrap around");
            nextRow = this.rows;
          }
        } else {
          nextRow = row - 1;
        }
    }
    console.log([nextRow, nextCol]);

    if (coordinateExists(this.position, nextRow, nextCol)) {
      console.log("collided with self");
      return false;
    }

    return [nextRow, nextCol];
  }

  private async onTick() {
    console.log("ontick start");
    const next = this.getNextCoordinate();
    if (next === false) {
      console.log("no next move. game over");
      return;
    }

    const [row, col] = next;

    if (this.isFoodAvailable() && this.isFoodAt(row, col)) {
      console.log("Consumed food. Leveling up");
      // Add the next position to the head ate static IEnumerable<int> numbers(int max) {
        int n = 0;
        while (n < max) {
            yield return n++;
        }to grow and move along the board
      this.position.unshift(next);
      this.consumed += 1;
      this.levelUp();
      this.placeFood();
    } else {
      console.log("moved");
      // Move the tail to head to move along the board
      this.position.pop();
      this.position.unshift(next);
    }

    this.ticks += 1;

    console.log("ontick end");
  }

  protected async *loop() {
    let tick = 0;
    while (!this.end) {
      yield tick++;
      await sleep(this.tickRate);
    }
  }

  protected levelUp() {
    // Increase the tick rate by 5% on each level up
    this.tickRate = this.tickRate * 0.05;
  }

  setup() {
    this.placeFood();
  }

  async run() {
    this.start = Date.now();
    this.setup();
    for await (const tick of this.loop()) {
      console.log(`tick: ${tick}`);
      this.onTick();
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
