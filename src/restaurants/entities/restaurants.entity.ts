import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Category } from './category.entity';
import { Dish } from './dish.entity';
@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  // 해당 엔티티 명세로 인해
  // database migration
  // graphql resolver
  // type validation
  // 을 처리하기때문에 3번씩 테스트하는것이 익숙해져야함.

  @Field(type => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(type => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(type => String)
  @Column()
  address: string;

  @Field(type => Category, { nullable: true })
  @ManyToOne(
    type => Category,
    category => category.restaurants,
    { nullable: true, onDelete: 'SET NULL' },
  )
  category: Category;

  @Field(type => User)
  @ManyToOne(
    type => User,
    user => user.restaurants,
    { onDelete: 'CASCADE' },
  )
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(type => [Dish])
  @OneToMany(
    type => Dish,
    dish => dish.restaurant,
  )
  menu: Dish[];

  // @PrimaryGeneratedColumn()
  // @Field(type => Number)
  // id: number;

  // @Field(type => Boolean, { defaultValue: true }) // graphql 스키마에서 해당 필드의 defaultVlaue가 true 라는것
  // @Column({ default: true }) // database 에서 해당 필드가 defaultVlaue가 true 라는것
  // @IsOptional() // validation은 optional 이고, (필수가 아님)
  // @IsBoolean() // 만약 value가 있다면 boolean 이어야 한다는 것
  // isVegan?: boolean;
}
