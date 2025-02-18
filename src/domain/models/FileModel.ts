import {
    RelationField,
    PrimaryKeyField,
    StringField,
    CreateTimeField, IntegerField, UidField, EnumField,
} from '@steroidsjs/nest/infrastructure/decorators/fields';
import {FileImageModel} from './FileImageModel';
import FileStorageEnum from '../enums/FileStorageEnum';

/**
 * Файлы
 */
export class FileModel {
    @PrimaryKeyField()
    id: number;

    @UidField({
        label: 'Уникальный UUID',
    })
    uid: string;

    @StringField({
        label: 'MD5 хеш',
        max: 32,
        nullable: true,
    })
    md5: string;

    @StringField({
        label: 'Название загружаемого файла',
        nullable: true,
    })
    title: string;

    @StringField({
        label: 'Url по которому доступен файл',
        noColumn: true,
    })
    url: string;

    @EnumField({
        label: 'Имя хранилища',
        nullable: true,
        enum: FileStorageEnum,
    })
    storageName: FileStorageEnum;

    @StringField({
        label: 'Название сохраненного файла',
    })
    fileName: string;

    @IntegerField({
        label: 'Размер файла (байты)',
    })
    fileSize: number;

    @StringField({
        label: 'MIME тип файла',
    })
    fileMimeType: string;

    @StringField({
        label: 'Относительный путь до под-директории',
        nullable: true,
    })
    folder: string;

    @CreateTimeField({
        label: 'Создан',
    })
    createTime: string;

    @RelationField({
        label: '',
        type: 'OneToMany',
        inverseSide: (image: FileImageModel) => image.file,
        relationClass: () => FileImageModel,
    })
    images: FileImageModel[];
}
