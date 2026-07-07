import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getQuests, getActivityHeatmap, ensureUser } from '@/app/actions';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ quests: [], heatmapData: [] });
    }

    await ensureUser();
    const quests = await getQuests();
    const heatmapData = await getActivityHeatmap();

    return NextResponse.json({
      quests: quests.map(q => ({
        id: q.id,
        status: q.status,
        equipment: JSON.parse(q.equipment || '[]'),
      })),
      heatmapData,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ quests: [], heatmapData: [] }, { status: 500 });
  }
}
