import {InjectRepository} from '@steroidsjs/nest-typeorm';
import {Repository} from '@steroidsjs/typeorm';
import {Injectable} from '@nestjs/common';
import {CrudRepository} from '@steroidsjs/nest/infrastructure/repositories/CrudRepository';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import {IFileRepository} from '../../domain/interfaces/IFileRepository';
import {FileTable} from '../tables/FileTable';
import {FileModel} from '../../domain/models/FileModel';
import { IFIleStorageFactory } from '../../domain/interfaces/IFIleStorageFactory';
import FileStorageEnum from '../../domain/enums/FileStorageEnum';

@Injectable()
export class FileRepository extends CrudRepository<FileModel> implements IFileRepository {
    protected modelClass = FileModel;

    constructor(
        @InjectRepository(FileTable)
        public dbRepository: Repository<FileTable>,
        private fileStorageFactory: IFIleStorageFactory,
    ) {
        super();
    }

    protected entityToModel(obj: any): FileModel {
        const model = super.entityToModel(obj);
        model.url = this.fileStorageFactory.get(model.storageName).getUrl(model);
        return model;
    }

    public async getFileWithDocument(fileName: string): Promise<FileModel> {
        const file = await this.dbRepository.createQueryBuilder('model')
            .select('model.id')
            .leftJoin('model.documents', 'document')
            .leftJoin('document.entrant', 'entrant')
            .addSelect([
                'document.id',
                'entrant.userId',
            ])
            .where('model."fileName" ILIKE :name', {name: fileName})
            .getOne();
        return DataMapper.create(FileModel, file);
    }

    async getFilesPathsByStorageName(storageName: FileStorageEnum): Promise<string[] | null> {
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
