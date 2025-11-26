import { z } from 'zod';

export const LoginSchema = z.object({
  body: z.object({ 
    email: z.string().refine((email) => {
      return email === 'admin@admin.com' || z.string().email().safeParse(email).success;
    }, { message: 'Invalid email format' }),
    password: z.string().min(1)
  })
});

export const AuthSendSchema = z.object({
  body: z.object({ 
    email: z.string().min(1), // Allow any email format for flexibility
    name: z.string().min(1),
    password: z.string().min(6)
  })
});

export const AuthVerifySchema = z.object({
  body: z.object({ 
    email: z.string().min(1), // Allow any email format for flexibility
    otp: z.string().min(6).max(6)
  })
});

export const MissionCreateSchema = z.object({
  body: z.object({ 
    title: z.string().min(1),
    description: z.string().min(1),
    deadline: z.string(),
    category: z.enum(['Technical', 'Soft Skills', 'Business']).optional()
  })
});

export const MissionUpdateSchema = z.object({
  body: z.object({ 
    title: z.string().min(1).optional(), 
    description: z.string().min(1).optional(),
    progress: z.number().int().min(0).max(100).optional(),
    status: z.enum(['Planning', 'In Progress', 'Near Completion', 'Completed']).optional(),
    deadline: z.string().optional(),
    category: z.enum(['Technical', 'Soft Skills', 'Business']).optional()
  }),
  params: z.object({ id: z.string() })
});

export const IdParamSchema = z.object({ params: z.object({ id: z.string() }) });

export const ProjectCreateSchema = z.object({
  body: z.object({ 
    title: z.string().min(1),
    description: z.string().min(1),
    missionId: z.string(),
    startDate: z.string(),
    dueDate: z.string(),
    tags: z.array(z.string()).optional()
  })
});

export const ProjectUpdateSchema = z.object({
  body: z.object({ 
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    status: z.enum(['Planning', 'In Progress', 'Completed']).optional(),
    progress: z.number().int().min(0).max(100).optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    tags: z.array(z.string()).optional()
  }),
  params: z.object({ id: z.string() })
});

export const ReflectionCreateSchema = z.object({
  body: z.object({ 
    title: z.string().min(1),
    content: z.string().min(1),
    missionId: z.string(),
    mood: z.enum(['Productive', 'Insightful', 'Accomplished', 'Challenging', 'Inspired']).optional(),
    tags: z.array(z.string()).optional()
  })
});

export const ReflectionUpdateSchema = z.object({
  body: z.object({ 
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    mood: z.enum(['Productive', 'Insightful', 'Accomplished', 'Challenging', 'Inspired']).optional(),
    tags: z.array(z.string()).optional()
  }),
  params: z.object({ id: z.string() })
});

export const CircleCreateSchema = z.object({
  body: z.object({ 
    name: z.string().min(1),
    description: z.string().min(1),
    category: z.enum(['Technical', 'Soft Skills', 'Business']).optional()
  })
});

export const CircleUpdateSchema = z.object({
  body: z.object({ 
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    category: z.enum(['Technical', 'Soft Skills', 'Business']).optional()
  }),
  params: z.object({ id: z.string() })
});

export const ProfileUpdateSchema = z.object({
  body: z.object({ 
    name: z.string().min(1).optional(),
    role: z.enum(['student', 'mentor', 'admin']).optional()
  })
});
