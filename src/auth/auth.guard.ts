import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// CanActivate 는 함수고 true 를 리턴하면 request를 진행시키고 , false면 request를 멈추게한다.

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    // console.log('context : ', context);
    //  기존에 제공해주던 http context와 graphql context 는 다르기때문에 변환 해 줄 필요가 있다.
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    //console.log('gqlContext : ', user);
    if (!user) {
      return false;
    }
    return true;
  }
}
