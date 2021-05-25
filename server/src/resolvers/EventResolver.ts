import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Event } from '../entity/Event';
import { User } from '../entity/User';
import { EventInput } from './inputTypes/EventInput'




@Resolver()
export class EventResolver{

    @Query(() => String)
    hi(){
        return 'hello';
    }

    @Query(() => [Event])
    async events(){
        const events = await Event.find()
        return events;
    }

    @Mutation(() => Event)
    async createEvent(
        @Arg('eventInput', () => EventInput) eventInput: EventInput
    ){
        return User.findOne({where: {email: eventInput.creatorEmail}})
        .then(user => {
            if (!user){
                throw new Error("User don't Exist");
            }

            const newEvent = new Event();
            newEvent.title = eventInput.title;
            newEvent.description = eventInput.description;
            newEvent.price = eventInput.price;
            newEvent.creator = user;

            newEvent.save();
            return newEvent
        })
        .catch(err =>{
            throw err;
        })
    }
}