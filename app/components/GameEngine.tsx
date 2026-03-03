'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TileMap, TILE_SIZE, MAP_WIDTH } from '../lib/TileMap';
import { PlayerStats, Position, Entity, Quest } from '../types/game';
import { DRILLS } from '../lib/DrillData';
import Shop from './Shop';
import Crafting from './Crafting';
import Inventory from './Inventory';
import Settings from './Settings';
import StatusWindow from './StatusWindow';

const GAME_LOOP_MS = 100;
const MINING_DELAY_MS = 0; // Removed bottleneck, using drill stats instead
const MOVEMENT_DELAY_MS = 100;
const BASE_DEPTH = 10;

export default function GameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const tilesetRef = useRef<HTMLImageElement | null>(null);
  const baseTilesetRef = useRef<HTMLImageElement | null>(null);
  const [tilesetLoaded, setTilesetLoaded] = useState(false);
  const baseLayoutRef = useRef<number[][] | null>(null);
  const [baseTilesetLoaded, setBaseTilesetLoaded] = useState(false);
  const entitiesRef = useRef<Entity[]>([]);
  const entityImagesRef = useRef<{ [path: string]: HTMLImageElement }>({});
  const resourceAssetsRef = useRef<{ [type: string]: HTMLImageElement }>({});
  const playerImgRef = useRef<HTMLImageElement | null>(null);
  const availableQuestsRef = useRef<Quest[]>([]);

  // High-frequency state stored in refs to avoid React re-renders
  const tileMapRef = useRef(new TileMap());
  const playerPosRef = useRef<Position>({
    x: Math.floor(MAP_WIDTH / 2),
    y: 8,
  });

  // Visual position for smooth interpolation (Lerp)
  const visualPosRef = useRef<Position>({ x: Math.floor(MAP_WIDTH / 2), y: 8 });
  const statsRef = useRef<PlayerStats>({
    depth: 0,
    equippedDrillId: 'rusty_drill',
    ownedDrillIds: ['rusty_drill'],
    maxDepthReached: 0,
    artifacts: [],
    hp: 200,
    maxHp: 200,
    attackPower: 10,
    inventory: {
      dirt: 0,
      stone: 0,
      coal: 0,
      iron: 0,
      gold: 0,
      diamond: 0,
      emerald: 0,
      ruby: 0,
      sapphire: 0,
      uranium: 0,
      obsidian: 0,
    },
    goldCoins: 0,
    activeQuests: [],
    completedQuestIds: [],
  });
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Drill animation state
  const isDrillingRef = useRef(false);

  // React state for UI components only
  const [uiStats, setUiStats] = useState<PlayerStats>(statsRef.current);

  // Last update times for frequency control
  const lastMoveTime = useRef(0);
  const lastUiUpdateTime = useRef(0);

  // Track last global regeneration time for offline progress
  const lastGlobalRegenTimeRef = useRef(Date.now());

  // NPC 및 모달 상태 (React State + Ref Sync to avoid stale closures)
  const [showInteractionPrompt, _setShowInteractionPrompt] = useState(false);
  const showInteractionPromptRef = useRef(false);
  const setShowInteractionPrompt = (val: boolean) => {
    showInteractionPromptRef.current = val;
    _setShowInteractionPrompt(val);
  };

  const [isShopOpen, _setIsShopOpen] = useState(false);
  const isShopOpenRef = useRef(false);
  const setIsShopOpen = (val: boolean) => {
    isShopOpenRef.current = val;
    _setIsShopOpen(val);
  };

  const [isInventoryOpen, _setIsInventoryOpen] = useState(false);
  const isInventoryOpenRef = useRef(false);
  const setIsInventoryOpen = (val: boolean) => {
    isInventoryOpenRef.current = val;
    _setIsInventoryOpen(val);
  };

  const [isSettingsOpen, _setIsSettingsOpen] = useState(false);
  const isSettingsOpenRef = useRef(false);
  const setIsSettingsOpen = (val: boolean) => {
    isSettingsOpenRef.current = val;
    _setIsSettingsOpen(val);
  };

  const [isCraftingOpen, _setIsCraftingOpen] = useState(false);
  const isCraftingOpenRef = useRef(false);
  const setIsCraftingOpen = (val: boolean) => {
    isCraftingOpenRef.current = val;
    _setIsCraftingOpen(val);
  };

  const [isElevatorOpen, _setIsElevatorOpen] = useState(false);
  const isElevatorOpenRef = useRef(false);
  const setIsElevatorOpen = (val: boolean) => {
    isElevatorOpenRef.current = val;
    _setIsElevatorOpen(val);
  };

  const [isStatusOpen, _setIsStatusOpen] = useState(false);
  const isStatusOpenRef = useRef(false);
  const setIsStatusOpen = (val: boolean) => {
    isStatusOpenRef.current = val;
    _setIsStatusOpen(val);
  };

  const [activeInteractionType, setActiveInteractionType] = useState<
    'shop' | 'dialog' | 'quest' | 'crafting' | null
  >(null);
  const activeInteractionTypeRef = useRef<
    'shop' | 'dialog' | 'quest' | 'crafting' | null
  >(null);

  const gameSettingsRef = useRef({ screenShake: true });

  const updateSettingsFromStorage = useCallback(() => {
    const saved = localStorage.getItem('drilling-game-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.screenShake !== undefined) {
          gameSettingsRef.current.screenShake = parsed.screenShake;
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
  }, []);

  // Load settings on mount and periodically sync while settings modal is open
  useEffect(() => {
    updateSettingsFromStorage();
    if (isSettingsOpen) {
      const interval = setInterval(updateSettingsFromStorage, 100);
      return () => clearInterval(interval);
    }
  }, [isSettingsOpen, updateSettingsFromStorage]);

  // Visual Effects State
  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number; // 1.0 to 0.0
    color: string;
    size: number;
  }
  interface FloatingText {
    x: number;
    y: number;
    text: string;
    color: string;
    startY: number;
    life: number; // 1.0 to 0.0
  }
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const screenShakeRef = useRef(0);

  // ... (skipping unchanged saveGame/loadGame for brevity in this replace block if possible, but replace_file_content needs contiguous block.
  // I will target the specific blocks with errors using multiple chunks or a large block if they are close.
  // The errors are around line 127 and 331. I will use multi_replace for better precision.)

  const saveGame = useCallback(() => {
    const saveData = {
      stats: statsRef.current,
      position: playerPosRef.current,
      tileMap: tileMapRef.current.serialize(), // Save Map
      lastSaved: Date.now(),
      lastGlobalRegen: lastGlobalRegenTimeRef.current, // Save regen time
    };
    localStorage.setItem('drilling-game-save', JSON.stringify(saveData));
    console.log('Game Saved to LocalStorage');
  }, []);

  const loadGame = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('drilling-game-save');
    if (saved) {
      try {
        const data = JSON.parse(saved);

        // Restore last regen time
        if (data.lastGlobalRegen) {
          lastGlobalRegenTimeRef.current = data.lastGlobalRegen;
        }

        if (data.stats) {
          // Migration: if missing drill info, set default
          const equippedDrillId = data.stats.equippedDrillId || 'rusty_drill';
          const ownedDrillIds = data.stats.ownedDrillIds || ['rusty_drill'];

          // Fix: Merge inventory to ensure new minerals are initialized
          const mergedInventory = {
            ...statsRef.current.inventory,
            ...(data.stats.inventory || {}),
          };

          statsRef.current = {
            ...statsRef.current,
            ...data.stats,
            inventory: mergedInventory,
            equippedDrillId,
            ownedDrillIds,
            maxDepthReached:
              data.stats.maxDepthReached || data.stats.depth || 0,
            artifacts: data.stats.artifacts || [],
            hp: data.stats.hp ?? 100,
            maxHp: data.stats.maxHp ?? 100,
            attackPower: data.stats.attackPower ?? 10,
          };
          setUiStats({ ...statsRef.current });
        }
        if (data.position) {
          playerPosRef.current = data.position;
          visualPosRef.current = { ...data.position };
        }
        if (data.tileMap) {
          tileMapRef.current.deserialize(data.tileMap);
          console.log('TileMap Loaded from LocalStorage');
        }
        console.log('Game Loaded from LocalStorage');
        return true;
      } catch (e) {
        console.error('Failed to parse save data', e);
      }
    }
    return false;
  }, []);

  useEffect(() => {
    setIsClient(true);

    // Function to load base layout
    const loadBaseLayout = () => {
      fetch(`baseLayout.json?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          baseLayoutRef.current = data.tiles;
        })
        .catch((err) => console.error('Failed to load base layout:', err));
    };

    const loadEntities = () => {
      fetch(`entities.json?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          console.log('Entities Loaded:', data.entities.length);
          entitiesRef.current = data.entities;

          // Pre-load custom entity images
          data.entities.forEach((entity: Entity) => {
            if (
              entity.imagePath &&
              !entityImagesRef.current[entity.imagePath]
            ) {
              const img = new Image();
              // Handle potential leading slash in JSON image paths for GH Pages
              const cleanPath = entity.imagePath.startsWith('/')
                ? entity.imagePath.substring(1)
                : entity.imagePath;
              img.src = cleanPath;

              img.onload = () => {
                entityImagesRef.current[entity.imagePath!] = img;
              };
            }
          });
        })
        .catch((err) => console.error('Failed to load entities:', err));
    };

    const acceptQuest = (questId: string) => {
      const q = availableQuestsRef.current.find((q) => q.id === questId);
      if (q && !statsRef.current.activeQuests.find((aq) => aq.id === questId)) {
        const newQuest = { ...q, status: 'active' as const };
        statsRef.current.activeQuests.push(newQuest);
        setUiStats({ ...statsRef.current });
        console.log(`Quest Accepted: ${q.title}`);
      }
    };

    const completeQuest = (questId: string) => {
      const qIndex = statsRef.current.activeQuests.findIndex(
        (q) => q.id === questId,
      );
      if (qIndex !== -1) {
        const q = statsRef.current.activeQuests[qIndex];
        if (q.requirement.current >= q.requirement.target) {
          statsRef.current.completedQuestIds.push(questId);
          statsRef.current.activeQuests.splice(qIndex, 1);
          setUiStats({ ...statsRef.current });
          console.log(`Quest Completed: ${q.title}`);
        }
      }
    };

    // Function to load quests
    const loadQuests = () => {
      fetch(`quests.json?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          console.log('Quests Loaded:', data.quests.length);
          availableQuestsRef.current = data.quests;
        })
        .catch((err) => console.error('Failed to load quests:', err));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isAnyModalOpen =
        isShopOpenRef.current ||
        isInventoryOpenRef.current ||
        isSettingsOpenRef.current ||
        isElevatorOpenRef.current ||
        isCraftingOpenRef.current ||
        isStatusOpenRef.current;

      if (e.key === 'Escape') {
        if (isAnyModalOpen) {
          setIsShopOpen(false);
          setIsInventoryOpen(false);
          setIsSettingsOpen(false);
          setIsCraftingOpen(false);
          setIsElevatorOpen(false);
          setIsStatusOpen(false);
        } else {
          setIsSettingsOpen(true);
        }
        return;
      }

      if (e.key.toLowerCase() === 'i') {
        if (!isShopOpenRef.current && !isSettingsOpenRef.current) {
          setIsInventoryOpen(!isInventoryOpenRef.current);
          if (isStatusOpenRef.current) setIsStatusOpen(false);
        }
        return;
      }

      if (e.key.toLowerCase() === 'c') {
        if (!isShopOpenRef.current && !isSettingsOpenRef.current) {
          setIsStatusOpen(!isStatusOpenRef.current);
          if (isInventoryOpenRef.current) setIsInventoryOpen(false);
        }
        return;
      }

      if (e.key.toLowerCase() === 'l') {
        if (
          !isShopOpenRef.current &&
          !isSettingsOpenRef.current &&
          statsRef.current.maxDepthReached >= 100
        ) {
          setIsElevatorOpen(!isElevatorOpenRef.current);
        }
        return;
      }

      if (e.key === ' ' || e.key === 'e' || e.key === 'E') {
        if (showInteractionPromptRef.current && !isAnyModalOpen) {
          if (activeInteractionTypeRef.current === 'shop') {
            setIsShopOpen(true);
          } else if (activeInteractionTypeRef.current === 'crafting') {
            setIsCraftingOpen(true);
          }
          keysRef.current = {}; // 모달 열릴 때 이동 멈춤
          return;
        }
      }

      if (isAnyModalOpen) return;

      keysRef.current[e.key.toLowerCase()] = true;
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)
      ) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    // Safety: Reset keys when window loses focus to prevent stuck movement
    const handleBlur = () => {
      keysRef.current = {};
      isDrillingRef.current = false;
    };

    // Load player image
    const playerImg = new Image();
    playerImg.src = 'Player.png';

    playerImg.onload = () => {
      playerImgRef.current = playerImg;
    };

    // Load high-quality mineral assets
    const gemsToLoad = ['emerald', 'ruby', 'sapphire'];
    gemsToLoad.forEach((gem) => {
      const gimg = new Image();
      gimg.src = `gems/${gem}.png`;
      gimg.onload = () => {
        resourceAssetsRef.current[gem] = gimg;
        console.log(`Resource Image Loaded: ${gem}`);
      };
    });

    // Load tileset
    const img = new Image();
    img.src = 'NewTileset.png'; // Updated tileset

    img.onload = () => {
      console.log('Tileset Loaded:', img.width, img.height);
      tilesetRef.current = img;
      setTilesetLoaded(true);
    };

    // Load Base Tileset
    const baseImg = new Image();
    baseImg.src = 'BaseTileset.png';

    baseImg.onload = () => {
      console.log('Base Tileset Loaded:', baseImg.width, baseImg.height);
      baseTilesetRef.current = baseImg;
      setBaseTilesetLoaded(true);
    };

    // Load JSONs initially
    loadBaseLayout();
    loadEntities();

    // Auto-reload JSONs every 2 seconds
    // Initial Load
    const gameLoaded = loadGame();
    if (!gameLoaded) {
      loadBaseLayout();
      loadEntities();
      loadQuests();
    } else {
      // Even if loaded, refresh some external data
      loadEntities();
      loadQuests();

      // CHECK OFFLINE REGENERATION
      const now = Date.now();
      const timeSinceRegen = now - lastGlobalRegenTimeRef.current;
      if (timeSinceRegen >= 60 * 60 * 1000) {
        // More than 1 hour passed
        if (tileMapRef.current && playerPosRef.current) {
          console.log('Processing Offline Global Regeneration...');
          tileMapRef.current.regenerateAllResources(
            playerPosRef.current.x,
            playerPosRef.current.y,
          );
          lastGlobalRegenTimeRef.current = now;
          // Save immediately to update timestamp
          // We can't call saveGame() directly inside render/effect easily if it wasn't a dep.
          // But statsRef is stable. We can manually set localStorage or just wait for auto-save.
          // Let's just update the ref, auto-save will catch it in 10s.
        }
      }
    }

    const jsonReloadInterval = setInterval(() => {
      // Re-load layout only if not already loaded once or optionally keep it sync
      // loadBaseLayout();
      loadEntities();
      loadQuests();
    }, 5000);

    // Auto-save interval
    const autoSaveInterval = setInterval(() => {
      saveGame();
    }, 10000); // 10 seconds

    // Health Auto-Recovery Interval (5 seconds)
    const healthRegenInterval = setInterval(() => {
      // --- HP Auto-Recovery at Base Camp ---
      if (
        statsRef.current.depth === 0 &&
        statsRef.current.hp < statsRef.current.maxHp
      ) {
        // Only recover if not in a modal? Usually safe to recover in background.
        // But let's check isAnyModalOpen just to pause game logic if needed,
        // though HP recovery is passive.
        // The previous logic checked isAnyModalOpen. Let's keep it consistent.

        const isAnyModalOpen =
          isShopOpenRef.current ||
          isInventoryOpenRef.current ||
          isSettingsOpenRef.current ||
          isCraftingOpenRef.current ||
          isElevatorOpenRef.current ||
          isStatusOpenRef.current;

        if (!isAnyModalOpen) {
          statsRef.current.hp = Math.min(
            statsRef.current.maxHp,
            statsRef.current.hp + 20,
          ); // Recover 20 HP every 5s
          setUiStats({ ...statsRef.current });
          if (playerPosRef.current) {
            floatingTextsRef.current.push({
              x: playerPosRef.current.x * TILE_SIZE + TILE_SIZE / 2,
              y: playerPosRef.current.y * TILE_SIZE - 20,
              text: 'REPAIRING...',
              color: '#4ade80',
              startY: playerPosRef.current.y * TILE_SIZE - 20,
              life: 1.0,
            });
          }
        }
      }
    }, 5000);

    // Global Resource Regeneration Interval (60 minutes)
    const globalRegenInterval = setInterval(
      () => {
        const isAnyModalOpen =
          isShopOpenRef.current ||
          isInventoryOpenRef.current ||
          isSettingsOpenRef.current ||
          isCraftingOpenRef.current ||
          isElevatorOpenRef.current ||
          isStatusOpenRef.current;

        // Execute only if playing, or maybe just check map existence
        if (!isAnyModalOpen && tileMapRef.current && playerPosRef.current) {
          tileMapRef.current.regenerateAllResources(
            playerPosRef.current.x,
            playerPosRef.current.y,
          );
          // Update timestamp
          lastGlobalRegenTimeRef.current = Date.now();
        }
      },
      60 * 60 * 1000,
    ); // 1 Hour

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      clearInterval(jsonReloadInterval);
      clearInterval(autoSaveInterval);
      clearInterval(healthRegenInterval);
      clearInterval(globalRegenInterval);
    };
  }, []);

  const updateLogic = useCallback(
    (now: number) => {
      const now_ms = Date.now(); // Renamed 'now' to 'now_ms' to avoid conflict with function parameter 'now'

      const createParticles = (cx: number, cy: number, color: string) => {
        for (let i = 0; i < 8; i++) {
          particlesRef.current.push({
            x: cx + TILE_SIZE / 2,
            y: cy + TILE_SIZE / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color: color,
            size: Math.random() * 4 + 2,
          });
        }
      };

      const createFloatingText = (
        cx: number,
        cy: number,
        text: string,
        color: string,
      ) => {
        floatingTextsRef.current.push({
          x: cx + TILE_SIZE / 2,
          y: cy,
          text: text,
          color: color,
          startY: cy,
          life: 1.0,
        });
      };

      // Calculate delay based on action (mining vs moving)
      // We don't know the action yet, but we can check if we are ready for a potential action
      // If not drilling, use standard move delay. If drilling, allowed to run faster.
      const timeSinceLastMove = now_ms - lastMoveTime.current;

      const isAnyModalOpen =
        isShopOpenRef.current ||
        isInventoryOpenRef.current ||
        isSettingsOpenRef.current ||
        isCraftingOpenRef.current ||
        isElevatorOpenRef.current ||
        isStatusOpenRef.current;

      if (isAnyModalOpen) return;

      let dx = 0;
      let dy = 0;
      const keys = keysRef.current;

      // Prioritize vertical movement
      if (keys['arrowdown'] || keys['s']) {
        dy = 1;
      } else if (keys['arrowup'] || keys['w']) {
        dy = -1;
      }

      // Only check horizontal if not moving vertically
      if (dy === 0) {
        if (keys['arrowleft'] || keys['a']) dx = -1;
        else if (keys['arrowright'] || keys['d']) dx = 1;
      }

      if (dx !== 0 || dy !== 0) {
        const currentPos = playerPosRef.current;
        const newX = currentPos.x + dx;
        const newY = currentPos.y + dy;

        // Base Camp Decoration Collision Check
        if (newY < BASE_DEPTH && baseLayoutRef.current) {
          const baseTileIdx = baseLayoutRef.current[newY]?.[newX];
          const SOLID_TILES_BASE = [7, 10, 11, 12, 13, 17]; // Rock, Tree, Large Rock, Sign, Fence
          if (SOLID_TILES_BASE.includes(baseTileIdx)) {
            return; // Block movement
          }
        }

        const targetTile = tileMapRef.current.getTile(newX, newY);

        if (targetTile && targetTile.type !== 'wall') {
          const currentDrill =
            DRILLS[statsRef.current.equippedDrillId] || DRILLS['rusty_drill'];
          const isMiningTile = targetTile.type !== 'empty';
          const drillDelay = isMiningTile
            ? currentDrill.cooldownMs
            : MOVEMENT_DELAY_MS;

          // Catch-up protection: If lastMoveTime is too far behind, reset it to prevent a huge burst of hits.
          // We allow at most 1 hit of buffer.
          if (now_ms - lastMoveTime.current > drillDelay * 2) {
            lastMoveTime.current = now_ms - drillDelay;
          }

          let hitsInThisFrame = 0;
          const MAX_HITS_PER_FRAME = 10;

          // Using a while loop to allow multiple mining hits per frame for sub-frame cooldowns
          while (hitsInThisFrame < MAX_HITS_PER_FRAME) {
            const timeSinceLastMove = now_ms - lastMoveTime.current;
            const isMining = targetTile.type !== 'empty';
            const requiredDelay = isMining
              ? currentDrill.cooldownMs
              : MOVEMENT_DELAY_MS;

            if (timeSinceLastMove < requiredDelay) break;
            hitsInThisFrame++;

            if (targetTile.type === 'empty') {
              playerPosRef.current = { x: newX, y: newY };
              const newDepth = Math.max(0, newY - BASE_DEPTH);
              statsRef.current.depth = newDepth;
              if (newDepth > statsRef.current.maxDepthReached) {
                statsRef.current.maxDepthReached = newDepth;
              }
              isDrillingRef.current = false;
              lastMoveTime.current += requiredDelay;
              // Limit to one move per frame even if delay is low to avoid flying
              break;
            } else {
              // Mining
              isDrillingRef.current = true;
              const targetType = targetTile.type;
              const targetValue = targetTile.value;
              const stats = statsRef.current; // Define at the top of mining block

              // --- Combat Interaction ---
              if (targetType === 'monster_nest' || targetType === 'boss_core') {
                const damageTaken = targetType === 'boss_core' ? 2 : 0.5;
                stats.hp = Math.max(0, stats.hp - damageTaken);
                screenShakeRef.current = 5;

                if (Math.random() < 0.1) {
                  createFloatingText(
                    playerPosRef.current.x * TILE_SIZE,
                    playerPosRef.current.y * TILE_SIZE - 20,
                    'OUCH!',
                    '#ef4444',
                  );
                }

                if (stats.hp <= 0) {
                  createFloatingText(
                    playerPosRef.current.x * TILE_SIZE,
                    playerPosRef.current.y * TILE_SIZE - 40,
                    'UNIT DAMAGED. RETURNING...',
                    '#ef4444',
                  );
                  setTimeout(() => {
                    playerPosRef.current = {
                      x: Math.floor(MAP_WIDTH / 2),
                      y: 8,
                    };
                    visualPosRef.current = { ...playerPosRef.current };
                    stats.hp = stats.maxHp;
                    visualPosRef.current = { ...playerPosRef.current };
                    stats.hp = stats.maxHp;
                    stats.depth = 0;
                    setUiStats({ ...stats });
                  }, 1000);
                  isDrillingRef.current = false;
                  return;
                }
              }

              const targetColor = getTileColor(targetType as string);
              const destroyed = tileMapRef.current.damageTile(
                newX,
                newY,
                currentDrill.basePower,
              );

              // --- Special Effects Implementation ---
              if (currentDrill.specialEffect === 'explosive' && destroyed) {
                // Damage neighboring tiles
                const neighbors = [
                  { x: newX + 1, y: newY },
                  { x: newX - 1, y: newY },
                  { x: newX, y: newY + 1 },
                  { x: newX, y: newY - 1 },
                ];
                neighbors.forEach((n) => {
                  const nt = tileMapRef.current.getTile(n.x, n.y);
                  if (nt && nt.type !== 'empty' && nt.type !== 'wall') {
                    const nDestroyed = tileMapRef.current.damageTile(
                      n.x,
                      n.y,
                      currentDrill.basePower * 0.5,
                    );
                    if (nDestroyed) {
                      const nColor = getTileColor(nt.type);
                      createParticles(n.x * TILE_SIZE, n.y * TILE_SIZE, nColor);
                      // Quest tracking for collateral damage
                      stats.activeQuests.forEach((q) => {
                        if (
                          q.status === 'active' &&
                          q.requirement.type === nt.type
                        ) {
                          const currentCount =
                            stats.inventory[
                              nt.type as keyof typeof stats.inventory
                            ] || 0;
                          q.requirement.current = currentCount + 1;
                        }
                      });
                      const nType = nt.type as keyof typeof stats.inventory;
                      if (stats.inventory[nType] !== undefined) {
                        stats.inventory[nType]++;
                      }
                    }
                  }
                });
                screenShakeRef.current = 8;
              }

              if (destroyed) {
                createParticles(
                  newX * TILE_SIZE,
                  newY * TILE_SIZE,
                  targetColor,
                );
                screenShakeRef.current =
                  currentDrill.specialEffect === 'speed' ? 4 : 2.5;
                if (targetValue >= 0) {
                  const type = targetType as keyof typeof stats.inventory;
                  if (stats.inventory[type] !== undefined) {
                    stats.inventory[type]++;
                    createFloatingText(
                      newX * TILE_SIZE,
                      newY * TILE_SIZE,
                      `+1 ${type.toUpperCase()}`,
                      '#fbbf24',
                    );
                  }
                }

                if (targetType === 'boss_core') {
                  const artifactName = 'Ancient Core';
                  if (!stats.artifacts.includes(artifactName)) {
                    stats.artifacts.push(artifactName);
                    stats.attackPower += 20;
                    stats.maxHp += 50;
                    stats.hp = stats.maxHp;
                    createFloatingText(
                      newX * TILE_SIZE,
                      newY * TILE_SIZE - 40,
                      'ARTIFACT ACQUIRED: ANCIENT CORE!',
                      '#a855f7',
                    );
                    createFloatingText(
                      newX * TILE_SIZE,
                      newY * TILE_SIZE - 20,
                      'ATK +20, MAX HP +50',
                      '#a855f7',
                    );
                  }
                }

                // Quest Tracking
                stats.activeQuests.forEach((q) => {
                  if (
                    q.status === 'active' &&
                    q.requirement.type === targetType
                  ) {
                    const currentCount =
                      stats.inventory[
                        targetType as keyof typeof stats.inventory
                      ] || 0;
                    q.requirement.current = currentCount;

                    if (q.requirement.current >= q.requirement.target) {
                      console.log(`Quest Complete Target Reached: ${q.title}`);
                      createFloatingText(
                        newX * TILE_SIZE,
                        newY * TILE_SIZE - 20,
                        'QUEST COMPLETE!',
                        '#4ade80',
                      );
                    }
                    setUiStats({ ...stats });
                  }
                });

                // Mining successful - no fuel consumed
                const newDepth = Math.max(0, newY - BASE_DEPTH);
                stats.depth = newDepth;
                if (newDepth > stats.maxDepthReached) {
                  stats.maxDepthReached = newDepth;
                }
                playerPosRef.current = { x: newX, y: newY };
                isDrillingRef.current = false;
                lastMoveTime.current += requiredDelay;
                break; // Stop after destroying a tile to move into it next tick
              }
            }
          }
        } else {
          isDrillingRef.current = false;
        }
      } else {
        isDrillingRef.current = false;
      }

      // Sync to UI state at lower frequency (e.g., 10Hz)
      if (now_ms - lastUiUpdateTime.current > 100) {
        setUiStats({ ...statsRef.current });

        // Entity Proximity Check (Interactions)
        const px = playerPosRef.current.x;
        const py = playerPosRef.current.y;
        let foundInteraction = false;

        for (const entity of entitiesRef.current) {
          const entW = entity.width || 1;
          const entH = entity.height || 1;
          // New: Bottom-Center Anchor based center calculation
          const centerX = entity.x;
          const centerY = entity.y - entH / 2;

          const dist = Math.sqrt(
            Math.pow(centerX - px, 2) + Math.pow(centerY - py, 2),
          );

          if (dist < 2.5) {
            foundInteraction = true;
            activeInteractionTypeRef.current = entity.interactionType;
            setActiveInteractionType(entity.interactionType);
            break;
          }
        }

        if (showInteractionPromptRef.current !== foundInteraction) {
          setShowInteractionPrompt(foundInteraction);
        }

        lastUiUpdateTime.current = now_ms;
      }
    },
    [], // Ref를 사용하므로 의존성 불필요
  );

  // NPC Proximity Check가 updateLogic으로 통합되었으므로 기존 useEffect 제거
  useEffect(() => {
    setIsClient(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Rendering
  useEffect(() => {
    if (!isClient) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = (now: number) => {
      // Update logic first
      updateLogic(now);

      const isAnyModalOpen =
        isShopOpenRef.current ||
        isInventoryOpenRef.current ||
        isSettingsOpenRef.current ||
        isCraftingOpenRef.current ||
        isElevatorOpenRef.current ||
        isStatusOpenRef.current;

      // Using a simple Lerp factor (0.2 per frame at 60fps)
      const targetPos = playerPosRef.current;
      const visualPos = visualPosRef.current;
      const lerpFactor = 0.2;

      visualPos.x += (targetPos.x - visualPos.x) * lerpFactor;
      visualPos.y += (targetPos.y - visualPos.y) * lerpFactor;

      // Screen Shake Logic
      if (screenShakeRef.current > 0 && gameSettingsRef.current.screenShake) {
        visualPos.x += (Math.random() - 0.5) * 0.1 * screenShakeRef.current;
        visualPos.y += (Math.random() - 0.5) * 0.1 * screenShakeRef.current;
        screenShakeRef.current = Math.max(0, screenShakeRef.current - 0.5);
      } else if (screenShakeRef.current > 0) {
        // Still decay the value even if shake is disabled to avoid jumping when re-enabled
        screenShakeRef.current = Math.max(0, screenShakeRef.current - 0.5);
      }

      // Rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const tileMap = tileMapRef.current;

      // --- Draw Global Backgrounds (Screen Space) ---
      const scale = 1.5; // Zoom factor for better immersion
      const cameraY = Math.round(visualPos.y * TILE_SIZE - canvas.height / 2);

      // 1. Fill entire screen with sky blue (base)
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Fill bottom part with a dark earth/void color that matches Bedrock
      ctx.fillStyle = '#1a1a1b';
      const surfaceY =
        (BASE_DEPTH * TILE_SIZE - visualPos.y * TILE_SIZE) * scale +
        canvas.height / 2;
      if (surfaceY < canvas.height) {
        ctx.fillRect(
          0,
          Math.max(0, surfaceY),
          canvas.width,
          canvas.height - Math.max(0, surfaceY),
        );
      }

      const worldWidth = MAP_WIDTH * TILE_SIZE;
      const viewportWidthInWorld = canvas.width / scale;
      const viewportHeightInWorld = canvas.height / scale;

      // 1. Calculate ideal camera position (center player)
      let targetCameraX = visualPos.x * TILE_SIZE - viewportWidthInWorld / 2;
      const maxCameraX = Math.max(0, worldWidth - viewportWidthInWorld);
      targetCameraX = Math.max(0, Math.min(targetCameraX, maxCameraX));

      if (worldWidth < viewportWidthInWorld) {
        targetCameraX = -(viewportWidthInWorld - worldWidth) / 2;
      }

      const targetCameraY = visualPos.y * TILE_SIZE;

      // 2. Compute final screen translations and FLOOR them
      // This is the key to preventing seams at non-integer scales
      const screenShiftX = -Math.floor(targetCameraX * scale);
      const screenShiftY = Math.floor(
        canvas.height / 2 - targetCameraY * scale,
      );

      ctx.save();
      ctx.imageSmoothingEnabled = false;

      // One-shot transform to absolute screen coordinates
      ctx.translate(screenShiftX, screenShiftY);
      ctx.scale(scale, scale);

      const startY = Math.max(
        0,
        Math.floor(visualPos.y - viewportHeightInWorld / 2 / TILE_SIZE) - 5,
      );
      const endY = startY + Math.ceil(viewportHeightInWorld / TILE_SIZE) + 10;

      // --- Draw Base Background for World Area (to prevent gaps between tiles) ---
      // Surface Area
      ctx.fillStyle = '#4ade80'; // Lush grass green
      ctx.fillRect(0, 0, worldWidth, BASE_DEPTH * TILE_SIZE);
      // Underground Area
      ctx.fillStyle = '#4e342e'; // Dirt brown
      ctx.fillRect(
        0,
        BASE_DEPTH * TILE_SIZE,
        worldWidth,
        MAP_WIDTH * 100 * TILE_SIZE,
      ); // Map height is deep

      // --- Draw Base Area (Background & Structures) ---
      if (baseTilesetRef.current) {
        for (let y = 0; y < BASE_DEPTH; y++) {
          for (let x = 0; x < MAP_WIDTH; x++) {
            // Basic Frustum Culling (Vertical)
            if (
              (y * TILE_SIZE - visualPos.y * TILE_SIZE) * scale >
              canvas.height / 2 + 100
            )
              continue;
            if (
              (y * TILE_SIZE - visualPos.y * TILE_SIZE) * scale <
              -canvas.height / 2 - 100
            )
              continue;

            // Get tile index from JSON layout
            let tileIdx = -1;
            if (
              baseLayoutRef.current &&
              baseLayoutRef.current[y] &&
              baseLayoutRef.current[y][x] !== undefined
            ) {
              tileIdx = baseLayoutRef.current[y][x];
            }

            const drawX = x * TILE_SIZE;
            const drawY = y * TILE_SIZE;

            if (tileIdx >= 0) {
              const cols = 5;
              const TILE_SOURCE_SIZE = 128;
              const sx = (tileIdx % cols) * TILE_SOURCE_SIZE;
              const sy = Math.floor(tileIdx / cols) * TILE_SOURCE_SIZE;

              let crownOffsetX = 0;
              if (tileIdx === 11) crownOffsetX = 12;

              ctx.drawImage(
                baseTilesetRef.current,
                sx,
                sy,
                TILE_SOURCE_SIZE,
                TILE_SOURCE_SIZE,
                drawX + crownOffsetX,
                drawY,
                TILE_SIZE + 0.5, // Tiny overlap to hide seams
                TILE_SIZE + 0.5,
              );
            }
          }
        }
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '900 14px monospace';
        ctx.fillText(
          '🌿 BASE CAMP - MAIN BASE',
          20,
          BASE_DEPTH * TILE_SIZE - 20,
        );
      } else if (startY < BASE_DEPTH) {
        // Simple fallback banner
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('🏠 HOME BASE', 20, BASE_DEPTH * TILE_SIZE - 20);
      }

      for (let y = startY; y < endY; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
          const tile = tileMap.grid[y]?.[x];
          if (!tile || tile.type === 'empty') continue;

          // Check ref directly to avoid closure staleness
          if (tilesetRef.current) {
            // Tile Variation Logic based on position seed
            // We'll use a simple pseudo-random hash
            const seed = (x * 1234 + y * 5678) % 1000;
            let tileIdx = getTileIndex(tile.type);

            // Add Variations for Dirt and Stone
            if (tile.type === 'dirt') {
              // 3 dirt variations at index 0, 1, 2
              tileIdx = Math.floor(seed % 3);
            } else if (tile.type === 'stone') {
              // 2 stone variations at index 3, 4
              tileIdx = 3 + Math.floor(seed % 2);
            }
            // Ores are single tiles for now: Coal(5), Iron(6), Gold(7), Diamond(8), Bedrock(9)

            const cols = 5; // NewTileset layout
            // Confirmed size from console log: 640x640
            const TOTAL_WIDTH = 640;
            const TILE_SOURCE_SIZE = TOTAL_WIDTH / cols; // 128

            // Rows:
            // 0: Dirt variants (0,1,2), Stone variants (3,4)
            // 1: Coal(5), Iron(6), Gold(7), Diamond(8), Bedrock(9)

            const sx = (tileIdx % cols) * TILE_SOURCE_SIZE;
            const sy = Math.floor(tileIdx / cols) * TILE_SOURCE_SIZE;

            if (resourceAssetsRef.current[tile.type]) {
              // Use high-quality dynamic asset
              ctx.drawImage(
                resourceAssetsRef.current[tile.type],
                x * TILE_SIZE,
                y * TILE_SIZE,
                TILE_SIZE + 1,
                TILE_SIZE + 1,
              );
            } else if (tileIdx >= 0) {
              ctx.drawImage(
                tilesetRef.current,
                sx,
                sy,
                TILE_SOURCE_SIZE,
                TILE_SOURCE_SIZE,
                x * TILE_SIZE,
                y * TILE_SIZE,
                TILE_SIZE + 1, // Add +1 to overlap
                TILE_SIZE + 1, // Add +1 to overlap
              );
            } else {
              // Fallback (redundant if all mapped, but safe)
              ctx.fillStyle = getTileColor(tile.type);
              ctx.fillRect(
                x * TILE_SIZE,
                y * TILE_SIZE,
                TILE_SIZE + 1,
                TILE_SIZE + 1,
              );
            }
          } else {
            ctx.fillStyle = getTileColor(tile.type);
            ctx.fillRect(
              x * TILE_SIZE,
              y * TILE_SIZE,
              TILE_SIZE + 1,
              TILE_SIZE + 1,
            ); // Add +1 to overlap
          }

          if (tile.health < tile.maxHealth && tile.health > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            const damagePercent = 1 - tile.health / tile.maxHealth;
            ctx.fillRect(
              x * TILE_SIZE,
              y * TILE_SIZE,
              TILE_SIZE - 1,
              (TILE_SIZE - 1) * damagePercent,
            );
          }
        }
      }

      // --- Draw Player ---
      let px = Math.round(visualPos.x * TILE_SIZE);
      let py = Math.round(visualPos.y * TILE_SIZE);

      // Vibration and Glow effect while drilling
      if (isDrillingRef.current) {
        if (gameSettingsRef.current.screenShake) {
          px += (Math.random() - 0.5) * 2;
          py += (Math.random() - 0.5) * 2;
        }
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff3d00';
      } else {
        ctx.shadowBlur = 0;
      }

      if (playerImgRef.current) {
        // Pixel Art Character
        ctx.drawImage(playerImgRef.current, px, py, TILE_SIZE, TILE_SIZE);
      } else {
        // Fallback red rectangle
        ctx.fillStyle = '#ff3d00';
        ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      }
      ctx.shadowBlur = 0;

      // Lighting and Vignette Effect
      // Create a radial gradient at player position
      const gradient = ctx.createRadialGradient(
        px + TILE_SIZE / 2,
        py + TILE_SIZE / 2,
        50, // Inner radius (bright)
        px + TILE_SIZE / 2,
        py + TILE_SIZE / 2,
        400, // Outer radius (dark)
      );

      // Determine ambient darkness based on depth
      const depth = Math.max(0, visualPos.y - BASE_DEPTH);
      const darkness = Math.min(0.95, 0.3 + depth * 0.005); // Gets darker as you go deeper, cap at 0.95

      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Transparent at center
      gradient.addColorStop(0.3, `rgba(0, 0, 0, ${darkness * 0.5})`);
      gradient.addColorStop(1, `rgba(0, 0, 0, ${darkness})`);

      ctx.fillStyle = gradient;
      // Covering the entire visible world area with vignette
      ctx.fillRect(
        targetCameraX - 100,
        targetCameraY - viewportHeightInWorld / 2 - 100,
        viewportWidthInWorld + 200,
        viewportHeightInWorld + 200,
      );

      // --- Draw Particles ---
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life -= 0.05;
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // Gravity

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1.0;
      }

      // --- Draw Floating Texts ---
      ctx.textAlign = 'center';
      ctx.font = `900 ${Math.floor(20 * scale)}px sans-serif`;
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.life -= 0.015; // Slow fade
        if (ft.life <= 0) {
          floatingTextsRef.current.splice(i, 1);
          continue;
        }
        ft.y -= 1.0; // Float up

        ctx.globalAlpha = ft.life;
        ctx.fillStyle = ft.color;

        ctx.shadowBlur = 4;
        ctx.shadowColor = 'black';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.shadowBlur = 0;

        ctx.globalAlpha = 1.0;
      }
      ctx.textAlign = 'left'; // Reset alignment

      ctx.restore();

      // --- In-Game HUD (Screen Space) ---
      ctx.save();
      ctx.resetTransform();

      const hudX = 20;
      const hudY = 0;
      const hudW = 280;

      // HP Bar
      const currentHp = statsRef.current.hp;
      const maxHp = statsRef.current.maxHp;
      const hpW = Math.min(1, currentHp / maxHp) * (hudW - 60);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '900 18px sans-serif';
      ctx.fillText('HP', hudX, hudY + 25);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.roundRect(hudX, hudY + 32, hudW - 60, 16, 8);
      ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.roundRect(hudX, hudY + 32, Math.max(0, hpW), 16, 8);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = '900 16px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(
        `${Math.floor(currentHp)}/${maxHp}`,
        hudX + hudW - 60,
        hudY + 25,
      );

      // Depth
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '900 18px sans-serif';
      ctx.fillText('DEPTH', hudX, hudY + 70);
      ctx.fillStyle = '#fff';
      ctx.font = '900 32px monospace';
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'black';
      ctx.fillText(
        `${Math.max(0, Math.floor(playerPosRef.current.y - BASE_DEPTH))}m`,
        hudX,
        hudY + 105,
      );

      // 60 FPS pinned to top right
      ctx.shadowBlur = 0;
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(234, 179, 8, 0.5)';
      ctx.font = '900 12px monospace';
      ctx.fillText('60 FPS', canvas.width - 20, 30);
      ctx.textAlign = 'left';

      // Interaction Prompt
      if (
        showInteractionPrompt &&
        !isShopOpen &&
        !isInventoryOpen &&
        !isSettingsOpen
      ) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'black';
        ctx.fillText(
          'PRESS [SPACE] TO TALK TO MERCHANT',
          canvas.width / 2,
          canvas.height - 40,
        );
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
      }
      ctx.restore();

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isClient, updateLogic, windowSize]);

  const handleUpgrade = (type: string, requirements: any) => {
    const stats = statsRef.current;

    // Check requirements (money and minerals)
    if (stats.inventory.dirt < (requirements.dirt || 0)) return;
    if (stats.inventory.stone < (requirements.stone || 0)) return;
    if (stats.inventory.coal < (requirements.coal || 0)) return;
    if (stats.inventory.iron < (requirements.iron || 0)) return;
    if (stats.inventory.gold < (requirements.gold || 0)) return;
    if (stats.inventory.diamond < (requirements.diamond || 0)) return;

    // Special case for goldCoins requirement (e.g. upgrades)
    if (requirements.goldCoins && stats.goldCoins < requirements.goldCoins)
      return;

    // Deduct requirements
    if (requirements.dirt) stats.inventory.dirt -= requirements.dirt;
    if (requirements.stone) stats.inventory.stone -= requirements.stone;
    if (requirements.coal) stats.inventory.coal -= requirements.coal;
    if (requirements.iron) stats.inventory.iron -= requirements.iron;
    if (requirements.gold) stats.inventory.gold -= requirements.gold;
    if (requirements.diamond) stats.inventory.diamond -= requirements.diamond;
    if (requirements.goldCoins) stats.goldCoins -= requirements.goldCoins;

    // Apply upgrade effect
    if (type === 'attackPower') {
      stats.attackPower += 20;
    } else if (type === 'maxHp') {
      stats.maxHp += 50;
      stats.hp = Math.min(stats.maxHp, stats.hp + 50); // Small heal on upgrade
    } else if (type === 'drillPower') {
      // stats.drillPower += 5; // Deprecated
      console.warn('Drill Power upgrade is deprecated');
    }

    setUiStats({ ...stats });
    console.log(`Player Upgraded: ${type}`);
  };

  const handleSellResource = (
    resource: string,
    amount: number,
    price: number,
  ) => {
    const stats = statsRef.current;
    const currentAmount = (stats.inventory as any)[resource] || 0;
    if (currentAmount >= amount) {
      (stats.inventory as any)[resource] -= amount;
      stats.goldCoins += price;
      setUiStats({ ...stats });
      console.log(`Sold ${amount} ${resource} for ${price} Gold`);
    }
  };

  const handleCraft = (requirements: any, result: any) => {
    const stats = statsRef.current;

    // Check requirements
    if (stats.inventory.stone < (requirements.stone || 0)) return;
    if (stats.inventory.coal < (requirements.coal || 0)) return;
    if (stats.inventory.iron < (requirements.iron || 0)) return;
    if (stats.inventory.gold < (requirements.gold || 0)) return;
    if (stats.inventory.diamond < (requirements.diamond || 0)) return;

    // Deduct requirements
    if (requirements.stone) stats.inventory.stone -= requirements.stone;
    if (requirements.coal) stats.inventory.coal -= requirements.coal;
    if (requirements.iron) stats.inventory.iron -= requirements.iron;
    if (requirements.gold) stats.inventory.gold -= requirements.gold;
    if (requirements.diamond) stats.inventory.diamond -= requirements.diamond;

    // Apply result
    if (result.drillId) {
      if (!stats.ownedDrillIds.includes(result.drillId)) {
        stats.ownedDrillIds.push(result.drillId);
        // Auto-equip if better? No, let user equip.
      }
    }

    setUiStats({ ...stats });
    console.log(`Equipped Crafted Gear: ${result.drillName}`);
  };

  const handleEquip = (drillId: string) => {
    const stats = statsRef.current;
    if (stats.ownedDrillIds.includes(drillId)) {
      stats.equippedDrillId = drillId;
      setUiStats({ ...stats });
      console.log(`Equipped Drill: ${drillId}`);
    }
  };

  if (!isClient)
    return (
      <div className="text-white text-2xl font-mono p-20">LOADING DRILL...</div>
    );

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          width={windowSize.width}
          height={windowSize.height}
          className="w-full h-full block cursor-none"
        />
        {isShopOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-backdrop bg-black/90 backdrop-blur-3xl">
            <div className="w-full max-w-6xl h-[90%] animate-modal relative overflow-hidden rounded-[2.5rem]">
              <Shop
                stats={uiStats}
                onUpgrade={handleUpgrade}
                onCraft={handleCraft}
                onSell={handleSellResource}
                availableQuests={availableQuestsRef.current}
                onClose={() => setIsShopOpen(false)}
                onAcceptQuest={(id) => {
                  const q = availableQuestsRef.current.find(
                    (qa) => qa.id === id,
                  );
                  if (
                    q &&
                    !statsRef.current.activeQuests.find((aq) => aq.id === id)
                  ) {
                    const newQuest = { ...q, status: 'active' as const };
                    statsRef.current.activeQuests.push(newQuest);
                    setUiStats({ ...statsRef.current });
                  }
                }}
                onCompleteQuest={(id) => {
                  const qIndex = statsRef.current.activeQuests.findIndex(
                    (aq) => aq.id === id,
                  );
                  if (qIndex !== -1) {
                    const q = statsRef.current.activeQuests[qIndex];
                    if (q.requirement.current >= q.requirement.target) {
                      statsRef.current.completedQuestIds.push(id);
                      statsRef.current.activeQuests.splice(qIndex, 1);
                      setUiStats({ ...statsRef.current });
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {isStatusOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-backdrop bg-black/90 backdrop-blur-3xl">
            <div className="w-full max-w-5xl h-[85%] animate-modal relative overflow-hidden rounded-[2.5rem]">
              <StatusWindow
                stats={uiStats}
                onClose={() => setIsStatusOpen(false)}
              />
            </div>
          </div>
        )}

        {isInventoryOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-backdrop bg-black/90 backdrop-blur-3xl">
            <div className="w-full max-w-6xl h-[85%] animate-modal relative overflow-hidden rounded-[2.5rem]">
              <Inventory
                stats={uiStats}
                onEquip={handleEquip}
                onClose={() => setIsInventoryOpen(false)}
              />
            </div>
          </div>
        )}

        {isCraftingOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-backdrop bg-black/90 backdrop-blur-3xl">
            <div className="w-full max-w-7xl h-[85%] animate-modal relative overflow-hidden rounded-[3rem]">
              <Crafting
                stats={uiStats}
                onCraft={handleCraft}
                onClose={() => setIsCraftingOpen(false)}
              />
            </div>
          </div>
        )}

        {isSettingsOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-backdrop bg-black/95 backdrop-blur-3xl">
            <div className="w-full max-w-2xl animate-modal relative overflow-hidden rounded-3xl">
              <Settings
                onClose={() => setIsSettingsOpen(false)}
                onReset={() => {
                  localStorage.removeItem('drilling-game-save');
                  window.location.reload();
                }}
              />
            </div>
          </div>
        )}

        {/* Elevator Modal Overlay */}
        {isElevatorOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-backdrop bg-black/90 backdrop-blur-3xl">
            <div className="bg-[#1a1a1b] w-full max-w-md rounded-3xl border-l-[6px] border-[#eab308] relative flex flex-col p-10 animate-modal overflow-hidden shadow-2xl text-[#d1d5db]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-[#eab308] uppercase tracking-tighter flex items-center gap-3">
                  <span>🛗</span> ELEVATOR
                </h2>
                <button
                  onClick={() => setIsElevatorOpen(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#eab308] text-black hover:brightness-110 transition-all active:scale-90 shadow-xl"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    playerPosRef.current = {
                      x: Math.floor(MAP_WIDTH / 2) - 1,
                      y: 8,
                    };
                    visualPosRef.current = { ...playerPosRef.current };
                    statsRef.current.depth = 0;
                    setIsElevatorOpen(false);
                  }}
                  className="w-full p-6 rounded-2xl bg-[#252526] border border-zinc-800 text-white hover:border-[#eab308] transition-all font-black flex justify-between items-center group shadow-lg"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[#eab308] text-[9px] uppercase tracking-widest mb-1 group-hover:brightness-125">
                      SURFACE
                    </span>
                    <span className="text-xl">BASE CAMP</span>
                  </div>
                  <span className="bg-zinc-900 px-4 py-1.5 rounded-full text-xs font-mono text-[#eab308]">
                    0m
                  </span>
                </button>

                {Array.from(
                  { length: Math.floor(uiStats.maxDepthReached / 100) },
                  (_, i) => (i + 1) * 100,
                ).map((depth) => (
                  <button
                    key={depth}
                    onClick={() => {
                      playerPosRef.current = {
                        x: Math.floor(MAP_WIDTH / 2) - 1,
                        y: depth + BASE_DEPTH,
                      };
                      visualPosRef.current = { ...playerPosRef.current };
                      statsRef.current.depth = depth;
                      setIsElevatorOpen(false);
                    }}
                    className="w-full p-6 rounded-2xl bg-[#252526] border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#eab308] transition-all font-black flex justify-between items-center group shadow-lg"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-zinc-600 text-[9px] uppercase tracking-widest mb-1">
                        CHECKPOINT
                      </span>
                      <span className="text-xl">OUTPOST_{depth}</span>
                    </div>
                    <span className="bg-zinc-900 px-4 py-1.5 rounded-full text-xs font-mono">
                      {depth}m
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-[#252526] px-3 py-1 rounded-lg border border-zinc-700 text-[#eab308] font-black text-[10px] uppercase tracking-widest shadow-inner mx-1">
      {children}
    </span>
  );
}

function getTileIndex(type: string): number {
  switch (type) {
    case 'dirt':
      return 0; // Variations 0, 1, 2 handled in render loop
    case 'stone':
      return 3; // Variations 3, 4 handled in render loop
    case 'coal':
      return 5;
    case 'iron':
      return 6;
    case 'gold':
      return 7;
    case 'diamond':
      return 8;
    case 'wall':
      return 9;
    case 'emerald':
      return 20;
    case 'ruby':
      return 21;
    case 'sapphire':
      return 22;
    case 'uranium':
      return 23;
    case 'obsidian':
      return 24;
    case 'lava':
      return 25;
    case 'dungeon_bricks':
      return 30;
    case 'monster_nest':
      return 31;
    case 'boss_core':
      return 32;
    default:
      return 0;
  }
}

function getTileColor(type: string): string {
  switch (type) {
    case 'dirt':
      return '#4e342e';
    case 'stone':
      return '#455a64';
    case 'coal':
      return '#212121';
    case 'iron':
      return '#78909c';
    case 'gold':
      return '#fbc02d';
    case 'diamond':
      return '#00bcd4';
    case 'emerald':
      return '#10b981';
    case 'ruby':
      return '#ef4444';
    case 'sapphire':
      return '#3b82f6';
    case 'uranium':
      return '#84cc16';
    case 'obsidian':
      return '#581c87';
    case 'lava':
      return '#f97316';
    case 'dungeon_bricks':
      return '#374151';
    case 'monster_nest':
      return '#b91c1c';
    case 'boss_core':
      return '#7c3aed';
    case 'wall':
      return '#1a1a1b';
    default:
      return '#000000';
  }
}
