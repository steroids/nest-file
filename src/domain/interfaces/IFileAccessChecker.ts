import {IContextDto} from '@steroidsjs/nest/usecases/dtos/ContextDto';
import {RequestedFileInfo} from '../../infrastructure/decorators/RequestedFile';

export const FILE_ACCESS_CHECKER = Symbol('FILE_ACCESS_CHECKER');

export interface IFileAccessChecker {
    checkAccess(context: IContextDto, fileInfo: RequestedFileInfo): Promise<void> | void,
}
