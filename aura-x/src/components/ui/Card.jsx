export default function Card({
  as: Tag = "div",
  className = "",
  children,
  ...props
}) {
  return (
    <Tag
      className={`aura-card rounded-3xl bg-white/70 dark:bg-nightcard/60 backdrop-blur border border-white/60 dark:border-white/10 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
