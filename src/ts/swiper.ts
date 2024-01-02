interface SwiperOptions {
	autoplay?: boolean;
	delay?: number;
	enablePlay?: boolean;
	enablePagination?: boolean;
	pagination?: any;
	onSlideAdded?: ((newSlide: HTMLElement) => void) | null;
	onSlideChanged?: ((index: number) => void) | null;
}

interface Pagination {
	updatePageNumber: (length: number) => void;
	activePageNumberByIndex: (index: number) => void;
}

export class Swiper {
	lastPagination: HTMLElement | null = null;
	settings: SwiperOptions;
	container: HTMLElement;
	wrapper: HTMLElement;
	slides: NodeListOf<HTMLElement>;
	currentSlideIndex: number = 0;
	slideWidth: number;
	autoSlideInterval: any;
	observer: MutationObserver;

	constructor(selector: string | HTMLElement, options: SwiperOptions) {
		const defaultOptions: SwiperOptions = {
			autoplay: true,
			delay: 3000,
			enablePlay: true,
			enablePagination: false,
			pagination: null,
		};

		this.settings = Object.assign(
			{
				onSlideAdded: null,
				onSlideChanged: null,
			},
			defaultOptions,
			options
		);

		this.container =
			typeof selector === "string"
				? (document.querySelector(selector)! as HTMLElement)
				: selector;
		this.wrapper = this.container.querySelector(
			".swiper-wrapper"
		)! as HTMLElement;
		this.slides = this.wrapper.querySelectorAll(
			".swiper-slide"
		) as NodeListOf<HTMLElement>;

		this.slideWidth = this.slides[0].clientWidth;
		this.autoSlideInterval = setTimeout(() => {}, 0);

		this.observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === "childList" && mutation.addedNodes.length) {
					this.handleSlideAdded(mutation.addedNodes[0] as HTMLElement);
				} else if (
					mutation.type === "childList" &&
					mutation.removedNodes.length
				) {
					this.handleSlideDeleted(mutation.removedNodes[0] as HTMLElement);
				}
			});
		});

		this.observer.observe(this.wrapper, { childList: true });

		if (this.settings.enablePlay) {
			this.container.addEventListener(`mouseenter`, () => {
				this.stopAutoSlide();
			});

			this.container.addEventListener(`mouseleave`, () => {
				this.startAutoSlide();
			});
		}

		this.slideTo = this.slideTo.bind(this);
	}

	destroy() {
		this.container.removeEventListener(`mouseenter`, () => {
			this.stopAutoSlide();
		});

		this.container.removeEventListener(`mouseleave`, () => {
			this.startAutoSlide();
		});
		this.observer.disconnect();
	}

	handleSlideDeleted(deletedSlide: HTMLElement) {
		this.refreshSlide();
		this.updatePageNumber();
		let slideIndex = this.currentSlideIndex % this.slides.length;
		this.slideTo(slideIndex);
	}

	handleSlideAdded(newSlide: HTMLElement) {
		this.refreshSlide();
		this.updatePageNumber();
		if (typeof this.settings.onSlideAdded === "function") {
			this.settings.onSlideAdded(newSlide);
		}
		this.slideTo(this.currentSlideIndex);
	}

	updatePageNumber() {
		if (this.settings.enablePagination) {
			(this.settings.pagination as Pagination).updatePageNumber(
				this.slides.length
			);
		}
	}

	activePageNumberByIndex(index: number) {
		if (this.settings.enablePagination) {
			(this.settings.pagination as Pagination).activePageNumberByIndex(index);
		}
	}

	refreshSlide() {
		this.slides = this.wrapper.querySelectorAll(
			".swiper-slide"
		) as NodeListOf<HTMLElement>;
	}

	slideToNext() {
		this.currentSlideIndex++;
		if (this.currentSlideIndex > this.slides.length - 1) {
			this.currentSlideIndex = 0;
		}
		this.activePageNumberByIndex(this.currentSlideIndex);
		this.wrapper.style.transition = "transform 0.3s ease-in-out";
		this.wrapper.style.transform = `translateX(-${
			this.slideWidth * this.currentSlideIndex
		}px)`;
	}

	startAutoSlide() {
		this.autoSlideInterval = setInterval(() => {
			this.slideToNext();
		}, this.settings.delay!);
	}

	stopAutoSlide() {
		clearInterval(this.autoSlideInterval);
	}

	init() {
		this.wrapper.style.transform = `translateX(-${
			this.slideWidth * this.currentSlideIndex
		}px)`;
		this.refreshSlide();
		this.updatePageNumber();
		if (this.settings.enablePlay && this.settings.autoplay) {
			this.startAutoSlide();
		}
		this.slideTo(this.currentSlideIndex);
	}

	slideTo(index: number) {
		this.currentSlideIndex = index;
		if (this.currentSlideIndex < 0) {
			this.currentSlideIndex = this.slides.length - 1;
		} else if (this.currentSlideIndex > this.slides.length - 1) {
			this.currentSlideIndex = 0;
		}
		this.activePageNumberByIndex(index);
		if (typeof this.settings.onSlideChanged === "function") {
			this.settings.onSlideChanged(index);
		}
		this.wrapper.style.transition = "transform 0.3s ease-in-out";
		this.wrapper.style.transform = `translateX(-${
			this.slideWidth * this.currentSlideIndex
		}px)`;
	}

	slideToPrev() {
		this.currentSlideIndex--;
		if (this.currentSlideIndex < 0) {
			this.currentSlideIndex = this.slides.length - 1;
		}
		this.activePageNumberByIndex(this.currentSlideIndex);
		this.wrapper.style.transition = "transform 0.3s ease-in-out";
		this.wrapper.style.transform = `translateX(-${
			this.slideWidth * this.currentSlideIndex
		}px)`;
	}
}
