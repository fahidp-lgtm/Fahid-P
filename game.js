// game.js for Dedicated 3D Portfolio Page
const canvas = document.getElementById('game-canvas');
const startOverlay = document.getElementById('start-overlay');
const infoModal = document.getElementById('info-modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalLinks = document.getElementById('modal-links');

let isPlaying = false;
let animationId;

// Three.js Globals
let scene, camera, renderer;
let carGroup;
let wheels = [];
const interactables = []; // Buildings and Skill Boards
let activeModal = false;

// Physics / Control
const carLogic = {
    speed: 0,
    maxSpeed: 1.2,
    acceleration: 0.02,
    friction: 0.015,
    steering: 0,
    maxSteering: 0.06,
    angle: 0
};

const keys = { w: false, a: false, s: false, d: false };

// Portfolio Data
const portfolioData = [
    {
        type: 'project',
        title: 'ERP Automation Suite',
        description: 'End-to-end automation framework built using Selenium WebDriver and TestNG for a vast ERP system processing 10k+ daily transactions.',
        links: [
            { label: 'GitHub', url: '#' },
            { label: 'Live Demo', url: '#' }
        ],
        position: { x: 30, z: -40 },
        color: '#3b82f6' // Blue
    },
    {
        type: 'project',
        title: 'Banking API Tester',
        description: 'Comprehensive Postman & RestAssured API testing suite ensuring secure and fast financial transaction routing.',
        links: [
            { label: 'View Case Study', url: '#' }
        ],
        position: { x: -40, z: -20 },
        color: '#10b981' // Emerald
    },
    {
        type: 'project',
        title: 'AI Trading Bot QA',
        description: 'Verified machine learning predictions and data integrity against real-time market streams using Python and PyTest.',
        links: [
            { label: 'Architecture', url: '#' }
        ],
        position: { x: -25, z: 40 },
        color: '#8b5cf6' // Violet
    },
    {
        type: 'skill',
        title: 'Test Automation',
        description: 'Expertise in building scalable, robust automation frameworks from scratch using Selenium, Cypress, and Playwright.',
        links: [],
        position: { x: 40, z: 20 },
        color: '#f59e0b' // Amber
    },
    {
        type: 'skill',
        title: 'CI/CD Pipelines',
        description: 'Deep knowledge of Jenkins, GitHub Actions, and Docker to facilitate continuous testing and continuous delivery.',
        links: [],
        position: { x: 10, z: 50 },
        color: '#ef4444' // Red
    }
];

function initThreeJS() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    scene.fog = new THREE.Fog('#0f172a', 30, 200);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, -30);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 250;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    scene.add(dirLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    const groundMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.9, metalness: 0.1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    createGridHelper();
    createWorld();
    createCar();

    window.addEventListener('resize', onWindowResize);
    onWindowResize();

    // Start idle loop
    animate();
}

function createGridHelper() {
    const gridHelper = new THREE.GridHelper(500, 100, 0x334155, 0x0f172a);
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);
}

function createCar() {
    carGroup = new THREE.Group();
    
    // Aesthetic similar to Bruno Simon but slightly tailored to dark mode
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.3, metalness: 0.4 });
    const windowMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1, metalness: 0.9 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#020617', roughness: 0.9 });

    // Chassis
    const chassisGeo = new THREE.BoxGeometry(2.4, 1.0, 4.8);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.8;
    chassis.castShadow = true;
    carGroup.add(chassis);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(2.0, 0.8, 2.4);
    const cabin = new THREE.Mesh(cabinGeo, windowMat);
    cabin.position.set(0, 1.7, -0.4);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Headlights
    const lightGeo = new THREE.BoxGeometry(0.5, 0.3, 0.1);
    const lightMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
    const lightL = new THREE.Mesh(lightGeo, lightMat);
    lightL.position.set(-0.8, 0.8, 2.41);
    const lightR = new THREE.Mesh(lightGeo, lightMat);
    lightR.position.set(0.8, 0.8, 2.41);
    carGroup.add(lightL);
    carGroup.add(lightR);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 24);
    wheelGeo.rotateZ(Math.PI / 2);

    const wheelPos = [
        [-1.4, 0.6, 1.6],
        [ 1.4, 0.6, 1.6],
        [-1.4, 0.6, -1.6],
        [ 1.4, 0.6, -1.6]
    ];

    wheelPos.forEach((pos, idx) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(...pos);
        wheel.castShadow = true;
        carGroup.add(wheel);
        
        // Hubcap
        const hubGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.45, 12);
        hubGeo.rotateZ(Math.PI / 2);
        const hubMat = new THREE.MeshStandardMaterial({color: '#94a3b8'});
        const hub = new THREE.Mesh(hubGeo, hubMat);
        wheel.add(hub);
        
        wheels.push(wheel);
    });

    scene.add(carGroup);
}

function createWorld() {
    // Generate Structures based on Portfolio Data
    portfolioData.forEach((item, index) => {
        if (item.type === 'project') {
            // Build a tall "Building"
            const height = 10 + Math.random() * 5;
            const geo = new THREE.BoxGeometry(6, height, 6);
            const mat = new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.7 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(item.position.x, height / 2, item.position.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);
            
            // Interaction zone visual
            createInteractionRing(item.position.x, item.position.z);
            interactables.push({ mesh, data: item, zoneRadius: 7 });

        } else if (item.type === 'skill') {
            // Build a "Billboard"
            const trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 6);
            const trunkMat = new THREE.MeshStandardMaterial({ color: '#334155' });
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.set(item.position.x, 3, item.position.z);
            trunk.castShadow = true;
            scene.add(trunk);

            const boardGeo = new THREE.BoxGeometry(8, 4, 0.5);
            const boardMat = new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.4 });
            const board = new THREE.Mesh(boardGeo, boardMat);
            board.position.set(item.position.x, 8, item.position.z);
            board.rotation.y = Math.PI / 4; // Angle it slightly
            board.castShadow = true;
            scene.add(board);
            
            createInteractionRing(item.position.x, item.position.z);
            interactables.push({ mesh: trunk, data: item, zoneRadius: 6 });
        }
    });

    // Add some random decorative blocks (Trees/Rocks)
    const decoMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.8 });
    for(let i=0; i<40; i++) {
        const size = 1 + Math.random() * 2;
        const box = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), decoMat);
        box.position.set(
            (Math.random() - 0.5) * 200,
            size / 2,
            (Math.random() - 0.5) * 200
        );
        // keep away from center
        if (box.position.length() > 20) {
            box.castShadow = true;
            scene.add(box);
        }
    }
}

function createInteractionRing(x, z) {
    const ringGeo = new THREE.TorusGeometry(4, 0.1, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#10b981' });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, 0.2, z);
    scene.add(ring);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Input Handling
document.addEventListener('keydown', (e) => {
    if (activeModal) {
        if (e.key === 'Escape') closeModal();
        return;
    }
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    
    const k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') keys.w = true;
    if (k === 'arrowdown' || k === 's') keys.s = true;
    if (k === 'arrowleft' || k === 'a') keys.a = true;
    if (k === 'arrowright' || k === 'd') keys.d = true;
});

document.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') keys.w = false;
    if (k === 'arrowdown' || k === 's') keys.s = false;
    if (k === 'arrowleft' || k === 'a') keys.a = false;
    if (k === 'arrowright' || k === 'd') keys.d = false;
});

function updateCarPhysics() {
    if (keys.w) carLogic.speed += carLogic.acceleration;
    else if (keys.s) carLogic.speed -= carLogic.acceleration;
    else {
        if (carLogic.speed > 0) {
            carLogic.speed -= carLogic.friction;
            if (carLogic.speed < 0) carLogic.speed = 0;
        } else if (carLogic.speed < 0) {
            carLogic.speed += carLogic.friction;
            if (carLogic.speed > 0) carLogic.speed = 0;
        }
    }

    carLogic.speed = Math.max(-carLogic.maxSpeed/2, Math.min(carLogic.maxSpeed, carLogic.speed));

    const isMoving = Math.abs(carLogic.speed) > 0.01;
    if (isMoving) {
        const steeringDir = carLogic.speed > 0 ? 1 : -1;
        if (keys.a) carLogic.angle += carLogic.maxSteering * steeringDir;
        else if (keys.d) carLogic.angle -= carLogic.maxSteering * steeringDir;
    }

    carGroup.rotation.y = carLogic.angle;
    carGroup.position.x += Math.sin(carLogic.angle) * carLogic.speed;
    carGroup.position.z += Math.cos(carLogic.angle) * carLogic.speed;

    // Bounds constraint
    carGroup.position.x = Math.max(-230, Math.min(230, carGroup.position.x));
    carGroup.position.z = Math.max(-230, Math.min(230, carGroup.position.z));

    const wheelRot = carLogic.speed * 0.4;
    wheels.forEach((w, i) => {
        w.rotation.x -= wheelRot;
        if (i < 2) { // Front wheels
            if (keys.a) w.rotation.y = Math.PI/2 + 0.5;
            else if (keys.d) w.rotation.y = Math.PI/2 - 0.5;
            else w.rotation.y = Math.PI/2;
        }
    });

    // Camera follow smoothly
    const offsetDistance = 25;
    const heightOffset = 20;
    
    const camTargetX = carGroup.position.x - Math.sin(carLogic.angle) * offsetDistance;
    const camTargetZ = carGroup.position.z - Math.cos(carLogic.angle) * offsetDistance;
    
    camera.position.x += (camTargetX - camera.position.x) * 0.08;
    camera.position.z += (camTargetZ - camera.position.z) * 0.08;
    camera.position.y += ((carGroup.position.y + heightOffset) - camera.position.y) * 0.08;

    const lookAtTarget = new THREE.Vector3(
        carGroup.position.x + Math.sin(carLogic.angle) * 15,
        carGroup.position.y,
        carGroup.position.z + Math.cos(carLogic.angle) * 15
    );
    camera.lookAt(lookAtTarget);
}

function checkInteractions() {
    const carPos = carGroup.position;
    
    interactables.forEach(item => {
        // Distance check in XZ plane (ignore Y)
        const dx = carPos.x - item.mesh.position.x;
        const dz = carPos.z - item.mesh.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);

        if (dist < item.zoneRadius) {
            // Hit interactive zone! Bounce car back slightly to simulate wall
            carLogic.speed *= -0.5; 
            carGroup.position.x -= Math.sin(carLogic.angle) * 1.5;
            carGroup.position.z -= Math.cos(carLogic.angle) * 1.5;

            keys.w = keys.a = keys.s = keys.d = false; // Stop inputs
            openModal(item.data);
        }
    });
}

function openModal(data) {
    if (activeModal) return;
    activeModal = true;
    isPlaying = false;

    modalTitle.textContent = data.title;
    modalDesc.textContent = data.description;
    
    modalLinks.innerHTML = '';
    if (data.links && data.links.length > 0) {
        data.links.forEach(link => {
            const btn = document.createElement('a');
            btn.href = link.url;
            btn.className = 'modal-btn';
            btn.style.textDecoration = 'none';
            btn.innerText = link.label;
            modalLinks.appendChild(btn);
        });
    }

    infoModal.classList.add('active');
}

window.closeModal = function() {
    activeModal = false;
    infoModal.classList.remove('active');
    
    // Slight delay before resuming to prevent instant re-trigger
    setTimeout(() => {
        isPlaying = true;
    }, 200);
}

window.startGame = function() {
    startOverlay.style.display = 'none';
    
    // Jump camera directly behind car
    camera.position.set(carGroup.position.x, 20, carGroup.position.z - 25);
    camera.lookAt(carGroup.position);
    
    isPlaying = true;
}

function animate() {
    animationId = requestAnimationFrame(animate);

    if (isPlaying) {
        updateCarPhysics();
        checkInteractions();
    } else if (!activeModal) {
        // Idle camera orbiting the vehicle
        if (carGroup) {
            camera.position.x = Math.sin(Date.now() * 0.0003) * 40;
            camera.position.z = Math.cos(Date.now() * 0.0003) * 40;
            camera.position.y = 25;
            camera.lookAt(carGroup.position);
        }
    }
    
    renderer.render(scene, camera);
}

// Boot up game
initThreeJS();
