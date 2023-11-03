import BaseEnum from '@steroidsjs/nest/domain/base/BaseEnum';

export enum FileStorage {
    LOCAL = 'local',

    MINIO_S3 = 'minio_s3',
}

export default class FileStorageEnum extends BaseEnum {
    static LOCAL = FileStorage.LOCAL;

    static MINIO_S3 = FileStorage.MINIO_S3;
}
