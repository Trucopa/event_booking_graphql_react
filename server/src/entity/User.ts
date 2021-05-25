import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { Event } from './Event';

@ObjectType()
@Entity()
export class User extends BaseEntity {

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @Column({unique: true})
    email!: string;

    @Column()
    password!: string;

    @Field(() => [Event], {nullable: true})
    @OneToMany(() => Event, createdEvent => createdEvent.creator)
    createdEvents?: Promise<Event[]>;

    @Field(() => [Event], {nullable: true})
    @ManyToMany(() => Event,  event => event.bookedBy)
    @JoinTable()
    bookedEvents?: Promise<Event[]>;

    // This is a colum for token management only
    @Column('int', {default: 0})
    tokenVersion: number;

}
