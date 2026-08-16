import { useEffect, useRef, useState } from "react";
import Game from "./engine/game";

export default function App() {
    const gameRef = useRef(new Game());
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [screen, setScreen] = useState<"menu" | "game" | "options">("menu");
    const [paused, setPaused] = useState(false);

    const game = gameRef.current;

    useEffect(() => {
        game.onPauseChange = setPaused;

        return () => {
            game.onPauseChange = null;
        };
    }, [game]);

    useEffect(() => {
        if (screen === "game" && canvasRef.current) {
            game.setCanvas(canvasRef.current);
            game.start();
        }
    }, [screen, game]);

    if (screen === "game") {
        return (
            <div className="relative h-screen w-screen bg-black">

                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                />

                {paused && (
                    <div className="
                        absolute inset-0
                        bg-black/70
                        flex items-center justify-center
                    ">
                        <div className="w-96 text-center">

                            <h1 className="
                                text-5xl
                                font-bold
                                tracking-[0.2em]
                                text-white
                                mb-12
                            ">
                                PAUSED
                            </h1>

                            <div className="flex flex-col gap-4">

                                <button
                                    onClick={() => game.resume()}
                                    className="
                                        w-full py-4
                                        bg-zinc-900
                                        border border-zinc-700
                                        text-zinc-200
                                        tracking-widest
                                        hover:bg-zinc-800
                                    "
                                >
                                    RESUME
                                </button>

                                <button
                                    onClick={() => {
                                        game.stop();
                                        setPaused(false);
                                        setScreen("menu");
                                    }}
                                    className="
                                        w-full py-4
                                        bg-zinc-900
                                        border border-zinc-700
                                        text-zinc-200
                                        tracking-widest
                                        hover:bg-zinc-800
                                    "
                                >
                                    QUIT TO MENU
                                </button>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (screen === "options") {
        return (
            <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-96 text-center">

                    <h1 className="text-4xl text-white tracking-widest mb-10">
                        OPTIONS
                    </h1>

                    <button
                        onClick={() => setScreen("menu")}
                        className="
                            w-full py-4
                            border border-zinc-700
                            text-zinc-200
                            hover:bg-zinc-800
                        "
                    >
                        BACK
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center">
            <div className="w-96 text-center">

                <h1 className="
                    text-6xl
                    font-bold
                    tracking-[0.2em]
                    text-white
                ">
                    RAYCAST
                </h1>

                <p className="
                    text-zinc-500
                    text-sm
                    tracking-[0.3em]
                    uppercase
                    mt-2
                    mb-16
                ">
                    Enter the world
                </p>

                <div className="flex flex-col gap-4">

                    <button
                        onClick={() => setScreen("game")}
                        className="
                            w-full py-4
                            bg-zinc-900
                            border border-zinc-700
                            text-zinc-200
                            text-lg
                            tracking-widest
                            hover:bg-zinc-800
                            hover:border-zinc-500
                            transition
                        "
                    >
                        PLAY
                    </button>

                    <button
                        onClick={() => setScreen("options")}
                        className="
                            w-full py-4
                            bg-zinc-900
                            border border-zinc-700
                            text-zinc-200
                            text-lg
                            tracking-widest
                            hover:bg-zinc-800
                            hover:border-zinc-500
                            transition
                        "
                    >
                        OPTIONS
                    </button>

                </div>

                <p className="mt-16 text-xs text-zinc-700 tracking-widest">
                    v0.1.0
                </p>

            </div>
        </div>
    );
}