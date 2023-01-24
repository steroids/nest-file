import {TableFromModel} from '@steroidsjs/nest/infrastructure/decorators/TableFromModel';
import {IDeepPartial} from '@steroidsjs/nest/usecases/interfaces/IDeepPartial';
import { FileImageModel } from '../../domain/models/FileImageModel';

@TableFromModel(FileImageModel, 'file_image')
export class FileImageTable implements IDeepPartial<FileImageModel> {}
