import { useEffect, useRef } from "react"
import Game from "./engine/game"

export default function App(){

    const gameref = useRef(new Game());
    const canvasRef = useRef(null);
    const game=gameref.current;

    useEffect(()=>{
        if(canvasRef.current){
            game.setCanvas(canvasRef.current);
        }
    },[])

    return (
        <div className="flex flex-col justify-center items-center bg-zinc-900 h-screen">
            <div className="flex gap-4 ">
                <button className="text-red-700 bg-sky-200 rounded-sm" onClick={()=>game.start()}>
                    start
                </button>
                <button className="text-red-700 bg-sky-200 rounded-sm" onClick={()=>game.stop()}>
                    stop
                </button>
            </div>
            <div >
                <canvas ref={canvasRef} className="border-2 border-red-500">
                </canvas>
            </div>
        </div>
        
    )
}