import React, { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Sky } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";

// Style definitions
const uiStyles = {
  position: "absolute",
  top: "10px",
  left: "10px",
  zIndex: 1,
  color: "#ffffff",
};

const headingStyles = {
  fontSize: "24px",
  marginBottom: "10px",
};

const buttonStyles = {
  margin: "5px",
  padding: "10px",
  cursor: "pointer",
  border: "none",
  borderRadius: "5px",
  backgroundColor: "#444",
  color: "#fff",
};

const sliderContainerStyles = {
  display: "flex",
  flexDirection: "column",
  margin: "10px 0",
};

// Main App component with theme control
export default function App() {
  const [theme, setTheme] = useState("default");

  return (
    <div style={{ height: "100vh" }}>
      <UI setTheme={setTheme} />
      <Visualization theme={theme} />
    </div>
  );
}

// UI Component for filters, theme control, and clustering
function UI({ setTheme }) {
  return (
    <div style={uiStyles}>
      <h1 style={headingStyles}>3D Data Visualization</h1>
      <button
        style={buttonStyles}
        onClick={() => window.updateFilter("sphere")}
      >
        Show Spheres
      </button>
      <button style={buttonStyles} onClick={() => window.updateFilter("bar")}>
        Show Bars
      </button>
      <button style={buttonStyles} onClick={() => window.updateFilter(null)}>
        Show All
      </button>

      <div style={sliderContainerStyles}>
        <label>Min Size</label>
        <input
          type="range"
          min="0.1"
          max="1.5"
          step="0.1"
          defaultValue="0.1"
          onChange={(e) => window.updateMinSize(e.target.value)}
        />
        <label>Max Size</label>
        <input
          type="range"
          min="0.1"
          max="1.5"
          step="0.1"
          defaultValue="1.5"
          onChange={(e) => window.updateMaxSize(e.target.value)}
        />
      </div>

      <div style={sliderContainerStyles}>
        <label>Min Color</label>
        <input
          type="range"
          min="0"
          max="360"
          step="10"
          defaultValue="0"
          onChange={(e) => window.updateMinColor(e.target.value)}
        />
        <label>Max Color</label>
        <input
          type="range"
          min="0"
          max="360"
          step="10"
          defaultValue="360"
          onChange={(e) => window.updateMaxColor(e.target.value)}
        />
      </div>

      <button style={buttonStyles} onClick={() => window.toggleClustering()}>
        Toggle Clustering
      </button>
      <button style={buttonStyles} onClick={() => window.resetCamera()}>
        Reset Camera
      </button>

      {/* Theme selector */}
      <select style={buttonStyles} onChange={(e) => setTheme(e.target.value)}>
        <option value="default">Default Theme</option>
        <option value="dark">Dark Theme</option>
        <option value="space">Space Theme</option>
        <option value="nature">Nature Theme</option>
      </select>
    </div>
  );
}

// Visualization canvas with themes, clustering, and tooltips on click
function Visualization({ theme }) {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(null);
  const [minSize, setMinSize] = useState(0.1);
  const [maxSize, setMaxSize] = useState(1.5);
  const [minColor, setMinColor] = useState(0);
  const [maxColor, setMaxColor] = useState(360);
  const [clustering, setClustering] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const orbitControlsRef = useRef();

  // Allow global access to filters and clustering
  window.updateFilter = (type) => setFilter(type);
  window.updateMinSize = (size) => setMinSize(parseFloat(size));
  window.updateMaxSize = (size) => setMaxSize(parseFloat(size));
  window.updateMinColor = (color) => setMinColor(parseFloat(color));
  window.updateMaxColor = (color) => setMaxColor(parseFloat(color));
  window.toggleClustering = () => setClustering(!clustering);

  // Reset camera position
  window.resetCamera = () => {
    const controls = orbitControlsRef.current;
    controls.reset();
  };

  // Load initial data (mock JSON or API)
  useEffect(() => {
    const fetchData = async () => {
      // Simulated API call
      const mockData = await new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: 1,
              position: [1, 2, 3],
              size: 0.4,
              color: 10,
              label: "Point A",
              type: "sphere",
            },
            {
              id: 2,
              position: [-2, 1, -1],
              size: 0.6,
              color: 50,
              label: "Point B",
              type: "bar",
              height: 2,
            },
            {
              id: 3,
              position: [2, -1, -2],
              size: 0.3,
              color: 90,
              label: "Point C",
              type: "sphere",
            },
            {
              id: 4,
              position: [3, 0, -3],
              size: 0.8,
              color: 120,
              label: "Point D",
              type: "bar",
              height: 3,
            },
          ]);
        }, 1000);
      });

      setData(mockData);
    };

    fetchData();
  }, []);

  // Cluster logic
  const clusteredData = clustering ? clusterDataPoints(data) : data;

  // Filter data based on size and color
  const filteredData = clusteredData
    .filter((point) => (filter ? point.type === filter : true))
    .filter((point) => point.size >= minSize && point.size <= maxSize)
    .filter((point) => point.color >= minColor && point.color <= maxColor);

  // Zoom to the clicked data point
  const zoomToDataPoint = (position) => {
    const controls = orbitControlsRef.current;
    controls.target.set(...position);
    controls.update();
  };

  return (
    <Canvas>
      {/* Apply theme-based background */}
      {theme === "default" && <Sky sunPosition={[100, 20, 100]} />}
      {theme === "dark" && <color attach="background" args={["#000000"]} />}
      {theme === "space" && <color attach="background" args={["#000044"]} />}
      {theme === "nature" && <color attach="background" args={["#88cc88"]} />}

      {/* Basic lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />

      {/* Interactive controls */}
      <OrbitControls
        ref={orbitControlsRef}
        enablePan={true}
        enableZoom={true}
      />

      {/* Render data points */}
      {filteredData.map((point) => (
        <DataPoint
          key={point.id}
          data={point}
          onClick={() => {
            setSelectedPoint(point);
            zoomToDataPoint(point.position);
          }}
        />
      ))}

      {/* Tooltip/modal for clicked data point */}
      {selectedPoint && (
        <Html position={[0, 0, 0]} center>
          <div
            style={{
              color: "white",
              backgroundColor: "black",
              padding: "10px",
              borderRadius: "3px",
            }}
          >
            <h3>{selectedPoint.label}</h3>
            <p>Size: {selectedPoint.size}</p>
            <p>Color: {selectedPoint.color}</p>
            <p>Position: {selectedPoint.position.join(", ")}</p>
          </div>
        </Html>
      )}
    </Canvas>
  );
}

// DataPoint component for rendering spheres or bars
function DataPoint({ data, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  // Animation for size increase on hover
  const props = useSpring({
    scale: hovered ? 1.5 : 1,
    config: { tension: 300 },
  });

  // Color mapping based on data color value
  const colorValue = `hsl(${data.color}, 100%, 50%)`; // Maps data.color to hue

  return (
    <animated.mesh
      scale={props.scale}
      position={data.position}
      onPointerOver={() => {
        setHovered(true);
        setAnimationStarted(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Choose the 3D object based on type (sphere or bar) */}
      {data.type === "sphere" ? (
        <sphereGeometry args={[data.size, 32, 32]} />
      ) : (
        <boxGeometry args={[data.size, data.height, data.size]} />
      )}

      <meshStandardMaterial color={hovered ? "yellow" : colorValue} />
    </animated.mesh>
  );
}

// Helper function for clustering data points (simple example)
function clusterDataPoints(data) {
  // Placeholder logic for clustering (groups nearby points together)
  return data.map((point, index) => ({
    ...point,
    position: [
      point.position[0] + (index % 2 === 0 ? 1 : -1),
      ...point.position.slice(1),
    ],
  }));
}
