import {InjectRepository} from '@steroidsjs/nest-typeorm';
import {Repository} from '@steroidsjs/typeorm';
import {Inject} from '@nestjs/common';
import {CrudRepository} from '@steroidsjs/nest/infrastructure/repositories/CrudRepository';
import {IFileImageRepository} from '../../domain/interfaces/IFileImageRepository';
import {FileImageModel} from '../../domain/models/FileImageModel';
import {FileImageTable} from '../tables/FileImageTable';
import {IFileStorageFactory} from '../../domain/interfaces/IFileStorageFactory';
import {FileStorageNameType} from '../../domain/types/FileStorageNameType';

export class FileImageRepository extends CrudRepository<FileImageModel> implements IFileImageRepository {
    protected modelClass = FileImageModel;

    constructor(
        @InjectRepository(FileImageTable)
        public dbRepository: Repository<FileImageTable>,
        @Inject(IFileStorageFactory)
        private fileStorageFactory: IFileStorageFactory,
    ) {
        super();
    }

    protected entityToModel(obj: any): FileImageModel {
        const model = super.entityToModel(obj);
        model.url = this.fileStorageFactory.get(model.storageName).getUrl(model);
        return model;
    }

    async getFilesPathsByStorageName(storageName: FileStorageNameType): Promise<string[] | null> {
        const files = await this.createQuery()
            .select([
                'fileName',
                'folder',
            ])
            .where({storageName})
            .many();
        return files.map(file => [file.folder, file.fileName].join('/'));
    }
}
