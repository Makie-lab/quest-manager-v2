import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getQuests, getActivityHeatmap, ensureUser, getCharacterConfig } from '@/app/actions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ quests: [], heatmapData: [], characterConfig: {} });
    }

    await ensureUser();
    const quests = await getQuests();
    const heatmapData = await getActivityHeatmap();
    const characterConfig = await getCharacterConfig();

    return NextResponse.json({
      quests: quests.map(q => ({
        id: q.id,
        status: q.status,
        equipment: JSON.parse(q.equipment || '[]'),
      })),
      heatmapData,
      characterConfig: characterConfig || {},
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ quests: [], heatmapData: [], characterConfig: {} }, { status: 500 });
  }
}
