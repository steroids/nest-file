import {StringField} from '@steroidsjs/nest/infrastructure/decorators/fields';

export class FileWriteResult {
    @StringField()
    md5: string;
}
