import { Controller, Post, Body, Param, Delete, Patch, Get, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';

// La ruta base para todos los endpoints en este controlador será '/api/affiliates'
@Controller('api/affiliates')
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  /**
   * Endpoint para crear o actualizar un afiliado (Upsert).
   * Se usa el verbo POST, pero la lógica del servicio maneja ambos casos.
   * PATCH también se enruta al mismo método de servicio para flexibilidad del cliente.
   * @param createAffiliateDto - El cuerpo de la petición con los datos del afiliado.
   */
  @Post()
  @HttpCode(HttpStatus.OK) // Devolvemos 200 OK en lugar de 201 Created para reflejar el "upsert"
  createOrUpdate(@Body() createAffiliateDto: CreateAffiliateDto) {
    return this.affiliatesService.upsert(createAffiliateDto);
  }

  @Patch(':uuid') // El uuid en el path es opcional, la lógica se basa en el body
  @Put(':uuid')
  update(@Body() createAffiliateDto: CreateAffiliateDto) {
    // Reutilizamos el DTO y el método de servicio
    return this.affiliatesService.upsert(createAffiliateDto);
  }

  /**
   * Endpoint para obtener todos los afiliados.
   */
  @Get()
  findAll() {
    return this.affiliatesService.findAll();
  }

  /**
   * Endpoint para obtener un único afiliado por su UUID.
   * @param uuid - El UUID pasado como parámetro en la URL.
   */
  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.affiliatesService.findOne(uuid);
  }

  /**
   * Endpoint para eliminar un afiliado.
   * @param uuid - El UUID pasado como parámetro en la URL.
   */
  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT) // Estándar HTTP para una eliminación exitosa sin respuesta.
  remove(@Param('uuid') uuid: string) {
    return this.affiliatesService.remove(uuid);
  }
}