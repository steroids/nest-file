import {FileModule} from '@steroidsjs/nest-modules/file/FileModule';
import {IModule} from '@steroidsjs/nest/infrastructure/decorators/Module';
import tables from './infrastructure/tables';
import config from './infrastructure/config';
import module from './infrastructure/module';

export default {
    rootTarget: FileModule,
    tables,
    config,
    module,
} as IModule;
