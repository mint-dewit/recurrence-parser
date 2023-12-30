# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.5.4](https://github.com/baltedewit/recurrence-parser/compare/0.5.3...0.5.4) (2023-12-30)


### Bug Fixes

* getWeek takes monday as day 1 ([2f56a64](https://github.com/baltedewit/recurrence-parser/commit/2f56a649f4fe5cf244c017b728422445a4d2b01d))



## [0.5.3](https://github.com/baltedewit/recurrence-parser/compare/0.5.2...0.5.3) (2020-10-24)


### Bug Fixes

* handle items without any execution time better ([4e3eca2](https://github.com/baltedewit/recurrence-parser/commit/4e3eca26ee19dc3e77f8c80d632d7e20edd601cf))
* sunday + any other weekday ([e5d26ba](https://github.com/baltedewit/recurrence-parser/commit/e5d26baee5cc41409c954e6d327904d94d23e30b))



## [0.5.2](https://github.com/baltedewit/recurrence-parser/compare/0.5.1...0.5.2) (2020-09-26)


### Bug Fixes

* sunday as a day option ([9424ddb](https://github.com/baltedewit/recurrence-parser/commit/9424ddbb9e0aafd96b38c770fbea090e5cd8278c))



## [0.5.1](https://github.com/baltedewit/recurrence-parser/compare/0.5.0...0.5.1) (2020-09-24)


### Bug Fixes

* return all elements with same start time ([d998443](https://github.com/baltedewit/recurrence-parser/commit/d998443f5d98c6e1190abefc69a3eaad48655105))
* start next day at midnight ([e83285c](https://github.com/baltedewit/recurrence-parser/commit/e83285ca086d4c6b4101f3f9c08aba7af1f24297))
* week numbers according to ISO spec ([826052e](https://github.com/baltedewit/recurrence-parser/commit/826052e0e2eaec8728deed3acb567cd8b28a8003))



# [0.5.0](https://github.com/baltedewit/recurrence-parser/compare/0.4.2...0.5.0) (2020-07-27)


### Bug Fixes

* skip files without duration ([023d69f](https://github.com/baltedewit/recurrence-parser/commit/023d69fbb55341d96659ce6004a940269f5d8c7c))


### Features

* folder items sorting ([c81492b](https://github.com/baltedewit/recurrence-parser/commit/c81492bb4c59c7fa35c2bb112b6dbd7c277440b9))



## [0.4.2](https://github.com/baltedewit/recurrence-parser/compare/0.4.1...0.4.2) (2020-04-10)


### Bug Fixes

* add safe guards for broken schedules ([404aa38](https://github.com/baltedewit/recurrence-parser/commit/404aa386b2c3a64715affb803e059cd2d776da3a))
* filter out bad data ([cc0c472](https://github.com/baltedewit/recurrence-parser/commit/cc0c472a0650ce5140bd31a3a3eb1bd83e397b6c))



## [0.4.1](https://github.com/baltedewit/recurrence-parser/compare/0.4.0...0.4.1) (2020-02-21)


### Bug Fixes

* folder element outputs files ([9726e5d](https://github.com/baltedewit/recurrence-parser/commit/9726e5de620b65923c1bb01f81182b79129cf880))



# [0.4.0](https://github.com/baltedewit/recurrence-parser/compare/0.3.0...0.4.0) (2020-02-21)


### Bug Fixes

* duration in ms & correct structure of tl obj ([99ca3c5](https://github.com/baltedewit/recurrence-parser/commit/99ca3c5eb9f500788158791fa33db408f2ebda03))
* typo ([bbcaf10](https://github.com/baltedewit/recurrence-parser/commit/bbcaf109c4042da6de1840a442dab218b3f74a6e))


### Features

* live inputs ([3857d16](https://github.com/baltedewit/recurrence-parser/commit/3857d16293f8d9e0056a9e8c1860e4c55e2b093f))
* readable timelines ([f278c10](https://github.com/baltedewit/recurrence-parser/commit/f278c10ae9177208058486fee8f5e44e842182d7))



# [0.3.0](https://github.com/baltedewit/recurrence-parser/compare/0.2.8...0.3.0) (2019-10-18)


### Features

* updated for tsr and use classes ([e425323](https://github.com/baltedewit/recurrence-parser/commit/e425323637b1f0d31393f7fd1e16fa07ef15760b))



## [0.2.8](https://github.com/baltedewit/recurrence-parser/compare/0.2.7...0.2.8) (2019-10-14)


### Bug Fixes

* ignore parsing days if all days are allowed ([6d0c2cb](https://github.com/baltedewit/recurrence-parser/commit/6d0c2cb91617a5a1c9e1f0649f968761458f2690))



## [0.2.7](https://github.com/baltedewit/recurrence-parser/compare/0.2.6...0.2.7) (2019-04-04)


### Bug Fixes

* rounding error causing inf loop ([8352643](https://github.com/baltedewit/recurrence-parser/commit/8352643))



## [0.2.6](https://github.com/baltedewit/recurrence-parser/compare/0.2.5...0.2.6) (2019-04-04)


### Bug Fixes

* getWeek should account for timezones ([828d34a](https://github.com/baltedewit/recurrence-parser/commit/828d34a))



<a name="0.2.5"></a>
## [0.2.5](https://github.com/baltedewit/recurrence-parser/compare/0.2.4...0.2.5) (2019-01-24)


### Bug Fixes

* date ranges ([80478b1](https://github.com/baltedewit/recurrence-parser/commit/80478b1))



<a name="0.2.4"></a>
## [0.2.4](https://github.com/baltedewit/recurrence-parser/compare/0.2.3...0.2.4) (2019-01-06)


### Bug Fixes

* if there are no days of the week left, wrap around to next week ([aac2f3b](https://github.com/baltedewit/recurrence-parser/commit/aac2f3b))
* ignore empty arrays in the schedule ([11f2a0b](https://github.com/baltedewit/recurrence-parser/commit/11f2a0b))
* root level elements keep their own starttime ([0933f0e](https://github.com/baltedewit/recurrence-parser/commit/0933f0e))



<a name="0.2.3"></a>
## [0.2.3](https://github.com/baltedewit/recurrence-parser/compare/0.2.2...0.2.3) (2019-01-05)


### Bug Fixes

* midnight of the first day of the week is the next week ([18ffe1f](https://github.com/baltedewit/recurrence-parser/commit/18ffe1f))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/baltedewit/recurrence-parser/compare/0.2.1...0.2.2) (2019-01-05)


### Bug Fixes

* correct day of the week parsing ([7b3daa0](https://github.com/baltedewit/recurrence-parser/commit/7b3daa0))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/baltedewit/recurrence-parser/compare/0.2.0...0.2.1) (2019-01-04)


### Bug Fixes

* various fixes in the parser logic for days and empty timelines ([2f14137](https://github.com/baltedewit/recurrence-parser/commit/2f14137))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/baltedewit/recurrence-parser/compare/0.1.0...0.2.0) (2018-12-27)


### Features

* add muted property onto timeline ([95deb46](https://github.com/baltedewit/recurrence-parser/commit/95deb46))
* improve interfaces ([5b0afd9](https://github.com/baltedewit/recurrence-parser/commit/5b0afd9))



<a name="0.1.0"></a>
# 0.1.0 (2018-12-17)


### Bug Fixes

* improved logging, pass midnight in algo ([f4c1417](https://github.com/baltedewit/recurrence-parser/commit/f4c1417))


### Features

* Basic Parser ([3e5fb91](https://github.com/baltedewit/recurrence-parser/commit/3e5fb91))



<a name="0.5.1"></a>
## [0.5.1](https://bitbucket.org/superflytv/node-boilerplate/compare/0.5.0...0.5.1) (2018-02-25)


### Bug Fixes

* remove auto-deploy to npm ([5515b71](https://bitbucket.org/superflytv/node-boilerplate/commits/5515b71))



<a name="0.5.0"></a>
# [0.5.0](https://bitbucket.org/superflytv/node-boilerplate/compare/0.4.6...0.5.0) (2018-02-25)


### Bug Fixes

* adding release for one final publication ([7f11b78](https://bitbucket.org/superflytv/node-boilerplate/commits/7f11b78))
* Cleaning up repository ([ba7cafc](https://bitbucket.org/superflytv/node-boilerplate/commits/ba7cafc))
* cleanup ([562fb0c](https://bitbucket.org/superflytv/node-boilerplate/commits/562fb0c))


### Features

* Disable automatic rollout to NPM for now ([18dd79f](https://bitbucket.org/superflytv/node-boilerplate/commits/18dd79f))



<a name="0.4.6"></a>
## [0.4.6](https://github.com/superflytv/node-boilerplate/compare/0.4.5...0.4.6) (2018-02-25)


### Bug Fixes

* add tslib ([2447570](https://github.com/superflytv/node-boilerplate/commit/2447570))



<a name="0.4.5"></a>
## [0.4.5](https://github.com/superflytv/node-boilerplate/compare/0.4.4...0.4.5) (2018-02-25)


### Bug Fixes

* send coverage before release ([b53c1aa](https://github.com/superflytv/node-boilerplate/commit/b53c1aa))



<a name="0.4.4"></a>
## [0.4.4](https://github.com/superflytv/node-boilerplate/compare/0.4.3...0.4.4) (2018-02-25)


### Bug Fixes

* auto rollout to npm on master branch ([ef5d68f](https://github.com/superflytv/node-boilerplate/commit/ef5d68f))



<a name="0.4.3"></a>
## [0.4.3](https://github.com/superflytv/node-boilerplate/compare/0.4.2...0.4.3) (2018-02-25)


### Bug Fixes

* only allow spec.ts files ([027b4f2](https://github.com/superflytv/node-boilerplate/commit/027b4f2))
* use npm for npm deploy, for now ([0bb1911](https://github.com/superflytv/node-boilerplate/commit/0bb1911))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/superflytv/node-boilerplate/compare/0.4.1...0.4.2) (2018-02-25)


### Bug Fixes

* add ssh key to npm step for ssh ([8ca98f5](https://github.com/superflytv/node-boilerplate/commit/8ca98f5))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/superflytv/node-boilerplate/compare/v0.4.0...v0.4.1) (2018-02-25)


### Bug Fixes

* Set skip ci in auto-commit message and rename tag releases ([1338bd0](https://github.com/superflytv/node-boilerplate/commit/1338bd0))



<a name="0.4.0"></a>
# 0.4.0 (2018-02-25)


### Bug Fixes

* add ssh key to release build ([00a03c2](https://github.com/superflytv/node-boilerplate/commit/00a03c2))
* Auto-release on circleci ([64ba8d7](https://github.com/superflytv/node-boilerplate/commit/64ba8d7))
* Bugfix and add not strict for bitbucket ([0d5f60b](https://github.com/superflytv/node-boilerplate/commit/0d5f60b))
* casing issue ([71a7295](https://github.com/superflytv/node-boilerplate/commit/71a7295))
* changing to .org ([746f766](https://github.com/superflytv/node-boilerplate/commit/746f766))
* changing to .org ([b0837bc](https://github.com/superflytv/node-boilerplate/commit/b0837bc))
* Explicit coverage repoting ([1aac204](https://github.com/superflytv/node-boilerplate/commit/1aac204))
* indent style on yaml files ([3b3582b](https://github.com/superflytv/node-boilerplate/commit/3b3582b))
* indentation and paths wrong ([cad01af](https://github.com/superflytv/node-boilerplate/commit/cad01af))
* rearange commands ([c7ad4c1](https://github.com/superflytv/node-boilerplate/commit/c7ad4c1))
* Reordering workflow ([c912127](https://github.com/superflytv/node-boilerplate/commit/c912127))
* set correct ssh fingerprint ([616fc49](https://github.com/superflytv/node-boilerplate/commit/616fc49))
* Set git push command ([b825993](https://github.com/superflytv/node-boilerplate/commit/b825993))
* Set orgname ([9eb70e3](https://github.com/superflytv/node-boilerplate/commit/9eb70e3))
* setting git config ([a61c929](https://github.com/superflytv/node-boilerplate/commit/a61c929))
* Temporarily remove gh-pages publish ([c1cd735](https://github.com/superflytv/node-boilerplate/commit/c1cd735))
* use knownhost in stead of ssh config ([e432a10](https://github.com/superflytv/node-boilerplate/commit/e432a10))
* use knownhost in stead of ssh config ([3f37f75](https://github.com/superflytv/node-boilerplate/commit/3f37f75))


### Features

* full npm release cycle ([955863a](https://github.com/superflytv/node-boilerplate/commit/955863a))
* Initial boiler plate ([fbd16db](https://github.com/superflytv/node-boilerplate/commit/fbd16db))
* rename package for npm release ([53ac25c](https://github.com/superflytv/node-boilerplate/commit/53ac25c))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/superflytv/node-boilerplate/compare/v0.2.2...v0.3.0) (2018-02-25)


### Bug Fixes

* Auto-release on circleci ([64ba8d7](https://github.com/superflytv/node-boilerplate/commit/64ba8d7))
* Explicit coverage repoting ([1aac204](https://github.com/superflytv/node-boilerplate/commit/1aac204))
* indent style on yaml files ([3b3582b](https://github.com/superflytv/node-boilerplate/commit/3b3582b))


### Features

* full npm release cycle ([955863a](https://github.com/superflytv/node-boilerplate/commit/955863a))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/superflytv/node-boilerplate/compare/v0.2.1...v0.2.2) (2018-02-24)



<a name="0.2.1"></a>
## [0.2.1](https://github.com/superflytv/node-boilerplate/compare/v0.2.0...v0.2.1) (2018-02-24)


### Bug Fixes

* Set orgname ([9eb70e3](https://github.com/superflytv/node-boilerplate/commit/9eb70e3))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/superflytv/node-boilerplate/compare/v0.1.0...v0.2.0) (2018-02-24)


### Features

* rename package for npm release ([53ac25c](https://github.com/superflytv/node-boilerplate/commit/53ac25c))



<a name="0.1.0"></a>
# 0.1.0 (2018-02-24)


### Bug Fixes

* casing issue ([71a7295](https://github.com/superflytv/node-boilerplate/commit/71a7295))


### Features

* Initial boiler plate ([fbd16db](https://github.com/superflytv/node-boilerplate/commit/fbd16db))
