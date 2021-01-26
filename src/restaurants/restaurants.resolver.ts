import {
  Resolver,
  Args,
  Mutation,
  Query,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { EditProfileOutput } from 'src/users/dto/edit-profile.dto';
import { User } from 'src/users/entities/user.entity';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dto/category.dto';
import { CreateDishInput, CreateDishOutput } from './dto/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dto/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dto/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dto/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dto/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dto/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dto/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dto/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurants.entity';
import { RestaurantsService } from './restaurants.service';

@Resolver(of => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Mutation(returns => CreateRestaurantOutput)
  @Role(['Owner'])
  // @SetMetadata('role', UserRole.Owner) // 이런식으로 resolver에 metadata를 설정하여 특정 role만 접근할 수 있도록 설정가능
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantsService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }

  @Mutation(returns => EditRestaurantOutput)
  @Role(['Owner'])
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantsService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation(returns => DeleteRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantsService.deleteRestaurant(
      owner,
      deleteRestaurantInput,
    );
  }
}

@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @ResolveField(type => Int) // Computed Field 임의의 필드를 계산해서 표현
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
  }

  @Query(type => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(type => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }

  @Query(returns => RestaurantsOutput)
  restaurants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }

  @Query(returns => RestaurantOutput)
  restaurant(
    @Args('input') restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantService.findRestaurantById(restaurantInput);
  }

  @Query(returns => SearchRestaurantOutput)
  searchRestaurant(
    @Args('input') searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurantByName(searchRestaurantInput);
  }
}

@Resolver(of => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Mutation(type => CreateDishOutput)
  @Role(['Owner'])
  createDish(
    @AuthUser() owner: User,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, createDishInput);
  }

  @Mutation(type => EditDishOutput)
  @Role(['Owner'])
  editDish(
    @AuthUser() owner: User,
    @Args('input') editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, editDishInput);
  }

  @Mutation(type => DeleteDishOutput)
  @Role(['Owner'])
  deleteDish(
    @AuthUser() owner: User,
    @Args('input') deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput);
  }
}
