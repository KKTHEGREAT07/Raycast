// import { useEffect } from "react";
// import 
// export default function Canvas(){

//     const canvasRef= useRef<HTMLCanvasElement>(null);

//     useEffect(()=>{

//         const canvas = canvasRef.current;
//         if(!canvas)return;

//         const game=new Game(canvas);
//         game.start();

//         return ()=>{
//             Gamepad.stop();
//         }
//     },[])

//     return (
//         <canvas ref={canvasRef}/>
//     )
// }