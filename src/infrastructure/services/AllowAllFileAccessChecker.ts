import {Injectable} from '@nestjs/common';
import {IFileAccessChecker} from '../../domain/interfaces/IFileAccessChecker';

@Injectable()
export class AllowAllFileAccessChecker implements IFileAccessChecker {
    checkAccess(): void {}
}
