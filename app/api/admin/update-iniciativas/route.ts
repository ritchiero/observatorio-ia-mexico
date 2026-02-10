import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
    import { Timestamp } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

// POST /api/admin/update-iniciativas - Batch update initiatives
// Protected with CRON_SECRET
export async function POST(request: NextRequest) {
        try {
                    const authHeader = request.headers.get('authorization');
                    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

            const body = await request.json();
        const { updates } = body;
                    // updates: Array<{ id: string, fields: Record<string, any> }>

            if (!updates || !Array.isArray(updates)) {
                            return NextResponse.json({ error: 'Missing updates array' }, { status: 400 });
            }

            const db = getAdminDb();
                    const results: { id: string; success: boolean; error?: string }[] = [];

            for (const update of updates) {
                            try {
                                                const { id, fields } = update;
                                                if (!id || !fields) {
                                                                        results.push({ id: id || 'unknown', success: false, error: 'Missing id or fields' });
                                                                        continue;
                                                }

                                // Add updatedAt
                                                fields.updatedAt = Timestamp.now();

                                // Use set with merge to handle both existing and phantom documents
                                await db.collection('iniciativas').doc(id).set(fields, { merge: true });
                                                results.push({ id, success: true });
                            } catch (error) {
                                                results.push({
                                                                        id: update.id || 'unknown',
                                                                        success: false,
                                                                        error: error instanceof Error ? error.message : String(error),
                                                });
                            }
                                }

                    const successCount = results.filter(r => r.success).length;
                    const failCount = results.filter(r => !r.success).length;

            return NextResponse.json({
                            success: true,
                            total: updates.length,
                            updated: successCount,
                            failed: failCount,
                            results,
            });
        } catch (error) {
                    console.error('Error updating iniciativas:', error);
                    return NextResponse.json(
                        { error: 'Error updating iniciativas' },
                                                    { status: 500 }
                                );
        }
}
