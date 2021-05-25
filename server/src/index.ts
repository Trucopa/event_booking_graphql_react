import "reflect-metadata";
import 'dotenv/config';
import express from 'express';
import { createConnection } from 'typeorm';
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/UserResolver'
import { EventResolver } from './resolvers/EventResolver'
import {verify} from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { User } from "./entity/User";
import { createAccessToken, createRefreshToken } from "./auth/auth";
//import { isAuth } from './middleware/isAuth';

(async () => {

    await createConnection().then(() => {console.log('Connected to database')});

    const app = express();
    app.use(cookieParser()); // Cookie parser is a middleware, so you want it to run before everything else

    app.get('/', (_req, res) => {res.send('Hello')}); // Thats a express test route

    // This route is to recieve a refresh token and generate a new access token
    // We make our cokokie with the refresh token only work on this route
    app.post('/refresh_token', async (req, res) => {

        const token = req.cookies.jid
        
        if (!token) {
            return res.send({ok: false, accessToken: ''});
        }

        let payload: any = null;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)

        } catch (err) {
            console.log(err);
            return res.send({ok: false, accessToken: ''});
        }

        // If we hit this point, we have a token and its valid
        const user = await User.findOne({id: payload.userId});

        if (!user) {
            return res.send({ok: false, accessToken: ''});
        }

        if (user.tokenVersion !== payload.tokenVersion) {
            return res.send({ok: false, accessToken: ''});
        }

        res.cookie('jid',createRefreshToken(user),{httpOnly: true});

        return res.send({ok:true, accessToken: createAccessToken(user)});
    })


    app.use(
        '/graphql',
        graphqlHTTP(async (req, res, graphQLParams) => {
            return {
                schema: await buildSchema({resolvers: [UserResolver, EventResolver]}),
                graphiql: true,
                context: {
                    req: req,
                    res: res,
                    graphQLParams: graphQLParams
                }

            }
        })
    );


    

    app.listen(4000, () => console.log("Server started on port 4000"));



})();
