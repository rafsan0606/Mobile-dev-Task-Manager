import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Switch } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTaskStore } from '../store/taskStore';
import { scheduleTaskNotification } from '../utils/notifications';
import { COLORS } from '../constants/colors';

const AddTaskModal = ({ visible, onClose, initialDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [taskDate, setTaskDate] = useState(initialDate || new Date());
  const [taskTime, setTaskTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const addTask = useTaskStore(state => state.addTask);

  React.useEffect(() => {
    if (initialDate) {
      setTaskDate(initialDate);
    }
  }, [initialDate]);

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return;

    const priorityColors = {
      High: '#f43f5e',
      Medium: '#f59e0b',
      Low: '#10b981',
    };

    const newTask = {
      title: title.trim(),
      description: description.trim(),
      priority,
      date: taskDate,
      time: taskTime,
      tag: priority === 'High' ? 'Urgent' : 'Task',
      tagColor: priorityColors[priority],
      reminderEnabled,
    };

    try {
      const createdTask = await addTask(newTask);

      if (reminderEnabled && createdTask.time) {
        const notificationId = await scheduleTaskNotification(createdTask);
        if (notificationId) {
          await useTaskStore.getState().updateTask(createdTask.id, { notificationId });
        }
      }

      setTitle('');
      setDescription('');
      setPriority('Medium');
      setTaskDate(initialDate || new Date());
      setTaskTime('');
      setReminderEnabled(false);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >

            <View style={styles.header}>
              <Text style={styles.headerTitle}>New Task</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                style={styles.titleInput}
                placeholder="Enter Task Name"
                placeholderTextColor="#52525b"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />

              <TextInput
                style={styles.descriptionInput}
                placeholder="Description..."
                placeholderTextColor="#3f3f46"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
              />

              <View style={styles.properties}>
                <View style={styles.scheduleContainer}>
                  <Text style={styles.scheduleTitle}>Date: </Text>
                  <TouchableOpacity
                    style={styles.propertyButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <MaterialCommunityIcons
                      name="calendar"
                      size={14}
                      color="#71717a"
                    />
                    <Text style={styles.propertyText}>{formatDate(taskDate)}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.scheduleContainer}>
                  <Text style={styles.scheduleTitle}>Time: </Text>
                  <TouchableOpacity
                    style={styles.propertyButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={14}
                      color="#71717a"
                    />
                    <Text style={styles.propertyText}>{taskTime || 'No Time'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.priorityContainer}>
                  {['High', 'Medium', 'Low'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityButton,
                        priority === p && styles.priorityButtonActive,
                        priority === p && p === 'High' && { borderColor: '#f43f5e33' },
                        priority === p && p === 'Medium' && { borderColor: '#f59e0b33' },
                        priority === p && p === 'Low' && { borderColor: '#10b98133' },
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <MaterialCommunityIcons
                        name="flag"
                        size={14}
                        color={
                          priority === p
                            ? p === 'High'
                              ? '#f43f5e'
                              : p === 'Medium'
                              ? '#f59e0b'
                              : '#10b981'
                            : '#71717a'
                        }
                      />
                      <Text
                        style={[
                          styles.priorityText,
                          priority === p && {
                            color: p === 'High' ? '#f43f5e' : p === 'Medium' ? '#f59e0b' : '#10b981'
                          },
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.reminderContainer}>
                  <View style={styles.reminderLeft}>
                    <MaterialCommunityIcons
                      name="bell-outline"
                      size={16}
                      color={reminderEnabled ? COLORS.primary : '#71717a'}
                    />
                    <Text style={[styles.reminderText, reminderEnabled && { color: COLORS.primary }]}>
                      Set Reminder
                    </Text>
                  </View>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                    color={COLORS.primary}
                    disabled={!taskTime}
                  />
                </View>
                {!taskTime && reminderEnabled && (
                  <Text style={styles.reminderHint}>Please set a time to enable reminder</Text>
                )}

              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Button
                mode="contained"
                onPress={handleCreate}
                style={styles.createButton}
                labelStyle={styles.createButtonLabel}
                icon="arrow-up"
                disabled={!title.trim()}
              >
                Create Task
              </Button>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={taskDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') {
              setShowDatePicker(false);
            }
            if (event.type === 'set' && selectedDate) {
              setTaskDate(selectedDate);
              if (Platform.OS === 'ios') {
                setShowDatePicker(false);
              }
            } else if (event.type === 'dismissed') {
              setShowDatePicker(false);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={taskDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            if (Platform.OS === 'android') {
              setShowTimePicker(false);
            }
            if (event.type === 'set' && selectedTime) {
              const hours = selectedTime.getHours();
              const minutes = selectedTime.getMinutes();
              const period = hours >= 12 ? 'PM' : 'AM';
              const displayHours = hours % 12 || 12;
              const displayMinutes = minutes.toString().padStart(2, '0');
              setTaskTime(`${displayHours}:${displayMinutes} ${period}`);
              if (Platform.OS === 'ios') {
                setShowTimePicker(false);
              }
            } else if (event.type === 'dismissed') {
              setShowTimePicker(false);
            }
          }}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    minHeight: '95%',
    maxHeight: '99%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 16,
    flexGrow: 1,
    minHeight: '100%',
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e1e1e1',
  },
  descriptionInput: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    padding: 8,
    fontWeight: '400',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e1e1e1',
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  scheduleTitle: {
    paddingRight: 4,
    fontSize: 14
  },
  properties: {
    gap: 8,
  },
  propertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'flex-start',
  },
  propertyText: {
    fontSize: 12,
    color: COLORS.text,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priorityButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  priorityText: {
    fontSize: 12,
    color: COLORS.text,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  reminderHint: {
    fontSize: 11,
    color: '#f59e0b',
    marginTop: 4,
    marginLeft: 4,
  },
  footer: {
    paddingTop: 16,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
});

export default AddTaskModal;
