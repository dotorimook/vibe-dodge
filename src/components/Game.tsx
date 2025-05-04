import React, { useEffect, useRef, useState } from 'react';
import { Plane } from '../classes/Plane';
import { Missile } from '../classes/Missile';
import { Item } from '../classes/Item';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(1);
  const [showStageUp, setShowStageUp] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [lastItemSpawnTime, setLastItemSpawnTime] = useState(0);
  const [lastScoreUpdateTime, setLastScoreUpdateTime] = useState(0);
  const [lastStageUpdateTime, setLastStageUpdateTime] = useState(0);
  const [stageUpAnimation, setStageUpAnimation] = useState(0);
  const [missiles, setMissiles] = useState<Missile[]>([]);
  const [lastMissileSpawnTime, setLastMissileSpawnTime] = useState(0);
  const planeRef = useRef<Plane | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const gameLoopRef = useRef<number>(0);

  const SCORE_UPDATE_INTERVAL = 100; // 0.1 seconds
  const STAGE_UPDATE_INTERVAL = 10000; // 10 seconds
  const STAGE_UP_DURATION = 2000; // 2 seconds
  const MISSILE_SPAWN_INTERVAL = 50;

  const restartGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    planeRef.current = new Plane(canvas.width, canvas.height);
    setMissiles([]);
    setGameOver(false);
    setScore(0);
    setStage(1);
    setShowStageUp(false);
    setItems([]);
    setLastItemSpawnTime(0);
    setLastScoreUpdateTime(0);
    setLastStageUpdateTime(0);
    setStageUpAnimation(0);
    setLastMissileSpawnTime(0);
  };

  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    planeRef.current = new Plane(canvas.width, canvas.height);
    setGameStarted(true);
  };

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      
      if (!gameStarted && e.key === 'Enter') {
        startGame();
      }
      
      // Restart game if game is over and Enter key is pressed
      if (gameOver && e.key === 'Enter') {
        restartGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver]);

  const spawnItem = (canvas: HTMLCanvasElement) => {
    if (items.length < 3) {
      const newItem = new Item(canvas.width, canvas.height);
      setItems(prev => [...prev, newItem]);
    }
  };

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (timestamp: number) => {
      // Clear canvas
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!gameStarted) {
        // Draw start screen
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText('DODGE', canvas.width/2, canvas.height/2 - 50);
        
        ctx.font = '24px Arial';
        ctx.fillText('Press Enter to Start', canvas.width/2, canvas.height/2 + 50);
      } else if (!gameOver) {
        if (!planeRef.current) return;

        // Update score
        if (timestamp - lastScoreUpdateTime > SCORE_UPDATE_INTERVAL) {
          setScore(prevScore => prevScore + 1);
          setLastScoreUpdateTime(timestamp);
        }

        // Update stage
        if (timestamp - lastStageUpdateTime > STAGE_UPDATE_INTERVAL) {
          setStage(prevStage => prevStage + 1);
          setShowStageUp(true);
          setLastStageUpdateTime(timestamp);
          setStageUpAnimation(timestamp);
        }

        // Handle stage up animation
        if (showStageUp) {
          const timeSinceStageUp = timestamp - stageUpAnimation;
          if (timeSinceStageUp > STAGE_UP_DURATION) {
            setShowStageUp(false);
          } else {
            const opacity = 1 - (timeSinceStageUp / STAGE_UP_DURATION);
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = `rgba(255, 255, 0, ${opacity})`;
            ctx.fillText('STAGE UP', canvas.width/2, canvas.height - 50);
          }
        }

        // Update plane
        planeRef.current.update(timestamp);

        // Handle plane movement
        if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
          planeRef.current.move(0, -1);
        }
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
          planeRef.current.move(0, 1);
        }
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
          planeRef.current.move(-1, 0);
        }
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
          planeRef.current.move(1, 0);
        }

        // Spawn new missiles
        if (timestamp - lastMissileSpawnTime > MISSILE_SPAWN_INTERVAL) {
          const newMissile = new Missile(canvas.width, canvas.height, stage);
          setMissiles(prevMissiles => [...prevMissiles, newMissile]);
          setLastMissileSpawnTime(timestamp);
        }

        // Update and draw missiles
        const updatedMissiles = missiles.filter(missile => {
          missile.update();
          const isInBounds = !missile.isOutOfBounds(canvas.width, canvas.height);
          if (isInBounds) {
            missile.draw(ctx);
            // Check collision
            if (planeRef.current!.checkCollision(missile.x, missile.y, missile.size)) {
              setGameOver(true);
            }
          }
          return isInBounds;
        });

        if (updatedMissiles.length !== missiles.length) {
          setMissiles(updatedMissiles);
        }

        // Check item collisions
        const newItems = Item.checkItemsCollision(items, planeRef.current, timestamp);
        if (newItems.length !== items.length) {
          setItems(newItems);
        }

        // Spawn items every 5 seconds
        if (timestamp - lastItemSpawnTime > 5000) {
          spawnItem(canvas);
          setLastItemSpawnTime(timestamp);
        }

        // Draw items
        items.forEach(item => item.draw(ctx));

        // Draw plane
        planeRef.current.draw(ctx);

        // Draw score and stage
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`Score: ${score}`, canvas.width/2, 10);
        ctx.fillText(`Stage: ${stage}`, canvas.width/2, 40);
      } else {
        // Game over animation
        const opacity = Math.min((timestamp - lastScoreUpdateTime) / 1000, 1);
        
        // Draw final score
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillText(`your score is ${score}`, canvas.width/2, canvas.height/2 - 80);
        
        // Draw game over text
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 30);
        
        // Draw press enter key text
        ctx.font = '24px Arial';
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillText('Press Enter key to restart', canvas.width/2, canvas.height/2 + 30);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, score, stage, showStageUp, items, missiles, lastItemSpawnTime, lastScoreUpdateTime, lastStageUpdateTime, stageUpAnimation, lastMissileSpawnTime]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{
        display: 'block',
        margin: '0 auto',
        border: '1px solid white',
        backgroundColor: 'black'
      }}
    />
  );
};

export default Game; 