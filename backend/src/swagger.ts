import swaggerJSDoc from 'swagger-jsdoc';

const servers: Array<Record<string, any>> = [
  { url: 'http://localhost:{port}', variables: { port: { default: '4000' } }, description: 'Local development server' },
];

// Add production server URLs
servers.unshift({ url: 'https://elevate-system.onrender.com', description: 'Production server (Render)' });

if (process.env.NODE_ENV === 'production') {
  if (process.env.PUBLIC_API_URL) {
    servers.unshift({ url: process.env.PUBLIC_API_URL, description: 'Custom production server' });
  }
}

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ELEVATE API',
      version: '1.0.0',
      description: 'Complete API documentation for ELEVATE learning platform with EmailJS-powered OTP delivery, unrestricted email domains, file uploads, real-time notifications, search, and comprehensive testing',
      contact: {
        name: 'ELEVATE Team',
        url: 'https://elevate-system.vercel.app'
      }
    },
    tags: [
      { name: 'Auth', description: 'Password-based login and EmailJS-powered OTP registration for any email domain' },
      { name: 'Missions', description: 'Mission management' },
      { name: 'Projects', description: 'Project management' },
      { name: 'Reflections', description: 'Learning reflections' },
      { name: 'Profile', description: 'User profile management' },
      { name: 'Stats', description: 'Platform statistics' },
      { name: 'Search', description: 'Content search' },
      { name: 'Notifications', description: 'Real-time notifications' },
      { name: 'Circles', description: 'Peer collaboration' },
      { name: 'Collaborations', description: 'Collaboration features' },
      { name: 'Mentors', description: 'Mentor management' },
      { name: 'Upload', description: 'File upload services' },
      { name: 'Admin', description: 'Administrative functions' },
      { name: 'Staff', description: 'Staff dashboard and student management' },
      { name: 'Comments', description: 'Staff comments on student work' },
      { name: 'Achievements', description: 'User achievements and badges' },
      { name: 'Documentation', description: 'User manuals and help content' }
    ],
    servers,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        Stats: {
          type: 'object',
          properties: {
            activeStudents: { type: 'integer' },
            missionsCompleted: { type: 'integer' },
            projectsCreated: { type: 'integer' },
            successRate: { type: 'integer', minimum: 0, maximum: 100 }
          }
        },
        Mission: {
          type: 'object',
          required: ['id', 'title'],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            progress: { type: 'integer', minimum: 0, maximum: 100 }
          }
        },
        MissionCreateInput: {
          type: 'object',
          required: ['title'],
          properties: { title: { type: 'string' } }
        },
        Project: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string', enum: ['active', 'completed', 'paused'] }
          }
        },
        ProjectCreateInput: {
          type: 'object',
          required: ['name'],
          properties: { name: { type: 'string' } }
        },

        ReflectionCreateInput: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string' } }
        },
        Collaboration: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            members: { type: 'integer' }
          }
        },
        CollaborationCreateInput: {
          type: 'object',
          required: ['name'],
          properties: { name: { type: 'string' } }
        },
        Profile: {
          type: 'object',
          required: ['id', 'email', 'name', 'role'],
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['student', 'mentor', 'admin'] },
            avatar: { type: 'string', format: 'uri' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string' },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        SearchResults: {
          type: 'object',
          properties: {
            missions: { type: 'array', items: { $ref: '#/components/schemas/Mission' } },
            projects: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
            reflections: { type: 'array', items: { $ref: '#/components/schemas/Reflection' } },
            total: { type: 'integer' }
          }
        },
        AdminStats: {
          type: 'object',
          properties: {
            totalUsers: { type: 'integer' },
            totalMissions: { type: 'integer' },
            totalProjects: { type: 'integer' },
            totalReflections: { type: 'integer' },
            activeUsers: { type: 'integer' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' }
          }
        },
        AuthRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            otp: { type: 'string', pattern: '^[0-9]{6}$' }
          }
        },
        FileUpload: {
          type: 'object',
          properties: {
            url: { type: 'string', format: 'uri' },
            publicId: { type: 'string' }
          }
        },
        Circle: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            members: { type: 'integer' },
            posts: { type: 'integer' },
            category: { type: 'string', enum: ['Technical', 'SoftSkills', 'Business'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['student', 'mentor', 'admin'] },
            avatar: { type: 'string', format: 'uri' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Mentor: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            expertise: { type: 'array', items: { type: 'string' } },
            students: { type: 'integer' },
            rating: { type: 'number', format: 'float' },
            available: { type: 'boolean' }
          }
        },
        ReflectionComplete: {
          type: 'object',
          required: ['id', 'title', 'content'],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            weekNumber: { type: 'integer' },
            keyLearnings: { type: 'array', items: { type: 'string' } },
            challenges: { type: 'array', items: { type: 'string' } },
            improvements: { type: 'array', items: { type: 'string' } },
            missionId: { type: 'string' },
            projectId: { type: 'string' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Comment: {
          type: 'object',
          required: ['id', 'content', 'authorId'],
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            authorId: { type: 'string' },
            missionId: { type: 'string' },
            projectId: { type: 'string' },
            reflectionId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            author: { $ref: '#/components/schemas/User' }
          }
        },
        CommentCreateInput: {
          type: 'object',
          required: ['content', 'type', 'itemId'],
          properties: {
            content: { type: 'string', maxLength: 500 },
            type: { type: 'string', enum: ['mission', 'project', 'reflection'] },
            itemId: { type: 'string' }
          }
        },
        StaffStats: {
          type: 'object',
          properties: {
            totalStudents: { type: 'integer' },
            mentorshipRequests: { type: 'integer' },
            myRating: { type: 'number', format: 'float' },
            participationScore: { type: 'integer', minimum: 0, maximum: 100 }
          }
        },
        MentorshipRequest: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            studentId: { type: 'string' },
            studentName: { type: 'string' },
            studentEmail: { type: 'string', format: 'email' },
            message: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        StudentWithStats: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['student'] },
            createdAt: { type: 'string', format: 'date-time' },
            missions: { type: 'integer' },
            projects: { type: 'integer' },
            reflections: { type: 'integer' }
          }
        },
        Achievement: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            icon: { type: 'string' },
            earned: { type: 'boolean' },
            earnedAt: { type: 'string', format: 'date-time', nullable: true }
          }
        }
      }
    }
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
