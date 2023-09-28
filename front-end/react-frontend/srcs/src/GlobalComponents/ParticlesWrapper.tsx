import type { Container, Engine } from "tsparticles-engine";
import Particles from "react-particles";
import React, { useCallback } from 'react';
import { loadFull } from "tsparticles";

export default function ParticlesWrapper() {
	const particlesInit = useCallback(async (engine: Engine) => {

	// you can initialize the tsParticles instance (engine) here, adding custom shapes or presets
	// this loads the tsparticles package bundle, it's the easiest method for getting everything ready
	// starting from v2 you can add only the features you need reducing the bundle size
	await loadFull(engine);
  }, []);
  
  const particlesLoaded = useCallback(async (container: Container | undefined) => {
  }, []);

  return (
	<Particles
		id="tsparticles"
		init={particlesInit}
		loaded={particlesLoaded}
		options={{
			particles: {
				number: { value: 400, density: { enable: true, value_area: 800 } },
				color: { value: "#ffffff" },
				shape: {
					type: "edge",
					stroke: { width: 0, color: "#000000" },
					polygon: { nb_sides: 5 },
				},
				opacity: {
					value: 0.5,
					random: true,
					anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false }
				},
				size: {
					value: 10,
					random: true,
					anim: { enable: false, speed: 40, size_min: 0.1, sync: false }
				},
				line_linked: {
					enable: false,
					distance: 500,
					color: "#ffffff",
					opacity: 0.4,
					width: 2
				},
				move: {
					enable: true,
					speed: 6,
					direction: "none",
					random: true,
					straight: false,
					out_mode: "out",
					bounce: false,
					attract: { enable: false, rotateX: 600, rotateY: 1200 }
				}
				},
				interactivity: {
				detect_on: "window",
				events: {
					onhover: { enable: true, mode: "bubble" },
					onclick: { enable: true, mode: "repulse" },
					resize: true
				},
				modes: {
					grab: { distance: 400, line_linked: { opacity: 0.5 } },
					bubble: { distance: 400, size: 4, duration: 0.3, opacity: 1, speed: 3 },
					repulse: { distance: 200, duration: 0.4 },
					push: { particles_nb: 4 },
					remove: { particles_nb: 2 }
				}
			},
		}}
    />
  )
}