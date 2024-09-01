# prisma-generator-plantuml-erd

Prisma generator to create an ER Diagram for plantuml.


You can generate the plantuml source code from the schema.prisma.

![](https://raw.githubusercontent.com/dbgso/prisma-generator-plantuml-erd/main/packages/generator/usage.png)

# example

- `schema.prisma`
  - https://raw.githubusercontent.com/dbgso/prisma-generator-plantuml-erd/main/packages/usage/prisma/schema.prisma
- generated plantuml file
  - https://raw.githubusercontent.com/dbgso/prisma-generator-plantuml-erd/main/packages/usage/prisma/example.puml
- generated image file
  - https://raw.githubusercontent.com/dbgso/prisma-generator-plantuml-erd/main/packages/usage/prisma/example/erd.svg

# usage


```bash
npm i -D prisma-generator-plantuml-erd
# or
yarn add -D prisma-generator-plantuml-erd
```

Add to your schema.prisma

```prisma
generator erd_plantuml {
  provider   = "prisma-generator-plantuml-erd"
  output = "erd.puml"
}
```

Run the generator

```
$ npx prisma generate
```

# Options

## output

The path of generated plantuml file path.
The default value is './erd.puml'

## usePhysicalTableName

If this flag is true, physical table name is used for name of table on er diagram.
The default value is false;


```
model User {
  id            String         @id

  @map("users")
}
```

If this flag is set to true, then "users" will be displayed on the diagram, otherwise "User" is displayed on the diagram.
 

## exportPerTables

If this flag is true, generate some tables 
If this flag is true, it also generate some diargrams that based on each table.
The diagrams is rendered with only the tables that related with base table.
The default value is false.

example

- all tables
  - https://raw.githubusercontent.com/dbgso/prisma-generator-plantuml-erd/main/packages/usage/prisma/example/erd.svg
- related with User table
  - https://raw.githubusercontent.com/dbgso/prisma-generator-plantuml-erd/main/packages/usage/prisma/example/User.svg
- related with Team table
  - https://raw.githubusercontent.com/dbgso/prisma-generator-plantuml-erd/main/packages/usage/prisma/example/Team.svg
  

## lineLength

You can change the length of relation line by this option.
The default value is '--'.

In the default case

```
Table1 }o--o| Table3
```

if you set this flag to '---'

```
Table1 }o---o| Table3
```

# showUniqueKeyLabel

If this flag is true, unique column is also labeled as unique key on er diagram, like `[UK]`.
The default value is false.

# lineType

This parameter is used to change the type of relation line.
You can choose from the following three options:

- `ortho`
- `polyline`
- `unset`


The default value is `ortho`.

# isShowForeignKeyOnRelation

When set to true, foreign keys will be displayed on the relation lines.
The default value is false.

# isLeftToRightDirection

When set to true, PlantUML's `left to right direction` will be specified.
The ER diagram will be drawn vertically.
This can be specified to improve the layout if the diagram becomes too wide horizontally.

# additionalPlantUMLParams

This is used when you want to specify options provided by PlantUML that are not individually prepared.
When setting multiple options, separate them with `;` as shown below, and they will be expanded line by line.

```
additionalPlantUMLParams = "scale 1280 width; hide circle;skinparam classFontColor red;skinparam classFontSize 10;skinparam classFontName Aapex;"
hide circle;skinparam classFontColor red;skinparam classFontSize 10;skinparam classFontName Aapex;
```

# markdownOutput

If this flag is set, a markdown table definition will be generated as well.

example
- https://raw.githubusercontent.com/dbgso/prisma-generator-plantuml-erd/main/packages/usage/example-tables.md


The generated Markdown file can be converted to HTML or PDF using the following Docker image.

https://github.com/dbgso/docker-markdown-to-pdf-with-figures

# markdownIncludeERD

If this flag is true, an ER diagram for each table is generated on the table definitions
The default value is false.


# asciidocOutput

If this flag is set, a asciidoc table definition will be generated as well.

example
- https://raw.githubusercontent.com/dbgso/prisma-generator-plantuml-erd/main/packages/usage/example-tables.adoc

# asciidocIncludeERD

If this flag is true, an ER diagram for each table is generated on the table definitions
The default value is false.


## Example

The example config is here.

```prisma
generator erd_plantuml {
  provider   = "prisma-generator-plantuml-erd"
  output               = "path/to/output.puml"
  lineLength           = "----"
  exportPerTables      = true
  usePhysicalTableName = false
  showUniqueKeyLabel = true
  markdownOutput       = "./example-tables.md"
  markdownIncludeERD      = true
  asciidocOutput       = "./example-tables.adoc"
  asciidocIncludeERD      = true
}
```

