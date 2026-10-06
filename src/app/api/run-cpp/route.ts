import { NextRequest } from 'next/server';
import { POST as runCodePOST } from '../run-code/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return runCodePOST(req);
}
