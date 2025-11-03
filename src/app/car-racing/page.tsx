"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Car {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  baseSpeed: number; // Store base speed multiplier instead of absolute speed
  color: string; // Fixed color for each obstacle
}

interface SmokeParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocityX: number;
  velocityY: number;
  life: number;
}

// Game state interface for ref-based state
interface GameState {
  car: Car;
  obstacles: Obstacle[];
  smokeParticles: SmokeParticle[];
  score: number;
  gameSpeed: number;
  roadOffset: number;
  lastObstacleTime: number;
  leftPressed: boolean;
  rightPressed: boolean;
  isDragging: boolean;
  dragStartX: number | null;
  dragStartCarX: number | null;
}

export default function CarRacingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const CAR_SPEED = 8;
  const OBSTACLE_WIDTH = 50;
  const OBSTACLE_HEIGHT = 80;
  const ROAD_LANES = 6;
  const LANE_WIDTH = CANVAS_WIDTH / ROAD_LANES;
  const SPEED_INCREMENT = 0.5;
  const SPEED_INCREMENT_INTERVAL = 100;
  const MAX_GAME_SPEED = 12;
  const MAX_SMOKE_PARTICLES = 50; // Limit smoke particles for performance

  // Use ref for game state to avoid re-renders
  const gameStateRef = useRef<GameState>({
    car: { x: 375, y: 500, width: 50, height: 80 },
    obstacles: [],
    smokeParticles: [],
    score: 0,
    gameSpeed: 2,
    roadOffset: 0,
    lastObstacleTime: 0,
    leftPressed: false,
    rightPressed: false,
    isDragging: false,
    dragStartX: null,
    dragStartCarX: null,
  });

  // Display state (for UI updates only)
  const [displayScore, setDisplayScore] = useState(0);
  const [displaySpeed, setDisplaySpeed] = useState(2);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Check if two obstacles overlap
  const obstaclesOverlap = (
    obstacle1: Obstacle,
    obstacle2: Obstacle
  ): boolean => {
    return (
      obstacle1.x < obstacle2.x + obstacle2.width &&
      obstacle1.x + obstacle1.width > obstacle2.x &&
      obstacle1.y < obstacle2.y + obstacle2.height &&
      obstacle1.y + obstacle1.height > obstacle2.y
    );
  };

  // Generate random obstacle without overlapping
  const generateObstacle = useCallback(
    (existingObstacles: Obstacle[]): Obstacle | null => {
      const maxAttempts = 20; // Prevent infinite loops

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const lane = Math.floor(Math.random() * ROAD_LANES);
        const x = lane * LANE_WIDTH + (LANE_WIDTH - OBSTACLE_WIDTH) / 2;

        // Available car colors
        const carColors = [
          "#1F2937", // Dark gray
          "#059669", // Green
          "#7C3AED", // Purple
          "#DC2626", // Red
          "#EA580C", // Orange
          "#0284C7", // Blue
        ];
        const randomColor =
          carColors[Math.floor(Math.random() * carColors.length)];

        const newObstacle: Obstacle = {
          x,
          y: -OBSTACLE_HEIGHT,
          width: OBSTACLE_WIDTH,
          height: OBSTACLE_HEIGHT,
          baseSpeed: 4 + Math.random() * 3, // Faster: 4x to 7x the current gameSpeed
          color: randomColor, // Assign a fixed random color
        };

        // Check if this obstacle overlaps with any existing obstacles
        const hasOverlap = existingObstacles.some((existingObstacle) =>
          obstaclesOverlap(newObstacle, existingObstacle)
        );

        if (!hasOverlap) {
          return newObstacle;
        }
      }

      // If we couldn't find a non-overlapping position after maxAttempts, return null
      return null;
    },
    [LANE_WIDTH]
  );

  // Collision detection
  const checkCollision = useCallback(
    (car: Car, obstacle: Obstacle): boolean => {
      return (
        car.x < obstacle.x + obstacle.width &&
        car.x + car.width > obstacle.x &&
        car.y < obstacle.y + obstacle.height &&
        car.y + car.height > obstacle.y
      );
    },
    []
  );

  // Drawing function (optimized with refs)
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;
    const { car, obstacles, smokeParticles, roadOffset } = state;

    // Helper function for rounded rectangles
    const drawRoundedRect = (
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.fill();
      } else {
        // Fallback for older browsers
        ctx.fillRect(x, y, width, height);
      }
    };

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw road
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw lane lines with moving effect
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -roadOffset; // Animate the dash pattern
    for (let i = 1; i < ROAD_LANES; i++) {
      ctx.beginPath();
      ctx.moveTo(i * LANE_WIDTH, 0);
      ctx.lineTo(i * LANE_WIDTH, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Draw road edges
    ctx.setLineDash([]);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#FFD700";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.moveTo(CANVAS_WIDTH, 0);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.stroke();

    // Draw directional arrows on road with moving effect
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    const arrowSpacing = 120; // Distance between arrows

    for (let lane = 0; lane < ROAD_LANES; lane++) {
      const laneCenter = lane * LANE_WIDTH + LANE_WIDTH / 2;

      // Start from negative position to have arrows coming from top
      for (
        let y = -arrowSpacing + (roadOffset % arrowSpacing);
        y < CANVAS_HEIGHT + arrowSpacing;
        y += arrowSpacing
      ) {
        // Draw arrow pointing up
        const arrowY = y;
        const arrowSize = 15;

        // Arrow shaft
        ctx.fillRect(laneCenter - 2, arrowY + 8, 4, arrowSize);

        // Arrow head (triangle)
        ctx.beginPath();
        ctx.moveTo(laneCenter, arrowY);
        ctx.lineTo(laneCenter - 6, arrowY + 8);
        ctx.lineTo(laneCenter + 6, arrowY + 8);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Draw smoke particles behind the player car
    smokeParticles.forEach((particle) => {
      ctx.fillStyle = `rgba(100, 100, 100, ${particle.opacity})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw player car (more realistic)
    const carCenterX = car.x + car.width / 2;

    // Car body (rounded rectangle)
    ctx.fillStyle = "#DC2626"; // Darker red
    drawRoundedRect(car.x, car.y + 5, car.width, car.height - 10, 8);

    // Car hood
    ctx.fillStyle = "#B91C1C";
    drawRoundedRect(car.x + 3, car.y + 5, car.width - 6, 25, 6);

    // Windshield
    ctx.fillStyle = "#1E3A8A";
    drawRoundedRect(car.x + 8, car.y + 12, car.width - 16, 18, 4);

    // Side windows
    ctx.fillStyle = "#3B82F6";
    drawRoundedRect(car.x + 8, car.y + 35, car.width - 16, 15, 3);

    // Rear window
    ctx.fillStyle = "#1E3A8A";
    drawRoundedRect(car.x + 8, car.y + 55, car.width - 16, 12, 3);

    // Headlights with light beams
    // Draw light beams first (behind the car)
    ctx.fillStyle = "rgba(255, 255, 200, 0.15)";
    ctx.beginPath();
    // Left headlight beam
    ctx.moveTo(car.x + 12, car.y + 8);
    ctx.lineTo(car.x + 5, car.y - 60);
    ctx.lineTo(car.x + 19, car.y - 60);
    ctx.closePath();
    ctx.fill();

    // Right headlight beam
    ctx.beginPath();
    ctx.moveTo(car.x + car.width - 12, car.y + 8);
    ctx.lineTo(car.x + car.width - 19, car.y - 60);
    ctx.lineTo(car.x + car.width - 5, car.y - 60);
    ctx.closePath();
    ctx.fill();

    // Headlight outer glow
    ctx.fillStyle = "rgba(251, 191, 36, 0.3)";
    ctx.beginPath();
    ctx.ellipse(car.x + 12, car.y + 8, 6, 5, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(car.x + car.width - 12, car.y + 8, 6, 5, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Main headlights
    ctx.fillStyle = "#FBBF24";
    ctx.beginPath();
    ctx.ellipse(car.x + 12, car.y + 8, 4, 3, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(car.x + car.width - 12, car.y + 8, 4, 3, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Headlight center (bright white)
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(car.x + 12, car.y + 8, 2, 1.5, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(car.x + car.width - 12, car.y + 8, 2, 1.5, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Taillights
    ctx.fillStyle = "#DC2626";
    ctx.beginPath();
    ctx.ellipse(car.x + 12, car.y + car.height - 8, 3, 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      car.x + car.width - 12,
      car.y + car.height - 8,
      3,
      2,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Wheels
    ctx.fillStyle = "#1F2937";
    ctx.beginPath();
    ctx.ellipse(car.x + 8, car.y + 20, 6, 8, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(car.x + car.width - 8, car.y + 20, 6, 8, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(car.x + 8, car.y + car.height - 20, 6, 8, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      car.x + car.width - 8,
      car.y + car.height - 20,
      6,
      8,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Wheel rims
    ctx.fillStyle = "#6B7280";
    ctx.beginPath();
    ctx.ellipse(car.x + 8, car.y + 20, 3, 4, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(car.x + car.width - 8, car.y + 20, 3, 4, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(car.x + 8, car.y + car.height - 20, 3, 4, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      car.x + car.width - 8,
      car.y + car.height - 20,
      3,
      4,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Draw obstacle cars (with fixed colors)
    obstacles.forEach((obstacle) => {
      const bodyColor = obstacle.color;
      const darkerColor = "#374151"; // Consistent darker color for hood

      // Car body (rounded rectangle)
      ctx.fillStyle = bodyColor;
      drawRoundedRect(
        obstacle.x,
        obstacle.y + 5,
        obstacle.width,
        obstacle.height - 10,
        8
      );

      // Car hood
      ctx.fillStyle = darkerColor;
      drawRoundedRect(
        obstacle.x + 3,
        obstacle.y + 5,
        obstacle.width - 6,
        25,
        6
      );

      // Windshield
      ctx.fillStyle = "#1E3A8A";
      drawRoundedRect(
        obstacle.x + 8,
        obstacle.y + 12,
        obstacle.width - 16,
        18,
        4
      );

      // Side windows
      ctx.fillStyle = "#3B82F6";
      drawRoundedRect(
        obstacle.x + 8,
        obstacle.y + 35,
        obstacle.width - 16,
        15,
        3
      );

      // Rear window
      ctx.fillStyle = "#1E3A8A";
      drawRoundedRect(
        obstacle.x + 8,
        obstacle.y + 55,
        obstacle.width - 16,
        12,
        3
      );

      // Headlights
      ctx.fillStyle = "#FBBF24";
      ctx.beginPath();
      ctx.ellipse(obstacle.x + 12, obstacle.y + 8, 4, 3, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        obstacle.x + obstacle.width - 12,
        obstacle.y + 8,
        4,
        3,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Taillights
      ctx.fillStyle = "#DC2626";
      ctx.beginPath();
      ctx.ellipse(
        obstacle.x + 12,
        obstacle.y + obstacle.height - 8,
        3,
        2,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        obstacle.x + obstacle.width - 12,
        obstacle.y + obstacle.height - 8,
        3,
        2,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Wheels
      ctx.fillStyle = "#1F2937";
      ctx.beginPath();
      ctx.ellipse(obstacle.x + 8, obstacle.y + 20, 6, 8, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        obstacle.x + obstacle.width - 8,
        obstacle.y + 20,
        6,
        8,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        obstacle.x + 8,
        obstacle.y + obstacle.height - 20,
        6,
        8,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        obstacle.x + obstacle.width - 8,
        obstacle.y + obstacle.height - 20,
        6,
        8,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Wheel rims
      ctx.fillStyle = "#6B7280";
      ctx.beginPath();
      ctx.ellipse(obstacle.x + 8, obstacle.y + 20, 3, 4, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        obstacle.x + obstacle.width - 8,
        obstacle.y + 20,
        3,
        4,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        obstacle.x + 8,
        obstacle.y + obstacle.height - 20,
        3,
        4,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        obstacle.x + obstacle.width - 8,
        obstacle.y + obstacle.height - 20,
        3,
        4,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  }, [CANVAS_WIDTH, CANVAS_HEIGHT, LANE_WIDTH, ROAD_LANES]);

  // Update car position (using ref)
  const updateCarPosition = useCallback(() => {
    const state = gameStateRef.current;
    let newX = state.car.x;

    // If dragging, ignore keyboard/touch controls
    if (!state.isDragging) {
      if (state.leftPressed && newX > 0) {
        newX = Math.max(0, newX - CAR_SPEED);
      }
      if (state.rightPressed && newX < CANVAS_WIDTH - state.car.width) {
        newX = Math.min(CANVAS_WIDTH - state.car.width, newX + CAR_SPEED);
      }
    }

    state.car.x = newX;
  }, [CAR_SPEED, CANVAS_WIDTH]);

  // Game loop (optimized with refs)
  const gameLoop = useCallback(() => {
    if (!isPlaying || gameOver) return;

    const state = gameStateRef.current;
    const currentTime = Date.now();

    // Update car position
    updateCarPosition();

    // Generate smoke particles behind the car (with limit)
    if (
      Math.random() < 0.7 &&
      state.smokeParticles.length < MAX_SMOKE_PARTICLES
    ) {
      const newParticle: SmokeParticle = {
        x: state.car.x + state.car.width / 2 + (Math.random() - 0.5) * 20,
        y: state.car.y + state.car.height - 5,
        size: 3 + Math.random() * 4,
        opacity: 0.3 + Math.random() * 0.4,
        velocityX: (Math.random() - 0.5) * 2,
        velocityY: 1 + Math.random() * 2,
        life: 1.0,
      };
      state.smokeParticles.push(newParticle);
    }

    // Update smoke particles (in-place for performance)
    state.smokeParticles = state.smokeParticles
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.velocityX,
        y: particle.y + particle.velocityY,
        size: particle.size * 1.02,
        opacity: particle.opacity * 0.96,
        life: particle.life - 0.02,
      }))
      .filter(
        (particle) => particle.life > 0 && particle.y < CANVAS_HEIGHT + 20
      );

    // Update road offset for moving road effect
    state.roadOffset = (state.roadOffset + state.gameSpeed * 3) % 120;

    // Generate obstacles
    if (
      currentTime - state.lastObstacleTime > 1000 - state.gameSpeed * 80 &&
      state.obstacles.length < 5
    ) {
      const newObstacle = generateObstacle(state.obstacles);
      if (newObstacle) {
        state.obstacles.push(newObstacle);
      }
      state.lastObstacleTime = currentTime;
    }

    // Update obstacles (in-place for performance)
    state.obstacles = state.obstacles
      .map((obstacle) => ({
        ...obstacle,
        y: obstacle.y + obstacle.baseSpeed * state.gameSpeed,
      }))
      .filter((obstacle) => obstacle.y < CANVAS_HEIGHT + OBSTACLE_HEIGHT);

    // Check collisions
    for (const obstacle of state.obstacles) {
      if (checkCollision(state.car, obstacle)) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }
    }

    // Update score and speed
    state.score += 1;
    if (state.score % SPEED_INCREMENT_INTERVAL === 0) {
      state.gameSpeed = Math.min(
        state.gameSpeed + SPEED_INCREMENT,
        MAX_GAME_SPEED
      );
      setDisplaySpeed(state.gameSpeed); // Update display
    }

    // Update display score less frequently (every 10 frames)
    if (state.score % 10 === 0) {
      setDisplayScore(state.score);
    }

    // Draw and continue loop
    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
    isPlaying,
    gameOver,
    updateCarPosition,
    generateObstacle,
    checkCollision,
    draw,
    CANVAS_HEIGHT,
    OBSTACLE_HEIGHT,
    SPEED_INCREMENT_INTERVAL,
    SPEED_INCREMENT,
    MAX_GAME_SPEED,
    MAX_SMOKE_PARTICLES,
  ]);

  // Touch event handlers (using refs)
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = touch.clientX - rect.left;
      setTouchStartX(x);

      const state = gameStateRef.current;
      const carCenterX = state.car.x + state.car.width / 2;
      const touchDistanceFromCar = Math.abs(x - carCenterX);

      if (touchDistanceFromCar < 50) {
        // Within 50px of car center
        state.isDragging = true;
        state.dragStartX = x;
        state.dragStartCarX = state.car.x;
      } else {
        // Use old touch controls for tapping left/right
        if (x < CANVAS_WIDTH / 2) {
          state.leftPressed = true;
        } else {
          state.rightPressed = true;
        }
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const state = gameStateRef.current;
    if (
      state.isDragging &&
      state.dragStartX !== null &&
      state.dragStartCarX !== null
    ) {
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = touch.clientX - rect.left;
        const deltaX = x - state.dragStartX;
        const newCarX = state.dragStartCarX + deltaX;

        // Constrain car within canvas bounds
        state.car.x = Math.max(
          0,
          Math.min(CANVAS_WIDTH - state.car.width, newCarX)
        );
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setTouchStartX(null);
    const state = gameStateRef.current;
    state.leftPressed = false;
    state.rightPressed = false;
    state.isDragging = false;
    state.dragStartX = null;
    state.dragStartCarX = null;
  };

  // Mouse event handlers for dragging (using refs)
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const state = gameStateRef.current;
      const carCenterX = state.car.x + state.car.width / 2;
      const mouseDistanceFromCar = Math.abs(x - carCenterX);

      if (mouseDistanceFromCar < 50) {
        // Within 50px of car center
        state.isDragging = true;
        state.dragStartX = x;
        state.dragStartCarX = state.car.x;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const state = gameStateRef.current;
    if (
      state.isDragging &&
      state.dragStartX !== null &&
      state.dragStartCarX !== null
    ) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const deltaX = x - state.dragStartX;
        const newCarX = state.dragStartCarX + deltaX;

        // Constrain car within canvas bounds
        state.car.x = Math.max(
          0,
          Math.min(CANVAS_WIDTH - state.car.width, newCarX)
        );
      }
    }
  };

  const handleMouseUp = () => {
    const state = gameStateRef.current;
    state.isDragging = false;
    state.dragStartX = null;
    state.dragStartCarX = null;
  };

  // Keyboard controls (using refs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        state.leftPressed = true;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        state.rightPressed = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const state = gameStateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        state.leftPressed = false;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        state.rightPressed = false;
      }
    };

    // Mouse event listeners for dragging outside the canvas
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const state = gameStateRef.current;
      if (
        state.isDragging &&
        canvasRef.current &&
        state.dragStartX !== null &&
        state.dragStartCarX !== null
      ) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const deltaX = x - state.dragStartX;
        const newCarX = state.dragStartCarX + deltaX;

        // Constrain car within canvas bounds
        state.car.x = Math.max(
          0,
          Math.min(CANVAS_WIDTH - state.car.width, newCarX)
        );
      }
    };

    const handleGlobalMouseUp = () => {
      const state = gameStateRef.current;
      state.isDragging = false;
      state.dragStartX = null;
      state.dragStartCarX = null;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [CANVAS_WIDTH]);

  // Game loop effect
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, gameLoop]);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setDisplayScore(0);
    setDisplaySpeed(2);

    // Reset game state ref
    gameStateRef.current = {
      car: { x: 375, y: 500, width: 50, height: 80 },
      obstacles: [],
      smokeParticles: [],
      score: 0,
      gameSpeed: 2,
      roadOffset: 0,
      lastObstacleTime: Date.now(),
      leftPressed: false,
      rightPressed: false,
      isDragging: false,
      dragStartX: null,
      dragStartCarX: null,
    };
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setDisplayScore(0);
    setDisplaySpeed(2);

    // Reset game state ref
    gameStateRef.current = {
      car: { x: 375, y: 500, width: 50, height: 80 },
      obstacles: [],
      smokeParticles: [],
      score: 0,
      gameSpeed: 2,
      roadOffset: 0,
      lastObstacleTime: 0,
      leftPressed: false,
      rightPressed: false,
      isDragging: false,
      dragStartX: null,
      dragStartCarX: null,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🏎️</div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
          Car Racing Game
        </h1>
        <p className="text-lg md:text-xl text-white/90 drop-shadow">
          Race through traffic and avoid obstacles!
        </p>
      </div>

      {/* Game Area */}
      <div className="relative bg-black rounded-lg shadow-2xl p-4 mb-6">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-yellow-400 rounded-lg max-w-full h-auto cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ touchAction: "none" }}
        />

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
              <p className="text-2xl mb-6">Final Score: {displayScore}</p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-4 px-8 rounded-full text-xl hover:scale-105 transition-transform"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Start Screen */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🏁</div>
              <h2 className="text-4xl font-bold mb-4">Ready to Race?</h2>
              <p className="text-lg mb-6 max-w-md">
                Use touch controls or arrow keys to steer your car and avoid
                obstacles!
              </p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-4 px-8 rounded-full text-xl hover:scale-105 transition-transform"
              >
                Start Game
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Score and Controls */}
      <div className="text-center mb-6">
        <div className="text-2xl font-bold text-white mb-4">
          Score: {displayScore} | Speed: {displaySpeed.toFixed(1)}
        </div>

        {/* Touch Control Instructions */}
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-white font-bold mb-2">Controls:</h3>
          <p className="text-white/90 text-sm mb-2">
            �️ <strong>Mouse/Touch Drag:</strong> Click/touch near car and drag
            to move
          </p>
          <p className="text-white/90 text-sm mb-2">
            📱 <strong>Touch:</strong> Tap left or right side of screen
          </p>
          <p className="text-white/90 text-sm">
            ⌨️ <strong>Keyboard:</strong> Arrow keys or A/D keys
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      {isPlaying && (
        <div className="flex gap-4">
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform"
          >
            Reset Game
          </button>
        </div>
      )}

      {/* Back to Home */}
      <div className="mt-8">
        <a
          href="/"
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform inline-block"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
