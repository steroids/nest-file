import {FileConfigService} from '../domain/services/FileConfigService';

export type IFileModuleConfig = Omit<Readonly<FileConfigService>, 'onModuleInit'>

export default () => ({

} as IFileModuleConfig);
