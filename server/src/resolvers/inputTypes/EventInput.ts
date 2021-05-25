import { Field, Float, InputType } from 'type-graphql';


@InputType()
export class EventInput {

    @Field(() => String)
    title!: string;

    @Field(() => String)
    description!: string;

    @Field(() => Float)
    price!: number;

    @Field(() => String)
    creatorEmail!: string;
}