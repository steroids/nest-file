import {TableFromModel} from '@steroidsjs/nest/infrastructure/decorators/TableFromModel';
import {IDeepPartial} from '@steroidsjs/nest/usecases/interfaces/IDeepPartial';
import { FileModel } from '../../domain/models/FileModel';

@TableFromModel(FileModel, 'file')
export class FileTable implements IDeepPartial<FileModel> {}
