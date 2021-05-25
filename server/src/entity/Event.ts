import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, ManyToOne, ManyToMany } from 'typeorm';
import { Field, Float, Int, ObjectType } from 'type-graphql';
import { User } from './User';

@ObjectType()
@Entity()
export class Event extends BaseEntity{

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @Column()
    title!: string;

    @Field(() => String)
    @Column()
    description!: string;

    @Field(() => Float)
    @Column('float')
    price!: number;

    @Field(() => String)
    @CreateDateColumn()
    date: Date;

    @Field(() => User)
    @ManyToOne(() => User, user => user.createdEvents, {eager: true})
    creator: User;

    @Field(() => [User], {nullable: true})
    @ManyToMany(() => User, user => user.bookedEvents)
    bookedBy?: Promise<User[]>
    
}