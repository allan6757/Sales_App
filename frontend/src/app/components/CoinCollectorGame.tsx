import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Gamepad2, Trophy, Star, Coins, Sparkles } from 'lucide-react';

interface Coin {
  id: number;
  x: number;
  y: number;
  type: 'gold' | 'silver' | 'cherry';
  points: number;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
}

export function CoinCollectorGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerX, setPlayerX] = useState(50);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const gameLoopRef = useRef<number>();
  const coinIntervalRef = useRef<number>();
  const obstacleIntervalRef = useRef<number>();

  useEffect(() => {
    const saved = localStorage.getItem('coinGameHighScore');
    if (saved) {
      setHighScore(parseInt(saved));
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      
      if (e.key === 'ArrowLeft' && playerX > 10) {
        setPlayerX(prev => Math.max(10, prev - 5));
      } else if (e.key === 'ArrowRight' && playerX < 90) {
        setPlayerX(prev => Math.min(90, prev + 5));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, playerX]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setPlayerX(50);
    setCoins([]);
    setObstacles([]);

    // Spawn coins
    coinIntervalRef.current = window.setInterval(() => {
      const types: Array<'gold' | 'silver' | 'cherry'> = ['gold', 'silver', 'cherry'];
      const type = types[Math.floor(Math.random() * types.length)];
      const points = type === 'gold' ? 10 : type === 'silver' ? 5 : 20;
      
      setCoins(prev => [...prev, {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: 0,
        type,
        points
      }]);
    }, 1000);

    // Spawn obstacles
    obstacleIntervalRef.current = window.setInterval(() => {
      setObstacles(prev => [...prev, {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: 0
      }]);
    }, 2000);

    // Game loop
    const gameLoop = () => {
      setCoins(prev => {
        const newCoins = prev
          .map(coin => ({ ...coin, y: coin.y + 2 }))
          .filter(coin => coin.y < 100);
        
        // Check collision with player
        newCoins.forEach(coin => {
          if (coin.y > 85 && coin.y < 95 && Math.abs(coin.x - playerX) < 8) {
            setScore(s => {
              const newScore = s + coin.points;
              if (newScore % 100 === 0) {
                setLevel(l => l + 1);
              }
              return newScore;
            });
            coin.y = 1000; // Remove from screen
          }
        });
        
        return newCoins.filter(coin => coin.y < 1000);
      });

      setObstacles(prev => {
        const newObstacles = prev
          .map(obs => ({ ...obs, y: obs.y + 2.5 }))
          .filter(obs => obs.y < 100);
        
        // Check collision with player
        newObstacles.forEach(obs => {
          if (obs.y > 85 && obs.y < 95 && Math.abs(obs.x - playerX) < 8) {
            endGame();
          }
        });
        
        return newObstacles;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('coinGameHighScore', score.toString());
    }

    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    if (coinIntervalRef.current) {
      clearInterval(coinIntervalRef.current);
    }
    if (obstacleIntervalRef.current) {
      clearInterval(obstacleIntervalRef.current);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameStarted || gameOver) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setPlayerX(Math.max(10, Math.min(90, x)));
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 shadow-lg overflow-hidden" style={{ 
        borderColor: '#FFB7C5',
        background: 'linear-gradient(135deg, #FFF5F7 0%, #F0F9FF 100%)'
      }}>
        <CardHeader style={{ 
          background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        }}>
          <CardTitle className="flex items-center gap-2 text-white">
            <Gamepad2 className="size-6" />
            🎌 Sakura Coin Collector
          </CardTitle>
          <CardDescription className="text-white/90">
            Collect coins, avoid obstacles! Use arrow keys or mouse to move
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Score Display */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <motion.div
              className="p-4 rounded-2xl text-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #F6AD55 0%, #ED8936 100%)' }}
              whileHover={{ scale: 1.05 }}
            >
              <Coins className="size-6 mx-auto mb-2 text-white" />
              <p className="text-2xl font-bold text-white">{score}</p>
              <p className="text-xs text-white/80">Score</p>
            </motion.div>

            <motion.div
              className="p-4 rounded-2xl text-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #FC8181 0%, #F56565 100%)' }}
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="size-6 mx-auto mb-2 text-white" />
              <p className="text-2xl font-bold text-white">{highScore}</p>
              <p className="text-xs text-white/80">Best</p>
            </motion.div>

            <motion.div
              className="p-4 rounded-2xl text-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #68D391 0%, #48BB78 100%)' }}
              whileHover={{ scale: 1.05 }}
            >
              <Star className="size-6 mx-auto mb-2 text-white" />
              <p className="text-2xl font-bold text-white">{level}</p>
              <p className="text-xs text-white/80">Level</p>
            </motion.div>
          </div>

          {/* Game Area */}
          <div
            className="relative rounded-3xl overflow-hidden shadow-2xl mb-6"
            style={{
              height: '400px',
              background: 'linear-gradient(180deg, #FFF1F3 0%, #FFE4E9 50%, #FFD6E0 100%)',
              cursor: gameStarted ? 'none' : 'default'
            }}
            onMouseMove={handleMouseMove}
          >
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-4xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🌸
                </motion.div>
              ))}
            </div>

            {!gameStarted && !gameOver && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎮
                </motion.div>
                <Button
                  size="lg"
                  onClick={startGame}
                  className="text-xl px-8 py-6 rounded-full shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}
                >
                  <Sparkles className="size-5 mr-2" />
                  Start Game
                </Button>
                <p className="mt-4 text-sm text-gray-600">
                  🎯 Gold = 10pts | 💎 Silver = 5pts | 🌸 Cherry = 20pts
                </p>
              </motion.div>
            )}

            {gameOver && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center z-10"
                style={{ background: 'rgba(0,0,0,0.7)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="bg-white rounded-3xl p-8 text-center shadow-2xl"
                >
                  <div className="text-6xl mb-4">
                    {score > highScore ? '🏆' : '🎌'}
                  </div>
                  <h3 className="text-3xl font-bold mb-2" style={{ color: '#667EEA' }}>
                    {score > highScore ? 'New Record!' : 'Game Over!'}
                  </h3>
                  <p className="text-xl mb-2">Score: <strong>{score}</strong></p>
                  <p className="text-sm text-gray-600 mb-6">Level Reached: {level}</p>
                  <Button
                    onClick={startGame}
                    className="rounded-full px-6"
                    style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}
                  >
                    Play Again
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Coins */}
            <AnimatePresence>
              {coins.map(coin => (
                <motion.div
                  key={coin.id}
                  className="absolute text-3xl"
                  style={{
                    left: `${coin.x}%`,
                    top: `${coin.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {coin.type === 'gold' ? '🟡' : coin.type === 'silver' ? '💎' : '🌸'}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Obstacles */}
            <AnimatePresence>
              {obstacles.map(obs => (
                <motion.div
                  key={obs.id}
                  className="absolute text-3xl"
                  style={{
                    left: `${obs.x}%`,
                    top: `${obs.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  ⚫
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Player */}
            {gameStarted && (
              <motion.div
                className="absolute text-4xl"
                style={{
                  left: `${playerX}%`,
                  bottom: '10%',
                  transform: 'translateX(-50%)'
                }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🎯
              </motion.div>
            )}
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #E0E7FF 0%, #FEF3C7 100%)' }}>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="size-4" />
              How to Play:
            </h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>🎯 Use <strong>Arrow Keys</strong> or <strong>Mouse</strong> to move left and right</li>
              <li>🟡 Collect <strong>Gold Coins</strong> (10 points)</li>
              <li>💎 Collect <strong>Silver Coins</strong> (5 points)</li>
              <li>🌸 Collect <strong>Cherry Blossoms</strong> (20 points bonus!)</li>
              <li>⚫ Avoid the <strong>Dark Obstacles</strong> or it's game over!</li>
              <li>📈 Level up every 100 points for faster gameplay!</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
