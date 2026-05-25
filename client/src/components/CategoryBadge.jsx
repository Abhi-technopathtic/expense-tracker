import { getCategoryMeta } from '../utils/categories';

const CategoryBadge = ({ category, size = 'sm' }) => {
  const meta = getCategoryMeta(category);

  return (
    <span
      className={`category-badge category-badge--${size}`}
      style={{ backgroundColor: `${meta.color}22`, color: meta.color, borderColor: `${meta.color}44` }}
    >
      <span>{meta.icon}</span>
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;
