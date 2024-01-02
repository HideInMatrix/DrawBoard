import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { Panel } from "./PanelComponent";
import { DrawCanvas } from "@/ts/board";
import { Pagination } from "@/ts/pagination";
import { Swiper } from "@/ts/swiper";

interface CreateCanvasParams {
	width: number;
	height: number;
	index: number;
	middleContainer: HTMLElement;
	url?: string;
	drawBackFn: Function;
	textActiveFn?: Function;
	id?: number;
}
// 创建画布
function createCanvas({
	width,
	height,
	index = 0,
	middleContainer,
	url,
	drawBackFn,
	textActiveFn,
	id,
}: CreateCanvasParams) {
	let _canvas = new DrawCanvas({
		width,
		height,
		url: url ?? "",
		callbackFn: { drawBackFn, textActiveFn },
	});
	_canvas.canvasRef.setAttribute("data-index", String(index + 1));
	let parentDataset = middleContainer?.dataset || "";
	for (let [k, v] of Object.entries(parentDataset)) {
		if (k[0] === "v") {
			let _k = k.slice(1);
			_k = _k.toLowerCase();
			_canvas.canvasRef.setAttribute(`data-v-${_k}`, "");
		}
	}
	middleContainer.appendChild(_canvas.canvasRef);
	_canvas.initBoard({
		width,
		height,
		url: url ?? "",
	});
	Object.assign(_canvas, { id });
	return _canvas;
}

function createPagination(paginationRef, swiperFn) {
	let _pagination = new Pagination(paginationRef!, {
		activePageAction: (_dom: HTMLElement) => {
			swiperFn(Number(_dom.dataset.page));
		},
	});
	return _pagination;
}

function createSwiper(canvasListRef, pagination) {
	let _swiper = new Swiper(canvasListRef!, {
		enablePlay: false,
		enablePagination: true,
		pagination: pagination,
	});
	_swiper.init();
	return _swiper;
}

export const Index = forwardRef(({ images }: { images: any[] }, ref) => {
	let [canvases, setCanvas] = useState<DrawCanvas[]>([]);
	let [currentIndex, setCurrentIndex] = useState(-1);
	let [currentCanvasSize, setCurrentCanvasSize] = useState(-1);
	let [textFlag, setTextFlag] = useState(false);

	const stageRef = useRef(null);
	const canvasListRef = useRef(null);
	const paginationRef = useRef(null);

	let swiper: Swiper;
	let pagination: Pagination;

	let [currentCanvas, setCurrentCanvas] = useState<DrawCanvas>();

	function clearBaseStage(middleContainer) {
		canvases.forEach((item, index) => {
			item.destroy();
			middleContainer.removeChild(item.canvasRef);
		});
		setCanvas(() => []);
	}
	function getImages() {
		let imageArray = canvases.map((item) => ({
			id: item.id,
			url: item.exportImage(),
		}));
		return imageArray;
	}

	useImperativeHandle<unknown, { getImages: Function }>(ref, () => {
		return {
			getImages: getImages,
		};
	});

	useEffect(() => {
		setCurrentCanvasSize(currentCanvas?.appHistoryStep || -1);
	}, [currentCanvas]);

	useEffect(() => {
		if (currentIndex === -1) {
			return;
		}
		setCurrentCanvas(() => canvases[currentIndex]);
		// swiperWatcher?.slideTo(currentIndex);
	}, [currentIndex, canvases]);

	useEffect(() => {
		if (images.length === 0) {
			return;
		}
		clearBaseStage(stageRef.current);
		if (stageRef.current && canvasListRef.current) {
			// 组件完成了渲染的时候开始生存组件
			for (let i = 0; i < images.length; i++) {
				let _canvas = createCanvas({
					width: (canvasListRef.current as HTMLElement).clientWidth,
					height: (canvasListRef.current as HTMLElement).clientHeight,
					index: i,
					middleContainer: stageRef.current,
					url: images[i].url,
					drawBackFn: (val) => {
						setCurrentCanvasSize(val);
					},
					textActiveFn: (val) => {
						setTextFlag(val);
					},
					id: images[i].id,
				});

				setCanvas((canvases) => [...canvases, _canvas]);
			}
			// 第一次初始化
			setCurrentIndex(0);

			pagination = createPagination(paginationRef.current, (index) => {
				swiper.slideTo(Number(index));
				setCurrentIndex(Number(index));
			});
			swiper = createSwiper(canvasListRef.current, pagination);
		}
	}, [images]);

	return (
		<div className="board-wrapper">
			<div className="canvas-list swiper" ref={canvasListRef}>
				<div className="swiper-wrapper" ref={stageRef}></div>
				<ul className="pagination-list" ref={paginationRef}></ul>
			</div>
			<Panel
				currentCanvas={currentCanvas}
				currentCanvasSize={currentCanvasSize}
				textFlag={textFlag}></Panel>
		</div>
	);
});
