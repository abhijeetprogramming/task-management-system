const request = require('supertest');
const app = require('../server');

describe('Authentication Endpoints', () => {
    
    describe('POST /api/auth/register', () => {
        it('should register a new user with valid data', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    full_name: 'Test User',
                    email: `test${Date.now()}@example.com`,
                    password: 'Test@123',
                    confirm_password: 'Test@123',
                    role: 'Employee'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
        });

        it('should fail with invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    full_name: 'Test User',
                    email: 'invalid-email',
                    password: 'Test@123',
                    confirm_password: 'Test@123',
                    role: 'Employee'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should fail with weak password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    full_name: 'Test User',
                    email: 'test@example.com',
                    password: 'weak',
                    confirm_password: 'weak',
                    role: 'Employee'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@taskmanagement.com',
                    password: 'Admin@123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
        });

        it('should fail with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@taskmanagement.com',
                    password: 'WrongPassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
});
