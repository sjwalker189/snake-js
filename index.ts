import { GameEngine } from "./engine/engine";

async function main() {
    const engine = new GameEngine();

    engine.on("gamestart", () => console.log("game started")) 
    engine.on("gameend", () => console.log("game ended"))
    engine.on("tick", () => console.log("tick"))
    
    const result = await engine.run();

    console.log(JSON.stringify(result, null, 2));
    process.exit(0)
}

main();

