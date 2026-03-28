import TransitionRedirect from "@/components/TransitionRedirect";

type TransitionPageProps = {
  searchParams: Promise<{
    to?: string | string[];
    delay?: string | string[];
  }>;
};

function getSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default async function TransitionPage({
  searchParams,
}: TransitionPageProps) {
  const params = await searchParams;

  return (
    <TransitionRedirect
      target={getSingleValue(params.to)}
      delay={getSingleValue(params.delay)}
    />
  );
}
