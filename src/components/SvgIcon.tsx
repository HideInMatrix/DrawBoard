import React, { useMemo } from "react";
import "./svg.scss";

function SvgIcon(props) {
	const iconName = useMemo(() => {
		return `#icon-${props.iconClass}`;
	}, [props.iconClass]);

	const svgClass = useMemo(() => {
		if (props.className) {
			return "svg-icon " + props.className;
		} else {
			return "svg-icon";
		}
	}, [props.className]);
	return (
		<svg className={svgClass} aria-hidden="true">
			<use xlinkHref={iconName} />
		</svg>
	);
}

export default SvgIcon;
