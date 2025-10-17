import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

/**
 * Global store for PaisaPal
 * Handles:
 * - user info
 * - transactions (income/expense)
 * - goals
 */

export const useStore = create(
  persist(
    (set, get) => ({
      // --- USER ---
      user: {
        name: 'User',
        balance: 0,
        points: 0,
        streakDays: 0,
        referralCode: 'PAISA' + Math.floor(Math.random() * 10000),
        referrals: [],
      },

      updateUser: (updates) =>
        set((state) => ({
          user: { ...state.user, ...updates },
        })),

      // --- TRANSACTIONS ---
      transactions: [],

      addTransaction: (tx) =>
        set((state) => {
          const newTx = { id: nanoid(), ...tx };
          const updatedBalance =
            tx.type === 'income'
              ? state.user.balance + tx.amount
              : state.user.balance - tx.amount;

          return {
            transactions: [...state.transactions, newTx],
            user: { ...state.user, balance: updatedBalance },
          };
        }),

      deleteTransaction: (id) =>
        set((state) => {
          const tx = state.transactions.find((t) => t.id === id);
          if (!tx) return state;

          const updatedBalance =
            tx.type === 'income'
              ? state.user.balance - tx.amount
              : state.user.balance + tx.amount;

          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            user: { ...state.user, balance: updatedBalance },
          };
        }),

      // --- GOALS ---
      goals: [],

      addGoal: (goal) =>
        set((state) => ({
          goals: [
            ...state.goals,
            {
              id: nanoid(),
              name: goal.name,
              targetAmount: goal.targetAmount,
              currentAmount: 0,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updates } : goal
          ),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      // --- REWARDS / REFERRALS ---
      addReferral: (name) =>
        set((state) => ({
          user: {
            ...state.user,
            referrals: [...state.user.referrals, name],
            points: state.user.points + 50,
          },
        })),

      addPoints: (points) =>
        set((state) => ({
          user: {
            ...state.user,
            points: state.user.points + points,
          },
        })),

      // --- STREAK MANAGEMENT ---
      incrementStreak: () =>
        set((state) => ({
          user: {
            ...state.user,
            streakDays: state.user.streakDays + 1,
          },
        })),

      resetStreak: () =>
        set((state) => ({
          user: { ...state.user, streakDays: 0 },
        })),
    }),
    {
      name: 'paisapal-storage', // key for persistent storage
      version: 1,
    }
  )
);
