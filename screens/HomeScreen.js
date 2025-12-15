import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAB, Snackbar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { useTaskStore } from '../store/taskStore';
import TaskItem from '../components/TaskItem';
import AddTaskModal from '../components/AddTaskModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
import WeeklyCalendar from '../components/WeeklyCalendar';

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const {
    tasks,
    loading,
    error,
    toggleTask,
    getCompletedTasksCount,
    getProductivity,
    searchTasks,
    getTasksByDate,
  } = useTaskStore();

  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });

  // Filter tasks by selected date
  const tasksForDate = getTasksByDate(selectedDate);

  // Sort tasks by creation time (most recent first)
  const sortedTasks = [...tasksForDate].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Filter tasks based on search
  const displayedTasks = searchQuery
    ? searchTasks(searchQuery).filter(task => {
        const taskDate = new Date(task.date);
        return taskDate.toDateString() === selectedDate.toDateString();
      })
    : sortedTasks;

  // Group tasks by priority
  const highPriorityTasks = displayedTasks.filter(t => t.priority === 'High' && !t.completed);
  const mediumPriorityTasks = displayedTasks.filter(t => t.priority === 'Medium' && !t.completed);
  const lowPriorityTasks = displayedTasks.filter(t => t.priority === 'Low' && !t.completed);
  const completedTasks = displayedTasks.filter(t => t.completed);

  // Calculate productivity based on tasks for selected date
  const totalTasksForDate = tasksForDate.length;
  const completedTasksForDate = tasksForDate.filter(t => t.completed).length;
  const productivity = totalTasksForDate === 0 ? 0 : Math.round((completedTasksForDate / totalTasksForDate) * 100);
  const completedCount = getCompletedTasksCount();

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

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - in a real app, sync with backend
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBarContainer}>
      {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>TM</Text>
            </View>
            <View>
              <Text style={styles.dayText}>{dayName}</Text>
              <Text style={styles.dateText}>{dateStr}</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={18}
            color="#71717a"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor="#52525b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Weekly Calendar */}
        <WeeklyCalendar
          selectedDate={selectedDate}
          onDateSelect={(date) => setSelectedDate(date)}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }
      >
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Daily Overview</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {completedTasksForDate}/{totalTasksForDate} Tasks
              </Text>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressCardContent}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Productivity</Text>
                <Text style={styles.progressValue}>{productivity}%</Text>
              </View>
              <View style={styles.progressIconContainer}>
                <MaterialCommunityIcons
                  name="trending-up"
                  size={16}
                  color="#a5b4fc"
                />
              </View>
            </View>
          </View>
        </View>

        {/* High Priority Tasks */}
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

        {/* Medium Priority Tasks */}
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

        {/* Completed Tasks */}
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

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        color="#ffffff"
        onPress={() => setModalVisible(true)}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        initialDate={selectedDate}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        visible={detailsModalVisible && selectedTask !== null}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onToggleTask={handleToggleTask}
      />

      {/* Snackbar */}
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
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  dayText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
  },
  searchContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
    padding: 12,
  },
  progressSection: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
  },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSecondary,
  },
  progressBadgeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  progressCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressInfo: {
    gap: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '500',
    color: COLORS.text,
  },
  progressIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskSection: {
    marginBottom: 24,
  },
  taskSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  priorityIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  taskSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
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
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#6366f1',
    borderRadius: 28,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  snackbar: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
});

export default HomeScreen;
