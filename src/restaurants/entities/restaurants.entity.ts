import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Restaurant {
  // 해당 엔티티 명세로 인해
  // database migration
  // graphql resolver
  // type validation
  // 을 처리하기때문에 3번씩 테스트하는것이 익숙해져야함.

  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @Field(type => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(type => Boolean, { defaultValue: true }) // graphql 스키마에서 해당 필드의 defaultVlaue가 true 라는것
  @Column({ default: true }) // database 에서 해당 필드가 defaultVlaue가 true 라는것
  @IsOptional() // validation은 optional 이고, (필수가 아님)
  @IsBoolean() // 만약 value가 있다면 boolean 이어야 한다는 것
  isVegan?: boolean;

  @Field(type => String, { defaultValue: '강남' })
  @Column()
  address: string;
}
