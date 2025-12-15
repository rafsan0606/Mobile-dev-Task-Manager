import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Checkbox } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const TaskItem = ({ task, onToggle, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        task.completed && styles.completedContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Checkbox
        status={task.completed ? 'checked' : 'unchecked'}
        onPress={() => onToggle(task.id)}
        color="#6366f1"
        uncheckedColor="#52525b"
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              task.completed && styles.completedTitle,
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
        </View>

        {task.description && (
          <Text
            style={styles.description}
            numberOfLines={1}
          >
            {task.description}
          </Text>
        )}

        <View style={styles.footer}>
          {task.time && (
            <View style={styles.timeContainer}>
              <MaterialCommunityIcons
                name={task.meetingType ? 'video' : 'clock-outline'}
                size={10}
                color="#a1a1aa"
              />
              <Text style={styles.timeText}>
                {task.meetingType || task.time}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  completedContainer: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    marginLeft: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#71717a',
  },
  description: {
    fontSize: 12,
    color: '#71717a',
    marginBottom: 8,
    fontWeight: '300',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    color: '#a1a1aa',
  },

});

export default TaskItem;
