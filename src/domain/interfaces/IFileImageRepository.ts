import {ICrudRepository} from '@steroidsjs/nest/usecases/interfaces/ICrudRepository';
import {FileImageModel} from '../models/FileImageModel';

export const IFileImageRepository = 'IFileImageRepository';

export type IFileImageRepository = ICrudRepository<FileImageModel>
