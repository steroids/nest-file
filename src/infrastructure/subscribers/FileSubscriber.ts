import {EventSubscriber} from '@steroidsjs/typeorm';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import {Type} from '@nestjs/common';
import {FileTable} from '../tables/FileTable';
import {FileModel} from '../../domain/models/FileModel';
import {BaseFileSubscriber} from './BaseFileSubscriber';

@EventSubscriber()
export class FileSubscriber extends BaseFileSubscriber<FileTable, FileModel> {
    listenTo(): Type<FileTable> {
        return FileTable;
    }

    getModelFromTable(removedTableInstance: FileTable): FileModel {
        return DataMapper.create<FileModel>(FileModel, removedTableInstance);
    }
}
