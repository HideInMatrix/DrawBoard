export function Test({ images = [] }) {
	let canvases: { id: number }[] = [];
	function initStage() {
		console.log("画布的个数1", canvases.length);
		clearBaseStage();
		console.log("画布的个数2", canvases.length);
		for (let i = 0; i < images.length; i++) {
			createCanvas(i);
		}
	}

	function createCanvas(item) {
		canvases.push({ id: item });
	}
	function clearBaseStage() {
		canvases.forEach((item, index) => {
			item.id = 0;
		});
		canvases = [];
	}
}
