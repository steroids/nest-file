import {InjectRepository} from '@steroidsjs/nest-typeorm';
import {Repository} from '@steroidsjs/typeorm';
import {CrudRepository} from '@steroidsjs/nest/infrastructure/repositories/CrudRepository';
import {IFileImageRepository} from '../../domain/interfaces/IFileImageRepository';
import {FileImageModel} from '../../domain/models/FileImageModel';
import {FileImageTable} from '../tables/FileImageTable';
import {FileStorageFabric} from '../../domain/services/FileStorageFabric';
import {FileStorage} from '../../domain/enums/FileStorageEnum';

export class FileImageRepository extends CrudRepository<FileImageModel> implements IFileImageRepository {
    protected modelClass = FileImageModel;

    constructor(
        @InjectRepository(FileImageTable)
        public dbRepository: Repository<FileImageTable>,
        private fileStorageFabric: FileStorageFabric,
    ) {
        super();
    }

    protected entityToModel(obj: any): FileImageModel {
        const model = super.entityToModel(obj);
        model.url = this.fileStorageFabric.get(model.storageName).getUrl(model);
        return model;
    }

    async getFilesPathsByStorageName(storageName: FileStorage): Promise<string[] | null> {
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
