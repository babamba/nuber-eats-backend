import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

// CanActivate 는 함수고 true 를 리턴하면 request를 진행시키고 , false면 request를 멈추게한다.

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );

    //console.log('role : ', role); // 메타데이터에 role이 없다면 public(로그인 하지않은상태) 라는 뜻
    if (!roles) {
      return true;
    }
    // role이 없다면 true를 리턴, metadata가 resolver에 있으면 graphql의 ExecutionContext 에서 user 확인
    // console.log('context : ', context);
    //  기존에 제공해주던 http context와 graphql context 는 다르기때문에 변환 해 줄 필요가 있다.
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];
    console.log('user : ', user);
    if (!user) {
      // 이 지점에 왔다는건 resolver에 metadata가 설정되어있는데 user가 없다는 것
      return false;
    }

    if (roles.includes('Any')) {
      return true;
    }
    //
    return roles.includes(user.role);
  }
}
