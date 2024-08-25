# Tables
- [User](#user)
  - ユーザ
- [Team](#team)
  - Teams
- [Company](#company)
  - 会社
- [Role](#role)

# ER diagram
```plantuml
@startuml erd
skinparam linetype ortho
enum "NotificationType" as NotificationType {
  newPosts
  newComments
  newFollowers
  reply
  heartOnPost
  heartOnComment
  heartOnReply
}
enum "Language" as Language {
  Typescript
  Javascript
  Rust
  Go
  Python
  Cpp
}
enum "State" as State {
  Active
  Pending
  Banned
}
entity "User\nユーザ" as User {
+ id [PK] : Int 
--
  * email : [UK] String
  name : String
  * languages : Language
  * created_at : DateTime
  * updated_at : DateTime
  # team_id : [FK] Team
  # companyId : [FK] Company
  # roleId : [FK] Role
}

entity "Team\nTeams" as Team {
+ id [PK] : String 
--
  * created_at : DateTime
  * updated_at : DateTime
}

entity "Company\n会社" as Company {
+ id [PK] : String 
--
  * state : State
  * created_at : DateTime
  * updated_at : DateTime
}

entity "Role" as Role {
+ id [PK] : String 
--
  * name : String
}

' Relations
User }o----|| Team: team_id
User }o----o| Company: companyId
User }o----o| Role: roleId
' ManyToMany Relations
Team }o----o{ Company
' enum relations
User |o----|{ Language
Company |o----|| State
@enduml
```
# User

## Description
ユーザ

## Columns

|Name | Type | Default | Nullable | Unique | Children | Parent | Comment|
|--- | --- | --- | --- | --- | --- | --- | ---|
|id | Int | autoincrement | false | true |  |  | |
|email | String |  | false | true |  |  | |
|name | String |  | true | false |  |  | |
|languages | Language |  | false | false |  |  | |
|created_at | DateTime | now | false | false |  |  | @HideField({ output: false, input: true })|
|updated_at | DateTime |  | false | false |  |  | @HideField({ output: false, input: true })|
|team_id | String |  | false | false |  | [Team](#team) | |
|companyId | String |  | true | false |  | [Company](#company) | |
|roleId | String |  | true | false |  | [Role](#role) | |

# Indexes

|columns | index type | index name|
|--- | --- | ---|
|team_id,companyId | unique | |

## ER diagram

```plantuml
@startuml User
skinparam linetype ortho
enum "Language" as Language {
  Typescript
  Javascript
  Rust
  Go
  Python
  Cpp
}
entity "User\nユーザ" as User {
+ id [PK] : Int 
--
  * email : [UK] String
  name : String
  * languages : Language
  * created_at : DateTime
  * updated_at : DateTime
  # team_id : [FK] Team
  # companyId : [FK] Company
  # roleId : [FK] Role
}

entity "Team\nTeams" as Team {
+ id [PK] : String 
--
  * created_at : DateTime
  * updated_at : DateTime
}

entity "Company\n会社" as Company {
+ id [PK] : String 
--
  * state : State
  * created_at : DateTime
  * updated_at : DateTime
}

entity "Role" as Role {
+ id [PK] : String 
--
  * name : String
}

' Relations
User }o----|| Team: team_id
User }o----o| Company: companyId
User }o----o| Role: roleId
' ManyToMany Relations
Team }o----o{ Company
' enum relations
User |o----|{ Language
@enduml
```
# Team

## Description
Teams

## Columns

|Name | Type | Default | Nullable | Unique | Children | Parent | Comment|
|--- | --- | --- | --- | --- | --- | --- | ---|
|id | String | uuid | false | true | [User](#user), [Company](#company) |  | |
|created_at | DateTime | now | false | false |  |  | @HideField({ output: false, input: true })|
|updated_at | DateTime |  | false | false |  |  | @HideField({ output: false, input: true })|

## ER diagram

```plantuml
@startuml Team
skinparam linetype ortho
entity "User\nユーザ" as User {
+ id [PK] : Int 
--
  * email : [UK] String
  name : String
  * languages : Language
  * created_at : DateTime
  * updated_at : DateTime
  # team_id : [FK] Team
  # companyId : [FK] Company
  # roleId : [FK] Role
}

entity "Team\nTeams" as Team {
+ id [PK] : String 
--
  * created_at : DateTime
  * updated_at : DateTime
}

entity "Company\n会社" as Company {
+ id [PK] : String 
--
  * state : State
  * created_at : DateTime
  * updated_at : DateTime
}

' Relations
User }o----|| Team: team_id
User }o----o| Company: companyId
' ManyToMany Relations
Team }o----o{ Company
' enum relations
@enduml
```
# Company

## Description
会社

## Columns

|Name | Type | Default | Nullable | Unique | Children | Parent | Comment|
|--- | --- | --- | --- | --- | --- | --- | ---|
|id | String | uuid | false | true | [User](#user), [Team](#team) |  | |
|state | State |  | false | false |  |  | |
|created_at | DateTime | now | false | false |  |  | @HideField({ output: false, input: true })|
|updated_at | DateTime |  | false | false |  |  | @HideField({ output: false, input: true })|

## ER diagram

```plantuml
@startuml Company
skinparam linetype ortho
enum "State" as State {
  Active
  Pending
  Banned
}
entity "User\nユーザ" as User {
+ id [PK] : Int 
--
  * email : [UK] String
  name : String
  * languages : Language
  * created_at : DateTime
  * updated_at : DateTime
  # team_id : [FK] Team
  # companyId : [FK] Company
  # roleId : [FK] Role
}

entity "Team\nTeams" as Team {
+ id [PK] : String 
--
  * created_at : DateTime
  * updated_at : DateTime
}

entity "Company\n会社" as Company {
+ id [PK] : String 
--
  * state : State
  * created_at : DateTime
  * updated_at : DateTime
}

' Relations
User }o----|| Team: team_id
User }o----o| Company: companyId
' ManyToMany Relations
Team }o----o{ Company
' enum relations
Company |o----|| State
@enduml
```
# Role

## Description


## Columns

|Name | Type | Default | Nullable | Unique | Children | Parent | Comment|
|--- | --- | --- | --- | --- | --- | --- | ---|
|id | String | uuid | false | true | [User](#user) |  | |
|name | String |  | false | false |  |  | |

## ER diagram

```plantuml
@startuml Role
skinparam linetype ortho
entity "User\nユーザ" as User {
+ id [PK] : Int 
--
  * email : [UK] String
  name : String
  * languages : Language
  * created_at : DateTime
  * updated_at : DateTime
  # team_id : [FK] Team
  # companyId : [FK] Company
  # roleId : [FK] Role
}

entity "Role" as Role {
+ id [PK] : String 
--
  * name : String
}

' Relations
User }o----o| Role: roleId
' ManyToMany Relations
' enum relations
@enduml
```