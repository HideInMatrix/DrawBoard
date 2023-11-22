import reactDom from "react-dom/client";
import React, { createRef, useEffect } from "react";
import { Index } from "@/template/BoardComponent";
import { svgContent } from "@/assets/icon";
import "@/assets/css/base.scss";
import "@/assets/css/panel.scss";

type AppendedDom = string; // 挂载在哪个dom上

export class BoardStage {
	containerRoot!: reactDom.Root;
	settings: {
		saveImageAction: (imageArray: string[]) => void;
		clearBoardAction: (stageRef: any) => void;
	};
	images: any[] = [];
	stageRef: any = null;

	constructor({
		container,
		options,
		images = [],
	}: {
		container: string;
		options: {
			saveImageAction: (imageArray: string[]) => void;
			clearBoardAction: (stageRef: any) => void;
		};
		images?: any[];
	}) {
		// 挂载生成画布组件
		this.settings = Object.assign(
			{
				saveImageAction: null,
			},
			options
		);

		this.saveImage = this.saveImage.bind(this);
		this.clearBoard = this.clearBoard.bind(this);
		this.images = images ?? [];
		this.createDrawBoard(container);
	}

	saveImage() {
		let _images = this.stageRef.current.getImages();
		return _images;
	}

	clearBoard() {
		// this.settings.clearBoardAction(123);
	}

	updateImages(newImages: any[]) {
		this.images = newImages;
		const indexRef = createRef();
		this.containerRoot.render(<Index ref={indexRef} images={newImages} />);
		this.stageRef = indexRef;
	}

	createDrawBoard(_dom: AppendedDom | null = null) {
		const stringToHTML = function (str: string) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(str, "text/html");
			return doc.body.firstElementChild;
		};
		let body: Element;
		if (_dom) {
			body = document.querySelector(_dom)!;
		} else {
			body = document.body;
		}

		let svgUrl = stringToHTML(svgContent);
		svgUrl ? document.body.appendChild(svgUrl) : false;
		this.containerRoot = reactDom.createRoot(body);
		const indexRef = createRef(); // 创建 ref
		this.containerRoot.render(<Index ref={indexRef} images={this.images} />);
		this.stageRef = indexRef;
	}
}
