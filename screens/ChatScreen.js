import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useStore } from '../utils/store';
import { getMonthlyData, getCategoryTotals, formatCurrency } from '../utils/helpers';

export default function ChatScreen() {
  const { user, transactions } = useStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    const monthlyTx = getMonthlyData(transactions);
    const categoryTotals = getCategoryTotals(monthlyTx);
    const totalExpense = monthlyTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const totalIncome = monthlyTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);

    const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];

    let welcomeMessage = `Hey ${user.name}! 👋\n\nI'm your AI financial assistant. Quick snapshot:\n\n💰 Balance: ${formatCurrency(user.balance || 0)}\n📊 This Month: ${formatCurrency(totalIncome)} income, ${formatCurrency(totalExpense)} expenses\n🔥 Streak: ${user.streakDays || 0} days`;

    if (topCategory) {
      welcomeMessage += `\n💡 Top spending: ${topCategory[0]} (${formatCurrency(topCategory[1])})`;
    }

    welcomeMessage += `\n\nAsk me anything! (Local demo mode)`;

    setMessages([{ id: '1', type: 'bot', text: welcomeMessage, timestamp: new Date() }]);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { id: Date.now().toString(), type: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    scrollViewRef.current?.scrollToEnd({ animated: true });

    // Dummy response (local mode)
    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: `Great question! Based on your balance of ₹${user.balance || 0}, try saving ₹500 this month! 💡`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setLoading(false);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 1000);
  };

  const quickQuestions = [
    { text: "How am I doing?", icon: "📊" },
    { text: "Savings tips", icon: "💡" },
    { text: "Analyze spending", icon: "🔍" },
    { text: "Compare months", icon: "📈" },
  ];

  const handleQuick = (text) => setInput(text);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90} style={{ flex: 1 }}>
        <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {messages.map(msg => (
            <View key={msg.id} style={[styles.messageBubble, msg.type === 'user' ? styles.userBubble : styles.botBubble]}>
              {msg.type === 'bot' && <Text style={styles.botIcon}>🤖</Text>}
              <View style={styles.messageContent}>
                <Text style={[styles.messageText, msg.type === 'user' ? styles.userText : styles.botText]}>{msg.text}</Text>
                <Text style={[styles.timestamp, msg.type === 'user' && { color: '#fff' }]}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}
          {loading && (
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}
          {messages.length === 1 && !loading && (
            <View style={styles.quickContainer}>
              <Text style={styles.quickTitle}>Quick Questions:</Text>
              <View style={styles.quickRow}>
                {quickQuestions.map(q => (
                  <TouchableOpacity key={q.text} style={styles.quickBtn} onPress={() => handleQuick(q.text)}>
                    <Text style={styles.quickText}>{q.icon} {q.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Ask about finances..." placeholderTextColor={COLORS.textLight} multiline maxLength={500} />
          <TouchableOpacity style={[styles.sendButton, (!input.trim() || loading) && styles.sendDisabled]} onPress={handleSend} disabled={!input.trim() || loading}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 24 },
  messageBubble: { maxWidth: '80%', padding: 16, borderRadius: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.card, borderBottomLeftRadius: 4 },
  botIcon: { fontSize: 24, marginRight: 12 },
  messageContent: { flex: 1 },
  messageText: { fontSize: 16, lineHeight: 24 },
  userText: { color: '#fff' },
  botText: { color: COLORS.text },
  timestamp: { fontSize: 11, marginTop: 8, opacity: 0.7, color: COLORS.textLight },
  loadingBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 16, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12 },
  loadingText: { marginLeft: 12, color: COLORS.text, fontSize: 15 },
  quickContainer: { marginTop: 20, padding: 16, backgroundColor: COLORS.card, borderRadius: 12 },
  quickTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap' },
  quickBtn: { backgroundColor: COLORS.primary + '20', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  quickText: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, backgroundColor: COLORS.background, borderRadius: 24, padding: 12, fontSize: 16, color: COLORS.text, maxHeight: 120, marginRight: 12, borderWidth: 1, borderColor: COLORS.border },
  sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  sendDisabled: { backgroundColor: COLORS.textLight },
  sendText: { color: '#fff', fontSize: 24 },
});