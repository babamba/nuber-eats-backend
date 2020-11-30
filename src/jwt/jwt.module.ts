import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';

import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      exports: [JwtService],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        JwtService,
      ],
      //providers: [JwtService], // 밑에 내용을 함축적으로 처리해준다.
      // providers 안에 필요한 걸 전부 적어주고,
      /** providers: [
       {
            provide: JwtService,
            useClass: JwtService
        }
      providers: [
        {
            provide: 'BANANAS',
            useValue: options
        },
        JwtService
      ] 
    ], */
    };
  }
}
