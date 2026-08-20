import type Player from "../world/player";
import { WALL_TEXTURE_MESSAGES } from "../world/wallTextures";

type WallTexture = HTMLImageElement | HTMLCanvasElement;

export default class Canvas{
    width:number;
    height:number;

    canvasRef:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;

    private wallTextures = new Map<number, WallTexture>();
    private missingWallTextures = new Set<number>();
    private baseTexture = new Image();

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

        this.baseTexture.src = "/image.png";
        this.wallTextures.set(1, this.baseTexture);
    }

    private getWallTexture(wallId: number): WallTexture {
        if (this.missingWallTextures.has(wallId)) return this.baseTexture;

        let texture = this.wallTextures.get(wallId);
        if (!texture) {
            const message = WALL_TEXTURE_MESSAGES[wallId];
            if (message) {
                texture = this.createTextWallTexture(message, wallId);
            } else {
                const image = new Image();
                image.src = `/walls/${wallId}.png`;
                image.onerror = () => this.missingWallTextures.add(wallId);
                texture = image;
            }
            this.wallTextures.set(wallId, texture);
        }

        const width = texture instanceof HTMLImageElement ? texture.naturalWidth : texture.width;
        return width > 0 ? texture : this.baseTexture;
    }

    private createTextWallTexture(message: string, wallId: number): HTMLCanvasElement {
        const texture = document.createElement("canvas");
        texture.width = 512;
        texture.height = 512;
        const ctx = texture.getContext("2d")!;
        const accent = wallId === 9 ? "#ff4f43" : wallId === 4 ? "#ffbd4a" : "#58d9d0";

        ctx.fillStyle = "#17191d";
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = "#252930";
        ctx.fillRect(20, 20, 472, 472);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 8;
        ctx.strokeRect(24, 24, 464, 464);
        ctx.fillStyle = accent;
        ctx.fillRect(40, 54, 432, 5);
        ctx.font = "bold 25px monospace";
        ctx.textAlign = "left";
        ctx.fillText("FIELD GUIDE // TIP", 44, 44);

        ctx.font = "bold 31px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const lines: string[] = [];
        let line = "";
        for (const word of message.toUpperCase().split(/\s+/)) {
            const candidate = line ? `${line} ${word}` : word;
            if (ctx.measureText(candidate).width > 400 && line) {
                lines.push(line);
                line = word;
            } else {
                line = candidate;
            }
        }
        if (line) lines.push(line);

        const lineHeight = 44;
        const firstLineY = 274 - ((lines.length - 1) * lineHeight) / 2;
        ctx.fillStyle = "#f1f0e8";
        lines.forEach((text, index) => {
            ctx.fillText(text, 256, firstLineY + index * lineHeight, 410);
        });

        ctx.fillStyle = accent;
        ctx.fillRect(40, 450, 432, 5);
        return texture;
    }

    renderMinimap(
        map: number[][],
        player: Player,
        markers: Array<{ x: number; y: number; color: string }> = []
    ) {
        const tileSize = 10;

        // Clear minimap region
        this.ctx.clearRect(0, 0, 100, 100);

        this.ctx.save();


        this.ctx.beginPath();
        this.ctx.rect(0, 0, 100, 100);
        this.ctx.clip();

        this.ctx.translate(50,50);
        this.ctx.rotate((player.angle-90)*Math.PI/180);
        this.ctx.translate(
            -player.x * tileSize,
            -player.y * tileSize
        );

        //render map layout
        this.ctx.fillStyle = "red";
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] > 0) {
                    // x goes right, y goes down
                    this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }

        for (const marker of markers) {
            this.ctx.fillStyle = marker.color;
            this.ctx.fillRect(
                marker.x * tileSize - 3,
                marker.y * tileSize - 3,
                6,
                6
            );
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

        this.ctx.restore();
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
            let hitSide: "vertical" | "horizontal" = "vertical";
            let wallId = 1;

            while (true) {

                // Vertical grid boundary
                if (sideDistX < sideDistY) {

                    sideDistX += deltaDistX;
                    mapX += stepX;

                    if ((map[mapY]?.[mapX] ?? 1) > 0) {

                        distance =
                            sideDistX - deltaDistX;
                        hitSide = "vertical";
                        wallId = map[mapY]?.[mapX] ?? 1;
                        break;
                    }

                }

                // Horizontal grid boundary
                else {

                    sideDistY += deltaDistY;
                    mapY += stepY;

                    if ((map[mapY]?.[mapX] ?? 1) > 0) {

                        distance =
                            sideDistY - deltaDistY;
                        hitSide = "horizontal";
                        wallId = map[mapY]?.[mapX] ?? 1;
                        break;
                    }
                }
            }

            const correctedDistance =
                distance *
                Math.cos(
                    cameraAngle * Math.PI / 180
                );
 
            const wallHeight = screenHeight / correctedDistance;
            const wallTop = (screenHeight - wallHeight) / 2;

            const hitX = player.x + dx * distance;
            const hitY = player.y + dy * distance;

            let wallPosition;

            if (hitSide === "vertical") {
                wallPosition = hitY - Math.floor(hitY);
            } else {
                wallPosition = hitX - Math.floor(hitX);
            }

            const texture = this.getWallTexture(wallId);
            const textureWidth = texture instanceof HTMLImageElement
                ? texture.naturalWidth
                : texture.width;
            const textureHeight = texture instanceof HTMLImageElement
                ? texture.naturalHeight
                : texture.height;
            if (textureWidth > 0 && textureHeight > 0) {
                const textureX = Math.min(
                    textureWidth - 1,
                    Math.floor(wallPosition * textureWidth)
                );
                this.ctx.drawImage(
                    texture,
                    textureX,
                    0,
                    1,
                    textureHeight,
                    column,
                    wallTop,
                    1,
                    wallHeight
                );
            }

            const maxDistance = 50; // Distance at which walls become completely black
            let shadow = correctedDistance / maxDistance;

            if (shadow < 0) shadow = 0;
            if (shadow > 1) shadow = 1;

            this.ctx.fillStyle = `rgba(0, 0, 0, ${shadow})`;
            this.ctx.fillRect(column, wallTop, 1, wallHeight);

            // if (column === 0 || column === Math.floor(screenWidth / 2) || column === screenWidth - 1) {
            //     console.log(
            //         "column:",
            //         column,
            //         "cameraAngle:",
            //         cameraAngle,
            //         "rayAngle:",
            //         rayAngle,
            //         "dx:",
            //         dx,
            //         "dy:",
            //         dy,
            //         "MapX:",
            //         mapX,
            //         "MapY:",
            //         mapY
            //     );
            // }
        }
    }
}
