# Steroids Nest File Migration Guide

## [0.4.0](../CHANGELOG.md#040-2025-07-03) (2025-07-03)

### FileUploadInterceptor

Используемый ранее декоратор ```FileUpload``` отмечен как deprecated и заменен на ```FileUploadInterceptor```
Если в проекте используется ```FileUpload```, необходимо заменить его на ```FileUploadInterceptor``` следующим образом:

До
```ts
import {IDeepPartial} from '@steroidsjs/nest/usecases/interfaces/IDeepPartial';
import {TableFromModel} from '@steroidsjs/nest/infrastructure/decorators/TableFromModel';
import {AuthConfirmModel} from '@steroidsjs/nest-auth/domain/models/AuthConfirmModel';
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
