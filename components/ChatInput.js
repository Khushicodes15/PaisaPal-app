import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Keyboard,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { parseExpenseInput, getSuggestions } from '../utils/gemini';
import { useStore } from '../utils/store';

export default function ChatInput({ onSubmit, placeholder }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addTransaction = useStore(state => state.addTransaction);

  const handleInputChange = (text) => {
    setInput(text);
    const newSuggestions = getSuggestions(text);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const parsed = parseExpenseInput(input);

    if (parsed.error) {
      Alert.alert('Error', parsed.error);
      return;
    }

    // Add transaction
    await addTransaction(parsed);

    // Notify parent if needed
    if (onSubmit) {
      onSubmit(parsed);
    }

    // Show success message
    const emoji = parsed.type === 'income' ? '💰' : '💸';
    const noteText = parsed.note ? `\nNote: ${parsed.note}` : '';

    Alert.alert(
      `${emoji} ${parsed.type === 'income' ? 'Income' : 'Expense'} Added!`,
      `Amount: ₹${parsed.amount}\nCategory: ${parsed.category}${noteText}`
    );

    setInput('');
    setSuggestions([]);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const handleSuggestionPress = (suggestion) => {
    if (suggestion.type === 'template') {
      setInput(suggestion.text);
    }
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(item)}
              >
                <Text style={styles.suggestionText}>
                  {item.icon ? `${item.icon} ` : ''}{item.text}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={handleInputChange}
          placeholder={placeholder || 'Try: "spent 200 on food"'}
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={200}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !input.trim() && styles.sendButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!input.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Examples */}
      <View style={styles.examplesContainer}>
        <Text style={styles.examplesTitle}>💡 Try saying:</Text>
        <Text style={styles.exampleText}>
          "spent 200 on food" • "paid 500 for bills" • "earned 5000 salary"
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionChip: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  suggestionText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textLight,
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  examplesContainer: {
    padding: 16,
    backgroundColor: COLORS.card,
  },
  examplesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 18,
  },
});
