import Player from "../world/player";
import Input from "./input";
import Canvas from "../components/gameCanvas";

export default class game{
    
    prevTimeStamp:number;
    running:boolean;
    player:Player;
    input:Input;
    canvas:Canvas|null=null;
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
    }

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

    loop=()=>{
        if(!this.running) return;

        const currTimeStamp=Math.floor(Date.now());

        if(currTimeStamp-this.prevTimeStamp>=3){
            
            let direction=this.input.checkInput();

            this.movementValidator(direction,this.player,this.map);

            console.clear();
            
            this.canvas?.renderRaycasting(this.map,this.player);
            this.canvas?.renderMinimap(this.map,this.player);
            
            console.log(this.player);
 
            this.prevTimeStamp=currTimeStamp;
        }

        requestAnimationFrame(this.loop);
    }

    start(){
        this.running=true;
        
        requestAnimationFrame(this.loop);
    }

    stop(){
        this.running=false;
    }

    setCanvas(canvasRef:HTMLCanvasElement){
        this.canvas=new Canvas(canvasRef,1000,1000);
    }
}