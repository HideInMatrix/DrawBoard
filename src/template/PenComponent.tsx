import SvgIcon from "@/components/SvgIcon";
import { classNames } from "@/utils/classNames";
import { useEffect, useState } from "react";

export function PenColorElement({
	currentColor = "",
	setPenColor,
	currentCanvas,
}) {
	const [colors, setColors] = useState([
		"#fef4ac",
		"#0018ba",
		"#ffc200",
		"#f32f15",
		"#cccccc",
		"#5ab639",
		"#ffffff",
	]);
	const addColors = (item: string) => setColors([...colors, item]);

	const [color, setColor] = useState(colors[0]);
	// currentColor = colors[3];

	useEffect(() => {
		setColor(currentColor);
	}, [currentColor]);

	useEffect(() => {
		let _currentCanvas = currentCanvas();
		setColor(_currentCanvas?.config.lineColor);
	}, [currentCanvas]);

	const setCurColor = (item: string) => {
		setColor(item);
		setPenColor(item);
	};
	return colors.map((item, index) => (
		<div
			key={index}
			className={classNames("color-item", color === item ? "active-color" : "")}
			onClick={() => setCurColor(item)}
			style={{ backgroundColor: item }}></div>
	));
}

export function PenSizeElement({
	currentPenSize = 2,
	setCurrentPenSize,
	currentCanvas,
}) {
	const [penSizes, setPenSizes] = useState([2, 6, 12]);
	const [canPaint, setCanPaint] = useState(false);

	const [penSize, setPenSize] = useState(penSizes[0]);
	const clickPen = (item: number) => {
		setCurrentPenSize(item);
		setPenSize(item);
	};

	useEffect(() => {
		setPenSize(currentPenSize);
	}, [currentPenSize]);

	useEffect(() => {
		let _currentCanvas = currentCanvas();
		setCanPaint(_currentCanvas?.canPaint);
		setPenSize(_currentCanvas?.config.lineWidth);
	}, [currentCanvas]);

	useEffect(() => {}, [canPaint]);

	return penSizes.map((item, index) => (
		<div key={index} className="pen-size-item" onClick={() => clickPen(item)}>
			<SvgIcon
				iconClass={"pen-fill"}
				className={classNames(
					"pen-item",
					`pen-size-${item}`,
					penSize === item && canPaint ? "active-pen" : ""
				)}></SvgIcon>
		</div>
	));
}
