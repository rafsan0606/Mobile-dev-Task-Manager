import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const WeeklyCalendar = ({ selectedDate, onDateSelect }) => {
  const today = new Date();
  const baseDate = selectedDate || today;
  const currentDay = baseDate.getDate();
  const currentMonth = baseDate.getMonth();
  const currentYear = baseDate.getFullYear();

  const getDaysArray = () => {
    const days = [];
    for (let i = -2; i <= 4; i++) {
      const date = new Date(currentYear, currentMonth, currentDay + i);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push({
        date: date.getDate(),
        dayName: DAYS[date.getDay()],
        fullDate: date,
        isToday,
        isSelected,
        isPast: date < today && !isToday,
        isFuture: date > today && !isToday,
      });
    }
    return days;
  };

  const days = getDaysArray();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dayContainer}
            onPress={() => onDateSelect && onDateSelect(day.fullDate)}
          >
            <Text
              style={[
                styles.dayName,
                day.isSelected && styles.dayNameActive,
                day.isPast && !day.isSelected && styles.dayNamePast,
              ]}
            >
              {day.dayName}
            </Text>
            <View
              style={[
                styles.dateBox,
                day.isSelected && styles.dateBoxActive,
                day.isPast && !day.isSelected && styles.dateBoxPast,
                day.isFuture && !day.isSelected && styles.dateBoxFuture,
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  day.isSelected && styles.dateTextActive,
                  day.isPast && !day.isSelected && styles.dateTextPast,
                ]}
              >
                {day.date}
              </Text>
            </View>
            {day.isToday && !day.isSelected && <View style={styles.indicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  dayContainer: {
    alignItems: 'center',
    gap: 8,
  },
  dayName: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  dayNameActive: {
    color: COLORS.primary,
  },
  dayNamePast: {
    opacity: 0.5,
  },
  dateBox: {
    width: 36,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBoxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dateBoxPast: {
    opacity: 0.5,
  },
  dateBoxFuture: {
    backgroundColor: COLORS.surface,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.text,
  },
  dateTextActive: {
    fontWeight: '500',
    color: '#ffffff',
  },
  dateTextPast: {
    color: COLORS.textSecondary,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});

export default WeeklyCalendar;
