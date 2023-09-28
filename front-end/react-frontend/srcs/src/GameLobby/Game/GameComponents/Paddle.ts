import { IGameUser } from "../../../Entities/GameTemplates";

export class Paddle {

	x: number;
    y: number;
    dy: number;
    width: number;
    height: number;
    speed: number;

	constructor(updatePaddle: IGameUser) {
		this.x = updatePaddle.x;
		this.y = updatePaddle.y;
		this.width = updatePaddle.width;
		this.height = updatePaddle.height;
		this.dy = updatePaddle.dy;
		this.speed = updatePaddle.speed;
	}

	draw(context: CanvasRenderingContext2D, bgImage: HTMLImageElement, scale: number) {
		
		context.drawImage(bgImage, this.x * scale, this.y * scale, this.width * scale, this.height * scale);
		context.strokeStyle = "white";
		context.strokeRect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
	}

	drawRect(context: CanvasRenderingContext2D, color: string | undefined, scale: number) {
		context.beginPath();
		context.fillStyle = color ? color : "white";
		context.rect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
		context.strokeStyle = "white";
		context.strokeRect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
		context.fill();
	}
}
