import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import { LoginInput } from './dto/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dto/verify-email.dto';
import { UserProfileOutput } from './dto/user-profile.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verfications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });

      if (exists) {
        // make error
        return { ok: false, error: 'There is a user with that email already' };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verfications.save(
        this.verfications.create({
          user,
        }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (error) {
      // console.log('error : ', error);
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );
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
      //console.log('user : ', user);
      //const token = jwt.sign({ id: user.id }, this.config.get('PRIVATE_KEY'));
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: "Can't log user in",
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'User Not Found',
      };
    }
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
  ): Promise<EditProfileOutput> {
    // return this.users.update(userId, { ...editProfileInput });
    try {
      const user = await this.users.findOne(userId);
      if (email) {
        user.email = email;
        user.verified = false;
        await this.verfications.delete({ user: { id: user.id } });
        const verification = await this.verfications.save(
          this.verfications.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not update profile.',
      };
    }

    //return this.users.save(user);
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verfications.findOne(
        { code },
        // TypeOrm 에서 ralation Ship을 다룰때 해당 옵션을 통해 관계구조를 사용할 수 있다
        // { loadRelationIds: true }, // relation ship 관계일때 id 속성만 필요 할 때
        { relations: ['user'] }, // relation ship 관계일때 연결된 데이터가 필요 할 때
      );
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verfications.delete(verification.id);
        return {
          ok: true,
        };
      }
      return {
        ok: false,
        error: 'Verification not found',
      };
    } catch (error) {
      // console.log('error : ', error);
      return {
        ok: false,
        error: 'Could not verify Email.',
      };
    }
  }
}
