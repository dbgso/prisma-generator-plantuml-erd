# prisma-generator-plantuml-erd

> This generator was bootstraped using [create-prisma-generator](https://github.com/YassinEldeeb/create-prisma-generator)


# usage


```
npm i -D prisma-generator-plantuml-erd
# or
yarn add -D prisma-generator-plantuml-erd
```

Add to your schema.prisma

```
generator erd_plantuml {
  provider   = "prisma-generator-plantuml-erd"
  output = "erd.puml"
}
```

# Versions

This generator only support prisma3.
If you use the version greater than 4, this plugin is not work.

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

If this flag is set to true, then "users" will be displayed on the diagram, otherwise "user" is displayed on the diagram.
 

## exportPerTables

If this flag is true, generate some tables 
If this flag is true, it also generate some diargrams that based on each table.
The diagrams is rendered with only the tables that related with base table.


## Example

The example config is here.

```
  output: "path/to/output.puml",
  usePhysicalTableName: true,
  lineLength: "---"
  exportPerTables: true
```

