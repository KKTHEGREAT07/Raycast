import type Player from "../world/player";

export default class Canvas{
    width:number;
    height:number;

    canvasRef:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;

    texture = new Image();

    constructor(canvasRef:HTMLCanvasElement,width:number,height:number){
        this.canvasRef=canvasRef;
        this.ctx=canvasRef.getContext("2d")!;

        this.width=width;
        this.height=height;

        this.canvasRef.width=width;
        this.canvasRef.height=height;

        this.canvasRef.addEventListener("click",()=>{
            canvasRef.requestPointerLock();
        });

        this.texture.src="../../image.png";
    }

    renderMinimap(map: number[][], player: Player) {
        const tileSize = 10;
        const minimapWidth = map[0].length * tileSize;
        const minimapHeight = map.length * tileSize;

        // Clear minimap region
        this.ctx.clearRect(0, 0, minimapWidth, minimapHeight);

        //render map layout
        this.ctx.fillStyle = "red";
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === 1) {
                    // x goes right, y goes down
                    this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }

        // player coords to screen coords
        const playerCanvasX = player.x * tileSize;
        const playerCanvasY = player.y * tileSize;

        // Player Dot
        this.ctx.fillStyle = "yellow";
        this.ctx.fillRect(playerCanvasX - 2, playerCanvasY - 2, 4, 4);

        const FOV = player.fov;
        const halfFOV = FOV / 2;

        const startAngle = (-player.angle - halfFOV) * (Math.PI / 180);
        const endAngle = (-player.angle + halfFOV) * (Math.PI / 180);

        // arc representing player's triangle
        this.ctx.beginPath();
        this.ctx.strokeStyle = "yellow";
        this.ctx.arc(playerCanvasX, playerCanvasY, 12, startAngle, endAngle);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(playerCanvasX, playerCanvasY);
        this.ctx.lineTo(
            playerCanvasX + Math.cos(-player.angle * Math.PI / 180) * 12,
            playerCanvasY + Math.sin(-player.angle * Math.PI / 180) * 12
        );
        this.ctx.stroke();
    }

    renderRaycasting(map: number[][], player: Player) {

        const FOV = player.fov;
        const halfFOV = FOV / 2;

        const screenWidth = this.canvasRef.width;
        const screenHeight = this.canvasRef.height;

        // Ceiling
        this.ctx.fillStyle = "#87CEEB";
        this.ctx.fillRect(
            0,
            0,
            screenWidth,
            screenHeight / 2
        );

        // Floor
        this.ctx.fillStyle = "#444";
        this.ctx.fillRect(
            0,
            screenHeight / 2,
            screenWidth,
            screenHeight / 2
        );

        // iterating through all the columns of the viewport
        for (let column = 0; column < screenWidth; column++) {

            const cameraAngle =
                (column / (screenWidth - 1)) * FOV - halfFOV;

            const rayAngle =
                (player.angle - cameraAngle + 360) % 360;

            const angle =
                rayAngle * Math.PI / 180;

            const dx = Math.cos(angle);
            const dy = -Math.sin(angle);

            let mapX = Math.floor(player.x);
            let mapY = Math.floor(player.y);

            const stepX = dx >= 0 ? 1 : -1;
            const stepY = dy >= 0 ? 1 : -1;

            const deltaDistX =
                dx === 0 ? Infinity : Math.abs(1 / dx);

            const deltaDistY =
                dy === 0 ? Infinity : Math.abs(1 / dy);

            let sideDistX;
            let sideDistY;

            // Distance to first vertical grid boundary
            if (dx >= 0) {
                sideDistX =
                    (mapX + 1 - player.x) * deltaDistX;
            } else {
                sideDistX =
                    (player.x - mapX) * deltaDistX;
            }

            // Distance to first horizontal grid boundary
            if (dy >= 0) {
                sideDistY =
                    (mapY + 1 - player.y) * deltaDistY;
            } else {
                sideDistY =
                    (player.y - mapY) * deltaDistY;
            }

            let distance = 0;
            let hitside;

            while (true) {

                // Vertical grid boundary
                if (sideDistX < sideDistY) {

                    sideDistX += deltaDistX;
                    mapX += stepX;

                    if (map[mapY][mapX] === 1) {

                        distance =
                            sideDistX - deltaDistX;
                        hitside="vertical";
                        break;
                    }

                }

                // Horizontal grid boundary
                else {

                    sideDistY += deltaDistY;
                    mapY += stepY;

                    if (map[mapY][mapX] === 1) {

                        distance =
                            sideDistY - deltaDistY;
                        hitside="horizontal";
                        break;
                    }
                }
            }

            const correctedDistance =
                distance *
                Math.cos(
                    cameraAngle * Math.PI / 180
                );
 
            const wallHeight = screenWidth / correctedDistance;
            const wallTop = (screenWidth - wallHeight) / 2;

            const hitX = player.x + dx * distance;
            const hitY = player.y + dy * distance;

            let wallPosition;

            if (hitside==="vertical") {
                wallPosition = hitY - Math.floor(hitY);
            } else {
                wallPosition = hitX - Math.floor(hitX);
            }

            const textureX =Math.floor(wallPosition * this.texture.width);

            this.ctx.drawImage(this.texture, textureX, 0, 1, this.texture.height, column, wallTop, 1, wallHeight);

            const maxDistance = 15; // Distance at which walls become completely black
            let shadow = correctedDistance / maxDistance;

            if (shadow < 0) shadow = 0;
            if (shadow > 1) shadow = 1;

            this.ctx.fillStyle = `rgba(0, 0, 0, ${shadow})`;
            this.ctx.fillRect(column, wallTop, 1, wallHeight);

            if (column === 0 || column === Math.floor(screenWidth / 2) || column === screenWidth - 1) {
                console.log(
                    "column:",
                    column,
                    "cameraAngle:",
                    cameraAngle,
                    "rayAngle:",
                    rayAngle,
                    "dx:",
                    dx,
                    "dy:",
                    dy,
                    "MapX:",
                    mapX,
                    "MapY:",
                    mapY
                );
            }
        }
    }
}