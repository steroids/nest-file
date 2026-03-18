import {FileStorageNameType} from '../../../domain/types/FileStorageNameType';

export const GetFileModelsPathUsecaseToken = 'GetFileModelsPathUsecaseToken';

export interface IGetFileModelsPathUsecase {
    handle: (storageName: FileStorageNameType) => Promise<string[]>,
}
