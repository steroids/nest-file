import {Controller, Inject, Put, Query, UploadedFile, UseInterceptors} from '@nestjs/common';
import {ApiOkResponse, ApiQuery, ApiTags} from '@nestjs/swagger';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import {IFileService} from '@steroidsjs/nest-modules/file/services/IFileService';
import {IExpressSource} from '../../domain/interfaces/IExpressSource';
import {FileUploadOptions} from '../../domain/dtos/FileUploadOptions';
import {FileExpressSourceDto} from '../../domain/dtos/sources/FileExpressSourceDto';
import {FileUploadDto} from '../../domain/dtos/FileUploadDto';
import {FileImageSchema} from '../schemas/FileImageSchema';
import {FileSchema} from '../schemas/FileSchema';
import {FileUploadInterceptor} from '../interceptors/FileUploadInterceptor';

@Controller('/file')
@ApiTags('Файлы')
export default class FileController {
    constructor(
        @Inject(IFileService)
        private readonly fileService: IFileService,
    ) {
    }

    @Put('/upload-photo')
    // @todo поправить useFile чтобы при загрузке картинок через FileField передавался Admin-Authorization
    // @AuthPermissions(PERMISSION_AUTH_ADMIN_AUTHORIZED)
    // @UseGuards(AdminJwtAuthGuard)
    @UseInterceptors(FileUploadInterceptor)
    @ApiQuery({type: FileUploadDto})
    @ApiOkResponse({type: FileImageSchema})
    async photos(
        @Query() dto: FileUploadDto,
        @UploadedFile() file: IExpressSource,
    ) {
        return this.fileService.upload(
            DataMapper.create<FileUploadOptions>(FileUploadOptions, {
                ...dto,
                source: DataMapper.create(FileExpressSourceDto, file),
            }),
            FileImageSchema,
        );
    }

    @Put('/upload-file')
    // @todo поправить useFile чтобы при загрузке картинок через FileField передавался Admin-Authorization
    // @AuthPermissions(PERMISSION_AUTH_ADMIN_AUTHORIZED)
    @UseInterceptors(FileUploadInterceptor)
    @ApiQuery({type: FileUploadDto})
    @ApiOkResponse({type: FileSchema})
    async files(
        @UploadedFile() file: IExpressSource,
        @Query()dto: FileUploadDto,
    ) {
        return this.fileService.upload(
            DataMapper.create<FileUploadOptions>(FileUploadOptions, {
                ...dto,
                source: DataMapper.create(FileExpressSourceDto, file),
            }),
            FileSchema,
        );
    }
}
