import {InjectRepository} from '@steroidsjs/nest-typeorm';
import {Repository} from '@steroidsjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import {CrudRepository} from '@steroidsjs/nest/infrastructure/repositories/CrudRepository';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import {IFileRepository} from '../../domain/interfaces/IFileRepository';
import {FileTable} from '../tables/FileTable';
import {FileModel} from '../../domain/models/FileModel';
import {IFileStorageFactory} from '../../domain/interfaces/IFileStorageFactory';
import FileStorageEnum from '../../domain/enums/FileStorageEnum';

@Injectable()
export class FileRepository extends CrudRepository<FileModel> implements IFileRepository {
    protected modelClass = FileModel;

    constructor(
        @InjectRepository(FileTable)
        public dbRepository: Repository<FileTable>,
        @Inject(IFileStorageFactory)
        private fileStorageFactory: IFileStorageFactory,
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

    public async getJunkFilesIds(config: {
        fileNameLike: string,
        ignoredTables: string[],
        isEmpty: boolean,
    }): Promise<number[]> {
        const tables: Array<{table_name: string, col_name: string}> = await this.dbRepository.query(`
            SELECT
                conrelid::regclass AS table_name,
                (regexp_match(pg_get_constraintdef(oid), 'FOREIGN KEY \\("([^"]+)"'))[1] as col_name
            FROM pg_constraint
            WHERE
                contype = 'f'
                AND connamespace = 'public'::regnamespace
                AND pg_get_constraintdef(oid) LIKE '%REFERENCES file(id)%'
            ORDER BY conrelid::regclass::text, contype DESC;
        `);

        const tablesFilesIds = await Promise.all(tables.map(async (table) => {
            if (!config.ignoredTables?.length || !config.ignoredTables.includes(table.table_name)) {
                const tableFilesIds = await this.dbRepository.query(`
                    SELECT DISTINCT "${table.col_name}" as id FROM ${table.table_name}
                `);
                return tableFilesIds.map(item => item.id);
            }
            return [];
        }));

        const usefulFilesIds = [...new Set(tablesFilesIds.flat())].filter(Boolean);

        const allFilesQb = this.dbRepository.createQueryBuilder('model')
            .select('model.id');

        if (config.fileNameLike) {
            allFilesQb.where('model.title ILIKE :title', {title: `%${config.fileNameLike}%`});
        }

        if (config.isEmpty) {
            allFilesQb.andWhere('(model.fileSize = 0 OR model.fileSize IS NULL)');
        }

        const allFiles = await allFilesQb.getRawMany();

        const allFilesIds = allFiles.map(file => file.model_id);

        return allFilesIds.filter(element => !usefulFilesIds.includes(element));
    }

    public async getCount() {
        return this.dbRepository.createQueryBuilder().getCount();
    }
}
