import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import { LoginInput } from './dto/login.dto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dto/edit-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    // check new user
    // create user & hash the password
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        // make error
        return { ok: false, error: 'There is a user with that email already' };
      }
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (error) {
      console.log('error : ', error);
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return {
          ok: false,
          error: 'User not Found',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      //const token = jwt.sign({ id: user.id }, this.config.get('PRIVATE_KEY'));
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<User> {
    return this.users.findOne({ id });
  }

  // 로그인 된 상태가 아니라면 header에서 토큰값을 기반으로한 id를 줄수없으니
  // typeorm에서 update에서 해당 정보가 있는지 없는지 구분안하고 바로 쿼리를 실행하지만
  // 토큰이 없다면 해당 서비스는 접근조차 하지 못하니 문제없음
  // { email, password }: EditProfileInput 처럼 구조분할 형태로 작성하게되면
  // password가 없을경우 자동으로 password: undefined로 처리되기때문에
  // 구조분할을 사용하지 않는다.

  // BeforeUpdate는 특정 entity를 update해야만 트리거가 작동한다.
  // this.users.update를 할경우 특정 entity를 바라보고 있지않고, 그저 query를 실행한다.
  // this.users.save  를 할경우 만약 entity가 존재하지 않으면 insert를 하고, 이미 존재한다면 update한다.
  //async editProfile(userId: number, editProfileInput: EditProfileInput) {
  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<User> {
    // return this.users.update(userId, { ...editProfileInput });
    const user = await this.users.findOne(userId);
    if (email) {
      user.email = email;
    }
    if (password) {
      user.password = password;
    }
    return this.users.save(user);
  }
}
