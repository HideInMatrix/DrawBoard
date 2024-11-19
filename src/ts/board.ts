import Konva from "konva";

export const EventMethods = {
	MOUSEDOWN: "mousedown",
	TOUCHSTART: "touchstart",
	MOUSEUP: "mouseup",
	TOUCHEND: "touchend",
	MOUSEMOVE: "mousemove",
	TOUCHMOVE: "touchmove",
};

export enum RotateEventsEnum {
	RIGHT = "right",
	LEFT = "left",
}

export enum CorrectTypesEnum {
	tickAble = "tickAble",
	inclinedAble = "inclinedAble",
	crossAble = "crossAble",
}

interface drawImageParams {
	x?: number;
	y?: number;
	url: string;
	width?: number;
	height?: number;
}

interface PenConfig {
	lineWidth?: number;
	lineColor?: string;
	shadowBlur?: number;
}

interface CallbackFn {
	drawBackFn?: Function | null;
	textActiveFn?: Function | null;
}
interface CanvasConfig {
	width: number;
	height: number;
	url: string;
	callbackFn?: CallbackFn;
}

class DrawCanvas {
	baseStage: Konva.Stage | null;
	baseLayer: Konva.Layer | null;
	group: Konva.Group | null;
	isPaint: boolean;
	canvasRef: HTMLDivElement;
	canPaint: boolean;
	lastLine: Konva.Line | null;
	config: {
		lineWidth?: number;
		lineColor?: string;
		shadowBlur?: number;
	};
	appHistoryStep: number;
	appHistory: Konva.Group[];
	groupScale: number;
	canvasWidth: number;
	canvasHeight: number;
	imageNatural: {
		width: number;
		height: number;
		scaleWidth: number;
		scaleHeight: number;
	};
	lastOptions: {
		tickAble: boolean;
		inclinedAble: boolean;
		crossAble: boolean;
	};
	lastSymbol: string;

	callbackFn: CallbackFn;
	needTextArea: boolean = false;
	groupDegree: number = 0;
	id: number = new Date().getTime();

	constructor({ width, height, url, callbackFn }: CanvasConfig) {
		this.baseStage = null;
		this.baseLayer = null;
		this.group = null;
		this.isPaint = false;
		this.canvasRef = document.createElement(`div`);
		this.canvasRef.id = `${new Date().getTime()}`;
		this.canvasRef.className = "swiper-slide";
		this.canPaint = true;
		this.lastLine = null;
		this.config = {
			lineWidth: 2,
			lineColor: "#f32f15",
			shadowBlur: 2,
		};

		this.appHistoryStep = 0;
		this.appHistory = [];
		this.groupScale = 10;
		this.canvasWidth = 0;
		this.canvasHeight = 0;
		this.imageNatural = {
			width: width,
			height: height,
			scaleWidth: 0,
			scaleHeight: 0,
		};
		this.lastOptions = {
			tickAble: false,
			inclinedAble: false,
			crossAble: false,
		};
		this.lastSymbol = "tickAble";

		this.callbackFn = {
			drawBackFn: null,
		};
		Object.assign(this.callbackFn, callbackFn);

		this.initBoard = this.initBoard.bind(this);
		this.drawImage = this.drawImage.bind(this);
		this.clearAction = this.clearAction.bind(this);
		this.exportImage = this.exportImage.bind(this);
		this.reduceAction = this.reduceAction.bind(this);
		this.enlargeAction = this.enlargeAction.bind(this);
		this.setBrushConfig = this.setBrushConfig.bind(this);
		this.setText = this.setText.bind(this);
		this.rotate = this.rotate.bind(this);
		this.drawShape = this.drawShape.bind(this);
	}

	initBoard({ width, height, url }: CanvasConfig) {
		this.baseStage = new Konva.Stage({
			container: this.canvasRef.id,
			width: width,
			height: height,
		});
		this.canvasWidth = width;
		this.canvasHeight = height;
		this.baseLayer = new Konva.Layer();
		this.group = new Konva.Group({ x: width / 2, y: height / 2 });
		this.setBackgroundColor();
		// this.drawIntervalLine();
		this.baseLayer.add(this.group);
		this.baseStage.add(this.baseLayer);
		if (url) {
			this.drawImage({ url });
		}
		this.drawLiner();
		this.thumbImage();
	}

	drawAxis(name: string = "") {
		// 清除之前的坐标轴
		let nodes = this.baseLayer?.find(".axis");
		nodes?.forEach((item) => item.destroy());
		// 获取画布中心坐标
		const centerX = this.group!.x();
		const centerY = this.group!.y();

		// 绘制X轴
		const xAxis = new Konva.Line({
			points: [-centerX, 0, centerX, 0],
			stroke: "red",
			strokeWidth: 1,
			name: "axis", // 添加一个名称以便后续删除
		});

		// 添加X轴的名称
		const xAxisName = new Konva.Text({
			x: centerX / 2 + 10, // 偏移一些距离以防止与坐标轴重叠
			y: 5,
			text: `X轴${centerX}px`,
			fontSize: 12,
			fill: "black",
		});

		// 绘制Y轴
		const yAxis = new Konva.Line({
			points: [0, -centerY, 0, centerY],
			stroke: "red",
			strokeWidth: 1,
			name: "axis", // 添加一个名称以便后续删除
		});

		// 添加Y轴的名称
		const yAxisName = new Konva.Text({
			x: 5,
			y: centerY / 2 + 10, // 偏移一些距离以防止与坐标轴重叠
			text: `Y轴${centerY}px`,
			fontSize: 12,
			fill: "black",
		});

		// 将坐标轴添加到组
		// const axisGroup = new Konva.Group();
		this.group?.add(xAxis, xAxisName, yAxis, yAxisName);

		// 重新绘制图层
		this.baseLayer?.batchDraw();
	}

	drawShape(type: CorrectTypesEnum) {
		this.canPaint = false;
		if (this.lastOptions[type] && this.lastSymbol === type) {
			this.lastOptions[type] = false;
			this.group?.draggable(true);
		} else {
			this.lastOptions[this.lastSymbol] = false;
			this.lastOptions[type] = true;
			this.lastSymbol = type;
			this.group?.draggable(false);
		}
		this.baseStage?.on("mousedown touchstart", (e) => {
			let pos = this.getRelativePointerPosition();
			//暂时固定写法
			if (type == CorrectTypesEnum.tickAble && this.lastOptions.tickAble) {
				this.addHistory(this.group?.clone());
				// [pos.x, pos.y, pos.x + 20, pos.y + 15, pos.x + 35, pos.y - 15];
				let tick = new Konva.Line({
					points: [pos.x, pos.y],
					stroke: this.config.lineColor,
					strokeWidth: this.config.lineWidth,
					lineJoin: "round",
				});
				if (this.group?.rotation() == 0) {
					tick.points(
						tick
							.points()
							.concat([pos.x + 20, pos.y + 15, pos.x + 35, pos.y - 15])
					);
				} else if (this.group?.rotation() == 90) {
					tick.points(
						tick
							.points()
							.concat([pos.x + 15, pos.y - 20, pos.x - 15, pos.y - 35])
					);
				} else if (this.group?.rotation() == 180) {
					tick.points(
						tick
							.points()
							.concat([pos.x - 15, pos.y - 20, pos.x - 35, pos.y + 15])
					);
				} else {
					tick.points(
						tick
							.points()
							.concat([pos.x - 20, pos.y + 15, pos.x + 15, pos.y + 35])
					);
				}
				this.group?.add(tick);
				this.baseLayer?.draw();
			}
			if (
				type == CorrectTypesEnum.inclinedAble &&
				this.lastOptions.inclinedAble
			) {
				this.addHistory(this.group?.clone());
				//  [pos.x, pos.y, pos.x + 30, pos.y + 45]
				let inclined = new Konva.Line({
					points: [pos.x, pos.y],
					stroke: this.config.lineColor,
					strokeWidth: this.config.lineWidth,
					lineJoin: "round",
				});
				if (this.group?.rotation() == 0) {
					inclined.points(inclined.points().concat([pos.x + 30, pos.y + 45]));
				} else if (this.group?.rotation() == 90) {
					inclined.points(inclined.points().concat([pos.x + 45, pos.y - 30]));
				} else if (this.group?.rotation() == 180) {
					inclined.points(inclined.points().concat([pos.x - 30, pos.y - 45]));
				} else {
					inclined.points(inclined.points().concat([pos.x - 45, pos.y + 30]));
				}

				this.group?.add(inclined);
				this.baseLayer?.draw();
			}
			if (type == CorrectTypesEnum.crossAble && this.lastOptions.crossAble) {
				this.addHistory(this.group?.clone());
				let cross = new Konva.Line({
					points: [
						pos.x,
						pos.y,
						pos.x + 30,
						pos.y + 30,
						pos.x + 15,
						pos.y + 15,
						pos.x + 30,
						pos.y,
						pos.x,
						pos.y + 30,
					],
					stroke: this.config.lineColor,
					strokeWidth: this.config.lineWidth,
					lineJoin: "round",
				});
				this.group?.add(cross);
				this.baseLayer?.draw();
			}
		});
	}

	setText() {
		this.canPaint = false;
		this.needTextArea = true;
		this.lastOptions[this.lastSymbol] = false;
		this.callbackFn.textActiveFn &&
			this.callbackFn.textActiveFn(this.needTextArea);
		// 设置文字颜色
		this.addHistory(this.group?.clone());
		this.baseStage?.on("mousedown touchend", (evt) => {
			if (this.needTextArea) {
				let pos = this.getRelativePointerPosition();
				let groupRotation = this.group?.rotation() || 0;

				let textNode = new Konva.Text({
					x: pos.x,
					y: pos.y,
					fontSize: 20,
					text: "双击编辑",
					draggable: true,
					borderStroke: "#000", // 虚线颜色
					borderStrokeWidth: 10, //虚线大小
					borderDash: [0], // 虚线间距
					rotation: -groupRotation,
					fill: this.config.lineColor,
				});

				this.group?.add(textNode);
				this.baseLayer?.draw();

				textNode.on("dblclick dbltap", (e) => {
					textNode.hide();
					buildTextArea(textNode);
				});

				textNode.on("dragstart", (e) => {
					this.addHistory(this.group?.clone());
				});
			}
			this.needTextArea = false;
		});

		let buildTextArea = (textNode: Konva.Text) => {
			let textarea = document.createElement("textarea");
			const canvasContainer = document.getElementById(this.canvasRef.id);
			canvasContainer?.appendChild(textarea);

			textarea.value = textNode.text() === "双击编辑" ? "" : textNode.text();
			textarea.style.position = "absolute";
			textarea.style.top = textNode.absolutePosition().y + "px"; //group的增加是修正偏移的位置
			textarea.style.left = textNode.absolutePosition().x + "px";
			textarea.style.width = textNode.width() - textNode.padding() * 2 + "px";
			textarea.style.height =
				textNode.height() - textNode.padding() * 2 + 5 + "px";
			textarea.style.fontSize =
				(
					(textNode.fontSize() *
						(this.group?.scaleX() ? this.group?.scaleX() : 0) *
						10) /
					10
				).toFixed() + "px";
			textarea.style.border = "none";
			textarea.style.padding = "0px";
			textarea.style.margin = "0px";
			textarea.style.overflow = "hidden";
			textarea.style.background = "none";
			textarea.style.outline = "none";
			textarea.style.resize = "none";
			textarea.style.lineHeight = String(textNode.lineHeight());
			textarea.style.fontFamily = textNode.fontFamily();
			textarea.style.transformOrigin = "left top";
			textarea.style.textAlign = textNode.align();
			textarea.style.color = this.config.lineColor || "#f32f15";
			textarea.style.border = "1px solid #f32f15";

			let rotation = 0;

			var transform = "";
			if (rotation) {
				transform += "rotateZ(" + rotation + "deg)";
			}

			var px = 0;

			var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
			if (isFirefox) {
				px += 2 + Math.round(textNode.fontSize() / 20);
			}
			transform += "translateY(-" + px + "px)";

			textarea.style.transform = transform;

			textarea.style.height = "auto";

			textarea.style.height = textarea.scrollHeight + 3 + "px";

			textarea.focus();

			let removeTextarea = () => {
				textarea.parentNode?.removeChild(textarea);
				window.removeEventListener("click", handleOutsideClick);
				// document.getElementById("textFont")?.classList.remove("active");
				this.callbackFn.textActiveFn &&
					this.callbackFn.textActiveFn(this.needTextArea);
				textNode.show();
				this.baseLayer?.draw();
			};

			function setTextareaWidth(newWidth: number) {
				if (!newWidth) {
					newWidth = (textNode as any).placeholder
						? (textNode as any).placeholder.length * textNode.fontSize()
						: 0;
				}

				var isSafari = /^((?!chrome|android).)*safari/i.test(
					navigator.userAgent
				);
				var isFirefox =
					navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
				if (isSafari || isFirefox) {
					newWidth = Math.ceil(newWidth);
				}

				var isEdge =
					(document as any).documentMode || /Edge/.test(navigator.userAgent);
				if (isEdge) {
					newWidth += 1;
				}
				textarea.style.width = newWidth + "px";
			}
			textarea.addEventListener("keydown", function (e) {
				// if (e.keyCode === 13 && !e.shiftKey) {
				//   textNode.text(textarea.value);
				//   removeTextarea();
				// }

				if (e.keyCode === 27) {
					removeTextarea();
				}
			});

			textarea.addEventListener("keydown", function (e) {
				let scale = textNode.getAbsoluteScale().x;
				setTextareaWidth(textNode.width() * scale);
				textarea.style.height = "auto";
				textarea.style.height =
					textarea.scrollHeight + textNode.fontSize() + "px";
			});

			function handleOutsideClick(e: Event) {
				if (e.target !== textarea) {
					textNode.text(textarea.value);
					removeTextarea();
				}
			}
			setTimeout(() => {
				window.addEventListener("click", handleOutsideClick);
			});
		};
	}

	rotate(action: RotateEventsEnum, angle: number = 45) {
		this.canPaint = false;
		this.needTextArea = false;
		this.addHistory(this.group?.clone());
		this.group!.draggable(true);
		document.getElementById("textFont")?.classList.remove("active");

		if (action === RotateEventsEnum.LEFT) {
			this.groupDegree -= angle;
		} else if (action === RotateEventsEnum.RIGHT) {
			this.groupDegree += angle;
		}
		this.groupDegree = ((this.groupDegree % 360) + 360) % 360; // Normalize to range [0, 360)

		this.group?.setAttr("rotation", this.groupDegree);
		this.baseLayer?.batchDraw();
	}

	thumbImage() {
		this.baseStage?.on("wheel", (e: any) => {
			// console.log('滚动', e.evt.deltaY)

			let x = this.group?.getAttr("x");
			let y = this.group?.getAttr("y");

			let s1 = this.groupScale;
			let s2 = 0;

			let plusFun = () => {
				let x2 = e.evt.layerX - ((e.evt.layerX - x) * s2) / s1;
				let y2 = e.evt.layerY - ((e.evt.layerY - y) * s2) / s1;

				this.canPaint = false;
				this.lastOptions[this.lastSymbol] = false;
				this.group?.draggable(!this.canPaint);
				this.group?.setAttr("x", x2);
				this.group?.setAttr("y", y2);

				this.addHistory(this.group?.clone());
				this.group?.scale({
					x: +(this.groupScale / 10).toFixed(2),
					y: +(this.groupScale / 10).toFixed(2),
				});
			};

			// console.log(groupScale.value);
			if (e.evt.deltaY > 0) {
				// 向下滚动 缩小
				if (this.groupScale > 10 && this.groupScale <= 20) {
					this.groupScale -= 1;
					s2 = this.groupScale;
					plusFun();
				}
			} else if (e.evt.deltaY < 0) {
				if (this.groupScale >= 2 && this.groupScale < 20) {
					// 向上滚动 放大
					this.groupScale += 1;
					s2 = this.groupScale;
					plusFun();
				}
			}
		});
	}

	reduceAction() {
		if (this.groupScale > 10 && this.groupScale <= 20) {
			this.group?.draggable(!this.canPaint);
			this.group?.setAttr("x", this.canvasWidth / 2);
			this.group?.setAttr("y", this.canvasHeight / 2);
			this.groupScale -= 1;
			this.addHistory(this.group?.clone());
			this.group?.scale({
				x: +(this.groupScale / 10).toFixed(2),
				y: +(this.groupScale / 10).toFixed(2),
			});
		}
	}

	enlargeAction() {
		if (this.groupScale >= 2 && this.groupScale < 20) {
			this.group?.draggable(!this.canPaint);
			this.group?.setAttr("x", this.canvasWidth / 2);
			this.group?.setAttr("y", this.canvasHeight / 2);
			this.groupScale += 1;
			this.addHistory(this.group?.clone());
			this.group?.scale({
				x: +(this.groupScale / 10).toFixed(2),
				y: +(this.groupScale / 10).toFixed(2),
			});
		}
	}

	revocationAction() {
		if (this.appHistoryStep >= 1) {
			this.appHistoryStep--;
			let scale = this.group?.getAbsoluteScale() || { x: 0, y: 0 };
			this.groupScale = Number((scale.x * 10).toFixed(2));
			let preGroup = (this.group = this.appHistory?.pop() as Konva.Group);
			this.baseLayer?.destroyChildren();
			this.baseLayer?.add(preGroup as any);
			this.baseLayer?.draw();
		}
	}

	clearAction() {
		if (this.appHistory.length > 1) {
			for (let i = this.appHistory.length; i >= 1; i--) {
				this.appHistoryStep--;
				let scale = this.group?.getAbsoluteScale() || { x: 0, y: 0 };
				this.groupScale = Number((scale.x * 10).toFixed(2));
				let preGroup = (this.group = this.appHistory?.pop() as Konva.Group);
				this.baseLayer?.destroyChildren();
				this.baseLayer?.add(preGroup as any);
				this.baseLayer?.draw();
			}
		}
	}

	setBrushConfig({ lineWidth, lineColor, shadowBlur = 2 }: PenConfig) {
		lineColor ? (this.config.lineColor = lineColor) : false;
		if (lineWidth) {
			if (
				!this.canPaint ||
				(this.canPaint && lineWidth === this.config.lineWidth)
			) {
				this.changeBrushStatus();
			}
			this.config.lineWidth = lineWidth;
		}
		this.config.shadowBlur = shadowBlur;
	}
	changeBrushStatus() {
		this.canPaint = !this.canPaint;
		this.lastOptions[this.lastSymbol] = false;
		this.group?.draggable(!this.canPaint);
	}

	scaleImage(
		imWidth: number,
		imHeight: number,
		caWidth: number,
		caHeight: number
	) {
		if (imWidth <= caWidth && imHeight <= caHeight) {
			return {
				width: imWidth,
				height: imHeight,
			};
		} else {
			let scale = Math.min(caWidth / imWidth, caHeight / imHeight);
			return {
				width: imWidth * scale,
				height: imHeight * scale,
			};
		}
	}

	drawImage(params: drawImageParams) {
		// 绘画图片
		let image: Konva.Image;
		let { x, y, url, width, height } = params;
		let imageObj = new Image();
		imageObj.src = url;
		imageObj.onload = () => {
			let scaleimage = this.scaleImage(
				imageObj.naturalWidth,
				imageObj.naturalHeight,
				this.canvasWidth,
				this.canvasHeight
			);
			this.imageNatural = {
				width: imageObj.naturalWidth,
				height: imageObj.naturalHeight,
				scaleWidth: scaleimage.width,
				scaleHeight: scaleimage.height,
			};

			image = new Konva.Image({
				x: -scaleimage.width / 2,
				y: -scaleimage.height / 2,
				image: imageObj,
				width: scaleimage.width,
				height: scaleimage.height,
				rotation: 0,
			});

			this.group?.add(image);
			this.baseLayer?.batchDraw();
			// this.addHistory(this.group!.clone());
		};
	}

	setBackgroundColor() {
		let bgRect = new Konva.Rect({
			width: this.baseStage!.width(),
			height: this.baseStage!.height(),
			fill: "white",
		});
		this.baseLayer!.add(bgRect);
	}

	drawIntervalLine(space = 56) {
		for (let i = 0; i < this.baseStage!.height() / space; i++) {
			let line = new Konva.Line({
				points: [0, i * space, this.baseStage!.width(), i * space],
				stroke: "#DCDCDC",
				strokeWidth: 1,
			});
			this.baseLayer!.add(line);
		}
	}

	drawLiner(mode = "brush") {
		this.baseStage!.on(
			`${EventMethods.MOUSEDOWN} ${EventMethods.TOUCHSTART}`,
			(e) => {
				if (this.canPaint) {
					this.isPaint = true;
					let pos = this.getRelativePointerPosition();
					this.lastLine = new Konva.Line({
						stroke: this.config.lineColor,
						strokeWidth: this.config.lineWidth,
						globalCompositeOperation:
							mode === "brush" ? "source-over" : "destination-out",
						points: [pos.x, pos.y],
					});

					this.addHistory(this.group?.clone());
					this.group!.add(this.lastLine);
				}
			}
		);
		this.baseStage!.on(
			`${EventMethods.MOUSEUP} ${EventMethods.TOUCHEND}`,
			(e) => {
				this.isPaint = false;
				this.baseLayer!.batchDraw();
			}
		);
		this.baseStage!.on(
			`${EventMethods.MOUSEMOVE} ${EventMethods.TOUCHMOVE}`,
			() => {
				if (!this.isPaint || !this.canPaint) {
					return;
				}
				const pos = this.getRelativePointerPosition();
				let newPoints = this.lastLine!.points().concat([pos.x, pos.y]);
				this.lastLine!.points(newPoints);
			}
		);
	}

	getRelativePointerPosition() {
		// 获取当前画布上的指针位置
		const pos = this.baseStage!.getPointerPosition()!;
		// 获取图形的绝对变换矩阵，包含了位置、旋转和缩放等信息
		const absTransform = this.group!.getAbsoluteTransform();
		// 创建反转的变换矩阵，用于将指针位置从画布坐标系转换回图形坐标系
		const invertedTransform = new Konva.Transform(
			absTransform.getMatrix()
		).invert();
		// 使用反转矩阵将指针位置转换到图形坐标系
		const shapePos = invertedTransform.point(pos);
		// 返回相对于图形的坐标位置，考虑了图形的位置、旋转和缩放等变换
		// console.log(pos, absTransform.getMatrix());

		return shapePos;
	}

	addHistory(group: Konva.Group | undefined) {
		if (!group) {
			return;
		}
		this.appHistoryStep++;
		group ? this.appHistory.push(group) : false;
		this.callbackFn.drawBackFn &&
			this.callbackFn.drawBackFn(this.appHistoryStep);
	}

	destroy() {
		this.baseStage!.destroy();
		this.baseLayer!.destroy();
		this.group!.destroy();
		let events = "";
		for (let i in EventMethods) {
			events += `${EventMethods[i]} `;
		}
		this.baseStage!.off(events);
	}

	clearBoard() {
		if (this.appHistory.length > 1) {
			this.appHistoryStep = 0;
			this.group = this.appHistory[0];
			this.baseLayer!.destroyChildren();
			this.setBackgroundColor();
			this.drawIntervalLine();
			this.baseLayer!.add(this.group!);
			this.baseLayer!.draw();
		}
	}

	exportImage() {
		this.group!.setAttr("x", this.canvasWidth / 2);
		this.group!.setAttr("y", this.canvasHeight / 2);
		this.groupScale = 10;
		this.group!.scale({
			x: +(this.groupScale / 10).toFixed(2),
			y: +(this.groupScale / 10).toFixed(2),
		});
		this.group!.draggable(true);
		// 获得包裹图片的外接矩形，然后根据外接矩形来计算图片的位置和大小
		let boundingBox = this.baseLayer!.getClientRect();

		let ratio = () => {
			return 1;
		};
		let dataURL = this.baseStage!.toDataURL({
			mimeType: "image/jpeg",
			x: boundingBox.x,
			y: boundingBox.y,
			quality: 0.5,
			pixelRatio: ratio(),
			width: Math.floor(boundingBox.width),
			height: Math.floor(boundingBox.height),
		});

		return dataURL;
	}
}

export { DrawCanvas };
