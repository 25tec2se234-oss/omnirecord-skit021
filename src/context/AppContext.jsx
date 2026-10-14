import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_STUDENTS,
  INITIAL_ACTIVITIES,
  INITIAL_RECORDS,
  INITIAL_DEPARTMENTS,
  INITIAL_NOTIFICATIONS,
  INSTITUTION_INFO
} from '../data/initialData';

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

  // Sync to LocalStorage
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
      title: "Welcome to OmniRecord!",
      message: "You're now ready to explore student records, verification, and analytics.",
      type: "success"
    });
  };

  const restartProductTour = () => {
    setIsOnboardingOpen(true);
  };

  // Student CRUD
  const addStudent = (newStudent) => {
    const id = `STU-${String(students.length + 1).padStart(3, '0')}`;
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

  const updateStudent = (id, updatedData) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );
    // Update referential student data in records as well
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === id
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

  const deleteStudent = (id) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    // Remove related records or decouple
    setRecords((prev) => prev.filter((r) => r.studentId !== id));
    addToast({
      title: "Student Removed",
      message: `${student ? student.name : 'Student'} and associated demo records removed.`,
      type: "warning"
    });
  };

  // Participation Record CRUD & Verification Workflow
  const addRecord = (newRecord) => {
    const id = `REC-2024-${String(records.length + 1).padStart(3, '0')}`;
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

  const updateRecord = (id, updatedData) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedData } : r))
    );
    addToast({
      title: "Record Updated",
      message: `Participation record ${id} updated successfully.`,
      type: "success"
    });
  };

  const deleteRecord = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    addToast({
      title: "Record Deleted",
      message: `Record ${id} removed from the platform.`,
      type: "warning"
    });
  };

  const updateVerificationStatus = (recordId, status, notes, reviewerName = "Institutional Reviewer") => {
    const today = new Date().toISOString().split('T')[0];
    let targetRecord = null;

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === recordId) {
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
  const addActivity = (newAct) => {
    const id = `ACT-${String(activities.length + 101)}`;
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

  const updateActivity = (id, updatedData) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedData } : a))
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

  const deleteActivity = (id) => {
    const act = activities.find((a) => a.id === id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
    addToast({
      title: "Activity Removed",
      message: `Activity ${act ? act.name : id} deleted.`,
      type: "warning"
    });
  };

  // Department Management
  const addDepartment = (newDept) => {
    const id = `DEPT-${newDept.code.toUpperCase()}`;
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

  const updateDepartment = (id, updatedData) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updatedData } : d))
    );
    addToast({
      title: "Department Updated",
      message: "Department record updated successfully.",
      type: "success"
    });
  };

  // Notifications
  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
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
