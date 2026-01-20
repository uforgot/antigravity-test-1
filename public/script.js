// Three.js Scene Setup
let scene, camera, renderer;
let particles = [];
let constellations = [];
let constellationLines = [];
let constellationStars = [];
let shootingStars = [];
let currentSection = 0;

// Configuration
const CONFIG = {
    backgroundStarCount: 800,
    scrollSectionHeight: 150, // vh per section
    scrollStopDelay: 200, // ms before snap
    cameraFOV: 75,
    snapThreshold: 0.05 // Distance threshold for direct snap
};

// Initialize Three.js
function initThree() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    // Camera
    camera = new THREE.PerspectiveCamera(
        CONFIG.cameraFOV,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 10);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('threejs-container').appendChild(renderer.domElement);

    // Lights (ambient for visibility)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
}

// Star/Particle creation
function createStar(x, y, z, size = 0.5, brightness = 1.0, isConstellation = false) {
    // Create sprite for better glow effect
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Star color variation based on temperature (blue = hot, red = cool)
    const colorVariation = Math.random();
    let r, g, b;

    if (colorVariation < 0.1) {
        // Blue-white stars (hot)
        r = 180; g = 200; b = 255;
    } else if (colorVariation < 0.25) {
        // White stars
        r = 255; g = 255; b = 255;
    } else if (colorVariation < 0.5) {
        // Yellow-white stars
        r = 255; g = 250; b = 230;
    } else if (colorVariation < 0.75) {
        // Yellow stars
        r = 255; g = 240; b = 180;
    } else if (colorVariation < 0.9) {
        // Orange stars
        r = 255; g = 200; b = 120;
    } else {
        // Red-orange stars (cool)
        r = 255; g = 180; b = 100;
    }

    // Draw star with very subtle glow
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 20);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${brightness})`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${brightness * 0.5})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: brightness
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(size, size, 1);
    sprite.position.set(x, y, z);
    sprite.userData.isConstellation = isConstellation;
    sprite.userData.baseBrightness = brightness;
    sprite.userData.twinkleSpeed = Math.random() * 0.002 + 0.001;
    sprite.userData.twinklePhase = Math.random() * Math.PI * 2;

    return sprite;
}

// Constellation Data (3D positions)
function initConstellations() {
    constellations = [
        {
            name: 'Intro',
            title: '별자리 여행',
            description: '스크롤하여 아름다운 별자리들을 만나보세요',
            cameraPosition: { x: 0, y: 0, z: 10 },
            cameraLookAt: { x: 0, y: 0, z: 0 },
            stars: [] // Random stars only
        },
        {
            name: 'Big Dipper',
            title: '큰곰자리 (북두칠성)',
            description: '북반구에서 가장 잘 알려진 별자리로, 국자 모양을 하고 있습니다. 북극성을 찾는 길잡이 역할을 합니다.',
            image: 'big_dipper.png',
            cameraPosition: { x: 0, y: 0, z: -90 },
            cameraLookAt: { x: 0, y: 0, z: -100 },
            stars: [
                { position: { x: -8, y: 2, z: -100 }, size: 2.5, brightness: 2.0 },
                { position: { x: -5, y: 3.5, z: -100 }, size: 2.5, brightness: 2.0 },
                { position: { x: -2, y: 4, z: -100 }, size: 2.5, brightness: 2.0 },
                { position: { x: 1, y: 3.5, z: -100 }, size: 3, brightness: 2.5 },
                { position: { x: 4, y: 1, z: -100 }, size: 2.5, brightness: 2.0 },
                { position: { x: 2, y: -1, z: -100 }, size: 2.5, brightness: 2.0 },
                { position: { x: 3, y: -4, z: -100 }, size: 2.5, brightness: 2.0 }
            ],
            lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
        },
        {
            name: 'Orion',
            title: '오리온자리',
            description: '위대한 사냥꾼 오리온을 나타내는 별자리입니다. 베텔게우스와 리겔이 가장 밝게 빛나며, 중앙의 세 별은 오리온의 허리띠를 상징합니다.',
            image: 'orion.png',
            cameraPosition: { x: 2, y: 0, z: -190 },
            cameraLookAt: { x: 0, y: 0, z: -200 },
            stars: [
                { position: { x: -3, y: 5, z: -200 }, size: 3, brightness: 2.5 }, // Betelgeuse
                { position: { x: 0, y: 6, z: -200 }, size: 2.5, brightness: 1.8 },
                { position: { x: 3, y: 5, z: -200 }, size: 2.5, brightness: 2.0 }, // Bellatrix
                { position: { x: -1.5, y: 0, z: -200 }, size: 2.5, brightness: 1.8 }, // Belt
                { position: { x: 0, y: 0, z: -200 }, size: 2.5, brightness: 1.8 },
                { position: { x: 1.5, y: 0, z: -200 }, size: 2.5, brightness: 1.8 },
                { position: { x: -3, y: -5, z: -200 }, size: 2.5, brightness: 2.0 },
                { position: { x: 0, y: -6, z: -200 }, size: 3, brightness: 2.5 }, // Rigel
                { position: { x: 3, y: -5, z: -200 }, size: 2.5, brightness: 2.0 }
            ],
            lines: [[0, 1], [1, 2], [0, 3], [2, 5], [3, 4], [4, 5], [0, 6], [6, 7], [7, 8], [2, 8]]
        },
        {
            name: 'Cassiopeia',
            title: '카시오페이아자리',
            description: '에티오피아 왕비의 이름을 가진 별자리로, W 또는 M 모양을 하고 있습니다. 북극성 반대편에서 쉽게 찾을 수 있습니다.',
            image: 'cassiopeia.png',
            cameraPosition: { x: 0, y: 2, z: -290 },
            cameraLookAt: { x: 0, y: 0, z: -300 },
            stars: [
                { position: { x: -8, y: 0, z: -300 }, size: 2.5, brightness: 2.0 },
                { position: { x: -4, y: 2, z: -300 }, size: 2.5, brightness: 2.0 },
                { position: { x: 0, y: 0, z: -300 }, size: 3, brightness: 2.5 },
                { position: { x: 4, y: 2.5, z: -300 }, size: 2.5, brightness: 2.0 },
                { position: { x: 8, y: 0.5, z: -300 }, size: 2.5, brightness: 2.0 }
            ],
            lines: [[0, 1], [1, 2], [2, 3], [3, 4]]
        },
        {
            name: 'Lyra',
            title: '거문고자리',
            description: '오르페우스의 하프를 상징하는 별자리입니다. 베가는 여름 밤하늘에서 가장 밝게 빛나는 별 중 하나입니다.',
            image: 'lyra.png',
            cameraPosition: { x: 0, y: -1, z: -390 },
            cameraLookAt: { x: 0, y: 0, z: -400 },
            stars: [
                { position: { x: 0, y: 3, z: -400 }, size: 3.5, brightness: 3.0 }, // Vega
                { position: { x: -2, y: 0, z: -400 }, size: 2.5, brightness: 1.8 },
                { position: { x: 2, y: 0, z: -400 }, size: 2.5, brightness: 1.8 },
                { position: { x: -2.5, y: -3, z: -400 }, size: 2.5, brightness: 1.8 },
                { position: { x: 2.5, y: -3, z: -400 }, size: 2.5, brightness: 1.8 }
            ],
            lines: [[0, 1], [0, 2], [1, 3], [2, 4]]
        }
    ];
}

// Create all stars
function createStars() {
    // Create constellation stars
    constellations.forEach((constellation, constIndex) => {
        const constStars = [];
        constellation.stars.forEach((starData) => {
            const star = createStar(
                starData.position.x,
                starData.position.y,
                starData.position.z,
                starData.size,
                starData.brightness,
                true
            );
            scene.add(star);
            particles.push(star);
            constStars.push(star);
        });
        constellationStars[constIndex] = constStars;
    });

    // Create background stars (random distribution in 3D space)
    for (let i = 0; i < CONFIG.backgroundStarCount; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = Math.random() * -600 + 50; // Z from 50 to -550 (extended range)
        const size = 1;
        const brightness = Math.random() * 0.8 + 0.4; // 0.4 - 1.2

        const star = createStar(x, y, z, size, brightness, false);
        scene.add(star);
        particles.push(star);
    }

    // Add extra stars behind the last constellation for depth
    for (let i = 0; i < 300; i++) {
        const x = (Math.random() - 0.5) * 120;
        const y = (Math.random() - 0.5) * 120;
        const z = Math.random() * -200 - 400; // Z from -400 to -600 (behind last constellation)
        const size = 1;
        const brightness = Math.random() * 0.8 + 0.4;

        const star = createStar(x, y, z, size, brightness, false);
        scene.add(star);
        particles.push(star);
    }
}

// Create a shooting star
function createShootingStar() {
    // Random starting position
    const startX = (Math.random() - 0.5) * 150;
    const startY = Math.random() * 100 - 30;
    const startZ = Math.random() * -500 - 50;

    // Create line geometry for the trail
    const trailLength = 15;
    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(0, 0, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        linewidth: 2
    });

    const line = new THREE.Line(geometry, material);
    line.position.set(startX, startY, startZ);

    // Movement direction (diagonal downward)
    const velocity = {
        x: (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1),
        y: -(Math.random() * 1.5 + 1),
        z: -(Math.random() * 1 + 0.5)
    };

    const shootingStar = {
        mesh: line,
        velocity: velocity,
        life: 1.0,
        decay: 0.015,
        trailLength: trailLength
    };

    scene.add(line);
    shootingStars.push(shootingStar);
}

// Update shooting stars
function updateShootingStars() {
    // Randomly spawn new shooting stars
    if (Math.random() < 0.005) {
        createShootingStar();
    }

    // Update existing shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];

        // Move the shooting star
        star.mesh.position.x += star.velocity.x;
        star.mesh.position.y += star.velocity.y;
        star.mesh.position.z += star.velocity.z;

        // Update trail
        const positions = star.mesh.geometry.attributes.position;
        positions.setXYZ(0, 0, 0, 0);
        positions.setXYZ(1, -star.velocity.x * star.trailLength, -star.velocity.y * star.trailLength, -star.velocity.z * star.trailLength);
        positions.needsUpdate = true;

        // Fade out
        star.life -= star.decay;
        star.mesh.material.opacity = Math.max(0, star.life * 0.8);

        // Remove dead shooting stars
        if (star.life <= 0) {
            scene.remove(star.mesh);
            star.mesh.geometry.dispose();
            star.mesh.material.dispose();
            shootingStars.splice(i, 1);
        }
    }
}


// Create constellation lines
function createConstellationLines() {
    // Remove existing lines
    constellationLines.forEach(lineGroup => {
        lineGroup.forEach(line => scene.remove(line));
    });
    constellationLines = [];

    constellations.forEach((constellation, constIndex) => {
        const lines = [];
        if (constellation.lines && constellationStars[constIndex]) {
            constellation.lines.forEach(([startIdx, endIdx]) => {
                const startStar = constellationStars[constIndex][startIdx];
                const endStar = constellationStars[constIndex][endIdx];

                if (startStar && endStar) {
                    const points = [];
                    points.push(new THREE.Vector3(
                        startStar.position.x,
                        startStar.position.y,
                        startStar.position.z
                    ));
                    points.push(new THREE.Vector3(
                        endStar.position.x,
                        endStar.position.y,
                        endStar.position.z
                    ));

                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({
                        color: 0x88aaff,
                        transparent: true,
                        opacity: 0,
                        linewidth: 1
                    });

                    const line = new THREE.Line(geometry, material);
                    line.userData.constIndex = constIndex;
                    scene.add(line);
                    lines.push(line);
                }
            });
        }
        constellationLines[constIndex] = lines;
    });
}

// Update constellation line visibility with animation
let constellationAnimationState = [];

function updateConstellationLines() {
    const time = Date.now() * 0.001; // Convert to seconds
    const drawSpeed = 2.0; // Speed of drawing animation
    const pauseDuration = 1.0; // Pause before repeating

    constellationLines.forEach((lineGroup, constIndex) => {
        // Initialize animation state for this constellation if needed
        if (!constellationAnimationState[constIndex]) {
            constellationAnimationState[constIndex] = {
                phase: 'idle',
                currentLineIndex: 0,
                progress: 0,
                lastUpdateTime: time
            };
        }

        const state = constellationAnimationState[constIndex];
        const deltaTime = time - state.lastUpdateTime;
        state.lastUpdateTime = time;

        if (constIndex === currentSection && constIndex > 0) {
            // Active constellation - draw lines sequentially
            if (lineGroup.length > 0) {
                if (state.phase === 'idle') {
                    state.phase = 'drawing';
                    state.currentLineIndex = 0;
                    state.progress = 0;
                }

                if (state.phase === 'drawing') {
                    // Update progress
                    state.progress += deltaTime * drawSpeed;

                    // Draw all completed lines
                    lineGroup.forEach((line, lineIndex) => {
                        if (lineIndex < state.currentLineIndex) {
                            // Already completed - show full line
                            line.material.opacity = 0.6;
                            updateLineGeometry(line, 1.0);
                        } else if (lineIndex === state.currentLineIndex) {
                            // Currently drawing line
                            const lineProgress = Math.min(state.progress, 1.0);
                            line.material.opacity = 0.6;
                            updateLineGeometry(line, lineProgress);
                        } else {
                            // Not yet drawn
                            line.material.opacity = 0;
                        }
                    });

                    // Check if current line is complete
                    if (state.progress >= 1.0) {
                        state.currentLineIndex++;
                        state.progress = 0;

                        // Check if all lines are complete
                        if (state.currentLineIndex >= lineGroup.length) {
                            state.phase = 'complete';
                            state.pauseStartTime = time;
                        }
                    }
                } else if (state.phase === 'complete') {
                    // Show all lines
                    lineGroup.forEach(line => {
                        line.material.opacity = 0.6;
                        updateLineGeometry(line, 1.0);
                    });

                    // Wait before restarting
                    if (time - state.pauseStartTime >= pauseDuration) {
                        state.phase = 'idle';
                    }
                }
            }
        } else {
            // Inactive constellation - fade out
            lineGroup.forEach(line => {
                if (line.material.opacity > 0) {
                    line.material.opacity = Math.max(0, line.material.opacity - 0.02);
                }
            });

            // Reset animation state
            state.phase = 'idle';
            state.currentLineIndex = 0;
            state.progress = 0;
        }
    });
}

// Helper function to update line geometry for partial drawing
function updateLineGeometry(line, progress) {
    const positions = line.userData.originalPositions;
    if (!positions) {
        // Store original positions
        const posArray = line.geometry.attributes.position.array;
        line.userData.originalPositions = new Float32Array(posArray);
    }

    const origPos = line.userData.originalPositions;
    const startX = origPos[0], startY = origPos[1], startZ = origPos[2];
    const endX = origPos[3], endY = origPos[4], endZ = origPos[5];

    // Calculate intermediate point
    const currentX = startX + (endX - startX) * progress;
    const currentY = startY + (endY - startY) * progress;
    const currentZ = startZ + (endZ - startZ) * progress;

    // Update geometry
    const posAttr = line.geometry.attributes.position;
    posAttr.setXYZ(1, currentX, currentY, currentZ);
    posAttr.needsUpdate = true;
}


// Interpolate between two positions based on progress (0-1)
function interpolatePosition(pos1, pos2, progress) {
    return {
        x: pos1.x + (pos2.x - pos1.x) * progress,
        y: pos1.y + (pos2.y - pos1.y) * progress,
        z: pos1.z + (pos2.z - pos1.z) * progress
    };
}

// Update camera position based on scroll
function updateCameraFromScroll() {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const totalScrollHeight = viewportHeight * (CONFIG.scrollSectionHeight / 100) * (constellations.length - 1);

    // Calculate overall progress (0 to constellations.length - 1)
    const scrollProgress = Math.min(Math.max(scrollY / totalScrollHeight, 0), 1) * (constellations.length - 1);

    // Determine which two constellations to interpolate between
    const sectionIndex = Math.floor(scrollProgress);
    const nextSectionIndex = Math.min(sectionIndex + 1, constellations.length - 1);
    const sectionProgress = scrollProgress - sectionIndex; // 0-1 within current section

    // Get constellation data
    const currentConstellation = constellations[sectionIndex];
    const nextConstellation = constellations[nextSectionIndex];

    // Interpolate camera position
    const interpolatedPos = interpolatePosition(
        currentConstellation.cameraPosition,
        nextConstellation.cameraPosition,
        sectionProgress
    );

    // Interpolate look-at position
    const interpolatedLookAt = interpolatePosition(
        currentConstellation.cameraLookAt,
        nextConstellation.cameraLookAt,
        sectionProgress
    );

    // Set camera position and look-at directly (no lerp delay)
    camera.position.set(interpolatedPos.x, interpolatedPos.y, interpolatedPos.z);
    camera.lookAt(interpolatedLookAt.x, interpolatedLookAt.y, interpolatedLookAt.z);

    // Update current section for markers
    const newSection = sectionIndex;
    if (newSection !== currentSection) {
        currentSection = newSection;
        updateMarkers();
        updateConstellationInfo();
    }
}

// Scroll handling
function handleScroll() {
    updateCameraFromScroll();
}

// Update section markers
function updateMarkers() {
    const markers = document.querySelectorAll('.marker');
    markers.forEach((marker, index) => {
        if (index === currentSection) {
            marker.classList.add('active');
        } else {
            marker.classList.remove('active');
        }
    });
}

// Update constellation information display
function updateConstellationInfo() {
    const introElement = document.getElementById('intro-section');
    const infoElement = document.getElementById('constellation-info');
    const titleElement = document.getElementById('constellation-title');
    const descriptionElement = document.getElementById('constellation-description');
    const imageElement = document.getElementById('constellation-image');
    const introDescElement = document.getElementById('intro-description');

    const constellation = constellations[currentSection];

    if (currentSection === 0) {
        // Show intro section
        introDescElement.textContent = constellation.description;
        introElement.classList.add('visible');
        infoElement.classList.remove('visible');
    } else if (constellation && constellation.title && constellation.description) {
        // Show constellation info section
        titleElement.textContent = constellation.title;
        descriptionElement.textContent = constellation.description;
        if (constellation.image) {
            imageElement.src = constellation.image;
            imageElement.alt = constellation.title;
            imageElement.style.display = 'block';
        } else {
            imageElement.style.display = 'none';
        }
        infoElement.classList.add('visible');
        introElement.classList.remove('visible');
    } else {
        // Hide both
        infoElement.classList.remove('visible');
        introElement.classList.remove('visible');
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update particle twinkling and size
    particles.forEach(particle => {
        // Enhanced twinkle effect for more noticeable sparkle
        particle.userData.twinklePhase += particle.userData.twinkleSpeed;
        const twinkle = Math.sin(particle.userData.twinklePhase) * 0.35 + 0.65; // Range: 0.3 - 1.0
        particle.material.opacity = particle.userData.baseBrightness * twinkle;

        // Fixed size of 0.4 regardless of camera distance
        particle.scale.set(0.4, 0.4, 1);
    });

    // Update constellation line animations
    updateConstellationLines();

    // Update shooting stars
    updateShootingStars();

    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Section marker click handlers
function initMarkers() {
    document.querySelectorAll('.marker').forEach((marker, index) => {
        marker.addEventListener('click', () => {
            const viewportHeight = window.innerHeight;
            const sectionHeight = viewportHeight * (CONFIG.scrollSectionHeight / 100);
            window.scrollTo({
                top: index * sectionHeight,
                behavior: 'smooth'
            });
        });
    });
}

// Throttle scroll events
let scrollThrottleTimeout;
window.addEventListener('scroll', () => {
    if (scrollThrottleTimeout) return;
    scrollThrottleTimeout = setTimeout(() => {
        handleScroll();
        scrollThrottleTimeout = null;
    }, 16); // ~60fps
});

window.addEventListener('resize', onWindowResize);

// Initialize everything
initThree();
initConstellations();
createStars();
createConstellationLines();
initMarkers();
updateMarkers();
updateConstellationInfo();
updateCameraFromScroll();
animate();
