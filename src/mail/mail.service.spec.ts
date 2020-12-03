import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';

import got from 'got';
import * as Formdata from 'form-data';

/**
 * Jest에서 npm Module을 mock으로 호출하면
 * mock Function 으로 만들어 준다.
 */
jest.mock('got');
jest.mock('form-data');

const TEST_DOMAIN = 'test-domain';

describe('mail-service', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apikey',
            domain: TEST_DOMAIN,
            fromEmail: 'test-fromEmail',
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code',
      };

      // 실제 함수를 다른곳에서 테스트해야하는데 jest.fn() 으로 mocking 한다면 테스트할수없게된다.
      // sendEmail이 호출되었을 때 ,
      // 콜백 시점에서 결과를 가로채는 jest.spyOn 함수를 통해
      // mockImplementation(나만의 구현)을 추가할 수 있다.
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);

      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email',
        'verify-email',
        [
          { key: 'code', value: sendVerificationEmailArgs.code },
          { key: 'username', value: sendVerificationEmailArgs.email },
        ],
      );
    });
  });

  describe('sendEmail', () => {
    it('should call sendEmail', async () => {
      const ok = await service.sendEmail('', '', []);

      // 클래스를 spyOn 하는법.
      // 실제코드에서 new를 통하여 인스턴스를 만들기 때문에
      // prototype에 해당 메서드가 있을 것.
      const formSpy = jest.spyOn(Formdata.prototype, 'append');
      expect(formSpy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );

      expect(ok).toEqual(true);
    });

    it('files on Error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const ok = await service.sendEmail('', '', []);
      expect(ok).toEqual(false);
    });
  });
});
