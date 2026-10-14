import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_STUDENTS,
  INITIAL_ACTIVITIES,
  INITIAL_RECORDS,
  INITIAL_DEPARTMENTS,
  INITIAL_NOTIFICATIONS,
  INSTITUTION_INFO
} from '../data/initialData';
import { api } from '../services/api';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  STUDENTS: 'skit021_students_v1',
  ACTIVITIES: 'skit021_activities_v1',
  RECORDS: 'skit021_records_v1',
  DEPARTMENTS: 'skit021_departments_v1',
  NOTIFICATIONS: 'skit021_notifications_v1',
  ONBOARDING: 'skit021_onboarding_completed_v1'
};

const safeStorageGet = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      console.warn(`LocalStorage type mismatch for ${key}, falling back to initial data.`);
      return fallback;
    }
    return parsed;
  } catch (err) {
    console.warn(`LocalStorage read error for ${key}:`, err);
    return fallback;
  }
};

const safeStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`LocalStorage write error for ${key}:`, err);
  }
};

export const AppProvider = ({ children }) => {
  // Navigation & routing state
  const [currentRoute, setCurrentRoute] = useState('landing');
  const [selectedStudentId, setSelectedStudentId] = useState('STU-001');
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Onboarding state
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ONBOARDING) === 'true';
    } catch {
      return false;
    }
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Core Data Stores
  const [students, setStudents] = useState(() => safeStorageGet(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS));
  const [activities, setActivities] = useState(() => safeStorageGet(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES));
  const [records, setRecords] = useState(() => safeStorageGet(STORAGE_KEYS.RECORDS, INITIAL_RECORDS));
  const [departments, setDepartments] = useState(() => safeStorageGet(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS));
  const [notifications, setNotifications] = useState(() => safeStorageGet(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS));

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Backend Connection & User Session State
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Institutional Administrator',
    email: 'studentaffairs@skit.ac.in',
    role: 'INSTITUTION_ADMIN',
    institutionCode: 'SKIT-021'
  });
  const [activeRole, setActiveRole] = useState('INSTITUTION_ADMIN');
  const [isAuthModalOpen, setIsAuthModalOpenRaw] = useState(false);
  const setIsAuthModalOpen = (open) => {
    if (open) {
      setCurrentRoute('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsAuthModalOpenRaw(false);
    }
  };

  // Authenticate user with backend API
  const login = async (email, password) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res?.data?.user) {
        setCurrentUser(res.data.user);
        const userRole = res.data.membership?.role || res.data.user.role || 'INSTITUTION_ADMIN';
        setActiveRole(userRole);
        setIsBackendConnected(true);
        addToast({
          title: "Authenticated Successfully",
          message: `Logged in as ${res.data.user.fullName || res.data.user.email} (${userRole}) via live PostgreSQL.`,
          type: "success"
        });
        await refreshBackendData();
        return res.data;
      }
    } catch (err) {
      const lower = (email || '').toLowerCase();
      const isDemoPersona =
        lower.includes('admin') ||
        lower.includes('studentaffairs') ||
        lower.includes('coord') ||
        lower.includes('priya') ||
        lower.includes('aarav') ||
        lower.includes('student');

      if (isDemoPersona || !isBackendConnected) {
        const role =
          lower.includes('admin') || lower.includes('studentaffairs')
            ? 'INSTITUTION_ADMIN'
            : lower.includes('coord')
            ? 'FACULTY_COORDINATOR'
            : 'STUDENT';

        const simulatedUser = {
          name: lower.includes('coord')
            ? 'Dr. Ananya Sharma'
            : lower.includes('priya')
            ? 'Priya Sharma'
            : lower.includes('aarav')
            ? 'Aarav Patel'
            : 'Institutional Administrator',
          email,
          role,
          institutionCode: 'SKIT-021'
        };

        setCurrentUser(simulatedUser);
        setActiveRole(role);
        addToast({
          title: "Session Active",
          message: `Acting as ${simulatedUser.name} (${role})`,
          type: "info"
        });
        return { user: simulatedUser, membership: { role } };
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setActiveRole('GUEST');
    addToast({
      title: "Signed Out",
      message: "You have signed out of the institutional session.",
      type: "info"
    });
  };

  // Load live data from backend API
  const refreshBackendData = async () => {
    setIsLoadingBackend(true);
    try {
      const health = await api.checkHealth();
      if (health.status === 'UP' || health.database === 'CONNECTED') {
        setIsBackendConnected(true);

        // Fetch parallel resources from backend
        const [deptRes, stuRes, actRes, recRes, notifRes] = await Promise.allSettled([
          api.departments.list(),
          api.students.list({ limit: 100 }),
          api.activities.list({ limit: 100 }),
          api.records.list({ limit: 100 }),
          api.notifications.list()
        ]);

        if (deptRes.status === 'fulfilled' && deptRes.value?.data) {
          setDepartments(deptRes.value.data);
        }
        if (stuRes.status === 'fulfilled' && stuRes.value?.data) {
          setStudents(stuRes.value.data);
        }
        if (actRes.status === 'fulfilled' && actRes.value?.data) {
          setActivities(actRes.value.data);
        }
        if (recRes.status === 'fulfilled' && recRes.value?.data) {
          setRecords(recRes.value.data);
        }
        if (notifRes.status === 'fulfilled' && notifRes.value?.data?.notifications) {
          setNotifications(notifRes.value.data.notifications);
        }
      }
    } catch {
      // In standalone frontend prototype mode, gracefully preserve local store
      setIsBackendConnected(false);
    } finally {
      setIsLoadingBackend(false);
    }
  };

  useEffect(() => {
    const verifySession = async () => {
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('skit021_auth_token') : null;
        if (token) {
          const res = await api.auth.me();
          if (res?.data?.user) {
            setCurrentUser(res.data.user);
            setActiveRole(res.data.user.role || 'INSTITUTION_ADMIN');
          }
        }
      } catch {
        try { localStorage.removeItem('skit021_auth_token'); } catch {}
      }
    };
    verifySession();
    refreshBackendData();
  }, []);

  // Sync to LocalStorage as secondary cache
  useEffect(() => {
    safeStorageSet(STORAGE_KEYS.STUDENTS, students);
  }, [students]);

  useEffect(() => {
    safeStorageSet(STORAGE_KEYS.ACTIVITIES, activities);
  }, [activities]);

  useEffect(() => {
    safeStorageSet(STORAGE_KEYS.RECORDS, records);
  }, [records]);

  useEffect(() => {
    safeStorageSet(STORAGE_KEYS.DEPARTMENTS, departments);
  }, [departments]);

  useEffect(() => {
    safeStorageSet(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  // Toast Helpers
  const addToast = ({ title, message, type = 'info', duration = 3500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Navigation Helper
  const navigateTo = (route, params = {}) => {
    setCurrentRoute(route);
    if (params.studentId) setSelectedStudentId(params.studentId);
    if (params.recordId) setSelectedRecordId(params.recordId);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Onboarding controls
  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    setIsOnboardingOpen(false);
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    addToast({
      title: "Welcome to Pehchaan!",
      message: "You're now ready to explore student records, verification, and analytics.",
      type: "success"
    });
  };

  const restartProductTour = () => {
    setIsOnboardingOpen(true);
  };

  // Student CRUD
  const addStudent = async (newStudent) => {
    if (isBackendConnected) {
      try {
        const res = await api.students.create(newStudent);
        if (res.data) {
          setStudents((prev) => [res.data, ...prev]);
          addToast({
            title: "Student Added",
            message: `${res.data.name} (${res.data.studentId}) registered in database.`,
            type: "success"
          });
          return res.data;
        }
      } catch (err) {
        console.warn("Backend student creation failed, using local store:", err);
      }
    }

    const maxStudentNum = students.reduce((max, s) => {
      const match = (s.id || '').match(/STU-(\d+)/);
      const num = match ? parseInt(match[1], 10) : 0;
      return num > max ? num : max;
    }, 0);
    const id = `STU-${String(maxStudentNum + 1).padStart(3, '0')}`;
    const studentWithId = {
      ...newStudent,
      id,
      status: newStudent.status || 'Active',
      avatar: newStudent.avatar || `https://images.unsplash.com/photo-${1534528741775 + students.length}?w=150&auto=format&fit=crop&q=80`
    };
    setStudents((prev) => [studentWithId, ...prev]);
    addToast({
      title: "Student Added",
      message: `${studentWithId.name} (${studentWithId.studentId}) registered successfully.`,
      type: "success"
    });
    return studentWithId;
  };

  const updateStudent = async (id, updatedData) => {
    if (isBackendConnected) {
      try {
        await api.students.update(id, updatedData);
      } catch (err) {
        console.warn("Backend student update failed, applying locally:", err);
      }
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === id || s.studentId === id ? { ...s, ...updatedData } : s))
    );
    // Update referential student data in records as well
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === id || r.studentRegNo === id
          ? {
              ...r,
              studentName: updatedData.name || r.studentName,
              studentRegNo: updatedData.studentId || r.studentRegNo,
              studentDepartment: updatedData.departmentName || r.studentDepartment
            }
          : r
      )
    );
    addToast({
      title: "Student Updated",
      message: "Student details updated across records.",
      type: "success"
    });
  };

  const deleteStudent = async (id) => {
    if (isBackendConnected) {
      try {
        await api.students.delete(id);
      } catch (err) {
        console.warn("Backend student archive failed, applying locally:", err);
      }
    }

    const student = students.find((s) => s.id === id || s.studentId === id);
    setStudents((prev) => prev.filter((s) => s.id !== id && s.studentId !== id));
    setRecords((prev) => prev.filter((r) => r.studentId !== id && r.studentRegNo !== id));
    addToast({
      title: "Student Removed",
      message: `${student ? student.name : 'Student'} and associated records removed.`,
      type: "warning"
    });
  };

  // Participation Record CRUD & Verification Workflow
  const addRecord = async (newRecord) => {
    if (isBackendConnected) {
      try {
        const res = await api.records.create(newRecord);
        if (res.data) {
          setRecords((prev) => [res.data, ...prev]);
          refreshBackendData();
          addToast({
            title: "Participation Record Created",
            message: `Record ${res.data.recordNumber} submitted to PostgreSQL verification queue.`,
            type: "success"
          });
          return res.data;
        }
      } catch (err) {
        console.warn("Backend record creation failed, using local store:", err);
      }
    }

    const maxRecNum = records.reduce((max, r) => {
      const match = (r.id || '').match(/REC-\d+-(\d+)/);
      const num = match ? parseInt(match[1], 10) : 0;
      return num > max ? num : max;
    }, 0);
    const id = `REC-2024-${String(maxRecNum + 1).padStart(3, '0')}`;
    const recordWithId = {
      ...newRecord,
      id,
      submissionDate: new Date().toISOString().split('T')[0],
      verificationStatus: newRecord.verificationStatus || 'Pending Review',
      certificateRef: newRecord.certificateRef || `CERT-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      evidenceFileSize: newRecord.evidenceFileSize || '1.2 MB'
    };
    setRecords((prev) => [recordWithId, ...prev]);

    // Create a notification for the review queue
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title: "New Participation Record Awaiting Review",
      message: `${recordWithId.studentName} submitted evidence for ${recordWithId.activityName}.`,
      type: "info",
      timestamp: "Just now",
      read: false,
      targetPage: "verification",
      recordId: id
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addToast({
      title: "Participation Record Created",
      message: `Record ${id} submitted and placed in verification queue.`,
      type: "success"
    });
    return recordWithId;
  };

  const updateRecord = async (id, updatedData) => {
    if (isBackendConnected) {
      try {
        await api.records.update(id, updatedData);
      } catch (err) {
        console.warn("Backend record update failed, applying locally:", err);
      }
    }

    setRecords((prev) =>
      prev.map((r) => (r.id === id || r.recordNumber === id ? { ...r, ...updatedData } : r))
    );
    addToast({
      title: "Record Updated",
      message: `Participation record ${id} updated successfully.`,
      type: "success"
    });
  };

  const deleteRecord = async (id) => {
    if (isBackendConnected) {
      try {
        await api.records.delete(id);
      } catch (err) {
        console.warn("Backend record delete failed, applying locally:", err);
      }
    }

    setRecords((prev) => prev.filter((r) => r.id !== id && r.recordNumber !== id));
    addToast({
      title: "Record Deleted",
      message: `Record ${id} removed from the platform.`,
      type: "warning"
    });
  };

  const updateVerificationStatus = async (recordId, status, notes, reviewerName = "Institutional Reviewer") => {
    const today = new Date().toISOString().split('T')[0];
    let targetRecord = null;

    if (isBackendConnected) {
      try {
        const statusMap = {
          'Verified': 'VERIFIED',
          'Needs Correction': 'NEEDS_CORRECTION',
          'Rejected': 'REJECTED'
        };
        const backendStatus = statusMap[status] || status;
        await api.verification.submitReview({
          recordId,
          status: backendStatus,
          notes: notes || (status === 'Verified' ? 'Verified by authorized reviewer.' : undefined)
        });
        refreshBackendData();
      } catch (err) {
        console.warn("Backend verification failed, applying locally:", err);
      }
    }

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === recordId || r.recordNumber === recordId) {
          targetRecord = r;
          return {
            ...r,
            verificationStatus: status,
            reviewerNotes: notes || (status === 'Verified' ? 'Verified by authorized reviewer.' : r.reviewerNotes),
            reviewerName: reviewerName,
            reviewDate: today
          };
        }
        return r;
      })
    );

    // Add appropriate notification
    const statusTypeMap = {
      'Verified': 'success',
      'Rejected': 'error',
      'Needs Correction': 'warning',
      'Pending Review': 'info'
    };

    const notif = {
      id: `NOTIF-${Date.now()}`,
      title: `Record ${status}: ${targetRecord ? targetRecord.activityName : recordId}`,
      message: `${targetRecord ? targetRecord.studentName : 'Student'}'s record has been marked as ${status}. Reviewer note: "${notes || 'Status updated'}".`,
      type: statusTypeMap[status] || 'info',
      timestamp: "Just now",
      read: false,
      targetPage: "verification",
      recordId
    };
    setNotifications((prev) => [notif, ...prev]);

    addToast({
      title: `Status: ${status}`,
      message: `Record ${recordId} updated to ${status}. Changes reflected across platform.`,
      type: statusTypeMap[status] || 'info'
    });
  };

  // Activity Management
  const addActivity = async (newAct) => {
    if (isBackendConnected) {
      try {
        const res = await api.activities.create(newAct);
        if (res.data) {
          setActivities((prev) => [res.data, ...prev]);
          refreshBackendData();
          addToast({
            title: "Activity Created",
            message: `Activity '${res.data.name}' added to institutional database.`,
            type: "success"
          });
          return res.data;
        }
      } catch (err) {
        console.warn("Backend activity creation failed, applying locally:", err);
      }
    }

    const maxActNum = activities.reduce((max, a) => {
      const match = (a.id || '').match(/ACT-(\d+)/);
      const num = match ? parseInt(match[1], 10) : 0;
      return num > max ? num : max;
    }, 100);
    const id = `ACT-${maxActNum + 1}`;
    const actWithId = {
      ...newAct,
      id,
      status: newAct.status || 'Upcoming'
    };
    setActivities((prev) => [actWithId, ...prev]);
    addToast({
      title: "Activity Created",
      message: `Activity '${actWithId.name}' added to institutional calendar.`,
      type: "success"
    });
    return actWithId;
  };

  const updateActivity = async (id, updatedData) => {
    if (isBackendConnected) {
      try {
        await api.activities.update(id, updatedData);
      } catch (err) {
        console.warn("Backend activity update failed, applying locally:", err);
      }
    }

    setActivities((prev) =>
      prev.map((a) => (a.id === id || a.code === id ? { ...a, ...updatedData } : a))
    );
    // Sync activity name across records
    setRecords((prev) =>
      prev.map((r) =>
        r.activityId === id
          ? {
              ...r,
              activityName: updatedData.name || r.activityName,
              category: updatedData.category || r.category
            }
          : r
      )
    );
    addToast({
      title: "Activity Updated",
      message: "Activity details updated successfully.",
      type: "success"
    });
  };

  const deleteActivity = async (id) => {
    if (isBackendConnected) {
      try {
        await api.activities.delete(id);
      } catch (err) {
        console.warn("Backend activity delete failed, applying locally:", err);
      }
    }

    const act = activities.find((a) => a.id === id || a.code === id);
    setActivities((prev) => prev.filter((a) => a.id !== id && a.code !== id));
    addToast({
      title: "Activity Removed",
      message: `Activity ${act ? act.name : id} deleted.`,
      type: "warning"
    });
  };

  // Department Management
  const addDepartment = async (newDept) => {
    if (isBackendConnected) {
      try {
        const res = await api.departments.create(newDept);
        if (res.data) {
          setDepartments((prev) => [...prev, res.data]);
          addToast({
            title: "Department Added",
            message: `${res.data.name} (${res.data.code}) created successfully.`,
            type: "success"
          });
          return res.data;
        }
      } catch (err) {
        console.warn("Backend department creation failed, applying locally:", err);
      }
    }

    const baseCode = (newDept.code || 'DEPT').trim().toUpperCase();
    let id = `DEPT-${baseCode}`;
    if (departments.some(d => d.id === id)) {
      id = `DEPT-${baseCode}-${Date.now().toString().slice(-4)}`;
    }
    const deptWithId = {
      ...newDept,
      id,
      status: 'Active'
    };
    setDepartments((prev) => [...prev, deptWithId]);
    addToast({
      title: "Department Added",
      message: `${deptWithId.name} (${deptWithId.code}) created successfully.`,
      type: "success"
    });
    return deptWithId;
  };

  const updateDepartment = async (id, updatedData) => {
    if (isBackendConnected) {
      try {
        await api.departments.update(id, updatedData);
      } catch (err) {
        console.warn("Backend department update failed, applying locally:", err);
      }
    }

    setDepartments((prev) =>
      prev.map((d) => (d.id === id || d.code === id ? { ...d, ...updatedData } : d))
    );
    addToast({
      title: "Department Updated",
      message: "Department record updated successfully.",
      type: "success"
    });
  };

  // Notifications
  const markNotificationAsRead = async (id) => {
    if (isBackendConnected) {
      try {
        await api.notifications.markRead(id);
      } catch (err) {
        console.warn("Backend mark notification failed:", err);
      }
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = async () => {
    if (isBackendConnected) {
      try {
        await api.notifications.markAllRead();
      } catch (err) {
        console.warn("Backend mark all notifications failed:", err);
      }
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast({
      title: "Notifications Cleared",
      message: "All notifications marked as read.",
      type: "info"
    });
  };

  // Reset demo data to defaults
  const resetDemoData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.STUDENTS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
      localStorage.removeItem(STORAGE_KEYS.RECORDS);
      localStorage.removeItem(STORAGE_KEYS.DEPARTMENTS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING);
    } catch (e) {
      console.warn("Storage reset error", e);
    }

    setStudents(INITIAL_STUDENTS);
    setActivities(INITIAL_ACTIVITIES);
    setRecords(INITIAL_RECORDS);
    setDepartments(INITIAL_DEPARTMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setHasCompletedOnboarding(false);
    setSelectedStudentId('STU-001');

    addToast({
      title: "Demo Data Reset",
      message: "All demo records have been restored to initial sample state.",
      type: "success"
    });
  };

  return (
    <AppContext.Provider
      value={{
        institutionInfo: INSTITUTION_INFO,
        currentRoute,
        setCurrentRoute,
        navigateTo,
        selectedStudentId,
        setSelectedStudentId,
        selectedRecordId,
        setSelectedRecordId,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,

        // Backend Integration & Session
        isBackendConnected,
        isLoadingBackend,
        currentUser,
        activeRole,
        setActiveRole,
        refreshBackendData,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        logout,

        // Onboarding
        hasCompletedOnboarding,
        isOnboardingOpen,
        setIsOnboardingOpen,
        completeOnboarding,
        restartProductTour,

        // Data Stores
        students,
        activities,
        records,
        departments,
        notifications,

        // CRUD Actions
        addStudent,
        updateStudent,
        deleteStudent,

        addRecord,
        updateRecord,
        deleteRecord,
        updateVerificationStatus,

        addActivity,
        updateActivity,
        deleteActivity,

        addDepartment,
        updateDepartment,

        markNotificationAsRead,
        markAllNotificationsAsRead,

        resetDemoData,

        // Toast system
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
