import { Direction, GameEngine } from "./engine/engine";
import { useEffect, useState } from "react";

const CELL_SIZE = 15;

const history: Array<{
  timestamp: Date;
  score: number;
}> = [];

function getCellType(engine: GameEngine, x: number, y: number) {
  if (engine.isFoodAt(x, y)) {
    return "Food";
  } else if (engine.isTailAt(x, y)) {
    return "Tail";
  } else {
    return "Empty";
  }
}

function GameBoard(props: {
  rows: number;
  cols: number;
  children?: React.ReactNode;
}) {
  const width = props.cols * CELL_SIZE;
  const height = props.rows * CELL_SIZE;

  return (
    <div className="GameBoard" style={{ width, height }}>
      {props.children}
    </div>
  );
}

function Cell(props: { type: "Tail" | "Empty" | "Food" }) {
  return (
    <div
      className={"Cell " + props.type}
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
    />
  );
}

function Game({
  engine,
  onFinish,
}: {
  engine: GameEngine;
  onFinish: (score: number) => void;
}) {
  const [score, setScore] = useState(0);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    engine.run().then((result) => {
      onFinish(result.score);
    });

    const unsubscribe = engine.on("tick", (tick: number) => {
      setScore(engine.score());
      setFrame(tick);
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        engine.setDirection(Direction.LEFT);
      } else if (event.key == "ArrowRight") {
        engine.setDirection(Direction.RIGHT);
      } else if (event.key == "ArrowDown") {
        engine.setDirection(Direction.DOWN);
      } else if (event.key === "ArrowUp") {
        engine.setDirection(Direction.UP);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [engine, onFinish]);

  return (
    <>
      <header>
        <strong className="text-lg">Score: {score}</strong>
        <strong className="text-lg">Frame: {frame}</strong>
      </header>
      <GameBoard rows={engine.rows} cols={engine.cols}>
        {Array.from({ length: engine.rows }).map((_, row) => (
          <div key={row + 1 + "-row"} className="Row">
            {Array.from({ length: engine.cols }).map((_, col) => (
              <Cell
                key={row + 1 + (col + 1) + "-cell"}
                type={getCellType(engine, row, col)}
              />
            ))}
          </div>
        ))}
      </GameBoard>
      <button onClick={() => onFinish(score)}>Quit</button>
    </>
  );
}

function App() {
  const [game, setGame] = useState<GameEngine | undefined>(undefined);
  const [history, setHistory] = useState<{ score: number; timestamp: Date }[]>(
    []
  );

  function play() {
    setGame(new GameEngine());
  }

  function onFinish(score: number) {
    setGame(undefined);
    setHistory([{ score, timestamp: new Date() }, ...history]);
  }

  if (game) {
    return (
      <main className="ContentContainer">
        <Game engine={game} onFinish={onFinish} />;
      </main>
    );
  }

  return (
    <>
      <main className="ContentContainer">
        <button onClick={play}>Play</button>
        <ul>
          {history.map(({ score, timestamp }) => (
            <li key={timestamp.valueOf()}>Score: {score}</li>
          ))}
        </ul>
      </main>
    </>
  );
}

export default App;
