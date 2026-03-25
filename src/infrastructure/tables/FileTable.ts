import {TypeOrmTableFromModel} from '@steroidsjs/nest/infrastructure/decorators/typeorm/TypeOrmTableFromModel';
import {Index} from '@steroidsjs/typeorm';
import {FileModel} from '../../domain/models/FileModel';

@Index(['userId'])
@TypeOrmTableFromModel(FileModel, 'file')
export class FileTable extends FileModel {}
