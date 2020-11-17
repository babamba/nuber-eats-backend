import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from './entities/restaurants.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}
  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }
  createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    // const newRestaurant = new Restaurant();
    // newRestaurant.name = createRestaurantDto.name

    // 원래는 위의 내용처럼 각각의 멤버변수에 할당 해줘야하지만.
    // 밑의 방법처럼 TypeOrm 과 타입스크립트를 이용해 신용가능한 코드작성이 가능
    // create : DB는 건들지않고 인스턴스를 만들어준다.
    const newRestaurant = this.restaurants.create(createRestaurantDto);
    return this.restaurants.save(newRestaurant);
  }

  updateRestaurant({ id, data }: UpdateRestaurantDto) {
    // update() 는 db에 해당 entity가 있는지 확인하지않고 update query를 실행한다.
    return this.restaurants.update(id, { ...data });
  }
}
