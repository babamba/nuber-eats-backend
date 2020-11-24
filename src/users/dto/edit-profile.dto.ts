import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

//PickType이 user class에서 property를 선택하게 해주지만
// 둘다 / 둘중에 하나 를 수정할때는 Partial타입에서 PickType을 사용하는걸로.

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}
