import { Controller, Post, Body, Param, Delete, Patch, Get, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  upsert(@Body() createUserDto: CreateUserDto) {
    return this.usersService.upsert(createUserDto);
  }

  @Patch(':uuid')
  @Put(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(uuid, updateUserDto);
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