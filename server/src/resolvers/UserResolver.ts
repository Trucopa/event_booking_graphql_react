import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { User } from '../entity/User'
import { Event } from '../entity/Event'
import { UserInput, AuthData } from './inputTypes/UserInput'
import { isAuth } from '../middleware/isAuth';
import { createAccessToken, createRefreshToken } from '../auth/auth';
import bcrypt from 'bcryptjs';
//import jsonwebtoken from 'jsonwebtoken';
import { MyContext } from 'src/context';
import { getConnection } from 'typeorm';


@Resolver()
export class UserResolver {

    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(
        @Ctx() {payload}:MyContext
    ){
        console.log(payload)
        return `Hello dear ${payload?.email} your id is ${payload?.userId}`;
    }

    @Query(() => [User])
    users(){
        return User.find();
    }

    @Query(() => AuthData)
    async login (
        @Arg('email', ()=> String) email: string,
        @Arg('password', ()=> String) password: string,
        @Ctx() {res}: MyContext
    ): Promise<AuthData> {
        const user = await User.findOne({where: {email: email}})

        if (! user) {
            throw new Error('User does not exists');
        }

        const isEqual = await bcrypt.compare(password, user.password)

        if (! isEqual) {
            throw new Error('Invalid password');
        }

        // Send cookie with the refresh token to client
        res.cookie('jid',createRefreshToken(user),{httpOnly: true});

        const token = createAccessToken(user);
        //const token = await jsonwebtoken.sign({userId: user.id, email: user.email}, 'somesupersecretkey', {expiresIn: '15m'});

        // const result: AuthData = {userId: user.id, token: token, tokenExpiration: 1}

        return {userId: user.id, token: token, tokenExpiration: 15};


    }

    // increment tokenVersion Mutation
    @Mutation(() => Boolean)
    async revokeRefreshTokensForUser (
        @Arg('userId', () => Int) userId: number
    ) {
        await getConnection().getRepository(User).increment({id: userId}, 'tokenVersion', 1);
        return true;
    }

    @Mutation(() => User)
    async createUser(
        @Arg('userInput', () => UserInput) userInput: UserInput
    ){

        return User.findOne({where: {email: userInput.email}})
        .then(user => {
            //Verify f user already exists
            if (user) {
                throw new Error('Email aleready registered');
            }
            // If user dont exist, start by hashing password
            return bcrypt.hash(userInput.password, 12);
        })
        .then(hashedPassword => {
            const newUser = new User();
            newUser.email = userInput.email
            newUser.password = hashedPassword;

            newUser.save();
            return newUser
        })
        .catch(err => {
            throw err
        });
    }

    @Mutation(() => Boolean)
    async bookEvent(
        @Arg('userId', () => Int) userId: number,
        @Arg('eventId', () => Int) eventId: number
    ){
        const user = await User.findOne({where: {id: userId}})
        const event = await Event.findOne({where: {id: eventId}})

        if (!user) {
            throw new Error('User do not exist');
        }

        if (!event) {
            throw new Error('Event do not exist');
        }

        try {

            await user.createdEvents?.then((createdEvents) => {return createdEvents})
            await user.bookedEvents?.then((bookedEvents) => {return bookedEvents.push(event)})

            user.save();
            return true

        } catch (error) {
            throw error
        }
    }
}
