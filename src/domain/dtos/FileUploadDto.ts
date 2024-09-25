import {BooleanField, StringField} from '@steroidsjs/nest/infrastructure/decorators/fields';

export class FileUploadDto {
    @StringField({
        label: 'Files uids from frontend',
        isArray: true,
        nullable: true,
    })
    uids?: string;

    @StringField({
        label: 'Set file mime types list for check',
        isArray: true,
        nullable: true,
    })
    mimeTypes: string[];

    @BooleanField({
        label: 'Set true, for auto set mime types as images (gif, jpeg, pjpeg, png)',
    })
    imagesOnly: boolean;
}
