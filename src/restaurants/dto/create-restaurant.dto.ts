import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { Restaurant } from '../entities/restaurants.entity';

//InputType 은 그저 하나의 오브젝트로 보면됨
// ArgsType 은 이것들을 분리된 argument로 정의할 수 있게 해준다.

//@InputType()
// @ArgsType()
@InputType()
// 인풋타입으로 해당 엔티티에서 id를 제외한 나머지를 포함하여 상속받는다.
// 하지만 상속받을 객체가 ObjectType이기 때문에 타입이 다르므로 에러가 발생.
// 원하는 타입을 세번째 인자로 넣어준다.
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field(type => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
// export class CreateRestaurantDto {
//   @Field(type => String)
//   @IsString()
//   @Length(5, 10) // min, max
//   name: string;

//   @Field(type => Boolean)
//   @IsBoolean()
//   isVegan: boolean;

//   @Field(type => String)
//   @IsString()
//   address: string;

//   @Field(type => String)
//   @IsString()
//   ownerName: string;
// }
