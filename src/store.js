import { create } from 'zustand';

export const useStore = create((set) => ({
  level: 1,
  playerHealth: 100,
  enemyHealth: 100,
  shadowEnergy: 0,
  gameOver: false,
  message: '',
  nextLevelReady: false,
  setHealth: (entity, amount) => set((state) => ({
    [entity]: Math.max(0, Math.min(100, state[entity] + amount))
  })),
  addShadowEnergy: (amount) => set((state) => ({
    shadowEnergy: Math.max(0, Math.min(100, state.shadowEnergy + amount))
  })),
  setGameOver: (status, msg, nextLevel = false) => set({ gameOver: status, message: msg, nextLevelReady: nextLevel }),
  resetGame: () => set({ playerHealth: 100, enemyHealth: 100, shadowEnergy: 0, gameOver: false, message: '', nextLevelReady: false }),
  advanceLevel: () => set((state) => ({
      level: state.level + 1,
      playerHealth: 100,
      enemyHealth: 100,
      shadowEnergy: 0,
      gameOver: false,
      message: '',
      nextLevelReady: false
  }))
}));
