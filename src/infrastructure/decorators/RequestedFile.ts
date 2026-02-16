import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {BadRequestException} from '@steroidsjs/nest/usecases/exceptions';

export interface RequestedFileInfo {
    name: string,
    path: string,
}

export const RequestedFile = createParamDecorator((data: unknown, ctx: ExecutionContext):RequestedFileInfo => {
    const originalUri = ctx.switchToHttp().getRequest().headers['x-original-uri'];

    if (!originalUri) {
        throw new BadRequestException('x-original-uri header not found');
    }

    const fullPath = originalUri.split('?')[0];
    const parts = fullPath.split('/');
    const name = parts.pop();
    const path = parts.join('/');

    if (!name) {
        throw new BadRequestException('Invalid file name');
    }

    return {
        name,
        path,
    };
});
