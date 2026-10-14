export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Pehchaan (SKIT021) Multi-Tenant SaaS API',
    version: '1.0.0',
    description:
      'Production-grade REST API for Centralized Student Participation, Verification & Achievement Management Platform. Implements strict institutional multi-tenant isolation, 5 RBAC roles, verification workflow lifecycle, and append-only audit logging.'
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 Root'
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'pehchaan_session',
        description: 'HttpOnly session cookie'
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Bearer JWT token for API clients'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Descriptive error message' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          fullName: { type: 'string' },
          role: {
            type: 'string',
            enum: ['PLATFORM_SUPER_ADMIN', 'INSTITUTION_ADMIN', 'FACULTY_COORDINATOR', 'STUDENT', 'AUDITOR_VIEWER']
          }
        }
      },
      StudentProfile: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          studentId: { type: 'string', example: 'SKIT-2022-CS014' },
          name: { type: 'string' },
          email: { type: 'string' },
          departmentId: { type: 'string' },
          departmentName: { type: 'string' },
          program: { type: 'string' },
          year: { type: 'string' },
          status: { type: 'string' },
          cgpa: { type: 'string' }
        }
      },
      ParticipationRecord: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          recordNumber: { type: 'string', example: 'REC-2024-001' },
          studentId: { type: 'string' },
          studentName: { type: 'string' },
          activityId: { type: 'string' },
          activityName: { type: 'string' },
          category: { type: 'string' },
          participationDate: { type: 'string', format: 'date' },
          achievementLevel: { type: 'string' },
          verificationStatus: {
            type: 'string',
            enum: ['Draft', 'Pending Review', 'Needs Correction', 'Verified', 'Rejected']
          }
        }
      }
    }
  },
  security: [{ cookieAuth: [] }, { bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'Server Health & Readiness Check',
        responses: {
          200: { description: 'Server and database connection status' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                  institutionCode: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Authenticated successfully' },
          401: { description: 'Invalid email or password' }
        }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Get current authenticated user profile & tenant context',
        responses: {
          200: { description: 'Current user session' },
          401: { description: 'Unauthenticated' }
        }
      }
    },
    '/auth/logout': {
      post: {
        summary: 'Clear user session and cookie',
        responses: {
          200: { description: 'Logged out successfully' }
        }
      }
    },
    '/students': {
      get: {
        summary: 'List students with filters, pagination, and sorting',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'departmentId', in: 'query', schema: { type: 'string' } },
          { name: 'year', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'List of student profiles' } }
      },
      post: {
        summary: 'Register a new student within institution',
        responses: { 201: { description: 'Student created' } }
      }
    },
    '/students/{id}': {
      get: {
        summary: 'Get student details, achievements, and participation history',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Student profile details' } }
      },
      put: {
        summary: 'Update student profile',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Student profile updated' } }
      },
      delete: {
        summary: 'Archive student (preserves verified records)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Student archived' } }
      }
    },
    '/activities': {
      get: {
        summary: 'List activities with search and filters',
        responses: { 200: { description: 'List of activities' } }
      },
      post: {
        summary: 'Create activity (validates dates & department)',
        responses: { 201: { description: 'Activity created' } }
      }
    },
    '/activities/{id}': {
      get: {
        summary: 'Get activity details with participant roster',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Activity details and roster' } }
      }
    },
    '/records': {
      get: {
        summary: 'List participation records with status/category filters',
        responses: { 200: { description: 'List of participation records' } }
      },
      post: {
        summary: 'Submit new participation record for verification',
        responses: { 201: { description: 'Record created in Pending Review queue' } }
      }
    },
    '/verification/queues': {
      get: {
        summary: 'Get counts across verification stages',
        responses: { 200: { description: 'Verification queues overview' } }
      }
    },
    '/verification/review': {
      post: {
        summary: 'Submit verification review decision (Approve / Reject / Needs Correction)',
        description: 'Enforces anti-self-approval rule and requires reasons for rejections/corrections.',
        responses: { 200: { description: 'Review recorded' } }
      }
    },
    '/analytics/dashboard': {
      get: {
        summary: 'Get database-backed dashboard overview & trends',
        responses: { 200: { description: 'Dashboard metrics and charts data' } }
      }
    },
    '/analytics/export/records': {
      get: {
        summary: 'Export filtered participation records as CSV (formula-injection protected)',
        responses: { 200: { description: 'CSV file download' } }
      }
    },
    '/notifications': {
      get: {
        summary: 'List notifications for current user/role in institution',
        responses: { 200: { description: 'User notification inbox' } }
      }
    },
    '/audit': {
      get: {
        summary: 'List immutable audit logs for institution',
        responses: { 200: { description: 'Audit log history' } }
      }
    }
  }
};
