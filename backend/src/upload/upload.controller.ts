import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

function safeExt(originalName: string): string {
  const ext = extname(originalName || '').toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp') return ext;
  return '';
}

@ApiTags('Uploads')
@Controller('uploads')
export class UploadController {
  @Post('cover')
  @ApiOperation({ summary: 'Uploader une image de couverture' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Retourne l’URL publique de l’image' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'public/uploads',
        filename: (_req, file, cb) => {
          const ext = safeExt(file.originalname);
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype?.startsWith('image/')) {
          return cb(new BadRequestException('Le fichier doit être une image') as any, false);
        }
        cb(null, true);
      },
    }),
  )
  uploadCover(@UploadedFile() file?: any) {
    if (!file) throw new BadRequestException('Aucun fichier envoyé');
    return {
      imageUrl: `/public/uploads/${file.filename}`,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
