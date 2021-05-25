//import { Event } from 'src/entity/Event';
import { Field, InputType, Int, ObjectType } from 'type-graphql';
//import { Event } from '../../entity/Event';


@InputType()
export class UserInput {

    @Field(() => String)
    email!: string;

    @Field(() => String)
    password!: string;

}

@ObjectType()
@InputType()
export class AuthData {

    @Field(() => Int)
    userId: number;

    @Field(() => String)
    token: string;

    @Field(() => Int)
    tokenExpiration: number;
}