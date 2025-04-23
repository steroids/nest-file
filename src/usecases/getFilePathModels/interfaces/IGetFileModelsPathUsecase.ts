import FileStorageEnum from '../../../domain/enums/FileStorageEnum';

export const GetFileModelsPathUsecaseToken = 'GetFileModelsPathUsecaseToken';

export interface IGetFileModelsPathUsecase {
    handle: (storageName: FileStorageEnum) => Promise<string[]>
}
