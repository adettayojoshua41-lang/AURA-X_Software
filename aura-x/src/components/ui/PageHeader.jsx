export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-800 dark:text-white">{title}</h1>
        {description && <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
