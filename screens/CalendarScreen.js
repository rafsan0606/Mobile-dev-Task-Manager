import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAB, Snackbar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AddTaskModal from '../components/AddTaskModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
import TaskItem from '../components/TaskItem';
import { useTaskStore } from '../store/taskStore';
import { COLORS } from '../constants/colors';

const CalendarScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { tasks, getTasksByDate, toggleTask } = useTaskStore();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const tasksForDate = getTasksByDate(selectedDate);

  const highPriorityTasks = tasksForDate.filter(t => t.priority === 'High' && !t.completed);
  const mediumPriorityTasks = tasksForDate.filter(t => t.priority === 'Medium' && !t.completed);
  const lowPriorityTasks = tasksForDate.filter(t => t.priority === 'Low' && !t.completed);
  const completedTasks = tasksForDate.filter(t => t.completed);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleToggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    await toggleTask(taskId);
    if (task && !task.completed) {
      setSnackbarMessage('✓ Task marked as complete!');
    } else {
      setSnackbarMessage('Task updated');
    }
    setSnackbarVisible(true);
  };

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setDetailsModalVisible(true);
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isSelected = date.toDateString() === selectedDate.toDateString();

      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: date,
        isSelected,
        hasEvent: false,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' });
  const year = currentMonth.getFullYear();

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.monthText}>{monthName}</Text>
          <Text style={styles.yearText}>{year}</Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={16}
            color="#52525b"
            style={{ marginLeft: 4 }}
          />
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth(-1)}
          >
            <MaterialCommunityIcons name="chevron-left" size={16} color="#a1a1aa" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth(1)}
          >
            <MaterialCommunityIcons name="chevron-right" size={16} color="#a1a1aa" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <View style={styles.weekdayRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <View key={index} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day.isSelected && styles.selectedDayCell,
                ]}
                onPress={() => day.isCurrentMonth && handleDateSelect(day.fullDate)}
              >
                <Text
                  style={[
                    styles.dayText,
                    !day.isCurrentMonth && styles.otherMonthDay,
                    day.isSelected && styles.selectedDayText,
                  ]}
                >
                  {day.date}
                </Text>
                {day.hasEvent && day.isCurrentMonth && (
                  <View
                    style={[
                      styles.eventDot,
                      day.isSelected && { backgroundColor: '#a5b4fc' },
                    ]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.scheduleSection}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>Tasks</Text>
            <Text style={styles.scheduleDate}>
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
            </Text>
          </View>

          {/* Tasks List */}
          {tasksForDate.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-blank" size={48} color="#3f3f46" />
              <Text style={styles.emptyStateText}>No tasks for this day</Text>
            </View>
          ) : (
            <>
              {highPriorityTasks.length > 0 && (
                <View style={styles.taskSection}>
                  <View style={styles.taskSectionHeader}>
                    <View style={[styles.priorityIndicator, { backgroundColor: '#f43f5e' }]} />
                    <Text style={styles.taskSectionTitle}>High Priority</Text>
                    <View style={styles.taskCount}>
                      <Text style={styles.taskCountText}>{highPriorityTasks.length}</Text>
                    </View>
                  </View>
                  {highPriorityTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onPress={() => handleTaskPress(task)}
                    />
                  ))}
                </View>
              )}

              {mediumPriorityTasks.length > 0 && (
                <View style={styles.taskSection}>
                  <View style={styles.taskSectionHeader}>
                    <View style={[styles.priorityIndicator, { backgroundColor: '#f59e0b' }]} />
                    <Text style={styles.taskSectionTitle}>Medium Priority</Text>
                    <View style={styles.taskCount}>
                      <Text style={styles.taskCountText}>{mediumPriorityTasks.length}</Text>
                    </View>
                  </View>
                  {mediumPriorityTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onPress={() => handleTaskPress(task)}
                    />
                  ))}
                </View>
              )}

              {lowPriorityTasks.length > 0 && (
                <View style={styles.taskSection}>
                  <View style={styles.taskSectionHeader}>
                    <View style={[styles.priorityIndicator, { backgroundColor: '#71717a' }]} />
                    <Text style={styles.taskSectionTitle}>Backlog</Text>
                    <View style={styles.taskCount}>
                      <Text style={styles.taskCountText}>{lowPriorityTasks.length}</Text>
                    </View>
                  </View>
                  {lowPriorityTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onPress={() => handleTaskPress(task)}
                    />
                  ))}
                </View>
              )}

              {completedTasks.length > 0 && (
                <View style={styles.taskSection}>
                  <View style={styles.taskSectionHeader}>
                    <View style={[styles.priorityIndicator, { backgroundColor: '#10b981' }]} />
                    <Text style={styles.taskSectionTitle}>Completed</Text>
                    <View style={styles.taskCount}>
                      <Text style={styles.taskCountText}>{completedTasks.length}</Text>
                    </View>
                  </View>
                  {completedTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggleTask}
                      onPress={() => handleTaskPress(task)}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        color="#ffffff"
        onPress={() => setModalVisible(true)}
      />

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        initialDate={selectedDate}
      />

      <TaskDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        task={selectedTask}
        onToggleTask={handleToggleTask}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    marginRight: 8,
  },
  snackbar: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  yearText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCell: {
    width: '10.5%',
    height: 40,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  selectedDayCell: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.text,
  },
  otherMonthDay: {
    color: COLORS.textTertiary,
  },
  selectedDayText: {
    fontWeight: '500',
    color: COLORS.primary,
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textSecondary,
  },
  scheduleSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    position: 'relative',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  scheduleDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  taskSection: {
    marginBottom: 24,
  },
  taskSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  priorityIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  taskSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  taskCount: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: COLORS.backgroundTertiary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
});

export default CalendarScreen;
