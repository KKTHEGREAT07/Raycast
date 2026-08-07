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
        [1,0,0,0,1,0,0,0,0,1],
        [1,0,1,0,1,0,1,1,0,1],
        [1,0,1,0,0,0,1,0,0,1],
        [1,0,1,1,0,0,1,0,1,1],
        [1,0,0,0,1,0,0,0,0,1],
        [1,1,1,0,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1]
    ];

    constructor(){
        this.prevTimeStamp=Math.floor(Date.now());
        this.running=false;

        this.player=new Player(1.1,1.1,0.25);
        this.input=new Input();
    }

    movementValidator(direction:Array<number>,player:Player,map:number[][]){
        // console.clear();
        let f:boolean=false;

        let dirx:number=Math.trunc(direction[0]*player.speed*100)/100;
        let diry:number=Math.trunc(direction[1]*player.speed*100)/100;

        if(map[Math.floor(player.x+dirx)][Math.floor(player.y)]==1){
            f=true;
        }
        else{
            this.player.x+=dirx;
        }

        if(map[Math.floor(player.x)][Math.floor(player.y+diry)]==1){
            f=true;
        }
        else{
            this.player.y+=diry;
        }

        // console.log(this.player);
    }

    loop=()=>{
        if(!this.running) return;

        const currTimeStamp=Math.floor(Date.now());

        if(currTimeStamp-this.prevTimeStamp>=5){
            
            let direction=this.input.checkInput();

            this.movementValidator(direction,this.player,this.map);
            
            // for(let i=9;i>=0;i--){
            //     let r:string=`${9-i}`;
            
            //     for(let j=0;j<10;j++){
            //         if(Math.floor(this.player.x)==i && Math.floor(this.player.y)==j){
            //             r+='P';                        
            //         }
            //         else if(this.map[i][j]==1){
            //             r+='#';
            //         }
            //         else{
            //             r+='.';
            //         }
            //     }

            //     console.log(r);
            // }

            this.canvas?.render(this.map,this.player);
            
 
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