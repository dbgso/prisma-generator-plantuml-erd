# [1.7.0](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.6.0...v1.7.0) (2025-11-09)


### Bug Fixes

* configure semantic-release pkgRoot for pnpm monorepo compatibility ([#79](https://github.com/dbgso/prisma-generator-plantuml-erd/issues/79)) ([d3bae4f](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/d3bae4f0e6d6bea729d8903c0a6592cd06efac1e))
* replace @semantic-release/npm with pnpm publish to avoid npm version error ([#82](https://github.com/dbgso/prisma-generator-plantuml-erd/issues/82)) ([bacb4de](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/bacb4defa6481ac164966ebb34335cea1f7c1c11))
* use @semantic-release/exec to avoid npm version error in pnpm workspace ([#81](https://github.com/dbgso/prisma-generator-plantuml-erd/issues/81)) ([e70247a](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/e70247af141207cb046f7f23af595f7c703cfc8c))
* use working-directory instead of pkgRoot for semantic-release ([#80](https://github.com/dbgso/prisma-generator-plantuml-erd/issues/80)) ([b3b7a4c](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/b3b7a4ca6059d6abee3151a36f011ef82a5300e9))


### Features

* Add enabled option, migrate to pnpm, and achieve zero vulnerabilities ([#78](https://github.com/dbgso/prisma-generator-plantuml-erd/issues/78)) ([fe8d0ca](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/fe8d0caa164da601156d42f7669a252b173d1c68))

# [1.6.0](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.5.0...v1.6.0) (2024-09-01)


### Features

* update supported version 3 to 5 ([30ea860](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/30ea860ccf2c3ef30bf2a25caec5671536712a64))

# [1.5.0](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.4.0...v1.5.0) (2024-08-25)


### Bug Fixes

* lineType bug ([10f9b7e](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/10f9b7e073d4241beb9a28bc1c8b7b2cfd5b1ac0))


### Features

* add additionalPlantUMLParams option ([de71e64](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/de71e64076fb19492a193b3cfb6b4e89c3700931))
* add isLeftToRightDirection option ([7603339](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/760333920fe2d94e96e4cfa5859bbc4d7e638a5c))
* add lineType option ([03a0f71](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/03a0f7164ad14a4cff51de8f5153ab59aea9810a))
* add showForeignKeyOnRelation option ([585fcfb](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/585fcfbb8125fd3f4eccefef2689bba89e37d17f))

# [1.4.0](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.3.2...v1.4.0) (2024-01-28)


### Features

* add option for generate asciidoc table definition ([8b73749](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/8b73749e1d232807bd19ccc4e71c1b3272d9f536))

## [1.3.2](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.3.1...v1.3.2) (2023-11-06)


### Bug Fixes

* vulnerability ([c6d7e77](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/c6d7e777e05cab2edded38cc60171fae8e818dd5))

## [1.3.1](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.3.0...v1.3.1) (2023-11-05)


### Bug Fixes

* unique column position ([9a6ce1b](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/9a6ce1b8560739e5e82700a6beecf90a01392380))

# [1.3.0](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.2.1...v1.3.0) (2023-11-05)


### Bug Fixes

* markdown syntax error ([c408b77](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/c408b77182bbffd1f43ba75aa35978d5181f564b))


### Features

* add index info table on markdown ([e459293](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/e459293a0d47944ff70df9a247ffb82580da37b9))
* add unique column information ([5578602](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/5578602ae8dc07f955383a89da1fbad1b515072e))

## [1.2.1](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.2.0...v1.2.1) (2022-12-03)


### Bug Fixes

* option name ([c269ceb](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/c269ceb38f793d8926ca6ac2221e498a9e3517dc))

# [1.2.0](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.1.0...v1.2.0) (2022-12-03)


### Features

* create markdown with erd ([682c713](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/682c7138adb671fc16cb39e35eb780354aeb563a))

# [1.1.0](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.0.4...v1.1.0) (2022-12-03)


### Bug Fixes

* for no primary key table ([fa05157](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/fa05157188c3638f608e98ce837185e71ab6cb3f))


### Features

* option to create table definition markdown ([06a6447](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/06a6447d52b19f9b1b4010697c03da6d695df9c2))

## [1.0.4](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.0.3...v1.0.4) (2022-11-10)


### Bug Fixes

* repository url ([0f1eb76](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/0f1eb761626656d6750227d3046fb7e2950b234b))

## [1.0.3](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.0.2...v1.0.3) (2022-11-10)


### Bug Fixes

* modifier ([b1d9a44](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/b1d9a4486becf421c244adb7c7ff7fa7a73e8cf7))

## [1.0.2](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.0.1...v1.0.2) (2022-11-08)


### Bug Fixes

* package-lock.json ([#13](https://github.com/dbgso/prisma-generator-plantuml-erd/issues/13)) ([492c425](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/492c42537594c54e5e704b8cf9463cb562ee7bb2))

## [1.0.1](https://github.com/dbgso/prisma-generator-plantuml-erd/compare/v1.0.0...v1.0.1) (2022-11-08)


### Bug Fixes

* delete unnecessary code ([457fff9](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/457fff95aff5ef058f36fc5ca32149931e5e9c42))
* output default value ([62641c3](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/62641c3bcfaea875fea6f47e51a7bdd37536a0d7))

# 1.0.0 (2022-11-08)


### Bug Fixes

* divider line ([0bca83e](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/0bca83e0cdfc0a28586b231a122e76a4070e6291))
* enum relation ([883277b](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/883277bb13a8125d4165ddd53ae56f449542d912))
* npm audit ([17a5b91](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/17a5b91d87fcc042b4031722e7d023ec8bdcbe15))
* option type definition ([abfb012](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/abfb0125633e789c98535bef242585b985d2e900))
* prisma boolean config ([03da82e](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/03da82e052cbd7b495a26b5566c5b35c73e3b027))
* safe write file ([0e5166f](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/0e5166f12925da0d376a34f4d51db55cf9c915f9))


### Features

* add option to export uml per tables ([31cc2ad](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/31cc2adc87689650f9889d847231fa17ee867316))
* enum relations ([64a9b6c](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/64a9b6cab4db1a0cdcb5e4d862aab2ff593b3a19))
* implements prototyping ([c20f7b0](https://github.com/dbgso/prisma-generator-plantuml-erd/commit/c20f7b0683c2d387f0f0870623859fe4286aef72))
