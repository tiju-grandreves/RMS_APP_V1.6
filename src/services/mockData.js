export const MOCK_ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin123',
};

export const MOCK_RECEPTIONIST_CREDENTIALS = {
  email: 'recept@gmail.com',
  password: 'recept123',
};

export const MOCK_ACCOUNTANT_CREDENTIALS = {
  email: 'accounts@gmail.com',
  password: 'accounts123',
};

export const MOCK_TOKEN = 'MOCK_TOKEN';
export const MOCK_RECEPTIONIST_TOKEN = 'MOCK_RECEPTIONIST_TOKEN';
export const MOCK_ACCOUNTANT_TOKEN = 'MOCK_ACCOUNTANT_TOKEN';

export const MOCK_USERS = [
  {
    id: 1,
    role: 1,
    fullName: 'Admin User',
    name: 'Admin User',
    email: MOCK_ADMIN_CREDENTIALS.email,
    emailaddressuser: MOCK_ADMIN_CREDENTIALS.email,
    accessToken: MOCK_TOKEN,
  },
  {
    id: 2,
    role: 3,
    fullName: 'Receptionist User',
    name: 'Receptionist User',
    email: MOCK_RECEPTIONIST_CREDENTIALS.email,
    emailaddressuser: MOCK_RECEPTIONIST_CREDENTIALS.email,
    accessToken: MOCK_RECEPTIONIST_TOKEN,
  },
  {
    id: 3,
    role: 4,
    fullName: 'Accountant User',
    name: 'Accountant User',
    email: MOCK_ACCOUNTANT_CREDENTIALS.email,
    emailaddressuser: MOCK_ACCOUNTANT_CREDENTIALS.email,
    accessToken: MOCK_ACCOUNTANT_TOKEN,
  },
];

export const MOCK_USER_DATA = MOCK_USERS[0];
export const MOCK_RECEPTIONIST_DATA = MOCK_USERS[1];
export const MOCK_ACCOUNTANT_DATA = MOCK_USERS[2];

export const isMockSession = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return (
      userData?.accessToken === MOCK_TOKEN ||
      userData?.accessToken === MOCK_RECEPTIONIST_TOKEN ||
      userData?.accessToken === MOCK_ACCOUNTANT_TOKEN
    );
  } catch {
    return false;
  }
};

export const MOCK_REQUESTS = [
  {
    id: 101,
    requestorId: 1,
    requestorName: 'Fatima Al Naqbi',
    requestorEmail: 'fatima.alnaqbi@example.com',
    requestorPhone: '0501234567',
    eventName: 'Annual Facilities Review',
    description: 'Quarterly walkthrough and review of facility readiness across all sites.',
    branding: '',
    venue: 'Main Conference Hall',
    startDate: '2026-06-25T09:00:00.000Z',
    endDate: '2026-06-25T12:00:00.000Z',
    startTime: '2026-06-25T09:00:00.000Z',
    endTime: '2026-06-25T12:00:00.000Z',
    status: 'Pending',
    eventModeId: 1,
    eventCategoryId: 1,
    eventTypeId: 1,
    attendees: 45,
  },
  {
    id: 102,
    requestorId: 2,
    requestorName: 'Omar Sharif',
    requestorEmail: 'omar.sharif@example.com',
    requestorPhone: '0507654321',
    eventName: 'Vendor Onboarding Session',
    description: 'Walkthrough for new vendors covering compliance and site access procedures.',
    branding: '',
    venue: 'Training Room B',
    startDate: '2026-06-28T10:00:00.000Z',
    endDate: '2026-06-28T13:00:00.000Z',
    startTime: '2026-06-28T10:00:00.000Z',
    endTime: '2026-06-28T13:00:00.000Z',
    status: 'Approved',
    eventModeId: 1,
    eventCategoryId: 2,
    eventTypeId: 2,
    attendees: 20,
    assignedManagerId: 5,
    assignedManagerName: 'Layla Hassan',
    assignedManagerEmail: 'layla.hassan@example.com',
    assignedManagerPhone: '0509998888',
  },
  {
    id: 103,
    requestorId: 3,
    requestorName: 'Noura Al Mazrouei',
    requestorEmail: 'noura.almazrouei@example.com',
    requestorPhone: '0502223333',
    eventName: 'Maintenance Schedule Briefing',
    description: 'Briefing for facility staff on the upcoming maintenance schedule and shutdown windows.',
    branding: '',
    venue: 'Virtual',
    startDate: '2026-07-02T08:30:00.000Z',
    endDate: '2026-07-02T09:30:00.000Z',
    startTime: '2026-07-02T08:30:00.000Z',
    endTime: '2026-07-02T09:30:00.000Z',
    status: 'Rejected',
    eventModeId: 2,
    eventCategoryId: 1,
    eventTypeId: 1,
    attendees: 12,
    rejectionReason: 'Conflicts with another scheduled maintenance window.',
  },
];

export const MOCK_EVENT_MANAGER_REQUESTS = [
  {
    id: 201,
    eventId: 201,
    eventName: 'Townhall Setup Request',
    eventType: 'Conference',
    eventTypeId: 1,
    description: 'Set up the auditorium for the quarterly townhall meeting.',
    venue: 'Auditorium A',
    startDate: '2026-06-26T09:00:00.000Z',
    startTime: '2026-06-26T09:00:00.000Z',
    endDate: '2026-06-26T11:00:00.000Z',
    endTime: '2026-06-26T11:00:00.000Z',
    attendees: 150,
    branding: '',
    requestorId: 4,
    requestorName: 'Khalid Rahman',
    requestorEmail: 'khalid.rahman@example.com',
    requestorPhone: '0504445555',
    assignedManagers: [],
    status: 'Approved',
    assignedManagerId: null,
    eventStatusId: 1,
    eventCategoryId: 2,
    eventModeId: 1,
    speakers: [],
    speakerRequests: [],
  },
  {
    id: 202,
    eventId: 202,
    eventName: 'Client Demo Day',
    eventType: 'Workshop',
    eventTypeId: 2,
    description: 'Demo day for prospective clients showcasing the new facility wing.',
    venue: 'Demo Lab',
    startDate: '2026-07-01T13:00:00.000Z',
    startTime: '2026-07-01T13:00:00.000Z',
    endDate: '2026-07-01T16:00:00.000Z',
    endTime: '2026-07-01T16:00:00.000Z',
    attendees: 30,
    branding: '',
    requestorId: 5,
    requestorName: 'Sara Idris',
    requestorEmail: 'sara.idris@example.com',
    requestorPhone: '0506667777',
    assignedManagers: [],
    status: 'Approved',
    assignedManagerId: null,
    eventStatusId: 1,
    eventCategoryId: 3,
    eventModeId: 3,
    speakers: [],
    speakerRequests: [],
  },
];
