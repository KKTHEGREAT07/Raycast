export default class Input{
    xyInput:Array<number>;
    keysPressed:Record<string,boolean>={};

    constructor(){
        this.xyInput=[0,0];

        document.addEventListener("keydown",(e:KeyboardEvent)=>{
            this.keysPressed[e.key.toLowerCase()]=true;
        });

        document.addEventListener("keyup", (e: KeyboardEvent) => {
            this.keysPressed[e.key.toLowerCase()] = false;
        });
    }

    checkInput(){
        

        if(this.keysPressed['w'])this.xyInput[0]+=1;
        if(this.keysPressed['s'])this.xyInput[0]-=1;
        if(this.keysPressed['d'])this.xyInput[1]+=1;
        if(this.keysPressed['a'])this.xyInput[1]-=1;

        let magnitude=Math.sqrt((this.xyInput[0]**2)+(this.xyInput[1]**2));

        if(magnitude){
            this.xyInput[0]=this.xyInput[0]/magnitude;
            this.xyInput[1]=this.xyInput[1]/magnitude;
        }

        const result = [...this.xyInput];

        this.xyInput[0] = 0;
        this.xyInput[1] = 0;

        return result;
    }
}