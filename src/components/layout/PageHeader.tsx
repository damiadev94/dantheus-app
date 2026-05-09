type Props = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, eyebrow, actions }: Props) {
  return (
    <div className="border-b border-border bg-background px-8 py-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
