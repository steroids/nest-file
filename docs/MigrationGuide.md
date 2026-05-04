# Steroids Nest File Migration Guide

## [0.6.0](../CHANGELOG.md#060-2026-05-04) (2026-05-04)

### Lifetime для только что загруженных файлов

В очистку lost/temporary и unused файлов добавлена задержка перед удалением недавно созданных файлов.
Это снижает риск удалить файл, который уже загружен в хранилище, но еще не успел сохраниться в БД или привязаться к сущности.

По умолчанию применяются следующие значения:

- `JUST_UPLOADED_TEMP_FILE_LIFETIME_S=10` - lost/temporary файлы из local storage не удаляются в течение 10 секунд после создания
- `JUST_UPLOADED_UNUSED_FILE_LIFETIME_S=86400` - команда `unused-files` не удаляет файлы, созданные менее 24 часов назад

Значения в env задаются в секундах. Если параметры передаются через конфиг модуля, используйте поля `justUploadedTempFileLifetimeMs` и `justUploadedUnusedFileLifetimeMs` в миллисекундах.

Если в проекте нужно сохранить прежнее поведение без задержки, можно задать env-переменные со значением `0`:

```env
JUST_UPLOADED_TEMP_FILE_LIFETIME_S=0
JUST_UPLOADED_UNUSED_FILE_LIFETIME_S=0
```

### Изменения контрактов для кастомных реализаций

Если в проекте есть собственная реализация `IFileLocalStorage`, необходимо добавить метод `getFileCreateTimeMs(fileName: string): Promise<number>`.
Метод должен вернуть время создания файла в миллисекундах. Для local storage можно ориентироваться на `birthtime` или `mtime` файла.

Если в проекте есть собственная реализация `IFileRepository.getUnusedFilesIds`, она должна принимать новый опциональный параметр `unusedFileLifetimeMs`.
Этот параметр используется для фильтрации файлов по `createTime` перед удалением.

## [0.5.0](../CHANGELOG.md#050-2026-03-25) (2026-03-25)

### userId в FileModel

В FileModel было добавлено integer nullable поле userId, поэтому после обновления пакета можно добавить сохранение id пользователя, загрузившего файл.
Это можно сделать через fileUploadOptions. Например, в эндпоинте загрузки файла:

```ts
@Put('/upload-file')
async files(
    @UploadedFile() file: any,
    @Query() dto: ProjectFileUploadDto,
    @Context() context: ContextDto,
) {
    return this.fileService.upload(
        DataMapper.create<FileUploadOptions>(FileUploadOptions, {
            ...dto,
            userId: context.user.id,
            source: DataMapper.create(FileExpressSourceDto, file),
        }),
        FileSchema,
    );
}
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
