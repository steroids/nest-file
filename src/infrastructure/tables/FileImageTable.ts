import {TableFromModel} from '@steroidsjs/nest/infrastructure/decorators/TableFromModel';
import {FileImageModel} from '../../domain/models/FileImageModel';

@TableFromModel(FileImageModel, 'file_image')
export class FileImageTable extends FileImageModel {}
