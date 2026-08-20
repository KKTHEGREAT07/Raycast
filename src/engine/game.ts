import Player from "../world/player";
import Input from "./input";
import Canvas from "../components/gameCanvas";
import AudioManager from "./audio";
import { WALL_TEXTURE_IDS } from "../world/wallTextures";

export { WALL_TEXTURE_IDS } from "../world/wallTextures";

export type HudState = {
    lives: number;
    ammo: number;
    cash: number;
    elapsedSeconds: number;
    carriedItem: { name: string; value: number } | null;
    prompt: string;
    boothOpen: boolean;
    hasTeleporter: boolean;
    escaped: boolean;
};

export const BOOTH_PRICES = {
    ammo: 2,
    life: 10,
    teleporter: 50,
} as const;

export default class game{
    
    prevTimeStamp:number;
    running:boolean;
    player:Player;
    input:Input;
    audio = new AudioManager();
    canvas:Canvas|null=null;
    paused:boolean;
    onPauseChange: ((paused: boolean) => void) | null = null;
    onHudChange: ((hud: HudState) => void) | null = null;
    private wallContactLatched = false;
    lives = 3;
    ammo = 0;
    cash = 0;
    carriedItem: HudState["carriedItem"] = null;
    boothOpen = false;
    hasTeleporter = false;
    escaped = false;
    private elapsedSeconds = 0;
    private activeElapsedMs = 0;
    private interactionPrompt = "";
    private readonly sellingBooth = { x: 2.5, y: 1.5 };
    private readonly exitTeleporter = { x: 27.5, y: 28.5 };
    private readonly itemStations = [
        { id: 1, name: "Nearby Data Core", x: 5.5, y: 2.5 },
        { id: 2, name: "Remote Data Core", x: 8.5, y: 4.5 },
        { id: 3, name: "Deep Maze Data Core", x: 28.5, y: 4.5 },
    ];
    // map: number[][] = [
    //     [1,1,1,1,1,1,1,1,1,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,1,0,0,0,0,0,0,1],
    //     [1,1,1,1,1,1,1,1,1,1]
    // ];
map: number[][] = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1],
    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,0,0,0,0,1,1,1],
    [1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1],
    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1],
    [1,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1],
    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,1,1,1],
    [1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,0,1,0,1,1,1,0,0,0,0,0,1,1],
    [1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

    constructor(){
        this.prevTimeStamp=Math.floor(Date.now());
        this.running=false;

        // ID 2 is the selling booth wall; ID 3 marks item station walls.
        // Their images belong at public/walls/2.png and public/walls/3.png.
        this.map[1][3] = WALL_TEXTURE_IDS.sellingBooth;
        this.map[1][5] = WALL_TEXTURE_IDS.itemStation;
        this.map[2][7] = WALL_TEXTURE_IDS.stationTip;
        this.map[3][8] = WALL_TEXTURE_IDS.itemStation;
        this.map[3][9] = WALL_TEXTURE_IDS.livesTip;
        this.map[3][10] = WALL_TEXTURE_IDS.ammoTip;
        this.map[3][11] = WALL_TEXTURE_IDS.chaseTip;
        this.map[5][7] = WALL_TEXTURE_IDS.dangerTip;
        this.map[5][8] = WALL_TEXTURE_IDS.sneakTip;
        this.map[4][29] = WALL_TEXTURE_IDS.itemStation;

        this.player=new Player(1.1,1.1,0,4,80);
        this.input=new Input();
        this.paused=false;


        document.addEventListener(
            "pointerlockchange",
            this.handlePointerLockChange
        );
    }

    private handlePointerLockChange = () => {
        if (!this.running || !this.canvas) return;

        const locked =
            document.pointerLockElement === this.canvas.canvasRef;

        if (locked) {
            const wasPaused = this.paused;
            this.paused = false;
            this.onPauseChange?.(false);
            if (wasPaused) void this.audio.enterScene("game");
        } else if (!this.paused && !this.boothOpen) {
            this.pause();
        }
    };

    movementValidator(direction: Array<number>, player: Player, map: number[][], deltaTime: number) {
        const distance = player.speed * deltaTime;
        const forward = direction[0] * distance; // W/S (+1 / -1)
        const side = direction[1] * distance;    // D/A (+1 / -1)
        

        const rad = (player.angle * Math.PI) / 180;

        let dirx = Math.cos(rad) * forward + Math.sin(rad) * side;
        let diry = -Math.sin(rad) * forward + Math.cos(rad) * side;

        // Boundary & Collision Check: X axis
        const newX = player.x + dirx;
        const targetXCell = Math.floor(newX);
        const currentYCell = Math.floor(player.y);

        let hitWall = false;
        const attemptedMovement = Math.abs(forward) + Math.abs(side) > 0;

        if (
            targetXCell >= 0 &&
            targetXCell < map[0].length &&
            map[currentYCell]?.[targetXCell] === 0
        ) {
            this.player.x = newX;
        } else if (dirx !== 0) {
            hitWall = true;
        }

        // Boundary & Collision Check: Y axis
        const newY = player.y + diry;
        const targetYCell = Math.floor(newY);
        const currentXCell = Math.floor(player.x);

        if (
            targetYCell >= 0 &&
            targetYCell < map.length &&
            map[targetYCell]?.[currentXCell] === 0
        ) {
            this.player.y = newY;
        } else if (diry !== 0) {
            hitWall = true;
        }

        if (hitWall && attemptedMovement && !this.wallContactLatched) {
            void this.audio.wallImpact();
        }
        this.wallContactLatched = hitWall && attemptedMovement;

        // Mouse look / Turning
        this.player.angle = (player.angle - direction[2] + 360) % 360;
    }

    private lastFrameTime = 0;

    getHudState(): HudState {
        return {
            lives: this.lives,
            ammo: this.ammo,
            cash: this.cash,
            elapsedSeconds: this.elapsedSeconds,
            carriedItem: this.carriedItem,
            prompt: this.interactionPrompt,
            boothOpen: this.boothOpen,
            hasTeleporter: this.hasTeleporter,
            escaped: this.escaped,
        };
    }

    private publishHud() {
        this.onHudChange?.(this.getHudState());
    }

    private distanceTo(point: { x: number; y: number }) {
        return Math.hypot(this.player.x - point.x, this.player.y - point.y);
    }

    private updateInteraction() {
        const boothNearby = this.distanceTo(this.sellingBooth) <= 1.15;
        const exitNearby = this.distanceTo(this.exitTeleporter) <= 1.15;
        const nearbyStation = this.itemStations.find(
            (station) => this.distanceTo(station) <= 1.15
        );

        if (this.boothOpen) {
            if (this.input.isKeyJustPressed("e")) this.closeBooth();
            return;
        }

        let prompt = "";
        if (boothNearby) {
            prompt = "Press E to open selling booth";
        } else if (nearbyStation) {
            const distance =
                Math.abs(this.sellingBooth.x - nearbyStation.x) +
                Math.abs(this.sellingBooth.y - nearbyStation.y);
            const value = distance * 10;
            prompt = this.carriedItem
                ? "Hands full — sell your item at the booth"
                : `Press E to collect item · $${value}`;
        } else if (exitNearby) {
            prompt = this.hasTeleporter
                ? "Press E to activate the exit teleporter"
                : "Exit locked — buy a teleporter at the booth";
        }

        if (prompt !== this.interactionPrompt) {
            this.interactionPrompt = prompt;
            this.publishHud();
        }

        if (!this.input.isKeyJustPressed("e")) return;

        if (boothNearby) {
            this.boothOpen = true;
            this.interactionPrompt = "";
            this.unlockMouse();
            void this.audio.buttonClick();
            this.publishHud();
        } else if (nearbyStation && !this.carriedItem) {
            const distance =
                Math.abs(this.sellingBooth.x - nearbyStation.x) +
                Math.abs(this.sellingBooth.y - nearbyStation.y);
            this.carriedItem = {
                name: nearbyStation.name,
                value: distance,
            };
            this.interactionPrompt = "";
            void this.audio.buttonClick();
            this.publishHud();
        } else if (exitNearby && this.hasTeleporter) {
            this.escaped = true;
            this.running = false;
            this.unlockMouse();
            void this.audio.buttonClick();
            this.publishHud();
        }
    }

    sellCarriedItem() {
        if (!this.boothOpen || !this.carriedItem) return;
        this.cash += this.carriedItem.value;
        this.carriedItem = null;
        void this.audio.buttonClick();
        this.publishHud();
    }

    closeBooth() {
        if (!this.boothOpen) return;
        this.boothOpen = false;
        void this.audio.buttonClick();
        this.publishHud();
        this.lockMouse();
    }

    buyAmmo() {
        if (!this.boothOpen || this.cash < BOOTH_PRICES.ammo) return;
        this.cash -= BOOTH_PRICES.ammo;
        this.ammo += 8;
        void this.audio.buttonClick();
        this.publishHud();
    }

    buyLife() {
        if (!this.boothOpen || this.cash < BOOTH_PRICES.life) return;
        this.cash -= BOOTH_PRICES.life;
        this.lives += 1;
        void this.audio.buttonClick();
        this.publishHud();
    }

    buyTeleporter() {
        if (!this.boothOpen || this.hasTeleporter || this.cash < BOOTH_PRICES.teleporter) return;
        this.cash -= BOOTH_PRICES.teleporter;
        this.hasTeleporter = true;
        void this.audio.buttonClick();
        this.publishHud();
    }

    loop = (timestamp: number) => {
        if (!this.running) return;

        const deltaTime = this.lastFrameTime
            ? Math.min((timestamp - this.lastFrameTime) / 1000, 0.05)
            : 0;

        this.lastFrameTime = timestamp;

        if (!this.paused) this.activeElapsedMs += deltaTime * 1000;
        const elapsed = Math.floor(this.activeElapsedMs / 1000);
        if (elapsed !== this.elapsedSeconds) {
            this.elapsedSeconds = elapsed;
            this.publishHud();
        }

        if (!this.paused) {
            const direction = this.input.checkInput();
            if (!this.boothOpen) {
                const previousX = this.player.x;
                const previousY = this.player.y;
                this.movementValidator(direction, this.player, this.map, deltaTime);
                void this.audio.setWalking(
                    this.player.x !== previousX || this.player.y !== previousY
                );
            } else {
                void this.audio.setWalking(false);
            }
            this.updateInteraction();
        } else {
            void this.audio.setWalking(false);
        }

        this.canvas?.renderRaycasting(this.map, this.player);
        this.canvas?.renderMinimap(this.map, this.player, [
            { ...this.sellingBooth, color: "#ff334f" },
            ...this.itemStations.map((station) => ({
                x: station.x,
                y: station.y,
                color: "#4de1ff",
            })),
            { ...this.exitTeleporter, color: this.hasTeleporter ? "#facc15" : "#666666" },
        ]);
        this.input.endFrame();

        requestAnimationFrame(this.loop);
    };

    start() {
        if (this.running) return;

        this.running = true;
        this.paused = false;
        this.boothOpen = false;
        this.activeElapsedMs = 0;
        this.elapsedSeconds = 0;
        this.publishHud();
        this.lastFrameTime = 0;
        this.wallContactLatched = false;
        void this.audio.enterScene("game");

        this.lockMouse();

        requestAnimationFrame(this.loop);
    }

    pause() {
        if (this.paused) return;

        this.paused = true;
        void this.audio.setWalking(false);
        void this.audio.enterScene("pause");
        this.onPauseChange?.(true);
    }

    resume() {
        if (!this.paused) return;

        this.lockMouse();
    }

    stop(){
        this.running = false;
        this.paused = false;
        this.wallContactLatched = false;
        void this.audio.setWalking(false);
    }

    lockMouse() {
        this.canvas?.canvasRef.requestPointerLock();
    }

    unlockMouse() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    setCanvas(canvasRef:HTMLCanvasElement){
        this.canvas=new Canvas(canvasRef,window.innerWidth,window.innerHeight);
    }
}
