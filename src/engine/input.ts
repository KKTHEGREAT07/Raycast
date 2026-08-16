export default class Input {
    private xyInput: [number, number];
    private mouseX: number;

    private keysDown: Record<string, boolean>;
    private keysJustPressed: Record<string, boolean>;

    private handleKeyDown: (e: KeyboardEvent) => void;
    private handleKeyUp: (e: KeyboardEvent) => void;
    private handleMouseMove: (e: MouseEvent) => void;
    private handleBlur: () => void;

    constructor() {
        this.xyInput = [0, 0];
        this.mouseX = 0;

        this.keysDown = {};
        this.keysJustPressed = {};

        this.handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            if (!this.keysDown[key]) {
                this.keysJustPressed[key] = true;
            }

            this.keysDown[key] = true;
        };

        this.handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            this.keysDown[key] = false;
        };

        this.handleMouseMove = (e: MouseEvent) => {
            this.mouseX += e.movementX;
        };

        this.handleBlur = () => {
            this.keysDown = {};
            this.keysJustPressed = {};
            this.mouseX = 0;
        };

        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);
        document.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("blur", this.handleBlur);
    }

    isKeyDown(key: string): boolean {
        return this.keysDown[key.toLowerCase()] === true;
    }

    isKeyJustPressed(key: string): boolean {
        return this.keysJustPressed[key.toLowerCase()] === true;
    }

    checkInput(): [number, number, number] {
        this.xyInput[0] = 0;
        this.xyInput[1] = 0;

        if (this.isKeyDown("w")) {
            this.xyInput[0] += 1;
        }

        if (this.isKeyDown("s")) {
            this.xyInput[0] -= 1;
        }

        if (this.isKeyDown("d")) {
            this.xyInput[1] += 1;
        }

        if (this.isKeyDown("a")) {
            this.xyInput[1] -= 1;
        }

        // Normalize diagonal movement
        const magnitude = Math.sqrt(
            this.xyInput[0] ** 2 +
            this.xyInput[1] ** 2
        );

        if (magnitude > 0) {
            this.xyInput[0] /= magnitude;
            this.xyInput[1] /= magnitude;
        }

        const result: [number, number, number] = [
            this.xyInput[0],
            this.xyInput[1],
            this.mouseX
        ];

        // Mouse movement is consumed once per frame.
        this.mouseX = 0;

        return result;
    }

    endFrame() {
        this.keysJustPressed = {};
    }

    destroy() {
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("keyup", this.handleKeyUp);
        document.removeEventListener("mousemove", this.handleMouseMove);
        window.removeEventListener("blur", this.handleBlur);
    }
}