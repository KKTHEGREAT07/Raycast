import Player from "../world/player";
import Input from "./input";
import Canvas from "../components/gameCanvas";
import AudioManager from "./audio";

export default class game{
    
    prevTimeStamp:number;
    running:boolean;
    player:Player;
    input:Input;
    audio = new AudioManager();
    canvas:Canvas|null=null;
    paused:boolean;
    onPauseChange: ((paused: boolean) => void) | null = null;
    private wallContactLatched = false;
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
        } else if (!this.paused) {
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

    loop = (timestamp: number) => {
        if (!this.running) return;

        const deltaTime = this.lastFrameTime
            ? Math.min((timestamp - this.lastFrameTime) / 1000, 0.05)
            : 0;

        this.lastFrameTime = timestamp;

        if (!this.paused) {
            const direction = this.input.checkInput();
            const previousX = this.player.x;
            const previousY = this.player.y;
            this.movementValidator(direction, this.player, this.map, deltaTime);
            void this.audio.setWalking(
                this.player.x !== previousX || this.player.y !== previousY
            );
        } else {
            void this.audio.setWalking(false);
        }

        this.canvas?.renderRaycasting(this.map, this.player);
        this.canvas?.renderMinimap(this.map, this.player);
        this.input.endFrame();

        requestAnimationFrame(this.loop);
    };

    start() {
        if (this.running) return;

        this.running = true;
        this.paused = false;
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
