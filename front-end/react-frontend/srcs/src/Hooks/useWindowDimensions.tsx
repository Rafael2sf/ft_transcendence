import {useState, useEffect, useRef} from 'react';

interface WindowDims {
	width: number,
	height: number
}

function getWindowDimensions(): WindowDims {
	const {innerWidth: width, innerHeight: height} = window;
	return {
		width,
		height
	}
}

export default function useWindowDimensions(): WindowDims {
	const [windowDims, setWindowDims] = useState<WindowDims>(() => getWindowDimensions());
	const timer = useRef<number>(0);

	useEffect(() => {
		function handleResize() {
			if (timer)
				clearTimeout(timer.current)
			timer.current = setTimeout(() => {
				setWindowDims(getWindowDimensions());
			}, 100); //delay state change after 0.5s
		}
	
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	  }, []);
	
	  return windowDims;
}