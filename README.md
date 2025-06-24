<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# Modus Pampa Backend API

1. Clonar proyecto

2. ```yarn install ```

3. variables de entorno ```.env```

4. Cambiar las variables de entorno.

7. localhost ```yarn start:dev```

# Posibles servidores de postgresQL free
- Koyeb
- Neon
- Aiven
- Crunchy Data
- Supabase
- ElephantSQL


# Production Notes:

1. ```git add .```                (para indicar que subiremos toda la carpeta)
2. ```git commit -m "TAG"```      (poner nombre a la actualizacion que se subira)
3. ```git push -u origin main```  (para proceder con la actualizacion)


# Flujo de trabajo es fundamental para la salud de tu proyecto a largo plazo.

### 1\. ¿Cuándo debo realizar una migración?

Esta es la pregunta clave. La respuesta es: **necesitas una migración SÓLO cuando haces cambios que afectan la ESTRUCTURA de tu base de datos.**

En un proyecto con NestJS y TypeORM, esto se traduce casi exclusivamente a cuando modificas tus archivos de **Entidad** (`.entity.ts`).

#### **Cuándo SÍ necesitas una migración (Ejemplos):**

  * **Añadir o eliminar una propiedad/columna en un archivo `.entity.ts`:**

      * `@Column() nueva_columna: string;`

  * **Cambiar el tipo de dato de una columna:**

      * Cambiar `@Column('text')` a `@Column('int')`.

  * **Cambiar las restricciones de una columna:**

      * Añadir `{ unique: true }` o `{ nullable: true }` a un `@Column()`.

  * **Añadir o modificar relaciones entre entidades:**

      * Añadir una nueva relación `@ManyToOne` o `@OneToMany`.

  * **Cambiar el nombre de una propiedad que es una columna.**

#### **Cuándo NO necesitas una migración (Ejemplos):**

  * **Modificar archivos DTO (`.dto.ts`):** Los DTOs definen la forma de los datos que viajan por tu API (peticiones y respuestas), pero no afectan directamente la estructura de la base de datos.
  * **Modificar archivos de Servicio (`.service.ts`):** Esto es lógica de negocio. Puedes cambiar cómo buscas o guardas datos, pero mientras no cambies la *estructura* de la tabla, no necesitas una migración.
  * **Modificar archivos de Controlador (`.controller.ts`):** Esto afecta las rutas y cómo se manejan las peticiones HTTP, no la base de datos.

En resumen: **Si tocas un archivo `.entity.ts` y el cambio afecta a las tablas/columnas, necesitas una migración. Si no, no.**

### 2\. ¿Cuál es el comando que debo ejecutar?

El comando que ejecutarás en tu terminal **local** cada vez que necesites crear una de estas "listas de instrucciones" para la base de datos es `migration:generate`.

El comando completo y recomendado es:

Antes de generar la migración, ejecuta el siguiente comando en tu terminal. Este comando borrará la carpeta `dist` antigua y creará una nueva con la versión más reciente de tu código.

```bash
yarn build
```

*(Este comando está definido en los `scripts` de tu `package.json` y usualmente ejecuta `nest build`)*.



```bash
yarn typeorm migration:generate src/db/migrations/NombreDescriptivoDelCambio
```

**Desglose del comando:**

  * `yarn typeorm`: Ejecuta el script base que configuramos en tu `package.json`.
  * `migration:generate`: Es la instrucción específica para que TypeORM compare tu código con la base de datos y genere el archivo de migración.
  * `src/db/migrations/NombreDescriptivoDelCambio`: Es la ruta y el nombre del archivo que se creará. Es una **muy buena práctica** cambiar `"NombreDescriptivoDelCambio"` por algo que describa lo que hiciste.

**Ejemplos Prácticos:**

  * Si añades un campo `address` a la entidad de usuarios:

    ```bash
    yarn typeorm migration:generate src/db/migrations/AddAddressToUsers
    ```

  * Si creas una nueva entidad y tabla para "Productos":

    ```bash
    yarn typeorm migration:generate src/db/migrations/CreateProductsTable
    ```

Después de ejecutar este comando, solo tienes que hacer `commit` y `push` del nuevo archivo de migración a GitHub, y Render se encargará del resto en el despliegue. ¡Ese es todo el proceso\!