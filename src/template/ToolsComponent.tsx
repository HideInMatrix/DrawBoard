import SvgIcon from "@/components/SvgIcon";
import { classNames } from "@/utils/classNames";
import { useEffect, useState } from "react";

export function ToolsElement({
	currentTool = "",
	setCurrentTool,
	currentCanvas,
}) {
	const [tools, setTools] = useState([
		"revocation-fill",
		"trash-fill",
		"zoom-in-fill",
		"zoom-out-fill",
	]);

	// const [currentTool, setCurrentTool] = useState(tools[0]);

	const setCurToolFn = (item: string) => {
		if (
			(item === "revocation-fill" || item === "trash-fill") &&
			currentCanvas.appHistoryStep < 1
		) {
			return;
		}
		setCurrentTool(item);
	};

	return tools.map((item, index) => {
		if (item === "zoom-in-fill" || item === "zoom-out-fill") {
			return (
				<div
					className="pen-size-item"
					key={index}
					onClick={() => setCurToolFn(item)}>
					<SvgIcon
						iconClass={item}
						className={classNames(
							"pen-size-default",
							currentTool === item ? "active-pen" : ""
						)}></SvgIcon>
				</div>
			);
		} else {
			return (
				<div
					className="pen-size-item"
					key={index}
					onClick={() => setCurToolFn(item)}>
					<SvgIcon
						iconClass={item}
						className={classNames(
							"pen-size-default",
							currentCanvas?.appHistoryStep > 0 ? "active-pen" : ""
						)}></SvgIcon>
				</div>
			);
		}
	});
}

export function WorldElement({ active = false, activeWordFn }) {
	const activeWord = () => {
		activeWordFn(!active);
	};
	return (
		<div
			onClick={() => activeWord()}
			className={classNames("pen-size-default")}>
			<SvgIcon
				iconClass={"word-fill"}
				className={classNames(active ? "active-pen" : "")}></SvgIcon>
		</div>
	);
}

export function TurnElement({ rotateCanvas }) {
	const [tools, setTools] = useState(["turn-left-fill", "turn-right-fill"]);

	// const [currentTool, setCurrentTool] = useState(tools[0]);

	const setCurToolFn = (item: string) => {
		// setCurrentTool(item);
		rotateCanvas(item);
	};

	return tools.map((item, index) => (
		<div
			className="pen-size-item"
			key={index}
			onClick={() => setCurToolFn(item)}>
			<SvgIcon iconClass={item} className="pen-size-default"></SvgIcon>
		</div>
	));
}

export function CorrectElement({
	currentTool = "",
	setCorrectType,
	currentCanvas,
}) {
	const [tools, setTools] = useState([
		"right-fill",
		"wrong-fill",
		"slash-fill",
	]);

	const [tool, setTool] = useState("");

	const setCurToolFn = (item: string) => {
		setCorrectType(item);
		setTool(item);
	};

	useEffect(() => {
		let _currentCanvas = currentCanvas();
		if (_currentCanvas?.lastOptions[_currentCanvas.lastSymbol]) {
			if (_currentCanvas.lastSymbol === "tickAble") {
				setTool("right-fill");
			} else if (_currentCanvas.lastSymbol === "crossAble") {
				setTool("wrong-fill");
			} else if (_currentCanvas.lastSymbol === "inclinedAble") {
				setTool("slash-fill");
			}
		} else {
			setTool("");
		}
	}, [currentCanvas]);

	return tools.map((item, index) => (
		<div
			className="pen-size-item"
			key={index}
			onClick={() => setCurToolFn(item)}>
			<SvgIcon
				iconClass={item}
				className={classNames(
					"pen-size-default",
					tool === item ? "active-pen" : ""
				)}></SvgIcon>
		</div>
	));
}
