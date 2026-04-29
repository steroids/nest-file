export const GET_FILE_STORAGE_PARAMS_USE_CASE_TOKEN = 'get_file_storage_params_use_case_token';

/*
    Позволяет задать параметры загрузки файла в определенный тип хранилища
 */
export interface IGetFileStorageParamsUseCase {
    handle: (fileType: string, storageName: string) => Promise<Record<string, any>>,
}
