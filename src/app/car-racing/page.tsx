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

export default function CarRacingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [car, setCar] = useState<Car>({
    x: 375,
    y: 500,
    width: 50,
    height: 80,
  });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [lastObstacleTime, setLastObstacleTime] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(2);
  const [smokeParticles, setSmokeParticles] = useState<SmokeParticle[]>([]);

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

  // Touch controls
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [leftPressed, setLeftPressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);

  // Drag controls
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragStartCarX, setDragStartCarX] = useState<number | null>(null);

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
  const checkCollision = (car: Car, obstacle: Obstacle): boolean => {
    return (
      car.x < obstacle.x + obstacle.width &&
      car.x + car.width > obstacle.x &&
      car.y < obstacle.y + obstacle.height &&
      car.y + car.height > obstacle.y
    );
  };

  // Update car position
  const updateCarPosition = useCallback(() => {
    setCar((prevCar) => {
      let newX = prevCar.x;

      // If dragging, ignore keyboard/touch controls
      if (!isDragging) {
        if (leftPressed && newX > 0) {
          newX = Math.max(0, newX - CAR_SPEED);
        }
        if (rightPressed && newX < CANVAS_WIDTH - prevCar.width) {
          newX = Math.min(CANVAS_WIDTH - prevCar.width, newX + CAR_SPEED);
        }
      }

      return { ...prevCar, x: newX };
    });
  }, [leftPressed, rightPressed, isDragging]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!isPlaying || gameOver) return;

    const currentTime = Date.now();

    // Update car position
    updateCarPosition();

    // Generate smoke particles behind the car
    if (Math.random() < 0.7) {
      // 70% chance to generate smoke each frame
      const newParticle: SmokeParticle = {
        x: car.x + car.width / 2 + (Math.random() - 0.5) * 20, // Random spread around car center
        y: car.y + car.height - 5, // Near the back of the car
        size: 3 + Math.random() * 4, // Random size between 3-7
        opacity: 0.3 + Math.random() * 0.4, // Random opacity 0.3-0.7
        velocityX: (Math.random() - 0.5) * 2, // Slight horizontal drift
        velocityY: 1 + Math.random() * 2, // Move downward/backward
        life: 1.0, // Full life at start
      };
      setSmokeParticles((prev) => [...prev, newParticle]);
    }

    // Update smoke particles
    setSmokeParticles((prev) =>
      prev
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.velocityX,
          y: particle.y + particle.velocityY,
          size: particle.size * 1.02, // Gradually expand
          opacity: particle.opacity * 0.96, // Fade out
          life: particle.life - 0.02, // Decrease life
        }))
        .filter(
          (particle) => particle.life > 0 && particle.y < CANVAS_HEIGHT + 20
        )
    );

    // Generate obstacles (maximum 3 on road at same time)
    if (
      currentTime - lastObstacleTime > 1000 - gameSpeed * 80 &&
      obstacles.length < 5
    ) {
      // More frequent: shorter base interval, faster reduction, max 5 obstacles
      const newObstacle = generateObstacle(obstacles);
      if (newObstacle) {
        setObstacles((prev) => [...prev, newObstacle]);
      }
      setLastObstacleTime(currentTime);
    }

    // Update obstacles
    setObstacles((prevObstacles) => {
      return prevObstacles
        .map((obstacle) => ({
          ...obstacle,
          y: obstacle.y + obstacle.baseSpeed * gameSpeed, // Use current gameSpeed with obstacle's baseSpeed
        }))
        .filter((obstacle) => obstacle.y < CANVAS_HEIGHT + OBSTACLE_HEIGHT);
    });

    // Check collisions
    obstacles.forEach((obstacle) => {
      if (checkCollision(car, obstacle)) {
        setGameOver(true);
        setIsPlaying(false);
      }
    });

    // Update score and speed
    setScore((prevScore) => {
      const newScore = prevScore + 1;
      if (newScore % SPEED_INCREMENT_INTERVAL === 0) {
        setGameSpeed((prev) =>
          Math.min(prev + SPEED_INCREMENT, MAX_GAME_SPEED)
        );
      }
      return newScore;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
    isPlaying,
    gameOver,
    car,
    obstacles,
    lastObstacleTime,
    gameSpeed,
    updateCarPosition,
    generateObstacle,
  ]);

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    // Draw lane lines
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
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

    // Draw directional arrows on road
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    const arrowSpacing = 120; // Distance between arrows

    for (let lane = 0; lane < ROAD_LANES; lane++) {
      const laneCenter = lane * LANE_WIDTH + LANE_WIDTH / 2;

      for (let y = 60; y < CANVAS_HEIGHT; y += arrowSpacing) {
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

    requestAnimationFrame(draw);
  }, [car, obstacles, smokeParticles, LANE_WIDTH]);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = touch.clientX - rect.left;
      setTouchStartX(x);

      // Check if touch is on the car for dragging
      const carCenterX = car.x + car.width / 2;
      const touchDistanceFromCar = Math.abs(x - carCenterX);

      if (touchDistanceFromCar < 50) {
        // Within 50px of car center
        setIsDragging(true);
        setDragStartX(x);
        setDragStartCarX(car.x);
      } else {
        // Use old touch controls for tapping left/right
        if (x < CANVAS_WIDTH / 2) {
          setLeftPressed(true);
        } else {
          setRightPressed(true);
        }
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isDragging && dragStartX !== null && dragStartCarX !== null) {
      const touch = e.touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = touch.clientX - rect.left;
        const deltaX = x - dragStartX;
        const newCarX = dragStartCarX + deltaX;

        // Constrain car within canvas bounds
        const constrainedX = Math.max(
          0,
          Math.min(CANVAS_WIDTH - car.width, newCarX)
        );

        setCar((prevCar) => ({ ...prevCar, x: constrainedX }));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setTouchStartX(null);
    setLeftPressed(false);
    setRightPressed(false);
    setIsDragging(false);
    setDragStartX(null);
    setDragStartCarX(null);
  };

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const carCenterX = car.x + car.width / 2;
      const mouseDistanceFromCar = Math.abs(x - carCenterX);

      if (mouseDistanceFromCar < 50) {
        // Within 50px of car center
        setIsDragging(true);
        setDragStartX(x);
        setDragStartCarX(car.x);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStartX !== null && dragStartCarX !== null) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const deltaX = x - dragStartX;
        const newCarX = dragStartCarX + deltaX;

        // Constrain car within canvas bounds
        const constrainedX = Math.max(
          0,
          Math.min(CANVAS_WIDTH - car.width, newCarX)
        );

        setCar((prevCar) => ({ ...prevCar, x: constrainedX }));
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartX(null);
    setDragStartCarX(null);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setLeftPressed(true);
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setRightPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setLeftPressed(false);
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setRightPressed(false);
      }
    };

    // Mouse event listeners for dragging outside the canvas
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (
        isDragging &&
        canvasRef.current &&
        dragStartX !== null &&
        dragStartCarX !== null
      ) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const deltaX = x - dragStartX;
        const newCarX = dragStartCarX + deltaX;

        // Constrain car within canvas bounds
        const constrainedX = Math.max(
          0,
          Math.min(CANVAS_WIDTH - car.width, newCarX)
        );

        setCar((prevCar) => ({ ...prevCar, x: constrainedX }));
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragStartX(null);
      setDragStartCarX(null);
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
  }, [isDragging, dragStartX, dragStartCarX, car.width]);

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

  // Drawing effect
  useEffect(() => {
    draw();
  }, [draw]);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setGameSpeed(2);
    setCar({ x: 375, y: 500, width: 50, height: 80 });
    setObstacles([]);
    setSmokeParticles([]);
    setLastObstacleTime(Date.now());
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setScore(0);
    setGameSpeed(2);
    setCar({ x: 375, y: 500, width: 50, height: 80 });
    setObstacles([]);
    setSmokeParticles([]);
    setLeftPressed(false);
    setRightPressed(false);
    setIsDragging(false);
    setDragStartX(null);
    setDragStartCarX(null);
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
              <p className="text-2xl mb-6">Final Score: {score}</p>
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
          Score: {score} | Speed: {gameSpeed.toFixed(1)}
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
