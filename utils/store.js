import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const USER_KEY = '@user';
const TX_KEY = '@transactions';
const GOAL_KEY = '@goals';
const BILL_KEY = '@bills';

export const useStore = create((set, get) => ({
  user: null,
  transactions: [],
  goals: [],
  bills: [],

  loadAll: async () => {
    try {
      const [user, txs, goals, bills] = await Promise.all([
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(TX_KEY),
        AsyncStorage.getItem(GOAL_KEY),
        AsyncStorage.getItem(BILL_KEY),
      ]);
      let parsedUser = user ? JSON.parse(user) : null;
      if (parsedUser) {
        const today = new Date().toDateString();
        if (parsedUser.lastLoginDate !== today) {
          parsedUser.streakDays = (parsedUser.lastLoginDate === new Date(Date.now() - 86400000).toDateString())
            ? (parsedUser.streakDays || 0) + 1
            : 1;
          parsedUser.lastLoginDate = today;
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(parsedUser));
        }
      }
      set({
        user: parsedUser,
        transactions: txs ? JSON.parse(txs) : [],
        goals: goals ? JSON.parse(goals) : [],
        bills: bills ? JSON.parse(bills) : [],
      });
    } catch (e) {
      console.error('Load error:', e);
    }
  },

  setUser: (user) => {
    const updatedUser = { ...user, lastLoginDate: new Date().toDateString(), streakDays: user.streakDays || 1 };
    set({ user: updatedUser });
    AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  },

  updateUser: async (updates) => {
    const { user } = get();
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    set({ user: updatedUser });
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  },

  addTransaction: async (tx) => {
    const { transactions, user } = get();
    if (!user) return;

    const newTx = {
      _id: uuidv4(),
      user_id: user._id || uuidv4(),
      date: new Date().toISOString(),
      ...tx,
    };

    const newTxs = [newTx, ...transactions];
    set({ transactions: newTxs });
    await AsyncStorage.setItem(TX_KEY, JSON.stringify(newTxs));

    const balanceChange = tx.type === 'income' ? tx.amount : -tx.amount;
    const newBalance = (user.balance || 0) + balanceChange;
    await get().updateUser({ balance: newBalance });
  },

  deleteTransaction: async (id) => {
    const { transactions, user } = get();
    if (!user) return;

    const tx = transactions.find((t) => t._id === id);
    if (!tx) return;

    const newTxs = transactions.filter((t) => t._id !== id);
    set({ transactions: newTxs });
    await AsyncStorage.setItem(TX_KEY, JSON.stringify(newTxs));

    const balanceChange = tx.type === 'income' ? -tx.amount : tx.amount;
    const newBalance = (user.balance || 0) + balanceChange;
    await get().updateUser({ balance: newBalance });
  },

  addGoal: async (goal) => {
    const { goals, user } = get();
    if (!user) return;

    const newGoal = {
      _id: uuidv4(),
      user_id: user._id || uuidv4(),
      currentAmount: 0,
      createdAt: new Date().toISOString(),
      ...goal,
    };

    const newGoals = [newGoal, ...goals];
    set({ goals: newGoals });
    await AsyncStorage.setItem(GOAL_KEY, JSON.stringify(newGoals));
  },

  updateGoal: async (id, updates) => {
    const { goals } = get();
    const goal = goals.find(g => g._id === id);
    if (!goal) return;

    const updatedGoal = { ...goal, ...updates };
    const newGoals = goals.map(g => g._id === id ? updatedGoal : g);
    set({ goals: newGoals });
    await AsyncStorage.setItem(GOAL_KEY, JSON.stringify(newGoals));
  },

  addBill: async (bill) => {
    const { bills, user } = get();
    if (!user) return;

    const newBill = {
      _id: uuidv4(),
      user_id: user._id || uuidv4(),
      isPaid: false,
      createdAt: new Date().toISOString(),
      ...bill,
    };

    const newBills = [newBill, ...bills];
    set({ bills: newBills });
    await AsyncStorage.setItem(BILL_KEY, JSON.stringify(newBills));
  },

  payBill: async (id, createTransaction = true) => {
    const { bills, addTransaction } = get();
    const bill = bills.find(b => b._id === id);
    if (!bill) return;

    const updatedBill = { ...bill, isPaid: true, paidDate: new Date().toISOString() };
    const newBills = bills.map(b => b._id === id ? updatedBill : b);
    set({ bills: newBills });
    await AsyncStorage.setItem(BILL_KEY, JSON.stringify(newBills));

    if (createTransaction) {
      await addTransaction({
        type: 'expense',
        amount: bill.amount,
        category: bill.category || 'Bills',
        note: `Paid bill: ${bill.name}`,
      });
    }
  },

  deleteBill: async (id) => {
    const { bills } = get();
    const newBills = bills.filter(b => b._id !== id);
    set({ bills: newBills });
    await AsyncStorage.setItem(BILL_KEY, JSON.stringify(newBills));
  },

  getUpcomingBills: () => {
    const { bills } = get();
    if (!Array.isArray(bills)) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const allInstances = [];
    bills.forEach(bill => {
      const initialDueDate = new Date(bill.dueDate);
      initialDueDate.setHours(0, 0, 0, 0);

      // Add initial due date instance
      if (!bill.isPaid && initialDueDate >= today && initialDueDate <= sevenDaysLater) {
        allInstances.push({ ...bill, instanceDueDate: initialDueDate });
      }

      // Handle recurring bills
      if (bill.isRecurring) {
        let nextDueDate = new Date(initialDueDate);
        while (nextDueDate <= sevenDaysLater) {
          if (!bill.isPaid && nextDueDate >= today && nextDueDate > initialDueDate) {
            allInstances.push({ ...bill, instanceDueDate: new Date(nextDueDate) });
          }
          // Increment based on frequency
          switch (bill.frequency) {
            case 'weekly':
              nextDueDate.setDate(nextDueDate.getDate() + 7);
              break;
            case 'monthly':
              nextDueDate.setMonth(nextDueDate.getMonth() + 1);
              break;
            case 'yearly':
              nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
              break;
            case 'one-time':
            default:
              break; // No further instances for one-time
          }
        }
      }
    });

    return allInstances.sort((a, b) => a.instanceDueDate - b.instanceDueDate);
  },

  getOverdueBills: () => {
    const { bills } = get();
    if (!Array.isArray(bills)) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allInstances = [];
    bills.forEach(bill => {
      const initialDueDate = new Date(bill.dueDate);
      initialDueDate.setHours(0, 0, 0, 0);

      // Add initial due date instance
      if (!bill.isPaid && initialDueDate < today) {
        allInstances.push({ ...bill, instanceDueDate: initialDueDate });
      }

      // Handle recurring bills
      if (bill.isRecurring) {
        let nextDueDate = new Date(initialDueDate);
        while (nextDueDate < today) {
          if (!bill.isPaid && nextDueDate < today) {
            allInstances.push({ ...bill, instanceDueDate: new Date(nextDueDate) });
          }
          // Increment based on frequency
          switch (bill.frequency) {
            case 'weekly':
              nextDueDate.setDate(nextDueDate.getDate() + 7);
              break;
            case 'monthly':
              nextDueDate.setMonth(nextDueDate.getMonth() + 1);
              break;
            case 'yearly':
              nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
              break;
            case 'one-time':
            default:
              break; // No further instances for one-time
          }
        }
      }
    });

    return allInstances.sort((a, b) => a.instanceDueDate - b.instanceDueDate);
  },

  logout: () => {
    set({
      user: null,
      transactions: [],
      goals: [],
      bills: [],
    });
    AsyncStorage.multiRemove([USER_KEY, TX_KEY, GOAL_KEY, BILL_KEY]);
  },
}));