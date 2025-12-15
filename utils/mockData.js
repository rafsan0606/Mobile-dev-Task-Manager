const getTodayWithTime = (hours = 0, minutes = 0) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const getRelativeDate = (daysOffset = 0, hours = 0, minutes = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const MOCK_TASKS = [
  // High Priority Tasks
  {
    id: '1',
    title: 'Doctor Appointment',
    description: 'Annual checkup at City Medical Center.',
    priority: 'High',
    completed: false,
    time: '10:00 AM',
    date: getTodayWithTime(10, 0),
    createdAt: getTodayWithTime(8, 0),
  },
  {
    id: '2',
    title: 'Pick up Groceries',
    description: 'Get milk, eggs, bread, and vegetables from the store.',
    priority: 'High',
    completed: false,
    time: '11:30 AM',
    date: getTodayWithTime(11, 30),
    createdAt: getTodayWithTime(9, 0),
  },
  {
    id: '3',
    title: 'Pay Electricity Bill',
    description: 'Payment due today, pay online or at the office.',
    priority: 'High',
    completed: false,
    time: '2:00 PM',
    date: getTodayWithTime(14, 0),
    createdAt: getRelativeDate(-1, 16, 30),
  },

  // Medium Priority Tasks
  {
    id: '4',
    title: 'Laundry',
    description: 'Wash and fold clothes, bedsheets, and towels.',
    priority: 'Medium',
    completed: false,
    date: getTodayWithTime(0, 0),
    createdAt: getRelativeDate(-1, 14, 0),
  },
  {
    id: '5',
    title: 'Call Mom',
    description: 'Catch up and discuss weekend plans.',
    priority: 'Medium',
    completed: false,
    time: '3:30 PM',
    date: getTodayWithTime(15, 30),
    createdAt: getRelativeDate(-1, 11, 0),
  },
  {
    id: '6',
    title: 'Plan Weekend Trip',
    description: 'Research hotels and activities for the family vacation.',
    priority: 'Medium',
    completed: false,
    date: getRelativeDate(1, 0, 0),
    createdAt: getRelativeDate(-2, 10, 0),
  },

  // Low Priority Tasks
  {
    id: '7',
    title: 'Water Plants',
    description: 'Water all indoor and outdoor plants.',
    priority: 'Low',
    completed: true,
    date: getRelativeDate(-1, 0, 0),
    createdAt: getRelativeDate(-4, 9, 0),
  },
  {
    id: '8',
    title: 'Organize Closet',
    description: 'Sort through clothes and donate items not worn in a year.',
    priority: 'Low',
    completed: false,
    date: getRelativeDate(2, 0, 0),
    createdAt: getRelativeDate(-3, 15, 0),
  },
  {
    id: '9',
    title: 'Read Book',
    description: 'Finish the last 3 chapters of current novel.',
    priority: 'Low',
    completed: false,
    date: getRelativeDate(3, 0, 0),
    createdAt: getRelativeDate(-4, 12, 0),
  },
];

export const MOCK_USER = {
  name: 'Rafsan Ahmed',
  avatar: 'https://ui-avatars.com/api/?name=R+A&background=18181b&color=fff',
  stats: {
    tasksDone: 124,
    productivity: 85,
  },
  notifications: true,
};
