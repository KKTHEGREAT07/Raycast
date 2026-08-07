import type Player from "../world/player";

export default class Canvas{
    width:number;
    height:number;

    canvasRef:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;

    constructor(canvasRef:HTMLCanvasElement,width:number,height:number){
        this.canvasRef=canvasRef;
        this.ctx=canvasRef.getContext("2d")!;

        this.width=width;
        this.height=height;

        this.canvasRef.width=width;
        this.canvasRef.height=height;
    }

    render(map:number[][],player:Player){
        this.ctx.clearRect(0, 0, this.canvasRef.width, this.canvasRef.height);

        this.ctx.fillStyle="red";
        for(let i=0;i<10;i++){
            for(let j=0;j<10;j++){
                if(map[i][j]==1){
                    this.ctx.fillRect(j*100,900-i*100,100,100);
                }
            }
        }
        
        this.ctx.fillStyle="yellow";
        this.ctx.fillRect(player.y*100,1000-player.x*100,-10,10);
    }
}