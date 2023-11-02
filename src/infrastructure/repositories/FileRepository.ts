import {InjectRepository} from '@steroidsjs/nest-typeorm';
import {Repository} from '@steroidsjs/typeorm';
import {Injectable} from '@nestjs/common';
import {CrudRepository} from '@steroidsjs/nest/infrastructure/repositories/CrudRepository';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import {IFileRepository} from '../../domain/interfaces/IFileRepository';
import {FileTable} from '../tables/FileTable';
import {FileModel} from '../../domain/models/FileModel';
import {FileStorageFabric} from '../../domain/services/FileStorageFabric';

@Injectable()
export class FileRepository extends CrudRepository<FileModel> implements IFileRepository {
    protected modelClass = FileModel;

    constructor(
        @InjectRepository(FileTable)
        public dbRepository: Repository<FileTable>,
        private fileStorageFabric: FileStorageFabric,
    ) {
        super();
    }

    protected entityToModel(obj: any): FileModel {
        const model = super.entityToModel(obj);
        model.url = this.fileStorageFabric.get(model.storageName).getUrl(model);
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

    async getFileNamesByStorageName(storageName: string): Promise<string[] | null> {
        return this.createQuery()
            .select('fileName')
            .where({storageName})
            .column();
    }
}
