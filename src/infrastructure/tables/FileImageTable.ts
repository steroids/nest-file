import {TypeOrmTableFromModel} from '@steroidsjs/nest/infrastructure/decorators/typeorm/TypeOrmTableFromModel';
import {FileImageModel} from '../../domain/models/FileImageModel';

@TypeOrmTableFromModel(FileImageModel, 'file_image')
export class FileImageTable extends FileImageModel {}
