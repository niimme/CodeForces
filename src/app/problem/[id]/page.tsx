import ProblemWorkspace from '@/components/workspace/ProblemWorkspace';
import { getAllProblems } from '@/lib/cfScraper';

export function generateStaticParams() {
  const all = getAllProblems();
  return all.map((p) => ({
    id: p.id,
  }));
}

interface ProblemPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { id } = await params;
  return <ProblemWorkspace problemId={id} />;
}
