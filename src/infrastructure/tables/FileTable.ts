import {TypeOrmTableFromModel} from '@steroidsjs/nest/infrastructure/decorators/typeorm/TypeOrmTableFromModel';
import {FileModel} from '../../domain/models/FileModel';

@TypeOrmTableFromModel(FileModel, 'file')
export class FileTable extends FileModel {}
