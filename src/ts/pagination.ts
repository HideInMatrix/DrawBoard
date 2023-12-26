import { EventMethods } from "./event";

interface PaginationOptions {
	activePageAction?: ((dom: HTMLElement) => void) | null;
}

export class Pagination {
	lastPagination: HTMLElement | null = null;
	container: string | HTMLElement;
	options: PaginationOptions;

	constructor(container: string | HTMLElement, options: PaginationOptions) {
		this.container = container;
		let defaultOptions = {};

		this.options = Object.assign(
			{
				activePageAction: null,
			},
			defaultOptions,
			options
		);

		this.updatePageNumber = this.updatePageNumber.bind(this);
		this.activePageNumberByDom = this.activePageNumberByDom.bind(this);
		this.activePageNumberByIndex = this.activePageNumberByIndex.bind(this);
	}

	updatePageNumber(pageNumber: number) {
		let _pagination =
			typeof this.container === "string"
				? (document.querySelector(this.container) as HTMLElement)
				: this.container;
		while (_pagination.firstElementChild) {
			_pagination.firstElementChild.removeEventListener(
				EventMethods.MOUSEDOWN,
				() => {
					this.activePageNumberByDom(
						_pagination.firstElementChild as HTMLElement
					);
				}
			);
			_pagination.removeChild(_pagination.firstElementChild);
		}

		for (let index = 0; index < pageNumber; index++) {
			let navItem = document.createElement("li");
			// 此处根据父元素的dataset属性增加，感觉不是很优雅，目前没想到更好的方法
			let parentDataset = _pagination.dataset;
			for (let [k, v] of Object.entries(parentDataset)) {
				if (k[0] === "v") {
					let _k = k.slice(1);
					_k = _k.toLowerCase();
					navItem.setAttribute(`data-v-${_k}`, "");
				}
			}
			navItem.className = `pagination-item`;
			navItem.setAttribute("data-page", index.toString());
			navItem.textContent = (index + 1).toString();
			navItem.addEventListener(EventMethods.MOUSEDOWN, () => {
				this.activePageNumberByDom(navItem);
			});
			_pagination.appendChild(navItem);
		}
	}

	activePageNumberByDom(_dom: HTMLElement) {
		if (this.lastPagination) {
			this.lastPagination.classList.remove("active");
		}
		_dom.classList.add("active");
		this.lastPagination = _dom;
		if (typeof this.options.activePageAction === "function") {
			this.options.activePageAction(_dom);
		}
	}

	activePageNumberByIndex(index: number) {
		if (this.lastPagination) {
			this.lastPagination.classList.remove("active");
		}
		let _paginationList =
			typeof this.container === "string"
				? document.querySelectorAll(`${this.container} .pagination-item`)
				: this.container.querySelectorAll(".pagination-item");
		(_paginationList[index] as HTMLElement)?.classList.add("active");
		this.lastPagination = _paginationList[index] as HTMLElement;
	}

	destroyPagination() {
		let _pagination =
			typeof this.container === "string"
				? (document.querySelector(this.container) as HTMLElement)
				: this.container;
		while (_pagination.firstElementChild) {
			_pagination.firstElementChild.removeEventListener(
				EventMethods.MOUSEDOWN,
				() => {
					this.activePageNumberByDom(
						_pagination.firstElementChild as HTMLElement
					);
				}
			);
			_pagination.removeChild(_pagination.firstElementChild);
		}
	}
}
