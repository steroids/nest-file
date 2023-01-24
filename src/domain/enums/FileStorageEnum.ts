import BaseEnum from '@steroidsjs/nest/domain/base/BaseEnum';

export default class FileStorageEnum extends BaseEnum {
    static LOCAL = 'local';

    static MINIO_S3 = 'minio_s3';
}
