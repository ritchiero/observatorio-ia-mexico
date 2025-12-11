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
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const fileRef = bucket.file(filename);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          uploadedAt: new Date().toISOString(),
          originalName: file.name
        }
      }
    });

    // Hacer el archivo público
    await fileRef.makePublic();

    // Obtener URL pública
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
