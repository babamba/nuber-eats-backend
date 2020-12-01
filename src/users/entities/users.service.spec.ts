import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { UsersService } from '../users.service';
import { User } from './user.entity';
import { Verification } from './verification.entity';

// 가짜 함수
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

//type mockRepository 는 Repository의 모든 함수를 말하는데
// 이 함수들의 타입이 jest.Mock 함수 인것임
type MockRepository<T = any> = Partial<
  Record<keyof Repository<User>, jest.Mock>
>;

describe('user-service', () => {
  let service: UsersService;
  // Repository 의 모든 키를 가져온다.
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it('it should be defined', () => {
    expect(service).toBeDefined();
  });

  // 사실 DB로 접속하지 않을거고, SQL도 날리지도 않고 아무것도 안함.
  // 그럼 어떻게 할까? 그것이 mock을 사용하는 이유
  // mock 은 함수의 반환값을 속일 수 있기 때문이다.
  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
      role: 0,
    };
    it('should fail if user exist', async () => {
      // jest에게 여기있는 유저서비스의 findOne 이
      // 실제 user.serivce의 const exists = await this.users.findOne({ email });
      // 이 값을 해결할거라고 작성하는것.
      // 간략하게 findOne 결과값 자체를 임의로 만들어서 실패하는 시나리오를 만드는 것.

      // Promise가 될 것이므로 mockResolveValue 사용
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'lalala',
      });
      // jest로 값을 속였기 때문에 콘솔에도 해당 정보가 잘찍인다.

      const result = await service.createAccount(createAccountArgs);

      // 이미 유저 정보가 있으니 실패하므로 성공적
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });

    it('should create a new user', async () => {
      /**
       * 함수를 목킹하고 함수의 결과값을 임의로 작성해준다
       * 그리고 결과값에 대하여 비교하여 맞는지 체크하는 테스트코드 작성
       */

      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);

      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationsRepository.save.mockResolvedValue({
        code: 'code',
      });

      const result = await service.createAccount(createAccountArgs);

      // 이 함수가 단 한번 불릴거라고 기대한다는 의미
      // User & Verification 의 create가 같은 함수라고 생각하고 있으므로 2번발생
      // 그러므로 mockRepository 를 객체자체가 아닌 함수로 객체를 리턴해주는 형태로 만들어주면
      // 각자 다른 mockRepository를 가지게 됨으로 해결
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);

      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
    };

    it('should fail if user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({
        ok: false,
        error: 'User not Found',
      });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)), // Promise를 반환하는 mock function
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Wrong password',
      });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)), // Promise를 반환하는 mock function
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      //console.log(result);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));

      expect(result).toEqual({
        ok: true,
        token: 'signed-token-baby',
      });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: "Can't log user in",
      });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('should find an existing user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);

      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });

    it('should fail if no user is found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: false,
        error: 'User Not Found',
      });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'bs@old.com',
        verified: true,
      };

      const editProfileArgs = {
        userId: 1,
        input: { email: 'bs@new.com' },
      };

      const newVerification = {
        code: 'code',
      };

      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerification);
      verificationsRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      );

      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        newVerification,
      );
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'new.password' },
      };

      usersRepository.findOne.mockResolvedValue({ password: 'old' });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: 'test@test.com' });
      expect(result).toEqual({
        ok: false,
        error: 'Could not update profile.',
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };
      verificationsRepository.findOne.mockResolvedValue(mockedVerification);

      const result = await service.verifyEmail('');

      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });

      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      );

      expect(result).toEqual({ ok: true });
    });

    it('should fail on verification not found', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Verification not found' });
    });

    it('should fail on exception', async () => {
      verificationsRepository.findOne.mockReturnValue(new Error());
      const result = await service.verifyEmail('');
      expect(result).toEqual({
        ok: false,
        error: 'Could not verify Email.',
      });
    });
  });
});
