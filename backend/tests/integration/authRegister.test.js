const bcrypt = require('bcrypt');
const request = require('supertest');
const _ = require('lodash');
const { parse: parseCookies } = require('set-cookie-parser');
const app = require('../../src/app');
const User = require('../../src/models/userModel');
const { connectToDb, dropDbAndDisconnect } = require('../utils/dbHelpers');

const RegistrationUserDataFactory = require('../utils/registrationUserDataFactory');

async function registerUser(userData) {
    const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
    return response;
}

async function registerUserAndExpectError(userData, expectedDetails, errorCode = 400) {
    const response = await registerUser(userData);

    expect(response.status).toBe(errorCode);
    expect(response.body).toMatchObject({
        message: 'Error registering user',
        details: expectedDetails
    });
}

describe('/api/auth/register', () => {
    beforeEach(async () => await connectToDb());
    afterEach(async () => await dropDbAndDisconnect());
    
    describe('POST - Valid Data', () => {
        const userData = new RegistrationUserDataFactory().build();
        let response;

        beforeEach(async () => {
            response = await registerUser(userData);
        });

        it('should return 201 status', () => {
            expect(response.status).toBe(201);
        });

        it('should have the correct response body', () => {
            const { username, email } = userData;
            expect(response.body).toMatchObject({
                message: 'User registered successfully',
                user: { username, email },
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
                role: 'USER',
                refreshTokens: [ _.find(parseCookies(response), { name: 'refreshToken' }).value ]
            });
            expect(bcrypt.compareSync(userData.password, user.password)).toBe(true);
        });
    });

    const invalidRegisterTestsName = 'should return 400 status and error with details: $details';

    describe('POST - Invalid Username', () => {
        it.each([
            { username: '', details: 'Username is required' },
            { username: 'abc', details: 'Username must be at least 4 characters long' },
            { username: '$abcdef$', details: 'Username must only contain letters, numbers and underscores' }
        ])(invalidRegisterTestsName, async ({ username, details }) => {
            const userData = new RegistrationUserDataFactory({ username }).build();
            await registerUserAndExpectError(userData, { username: details });
        });
    });

    describe('POST - Invalid Email', () => {
        it.each([
            { email: '', details: 'Email is required' },
            { email: 'abc', details: 'Invalid email address' }
        ])(invalidRegisterTestsName, async ({ email, details }) => {
            const userData = new RegistrationUserDataFactory({ email }).build();
            await registerUserAndExpectError(userData, { email: details });
        });
    });

    describe('POST - Invalid Password', () => {
        it.each([
            { password: '', details: 'Password is required' },
            { password: 'abc', details: 'Password must be at least 8 characters long' }
        ])(invalidRegisterTestsName, async ({ password, details }) => {
            const userData = new RegistrationUserDataFactory({ password }).build();
            await registerUserAndExpectError(userData, { password: details });
        });
    });

    const duplicationRegisterTestsName = 'should return 400 status and error with details: ';

    describe('POST - Duplicate Username', () => {
        const details = 'Username is not unique';
        const testsName = duplicationRegisterTestsName + details;
        let factoryObj;

        beforeEach(async () => {
            await registerUser(new RegistrationUserDataFactory().build());
            factoryObj = new RegistrationUserDataFactory().addPrefixTo('email');
        });

        it(testsName, async () => {   
            const userData = factoryObj.build();
            await registerUserAndExpectError(userData, { username: details }, 409);
        });

        it(testsName + ' (test with different case)', async () => {
            const userData = factoryObj.upperCase('username').build();  
            await registerUserAndExpectError(userData, { username: details }, 409);
        });
    });

    describe('POST - Duplicate Email', () => {
        const details = 'Email is not unique';
        const testsName = duplicationRegisterTestsName + details;
        let factoryObj;

        beforeEach(async () => {
            await registerUser(new RegistrationUserDataFactory().build());
            factoryObj = new RegistrationUserDataFactory().addPrefixTo('username');
        });

        it(testsName, async () => {   
            const userData = factoryObj.build();
            await registerUserAndExpectError(userData, { email: details }, 409);
        });

        it(testsName + ' (test with different case)', async () => {
            const userData = factoryObj.upperCase('email').build();  
            await registerUserAndExpectError(userData, { email: details }, 409);
        });
    });
});