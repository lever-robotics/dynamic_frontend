import logoImg from "@/assets/lever-nobg.png";
import React, { useEffect, useState, useRef } from "react";

const AnimatedLogoDrawing = () => {
	const logoRef = useRef(null);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		// Start animation once component mounts
		setIsAnimating(true);

		// Get all path elements within the SVG
		if (logoRef.current) {
			const pathElements = logoRef.current.querySelectorAll(
				"path, line, polyline, polygon, rect, circle, ellipse",
			);

			// For each path element, calculate length and setup animation
			pathElements.forEach((path, index) => {
				// Skip elements that don't support getTotalLength()
				if (!path.getTotalLength) return;

				const pathLength = path.getTotalLength();

				// Set initial state - invisible
				path.style.strokeDasharray = pathLength;
				path.style.strokeDashoffset = pathLength;

				// Ensure path is visible (sometimes SVGs have 'none' for stroke)
				if (getComputedStyle(path).stroke === "none") {
					path.style.stroke = getComputedStyle(path).fill;
					path.style.fill = "none";
				}

				// Animate with delay based on element index for sequential animation
				setTimeout(() => {
					path.style.transition = `stroke-dashoffset ${1 + index * 0.2}s ease-in-out`;
					path.style.strokeDashoffset = "0";
				}, index * 150);
			});
		}
	}, []);

	return (
		<div className="w-full flex justify-center p-8">
			<div ref={logoRef} className="max-w-[500px] w-full">
				<img src={logoImg} alt="Lever Logo" className="w-full h-auto" />
			</div>
		</div>
	);
};

export default AnimatedLogoDrawing;
