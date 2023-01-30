import {Controller, Inject, Put, Query, UploadedFile} from '@nestjs/common';
import {ApiOkResponse, ApiQuery} from '@nestjs/swagger';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import {FileUpload} from '../decorators/FileUpload';
import {IExpressSource} from '../../domain/interfaces/IExpressSource';
import {FileUploadOptions} from '../../domain/dtos/FileUploadOptions';
import {FileExpressSourceDto} from '../../domain/dtos/sources/FileExpressSourceDto';
import {FileUploadDto} from '../../domain/dtos/FileUploadDto';
import {FileImageSchema} from '../schemas/FileImageSchema';
import {FileSchema} from '../schemas/FileSchema';
import {IFileService} from '@steroidsjs/nest-modules/file/services/IFileService';

@Controller('/file')
export default class FileController {
    constructor(
        @Inject(IFileService)
        private readonly fileService: IFileService,
    ) {
    }

    @Put('/upload-photo')
    @FileUpload()
    // @todo поправить useFile чтобы при загрузке картинок через FileField передавался Admin-Authorization
    // @AuthPermissions(PERMISSION_AUTH_ADMIN_AUTHORIZED)
    // @UseGuards(AdminJwtAuthGuard)
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
    @ApiQuery({type: FileUploadDto})
    @ApiOkResponse({type: FileSchema})
    @FileUpload()
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
