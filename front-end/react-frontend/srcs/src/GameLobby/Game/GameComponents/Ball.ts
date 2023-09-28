import { IBall } from "../../../Entities/GameTemplates"

export class Ball implements IBall {
	
	x: number;
    y: number;
    dx: number;
    dy: number;
    radius: number;
    speed: number;
	
	constructor(newBall: IBall) {
		this.x = newBall.x;
		this.y = newBall.y;
		this.dx = newBall.x;
		this.dy = newBall.y;
		this.radius = newBall.radius;
		this.speed = newBall.speed;
	}

	draw(context: CanvasRenderingContext2D, scale: number) {
		context.beginPath();
		context.fillStyle = "red";
		context.arc(this.x * scale, this.y * scale, this.radius * scale, 0, 2 * Math.PI);
		context.strokeStyle = "black";
		context.lineWidth = 2;
		context.fill();
		context.stroke()
	}
}