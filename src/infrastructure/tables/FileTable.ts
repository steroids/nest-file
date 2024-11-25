import {TableFromModel} from '@steroidsjs/nest/infrastructure/decorators/TableFromModel';
import {FileModel} from '../../domain/models/FileModel';

@TableFromModel(FileModel, 'file')
export class FileTable extends FileModel {}
