import React, { forwardRef, useImperativeHandle, useState } from "react";
import { classNames } from "@/utils/classNames";

export const PaginationComponent = forwardRef(
	(
		{ count = 1, changeIndex }: { count: number; changeIndex: Function },
		ref
	) => {
		const [currentIndex, setCurrentIndex] = useState(0);

		const setIndex = (index: number) => {
			// changeIndex(index);
			setCurrentIndex(index);
		};

		useImperativeHandle<unknown, { setIndex: Function }>(ref, () => {
			return {
				setIndex: setIndex,
			};
		});

		return (
			<ul className="pagination-list">
				{Array.from({ length: count }, (_, index) => (
					<li
						key={index}
						className={classNames(
							"pagination-item",
							index === currentIndex ? "active" : ""
						)}
						onClick={() => setIndex(index)}>
						{index + 1}
					</li>
				))}
			</ul>
		);
	}
);
