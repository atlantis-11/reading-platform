const bcrypt = require('bcrypt');
const request = require('supertest');
const _ = require('lodash');
const { parse: parseCookies } = require('set-cookie-parser');
const app = require('../../src/app');
const User = require('../../src/models/userModel');
const {
    connectToDb,
    dropDbAndDisconnect
} = require('../testUtils');

async function registerUser(userData) {
    const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
    return response;
}

async function registerUserAndExpectError(userData, expectedDetails) {
    const response = await registerUser(userData);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
        message: 'Error registering user',
        details: expectedDetails
    });
}

const validUserData = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'testpassword'
};

const invalidRegisterTestsName = 'should return 400 status and correct error details: $details';

describe('/api/auth/register', () => {
    beforeEach(async () => {
        await connectToDb();
    });
    
    afterEach(async () => {
        await dropDbAndDisconnect();
    });
    
    describe('POST - Valid Data', () => {
        const userData = { ...validUserData };
        let response;

        beforeEach(async () => {
            response = await registerUser(userData);
        });

        it('should return 201 status', () => {
            expect(response.status).toBe(201);
        });

        it('should have the correct response body', () => {
            expect(response.body).toMatchObject({
                message: 'User registered successfully',
                user: {
                    username: userData.username,
                    email: userData.email
                },
                accessToken: expect.any(String)
            });
        });

        it('should set the refreshToken cookie', () => {
            const refreshTokenCookie = _.find(parseCookies(response), { name: 'refreshToken' });
    
            expect(refreshTokenCookie).toBeTruthy();
            expect(refreshTokenCookie.httpOnly).toBe(true);
        });

        it('should create a new user in the db', async () => {
            const user = await User.findOne({ username: userData.username });
            expect(user.toObject()).toMatchObject({
                username: userData.username,
                email: userData.email,
                password: bcrypt.hash(userData.password, 8),
                role: 'USER',
                refreshTokens: [_.find(parseCookies(response), { name: 'refreshToken' }).value]
            });
        });
    });

    describe('POST - Invalid Username', () => {
        it.each([
            { username: '', details: 'Username is required' },
            { username: 'abc', details: 'Username must be at least 4 characters long' },
            { username: '$abcdef$', details: 'Username must only contain letters, numbers and underscores' }
        ])(invalidRegisterTestsName, async ({ username, details }) => {
            const userData = { ...validUserData, username };
            await registerUserAndExpectError(userData, { username: details });
        });
    });

    describe('POST - Invalid Email', () => {
        it.each([
            { email: '', details: 'Email is required' },
            { email: 'abc', details: 'Invalid email address' }
        ])(invalidRegisterTestsName, async ({ email, details }) => {
            const userData = { ...validUserData, email };
            await registerUserAndExpectError(userData, { email: details });
        });
    });

    describe('POST - Invalid Password', () => {
        it.each([
            { password: '', details: 'Password is required' },
            { password: 'abc', details: 'Password must be at least 8 characters long' }
        ])(invalidRegisterTestsName, async ({ password, details }) => {
            const userData = { ...validUserData, password };
            await registerUserAndExpectError(userData, { password: details });
        });
    });
});