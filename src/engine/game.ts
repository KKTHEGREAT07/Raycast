import Player from "../world/player";
import Input from "./input";
import Canvas from "../components/gameCanvas";

export default class game{
    
    prevTimeStamp:number;
    running:boolean;
    player:Player;
    input:Input;
    canvas:Canvas|null=null;
    // map: number[][] = [
    //     [1,1,1,1,1,1,1,1,1,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,0,0,0,0,0,0,0,0,1],
    //     [1,1,1,1,1,1,1,1,1,1]
    // ];

    map: number[][] = [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,0,0,1],
        [1,0,1,0,1,0,1,1,0,1],
        [1,0,1,0,0,0,1,0,0,1],
        [1,0,1,1,1,0,1,0,1,1],
        [1,0,0,0,1,0,0,0,0,1],
        [1,1,1,0,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1]
    ];

    constructor(){
        this.prevTimeStamp=Math.floor(Date.now());
        this.running=false;

        this.player=new Player(1.1,1.1,0,0.25);
        this.input=new Input();
    }

    movementValidator(direction:Array<number>,player:Player,map:number[][]){

        const forward = direction[0] * player.speed;
        const side = direction[1] * player.speed;

        let dirx:number=Math.sin(player.angle*Math.PI/180)*forward-
            Math.cos(player.angle*Math.PI/180)*side;

        let diry:number=Math.cos(player.angle*Math.PI/180)*forward+
            Math.sin(player.angle*Math.PI/180)*side;

        if(map[Math.floor(player.x+dirx)][Math.floor(player.y)]==1){
        }
        else{
            this.player.x+=dirx;
        }

        if(map[Math.floor(player.x)][Math.floor(player.y+diry)]==1){
        }
        else{
            this.player.y+=diry;
        }

        this.player.angle=(player.angle+direction[2]+360)%360;
    }

    loop=()=>{
        if(!this.running) return;

        const currTimeStamp=Math.floor(Date.now());

        if(currTimeStamp-this.prevTimeStamp>=100){
            
            let direction=this.input.checkInput();

            this.movementValidator(direction,this.player,this.map);

            this.canvas?.render(this.map,this.player);

            console.clear();
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