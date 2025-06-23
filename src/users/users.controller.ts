import { Controller, Post, Body, Param, Delete, Patch, Get, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  upsert(@Body() createUserDto: CreateUserDto) {
    return this.usersService.upsert(createUserDto);
  }

  @Put(':uuid')
  @Patch(':uuid')
  update(@Body() createUserDto: CreateUserDto) {
    return this.usersService.upsert(createUserDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('uuid') uuid: string) {
    return this.usersService.remove(uuid);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}