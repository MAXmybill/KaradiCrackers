import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStoreSettings, updateStoreSettings, renameCategoryInFirestore } from '@/lib/db';
import { CATEGORY_TAMIL_NAMES } from '@/lib/categoryTranslations';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const updateCategorySchema = z.object({
  action: z.enum(['add', 'update', 'delete']),
  categoryKey: z.string().min(1, 'Category name is required'),
  newCategoryKey: z.string().optional(),
  tamilName: z.string().optional(),
});

// GET /api/admin/categories
export async function GET() {
  try {
    const settings = await getStoreSettings();
    const custom = settings.categoryTranslations || {};
    // Merge built-in defaults with custom stored overrides
    const merged: Record<string, string> = { ...CATEGORY_TAMIL_NAMES, ...custom };
    return NextResponse.json({
      success: true,
      translations: merged,
      customTranslations: custom,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid category data' },
        { status: 400 }
      );
    }

    const { action, categoryKey, newCategoryKey, tamilName } = parsed.data;
    const settings = await getStoreSettings();
    const custom = { ...(settings.categoryTranslations || {}) };

    const oldKey = categoryKey.trim().toUpperCase();

    if (action === 'add' || action === 'update') {
      const targetKey = (newCategoryKey ? newCategoryKey.trim().toUpperCase() : oldKey);
      const tamil = (tamilName || '').trim();

      // If renaming category in English:
      if (newCategoryKey && targetKey !== oldKey) {
        // Update all crackers in Firestore from old category to new category
        await renameCategoryInFirestore(oldKey, targetKey);
        delete custom[oldKey];
      }

      custom[targetKey] = tamil;

      await updateStoreSettings({ categoryTranslations: custom });

      revalidatePath('/crackers');
      revalidatePath('/admin/crackers');
      revalidatePath('/');

      return NextResponse.json({
        success: true,
        message: `Category ${targetKey} updated successfully`,
        customTranslations: custom,
      });
    } else if (action === 'delete') {
      delete custom[oldKey];
      await updateStoreSettings({ categoryTranslations: custom });
      return NextResponse.json({
        success: true,
        message: `Category translation ${oldKey} removed`,
        customTranslations: custom,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
