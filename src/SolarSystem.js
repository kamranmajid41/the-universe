import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib'; // Import OrbitControls from 'three-stdlib'

import sunTexture from './media/8k_sun.jpg';
import mercuryTexture from './media/2k_mercury.jpg';
import venusTexture from './media/2k_venus_atmosphere.jpg';
import earthTexture from './media/8k_earth_daymap.jpg';
import marsTexture from './media/2k_mars.jpg';
import jupiterTexture from './media/2k_jupiter.jpg';
import saturnTexture from './media/2k_saturn.jpg';
import uranusTexture from './media/2k_uranus.jpg';
import neptuneTexture from './media/2k_neptune.jpg';
import starsTexture from './media/8k_stars.jpg';
import cmbTexture from './media/cmb.jpg'; // Import your CMB image here
import earthCloudsTexture from './media/8k_earth_clouds.jpg'; // Cloud texture for Earth

const SolarSystem = () => {
  const sceneRef = useRef(null);
  const camera = useRef(null); // Ref for the camera
  const controls = useRef(null); // Ref for the orbit controls
  const planetsRef = useRef([]); // Store references to the planet meshes

  // Planets Data
  const planetsData = [
    { name: 'Mercury', size: 0.4, distance: 6, texture: mercuryTexture, orbitPeriod: 0.24, rotationSpeed: 0.02 }, 
    { name: 'Venus', size: 0.9, distance: 10, texture: venusTexture, orbitPeriod: 0.615, rotationSpeed: 0.01 },
    { name: 'Earth', size: 1.2, distance: 15, texture: earthTexture, orbitPeriod: 1, rotationSpeed: 0.01 },
    { name: 'Mars', size: 0.8, distance: 20, texture: marsTexture, orbitPeriod: 1.88, rotationSpeed: 0.015 },
    { name: 'Jupiter', size: 2.5, distance: 30, texture: jupiterTexture, orbitPeriod: 11.86, rotationSpeed: 0.005 },
    { name: 'Saturn', size: 2, distance: 40, texture: saturnTexture, orbitPeriod: 29.46, rotationSpeed: 0.005 },
    { name: 'Uranus', size: 1.8, distance: 50, texture: uranusTexture, orbitPeriod: 84.01, rotationSpeed: 0.005 },
    { name: 'Neptune', size: 1.6, distance: 60, texture: neptuneTexture, orbitPeriod: 164.8, rotationSpeed: 0.005 },
  ];

  useEffect(() => {
    // Create the scene and camera
    const scene = new THREE.Scene();
    const cameraInstance = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.current = cameraInstance;
    
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneRef.current.appendChild(renderer.domElement);
    
    // Add lighting
    const light = new THREE.PointLight(0xffffff, 900, 1000); // Increased intensity to 10
    light.position.set(0, 0, 0); // Position it at the Sun
    scene.add(light);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft light for shadows
    scene.add(ambientLight);
    
    // Load textures using TextureLoader
    const textureLoader = new THREE.TextureLoader();
    
    // Create the Sun with its texture
    const sunTextureMap = textureLoader.load(sunTexture);
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTextureMap });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Create the Stars background as a large sphere
    const starsTextureMap = textureLoader.load(starsTexture);
    const starsGeometry = new THREE.SphereGeometry(500, 32, 32); // Large sphere to enclose the whole scene
    const starsMaterial = new THREE.MeshBasicMaterial({
      map: starsTextureMap,
      side: THREE.BackSide, // Makes the texture visible from inside the sphere
    });
    const starsMesh = new THREE.Mesh(starsGeometry, starsMaterial);
    scene.add(starsMesh); // Add the stars background

    // Create the CMB background as an even larger sphere
    const cmbTextureMap = textureLoader.load(cmbTexture); // Load your CMB texture
    const cmbGeometry = new THREE.SphereGeometry(520, 32, 32); // Larger sphere than the stars sphere
    const cmbMaterial = new THREE.MeshBasicMaterial({
      map: cmbTextureMap,
    });
    const cmbMesh = new THREE.Mesh(cmbGeometry, cmbMaterial);
    scene.add(cmbMesh); // Add the CMB background (outer layer)

    // Planets setup
    const planets = planetsData.map((planetData, index) => {
      const planetTexture = textureLoader.load(planetData.texture); // Load planet texture
      const planetGeometry = new THREE.SphereGeometry(planetData.size, 32, 32);
      const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
      const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
      
      planetMesh.position.x = planetData.distance; // Set initial distance
      planetMesh.name = planetData.name; // Add a name for easier identification
      scene.add(planetMesh);
      
      // Save the planet mesh to the planetsRef array
      planetsRef.current.push({ mesh: planetMesh, animatePlanet: planetData });

      // Add cloud layer for Earth
      if (planetData.name === 'Earth') {
        const cloudTexture = textureLoader.load(earthCloudsTexture);
        const cloudMaterial = new THREE.MeshLambertMaterial({
          map: cloudTexture,
          transparent: true,
          opacity: 0.5, // Adjust opacity for better cloud visibility
          side: THREE.DoubleSide,
        });
        const cloudGeometry = new THREE.SphereGeometry(planetData.size + 0.05, 32, 32); // Slightly larger sphere for clouds
        const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudMesh.rotation.x = Math.PI / 2; // Adjust rotation for correct positioning
        planetMesh.add(cloudMesh); // Add clouds as a child of Earth
      }  

      // Scale the orbit speed based on real-world orbital period (in Earth years)
      const orbitSpeed = (Math.PI * 2) / (planetData.orbitPeriod * 365000); // Full orbit in Earth days

      // Add orbit animation
      const animatePlanet = () => {
        // Elliptical motion approximation (use both cosine and sine for a more realistic orbit)
        planetMesh.position.x = planetData.distance * Math.cos(Date.now() * orbitSpeed + index);
        planetMesh.position.z = planetData.distance * Math.sin(Date.now() * orbitSpeed + index);

        // Planet axial rotation (independent of orbital motion)
        planetMesh.rotation.y += planetData.rotationSpeed; // Rotation speed
      };

      return { mesh: planetMesh, animatePlanet };
    });

    // Set up the camera position to be zoomed out enough to view the solar system
    cameraInstance.position.z = 900; // Start camera closer for easier exploration

    // Initialize OrbitControls
    const controlsInstance = new OrbitControls(cameraInstance, renderer.domElement);
    controlsInstance.enableDamping = true;
    controlsInstance.dampingFactor = 0.25;
    controlsInstance.screenSpacePanning = false;
    controlsInstance.maxPolarAngle = Math.PI / 2; // Allow full 360-degree rotation on the X axis
    controlsInstance.maxDistance = 900; // Max zoom-out distance
    controlsInstance.minDistance = 1; // Min zoom-in distance
    controls.current = controlsInstance;

    // Set the target of OrbitControls to be at the camera's position
    controlsInstance.target.set(0, 0, 0); 
    controlsInstance.update();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Animate planets
      planets.forEach((planet) => planet.animatePlanet());
      
      // Render the scene
      renderer.render(scene, camera.current);
    };
    
    animate();

    return () => {
      // Clean up on component unmount
      sceneRef.current.removeChild(renderer.domElement);
    };
  }, []);  // Empty dependency array to run once when the component mounts

  return (
    <div>
      <div ref={sceneRef} />
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        textTransform: 'uppercase',
        font: 'arial',
        fontSize: '40px',
        fontWeight: 'bold'
      }}>
        Kamran Majid
      </div>

      <div style={{
        position: 'absolute',
        top: '60px',
        left: '90px',
        color: 'white',
        fontSize: '30px',
        fontFamily: 'cursive', 
        fontStyle: 'italic'
      }}>
        the universe
      </div>
    </div>
  );
};

export default SolarSystem;
