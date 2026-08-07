import { useRef } from "react"
// import Canvas from "./components/gameCanvas"
import Game from "./engine/game"

export default function App(){

    const gameref = useRef(new Game());
    const game=gameref.current;

    return (
        <div>
            <button className="bg-blue" onClick={()=>game.start()}>
                start
            </button>
            <button className="bg-red" onClick={()=>game.stop()}>
                stop
            </button>
        </div>
    )
}