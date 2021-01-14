import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dto/pagination.dto';
import { Restaurant } from '../entities/restaurants.entity';

@InputType()
export class SearchRestaurantInput extends PaginationInput {
  @Field(type => String)
  query: string;
}

@ObjectType()
export class SearchRestaurantOutput extends PaginationOutput {
  @Field(type => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
