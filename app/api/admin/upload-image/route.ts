import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Subir imagen a Firebase Storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const anuncioId = formData.get('anuncioId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF' 
      }, { status: 400 });
    }

    // Validar tamaño (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'El archivo es muy grande. Máximo 5MB' 
      }, { status: 400 });
    }

    // Convertir a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre único
    const extension = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const filename = anuncioId 
      ? `anuncios/${anuncioId}/thumbnail-${timestamp}.${extension}`
      : `anuncios/thumbnails/img-${timestamp}.${extension}`;

    // Subir a Firebase Storage
    let storage;
    try {
      storage = getAdminStorage();
    } catch (storageError) {
      console.error('Error inicializando Storage:', storageError);
      return NextResponse.json({
        error: 'Error de configuración de Storage',
        details: storageError instanceof Error ? storageError.message : 'Unknown'
      }, { status: 500 });
    }

    const bucket = storage.bucket();
    const fileRef = bucket.file(filename);

    // Guardar archivo
    try {
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
          cacheControl: 'public, max-age=31536000',
        },
        public: true, // Intentar hacer público al guardar
      });
    } catch (saveError) {
      console.error('Error guardando archivo:', saveError);
      return NextResponse.json({
        error: 'Error al guardar archivo en Storage',
        details: saveError instanceof Error ? saveError.message : 'Unknown'
      }, { status: 500 });
    }

    // Intentar hacer público (si no se hizo al guardar)
    try {
      await fileRef.makePublic();
    } catch (publicError) {
      // Si falla makePublic, intentamos con signed URL
      console.warn('makePublic falló, usando URL directa:', publicError);
    }

    // URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename
    });

  } catch (error) {
    console.error('Error subiendo imagen:', error);
    return NextResponse.json({
      error: 'Error al subir imagen',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
