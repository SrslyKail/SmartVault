
#### Update prisma client (autogenerate code for Typescript types, methods, etc)
`npx prisma generate`

- Purpose: Whenever you make changes to your Prisma schema file, you also need to update the Prisma Client (contains Typescript types of the model schema, methods, etc). You can do this by running the prisma generate command.

#### Create Migration
`npx prisma migrate dev`

- Purpose: This command generates and applies a new migration based on your Prisma schema changes. It creates migration files that keep a history of changes.
- Use Case: Use this when you want to maintain a record of database changes, which is essential for production environments or when working in teams. It allows for version control of your database schema.
- Benefits: This command also includes checks for applying migrations in a controlled manner, ensuring data integrity.

#### Apply Latest Migration (Prisma schema) to Postgres DB
`npx prisma db push`

- Purpose: This command is used to push your current Prisma schema to the database directly. It applies any changes you've made to your schema without creating migration files.
- Use Case: It’s particularly useful during the development phase when you want to quickly sync your database schema with your Prisma schema without worrying about migration history.
- Caution: It can overwrite data if your schema changes affect existing tables or columns, so it’s best for early-stage development or prototyping.

### Visualize Postgres Database Via prisma Studio
`npx prisma studio`