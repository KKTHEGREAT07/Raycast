export default class Player{
    x:number;
    y:number;
    angle:number;
    speed:number;
    fov:number;

    constructor(x:number,y:number,angle:number,speed:number,fov:number){
        this.x=x;
        this.y=y;
        this.angle=angle;
        this.speed=speed;
        this.fov=fov;
    }
}