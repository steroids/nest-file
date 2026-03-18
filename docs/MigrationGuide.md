# Steroids Nest File Migration Guide

### Провайдинг хранилищ

Объект с хранилищами теперь провайдятся по токену `FILE_STORAGES_TOKEN`, а так же хранилища имеют injection scope `TRANSIENT`.
Это позволяет создавать несколько экземпляров одного хранилища с разными конфигурациями.
Чтобы этим воспользоваться, нужно:

1. Запровайдить `FILE_STORAGES_TOKEN` (нужно использовать именно `moduleRef.resolve`, так как используется `TRANSIENT` scope, возвращая новый экземпляр):
```typescript
{
    provide: FILE_STORAGES_TOKEN,
    inject: [ModuleRef],
    useFactory: async (moduleRef: ModuleRef) => ({
        ['minio_s3_1']: await moduleRef.resolve(MinioS3Storage),
        ['minio_s3_2']: await moduleRef.resolve(MinioS3Storage),
    }),
},
```

2. В конфиге модуля `FileModule` указать в поле `storages` поля с теми же названиями хранилищ, что и запровайденные выше:

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
