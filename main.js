import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let animationsEnabled = true; // Animations are enabled by default

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Loading Stuff
function incrementCurrentNumber() {
  var currentNumberElement = document.getElementById('current-number');
  var currentNumber = parseInt(currentNumberElement.textContent, 10);
  currentNumberElement.textContent = currentNumber + 1;
}

function incrementTotalNumber() {
  var totalNumberElement = document.getElementById('total-number');
  var totalNumber = parseInt(totalNumberElement.textContent, 10);
  totalNumberElement.textContent = totalNumber + 1;
}

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
const camera_starting_y = 30;
camera.position.setZ(75);
camera.position.setY(camera_starting_y);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 75;
controls.maxPolarAngle = Math.PI / 2;
controls.enablePan = false;
controls.target.copy(new THREE.Vector3(0, camera_starting_y, -1));

function smoothMoveToPosition(targetPosition, targetLookAt) {
  const currentPosition = camera.position.clone();
  const currentTarget = controls.target.clone();

  // Tween the camera position
  new TWEEN.Tween(currentPosition)
    .to(targetPosition, 500)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      camera.position.copy(currentPosition);
    })
    .start();

  // Tween the target (lookAt position)
  new TWEEN.Tween(currentTarget)
    .to(targetLookAt, 500)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      controls.target.copy(currentTarget);
    })
    .onComplete(() => {
      controls.update(); // Make sure to call update after the tween is complete
    })
    .start();
}

const ambientLight = new THREE.AmbientLight(0xFFF8EA, 0.5);
scene.add(ambientLight);

const topDirectionalLight = new THREE.DirectionalLight(0xFEC082, 0.5);
topDirectionalLight.castShadow = true;
scene.add(topDirectionalLight);

const bottomDirectionalLight = new THREE.DirectionalLight(0xFEC082, 0.5);
bottomDirectionalLight.castShadow = true;
bottomDirectionalLight.position.set(0, -1, 0);
scene.add(bottomDirectionalLight);

// Stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  let positionIsValid = false;
  let x, y, z;

  // Keep generating random positions until a valid one is found
  while (!positionIsValid) {
    x = THREE.MathUtils.randFloatSpread(500);
    y = THREE.MathUtils.randFloatSpread(500);
    z = THREE.MathUtils.randFloatSpread(500);

    // Check if the distance from the origin is greater than the minimum distance
    const distance = Math.sqrt(x * x + y * y + z * z);
    if (distance > controls.minDistance) {
      positionIsValid = true;
    }
  }

  star.position.set(x, y, z);
  scene.add(star);

  // Create a bobbing animation using Tween.js with a random delay
  const delay = Math.random() * 2000; // Random delay between 0 and 2000 milliseconds
  const positionTween = new TWEEN.Tween(star.position)
    .to({ y: star.position.y + 2 }, 1000)
    .delay(delay)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .yoyo(true)
    .repeat(Infinity)
    .start();
}

Array(400).fill().forEach(addStar);

const loader = new GLTFLoader();
const books = []; // Array to store the loaded models
let mixer; // Animation mixer variable
let base_position_y; // Variable to store the base position

// Modified to remove "The Handmaid's Tale" and "Focus"
const modelsToLoad = ['aboutmev4.glb', 'theevery.glb', 'chipwar.glb'];
const mixers = [];
// Load the book model for each book
for (let i = 0; i < modelsToLoad.length; i++) {
  incrementTotalNumber();
  loader.load(`/models/${modelsToLoad[i]}`, function (gltf) {
    const book = gltf.scene;
    scene.add(book);
  
    // Assuming there is only one animation clip in the model
    mixer = new THREE.AnimationMixer(book);
    const action = mixer.clipAction(gltf.animations[0]);
    action.setLoop(THREE.LoopPingPong);
    action.play();
  
    let scale = 4;
    book.scale.set(scale, scale, scale);
  
    // Sync with bookshelf position
    book.rotation.set(degreesToRadians(90 + 0.1), degreesToRadians(0 - 0.1), degreesToRadians(270 + 0.5));
    base_position_y = 32.3;
    book.position.set(-10 + i * 1, base_position_y, 3);
  
    books.push({ book, mixer });
    mixers.push(mixer); // Push the mixer into the mixers array
  
    incrementCurrentNumber();
  }, undefined, function (error) {
    console.error(error);
  });  
}

let bookshelf; // Variable to store the loaded model
incrementTotalNumber();
loader.load('/models/bookshelf.glb', function (gltf) {
  bookshelf = gltf.scene;
  scene.add(bookshelf);
  let bookshelfscale = 30;
  bookshelf.scale.x = bookshelfscale;
  bookshelf.scale.y = bookshelfscale;
  bookshelf.scale.z = bookshelfscale;
  bookshelf.position.y = 0;

  //make it like askew in space
  bookshelf.rotation.x = degreesToRadians(0.1);
  bookshelf.rotation.y = degreesToRadians(-0.1);
  bookshelf.rotation.z = degreesToRadians(0.5);

  incrementCurrentNumber();
}, undefined, function (error) {
  console.error(error);
});


let lightbulb, lightbulb_point, lightbulb_start_y;
incrementTotalNumber();
loader.load('/models/lightbulb2.glb', function (gltf) {
  lightbulb = gltf.scene;
  scene.add(lightbulb);
  let lightbulbscale = 5;
  lightbulb.scale.x = lightbulbscale;
  lightbulb.scale.y = lightbulbscale;
  lightbulb.scale.z = lightbulbscale;

  lightbulb_start_y = 70;
  lightbulb.position.y = lightbulb_start_y;
  lightbulb.rotation.z = Math.PI;
    
    
  //creating the lightbulb
  lightbulb_point = new THREE.PointLight( 0xFEC082, 500, 0 );
  lightbulb_point.position.set(lightbulb.position.x,lightbulb.position.y-2.5,lightbulb.position.z);
  scene.add( lightbulb_point );
    
  incrementCurrentNumber();
}, undefined, function (error) {
  console.error(error);
});

const size = 1000;
const divisions = 100;
const gridHelper = new THREE.GridHelper(size, divisions, 0x393939,0x393939);
//scene.add(gridHelper);


// CLICKING
function showBookInfoContainer(bookIndex) {
  const bookInfoContainer = document.getElementById(`book-info-container-${bookIndex}`);
  if (bookInfoContainer) {
      bookInfoContainer.style.display = 'block';
  }
}

function hideAllBookInfoContainers() {
  const containers = document.querySelectorAll('.book-info-container');
  containers.forEach(container => {
      container.style.display = 'none';
  });
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let selectedBook = null;
let selectedBookOriginalPosition = null;
let selectedBookOriginalQuaternion = null;

document.addEventListener('click', onDocumentClick);
document.addEventListener('keydown', onDocumentKeyDown);

let controlsEnabled = true; // Variable to control if OrbitControls are enabled
let book_open = false;

function onDocumentClick(event) {
  // If a book is already selected, do nothing
  if (selectedBook) {
    return;
  }

  if (!controlsEnabled) {
    return;
  }

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(books.map(book => book.book));

  if (intersects.length > 0) {
    book_open = true;
    const intersectedObject = intersects[0].object.parent;

    // Select the book
    selectedBook = intersectedObject;
    selectedBookOriginalPosition = intersectedObject.position.clone();
    selectedBookOriginalQuaternion = intersectedObject.quaternion.clone();

    var target = new THREE.Vector3(); // create once an reuse it
    selectedBook.getWorldPosition(target);
    showBookInfoContainer(target.x+11);

    const targetQuaternion = new THREE.Quaternion();
    const rotationX = degreesToRadians(90);
    const rotationY = degreesToRadians(90);
    const rotationZ = degreesToRadians(0);
    targetQuaternion.setFromEuler(new THREE.Euler(rotationX, rotationY, rotationZ));

    new TWEEN.Tween(intersectedObject.quaternion)
      .to(targetQuaternion, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();

    const destinationPosition = new THREE.Vector3(-16, 3, 0.5);
    new TWEEN.Tween(intersectedObject.position)
      .to(destinationPosition, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();

    const targetPosition = new THREE.Vector3(0, camera_starting_y, controls.maxDistance);
    const targetLookAt = new THREE.Vector3(0, camera_starting_y, 0);
    smoothMoveToPosition(targetPosition, targetLookAt);

    controls.enabled = false; // Disable OrbitControls when a book is selected
  }
}

function onDocumentKeyDown(event) {
  // Add a condition to check if the pressed key is not the 'Command' key
  if (event.key != 'Escape') {
    return;
  }

  book_open = false;
  for (const { book, mixer } of books) {
    mixer.setTime(0);
  }
  hideAllBookInfoContainers();
  if (event.key === 'Escape' && selectedBook) {
    // Undo the displacement and rotation
    new TWEEN.Tween(selectedBook.position)
      .to(selectedBookOriginalPosition, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();

    new TWEEN.Tween(selectedBook.quaternion)
      .to(selectedBookOriginalQuaternion, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => {
        controls.update();
        selectedBook = null;
        selectedBookOriginalPosition = null;
        selectedBookOriginalQuaternion = null;
        controls.enabled = true;
      })
      .start();
  }
}

// Function to toggle animations
function toggleAnimations() {
  animationsEnabled = !animationsEnabled;
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();

  if (!animationsEnabled) {
    // Return early if animations are disabled
    renderer.render(scene, camera);
    return;
  }

  if (book_open) {
    const bookInfoContainers = document.querySelectorAll('.book-info-container');
    let activeContainer = null;

    bookInfoContainers.forEach(container => {
      if (container.style.display !== 'none') {
        activeContainer = container;
      }
    });

    let currentScroll = document.getElementById(activeContainer.id).scrollTop;

    // Get the maximum scroll position (total scrollable height)
    let maxScroll = document.getElementById(activeContainer.id).scrollHeight - document.getElementById(activeContainer.id).clientHeight;

    // Calculate the scroll progress as a fraction (value between 0 and 1)
    let scrollProgress = currentScroll / maxScroll;
    console.log(scrollProgress)

    for (const { book, mixer } of books) {
      mixer.setTime(10*scrollProgress);
    }
  }

  for (const { book, mixer } of books) {
    if (book != undefined) {
      const bobSpeed = 1; // Adjust the bobbing speed
      book.position.y = base_position_y + Math.sin(Date.now() * bobSpeed * 0.0005);
    }
  }

  if (bookshelf != undefined) {    
    const shelfBobSpeed = 1;
    bookshelf.position.y = Math.sin(Date.now() * shelfBobSpeed * 0.0005);
  }

  if (lightbulb != undefined) {    
    const lightBobSpeed = 0.5;
    lightbulb.position.y = lightbulb_start_y + Math.sin(Date.now() * lightBobSpeed * 0.002) * 2;
    lightbulb.position.y = lightbulb.position.y-2.5;
  }

  if (document.getElementById('current-number') == document.getElementById('total-number')) {
      var overlay = document.getElementById('white-overlay');
      overlay.style.display = 'none';
  }

  if (controlsEnabled) {
    controls.update();
  }
  renderer.render(scene, camera);
}

animate();
