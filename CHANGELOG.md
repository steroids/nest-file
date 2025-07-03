# Steroids Nest File

## [0.4.0](https://github.com/steroids/nest/compare/0.3.2...0.4.0) (2025-07-03)

### Features

[Migration guide](docs/MigrationGuide.md#040-2025-07-03)

- На замену декоратору FileUpload добавлен FileUploadInterceptor, у которого есть доступ к DI.
  Он обращается в FileTypeService, получает конфиг для загружаемого типа файла и валидирует его по этому конфигу ([#128](https://gitlab.kozhindev.com/steroids/steroids-nest/-/issues/128))

## [0.3.2](https://github.com/steroids/nest/compare/0.3.1...0.3.2) (2025-06-26)

### Fixes

- Фикс ClearUnusedFilesCommand

## [0.3.1](https://github.com/steroids/nest/compare/0.3.0...0.3.1) (2025-06-24)

### Features

- Добавлена CLI команда для удаления файлов из хранилища, для которых нет записи в БД. ([#17](https://gitlab.kozhindev.com/steroids/steroids-nest/-/issues/17))
- Добавлена CLI команда для удаления неиспользуемых загруженных файлов ([#95](https://gitlab.kozhindev.com/steroids/steroids-nest/-/issues/95))
- Обновлены интерфейсы методов в IFileStorage ([#114](https://gitlab.kozhindev.com/steroids/steroids-nest/-/issues/114))
- Добавлен тип загружаемых файлов в конфиг для @FileUpload ([#120](https://gitlab.kozhindev.com/steroids/steroids-nest/-/issues/120))

## [0.3.0](https://github.com/steroids/nest/compare/0.2.6...0.3.0) (2025-05-12)

### Features

- Обновление Steroids до версии 3.2.0
- В качестве превью для svg файлов сохраняется ссылка на оригинальный файл ([#54](https://gitlab.kozhindev.com/steroids/steroids-nest/-/issues/54))
- Превью файла не растягивается, если оригинал имеет разрешение меньше заданного размера превью ([#111](https://gitlab.kozhindev.com/steroids/steroids-nest/-/issues/111))
- Инициализация сервиса CronJobsRegister перенесена с OnModuleInit на OnApplicationBootstrap ([#115](https://gitlab.kozhindev.com/steroids/steroids-nest/-/issues/115))
