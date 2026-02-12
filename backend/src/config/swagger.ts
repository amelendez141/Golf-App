import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'LinkUp Golf API',
      version: '1.0.0',
      description: `
## Overview

**LinkUp Golf** is a professional networking platform that connects business professionals through the game of golf.
Our API enables developers to build applications that facilitate meaningful connections on the course.

### Key Features

- **Smart Matching**: AI-powered recommendations based on industry, skill level, and location
- **Tee Time Management**: Create, join, and manage golf sessions with other professionals
- **Real-time Messaging**: Communicate with your playing partners before hitting the links
- **Course Discovery**: Find and favorite golf courses in your area

### Authentication

This API uses JWT Bearer token authentication via Clerk. Include your token in the Authorization header:

\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

### Rate Limiting

- **Read operations**: 100 requests per minute
- **Write operations**: 30 requests per minute

### Need Help?

Contact our developer support team at developers@linkupgolf.com
      `,
      contact: {
        name: 'LinkUp Golf Developer Support',
        email: 'developers@linkupgolf.com',
        url: 'https://linkupgolf.com/developers',
      },
      license: {
        name: 'Proprietary',
        url: 'https://linkupgolf.com/terms',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.linkupgolf.com',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'API health and status endpoints',
      },
      {
        name: 'Users',
        description: 'User profile and account management',
      },
      {
        name: 'Courses',
        description: 'Golf course discovery and favorites',
      },
      {
        name: 'Tee Times',
        description: 'Create, join, and manage tee times',
      },
      {
        name: 'Messages',
        description: 'Tee time group messaging',
      },
      {
        name: 'Notifications',
        description: 'User notifications and alerts',
      },
      {
        name: 'Demo',
        description: 'Demo mode utilities for testing',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Clerk JWT token',
        },
      },
      schemas: {
        // Enums
        Industry: {
          type: 'string',
          enum: [
            'TECHNOLOGY',
            'FINANCE',
            'HEALTHCARE',
            'LEGAL',
            'REAL_ESTATE',
            'CONSULTING',
            'MARKETING',
            'SALES',
            'ENGINEERING',
            'EXECUTIVE',
            'ENTREPRENEURSHIP',
            'OTHER',
          ],
          description: 'Professional industry category',
          example: 'TECHNOLOGY',
        },
        SkillLevel: {
          type: 'string',
          enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
          description: 'Golf skill/experience level',
          example: 'INTERMEDIATE',
        },
        TeeTimeStatus: {
          type: 'string',
          enum: ['OPEN', 'FULL', 'CANCELLED', 'COMPLETED'],
          description: 'Current status of a tee time',
          example: 'OPEN',
        },
        CourseType: {
          type: 'string',
          enum: ['PUBLIC', 'PRIVATE', 'SEMI_PRIVATE', 'RESORT', 'MUNICIPAL'],
          description: 'Type of golf course',
          example: 'PUBLIC',
        },
        NotificationType: {
          type: 'string',
          enum: [
            'TEE_TIME_JOINED',
            'TEE_TIME_LEFT',
            'TEE_TIME_CANCELLED',
            'TEE_TIME_REMINDER',
            'NEW_MESSAGE',
            'SLOT_AVAILABLE',
            'MATCH_FOUND',
          ],
          description: 'Type of notification',
          example: 'TEE_TIME_JOINED',
        },

        // User schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier',
              example: 'clh1234567890abcdef',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.smith@example.com',
            },
            firstName: {
              type: 'string',
              description: 'First name',
              example: 'John',
            },
            lastName: {
              type: 'string',
              description: 'Last name',
              example: 'Smith',
            },
            avatarUrl: {
              type: 'string',
              format: 'uri',
              description: 'Profile image URL',
              example: 'https://images.clerk.dev/avatar.jpg',
            },
            industry: {
              $ref: '#/components/schemas/Industry',
            },
            company: {
              type: 'string',
              description: 'Company name',
              example: 'Acme Corporation',
            },
            jobTitle: {
              type: 'string',
              description: 'Job title',
              example: 'Senior Software Engineer',
            },
            bio: {
              type: 'string',
              description: 'User bio/description',
              example: 'Passionate golfer and tech enthusiast. Love connecting with fellow professionals on the course.',
            },
            handicap: {
              type: 'number',
              format: 'float',
              minimum: -10,
              maximum: 54,
              description: 'Golf handicap index',
              example: 12.5,
            },
            skillLevel: {
              $ref: '#/components/schemas/SkillLevel',
            },
            city: {
              type: 'string',
              description: 'City',
              example: 'San Francisco',
            },
            state: {
              type: 'string',
              description: 'State',
              example: 'CA',
            },
            searchRadius: {
              type: 'integer',
              minimum: 5,
              maximum: 200,
              description: 'Search radius in miles',
              example: 50,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'John',
            },
            lastName: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'Smith',
            },
            industry: {
              $ref: '#/components/schemas/Industry',
            },
            company: {
              type: 'string',
              maxLength: 200,
              example: 'Acme Corporation',
            },
            jobTitle: {
              type: 'string',
              maxLength: 200,
              example: 'Senior Software Engineer',
            },
            bio: {
              type: 'string',
              maxLength: 1000,
              example: 'Passionate golfer looking to network on the course.',
            },
            handicap: {
              type: 'number',
              minimum: -10,
              maximum: 54,
              example: 12.5,
            },
            skillLevel: {
              $ref: '#/components/schemas/SkillLevel',
            },
            city: {
              type: 'string',
              maxLength: 100,
              example: 'San Francisco',
            },
            state: {
              type: 'string',
              maxLength: 100,
              example: 'CA',
            },
            latitude: {
              type: 'number',
              minimum: -90,
              maximum: 90,
              example: 37.7749,
            },
            longitude: {
              type: 'number',
              minimum: -180,
              maximum: 180,
              example: -122.4194,
            },
            searchRadius: {
              type: 'integer',
              minimum: 5,
              maximum: 200,
              example: 50,
            },
          },
        },

        // Course schemas
        Course: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique course identifier',
              example: 'clh1234567890course',
            },
            name: {
              type: 'string',
              description: 'Course name',
              example: 'Pebble Beach Golf Links',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly course identifier',
              example: 'pebble-beach-golf-links',
            },
            address: {
              type: 'string',
              description: 'Street address',
              example: '1700 17-Mile Drive',
            },
            city: {
              type: 'string',
              example: 'Pebble Beach',
            },
            state: {
              type: 'string',
              example: 'CA',
            },
            zipCode: {
              type: 'string',
              example: '93953',
            },
            country: {
              type: 'string',
              default: 'USA',
              example: 'USA',
            },
            latitude: {
              type: 'number',
              format: 'float',
              example: 36.5677,
            },
            longitude: {
              type: 'number',
              format: 'float',
              example: -121.9500,
            },
            phone: {
              type: 'string',
              example: '(800) 654-9300',
            },
            website: {
              type: 'string',
              format: 'uri',
              example: 'https://www.pebblebeach.com',
            },
            courseType: {
              $ref: '#/components/schemas/CourseType',
            },
            holes: {
              type: 'integer',
              default: 18,
              example: 18,
            },
            par: {
              type: 'integer',
              example: 72,
            },
            rating: {
              type: 'number',
              format: 'float',
              example: 75.5,
            },
            slope: {
              type: 'integer',
              example: 145,
            },
            yardage: {
              type: 'integer',
              example: 6828,
            },
            greenFee: {
              type: 'integer',
              description: 'Green fee in cents',
              example: 57500,
            },
            amenities: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['Pro Shop', 'Restaurant', 'Driving Range', 'Practice Green'],
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://images.linkupgolf.com/courses/pebble-beach.jpg',
            },
            description: {
              type: 'string',
              example: 'One of the most famous golf courses in the world, featuring stunning Pacific Ocean views.',
            },
            isFavorited: {
              type: 'boolean',
              description: 'Whether the current user has favorited this course',
              example: true,
            },
            distance: {
              type: 'number',
              format: 'float',
              description: 'Distance from search location in miles',
              example: 25.4,
            },
          },
        },

        // Tee Time schemas
        TeeTime: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clh1234567890teetime',
            },
            hostId: {
              type: 'string',
              description: 'ID of the user who created the tee time',
            },
            courseId: {
              type: 'string',
              description: 'ID of the golf course',
            },
            dateTime: {
              type: 'string',
              format: 'date-time',
              description: 'Scheduled tee time',
              example: '2024-03-15T10:30:00.000Z',
            },
            totalSlots: {
              type: 'integer',
              minimum: 2,
              maximum: 4,
              default: 4,
              example: 4,
            },
            availableSlots: {
              type: 'integer',
              description: 'Number of open slots remaining',
              example: 2,
            },
            industryPreference: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Industry',
              },
              description: 'Preferred industries for playing partners',
              example: ['TECHNOLOGY', 'FINANCE'],
            },
            skillPreference: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/SkillLevel',
              },
              description: 'Preferred skill levels for playing partners',
              example: ['INTERMEDIATE', 'ADVANCED'],
            },
            notes: {
              type: 'string',
              maxLength: 500,
              description: 'Additional notes or requirements',
              example: 'Looking for a casual round with networking focus. Drinks after!',
            },
            status: {
              $ref: '#/components/schemas/TeeTimeStatus',
            },
            host: {
              $ref: '#/components/schemas/User',
            },
            course: {
              $ref: '#/components/schemas/Course',
            },
            slots: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TeeTimeSlot',
              },
            },
            matchScore: {
              type: 'number',
              format: 'float',
              description: 'Match score for recommended tee times (0-100)',
              example: 87.5,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        TeeTimeSlot: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            slotNumber: {
              type: 'integer',
              minimum: 1,
              maximum: 4,
              example: 1,
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            joinedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CreateTeeTimeRequest: {
          type: 'object',
          required: ['courseId', 'dateTime'],
          properties: {
            courseId: {
              type: 'string',
              description: 'ID of the golf course',
              example: 'clh1234567890course',
            },
            dateTime: {
              type: 'string',
              format: 'date-time',
              description: 'Desired tee time (must be in the future)',
              example: '2024-03-15T10:30:00.000Z',
            },
            totalSlots: {
              type: 'integer',
              minimum: 2,
              maximum: 4,
              default: 4,
              example: 4,
            },
            industryPreference: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Industry',
              },
              default: [],
              example: ['TECHNOLOGY', 'FINANCE'],
            },
            skillPreference: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/SkillLevel',
              },
              default: [],
              example: ['INTERMEDIATE'],
            },
            notes: {
              type: 'string',
              maxLength: 500,
              example: 'Casual round, networking focus. Open to all skill levels!',
            },
          },
        },
        UpdateTeeTimeRequest: {
          type: 'object',
          properties: {
            dateTime: {
              type: 'string',
              format: 'date-time',
              example: '2024-03-15T11:00:00.000Z',
            },
            totalSlots: {
              type: 'integer',
              minimum: 2,
              maximum: 4,
            },
            industryPreference: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Industry',
              },
            },
            skillPreference: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/SkillLevel',
              },
            },
            notes: {
              type: 'string',
              maxLength: 500,
            },
            status: {
              type: 'string',
              enum: ['OPEN', 'CANCELLED'],
            },
          },
        },
        JoinTeeTimeRequest: {
          type: 'object',
          properties: {
            slotNumber: {
              type: 'integer',
              minimum: 1,
              maximum: 4,
              description: 'Specific slot to join (optional, will auto-assign if not provided)',
              example: 2,
            },
          },
        },

        // Message schemas
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clh1234567890message',
            },
            teeTimeId: {
              type: 'string',
            },
            content: {
              type: 'string',
              example: 'Looking forward to the round! Should we meet at the clubhouse 30 mins early?',
            },
            sender: {
              $ref: '#/components/schemas/User',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CreateMessageRequest: {
          type: 'object',
          required: ['content'],
          properties: {
            content: {
              type: 'string',
              minLength: 1,
              maxLength: 2000,
              example: 'Great to meet you! See you on the first tee.',
            },
          },
        },

        // Notification schemas
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            type: {
              $ref: '#/components/schemas/NotificationType',
            },
            title: {
              type: 'string',
              example: 'New Player Joined',
            },
            body: {
              type: 'string',
              example: 'John Smith has joined your tee time at Pebble Beach.',
            },
            data: {
              type: 'object',
              description: 'Additional notification data',
              example: {
                teeTimeId: 'clh1234567890teetime',
                userId: 'clh1234567890user',
              },
            },
            isRead: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },

        // Response wrappers
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {},
            },
            pagination: {
              type: 'object',
              properties: {
                nextCursor: {
                  type: 'string',
                  nullable: true,
                  description: 'Cursor for fetching the next page',
                },
                hasMore: {
                  type: 'boolean',
                  description: 'Whether more results are available',
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  example: 'Invalid request parameters',
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                      },
                      message: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },

        // Demo schemas
        DemoStats: {
          type: 'object',
          properties: {
            users: {
              type: 'integer',
              example: 150,
            },
            courses: {
              type: 'integer',
              example: 50,
            },
            teeTimes: {
              type: 'integer',
              example: 300,
            },
            openTeeTimes: {
              type: 'integer',
              example: 45,
            },
            industryDistribution: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  industry: {
                    $ref: '#/components/schemas/Industry',
                  },
                  count: {
                    type: 'integer',
                  },
                },
              },
            },
            skillDistribution: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  skillLevel: {
                    $ref: '#/components/schemas/SkillLevel',
                  },
                  count: {
                    type: 'integer',
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Authentication required or invalid token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  code: 'UNAUTHORIZED',
                  message: 'Authentication required',
                },
              },
            },
          },
        },
        Forbidden: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  code: 'FORBIDDEN',
                  message: 'You do not have permission to perform this action',
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  code: 'NOT_FOUND',
                  message: 'The requested resource was not found',
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Invalid request parameters',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  code: 'VALIDATION_ERROR',
                  message: 'Invalid request parameters',
                  details: [
                    {
                      field: 'dateTime',
                      message: 'Tee time must be in the future',
                    },
                  ],
                },
              },
            },
          },
        },
        RateLimitExceeded: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  code: 'RATE_LIMIT_EXCEEDED',
                  message: 'Too many requests. Please try again later.',
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
