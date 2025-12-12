import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection('suscripciones')
      .orderBy('fechaRegistro', 'desc')
      .get();
    
    const suscripciones = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        fechaRegistro: data.fechaRegistro?.toDate?.()?.toISOString() || data.fechaRegistro,
        activo: data.activo ?? true,
      };
    });
    
    return NextResponse.json({ suscripciones });
  } catch (error) {
    console.error('Error fetching suscripciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener las suscripciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = getAdminDb();
    const body = await request.json();
    
    const { nombre, email, telefono } = body;
    
    // Validaciones
    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre completo es requerido' },
        { status: 400 }
      );
    }
    
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El formato del correo electrónico no es válido' },
        { status: 400 }
      );
    }
    
    if (!telefono || !telefono.trim()) {
      return NextResponse.json(
        { error: 'El teléfono de WhatsApp es requerido' },
        { status: 400 }
      );
    }
    
    // Validar formato de teléfono (al menos 10 dígitos)
    const telefonoLimpio = telefono.replace(/\D/g, '');
    if (telefonoLimpio.length < 10) {
      return NextResponse.json(
        { error: 'El teléfono debe tener al menos 10 dígitos' },
        { status: 400 }
      );
    }
    
    // Verificar si el email ya está registrado
    const existingEmail = await db.collection('suscripciones')
      .where('email', '==', email.toLowerCase().trim())
      .get();
    
    if (!existingEmail.empty) {
      return NextResponse.json(
        { error: 'Este correo electrónico ya está registrado' },
        { status: 409 }
      );
    }
    
    // Crear la suscripción
    const nuevaSuscripcion = {
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      telefono: telefonoLimpio,
      fechaRegistro: new Date(),
      activo: true,
    };
    
    const docRef = await db.collection('suscripciones').add(nuevaSuscripcion);
    
    return NextResponse.json({ 
      id: docRef.id,
      message: '¡Gracias por suscribirte! Te mantendremos informado.'
    });
  } catch (error) {
    console.error('Error creating suscripcion:', error);
    return NextResponse.json(
      { error: 'Error al registrar la suscripción' },
      { status: 500 }
    );
  }
}
