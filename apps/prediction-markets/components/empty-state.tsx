import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  message: string;
  /** Wrap the message in a Card for page-level empty states. */
  card?: boolean;
}

export function EmptyState({ message, card }: EmptyStateProps) {
  if (card) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {message}
        </CardContent>
      </Card>
    );
  }

  return (
    <p className="py-8 text-center text-sm text-muted-foreground">
      {message}
    </p>
  );
}
