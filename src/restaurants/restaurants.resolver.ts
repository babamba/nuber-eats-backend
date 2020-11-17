import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from './entities/restaurants.entity';
import { RestaurantsService } from './restaurants.service';

@Resolver(of => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}
  @Query(returns => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantsService.getAll();
  }

  @Mutation(returns => Boolean)
  async createRestaurant(
    // ArgsType
    @Args('input') createRestaurantDto: CreateRestaurantDto,
    // InputType
    // @Args('createRestaurant') createRestaurantDto: CreateRestaurantDto,
    // @Args('name') name: string,
    // @Args('isVegan') isVegan: boolean,
    // @Args('address') address: string,
    // @Args('ownerName') ownerName: string,
  ): Promise<boolean> {
    try {
      await this.restaurantsService.createRestaurant(createRestaurantDto);
      return true;
    } catch (err) {
      console.log('err : ', err);
      return false;
    }
    // console.log(createRestaurantDto);
    // return true;
  }

  @Mutation(returns => Boolean)
  async updateRestaurant(
    // @Args('id') id: number,
    // @Args('data') data: UpdateRestaurantDto,
    @Args('input') updateRestaurant: UpdateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantsService.updateRestaurant(updateRestaurant);
      return true;
    } catch (err) {
      console.log('err : ', err);
      return false;
    }
  }
}
