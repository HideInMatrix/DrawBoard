export class PenInfo {
	penColor: string; // 画笔的颜色
	penSize: string | number; // 画笔的大小
	status: boolean = false; // 画笔的状态
	options: any;

	constructor({ penColor = "#f32f15", penSize = 3, status = false }) {
		this.penColor = penColor;
		this.penSize = penSize;
		this.status = status;
	}

	setStatus(value: boolean) {
		this.status = value;
	}

	setPenSize(value: number | string) {
		this.penSize = value;
	}

	setPenColor(value: string) {
		this.penColor = value;
	}

	getPenInfo() {
		return {
			penColor: this.penColor,
			penSize: this.penSize,
			status: this.status,
		};
	}
}
