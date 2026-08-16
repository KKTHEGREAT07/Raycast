import Player from "../world/player";
import Input from "./input";
import Canvas from "../components/gameCanvas";

export default class game{
    
    prevTimeStamp:number;
    running:boolean;
    player:Player;
    input:Input;
    canvas:Canvas|null=null;
    paused:boolean;
    onPauseChange: ((paused: boolean) => void) | null = null;
    map: number[][] = [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1]
    ];

    // map: number[][] = [
    //     [1,1,1,1,1,1,1,1,1],
    //     [1,0,0,0,1,0,0,0,0],
    //     [1,0,1,0,1,0,1,1,0],
    //     [1,0,1,0,0,0,1,0,0],
    //     [1,0,1,1,1,0,1,0,1],
    //     [1,0,0,0,1,0,0,0,0],
    //     [1,1,1,0,1,1,1,1,0],
    //     [1,0,0,0,0,0,0,1,0],
    //     [1,0,1,1,1,1,0,0,0],
    //     [1,1,1,1,1,1,1,1,1]
    // ];

    constructor(){
        this.prevTimeStamp=Math.floor(Date.now());
        this.running=false;

        this.player=new Player(1.1,1.1,0,0.05,60);
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
            this.paused = false;
            this.onPauseChange?.(false);
        } else if (!this.paused) {
            this.pause();
        }
    };

    movementValidator(direction: Array<number>, player: Player, map: number[][]) {
        const forward = direction[0] * player.speed; // W/S (+1 / -1)
        const side = direction[1] * player.speed;    // D/A (+1 / -1)

        const rad = (player.angle * Math.PI) / 180;

        let dirx = Math.cos(rad) * forward + Math.sin(rad) * side;
        let diry = -Math.sin(rad) * forward + Math.cos(rad) * side;

        // Boundary & Collision Check: X axis
        const newX = player.x + dirx;
        const targetXCell = Math.floor(newX);
        const currentYCell = Math.floor(player.y);

        if (
            targetXCell >= 0 &&
            targetXCell < map[0].length &&
            map[currentYCell][targetXCell] !== 1
        ) {
            this.player.x = newX;
        }

        // Boundary & Collision Check: Y axis
        const newY = player.y + diry;
        const targetYCell = Math.floor(newY);
        const currentXCell = Math.floor(player.x);

        if (
            targetYCell >= 0 &&
            targetYCell < map.length &&
            map[targetYCell][currentXCell] !== 1
        ) {
            this.player.y = newY;
        }

        // Mouse look / Turning
        this.player.angle = (player.angle - direction[2] + 360) % 360;
    }

    loop = () => {
        if (!this.running) return;

        const currTimeStamp = Math.floor(Date.now());

        if (currTimeStamp - this.prevTimeStamp >= 3) {

            if (!this.paused) {
                const direction = this.input.checkInput();

                this.movementValidator(
                    direction,
                    this.player,
                    this.map
                );
            }

            this.canvas?.renderRaycasting(this.map, this.player);
            this.canvas?.renderMinimap(this.map, this.player);

            this.input.endFrame();

            this.canvas?.renderRaycasting(this.map, this.player);
            this.canvas?.renderMinimap(this.map, this.player);

            this.prevTimeStamp = currTimeStamp;
        }

        requestAnimationFrame(this.loop);
    }

    start() {
        if (this.running) return;

        this.running = true;
        this.paused = false;

        this.lockMouse();

        requestAnimationFrame(this.loop);
    }

    pause() {
        if (this.paused) return;

        this.paused = true;
        this.onPauseChange?.(true);
    }

    resume() {
        if (!this.paused) return;

        this.lockMouse();
    }

    stop(){
        this.running = false;
        this.paused = false;
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
        this.canvas=new Canvas(canvasRef,1000,1000);
    }
}