export const GET_FILE_STORAGE_PARAMS_USE_CASE_TOKEN = 'get_file_storage_params_use_case_token';

export interface IGetFileStorageParamsUseCase {
    handle: (fileType: string) => Promise<Record<string, any>>,
}
