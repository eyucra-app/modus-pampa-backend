import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EventsGateway } from 'src/events/events.gateway';
// En una app real, importarías bcrypt aquí
// import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly eventsGateway: EventsGateway, 
  ) {}

  async upsert(userData: CreateUserDto): Promise<UserEntity> {
    // Nota de seguridad: La contraseña debería ser hasheada aquí antes de guardarla.
    // const salt = await bcrypt.genSalt();
    // userData.password = await bcrypt.hash(userData.password, salt);
    
    // Prevenimos conflictos si el username ya existe pero el uuid es diferente
    const existing = await this.usersRepository.findOne({ where: { user_name: userData.user_name } });
    if (existing && existing.uuid !== userData.uuid) {
      throw new ConflictException(`El nombre de usuario '${userData.user_name}' ya está en uso.`);
    }

    const existingByEmail = await this.usersRepository.findOne({ where: { email: userData.email } });
    if (existingByEmail && existingByEmail.uuid !== userData.uuid) {
        throw new ConflictException(`El correo electrónico '${userData.email}' ya está en uso.`);
    }

    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);

    this.eventsGateway.emitChange('usersChanged', {
        message: `Usuario creado/actualizado: ${savedUser.uuid}`,
        uuid: savedUser.uuid
    });

    return savedUser;
  }

  async remove(uuid: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ uuid });
    if (!user) {
        throw new NotFoundException(`Usuario con UUID '${uuid}' no encontrado.`);
    }
    
    await this.usersRepository.softRemove(user);
    
    this.eventsGateway.emitChange('usersChanged', {
        action: 'delete',
        message: `Usuario eliminado: ${uuid}`,
        uuid: uuid
    });
  }

  findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  // Podrías añadir un método para el login aquí
  async validateUser(user_name: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOneBy({ user_name });
    // const passwordMatches = await bcrypt.compare(pass, user.password);
    if (user && user.password_hash === pass) { // Reemplazar con la comparación de hash
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async update(uuid: string, updateData: UpdateUserDto): Promise<UserEntity> {
    const user = await this.usersRepository.preload({
      uuid: uuid,
      ...updateData,
    });

    if (!user) {
      throw new NotFoundException(`Usuario con UUID '${uuid}' no encontrado.`);
    }
    const updatedUser = await this.usersRepository.save(user);

    this.eventsGateway.emitChange('usersChanged', {
        message: `Usuario actualizado: ${updatedUser.uuid}`,
        uuid: updatedUser.uuid
    });

    return updatedUser;
  }

}