import { BOOTH_PRICES, type HudState } from "../engine/game";

type GameHudProps = {
    hud: HudState;
    onSell: () => void;
    onCloseBooth: () => void;
    onBuyAmmo: () => void;
    onBuyLife: () => void;
    onBuyTeleporter: () => void;
};

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
}

export default function GameHud({
    hud,
    onSell,
    onCloseBooth,
    onBuyAmmo,
    onBuyLife,
    onBuyTeleporter,
}: GameHudProps) {
    return (
        <>
            <aside className="pointer-events-none absolute right-4 top-4 z-10 w-56 border border-red-900/80 bg-black/75 p-4 font-mono text-sm text-zinc-100 shadow-lg shadow-black/40">
                <div className="mb-3 border-b border-red-900/70 pb-2 text-xs tracking-[0.2em] text-red-400">
                    STATUS
                </div>
                <dl className="grid grid-cols-2 gap-y-2">
                    <dt className="text-zinc-400">LIVES</dt>
                    <dd className="text-right text-red-400">{hud.lives}</dd>
                    <dt className="text-zinc-400">TIME</dt>
                    <dd className="text-right tabular-nums">{formatTime(hud.elapsedSeconds)}</dd>
                    <dt className="text-zinc-400">AMMO</dt>
                    <dd className="text-right text-amber-300">{hud.ammo}</dd>
                    <dt className="text-zinc-400">CASH</dt>
                    <dd className="text-right text-emerald-300">${hud.cash}</dd>
                    <dt className="text-zinc-400">EXIT</dt>
                    <dd className="text-right text-amber-300">{hud.hasTeleporter ? "READY" : "LOCKED"}</dd>
                </dl>

                <div className="mt-4 border-t border-red-900/70 pt-3">
                    <div className="text-xs tracking-widest text-zinc-400">CARRYING</div>
                    <div className="mt-1 text-amber-200">
                        {hud.carriedItem
                            ? `${hud.carriedItem.name} · $${hud.carriedItem.value}`
                            : "Nothing"}
                    </div>
                </div>
            </aside>

            {hud.prompt && !hud.boothOpen && (
                <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 border border-zinc-600 bg-black/80 px-5 py-3 font-mono text-sm tracking-wide text-zinc-100">
                    {hud.prompt}
                </div>
            )}

            {hud.boothOpen && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 p-4">
                    <section className="w-[min(26rem,100%)] border border-red-800 bg-zinc-950 p-6 font-mono text-zinc-100 shadow-2xl shadow-black">
                        <p className="text-xs tracking-[0.25em] text-red-400">TRADING STATION</p>
                        <h2 className="mb-6 mt-2 text-3xl font-bold tracking-widest">SELLING BOOTH</h2>

                        {hud.carriedItem ? (
                            <div className="mb-5 flex items-center justify-between border border-zinc-700 bg-black/50 p-4">
                                <span>{hud.carriedItem.name}</span>
                                <span className="text-emerald-300">${hud.carriedItem.value}</span>
                            </div>
                        ) : (
                            <p className="mb-5 border border-zinc-800 p-4 text-zinc-400">
                                You have no item to sell. Find a collection station.
                            </p>
                        )}

                        <div className="mb-6 text-sm text-zinc-400">Current cash: <span className="text-emerald-300">${hud.cash}</span></div>

                        <div className="mb-6 grid grid-cols-1 gap-2">
                            <button
                                disabled={hud.cash < BOOTH_PRICES.ammo}
                                onClick={onBuyAmmo}
                                className="flex justify-between border border-zinc-700 bg-zinc-900 px-4 py-3 text-left text-sm transition hover:border-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span>BUY AMMO <span className="text-zinc-500">(+8)</span></span>
                                <span className="text-amber-300">${BOOTH_PRICES.ammo}</span>
                            </button>
                            <button
                                disabled={hud.cash < BOOTH_PRICES.life}
                                onClick={onBuyLife}
                                className="flex justify-between border border-zinc-700 bg-zinc-900 px-4 py-3 text-left text-sm transition hover:border-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span>BUY LIFE <span className="text-zinc-500">(+1)</span></span>
                                <span className="text-red-300">${BOOTH_PRICES.life}</span>
                            </button>
                            <button
                                disabled={hud.hasTeleporter || hud.cash < BOOTH_PRICES.teleporter}
                                onClick={onBuyTeleporter}
                                className="flex justify-between border border-amber-800 bg-amber-950/30 px-4 py-3 text-left text-sm transition hover:bg-amber-900/40 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span>{hud.hasTeleporter ? "EXIT TELEPORTER UNLOCKED" : "UNLOCK EXIT TELEPORTER"}</span>
                                <span className="text-amber-300">${BOOTH_PRICES.teleporter}</span>
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button
                                disabled={!hud.carriedItem}
                                onClick={onSell}
                                className="flex-1 border border-red-700 bg-red-950/60 py-3 tracking-widest text-red-100 transition hover:bg-red-900/70 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                SELL ITEM
                            </button>
                            <button
                                onClick={onCloseBooth}
                                className="border border-zinc-700 px-5 py-3 tracking-widest text-zinc-300 transition hover:bg-zinc-800"
                            >
                                CLOSE
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {hud.escaped && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 p-4">
                    <section className="border border-amber-600 bg-zinc-950 px-12 py-10 text-center font-mono shadow-2xl shadow-black">
                        <p className="text-sm tracking-[0.3em] text-amber-400">TELEPORTER ACTIVATED</p>
                        <h2 className="mt-4 text-4xl font-bold tracking-widest text-white">YOU ESCAPED</h2>
                    </section>
                </div>
            )}
        </>
    );
}
