/*
 * @Author: David
 * @Date: 2023-11-02 10:31:59
 * @LastEditTime: 2024-01-02 15:37:37
 * @LastEditors: David
 * @Description: 控制面板
 * @FilePath: /DrawBoard/src/template/PanelComponent.tsx
 * 可以输入预定的版权声明、个性签名、空行等
 */

import { Component } from "react";
import { PenColorElement, PenSizeElement } from "./PenComponent";
import {
	ToolsElement,
	WorldElement,
	TurnElement,
	CorrectElement,
} from "./ToolsComponent";
import { DrawCanvas, RotateEventsEnum, CorrectTypesEnum } from "@/ts/board";

interface PanelProps {
	currentCanvas: DrawCanvas | undefined;
	currentCanvasSize: number | undefined;
	textFlag: boolean | undefined;
}

interface PanelState {
	currentColor: string;
	currentSize: number;
	currentTool: string;
	correctType: string;
	isDraggable: boolean;
}

export class Panel extends Component<PanelProps, PanelState> {
	constructor(props) {
		super(props);

		this.state = {
			currentColor: "#f32f15",
			currentSize: 2,
			currentTool: "",
			correctType: "",
			isDraggable: false,
		};
	}

	setPenColor = (val) => {
		const { currentCanvas } = this.props;
		this.setState({ currentColor: val });
		currentCanvas?.setBrushConfig({
			lineColor: val,
		});
	};

	setPenSize = (val) => {
		const { currentCanvas } = this.props;
		this.setState({ currentSize: val });
		currentCanvas?.setBrushConfig({ lineWidth: val });

		if (!currentCanvas?.canPaint) {
			this.setState({ currentSize: val, isDraggable: true });
		}
	};

	setCurrentTool = (val) => {
		const { currentCanvas } = this.props;
		if (val === "revocation-fill") {
			currentCanvas?.revocationAction();
		} else if (val === "trash-fill") {
			currentCanvas?.clearAction();
		} else if (val === "zoom-in-fill") {
			currentCanvas?.enlargeAction();
		} else if (val === "zoom-out-fill") {
			currentCanvas?.reduceAction();
		}
		this.setState({ currentTool: val });
	};

	activeWordFn = (val) => {
		const { currentCanvas } = this.props;
		currentCanvas?.setText();
	};

	rotateCanvas = (val) => {
		const { currentCanvas } = this.props;
		if (val === "turn-left-fill") {
			currentCanvas?.rotate(RotateEventsEnum.LEFT);
		} else if (val === "turn-right-fill") {
			currentCanvas?.rotate(RotateEventsEnum.RIGHT);
		}
	};

	setCorrectType = (val) => {
		const { currentCanvas } = this.props;
		if (val === "right-fill") {
			currentCanvas?.drawShape(CorrectTypesEnum.tickAble);
		} else if (val === "wrong-fill") {
			currentCanvas?.drawShape(CorrectTypesEnum.crossAble);
		} else if (val === "slash-fill") {
			currentCanvas?.drawShape(CorrectTypesEnum.inclinedAble);
		}

		this.setState({ correctType: val });
	};

	componentDidUpdate(prevProps) {
		// 检测currentCanvas属性是否发生改变
		if (this.props.currentCanvasSize !== prevProps.currentCanvasSize) {
			// 执行回调函数，你可以在这里调用你的回调函数
			this.setState({
				isDraggable: this.props.currentCanvas?.group?.draggable() || false,
			});
		}
	}

	render() {
		const { currentColor, currentSize, currentTool, correctType, isDraggable } =
			this.state;

		return (
			<ul className="panel-wrapper">
				<li className="panel-item">
					<span className="item-name">画笔颜色</span>
					<PenColorElement
						currentColor={currentColor}
						setPenColor={this.setPenColor}
						currentCanvas={() => this.props.currentCanvas}
					/>
				</li>
				<li className="panel-item">
					<span className="item-name">画笔大小</span>
					<PenSizeElement
						currentPenSize={currentSize}
						setCurrentPenSize={this.setPenSize}
						currentCanvas={() => this.props.currentCanvas}
					/>
				</li>
				<li className="panel-item">
					<span className="item-name">操作</span>
					<ToolsElement
						currentTool={currentTool}
						setCurrentTool={this.setCurrentTool}
						currentCanvas={this.props.currentCanvas}
					/>
				</li>
				<li className="panel-item">
					<span className="item-name">文本</span>
					<WorldElement
						active={this.props.textFlag}
						activeWordFn={this.activeWordFn}
					/>
				</li>
				<li className="panel-item">
					<span className="item-name">旋转</span>
					<TurnElement rotateCanvas={this.rotateCanvas} />
				</li>
				<li className="panel-item">
					<span className="item-name">批改</span>
					<CorrectElement
						currentTool={correctType}
						setCorrectType={this.setCorrectType}
						currentCanvas={() => this.props.currentCanvas}
					/>
				</li>
				<li className="panel-item">
					<p className="dragging-tip">当前画布是否可以拖动</p>
					<p>{isDraggable ? "可以拖动" : "不可以拖动"}</p>
				</li>
			</ul>
		);
	}
}
