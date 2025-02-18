import BaseEnum from '@steroidsjs/nest/domain/base/BaseEnum';

export enum FileStorageEnum {
    LOCAL = 'local',

    MINIO_S3 = 'minio_s3',
}

export class FileStorageEnumHelper extends BaseEnum {
    static getLabels() {
        return {
            [FileStorageEnum.LOCAL]: 'Локальное хранилище',
            [FileStorageEnum.MINIO_S3]: 'Minio S3',
        };
    }
}

export default FileStorageEnum;
