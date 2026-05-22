# Steroids Nest File Migration Guide

### Провайдинг хранилищ после обновления

`FileStorageFactory` теперь получает хранилища из DI по токену `FILE_STORAGES_TOKEN`.
Если проект использует стандартный `coreModule.module(config)` и не переопределяет провайдинг хранилищ, токен уже настроен внутри пакета.
Если проект переопределяет providers, использует кастомные хранилища или несколько экземпляров одного хранилища с разными настройками, нужно:

1. Добавить настройки каждого хранилища в `FileModule.config.storages`.
   Ключи в `storages` будут использоваться как `storageName`.

```typescript
@Module({
    ...coreModule,
    config: () => {
        const coreConfig = coreModule.config();
        return {
            ...coreConfig,
            storages: {
                ...coreConfig.storages,
                minio_s3_1: {},
                minio_s3_2: {},
            },
        };
    },
})
export class FileModule {}
```

2. Запровайдить эти же ключи по токену `FILE_STORAGES_TOKEN`.
   Для `TRANSIENT` хранилищ нужно использовать `moduleRef.resolve`, чтобы получить отдельный экземпляр для каждого имени.

```typescript
{
    provide: FILE_STORAGES_TOKEN,
    inject: [ModuleRef],
    useFactory: async (moduleRef: ModuleRef) => ({
        minio_s3_1: await moduleRef.resolve(MinioS3Storage),
        minio_s3_2: await moduleRef.resolve(MinioS3Storage),
    }),
},
```

3. Убрать передачу `fileStorageParams` в `IFileStorage.write`.
   Параметры записи, зависящие от `fileType` или `storageName`, нужно перенести в `IGetFileStorageParamsUseCase` и запровайдить его по токену `GET_FILE_STORAGE_PARAMS_USE_CASE_TOKEN`.

## [0.4.0](../CHANGELOG.md#040-2025-12-18) (2025-12-18)

### Параметры загрузки в хранилище по fileType

В FileModel было добавлено string nullable поле fileType, поэтому после обновления пакета необходимо сгененерировать и применить миграции в проекте

В проекте в FileModule по токену ```GET_FILE_STORAGE_PARAMS_USE_CASE_TOKEN``` можно определить сервис, реализующий интерфейс ```IGetFileStorageParamsUseCase```
, что позволяет задать необходимые параметры при загрузке файла в соответствующее хранилище.

## [0.3.3](../CHANGELOG.md#033-2025-07-03) (2025-07-03)

### FileUploadInterceptor

Используемый ранее декоратор ```FileUpload``` отмечен как deprecated и заменен на ```FileUploadInterceptor```
Если в проекте используется ```FileUpload```, необходимо заменить его на ```FileUploadInterceptor``` следующим образом:

До
```ts
@Put('/upload-file')
@FileUpload()
@ApiQuery({type: FileUploadDto})
@ApiOkResponse({type: FileSchema})
async files(
    @UploadedFile() file: IExpressSource,
    @Query()dto: FileUploadDto,
) {}
```

После
```ts
@Put('/upload-file')
@UseInterceptors(FileUploadInterceptor)
@ApiQuery({type: FileUploadDto})
@ApiOkResponse({type: FileSchema})
async files(
    @UploadedFile() file: IExpressSource,
@Query()dto: FileUploadDto,
) {}
```
