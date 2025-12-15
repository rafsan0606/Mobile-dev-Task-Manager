import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { Button, Switch } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { useTaskStore } from '../store/taskStore';
import { scheduleTaskNotification, cancelTaskNotification } from '../utils/notifications';

const TaskDetailsModal = ({ visible, onClose, task, onToggleTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedDate, setEditedDate] = useState(new Date());
  const [editedTime, setEditedTime] = useState('');
  const [editedReminderEnabled, setEditedReminderEnabled] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const updateTask = useTaskStore(state => state.updateTask);
  const deleteTask = useTaskStore(state => state.deleteTask);

  useEffect(() => {
    if (task) {
      setEditedTitle(task.title || '');
      setEditedDescription(task.description || '');
      setEditedDate(task.date ? new Date(task.date) : new Date());
      setEditedTime(task.time || '');
      setEditedReminderEnabled(task.reminderEnabled || false);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    try {
      if (task.notificationId) {
        await cancelTaskNotification(task.notificationId);
      }

      const updates = {
        title: editedTitle.trim(),
        description: editedDescription.trim(),
        date: editedDate,
        time: editedTime,
        reminderEnabled: editedReminderEnabled,
        notificationId: null,
      };

      if (editedReminderEnabled && editedTime) {
        const notificationId = await scheduleTaskNotification({
          ...task,
          ...updates,
        });
        if (notificationId) {
          updates.notificationId = notificationId;
        }
      }

      await updateTask(task.id, updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCancel = () => {
    setEditedTitle(task.title || '');
    setEditedDescription(task.description || '');
    setEditedDate(task.date ? new Date(task.date) : new Date());
    setEditedTime(task.time || '');
    setEditedReminderEnabled(task.reminderEnabled || false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      if (task.notificationId) {
        await cancelTaskNotification(task.notificationId);
      }

      await deleteTask(task.id);
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No date';
    const taskDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (taskDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (taskDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return taskDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: taskDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return '#f43f5e';
      case 'Medium':
        return '#f59e0b';
      case 'Low':
        return '#10b981';
      default:
        return '#71717a';
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
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >

          <View style={styles.header}>
            <Text style={styles.headerTitle}>{isEditing ? 'Edit Task' : 'Task Details'}</Text>
            <View style={styles.headerButtons}>
              {!isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                  <MaterialCommunityIcons name="pencil" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {isEditing ? (
              <TextInput
                style={styles.titleInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Task title"
                placeholderTextColor={COLORS.textTertiary}
              />
            ) : (
              <Text style={styles.title}>{task.title}</Text>
            )}

            <View style={styles.metaRow}>
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor: `${getPriorityColor(task.priority)}1A`,
                    borderColor: `${getPriorityColor(task.priority)}33`
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="flag"
                  size={14}
                  color={getPriorityColor(task.priority)}
                />
                <Text
                  style={[
                    styles.priorityText,
                    { color: getPriorityColor(task.priority) }
                  ]}
                >
                  {task.priority} Priority
                </Text>
              </View>

              {task.completed && (
                <View style={styles.completedBadge}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={14}
                    color="#10b981"
                  />
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Description</Text>
              {isEditing ? (
                <TextInput
                  style={styles.descriptionInput}
                  value={editedDescription}
                  onChangeText={setEditedDescription}
                  placeholder="Add description..."
                  placeholderTextColor={COLORS.textTertiary}
                  multiline
                  numberOfLines={3}
                />
              ) : task.description ? (
                <Text style={styles.description}>{task.description}</Text>
              ) : (
                <Text style={[styles.description, { fontStyle: 'italic', color: COLORS.textTertiary }]}>
                  No description provided
                </Text>
              )}
            </View>

            <View style={styles.detailsGrid}>
              <TouchableOpacity
                style={styles.detailItem}
                onPress={() => isEditing && setShowDatePicker(true)}
                disabled={!isEditing}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={18}
                  color={COLORS.textSecondary}
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{formatDate(isEditing ? editedDate : task.date)}</Text>
                </View>
                {isEditing && (
                  <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.detailItem}
                onPress={() => isEditing && setShowTimePicker(true)}
                disabled={!isEditing}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={18}
                  color={COLORS.textSecondary}
                />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>{(isEditing ? editedTime : task.time) || 'No time set'}</Text>
                </View>
                {isEditing && (
                  <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Reminder</Text>
              <View style={styles.reminderItem}>
                <View style={styles.reminderLeft}>
                  <MaterialCommunityIcons
                    name="bell-outline"
                    size={18}
                    color={isEditing ? (editedReminderEnabled ? COLORS.primary : COLORS.textSecondary) : (task.reminderEnabled ? COLORS.primary : COLORS.textSecondary)}
                  />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Set Reminder</Text>
                    <Text style={styles.detailValue}>
                      {isEditing ? (editedReminderEnabled ? 'Enabled' : 'Disabled') : (task.reminderEnabled ? 'Enabled' : 'Disabled')}
                    </Text>
                  </View>
                </View>
                {isEditing && (
                  <Switch
                    value={editedReminderEnabled}
                    onValueChange={setEditedReminderEnabled}
                    color={COLORS.primary}
                    disabled={!editedTime}
                  />
                )}
              </View>
              {isEditing && !editedTime && editedReminderEnabled && (
                <Text style={styles.reminderHint}>Please set a time to enable reminder</Text>
              )}
            </View>

            {task.tag && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Tags</Text>
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor: `${task.tagColor}1A`,
                      borderColor: `${task.tagColor}33`,
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { color: task.tagColor }]}>
                    {task.tag}
                  </Text>
                </View>
              </View>
            )}

            {task.assignees && task.assignees.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Assigned to</Text>
                <View style={styles.assigneeContainer}>
                  {task.assignees.map((assignee, index) => (
                    <View key={index} style={styles.assignee}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {assignee.name?.charAt(0) || '?'}
                        </Text>
                      </View>
                      <Text style={styles.assigneeName}>{assignee.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {isEditing ? (
              <>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.saveButton}
                  labelStyle={styles.saveButtonLabel}
                  icon="check"
                  disabled={!editedTitle.trim()}
                >
                  Save Changes
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={styles.closeButton}
                  labelStyle={styles.closeButtonLabel}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {!task.completed ? (
                  <Button
                    mode="contained"
                    onPress={() => {
                      onToggleTask(task.id);
                      onClose();
                    }}
                    style={styles.markDoneButton}
                    labelStyle={styles.markDoneButtonLabel}
                    icon="check-circle"
                  >
                    Mark as Done
                  </Button>
                ) : (
                  <Button
                    mode="outlined"
                    onPress={() => {
                      onToggleTask(task.id);
                      onClose();
                    }}
                    style={styles.reopenButton}
                    labelStyle={styles.reopenButtonLabel}
                    icon="reload"
                  >
                    Reopen Task
                  </Button>
                )}
                <Button
                  mode="outlined"
                  onPress={onClose}
                  style={styles.closeButton}
                  labelStyle={styles.closeButtonLabel}
                >
                  Close
                </Button>
                <Button
                  mode="text"
                  onPress={handleDelete}
                  style={styles.deleteButton}
                  labelStyle={styles.deleteButtonLabel}
                  icon="delete-outline"
                >
                  Delete
                </Button>
              </>
            )}
          </View>
        </Pressable>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={editedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') {
              setShowDatePicker(false);
            }
            if (event.type === 'set' && selectedDate) {
              setEditedDate(selectedDate);
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
          value={editedDate}
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
              setEditedTime(`${displayHours}:${displayMinutes} ${period}`);
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    padding: 4,
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 32,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.border,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#10b9811A',
    borderColor: '#10b98133',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10b981',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.text,
  },
  descriptionInput: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.text,
    padding: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  detailsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  reminderHint: {
    fontSize: 11,
    color: '#f59e0b',
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  assigneeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  assignee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  assigneeName: {
    fontSize: 14,
    color: COLORS.text,
  },
  footer: {
    paddingTop: 16,
    gap: 12,
  },
  markDoneButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
  },
  markDoneButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  reopenButton: {
    borderRadius: 12,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  reopenButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  deleteButton: {
    borderRadius: 12,
  },
  deleteButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },
  closeButton: {
    borderRadius: 12,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  closeButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  saveButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
});

export default TaskDetailsModal;
