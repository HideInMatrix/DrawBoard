import pen from "./pen-fill.svg";
import revocation from "./revocation-fill.svg";
import trash from "./trash-fill.svg";
import zoomIn from "./zoom-in-fill.svg";
import zoomOut from "./zoom-out-fill.svg";
import turnLeft from "./turn-left-fill.svg";
import turnRight from "./turn-right-fill.svg";
import wrong from "./wrong-fill.svg";
import right from "./right-fill.svg";
import word from "./word-fill.svg";
import slash from "./slash-fill.svg";

let res = [
	pen,
	revocation,
	trash,
	zoomIn,
	zoomOut,
	turnLeft,
	turnRight,
	wrong,
	right,
	word,
	slash,
];

export const svgContent = ` <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: absolute; width: 0; height: 0">${res.join(
	""
)}</svg>`;
