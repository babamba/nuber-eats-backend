import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType() // 공통이라도 ObjectType을 선언해줘야함. 상속하는 부분도 선언
export class CoreOutput {
  @Field(type => String, { nullable: true })
  error?: string;
  @Field(type => Boolean)
  ok: boolean;
}
