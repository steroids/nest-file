export const GetFileModelsPathUsecaseToken = 'GetFileModelsPathUsecaseToken';

export interface IGetFileModelsPathUsecase {
    handle: (storageName: string) => Promise<string[]>,
}
