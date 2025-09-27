interface LegalPageTemplateProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function LegalPageTemplate({ title, subtitle, children }: LegalPageTemplateProps) {
  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-0 md:px-4 xl:px-0">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-2xl md:text-4xl tracking-[0.2em] mb-6 md:mb-8 uppercase">{title}</h2>
        {subtitle && (
          <p className="text-white/60 text-sm uppercase tracking-[0.05em]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="border border-white/20 p-6 md:p-12">
        <div className="space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}
