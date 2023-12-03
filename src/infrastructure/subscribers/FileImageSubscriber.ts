import {EventSubscriber} from '@steroidsjs/typeorm';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import {Type} from '@nestjs/common';
import {BaseFileSubscriber} from './BaseFileSubscriber';
import {FileImageModel} from '../../domain/models/FileImageModel';
import {FileImageTable} from '../tables/FileImageTable';

@EventSubscriber()
export class FileImageSubscriber extends BaseFileSubscriber<FileImageTable, FileImageModel> {
    listenTo(): Type<FileImageTable> {
        return FileImageTable;
    }

    getModelFromTable(removedTableInstance: FileImageTable): FileImageModel {
        return DataMapper.create<FileImageModel>(FileImageModel, removedTableInstance);
    }
}
